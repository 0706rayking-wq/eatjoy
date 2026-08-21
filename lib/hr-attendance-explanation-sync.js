const crypto = require('node:crypto');
const { planSchedule } = require('./hr-schedule-planner');

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function authorize(request) {
  const expected = String(process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '').trim();
  const actual = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return Boolean(expected) && safeEqual(actual, expected);
}

function normalizeRecords(value) {
  if (!Array.isArray(value)) throw new Error('normalRecords must be an array');
  if (value.length > 100) throw new Error('Too many normal records');
  return value.map((record) => {
    const employeeNumber = String(record?.employeeNumber || '').trim();
    const name = String(record?.name || '').trim();
    const date = String(record?.date || '').trim();
    const department = String(record?.department || '').trim();
    if (!employeeNumber || !name || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid normal record identity');
    }
    const clockEntries = Array.isArray(record?.clockEntries) ? record.clockEntries : [];
    if (clockEntries.length === 0 || clockEntries.length > 12) throw new Error(`Invalid punches for ${name}`);
    return {
      employeeNumber,
      name,
      date,
      department,
      scheduledShifts: (Array.isArray(record?.scheduledShifts) ? record.scheduledShifts : []).map((shift) => ({
        start: String(shift?.start || '').trim(),
        end: String(shift?.end || '').trim()
      })),
      clockEntries: clockEntries.map((entry) => {
        const time = String(entry?.time || '').trim();
        const type = String(entry?.type || '').trim();
        if (!/^\d{1,2}:\d{2}(?::\d{2})?$/.test(time) || !['上班', '下班'].includes(type)) {
          throw new Error(`Invalid punch for ${name}`);
        }
        return { time, type, explanation: time };
      })
    };
  });
}

async function previewSchedules(records) {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await login(page);
    await page.goto('https://cloud.nueip.com/dept_shift_schedule_work/schedule', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    await page.waitForSelector('select[name="ori_class"], select[name="shifts[0][c_sn]"]', { timeout: 20000 });
    const options = await page.evaluate(() => {
      const selects = [...document.querySelectorAll('select[name="ori_class"], select[name="shifts[0][c_sn]"]')];
      const select = selects.sort((left, right) => right.options.length - left.options.length)[0];
      return [...select.options].map((option) => ({
        value: String(option.value || '').trim(),
        label: String(option.textContent || '').trim()
      })).filter((option) => option.value && option.label);
    });
    return planSchedule(records, options);
  } finally {
    await browser.close();
  }
}

async function launchBrowser() {
  const chromiumModule = await import('@sparticuz/chromium');
  const puppeteerModule = await import('puppeteer-core');
  const chromium = chromiumModule.default || chromiumModule;
  const puppeteer = puppeteerModule.default || puppeteerModule;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });
}

async function login(page) {
  const companyCode = String(process.env.NUEIP_COMPANY_CODE || '').trim();
  const employeeId = String(process.env.NUEIP_EMPLOYEE_ID || '').trim();
  const password = String(process.env.NUEIP_PASSWORD || '').trim();
  if (!companyCode || !employeeId || !password) throw new Error('Missing NUEIP credentials');
  await page.setUserAgent(USER_AGENT);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8' });
  await page.goto('https://portal.nueip.com/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
  await page.waitForSelector('input[name="inputCompany"]', { timeout: 15000 });
  await page.type('input[name="inputCompany"]', companyCode);
  await page.type('input[name="inputID"]', employeeId);
  await page.type('input[name="inputPassword"]', password);
  await page.click('button.login-button');
  await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 20000 });
}

async function syncRecords(records) {
  const browser = await launchBrowser();
  const results = [];
  try {
    const page = await browser.newPage();
    await login(page);
    const companyValue = String(process.env.NUEIP_COMPANY_VALUE || '15451').trim();
    for (const record of records) {
      try {
        const allDepartment = `${companyValue}_0`;
        const query = new URLSearchParams({
          work_status: '1',
          FLayer: companyValue,
          SLayer: allDepartment,
          TLayer: `${allDepartment}_0`,
          date_start: record.date,
          date_end: record.date,
          showByBelongDate: '1',
          filterModify: '0'
        });
        await page.goto(`https://cloud.nueip.com/attendance_record?${query}`, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        await page.waitForSelector('table tbody tr', { timeout: 20000 });
        const opened = await page.evaluate(({ employeeNumber, date }) => {
          const rows = [...document.querySelectorAll('table tbody tr')];
          const row = rows.find((candidate) => {
            const number = candidate.querySelector('[data-th="員工編號"]')?.textContent?.trim();
            const rowDate = candidate.querySelector('[data-th="日期"]')?.textContent || '';
            return number === employeeNumber && rowDate.includes(date);
          });
          const button = row?.querySelector('[data-th="修改"] #modify, [data-th="修改"] .fa-pen');
          if (!button) return false;
          button.click();
          return true;
        }, record);
        if (!opened) throw new Error('找不到修改按鈕');
        await page.waitForFunction(({ employeeNumber, date }) => {
          const dialogs = [...document.querySelectorAll('[role="dialog"]')];
          const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
          const text = dialog?.textContent || '';
          return text.includes(employeeNumber) && text.includes(date) && dialog.querySelector('input[name^="remark["]');
        }, { timeout: 15000 }, record);

        const formState = await page.evaluate((expected) => {
          const dialogs = [...document.querySelectorAll('[role="dialog"]')];
          const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
          const rows = [...dialog.querySelectorAll('tr')].map((row) => {
            const remark = row.querySelector('input[name^="remark["]');
            if (!remark) return null;
            const time = (row.textContent || '').match(/\b\d{1,2}:\d{2}:\d{2}\b/)?.[0] || '';
            const checked = row.querySelector('input[type="radio"]:checked');
            const type = checked?.value === '1' ? '上班' : checked?.value === '2' ? '下班' : '';
            return { time, type, remark };
          }).filter(Boolean);
          const expectedKeys = expected.clockEntries.map((entry) => `${entry.time}|${entry.type}`).sort();
          const actualKeys = rows.map((entry) => `${entry.time}|${entry.type}`).sort();
          if (JSON.stringify(expectedKeys) !== JSON.stringify(actualKeys)) {
            return { ok: false, reason: '打卡明細與比對結果不一致', actualKeys };
          }
          let changed = 0;
          for (const row of rows) {
            if (row.remark.value !== row.time) {
              row.remark.value = row.time;
              row.remark.dispatchEvent(new Event('input', { bubbles: true }));
              row.remark.dispatchEvent(new Event('change', { bubbles: true }));
              changed += 1;
            }
          }
          return { ok: true, changed, total: rows.length };
        }, record);
        if (!formState.ok) throw new Error(formState.reason);
        if (formState.changed === 0) {
          await page.evaluate(() => {
            const dialogs = [...document.querySelectorAll('[role="dialog"]')];
            const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
            dialog?.querySelector('#close')?.click();
          });
          results.push({ ...record, status: 'unchanged', punchCount: formState.total });
          continue;
        }
        await page.evaluate(() => {
          const dialogs = [...document.querySelectorAll('[role="dialog"]')];
          const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
          dialog?.querySelector('#save')?.click();
        });
        await page.waitForFunction(() => {
          const dialogs = [...document.querySelectorAll('[role="dialog"]')];
          const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
          return !dialog || !/出勤紀錄\s*修改/.test(dialog.textContent || '');
        }, { timeout: 15000 });
        results.push({ ...record, status: 'updated', punchCount: formState.total });
      } catch (error) {
        results.push({
          employeeNumber: record.employeeNumber,
          name: record.name,
          date: record.date,
          status: 'error',
          message: String(error.message || error).slice(0, 180)
        });
      }
    }
    return results;
  } finally {
    await browser.close();
  }
}

async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  try {
    if (!authorize(request)) return response.status(401).json({ status: 'error', message: 'Unauthorized' });
    const mode = request.body?.mode === 'commit' ? 'commit' : 'preview';
    const records = normalizeRecords(request.body?.normalRecords || []);
    if (request.body?.action === 'preview_schedule') {
      const plans = await previewSchedules(records);
      return response.status(200).json({
        status: 'preview',
        ready: plans.filter((item) => item.status === 'ready').length,
        manual: plans.filter((item) => item.status === 'manual').length,
        plans
      });
    }
    if (mode === 'preview') {
      return response.status(200).json({ status: 'preview', count: records.length, records });
    }
    if (String(process.env.NUEIP_EXPLANATION_SYNC_ENABLED || 'true').toLowerCase() !== 'true') {
      return response.status(409).json({ status: 'disabled', message: 'NUEIP explanation sync is disabled' });
    }
    const results = await syncRecords(records);
    return response.status(200).json({
      status: 'ok',
      updated: results.filter((item) => item.status === 'updated').length,
      unchanged: results.filter((item) => item.status === 'unchanged').length,
      failed: results.filter((item) => item.status === 'error').length,
      results
    });
  } catch (error) {
    return response.status(400).json({ status: 'error', message: String(error.message || error).slice(0, 300) });
  }
}

module.exports = handler;
module.exports._test = { normalizeRecords };

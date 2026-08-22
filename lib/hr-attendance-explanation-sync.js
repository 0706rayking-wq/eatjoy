const crypto = require('node:crypto');
const { planSchedule } = require('./hr-schedule-planner');
const { launchBrowser } = require('./browserbase-browser');

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

function explanationDepartmentValues(record, companyValue, environment = process.env) {
  const allDepartment = `${companyValue}_0`;
  const department = String(record?.department || '').trim();
  if (department.includes('內場')) {
    const configured = String(environment.NUEIP_DEPARTMENT_VALUE || `${companyValue}_103016`).trim();
    return [...new Set([configured, allDepartment].filter(Boolean))];
  }
  if (/外場|洗滌|洗碗/.test(department)) {
    const configured = String(environment.NUEIP_FRONT_WASH_DEPARTMENT_VALUES || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    return [...new Set([...configured, allDepartment])];
  }
  return [allDepartment];
}

function attendanceRowSelectors() {
  return {
    number: '[data-th="員工編號"], td[data-th*="員工編號"]',
    date: '[data-th="日期"], td[data-th*="日期"]',
    modify: '[data-th="修改"] #modify, [data-th="修改"] .fa-pen, td[data-th*="修改"] #modify, td[data-th*="修改"] .fa-pen, td[data-th*="修改"] button, #modify'
  };
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

function scheduleDepartment(record) {
  const value = String(record?.department || '').trim();
  if (value.includes('外場')) return '南港三井Lalaport外場';
  if (value.includes('內場')) return '南港三井Lalaport內場';
  throw new Error(`無法判斷${record?.name || '員工'}的排班部門`);
}

function weekIndexForDate(value) {
  const [year, month, day] = String(value).split('-').map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  return Math.floor((firstWeekday + day - 1) / 7);
}

async function openDepartmentSchedule(page, record) {
  const department = scheduleDepartment(record);
  await page.goto('https://cloud.nueip.com/dept_shift_schedule_work', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });
  const opened = await page.evaluate(({ department, month }) => {
    const rows = [...document.querySelectorAll('tr')];
    const row = rows.find((candidate) => {
      const text = candidate.textContent || '';
      return text.includes(department) && text.includes(month);
    });
    const button = row?.querySelector('[data-th="排班"] .Scheduling');
    if (!button) return false;
    button.click();
    return true;
  }, { department, month: record.date.slice(0, 7).replace('-', '.') });
  if (!opened) throw new Error(`找不到${department}當月班表`);
  await page.waitForFunction((expected) => (document.body.textContent || '').includes(`部門：${expected}`), {
    timeout: 20000
  }, department);
  await page.waitForSelector('#shift-change-week', { timeout: 15000 });
  const weekly = await page.$eval('#shift-change-week', (button) => button.classList.contains('active'));
  if (!weekly) {
    await page.click('#shift-change-week');
    await page.waitForFunction(() => document.querySelector('#shift-change-week')?.classList.contains('active'), {
      timeout: 10000
    });
  }
  const weekIndex = weekIndexForDate(record.date);
  for (let index = 0; index < weekIndex; index += 1) {
    await page.waitForFunction(() => {
      const button = document.querySelector('button.change-nav[data-nav="next"]');
      return button && !button.disabled;
    }, { timeout: 10000 });
    await page.click('button.change-nav[data-nav="next"]');
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return department;
}

async function findScheduleUser(page, employeeNumber) {
  await page.evaluate(() => window.scrollTo(0, 0));
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const userSn = await page.evaluate((number) => {
      const row = [...document.querySelectorAll('tr.shift-tr')].find((candidate) => {
        const firstCell = candidate.querySelector('td');
        return (firstCell?.textContent || '').trim() === number;
      });
      return row?.getAttribute('data-usn') || '';
    }, employeeNumber);
    if (userSn) return userSn;
    await page.evaluate(() => window.scrollBy(0, Math.max(350, window.innerHeight * 0.7)));
    await new Promise((resolve) => setTimeout(resolve, 120));
  }
  throw new Error('班表找不到員工');
}

async function openMultiShiftDialog(page, record, userSn) {
  const weekday = new Date(`${record.date}T00:00:00+08:00`).getDay();
  const opened = await page.evaluate(({ userSn, weekday }) => {
    const row = document.querySelector(`tr.shift-tr[data-usn="${userSn}"]`);
    const cell = row?.querySelectorAll(':scope > td.shift-td')?.[weekday];
    const button = cell?.querySelector('.add-shift');
    if (!button) return false;
    button.click();
    return true;
  }, { userSn, weekday });
  if (!opened) throw new Error('找不到當日排班格');
  await page.waitForFunction(({ employeeNumber, date }) => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
    const text = dialog?.textContent || '';
    const startDate = dialog?.querySelector('input[name="start_date"]')?.value;
    return text.includes(employeeNumber) && startDate === date;
  }, { timeout: 15000 }, record);
  const selected = await page.evaluate(() => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
    const tab = [...dialog.querySelectorAll('a, button')].find((item) => item.textContent?.trim() === '排多班');
    if (!tab) return false;
    tab.click();
    return true;
  });
  if (!selected) throw new Error('找不到排多班功能');
  await page.waitForFunction(() => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
    return dialog?.querySelector('select[name="shifts[0][c_sn]"]');
  }, { timeout: 10000 });
  const options = await page.evaluate(() => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
    const select = dialog.querySelector('select[name="shifts[0][c_sn]"]');
    return [...select.options].map((option) => ({
      value: String(option.value || '').trim(),
      label: String(option.textContent || '').trim()
    })).filter((option) => option.value && option.label);
  });
  return { weekday, options };
}

async function applySchedulePlan(page, record, plan, userSn, weekday) {
  await page.evaluate(({ record, selectedShifts }) => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
    const employee = dialog?.querySelector('select.user-select option:checked')?.textContent || '';
    const startDate = dialog?.querySelector('input[name="start_date"]')?.value;
    const endDate = dialog?.querySelector('input[name="end_date"]')?.value;
    if (!dialog || !employee.includes(record.employeeNumber) || startDate !== record.date || endDate !== record.date) {
      throw new Error('排班視窗人員或日期不符');
    }
    for (let index = 0; index < 3; index += 1) {
      const type = dialog.querySelector(`input[name="shifts[${index}][c_type]"][value="1"]`);
      const select = dialog.querySelector(`select[name="shifts[${index}][c_sn]"]`);
      if (!select) throw new Error('排班欄位不足');
      if (index < selectedShifts.length) {
        type?.click();
        select.value = selectedShifts[index].value;
      } else {
        select.value = '';
      }
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
    dialog.querySelector('input[name="is_replace_mode"][value="1"]')?.click();
    const save = dialog.querySelector('button.save');
    if (!save) throw new Error('找不到排班儲存按鈕');
    save.click();
  }, { record, selectedShifts: plan.selectedShifts });
  await page.waitForFunction(() => {
    const dialogs = [...document.querySelectorAll('[role="dialog"]')];
    const dialog = dialogs.reverse().find((item) => getComputedStyle(item).display !== 'none');
    return !dialog || !(dialog.textContent || '').includes('排班作業');
  }, { timeout: 15000 });
  await new Promise((resolve) => setTimeout(resolve, 350));
  const labels = await page.evaluate(({ userSn, weekday }) => {
    const row = document.querySelector(`tr.shift-tr[data-usn="${userSn}"]`);
    const cell = row?.querySelectorAll(':scope > td.shift-td')?.[weekday];
    return [...new Set((cell?.textContent || '').match(/[早晚全]班\([^)]*\)/g) || [])];
  }, { userSn, weekday });
  const expected = plan.selectedShifts.map((shift) => shift.label);
  if (JSON.stringify(labels) !== JSON.stringify(expected)) throw new Error('儲存後班別驗證不一致');
  return labels;
}

async function syncSchedules(records) {
  const browser = await launchBrowser();
  const results = [];
  try {
    const page = await browser.newPage();
    await login(page);
    for (const record of records) {
      try {
        const department = await openDepartmentSchedule(page, record);
        const userSn = await findScheduleUser(page, record.employeeNumber);
        const { weekday, options } = await openMultiShiftDialog(page, record, userSn);
        const plan = planSchedule([record], options)[0];
        if (plan.status !== 'ready') throw new Error(plan.reason);
        const labels = await applySchedulePlan(page, record, plan, userSn, weekday);
        results.push({ ...record, department, status: 'updated', shifts: labels });
      } catch (error) {
        results.push({
          employeeNumber: record.employeeNumber,
          name: record.name,
          date: record.date,
          department: record.department,
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

async function login(page) {
  const companyCode = String(process.env.NUEIP_COMPANY_CODE || '').trim();
  const employeeId = String(process.env.NUEIP_EMPLOYEE_ID || '').trim();
  const password = String(process.env.NUEIP_PASSWORD || '').trim();
  if (!companyCode || !employeeId || !password) throw new Error('Missing NUEIP credentials');
  await page.setUserAgent(USER_AGENT);
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8' });
  await page.goto('https://portal.nueip.com/home', { waitUntil: 'domcontentloaded', timeout: 25000 });
  if (!page.url().includes('/login') && !(await page.$('input[name="inputCompany"]'))) return;
  if (!page.url().includes('/login')) {
    await page.goto('https://portal.nueip.com/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
  }
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
        const selectors = attendanceRowSelectors();
        const diagnostics = [];
        let foundDepartment = '';
        for (const selectedDepartment of explanationDepartmentValues(record, companyValue)) {
          const query = new URLSearchParams({
            work_status: '1',
            FLayer: companyValue,
            SLayer: selectedDepartment,
            TLayer: `${selectedDepartment}_0`,
            date_start: record.date,
            date_end: record.date,
            showByBelongDate: '1',
            filterModify: '0'
          });
          await page.goto(`https://cloud.nueip.com/attendance_record?${query}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
          });
          const waitForOption = async (value) => page.waitForFunction(
            (targetValue) => [...document.querySelectorAll('form select option')]
              .some((option) => option.value === targetValue),
            { timeout: 10000 },
            value
          );
          const selectValue = async (value) => page.evaluate((targetValue) => {
            const selects = [...document.querySelectorAll('form select')];
            const target = selects.find((select) => [...select.options]
              .some((option) => option.value === targetValue));
            if (!target) throw new Error(`找不到選項 ${targetValue}`);
            if (target.value === targetValue) return false;
            target.value = targetValue;
            target.dispatchEvent(new Event('input', { bubbles: true }));
            target.dispatchEvent(new Event('change', { bubbles: true }));
            return true;
          }, value);
          await waitForOption(companyValue);
          if (await selectValue(companyValue)) await new Promise((resolve) => setTimeout(resolve, 1500));
          await waitForOption(selectedDepartment);
          if (await selectValue(selectedDepartment)) await new Promise((resolve) => setTimeout(resolve, 1500));
          const employeeValue = `${selectedDepartment}_0`;
          await waitForOption(employeeValue);
          await selectValue(employeeValue);
          await new Promise((resolve) => setTimeout(resolve, 500));
          await page.evaluate(({ date }) => {
            const setValue = (element, value) => {
              if (!element) throw new Error(`找不到欄位 ${value}`);
              element.value = value;
              element.dispatchEvent(new Event('input', { bubbles: true }));
              element.dispatchEvent(new Event('change', { bubbles: true }));
            };
            setValue(document.querySelector('[name="date_start"]'), date);
            setValue(document.querySelector('[name="date_end"]'), date);
            const queryButton = [...document.querySelectorAll('button, input[type="submit"]')]
              .find((element) => (element.textContent || element.value || '').trim() === '查詢');
            if (!queryButton) throw new Error('找不到查詢按鈕');
            queryButton.click();
          }, { date: record.date });
          await page.waitForFunction(
            () => document.querySelectorAll('table tbody tr, [role="row"]').length >= 1,
            { timeout: 25000 }
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const located = await page.waitForFunction(({ employeeNumber, date, selectors }) => {
            const dateKey = String(date).replace(/\D/g, '');
            const rows = [...document.querySelectorAll('table tbody tr')];
            return rows.some((candidate) => {
              const numberText = candidate.querySelector(selectors.number)?.textContent || candidate.textContent || '';
              const rowDate = candidate.querySelector(selectors.date)?.textContent || '';
              const numberMatches = numberText.replace(/\s/g, '').includes(employeeNumber);
              const dateMatches = !rowDate || rowDate.replace(/\D/g, '').includes(dateKey);
              return numberMatches && dateMatches && Boolean(candidate.querySelector(selectors.modify));
            });
          }, { timeout: 18000 }, { ...record, selectors }).then(() => true).catch(() => false);
          const summary = await page.evaluate(({ employeeNumber, date, selectors }) => {
            const dateKey = String(date).replace(/\D/g, '');
            const rows = [...document.querySelectorAll('table tbody tr')];
            const row = rows.find((candidate) => {
              const numberText = candidate.querySelector(selectors.number)?.textContent || candidate.textContent || '';
              const rowDate = candidate.querySelector(selectors.date)?.textContent || '';
              return numberText.replace(/\s/g, '').includes(employeeNumber)
                && (!rowDate || rowDate.replace(/\D/g, '').includes(dateKey));
            });
            return {
              rowCount: rows.length,
              employeeFound: Boolean(row),
              modifyFound: Boolean(row?.querySelector(selectors.modify))
            };
          }, { ...record, selectors });
          diagnostics.push(`${selectedDepartment}:${summary.rowCount}/${summary.employeeFound ? '員工' : '無員工'}/${summary.modifyFound ? '可修改' : '無按鈕'}`);
          if (located && summary.modifyFound) {
            foundDepartment = selectedDepartment;
            break;
          }
        }
        if (!foundDepartment) throw new Error(`找不到出勤修改列（${diagnostics.join('；')}）`);
        const opened = await page.evaluate(({ employeeNumber, date }) => {
          const selectors = {
            number: '[data-th="員工編號"], td[data-th*="員工編號"]',
            date: '[data-th="日期"], td[data-th*="日期"]',
            modify: '[data-th="修改"] #modify, [data-th="修改"] .fa-pen, td[data-th*="修改"] #modify, td[data-th*="修改"] .fa-pen, td[data-th*="修改"] button, #modify'
          };
          const dateKey = String(date).replace(/\D/g, '');
          const rows = [...document.querySelectorAll('table tbody tr')];
          const row = rows.find((candidate) => {
            const numberText = candidate.querySelector(selectors.number)?.textContent || candidate.textContent || '';
            const rowDate = candidate.querySelector(selectors.date)?.textContent || '';
            return numberText.replace(/\s/g, '').includes(employeeNumber)
              && (!rowDate || rowDate.replace(/\D/g, '').includes(dateKey));
          });
          const button = row?.querySelector(selectors.modify);
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
    if (request.body?.action === 'sync_schedule') {
      if (String(process.env.NUEIP_SCHEDULE_SYNC_ENABLED || '').toLowerCase() !== 'true') {
        return response.status(409).json({ status: 'disabled', message: 'NUEIP schedule sync is disabled' });
      }
      if (records.length === 0) {
        return response.status(200).json({ status: 'ok', updated: 0, failed: 0, results: [] });
      }
      const results = await syncSchedules(records);
      return response.status(200).json({
        status: 'ok',
        updated: results.filter((item) => item.status === 'updated').length,
        failed: results.filter((item) => item.status === 'error').length,
        results
      });
    }
    if (mode === 'preview') {
      return response.status(200).json({ status: 'preview', count: records.length, records });
    }
    if (String(process.env.NUEIP_EXPLANATION_SYNC_ENABLED || 'true').toLowerCase() !== 'true') {
      return response.status(409).json({ status: 'disabled', message: 'NUEIP explanation sync is disabled' });
    }
    if (records.length === 0) {
      return response.status(200).json({ status: 'ok', updated: 0, unchanged: 0, failed: 0, results: [] });
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
module.exports._test = {
  attendanceRowSelectors,
  explanationDepartmentValues,
  normalizeRecords,
  scheduleDepartment,
  weekIndexForDate
};

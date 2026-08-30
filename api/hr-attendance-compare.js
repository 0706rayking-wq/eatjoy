const crypto = require('node:crypto');
const explanationSyncHandler = require('../lib/hr-attendance-explanation-sync');
const { launchBrowser } = require('../lib/browserbase-browser');

const NUEIP_HOST_SUFFIX = '.nueip.com';
const MAX_LINE_CHARS = 28;
const MAX_LINE_MESSAGE_CHARS = 4500;
const EARLY_SECONDS = 2 * 60;
const LATE_SECONDS = 15 * 60;
const NUEIP_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

function readRequiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function authorize(request) {
  const expected = String(
    process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || ''
  ).trim();
  if (!expected) throw new Error('Missing HR automation secret');
  const actual = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return safeEqual(actual, expected);
}

function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)));
}

function htmlText(value) {
  return decodeHtml(String(value || '')
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cellHtml(rowHtml, label) {
  const pattern = new RegExp(
    `<td\\b[^>]*data-th=["']${escapeRegExp(label)}["'][^>]*>([\\s\\S]*?)<\\/td>`,
    'i'
  );
  return rowHtml.match(pattern)?.[1] || '';
}

function minuteTime(value) {
  const match = String(value || '').match(/\b(\d{1,2}):(\d{2})(?::\d{2})?\b/);
  if (!match) return String(value || '').trim();
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function parsePunchTimes(cell) {
  const physical = [];
  const adjusted = [];
  const physicalRaw = [];
  const adjustedRaw = [];
  const spanPattern = /<span\b([^>]*)>(\d{1,2}:\d{2}:\d{2})<\/span>/gi;
  let match;

  while ((match = spanPattern.exec(String(cell || ''))) !== null) {
    const attributes = match[1];
    const rawTime = match[2];
    const time = minuteTime(rawTime);
    if (/color_yellow/i.test(attributes)) {
      adjusted.push(time);
      adjustedRaw.push(rawTime);
    } else {
      physical.push(time);
      physicalRaw.push(rawTime);
    }
  }

  // Older/simple NUEIP HTML and unit-test fixtures may omit colour classes.
  if (physical.length === 0 && adjusted.length === 0) {
    const rawTimes = String(cell || '').match(/\b\d{2}:\d{2}:\d{2}\b/g) || [];
    physicalRaw.push(...rawTimes);
    physical.push(...rawTimes.map(minuteTime));
  }

  const unique = (values) => [...new Set(values)];
  return {
    actual: unique(physical.length > 0 ? physical : adjusted),
    actualRaw: unique(physicalRaw.length > 0 ? physicalRaw : adjustedRaw),
    adjusted: unique(adjusted),
    adjustedRaw: unique(adjustedRaw)
  };
}

function parseAttendanceHtml(html) {
  const rows = [];
  // DataTables adds role/data-th attributes in the browser. NUEIP's server-side
  // HTML can omit them, so also support the original positional table cells.
  const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  let rowMatch;

  while ((rowMatch = rowPattern.exec(String(html || ''))) !== null) {
    const rowHtml = rowMatch[1];
    const positionalCells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)]
      .map((match) => match[1]);
    const readCell = (label, index) => cellHtml(rowHtml, label) || positionalCells[index] || '';
    const employeeNumber = htmlText(readCell('員工編號', 2));
    if (!employeeNumber) continue;

    const employeeCell = readCell('員工', 3);
    const nameMatch = employeeCell.match(/class=["'][^"']*user-popover[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const name = htmlText(nameMatch?.[1] || employeeCell).replace(/^.*?(?=[\p{Script=Han}]{2,})/u, '');
    const employeeContext = htmlText(employeeCell);
    const department = employeeContext.match(/(?:饗麻饗辣)?南港(?:三井)?Lalaport(?:內場|外場|行政|洗滌|洗碗)?|南港(?:行政|洗滌|洗碗)/)?.[0] || '';
    const dateCell = readCell('日期', 4);
    const date = dateCell.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
    const scheduleCell = readCell('表定時間', 5);
    const schedule = htmlText(scheduleCell);
    const scheduledRange = decodeHtml(scheduleCell.match(/data-original-title=["']([^"']*)["']/i)?.[1] || '');
    const clockInCell = readCell('上班', 6);
    const clockOutCell = readCell('下班', 7);
    const clockInPunches = parsePunchTimes(clockInCell);
    const clockOutPunches = parsePunchTimes(clockOutCell);
    const clockIns = clockInPunches.actual;
    const clockOuts = clockOutPunches.actual;
    const status = htmlText(readCell('出勤狀況', 9));

    rows.push({
      employeeNumber,
      name,
      department,
      date,
      schedule,
      scheduledRange,
      clockIns,
      clockOuts,
      rawClockIns: clockInPunches.actualRaw,
      rawClockOuts: clockOutPunches.actualRaw,
      adjustedClockIns: clockInPunches.adjusted,
      adjustedClockOuts: clockOutPunches.adjusted,
      status
    });
  }

  return rows;
}

function parseSelectOptions(html, selectName) {
  const selectPattern = new RegExp(
    `<select\\b[^>]*(?:name|id)=["']${escapeRegExp(selectName)}["'][^>]*>([\\s\\S]*?)<\\/select>`,
    'i'
  );
  const selectHtml = String(html || '').match(selectPattern)?.[1] || '';
  return [...selectHtml.matchAll(/<option\b[^>]*value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi)]
    .map((match) => ({ value: decodeHtml(match[1]).trim(), label: htmlText(match[2]) }))
    .filter((option) => option.value && option.label);
}

function parseAllOptions(html) {
  return [...String(html || '').matchAll(/<option\b[^>]*value=["']([^"']+)["'][^>]*>([\s\S]*?)<\/option>/gi)]
    .map((match) => ({ value: decodeHtml(match[1]).trim(), label: htmlText(match[2]) }))
    .filter((option) => option.value && option.label);
}

function uniqueAttendance(records) {
  const seen = new Set();
  return records.filter((record) => {
    const key = `${record.employeeNumber}|${record.date}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function departmentRole(value) {
  const text = String(value || '');
  if (/行政/.test(text)) return '行政';
  if (/洗滌|洗碗/.test(text)) return '洗滌';
  if (/外場/.test(text)) return '外場';
  if (/內場/.test(text)) return '內場';
  return '';
}

function scheduleDepartmentRoles(schedule) {
  const roles = new Set();
  for (const value of [
    ...(Array.isArray(schedule?.departments) ? schedule.departments : []),
    ...(Array.isArray(schedule?.employees) ? schedule.employees.map((employee) => employee?.department) : [])
  ]) {
    const role = departmentRole(value);
    if (role) roles.add(role);
  }
  if (roles.size === 0 && schedule?.sheet_type === '外場／洗滌') roles.add('外場');
  if (roles.size === 0 && schedule?.sheet_type === '行政／洗滌') {
    roles.add('行政');
    roles.add('洗滌');
  }
  return [...roles];
}

function chooseDepartmentOptions(schedule, options, defaultDepartment, environment = process.env) {
  const sheetType = String(schedule?.sheet_type || '');
  if (!['外場／洗滌', '行政／洗滌'].includes(sheetType)) {
    return options.filter((option) => option.value === defaultDepartment);
  }

  const configuredName = sheetType === '行政／洗滌'
    ? 'NUEIP_ADMIN_WASH_DEPARTMENT_VALUES'
    : 'NUEIP_FRONT_WASH_DEPARTMENT_VALUES';
  const configured = String(environment[configuredName] || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);
  if (configured.length > 0) {
    return [...new Set(configured)].map((value) => ({ value, label: value }));
  }

  const branchKeyword = String(environment.NUEIP_BRANCH_KEYWORD || '南港').trim();
  const branchOptions = branchKeyword
    ? options.filter((option) => option.label.includes(branchKeyword))
    : options;
  const roles = scheduleDepartmentRoles(schedule);
  const selected = [];
  for (const role of roles) {
    let matches = branchOptions.filter((option) => departmentRole(option.label) === role);
    if (role === '行政' && matches.length === 0) {
      matches = branchOptions.filter((option) => !/內場|外場|洗滌|洗碗/.test(option.label));
    }
    selected.push(...matches);
  }
  return [...new Map(selected.map((option) => [option.value, option])).values()];
}

function resolveDepartmentValues(schedule, html, defaultDepartment, environment = process.env) {
  if (!['外場／洗滌', '行政／洗滌'].includes(schedule?.sheet_type)) return [defaultDepartment];

  const companyPrefix = String(defaultDepartment || '').split('_')[0];
  const selectOptions = parseSelectOptions(html, 'SLayer');
  const options = selectOptions.length > 0
    ? selectOptions
    : parseAllOptions(html).filter((option) => {
      if (!companyPrefix) return false;
      return new RegExp(`^${escapeRegExp(companyPrefix)}_[0-9]+$`).test(option.value);
    });
  const selected = chooseDepartmentOptions(schedule, options, defaultDepartment, environment);

  if (selected.length === 0) {
    const available = options.slice(0, 12)
      .map((option) => `${option.label}=${option.value}`)
      .join(',');
    const target = schedule?.sheet_type === '行政／洗滌' ? '行政／洗滌' : '外場';
    throw new Error(`找不到NUEIP南港${target}部門；可用部門：${available || '無'}；請設定對應部門環境變數`);
  }
  return [...new Set(selected.map((option) => option.value))];
}

function splitSetCookie(headerValue) {
  if (!headerValue) return [];
  return String(headerValue).split(/,(?=\s*[^;,=\s]+=[^;,]*)/g);
}

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  store(response) {
    const values = typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : splitSetCookie(response.headers.get('set-cookie'));

    for (const value of values) {
      const pair = String(value).split(';', 1)[0];
      const separator = pair.indexOf('=');
      if (separator <= 0) continue;
      this.cookies.set(pair.slice(0, separator).trim(), pair.slice(separator + 1).trim());
    }
  }

  header() {
    return [...this.cookies.entries()].map(([name, value]) => `${name}=${value}`).join('; ');
  }
}

function assertNueipUrl(url) {
  const hostname = new URL(url).hostname;
  if (hostname !== 'nueip.com' && !hostname.endsWith(NUEIP_HOST_SUFFIX)) {
    throw new Error('NUEIP redirected to an unexpected host');
  }
}

async function fetchWithCookies(url, options, jar, redirectsLeft = 5) {
  assertNueipUrl(url);
  const headers = new Headers(options.headers || {});
  const cookie = jar.header();
  if (cookie) headers.set('Cookie', cookie);

  const response = await fetch(url, { ...options, headers, redirect: 'manual' });
  jar.store(response);

  if (response.status >= 300 && response.status < 400 && response.headers.get('location')) {
    if (redirectsLeft <= 0) throw new Error('Too many NUEIP redirects');
    const nextUrl = new URL(response.headers.get('location'), url).toString();
    const nextOptions = { ...options };
    if (response.status === 303 || ((response.status === 301 || response.status === 302) && options.method === 'POST')) {
      nextOptions.method = 'GET';
      delete nextOptions.body;
    }
    return fetchWithCookies(nextUrl, nextOptions, jar, redirectsLeft - 1);
  }

  return response;
}

async function loadNueipAttendanceBrowser(date, requestedDepartments = [], schedule = {}) {
  const companyCode = readRequiredEnv('NUEIP_COMPANY_CODE');
  const employeeId = readRequiredEnv('NUEIP_EMPLOYEE_ID');
  const password = readRequiredEnv('NUEIP_PASSWORD');
  const companyValue = String(process.env.NUEIP_COMPANY_VALUE || '15451').trim();
  const departmentValue = String(process.env.NUEIP_DEPARTMENT_VALUE || '15451_103016').trim();
  let departmentValues = requestedDepartments.length > 0
    ? [...new Set(requestedDepartments)]
    : (['外場／洗滌', '行政／洗滌'].includes(schedule?.sheet_type) ? [] : [departmentValue]);
  const browser = await launchBrowser();

  let stage = '開啟登入頁';
  let lastUrl = '';
  try {
    const page = await browser.newPage();
    await page.setUserAgent(NUEIP_USER_AGENT);
    await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8' });
    await page.goto('https://portal.nueip.com/login', { waitUntil: 'domcontentloaded', timeout: 25000 });
    lastUrl = page.url();
    stage = '填寫登入資料';
    await page.waitForSelector('input[name="inputCompany"]', { timeout: 15000 });
    await page.type('input[name="inputCompany"]', companyCode);
    await page.type('input[name="inputID"]', employeeId);
    await page.type('input[name="inputPassword"]', password);
    await page.click('button.login-button');
    stage = '等待登入完成';
    await page.waitForFunction(() => !location.pathname.startsWith('/login'), { timeout: 20000 });
    lastUrl = page.url();

    if (departmentValues.length === 0) {
      const discoveryQuery = new URLSearchParams({
        work_status: '1',
        FLayer: companyValue,
        SLayer: departmentValue,
        TLayer: `${departmentValue}_0`,
        date_start: date,
        date_end: date,
        showByBelongDate: '1',
        filterModify: '0'
      });
      stage = '讀取NUEIP部門選單';
      await page.goto(`https://cloud.nueip.com/attendance_record?${discoveryQuery.toString()}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      const availableDepartments = await page.evaluate(({ companyValue }) => {
        const pattern = new RegExp(`^${companyValue}_[0-9]+$`);
        return [...document.querySelectorAll('select option')]
          .map((option) => ({ value: String(option.value || '').trim(), label: String(option.textContent || '').trim() }))
          .filter((option) => pattern.test(option.value) && option.label);
      }, { companyValue });
      const selected = chooseDepartmentOptions(schedule, availableDepartments, departmentValue);
      departmentValues = [...new Set(selected.map((option) => option.value))];
      if (departmentValues.length === 0) {
        const available = availableDepartments.slice(0, 12)
          .map((option) => `${option.label}=${option.value}`)
          .join(',');
        const target = schedule?.sheet_type === '行政／洗滌' ? '行政／洗滌' : '外場';
        throw new Error(`找不到NUEIP南港${target}部門；可用部門：${available || '無'}`);
      }
    }

    const selectValue = async (value) => page.evaluate((targetValue) => {
      const setValue = (element, value) => {
        if (!element) throw new Error(`找不到選項 ${value}`);
        if (element.value === value) return false;
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      };
      const selects = [...document.querySelectorAll('form select')];
      const target = selects.find((select) => [...select.options].some((option) => option.value === targetValue));
      return setValue(target, targetValue);
    }, value);
    const waitForOption = async (value) => page.waitForFunction(
      (targetValue) => [...document.querySelectorAll('form select option')]
        .some((option) => option.value === targetValue),
      { timeout: 10000 },
      value
    );

    const combinedAttendance = [];
    for (const selectedDepartment of departmentValues) {
      const query = new URLSearchParams({
        work_status: '1',
        FLayer: companyValue,
        SLayer: selectedDepartment,
        TLayer: `${selectedDepartment}_0`,
        date_start: date,
        date_end: date,
        showByBelongDate: '1',
        filterModify: '0'
      });
      stage = `開啟部門出勤紀錄(${selectedDepartment})`;
      await page.goto(`https://cloud.nueip.com/attendance_record?${query.toString()}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      if (page.url().includes('portal.nueip.com/login')) {
        throw new Error('NUEIP cloud工作階段建立失敗');
      }
      lastUrl = page.url();

      stage = '設定公司';
      await waitForOption(companyValue);
      if (await selectValue(companyValue)) await new Promise((resolve) => setTimeout(resolve, 1500));
      stage = `等待部門選單(${selectedDepartment})`;
      await waitForOption(selectedDepartment);
      if (await selectValue(selectedDepartment)) await new Promise((resolve) => setTimeout(resolve, 1500));
      const employeeValue = `${selectedDepartment}_0`;
      stage = `等待全部員工選項(${selectedDepartment})`;
      await waitForOption(employeeValue);
      await selectValue(employeeValue);
      await new Promise((resolve) => setTimeout(resolve, 500));
      stage = `設定日期並查詢(${selectedDepartment})`;
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
      }, { date });
      stage = `等待部門出勤表格(${selectedDepartment})`;
      await page.waitForFunction(
        () => document.querySelectorAll('table tbody tr, [role="row"]').length >= 1,
        { timeout: 25000 }
      );
      let bestAttendance = [];
      for (let attempt = 0; attempt < 20; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const candidate = uniqueAttendance(parseAttendanceHtml(await page.content()));
        if (candidate.length > bestAttendance.length) bestAttendance = candidate;
        if (assessAttendanceSource(schedule, candidate).complete) break;
      }
      combinedAttendance.push(...bestAttendance);
    }
    if (combinedAttendance.length === 0) throw new Error('NUEIP瀏覽器讀取為0筆');
    return uniqueAttendance(combinedAttendance);
  } catch (error) {
    const safeLocation = lastUrl ? new URL(lastUrl).pathname : '';
    throw new Error(`NUEIP瀏覽器${stage}失敗[${safeLocation}]：${error.message}`);
  } finally {
    await browser.close();
  }
}

async function loadNueipAttendance(date, schedule = {}) {
  const companyCode = readRequiredEnv('NUEIP_COMPANY_CODE');
  const employeeId = readRequiredEnv('NUEIP_EMPLOYEE_ID');
  const password = readRequiredEnv('NUEIP_PASSWORD');
  const companyValue = String(process.env.NUEIP_COMPANY_VALUE || '15451').trim();
  const departmentValue = String(process.env.NUEIP_DEPARTMENT_VALUE || '15451_103016').trim();
  const jar = new CookieJar();
  const loginBody = new URLSearchParams({
    inputCompany: companyCode,
    inputID: employeeId,
    inputPassword: password
  });

  // NUEIP issues the PHP session and CSRF cookies on the login-page request.
  // A direct credential POST without this priming request returns the login
  // page again even when the credentials are correct.
  await fetchWithCookies(
    'https://cloud.nueip.com/login',
    {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'User-Agent': NUEIP_USER_AGENT,
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
      }
    },
    jar
  );

  const loginResponse = await fetchWithCookies(
    'https://cloud.nueip.com/login/index/param',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'Origin': 'https://portal.nueip.com',
        'Referer': 'https://portal.nueip.com/login',
        'User-Agent': NUEIP_USER_AGENT,
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
      },
      body: loginBody.toString()
    },
    jar
  );

  const loginText = await loginResponse.text();
  if (!loginResponse.ok || /密碼錯誤|登入失敗|invalid|error/i.test(loginText)) {
    throw new Error('NUEIP login failed');
  }

  const enterResponse = await fetchWithCookies(
    'https://cloud.nueip.com/attendance_record',
    {
      method: 'POST',
      headers: {
        'Accept': 'text/html,application/xhtml+xml',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://portal.nueip.com',
        'Referer': 'https://portal.nueip.com/',
        'User-Agent': NUEIP_USER_AGENT,
        'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
      },
      body: new URLSearchParams({ jumpcorrection: 'true' }).toString()
    },
    jar
  );
  const enterHtml = await enterResponse.text();

  const fetchDepartment = async (selectedDepartment) => {
    const query = new URLSearchParams({
      work_status: '1',
      FLayer: companyValue,
      SLayer: selectedDepartment,
      TLayer: `${selectedDepartment}_0`,
      date_start: date,
      date_end: date,
      showByBelongDate: '1',
      filterModify: '0'
    });
    const attendanceResponse = await fetchWithCookies(
      `https://cloud.nueip.com/attendance_record?${query.toString()}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://cloud.nueip.com/attendance_record',
          'User-Agent': NUEIP_USER_AGENT,
          'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8'
        }
      },
      jar
    );
    const html = await attendanceResponse.text();
    if (!attendanceResponse.ok || !html.includes('出勤紀錄')) {
      throw new Error('Unable to read NUEIP attendance records');
    }
    return { html, attendance: parseAttendanceHtml(html) };
  };

  const defaultResult = await fetchDepartment(departmentValue);
  let departmentValues;
  try {
    departmentValues = resolveDepartmentValues(
      schedule,
      `${enterHtml}\n${defaultResult.html}`,
      departmentValue
    );
  } catch (error) {
    if (['外場／洗滌', '行政／洗滌'].includes(schedule?.sheet_type) && /找不到NUEIP南港/.test(error.message)) {
      const browserAttendance = uniqueAttendance(
        await loadNueipAttendanceBrowser(date, [], schedule)
      );
      const browserHealth = assessAttendanceSource(schedule, browserAttendance);
      if (!browserHealth.complete) {
        throw new Error(
          `NUEIP資料不完整：下班條${browserHealth.scheduleCount}人，`
          + `NUEIP${browserHealth.attendanceCount}筆，姓名配對${browserHealth.matchedCount}人`
        );
      }
      return browserAttendance;
    }
    throw error;
  }
  const combinedAttendance = [];
  for (const selectedDepartment of departmentValues) {
    const result = selectedDepartment === departmentValue
      ? defaultResult
      : await fetchDepartment(selectedDepartment);
    combinedAttendance.push(...result.attendance);
  }
  const primaryAttendance = uniqueAttendance(combinedAttendance);
  const primaryHealth = assessAttendanceSource(schedule, primaryAttendance);
  if (primaryHealth.complete) return primaryAttendance;

  // NUEIP sometimes returns a syntactically valid page containing only one or
  // a few employee rows. Treat that as an incomplete source, not as evidence
  // that every other employee is missing from NUEIP.
  const browserAttendance = uniqueAttendance(
    await loadNueipAttendanceBrowser(date, departmentValues, schedule)
  );
  const browserHealth = assessAttendanceSource(schedule, browserAttendance);
  if (!browserHealth.complete) {
    throw new Error(
      `NUEIP資料不完整：下班條${browserHealth.scheduleCount}人，`
      + `NUEIP${browserHealth.attendanceCount}筆，姓名配對${browserHealth.matchedCount}人`
    );
  }
  return browserAttendance;
}

function normalizeName(value) {
  return String(value || '')
    .replace(/[^\p{Script=Han}A-Za-z0-9]/gu, '')
    .replace(/瀞/g, '靜')
    .replace(/濛/g, '濠')
    .replace(/淩/g, '凌');
}

function isSilentLineName(value, silentNames) {
  const candidate = normalizeName(value);
  if (!candidate) return false;
  return silentNames.some((silentName) => {
    const silent = normalizeName(silentName);
    return Boolean(silent) && (
      candidate === silent || candidate.endsWith(silent) || silent.endsWith(candidate)
    );
  });
}

function attendanceCandidateScore(employee, record) {
  const shifts = Array.isArray(employee?.shifts) ? employee.shifts : [];
  if (shifts.length === 0) return null;
  const effectivePunches = effectivePunchPairs(record, shifts);
  if (effectivePunches.clockIns.length !== shifts.length || effectivePunches.clockOuts.length !== shifts.length) return null;
  const starts = shifts.map((shift) => timeToSeconds(shift?.start));
  const ends = shifts.map((shift) => timeToSeconds(shift?.end));
  const actualStarts = effectivePunches.clockIns.map(timeToSeconds);
  const actualEnds = effectivePunches.clockOuts.map(timeToSeconds);
  if ([...starts, ...ends, ...actualStarts, ...actualEnds].some((value) => value === null)) return null;
  for (let index = 0; index < ends.length; index += 1) {
    const difference = actualEnds[index] - ends[index];
    if (difference <= -EARLY_SECONDS || difference >= LATE_SECONDS) return null;
  }
  return starts.reduce((total, start, index) => total + Math.abs(actualStarts[index] - start), 0)
    + ends.reduce((total, end, index) => total + Math.abs(actualEnds[index] - end), 0);
}

function matchAttendance(employee, attendance) {
  const target = normalizeName(employee?.name);
  if (!target) return { record: null, ambiguous: false };
  const exactAll = attendance.filter((record) => normalizeName(record.name) === target);
  const targetDepartment = departmentRole(employee?.department);
  const exactDepartment = targetDepartment
    ? exactAll.filter((record) => departmentRole(record.department) === targetDepartment)
    : [];
  const exact = exactDepartment.length > 0 ? exactDepartment : exactAll;
  if (exact.length === 1) return { record: exact[0], ambiguous: false };
  if (exact.length > 1) {
    const scored = exact
      .map((record) => ({ record, score: attendanceCandidateScore(employee, record) }))
      .filter((item) => item.score !== null)
      .sort((left, right) => left.score - right.score);
    if (scored.length === 1 || (scored.length > 1 && scored[0].score < scored[1].score)) {
      return { record: scored[0].record, ambiguous: false };
    }
    return { record: null, ambiguous: true };
  }
  const suffixAll = attendance.filter((record) => {
    const official = normalizeName(record.name);
    return official.endsWith(target) || target.endsWith(official);
  });
  const suffixDepartment = targetDepartment
    ? suffixAll.filter((record) => departmentRole(record.department) === targetDepartment)
    : [];
  const suffix = suffixDepartment.length > 0 ? suffixDepartment : suffixAll;
  return { record: suffix.length === 1 ? suffix[0] : null, ambiguous: suffix.length > 1 };
}

function assessAttendanceSource(schedule, attendance) {
  const employees = (Array.isArray(schedule?.employees) ? schedule.employees : [])
    .filter((employee) => normalizeName(employee?.name));
  const records = Array.isArray(attendance) ? attendance : [];
  const scheduleCount = employees.length;
  const attendanceCount = records.length;
  const matchedCount = employees.reduce((count, employee) => {
    const match = matchAttendance(employee, records);
    return count + (match.record && !match.ambiguous ? 1 : 0);
  }, 0);

  if (scheduleCount === 0) {
    return { complete: false, scheduleCount, attendanceCount, matchedCount };
  }

  const minimumAttendanceCount = Math.max(1, Math.ceil(scheduleCount * 0.5));
  const minimumMatchedCount = Math.max(1, Math.ceil(scheduleCount * 0.2));
  return {
    complete: attendanceCount >= minimumAttendanceCount && matchedCount >= minimumMatchedCount,
    scheduleCount,
    attendanceCount,
    matchedCount,
    minimumAttendanceCount,
    minimumMatchedCount
  };
}

function timeToSeconds(value) {
  const raw = String(value || '').trim();
  let hours;
  let minutes;
  let seconds = 0;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    [hours, minutes] = raw.split(':').map(Number);
  } else if (/^\d{3,4}$/.test(raw)) {
    hours = Number(raw.slice(0, -2));
    minutes = Number(raw.slice(-2));
  } else if (/^\d{1,2}$/.test(raw)) {
    hours = Number(raw);
    minutes = 0;
  } else {
    return null;
  }
  if (hours > 23 || minutes > 59 || seconds > 59) return null;
  return hours * 3600 + minutes * 60 + seconds;
}

function formatDuration(seconds) {
  const minutes = Math.abs(Math.round(seconds / 60));
  return `${minutes}分鐘`;
}

function alignClockOuts(expectedEnds, actualOuts) {
  const unused = actualOuts
    .map((value, index) => ({ value: minuteTime(value), index, seconds: timeToSeconds(value) }))
    .filter((entry) => entry.seconds !== null);
  const pairs = [];

  for (const expected of expectedEnds) {
    const expectedSeconds = timeToSeconds(expected);
    if (expectedSeconds === null || unused.length === 0) {
      pairs.push({ expected, actual: null, differenceSeconds: null });
      continue;
    }
    unused.sort((left, right) =>
      Math.abs(left.seconds - expectedSeconds) - Math.abs(right.seconds - expectedSeconds)
    );
    const selected = unused.shift();
    pairs.push({
      expected,
      actual: selected.value,
      differenceSeconds: selected.seconds - expectedSeconds
    });
  }

  return { pairs, extraClockOuts: unused.map((entry) => entry.value) };
}

function effectivePunchPairs(record, shifts) {
  const clockIns = Array.isArray(record?.clockIns) ? record.clockIns.map(minuteTime) : [];
  const clockOuts = Array.isArray(record?.clockOuts) ? record.clockOuts.map(minuteTime) : [];
  if (!Array.isArray(shifts) || shifts.length !== 3) return { clockIns, clockOuts };

  // NUEIP can render a six-punch day with one middle punch under the opposite
  // column. For a confirmed three-shift paper schedule, rebuild the three
  // pairs from all six chronological punches instead of trusting the columns.
  const punches = [...new Set([...clockIns, ...clockOuts])]
    .map((time) => ({ time, seconds: timeToSeconds(time) }))
    .filter((entry) => entry.seconds !== null)
    .sort((left, right) => left.seconds - right.seconds);
  if (punches.length !== shifts.length * 2) return { clockIns, clockOuts };

  return {
    clockIns: punches.filter((_, index) => index % 2 === 0).map((entry) => entry.time),
    clockOuts: punches.filter((_, index) => index % 2 === 1).map((entry) => entry.time)
  };
}

function effectiveClockEntries(record, shifts) {
  const rawClockIns = record.rawClockIns?.length ? record.rawClockIns : record.clockIns;
  const rawClockOuts = record.rawClockOuts?.length ? record.rawClockOuts : record.clockOuts;
  const defaultEntries = [
    ...rawClockIns.map((time) => ({ time, type: '上班' })),
    ...rawClockOuts.map((time) => ({ time, type: '下班' }))
  ].sort((left, right) => {
    const leftSeconds = timeToSeconds(left.time);
    const rightSeconds = timeToSeconds(right.time);
    return (leftSeconds ?? Number.MAX_SAFE_INTEGER) - (rightSeconds ?? Number.MAX_SAFE_INTEGER);
  });
  if (!Array.isArray(shifts) || shifts.length !== 3 || defaultEntries.length !== 6) return defaultEntries;
  return defaultEntries.map((entry, index) => ({
    time: entry.time,
    type: index % 2 === 0 ? '上班' : '下班'
  }));
}

function departmentExplanationRecords(schedule, attendance, date) {
  return (Array.isArray(attendance) ? attendance : []).flatMap((record) => {
    const rawClockIns = record?.rawClockIns?.length ? record.rawClockIns : (record?.clockIns || []);
    const rawClockOuts = record?.rawClockOuts?.length ? record.rawClockOuts : (record?.clockOuts || []);
    const punchCount = rawClockIns.length + rawClockOuts.length;
    if (punchCount === 0) return [];

    const recordName = normalizeName(record?.name);
    const paperEmployee = (Array.isArray(schedule?.employees) ? schedule.employees : [])
      .find((employee) => {
        const paperName = normalizeName(employee?.name);
        return Boolean(paperName) && (
          paperName === recordName || paperName.endsWith(recordName) || recordName.endsWith(paperName)
        );
      });
    const syntheticShifts = punchCount === 6 ? [{}, {}, {}] : [];
    const clockEntries = effectiveClockEntries(record, syntheticShifts);
    if (clockEntries.length === 0) return [];

    return [{
      employeeNumber: record.employeeNumber,
      name: record.name,
      date: record.date || date,
      department: paperEmployee?.department || record.department || schedule?.sheet_type || '',
      scheduledShifts: [],
      clockEntries
    }];
  });
}

function compareAttendance(schedule, attendance, excludedNames = ['黃遠志']) {
  const excluded = new Set(excludedNames.map(normalizeName));
  const usableAttendance = attendance.filter((record) => !excluded.has(normalizeName(record.name)));
  const issues = [];
  const matchedRecords = new Set();
  let normalCount = 0;
  let offMatchedCount = 0;
  const offMatchedNames = [];
  const normalRecords = [];

  for (const employee of Array.isArray(schedule.employees) ? schedule.employees : []) {
    const employeeIssueStart = issues.length;
    const { record, ambiguous } = matchAttendance(employee, usableAttendance);
    if (ambiguous) {
      issues.push({ type: 'name_ambiguous', name: employee.name || '姓名不清', detail: '姓名符合多位員工' });
      continue;
    }
    if (!record) {
      issues.push({ type: 'missing_nueip', name: employee.name || '姓名不清', detail: 'NUEIP找不到人員' });
      continue;
    }
    matchedRecords.add(record.employeeNumber);

    const shifts = Array.isArray(employee.shifts) ? employee.shifts : [];
    const expectedEnds = shifts.map((shift) => shift && shift.end).filter(Boolean);
    const isOff = expectedEnds.length === 0;
    const isRestDay = /休息日|例假日|休假/.test(record.schedule);
    const hasPunches = record.clockIns.length > 0 || record.clockOuts.length > 0;
    const hasNoScheduledShift = !String(record.schedule || '').trim();

    if (isOff) {
      if ((isRestDay || hasNoScheduledShift) && !hasPunches) {
        offMatchedCount += 1;
        offMatchedNames.push(record.name);
      } else {
        issues.push({
          type: 'off_conflict',
          name: record.name,
          detail: record.status.includes('曠職') ? '下班條改休，NUEIP曠職' : '下班條休假，NUEIP不一致',
          schedule: record.schedule,
          status: record.status
        });
      }
      continue;
    }

    if (isRestDay && record.clockOuts.length > 0) {
      issues.push({
        type: 'rest_day_work',
        name: record.name,
        detail: 'NUEIP休息日但有打卡'
      });
    }

    const effectivePunches = effectivePunchPairs(record, shifts);
    const alignment = alignClockOuts(expectedEnds, effectivePunches.clockOuts);
    if (employee.late_marked === true && !/遲到/.test(record.status)) {
      issues.push({
        type: 'paper_late',
        name: record.name,
        detail: '下班條紅筆註記：遲到'
      });
    }
    if (employee.needs_review) {
      issues.push({
        type: 'schedule_review',
        name: record.name,
        detail: '下班條時間不清，請主管確認'
      });
    }
    let timeIssue = Boolean(employee.needs_review);
    for (const pair of alignment.pairs) {
      if (pair.actual === null) {
        issues.push({
          type: 'missing_clock_out',
          name: record.name,
          expected: pair.expected,
          detail: '缺少下班打卡'
        });
        timeIssue = true;
      } else if (pair.differenceSeconds <= -EARLY_SECONDS) {
        issues.push({
          type: 'early',
          name: record.name,
          expected: pair.expected,
          actual: pair.actual,
          seconds: Math.abs(pair.differenceSeconds),
          detail: `早退${formatDuration(pair.differenceSeconds)}`
        });
        timeIssue = true;
      } else if (pair.differenceSeconds >= LATE_SECONDS) {
        issues.push({
          type: 'late',
          name: record.name,
          expected: pair.expected,
          actual: pair.actual,
          seconds: pair.differenceSeconds,
          detail: `晚打卡${formatDuration(pair.differenceSeconds)}`
        });
        timeIssue = true;
      }
    }

    const extraClockOuts = employee.needs_review ? [] : alignment.extraClockOuts;
    if (extraClockOuts.length > 0 || /遲到|早退|缺卡|曠職|打卡異常/.test(record.status)) {
      issues.push({
        type: 'nueip_status',
        name: record.name,
        detail: record.status ? `NUEIP標記：${record.status}` : 'NUEIP有額外打卡',
        extraClockOuts
      });
    }

    if (!timeIssue && !isRestDay && issues.length === employeeIssueStart) {
      normalCount += 1;
      const clockEntries = effectiveClockEntries(record, shifts);
      normalRecords.push({
        employeeNumber: record.employeeNumber,
        name: record.name,
        date: record.date || schedule.date || '',
        department: employee.department || record.department || schedule.sheet_type || '',
        scheduledShifts: shifts.map((shift) => ({ start: minuteTime(shift.start), end: minuteTime(shift.end) })),
        clockEntries
      });
    }
  }

  for (const record of usableAttendance) {
    if (matchedRecords.has(record.employeeNumber)) continue;
    if (record.clockIns.length === 0 && record.clockOuts.length === 0) continue;
    issues.push({
      type: 'nueip_only',
      name: record.name,
      detail: 'NUEIP有打卡，下班條未列'
    });
  }

  return { issues, normalCount, offMatchedCount, offMatchedNames, normalRecords };
}

function wrapLine(line, limit = MAX_LINE_CHARS) {
  const characters = Array.from(String(line || ''));
  const result = [];
  for (let index = 0; index < characters.length; index += limit) {
    result.push(characters.slice(index, index + limit).join(''));
  }
  return result.length ? result : [''];
}

function formatLineMessages(date, comparison, schedule = {}, silentNames = []) {
  const displayDate = String(date).replace(/^\d{4}-/, '').replace('-', '/');
  const visibleIssues = comparison.issues.filter((issue) => !isSilentLineName(issue.name, silentNames));
  const silentNormalCount = (comparison.normalRecords || [])
    .filter((record) => isSilentLineName(record.name, silentNames)).length;
  const silentOffCount = (comparison.offMatchedNames || [])
    .filter((name) => isSilentLineName(name, silentNames)).length;
  const visibleNormalCount = Math.max(0, comparison.normalCount - silentNormalCount);
  const visibleOffMatchedCount = Math.max(0, comparison.offMatchedCount - silentOffCount);
  const sheetType = String(schedule.sheet_type || '').trim();
  const departmentLabel = sheetType === '外場／洗滌'
    ? '南港外場／洗滌'
    : sheetType === '行政／洗滌'
      ? '南港行政／洗滌'
    : sheetType === '內場'
      ? '南港內場'
      : '南港內場';
  const lines = [
    `【${displayDate} 下班條比對】`,
    `店別：${departmentLabel}`,
    `異常：${visibleIssues.length}項`,
    '────────'
  ];

  visibleIssues.forEach((issue, index) => {
    const labels = {
      early: '早退',
      late: '晚打卡',
      off_conflict: '排班衝突',
      rest_day_work: '休息日出勤',
      missing_clock_out: '缺下班卡',
      nueip_status: '打卡異常',
      nueip_only: '下班條漏列',
      missing_nueip: '名冊不符',
      name_ambiguous: '姓名不明',
      schedule_review: '班表待確認',
      paper_late: '遲到註記'
    };
    lines.push(`${index + 1}.${issue.name}｜${labels[issue.type] || '需確認'}`);
    if (issue.expected) lines.push(`下班條：${issue.expected}`);
    if (issue.actual) lines.push(`NUEIP：${issue.actual}`);
    lines.push(issue.detail);
    if (issue.extraClockOuts?.length) lines.push(`額外下班卡：${issue.extraClockOuts.join('、')}`);
  });

  lines.push('────────');
  lines.push(`下班正常：${visibleNormalCount}人`);
  lines.push(`休假相符：${visibleOffMatchedCount}人`);
  lines.push('請主管回覆：');
  lines.push('確認＋姓名＋處理方式');

  const wrappedLines = lines.flatMap((line) => wrapLine(line));
  const messages = [];
  let current = '';
  for (const line of wrappedLines) {
    const candidate = current ? `${current}\n${line}` : line;
    if (Array.from(candidate).length > MAX_LINE_MESSAGE_CHARS) {
      messages.push(current);
      current = line;
    } else {
      current = candidate;
    }
  }
  if (current) messages.push(current);
  return messages;
}

function normalizeDate(value, now = new Date()) {
  const raw = String(value || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})$/);
  if (!match) throw new Error('Invalid attendance date');
  const year = now.getFullYear();
  const month = String(Number(match[1])).padStart(2, '0');
  const day = String(Number(match[2])).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function handler(request, response) {
  if (['sync_explanations', 'preview_schedule', 'sync_schedule'].includes(request.body?.action)) {
    return explanationSyncHandler(request, response);
  }
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  try {
    if (!authorize(request)) {
      return response.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    if (request.body?.action === 'sync_department_explanations') {
      const schedule = request.body?.schedule && typeof request.body.schedule === 'object'
        ? request.body.schedule
        : {};
      const date = normalizeDate(schedule.date);
      const attendance = await loadNueipAttendance(date, schedule);
      const records = departmentExplanationRecords(schedule, attendance, date);
      const explanationSync = await explanationSyncHandler.syncExplanationRecords(
        records,
        request.body?.mode === 'preview' ? 'preview' : 'commit'
      );
      if (explanationSync.failed > 0) {
        return response.status(502).json({
          status: 'error',
          message: `NUEIP打卡說明有${explanationSync.failed}筆寫入失敗，已停止後續比對`,
          explanationSync
        });
      }
      return response.status(200).json({
        ...schedule,
        date,
        attendanceSnapshot: attendance,
        explanationSync: {
          status: explanationSync.status,
          updated: explanationSync.updated || 0,
          unchanged: explanationSync.unchanged || 0,
          failed: explanationSync.failed || 0
        }
      });
    }
    if (request.body?.action === 'prepare_schedule_records') {
      const normalRecords = Array.isArray(request.body?.normalRecords) ? request.body.normalRecords : [];
      return response.status(200).json({
        status: 'ok',
        results: normalRecords.map((record) => ({ ...record, status: 'unchanged' }))
      });
    }
    const schedule = request.body && typeof request.body === 'object' ? request.body : {};
    const date = normalizeDate(schedule.date);
    const attendance = Array.isArray(schedule.attendanceSnapshot)
      ? schedule.attendanceSnapshot
      : await loadNueipAttendance(date, schedule);
    const departmentRecords = departmentExplanationRecords(schedule, attendance, date);
    const explanationSync = await explanationSyncHandler.syncExplanationRecords(departmentRecords, 'commit');
    if (explanationSync.failed > 0) {
      return response.status(502).json({
        status: 'error',
        message: `NUEIP打卡說明有${explanationSync.failed}筆寫入失敗，已停止後續比對`,
        explanationSync
      });
    }
    const excludedNames = String(process.env.NUEIP_EXCLUDED_NAMES || '黃遠志')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    const silentLineNames = String(process.env.NUEIP_SILENT_LINE_NAMES || '羽婕,靜妍')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    const comparison = compareAttendance(schedule, attendance, excludedNames);
    const lineMessages = formatLineMessages(date, comparison, schedule, silentLineNames);
    const lineMessageObjects = lineMessages.map((text) => ({ type: 'text', text })).slice(0, 5);
    return response.status(200).json({
      status: 'ok',
      date,
      attendanceCount: attendance.length,
      explanationSync: {
        status: explanationSync.status,
        updated: explanationSync.updated || 0,
        unchanged: explanationSync.unchanged || 0,
        failed: explanationSync.failed || 0
      },
      ...comparison,
      lineMessages,
      lineMessageObjects
    });
  } catch (error) {
    console.error('HR attendance comparison failed', error.message);
    return response.status(500).json({
      status: 'error',
      message: String(error.message || 'Attendance comparison failed').slice(0, 300)
    });
  }
}

module.exports = handler;
module.exports._test = {
  assessAttendanceSource,
  alignClockOuts,
  compareAttendance,
  departmentExplanationRecords,
  formatLineMessages,
  normalizeDate,
  normalizeName,
  parseAllOptions,
  parseAttendanceHtml,
  parseSelectOptions,
  resolveDepartmentValues,
  timeToSeconds,
  uniqueAttendance,
  wrapLine
};

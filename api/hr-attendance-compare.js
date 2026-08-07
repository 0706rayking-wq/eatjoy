const crypto = require('node:crypto');

const NUEIP_HOST_SUFFIX = '.nueip.com';
const MAX_LINE_CHARS = 28;
const MAX_LINE_MESSAGE_CHARS = 4500;
const EARLY_SECONDS = 2 * 60;
const LATE_SECONDS = 13 * 60;

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
    const dateCell = readCell('日期', 4);
    const date = dateCell.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
    const scheduleCell = readCell('表定時間', 5);
    const schedule = htmlText(scheduleCell);
    const scheduledRange = decodeHtml(scheduleCell.match(/data-original-title=["']([^"']*)["']/i)?.[1] || '');
    const clockInCell = readCell('上班', 6);
    const clockOutCell = readCell('下班', 7);
    const clockIns = clockInCell.match(/\b\d{2}:\d{2}:\d{2}\b/g) || [];
    const clockOuts = clockOutCell.match(/\b\d{2}:\d{2}:\d{2}\b/g) || [];
    const status = htmlText(readCell('出勤狀況', 9));

    rows.push({
      employeeNumber,
      name,
      date,
      schedule,
      scheduledRange,
      clockIns,
      clockOuts,
      status
    });
  }

  return rows;
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

async function loadNueipAttendance(date) {
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
        'User-Agent': 'EatJoy-HR-Automation/1.0'
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
        'User-Agent': 'EatJoy-HR-Automation/1.0'
      },
      body: loginBody.toString()
    },
    jar
  );

  const loginText = await loginResponse.text();
  let loginShape = `status:${loginResponse.status};body:${loginText.length}`;
  try {
    const loginJson = JSON.parse(loginText);
    const safeEntries = Object.entries(loginJson)
      .filter(([key, value]) => !/token|password|secret/i.test(key) && ['string', 'number', 'boolean'].includes(typeof value))
      .slice(0, 6)
      .map(([key, value]) => `${key}:${String(value).slice(0, 40)}`);
    loginShape += `;json:${safeEntries.join('|')}`;
  } catch {}
  if (!loginResponse.ok || /密碼錯誤|登入失敗|invalid|error/i.test(loginText)) {
    throw new Error('NUEIP login failed');
  }

  const query = new URLSearchParams({
    work_status: '1',
    FLayer: companyValue,
    SLayer: departmentValue,
    TLayer: `${departmentValue}_0`,
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
        'User-Agent': 'EatJoy-HR-Automation/1.0'
      }
    },
    jar
  );
  const html = await attendanceResponse.text();
  if (!attendanceResponse.ok || !html.includes('出勤紀錄')) {
    throw new Error('Unable to read NUEIP attendance records');
  }
  const attendance = parseAttendanceHtml(html);
  if (attendance.length === 0) {
    const metrics = [
      `html=${html.length}`,
      `tr=${(html.match(/<tr\b/gi) || []).length}`,
      `td=${(html.match(/<td\b/gi) || []).length}`,
      `employeeLabel=${(html.match(/員工編號/g) || []).length}`,
      `knownEmployee=${html.includes('403003') ? 1 : 0}`,
      `loginForm=${/inputCompany|inputPassword/.test(html) ? 1 : 0}`,
      `login=${loginShape}`,
      `activeCookies=${[...jar.cookies.entries()].filter(([, value]) => value !== 'deleted').map(([key]) => key).join('|')}`
    ].join(',');
    throw new Error(`NUEIP出勤表讀取為0筆[${metrics}]`);
  }
  return attendance;
}

function normalizeName(value) {
  return String(value || '').replace(/[^\p{Script=Han}A-Za-z0-9]/gu, '');
}

function matchAttendance(name, attendance) {
  const target = normalizeName(name);
  if (!target) return { record: null, ambiguous: false };
  const exact = attendance.filter((record) => normalizeName(record.name) === target);
  if (exact.length === 1) return { record: exact[0], ambiguous: false };
  const suffix = attendance.filter((record) => {
    const official = normalizeName(record.name);
    return official.endsWith(target) || target.endsWith(official);
  });
  return { record: suffix.length === 1 ? suffix[0] : null, ambiguous: suffix.length > 1 };
}

function timeToSeconds(value) {
  const raw = String(value || '').trim();
  let hours;
  let minutes;
  let seconds = 0;
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    [hours, minutes, seconds = 0] = raw.split(':').map(Number);
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
  const absolute = Math.abs(Math.round(seconds));
  const minutes = Math.floor(absolute / 60);
  const remainder = absolute % 60;
  return remainder ? `${minutes}分${remainder}秒` : `${minutes}分鐘`;
}

function alignClockOuts(expectedEnds, actualOuts) {
  const unused = actualOuts
    .map((value, index) => ({ value, index, seconds: timeToSeconds(value) }))
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

function compareAttendance(schedule, attendance, excludedNames = ['黃遠志']) {
  const excluded = new Set(excludedNames.map(normalizeName));
  const usableAttendance = attendance.filter((record) => !excluded.has(normalizeName(record.name)));
  const issues = [];
  const matchedRecords = new Set();
  let normalCount = 0;
  let offMatchedCount = 0;

  for (const employee of Array.isArray(schedule.employees) ? schedule.employees : []) {
    const { record, ambiguous } = matchAttendance(employee.name, usableAttendance);
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

    if (isOff) {
      if (isRestDay && record.clockIns.length === 0 && record.clockOuts.length === 0) {
        offMatchedCount += 1;
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

    const alignment = alignClockOuts(expectedEnds, record.clockOuts);
    let timeIssue = false;
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
      } else if (pair.differenceSeconds > LATE_SECONDS) {
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

    if (alignment.extraClockOuts.length > 0 || /遲到|早退|缺卡|曠職|打卡異常/.test(record.status)) {
      issues.push({
        type: 'nueip_status',
        name: record.name,
        detail: record.status ? `NUEIP標記：${record.status}` : 'NUEIP有額外打卡',
        extraClockOuts: alignment.extraClockOuts
      });
    }

    if (!timeIssue && !isRestDay) normalCount += 1;
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

  return { issues, normalCount, offMatchedCount };
}

function wrapLine(line, limit = MAX_LINE_CHARS) {
  const characters = Array.from(String(line || ''));
  const result = [];
  for (let index = 0; index < characters.length; index += limit) {
    result.push(characters.slice(index, index + limit).join(''));
  }
  return result.length ? result : [''];
}

function formatLineMessages(date, comparison) {
  const displayDate = String(date).replace(/^\d{4}-/, '').replace('-', '/');
  const lines = [
    `【${displayDate} 下班條比對】`,
    '店別：南港內場',
    `異常：${comparison.issues.length}項`,
    '────────'
  ];

  comparison.issues.forEach((issue, index) => {
    const labels = {
      early: '早退',
      late: '晚打卡',
      off_conflict: '排班衝突',
      rest_day_work: '休息日出勤',
      missing_clock_out: '缺下班卡',
      nueip_status: '打卡異常',
      nueip_only: '下班條漏列',
      missing_nueip: '名冊不符',
      name_ambiguous: '姓名不明'
    };
    lines.push(`${index + 1}.${issue.name}｜${labels[issue.type] || '需確認'}`);
    if (issue.expected) lines.push(`下班條：${issue.expected}`);
    if (issue.actual) lines.push(`NUEIP：${issue.actual}`);
    lines.push(issue.detail);
    if (issue.extraClockOuts?.length) lines.push(`額外下班卡：${issue.extraClockOuts.join('、')}`);
  });

  lines.push('────────');
  lines.push(`下班正常：${comparison.normalCount}人`);
  lines.push(`休假相符：${comparison.offMatchedCount}人`);
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
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  try {
    if (!authorize(request)) {
      return response.status(401).json({ status: 'error', message: 'Unauthorized' });
    }
    const schedule = request.body && typeof request.body === 'object' ? request.body : {};
    const date = normalizeDate(schedule.date);
    const attendance = await loadNueipAttendance(date);
    const excludedNames = String(process.env.NUEIP_EXCLUDED_NAMES || '黃遠志')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
    const comparison = compareAttendance(schedule, attendance, excludedNames);
    const lineMessages = formatLineMessages(date, comparison);
    return response.status(200).json({
      status: 'ok',
      date,
      attendanceCount: attendance.length,
      ...comparison,
      lineMessages
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
  alignClockOuts,
  compareAttendance,
  formatLineMessages,
  normalizeDate,
  normalizeName,
  parseAttendanceHtml,
  timeToSeconds,
  wrapLine
};

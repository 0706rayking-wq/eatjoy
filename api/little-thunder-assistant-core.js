'use strict';

// N8N_CORE_START
const TAIPEI_OFFSET = '+08:00';

function pad2(value) {
  return String(value).padStart(2, '0');
}

function isoDate(year, month, day) {
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

function dateAtTaipei(iso) {
  return new Date(`${iso}T12:00:00${TAIPEI_OFFSET}`);
}

function dateParts(date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return { year: Number(values.year), month: Number(values.month), day: Number(values.day) };
}

function addMonths(iso, months) {
  const [year, month, day] = iso.split('-').map(Number);
  const target = new Date(Date.UTC(year, month - 1 + months, 1));
  const targetYear = target.getUTCFullYear();
  const targetMonth = target.getUTCMonth() + 1;
  const finalDay = Math.min(day, new Date(Date.UTC(targetYear, targetMonth, 0)).getUTCDate());
  return isoDate(targetYear, targetMonth, finalDay);
}

function addDays(iso, days) {
  const date = dateAtTaipei(iso);
  date.setUTCDate(date.getUTCDate() + days);
  const parts = dateParts(date);
  return isoDate(parts.year, parts.month, parts.day);
}

function normalizeText(value) {
  const digits = '０１２３４５６７８９';
  return String(value || '')
    .replace(/[０-９]/g, (char) => String(digits.indexOf(char)))
    .replace(/：/g, ':')
    .replace(/，/g, ',')
    .replace(/／/g, '/')
    .replace(/　/g, ' ')
    .trim();
}

function chineseNumber(value) {
  const text = String(value || '').trim();
  if (/^\d+$/.test(text)) return Number(text);
  const map = { 零: 0, 一: 1, 二: 2, 兩: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
  if (text === '十') return 10;
  if (text.includes('十')) {
    const [left, right] = text.split('十');
    return (left ? map[left] : 1) * 10 + (right ? map[right] : 0);
  }
  return map[text] ?? Number.NaN;
}

function parseDateToken(token, now, mode) {
  const values = String(token).split('/').map(Number);
  const today = dateParts(now);
  if (values.length === 3) return isoDate(values[0], values[1], values[2]);
  let year = today.year;
  const candidate = isoDate(year, values[0], values[1]);
  if (mode === 'recent' && dateAtTaipei(candidate).getTime() > now.getTime() + 7 * 86400000) year -= 1;
  return isoDate(year, values[0], values[1]);
}

function displayMd(iso) {
  const [, month, day] = iso.split('-').map(Number);
  return `${month}/${day}`;
}

function ensureState(state) {
  state.people ||= {};
  state.equipment ||= {};
  state.memos ||= [];
  state.sent ||= {};
  state.pendingDeletes ||= {};
  return state;
}

function statutoryLeaveDays(years) {
  if (years < 0.5) return 0;
  if (years < 1) return 3;
  if (years < 2) return 7;
  if (years < 3) return 10;
  if (years < 5) return 14;
  if (years < 10) return 15;
  return Math.min(30, 16 + Math.floor(years - 10));
}

function parseAssistantCommand(rawText, state, now = new Date()) {
  ensureState(state);
  const text = normalizeText(rawText);
  if (!text.includes('小雷神')) return null;
  const command = text.replace(/^.*?小雷神[,:，\s]*/, '').trim();
  let match;

  match = command.match(/(?:幫我)?新增\s*([^\d,。\s]{1,20}?)(?:的)?特休[,\s]*(\d{1,4}\/\d{1,2}(?:\/\d{1,2})?)\s*開始計算/);
  if (match) {
    const name = match[1];
    const startDate = parseDateToken(match[2], now, 'current');
    state.people[name] ||= {};
    state.people[name].leaveStartDate = startDate;
    return [`【小雷神｜特休已新增】`, `姓名：${name}`, `起算：${displayMd(startDate)}`, `滿半年：3日`, `滿一年：7日`, `將於生效前月25日提醒`].join('\n');
  }

  match = command.match(/(?:幫我)?新增\s*([^\d,。\s]{1,20}?)\s*(\d{1,2}\/\d{1,2})\s*生日/);
  if (match) {
    const name = match[1];
    const birthday = match[2].split('/').map(Number);
    state.people[name] ||= {};
    state.people[name].birthday = `${pad2(birthday[0])}-${pad2(birthday[1])}`;
    return [`【小雷神｜生日已新增】`, `姓名：${name}`, `生日：${birthday[0]}/${birthday[1]}`, `前一個月25日提醒`].join('\n');
  }

  match = command.match(/(?:幫我)?新增\s*([^\d,。\s]{1,20}?)\s*(\d{1,4}\/\d{1,2}(?:\/\d{1,2})?)\s*體檢完成/);
  if (match) {
    const name = match[1];
    const completedDate = parseDateToken(match[2], now, 'recent');
    state.people[name] ||= {};
    state.people[name].medicalCompletedDate = completedDate;
    const reminder = addMonths(completedDate, 11).slice(0, 8) + '25';
    return [`【小雷神｜體檢已新增】`, `姓名：${name}`, `完成：${displayMd(completedDate)}`, `提醒：${displayMd(reminder)}`].join('\n');
  }

  if (command.includes('保養完成')) {
    const cycleMatch = command.match(/每\s*(\d+|[一二兩三四五六七八九十]+)\s*個月/);
    const stripped = command.replace(/每\s*(\d+|[一二兩三四五六七八九十]+)\s*個月(?:保養)?(?:一次)?[,\s]*/g, '');
    match = stripped.match(/(?:幫我)?\s*(.+?)\s*(\d{1,4}\/\d{1,2}(?:\/\d{1,2})?)\s*保養完成/);
    if (match) {
      const equipmentName = match[1].trim();
      const completedDate = parseDateToken(match[2], now, 'recent');
      const priorCycle = state.equipment[equipmentName]?.cycleMonths;
      const cycleMonths = cycleMatch ? chineseNumber(cycleMatch[1]) : (priorCycle || (equipmentName === '製冰機' ? 3 : 0));
      if (!Number.isFinite(cycleMonths) || cycleMonths < 1) {
        return [`【小雷神｜需要保養週期】`, `設備：${equipmentName}`, `請補充每幾個月保養`, `例：每3個月保養一次`].join('\n');
      }
      state.equipment[equipmentName] = { completedDate, cycleMonths };
      const dueDate = addMonths(completedDate, cycleMonths);
      const reminderDate = addMonths(completedDate, Math.max(0, cycleMonths - 1)).slice(0, 8) + '25';
      return [`【小雷神｜保養已新增】`, `設備：${equipmentName}`, `週期：每${cycleMonths}個月`, `下次：${displayMd(dueDate)}`, `提醒：${displayMd(reminderDate)}`].join('\n');
    }
  }

  match = command.match(/^確認刪除\s*([^\s的,。]+)(?:的)?所有紀錄$/);
  if (match) {
    const name = match[1];
    const pending = state.pendingDeletes[name];
    const isValid = pending && now.getTime() - pending.requestedAt <= 10 * 60 * 1000;
    if (!isValid) {
      delete state.pendingDeletes[name];
      return [
        '【小雷神｜無法刪除】',
        `姓名：${name}`,
        '沒有有效的待確認要求',
        '請先重新提出刪除指令'
      ].join('\n');
    }
    const existed = Boolean(state.people[name]);
    delete state.people[name];
    const before = state.memos.length;
    state.memos = state.memos.filter((memo) => memo.personName !== name);
    delete state.pendingDeletes[name];
    return existed || before !== state.memos.length
      ? [`【小雷神｜刪除完成】`, `已刪除：${name}`, `特休、生日、體檢`, `及相關備忘紀錄`].join('\n')
      : [`【小雷神｜查無資料】`, `姓名：${name}`, `沒有可刪除的紀錄`].join('\n');
  }

  match = command.match(/^取消刪除\s*([^\s的,。]+)(?:的)?所有紀錄$/);
  if (match) {
    const name = match[1];
    const existed = Boolean(state.pendingDeletes[name]);
    delete state.pendingDeletes[name];
    return existed
      ? [`【小雷神｜已取消刪除】`, `姓名：${name}`, `所有資料均已保留`].join('\n')
      : [`【小雷神｜沒有待確認刪除】`, `姓名：${name}`].join('\n');
  }

  match = command.match(/^(?:幫我)?刪除\s*([^\s的,。]+)(?:的)?所有紀錄$/);
  if (match) {
    const name = match[1];
    const hasPerson = Boolean(state.people[name]);
    const hasMemos = state.memos.some((memo) => memo.personName === name);
    if (!hasPerson && !hasMemos) {
      return [`【小雷神｜查無資料】`, `姓名：${name}`, `沒有可刪除的紀錄`].join('\n');
    }
    state.pendingDeletes[name] = { requestedAt: now.getTime() };
    return [
      '【小雷神｜請再次確認】',
      `即將刪除：${name}`,
      '包含特休、生日、體檢',
      '及相關備忘紀錄',
      '確認請輸入：',
      `小雷神，確認刪除${name}的所有紀錄`,
      '10分鐘內未確認將自動失效',
      '取消請輸入：',
      `小雷神，取消刪除${name}的所有紀錄`
    ].join('\n');
  }

  match = command.match(/(下個月|這個月|本月|\d{1,2}月)\s*(\d{1,2})[號日]\s*(?:要)?(.+?)[,。\s]*請提前\s*(\d+|[一二兩三四五六七八九十]+)\s*天通知(?:我)?/);
  if (match) {
    const today = dateParts(now);
    let targetYear = today.year;
    let targetMonth;
    if (match[1] === '下個月') {
      targetMonth = today.month + 1;
      if (targetMonth === 13) { targetMonth = 1; targetYear += 1; }
    } else if (match[1] === '這個月' || match[1] === '本月') {
      targetMonth = today.month;
    } else {
      targetMonth = Number(match[1].replace('月', ''));
      if (targetMonth < today.month) targetYear += 1;
    }
    const eventDate = isoDate(targetYear, targetMonth, Number(match[2]));
    const advanceDays = chineseNumber(match[4]);
    const remindDate = addDays(eventDate, -advanceDays);
    const memo = { id: `${Date.now()}-${state.memos.length}`, eventDate, remindDate, text: match[3].trim(), sent: false };
    state.memos.push(memo);
    return [`【小雷神｜備忘已新增】`, `事項：${memo.text}`, `日期：${displayMd(eventDate)}`, `提醒：${displayMd(remindDate)} 09:00`, `僅提醒一次`].join('\n');
  }

  return [
    '我能幫你紀錄以下事情，',
    '並於每月25號通知下個月的待辦',
    '',
    '1.【特休提醒】',
    '根據勞基法，計算入職後',
    '勞工可享有的特休',
    '指令：新增姓名＋特休起算日',
    '',
    '2.【生日提醒】',
    '公司當月份壽星享有免費用餐福利，',
    '於前一個月25號提醒',
    '指令：新增姓名＋生日',
    '',
    '3.【體檢提醒】',
    '餐飲從業人員每年須體檢一次，',
    '繳交報告後第11個月25號提醒',
    '指令：新增姓名＋體檢完成日',
    '',
    '4.【保養提醒】',
    '依照各項設備的保養週期提醒',
    '指令：新增設備保養與週期',
    '',
    '5.【備忘錄】',
    '可指定通知日期，於早上9點提醒，',
    '且只提醒一次',
    '指令：新增指定日期備忘',
    '',
    '6.【刪除資料】',
    '成員離職後可透過文字訊息刪除，',
    '再次確認後才會執行',
    '指令：刪除姓名的所有紀錄'
  ].join('\n');
}

function leaveMilestoneLabel(years) {
  if (years === 0.5) return '滿半年';
  return `滿${years}年`;
}

function buildMonthlyReminder(state, now = new Date()) {
  ensureState(state);
  const today = dateParts(now);
  if (today.day !== 25) return null;
  const todayIso = isoDate(today.year, today.month, today.day);
  const sections = { leave: [], birthday: [], medical: [], maintenance: [] };

  for (const [name, person] of Object.entries(state.people)) {
    if (person.leaveStartDate) {
      const milestones = [0.5, ...Array.from({ length: 40 }, (_, index) => index + 1)];
      for (const years of milestones) {
        const effective = years === 0.5 ? addMonths(person.leaveStartDate, 6) : addMonths(person.leaveStartDate, years * 12);
        const [year, month] = effective.split('-').map(Number);
        const reminderMonthDate = new Date(Date.UTC(year, month - 2, 1));
        const reminder = isoDate(reminderMonthDate.getUTCFullYear(), reminderMonthDate.getUTCMonth() + 1, 25);
        const key = `leave:${name}:${effective}`;
        if (reminder === todayIso && !state.sent[key]) {
          sections.leave.push(`${name}｜${leaveMilestoneLabel(years)}${statutoryLeaveDays(years)}日\n${displayMd(effective)}起生效`);
          state.sent[key] = todayIso;
        }
      }
    }

    if (person.birthday) {
      const [birthMonth, birthDay] = person.birthday.split('-').map(Number);
      const nextMonth = today.month === 12 ? 1 : today.month + 1;
      const birthdayYear = today.month === 12 ? today.year + 1 : today.year;
      const key = `birthday:${name}:${birthdayYear}`;
      if (birthMonth === nextMonth && !state.sent[key]) {
        sections.birthday.push(`${name}｜${birthMonth}/${birthDay}`);
        state.sent[key] = todayIso;
      }
    }

    if (person.medicalCompletedDate) {
      const targetMonth = addMonths(person.medicalCompletedDate, 11);
      const reminder = targetMonth.slice(0, 8) + '25';
      const key = `medical:${name}:${person.medicalCompletedDate}`;
      if (reminder === todayIso && !state.sent[key]) {
        sections.medical.push(`${name}｜下月需體檢`);
        state.sent[key] = todayIso;
      }
    }
  }

  for (const [name, equipment] of Object.entries(state.equipment)) {
    const reminderMonth = addMonths(equipment.completedDate, Math.max(0, equipment.cycleMonths - 1));
    const reminder = reminderMonth.slice(0, 8) + '25';
    const due = addMonths(equipment.completedDate, equipment.cycleMonths);
    const key = `maintenance:${name}:${equipment.completedDate}`;
    if (reminder === todayIso && !state.sent[key]) {
      sections.maintenance.push(`${name}｜${displayMd(due)}前保養`);
      state.sent[key] = todayIso;
    }
  }

  const list = (items) => items.length ? items.join('\n') : '無';
  return [
    `【${pad2(today.month)}/25 小雷神月提醒】`,
    '【特休】', list(sections.leave),
    '【生日】', list(sections.birthday),
    '【體檢】', list(sections.medical),
    '【設備保養】', list(sections.maintenance)
  ].join('\n');
}

function buildDueMemos(state, now = new Date()) {
  ensureState(state);
  const today = dateParts(now);
  const todayIso = isoDate(today.year, today.month, today.day);
  const due = state.memos.filter((memo) => memo.remindDate === todayIso && !memo.sent);
  if (!due.length) return null;
  for (const memo of due) memo.sent = true;
  return [`【小雷神｜今日備忘】`, ...due.flatMap((memo) => [`事項：${memo.text}`, `日期：${displayMd(memo.eventDate)}`])].join('\n');
}
// N8N_CORE_END

module.exports = {
  addDays,
  addMonths,
  buildDueMemos,
  buildMonthlyReminder,
  ensureState,
  parseAssistantCommand,
  statutoryLeaveDays
};

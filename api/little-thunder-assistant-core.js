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
  for (const person of Object.values(state.people)) {
    if (person && typeof person === 'object') delete person.birthday;
  }
  for (const key of Object.keys(state.sent)) {
    if (key.startsWith('birthday:')) delete state.sent[key];
  }
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

function wrapMessageLine(value) {
  const chars = Array.from(value);
  const lines = [];
  for (let index = 0; index < chars.length; index += 28) {
    lines.push(chars.slice(index, index + 28).join(''));
  }
  return lines;
}

function completionReply(category, labels, failed = []) {
  const lines = [
    `【小雷神｜${category}新增完成】`,
    ...wrapMessageLine(`新增${labels.join('、')}已經完成，`),
    '還有什麼我能協助你的嗎？'
  ];
  if (failed.length) lines.push('', ...wrapMessageLine(`未新增：${failed.join('、')}`));
  return lines.join('\n');
}

function privacyDisabledReply() {
  return [
    '【小雷神｜功能已停用】',
    '生日與特休屬個人資料，',
    '目前不提供新增、查詢或提醒。',
    '請改由公司授權的人事系統處理。'
  ].join('\n');
}

function parseNameList(value) {
  return [...new Set(String(value || '')
    .split(/[\n、,，\s]+|及|和|與/)
    .map((name) => name.trim())
    .filter((name) => /^[^\d,，。]{1,20}$/.test(name)))];
}

function describePersonRecords(state, name) {
  const person = state.people[name];
  const labels = [];
  if (person?.medicalCompletedDate) labels.push('體檢');
  const memoCount = state.memos.filter((memo) => memo.personName === name).length;
  if (memoCount) labels.push(`備忘錄${memoCount}筆`);
  return labels.length ? labels.join('、') : '查無資料';
}

function buildBatchDeleteRequest(state, names, now) {
  if (names.length < 2) {
    return [
      '【小雷神｜批量刪除需要多人】',
      '請至少輸入兩位姓名',
      '每位姓名可各放一行'
    ].join('\n');
  }
  state.pendingBatchDelete = { names, requestedAt: now.getTime() };
  const confirmation = `小雷神，確認批量刪除${names.join('、')}`;
  return [
    '【小雷神｜批量刪除待確認】',
    '即將刪除：',
    ...names.map((name, index) => `${index + 1}.${name}｜${describePersonRecords(state, name)}`),
    '確認請完整輸入：',
    ...wrapMessageLine(confirmation),
    '10分鐘內未確認將自動失效',
    '取消請輸入：',
    '小雷神，取消批量刪除'
  ].join('\n');
}

function buildSingleDeleteRequest(state, name, now) {
  const hasPerson = Boolean(state.people[name]);
  const hasMemos = state.memos.some((memo) => memo.personName === name);
  if (!hasPerson && !hasMemos) {
    return [`【小雷神｜查無資料】`, `姓名：${name}`, `沒有可刪除的紀錄`].join('\n');
  }
  state.pendingDeletes[name] = { requestedAt: now.getTime() };
  return [
    '【小雷神｜請再次確認】',
    `即將刪除：${name}`,
    `資料：${describePersonRecords(state, name)}`,
    '確認請輸入：',
    `小雷神，確認刪除${name}的所有紀錄`,
    '10分鐘內未確認將自動失效',
    '取消請輸入：',
    `小雷神，取消刪除${name}的所有紀錄`
  ].join('\n');
}

function extractFlexibleDeleteNames(command) {
  let match = command.match(/^(?:請)?(?:幫我)?(?:刪除|刪掉|移除)\s*(.+)$/s);
  let body = match?.[1];
  if (!body) {
    match = command.match(/^(?:請)?(?:幫我)?(?:把)?\s*(.+?)\s*(?:刪除|刪掉|移除)$/s);
    body = match?.[1];
  }
  if (!body) return [];
  body = body
    .replace(/(?:的)?(?:所有|全部)?(?:資料|紀錄|記錄)\s*$/u, '')
    .replace(/^(?:以下)?(?:人員|員工)\s*/u, '')
    .trim();
  return parseNameList(body);
}

function parseMemoRequest(value, now) {
  const text = normalizeText(value)
    .trim()
    .replace(/^(?:請)?(?:幫我)?(?:提醒|通知)(?:我)?\s*/u, '')
    .trim();
  const dateTokenPattern = '(下個月\\s*\\d{1,2}[號日]|(?:這個月|本月)\\s*\\d{1,2}[號日]|\\d{1,4}\\/\\d{1,2}(?:\\/\\d{1,2})?|\\d{1,2}月\\d{1,2}[號日]|明天|後天)';

  const resolveDate = (token) => {
    const today = dateParts(now);
    if (token === '明天' || token === '後天') {
      return addDays(isoDate(today.year, today.month, today.day), token === '明天' ? 1 : 2);
    }
    let match = token.match(/^下個月\s*(\d{1,2})[號日]$/);
    if (match) {
      let year = today.year;
      let month = today.month + 1;
      if (month === 13) { month = 1; year += 1; }
      return isoDate(year, month, Number(match[1]));
    }
    match = token.match(/^(?:這個月|本月)\s*(\d{1,2})[號日]$/);
    if (match) return isoDate(today.year, today.month, Number(match[1]));
    match = token.match(/^(\d{1,2})月(\d{1,2})[號日]$/);
    if (match) {
      let year = today.year;
      const month = Number(match[1]);
      const day = Number(match[2]);
      if (dateAtTaipei(isoDate(year, month, day)).getTime() < now.getTime()) year += 1;
      return isoDate(year, month, day);
    }
    const parts = token.split('/').map(Number);
    if (parts.length === 3) return isoDate(parts[0], parts[1], parts[2]);
    let year = today.year;
    if (dateAtTaipei(isoDate(year, parts[0], parts[1])).getTime() < now.getTime()) year += 1;
    return isoDate(year, parts[0], parts[1]);
  };

  const advancePattern = new RegExp(`^${dateTokenPattern}\\s*(?:要)?(.+?)[,，。\\s]*(?:請)?提前\\s*(\\d+|[一二兩三四五六七八九十]+)\\s*(天|週|周)\\s*(?:提醒|通知)(?:我)?(.*)$`);
  let match = text.match(advancePattern);
  if (match) {
    const eventDate = resolveDate(match[1]);
    const amount = chineseNumber(match[3]);
    const advanceDays = amount * (match[4] === '天' ? 1 : 7);
    const trailing = match[5].trim().replace(/^要/, '');
    const subject = match[2].trim().replace(/[，,。]$/, '');
    return {
      eventDate,
      remindDate: addDays(eventDate, -advanceDays),
      text: trailing ? `${subject}；${trailing}` : subject
    };
  }

  const datedPattern = new RegExp(`^${dateTokenPattern}\\s*(?:要)?(.+)$`);
  match = text.match(datedPattern);
  if (!match) return null;
  const eventDate = resolveDate(match[1]);
  const subject = match[2]
    .replace(/^(?:提醒|通知)(?:我)?/, '')
    .replace(/[，,。]?請提醒我.*$/, '')
    .trim();
  if (!subject) return null;
  return { eventDate, remindDate: eventDate, text: subject };
}

function buildReminderList(state) {
  ensureState(state);
  const sections = { medical: [], maintenance: [], memos: [] };
  const people = Object.entries(state.people).sort(([left], [right]) => left.localeCompare(right, 'zh-Hant'));

  for (const [name, person] of people) {
    if (person.medicalCompletedDate) sections.medical.push(`${name}｜${displayMd(person.medicalCompletedDate)}完成`);
  }

  for (const [name, equipment] of Object.entries(state.equipment).sort(([left], [right]) => left.localeCompare(right, 'zh-Hant'))) {
    sections.maintenance.push(`${name}｜${displayMd(equipment.completedDate)}完成｜每${equipment.cycleMonths}個月`);
  }

  const pendingMemos = state.memos
    .filter((memo) => !memo.sent)
    .sort((left, right) => String(left.remindDate).localeCompare(String(right.remindDate)) || String(left.eventDate).localeCompare(String(right.eventDate)));
  for (const memo of pendingMemos) {
    sections.memos.push(`${displayMd(memo.remindDate)}提醒｜${memo.text}`);
  }

  const sectionLines = (title, items) => [
    `【${title}】`,
    ...(items.length
      ? items.flatMap((item, index) => wrapMessageLine(`${index + 1}.${item}`))
      : ['無'])
  ];

  return [
    '【小雷神｜目前提醒清單】',
    ...sectionLines('體檢', sections.medical),
    ...sectionLines('設備保養', sections.maintenance),
    ...sectionLines('備忘錄', sections.memos)
  ].join('\n');
}

function parseAssistantCommand(rawText, state, now = new Date()) {
  ensureState(state);
  const text = normalizeText(rawText);
  if (!text.includes('小雷神')) return null;
  const command = text.replace(/^.*?小雷神[,:，\s]*/, '').trim();
  let match;

  if (/生日|特休/.test(command)) return privacyDisabledReply();

  const reminderListIntent = /提醒清單|待提醒(?:的)?(?:任務|事項|紀錄|記錄)|(?:檢視|查看|顯示|列出).*(?:提醒|待辦)|(?:目前|現在).*(?:提醒|待辦)/.test(command);
  if (reminderListIntent) return buildReminderList(state);

  const batchMatch = command.match(/^(?:幫我)?新增以下(體檢|設備保養|保養|備忘錄|備忘)[\s:：]*(.+)$/s);
  if (batchMatch) {
    const category = batchMatch[1];
    const lines = batchMatch[2].split(/\n+/).map((line) => line.trim()).filter(Boolean);
    const added = [];
    const failed = [];

    if (category === '體檢') {
      for (const line of lines) {
        const entry = line.match(/^([^\d\s,，、。]{1,20})\s*(\d{1,4}\/\d{1,2}(?:\/\d{1,2})?)(?:\s*體檢完成)?$/);
        if (!entry) { failed.push(line); continue; }
        state.people[entry[1]] ||= {};
        state.people[entry[1]].medicalCompletedDate = parseDateToken(entry[2], now, 'recent');
        added.push(entry[1]);
      }
    } else if (category === '設備保養' || category === '保養') {
      for (const line of lines) {
        const entry = line.match(/^(.+?)\s*(\d{1,4}\/\d{1,2}(?:\/\d{1,2})?)(?:\s*保養完成)?(?:[,，\s]*每\s*(\d+|[一二兩三四五六七八九十]+)\s*個月(?:保養)?(?:一次)?)?$/);
        if (!entry) { failed.push(line); continue; }
        const equipmentName = entry[1].trim();
        const cycleMonths = entry[3]
          ? chineseNumber(entry[3])
          : (state.equipment[equipmentName]?.cycleMonths || (equipmentName === '製冰機' ? 3 : 0));
        if (!Number.isFinite(cycleMonths) || cycleMonths < 1) {
          failed.push(`${equipmentName}（缺保養週期）`);
          continue;
        }
        state.equipment[equipmentName] = {
          completedDate: parseDateToken(entry[2], now, 'recent'),
          cycleMonths
        };
        added.push(equipmentName);
      }
    } else {
      for (const line of lines) {
        const memo = parseMemoRequest(line, now);
        if (!memo) { failed.push(line); continue; }
        state.memos.push({
          id: `${Date.now()}-${state.memos.length}`,
          ...memo,
          sent: false
        });
        added.push(memo.text);
      }
    }

    if (added.length) return completionReply(category === '保養' ? '設備保養' : category, added, failed);
    return ['【小雷神｜沒有新增資料】', '請確認每行的姓名、日期與格式', ...failed].join('\n');
  }

  match = command.match(/(?:幫我)?新增\s*([^\d,。\s]{1,20}?)\s*(\d{1,4}\/\d{1,2}(?:\/\d{1,2})?)\s*體檢完成/);
  if (match) {
    const name = match[1];
    const completedDate = parseDateToken(match[2], now, 'recent');
    state.people[name] ||= {};
    state.people[name].medicalCompletedDate = completedDate;
    return completionReply('體檢', [name]);
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
      return completionReply('設備保養', [equipmentName]);
    }
  }

  match = command.match(/^取消(?:批量|批次)刪除$/);
  if (match) {
    const existed = Boolean(state.pendingBatchDelete);
    state.pendingBatchDelete = null;
    return existed
      ? ['【小雷神｜已取消批量刪除】', '待刪除名單已取消', '所有資料均已保留'].join('\n')
      : ['【小雷神｜沒有待確認的批量刪除】'].join('\n');
  }

  match = command.match(/^確認(?:批量|批次)刪除\s*(.+)$/s);
  if (match) {
    const pending = state.pendingBatchDelete;
    const names = parseNameList(match[1]);
    const isValid = pending && now.getTime() - pending.requestedAt <= 10 * 60 * 1000;
    if (!isValid) {
      state.pendingBatchDelete = null;
      return [
        '【小雷神｜無法批量刪除】',
        '沒有有效的待確認名單',
        '請重新提出批量刪除要求'
      ].join('\n');
    }
    if (names.join('、') !== pending.names.join('、')) {
      return [
        '【小雷神｜名單不一致】',
        '未刪除任何資料',
        '請完整複製原確認指令'
      ].join('\n');
    }
    const results = [];
    for (const name of pending.names) {
      const hadPerson = Boolean(state.people[name]);
      const before = state.memos.length;
      delete state.people[name];
      state.memos = state.memos.filter((memo) => memo.personName !== name);
      results.push(`${name}：${hadPerson || before !== state.memos.length ? '刪除完成' : '查無資料'}`);
    }
    state.pendingBatchDelete = null;
    return ['【小雷神｜批量刪除結果】', ...results].join('\n');
  }

  match = command.match(/^(?:幫我)?(?:批量|批次)刪除(?:以下)?(?:人員|資料|紀錄)?[\s:：]*(.+)$/s);
  if (match) {
    const names = parseNameList(match[1]);
    return buildBatchDeleteRequest(state, names, now);
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
      ? [`【小雷神｜刪除完成】`, `已刪除：${name}`, `人員與相關備忘紀錄`].join('\n')
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

  if (/(?:刪除|刪掉|移除)/.test(command)) {
    const names = extractFlexibleDeleteNames(command);
    if (names.length > 1) return buildBatchDeleteRequest(state, names, now);
    if (names.length === 1) return buildSingleDeleteRequest(state, names[0], now);
    return [
      '【小雷神｜無法辨識刪除名單】',
      '未刪除也未建立備忘錄',
      '請輸入姓名，例如：',
      '小雷神，刪除王小明的所有資料'
    ].join('\n');
  }

  match = command.match(/^(?:幫我)?刪除\s*([^\s的,。]+)(?:的)?所有紀錄$/);
  if (match) {
    const name = match[1];
    return buildSingleDeleteRequest(state, name, now);
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
    return completionReply('備忘錄', [memo.text]);
  }

  const flexibleMemo = parseMemoRequest(command, now);
  if (flexibleMemo) {
    state.memos.push({
      id: `${Date.now()}-${state.memos.length}`,
      ...flexibleMemo,
      sent: false
    });
    return completionReply('備忘錄', [flexibleMemo.text]);
  }

  const helpIntent = /可以做什麼|能做什麼|可用指令|功能|怎麼用|如何使用/.test(command);
  if (!helpIntent) {
    return [
      '【小雷神｜請補充提醒時間】',
      '這件事會先視為備忘錄，',
      '請補充日期及提前多久提醒',
      '例：8/26開月大會，',
      '提前一週提醒我統計名單'
    ].join('\n');
  }

  return [
    '我能幫你紀錄以下事情，',
    '並於每月25號通知下個月的待辦',
    '',
    '1.【體檢提醒】',
    '餐飲從業人員每年須體檢一次，',
    '繳交報告後第11個月25號提醒',
    '指令：新增姓名＋體檢完成日',
    '',
    '2.【保養提醒】',
    '依照各項設備的保養週期提醒',
    '指令：新增設備保養與週期',
    '',
    '3.【備忘錄】',
    '可指定通知日期，於早上9點提醒，',
    '且只提醒一次',
    '指令：新增指定日期備忘',
    '',
    '4.【刪除資料】',
    '成員離職後可透過文字訊息刪除，',
    '再次確認後才會執行',
    '指令：刪除姓名的所有紀錄',
    '批量：批量刪除以下人員＋姓名清單',
    '',
    '5.【檢視目前提醒清單】',
    '查看所有已紀錄且待提醒的任務',
    '指令：檢視目前提醒清單'
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
  const sections = { medical: [], maintenance: [] };

  for (const [name, person] of Object.entries(state.people)) {
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
  buildReminderList,
  ensureState,
  parseAssistantCommand,
  statutoryLeaveDays
};

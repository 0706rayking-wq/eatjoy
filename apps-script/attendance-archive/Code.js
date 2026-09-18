/* Google Apps Script V8. Secrets belong in Script Properties, never in this file. */
const HEADERS = ['訊息ID', '日期', '部門', '檔案ID', '照片連結', '月份連結', '部門連結', '到期日', '狀態', '比對狀態', '比對結果'];

function expiryDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
  const d = new Date(date + 'T00:00:00Z');
  if (!Number.isFinite(d.getTime()) || d.toISOString().slice(0, 10) !== date) throw new Error('Invalid date');
  const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 4, 0));
  return new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), Math.min(d.getUTCDate(), end.getUTCDate()))).toISOString().slice(0, 10);
}

function departments(schedule) {
  const text = [schedule.sheet_title, ...(schedule.departments || []), ...(schedule.employees || []).map(e => e.department)].join(' ');
  const found = ['內場', '外場', '行政', '洗滌'].filter(d => text.includes(d) || (d === '洗滌' && text.includes('洗碗')));
  if (found.length) return found;
  return schedule.sheet_type === '內場' ? ['內場'] : ['待確認'];
}

function folder(parent, name) {
  const found = parent.getFoldersByName(name);
  return found.hasNext() ? found.next() : parent.createFolder(name);
}

function setupArchive() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const p = PropertiesService.getScriptProperties();
    if (!p.getProperty('ARCHIVE_SECRET')) p.setProperty('ARCHIVE_SECRET', Utilities.getUuid() + Utilities.getUuid());
    let root;
    if (p.getProperty('ROOT_ID')) root = DriveApp.getFolderById(p.getProperty('ROOT_ID'));
    else {
      root = DriveApp.createFolder('下班條存檔');
      p.setProperty('ROOT_ID', root.getId());
    }
    root.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    if (!p.getProperty('INDEX_ID')) {
      const index = SpreadsheetApp.create('下班條存檔索引（管理用）');
      p.setProperty('INDEX_ID', index.getId());
    }
    const sheet = SpreadsheetApp.openById(p.getProperty('INDEX_ID')).getSheets()[0];
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    if (!ScriptApp.getProjectTriggers().some(t => t.getHandlerFunction() === 'cleanupExpired')) {
      ScriptApp.newTrigger('cleanupExpired').timeBased().everyDays(1).atHour(4).inTimezone('Asia/Taipei').create();
    }
    console.log(root.getUrl());
    console.log(JSON.stringify({storageLimitBytes: DriveApp.getStorageLimit(), storageUsedBytes: DriveApp.getStorageUsed()}));
    return root.getUrl();
  } finally { lock.releaseLock(); }
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const input = JSON.parse(e.postData.contents);
    const p = PropertiesService.getScriptProperties();
    const secret = p.getProperty('ARCHIVE_SECRET');
    if (!secret || input.secret !== secret) return jsonResponse({status: 'error', code: 'unauthorized'});
    return jsonResponse(input.action === 'comparison_result' ? recordComparison(input, p) : archivePhoto(input, p));
  } catch (error) {
    console.error(String(error));
    return jsonResponse({status: 'error', code: 'archive_failed'});
  }
}

function archivePhoto(input, p) {
  if (!/^\d{1,40}$/.test(String(input.messageId))) throw new Error('Invalid message ID');
  const schedule = input.schedule;
  if (!schedule || schedule.is_attendance_sheet !== true) throw new Error('Not an attendance sheet');
  const expires = expiryDate(schedule.date);
  const today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
  if (schedule.date > today) throw new Error('Future sheet date');
  if (expires <= today) return {status: 'expired', lineText: '下班條已超過三個月保存期限，未存檔。'};
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const root = DriveApp.getFolderById(p.getProperty('ROOT_ID'));
    const month = folder(folder(root, schedule.date.slice(0, 4)), schedule.date.slice(5, 7));
    const sheet = SpreadsheetApp.openById(p.getProperty('INDEX_ID')).getSheets()[0];
    const rows = sheet.getDataRange().getDisplayValues();
    const links = [];
    let blob;
    for (const department of departments(schedule)) {
      const target = folder(month, department);
      const existingRow = rows.findIndex((row, i) => i > 0 && row[0] === String(input.messageId) && row[2] === department);
      if (existingRow >= 0 && rows[existingRow][8] === '已到期') continue;
      const name = schedule.date + '_' + department + '_' + input.messageId + '.jpg';
      // Filename lookup also recovers a successful upload followed by an index-write failure.
      const matches = target.getFilesByName(name);
      let file = matches.hasNext() ? matches.next() : null;
      if (!file) {
        if (!blob) {
          const response = UrlFetchApp.fetch('https://api-data.line.me/v2/bot/message/' + input.messageId + '/content', {
            headers: {Authorization: 'Bearer ' + p.getProperty('LINE_CHANNEL_ACCESS_TOKEN')}, muteHttpExceptions: true
          });
          if (response.getResponseCode() !== 200) throw new Error('LINE content unavailable');
          blob = response.getBlob();
          if (!/^image\//.test(blob.getContentType())) throw new Error('Not an image');
        }
        file = target.createFile(blob.copyBlob().setName(name));
      }
      const prior = existingRow >= 0 ? rows[existingRow] : [];
      const record = [String(input.messageId), schedule.date, department, file.getId(), file.getUrl(), month.getUrl(), target.getUrl(), expires, '已存檔', prior[9] || '待比對', prior[10] || ''];
      const rowNumber = existingRow >= 0 ? existingRow + 1 : sheet.getLastRow() + 1;
      sheet.getRange(rowNumber, 1, 1, HEADERS.length).setNumberFormat('@').setValues([record]);
      links.push({department, folderUrl: target.getUrl(), photoUrl: file.getUrl()});
    }
    return {status: 'saved', monthUrl: month.getUrl(), links, expires,
      lineText: ['下班條存檔（保留三個月）', '當月相簿：' + month.getUrl(), ...links.flatMap(l => [l.department + '：' + l.folderUrl, '照片：' + l.photoUrl])].join('\n')};
  } finally { lock.releaseLock(); }
}

function cleanupExpired() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    const p = PropertiesService.getScriptProperties();
    const sheet = SpreadsheetApp.openById(p.getProperty('INDEX_ID')).getSheets()[0];
    const rows = sheet.getDataRange().getDisplayValues();
    const today = Utilities.formatDate(new Date(), 'Asia/Taipei', 'yyyy-MM-dd');
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row[8] !== '已存檔' || !/^\d{4}-\d{2}-\d{2}$/.test(row[7]) || row[7] > today) continue;
      const file = DriveApp.getFileById(row[3]);
      // Only trash files still inside this archive's year/month/department tree.
      let parents = file.getParents();
      let owned = false;
      while (parents.hasNext()) {
        let current = parents.next();
        for (let depth = 0; depth < 3; depth++) {
          const above = current.getParents();
          if (!above.hasNext()) break;
          current = above.next();
          if (current.getId() === p.getProperty('ROOT_ID')) { owned = true; break; }
        }
      }
      if (!file.isTrashed() && !owned) continue;
      if (!file.isTrashed()) file.setTrashed(true);
      sheet.getRange(i + 1, 9).setValue('已到期');
    }
  } finally { lock.releaseLock(); }
}

function recordComparison(input, p) {
  if (!/^\d{1,40}$/.test(String(input.messageId))) throw new Error('Invalid message ID');
  const lock = LockService.getScriptLock(); lock.waitLock(30000);
  try {
    const sheet = SpreadsheetApp.openById(p.getProperty('INDEX_ID')).getSheets()[0];
    const rows = sheet.getDataRange().getDisplayValues();
    let count = 0;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] !== String(input.messageId) || rows[i][8] !== '已存檔') continue;
      sheet.getRange(i + 1, 10, 1, 2).setNumberFormat('@').setValues([
        ['已比對', JSON.stringify(input.result || {}).slice(0, 45000)]
      ]);
      count++;
    }
    return {status: 'recorded', count};
  } finally { lock.releaseLock(); }
}

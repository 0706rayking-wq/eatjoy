'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({console});
vm.runInContext(fs.readFileSync(require.resolve('../apps-script/attendance-archive/Code.js'), 'utf8'), context);
for (const [date, expected] of [['2026-09-18','2026-12-18'], ['2026-11-30','2027-02-28'], ['2023-11-30','2024-02-29'], ['2026-01-31','2026-04-30']]) {
  assert.equal(context.expiryDate(date), expected);
}
assert.throws(() => context.expiryDate('2026-02-30'));
assert.deepEqual(Array.from(context.departments({sheet_title:'行政／洗滌 下班條'})), ['行政／洗滌']);
assert.deepEqual(Array.from(context.departments({sheet_title:'外場 下班條',sheet_type:'外場／洗滌'})), ['外場']);
assert.deepEqual(Array.from(context.departments({sheet_type:'未知'})), ['待確認']);
assert.equal(context.combineLineEntries([
  {sheetType:'行政／洗滌',lineMessages:['行政結果'],archiveText:'行政網址'},
  {sheetType:'外場／洗滌',lineMessages:['外場結果'],archiveText:'外場網址'}
]), '外場結果\n\n外場網址\n\n════════════\n\n行政結果\n\n行政網址');
assert.equal(context.hasCompleteLinePair([{sheetType:'外場／洗滌'}]), false);
assert.equal(context.hasCompleteLinePair([{sheetType:'行政／洗滌'},{sheetType:'外場／洗滌'}]), true);

const registry = new Map();
const iterator = items => { let index=0; return {hasNext:()=>index<items.length,next:()=>items[index++]}; };
let sequence=0, downloads=0, lockDepth=0;
function makeFolder(name, parent) {
  const id = 'id' + sequence++, folders=[], files=[];
  const value = {getId:()=>id,getUrl:()=>`https://drive.google.com/drive/folders/${id}`,getParents:()=>iterator(parent?[parent]:[]),
    getFoldersByName:n=>iterator(folders.filter(f=>f.name===n)),
    createFolder:n=>{const f=makeFolder(n,value);folders.push(f);return f;},
    getFilesByName:n=>iterator(files.filter(f=>f.name===n && !f.trashed)),
    createFile:blob=>{const fileId='file'+sequence++;const f={name:blob.name,trashed:false,getId:()=>fileId,getUrl:()=>`https://drive.google.com/file/d/${fileId}/view`,getParents:()=>iterator([value]),isTrashed:()=>f.trashed,setTrashed:t=>{f.trashed=t;}};files.push(f);registry.set(fileId,f);return f;},name};
  registry.set(id,value);return value;
}
const root=makeFolder('root');
const rows=[['headers']];
const sheet={getDataRange:()=>({getDisplayValues:()=>rows.map(r=>r.slice())}),getLastRow:()=>rows.length,
  getRange:(row,col)=>{const range={setNumberFormat:()=>range,setValues:values=>{rows[row-1] ||= [];values[0].forEach((v,i)=>{rows[row-1][col-1+i]=v;});},setValue:value=>{rows[row-1][col-1]=value;}};return range;}};
const props={getProperty:key=>({ROOT_ID:root.getId(),INDEX_ID:'index',LINE_CHANNEL_ACCESS_TOKEN:'test-token'})[key]};
context.PropertiesService={getScriptProperties:()=>props};
context.SpreadsheetApp={openById:()=>({getSheets:()=>[sheet]})};
context.DriveApp={getFolderById:id=>registry.get(id),getFileById:id=>registry.get(id)};
let today='2026-09-18';
context.Utilities={formatDate:()=>today};
context.LockService={getScriptLock:()=>({waitLock:()=>{assert.equal(lockDepth++,0);},releaseLock:()=>lockDepth--})};
context.UrlFetchApp={fetch:()=>{downloads++;return {getResponseCode:()=>200,getBlob:()=>({getContentType:()=>'image/jpeg',copyBlob:()=>({setName:name=>({name})})})};}};
const input={messageId:'12345678901234567890',schedule:{is_attendance_sheet:true,date:'2026-09-18',sheet_title:'行政／洗滌 下班條'}};
const first=context.archivePhoto(input,props);
assert.equal(first.links.length,1);
assert.equal(rows.length,2);
assert.equal(downloads,1);
assert.equal(context.recordComparison({messageId:input.messageId,result:{normalCount:4}},props).count,1);
assert.equal(rows[1][9],'已比對');
assert.equal(JSON.parse(rows[1][10]).normalCount,4);
context.archivePhoto(input,props);
assert.equal(rows.length,2);
assert.equal(rows[1][9],'已比對','retry must preserve comparison results');
assert.equal(downloads,1,'duplicate delivery must not download or create photos');
// Simulate upload succeeding but index write failing: filename recovery must reuse it.
rows.pop();
context.archivePhoto(input,props);
assert.equal(downloads,1);
today='2026-12-17';context.cleanupExpired();
assert.equal(rows[1][8],'已存檔');
today='2026-12-18';context.cleanupExpired();
assert.equal(rows[1][8],'已到期');
assert.equal(context.archivePhoto(input,props).status,'expired');
assert.equal(downloads,1,'expired delivery must not restore photos');
assert.equal(lockDepth,0);

const handler=require('../lib/hr-attendance-archive');
assert.equal(handler.normalizeArchiveDate('9/18',new Date('2026-09-18T12:00:00Z')),'2026-09-18');
assert.equal(handler.normalizeArchiveDate('115/9/18'),'2026-09-18');
assert.equal(handler.normalizeArchiveDate('2026/9/18'),'2026-09-18');
assert.throws(()=>handler.normalizeArchiveDate('2026-02-30'));
async function request(body, token) {
  const res={status(code){this.code=code;return this;},json(value){this.value=value;return this;}};
  await handler({method:'POST',headers:{authorization:'Bearer '+token},body},res);return res;
}
(async()=>{
  process.env.HR_AUTOMATION_SECRET='test-auth';
  assert.equal((await request(input,'wrong')).code,401);
  delete process.env.ATTENDANCE_ARCHIVE_URL;
  assert.equal((await request(input,'test-auth')).code,503);
  process.env.ATTENDANCE_ARCHIVE_URL='https://script.google.com/macros/s/test/exec';
  process.env.ATTENDANCE_ARCHIVE_SECRET='test-secret';
  global.fetch=async()=>({ok:true,json:async()=>({status:'saved',lineText:'saved'})});
  assert.equal((await request(input,'test-auth')).code,200);
  let forwarded;
  global.fetch=async(_url,options)=>{forwarded=JSON.parse(options.body);return {ok:true,json:async()=>({status:'send',lineText:'combined'})};};
  const aggregate={action:'aggregate_line',messageId:'123',groupId:'C12345678901234567890',date:'2026-09-18',sheetType:'外場／洗滌',lineMessages:['result'],archiveText:'url'};
  assert.equal((await request(aggregate,'test-auth')).value.status,'send');
  assert.equal(forwarded.action,'line_batch');
  assert.deepEqual(forwarded.lineMessages,['result']);
  global.fetch=async()=>({ok:true,json:async()=>({status:'error'})});
  assert.equal((await request(input,'test-auth')).code,502,'Apps Script errors must trigger n8n retries');
  console.log('attendance archive tests passed');
})().catch(error=>{console.error(error);process.exitCode=1;});

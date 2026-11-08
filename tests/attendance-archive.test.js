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
assert.equal(first.lineText, '照片：' + first.links[0].photoUrl);
assert.equal(first.lineText.includes('當月相簿'), false);
assert.equal(first.lineText.includes('drive/folders'), false);
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
  const savedEnv={...process.env},savedFetch=global.fetch;
  const E=require('../lib/hr-cloud-business-envelope'),groupId='C'+'1'.repeat(32);
  const auth={schema:1,source:{groupId,messageId:input.messageId,timestamp:Date.parse('2026-09-18T04:00:00Z')},
    sourceAdmissionReceiptHash:'a'.repeat(64),sourceParentExecutionId:'80001',
    pinsDigest:'b'.repeat(64),cutoverSnapshotDigest:'c'.repeat(64),compare:null};
  const photo={action:'legacy_hr_business_v1',sourceAuthorization:auth,businessPayload:{action:'archive_photo',...input}};
  const ack=(envelope,businessResult,status='completed')=>({schema:1,protocol:'hr-legacy-archive-gate-v1',status,
    action:envelope.businessPayload.action,sourceKey:E.sourceKey(envelope),
    sourceAdmissionReceiptHash:envelope.sourceAuthorization.sourceAdmissionReceiptHash,
    pinsDigest:envelope.sourceAuthorization.pinsDigest,cutoverSnapshotDigest:envelope.sourceAuthorization.cutoverSnapshotDigest,
    requestPayloadHash:E.requestPayloadHash(envelope),effectReceiptHash:'d'.repeat(64),businessResult});
  const response=value=>({ok:true,status:200,redirected:false,text:async()=>JSON.stringify(value)});
  let requests=0,forwarded;
  try {
    process.env.HR_AUTOMATION_SECRET='test-auth';delete process.env.ATTENDANCE_ARCHIVE_URL;
    global.fetch=async()=>{requests++;throw Error('No unexpected network');};
    assert.equal((await request(photo,'wrong')).code,401);
    assert.equal((await request(input,'test-auth')).code,409,'old naked archive input must be fenced');
    assert.equal(requests,0);
    assert.equal((await request(photo,'test-auth')).code,503,'valid envelope still needs configured archive');
    process.env.ATTENDANCE_ARCHIVE_URL='https://script.google.com/macros/s/test/exec';
    process.env.ATTENDANCE_ARCHIVE_SECRET='test-secret';
    global.fetch=async(_url,options)=>{requests++;forwarded=JSON.parse(options.body);assert.equal(options.redirect,'manual');return response(ack(photo,{status:'saved',lineText:'saved'}));};
    assert.equal((await request(photo,'test-auth')).code,200);
    assert.equal(forwarded.action,'legacy_hr_business_v1');assert.equal(forwarded.secret,'test-secret');
    assert.deepEqual(forwarded.businessPayload,photo.businessPayload);assert.equal('messageId' in forwarded,false);
    global.fetch=async()=>{requests++;return response({status:'saved',lineText:'old response'});};
    assert.equal((await request(photo,'test-auth')).code,502,'old unbound success must not release the helper');
    global.fetch=async()=>response(ack(photo,null,'held'));
    assert.equal((await request(photo,'test-auth')).code,409,'held source/effect cannot continue as a successful photo');
    const aggregate={action:'legacy_hr_business_v1',
      sourceAuthorization:{...auth,compare:{jobId:'hr-legacy-v1:'+'e'.repeat(64),payloadHash:'f'.repeat(64),resultHash:'1'.repeat(64)}},
      businessPayload:{action:'aggregate_line',messageId:input.messageId,groupId,date:'2026-09-18',sheetType:'front',lineMessages:['result'],archiveText:'url'}};
    global.fetch=async(_url,options)=>{forwarded=JSON.parse(options.body);return response(ack(aggregate,{status:'accepted',count:1,requestId:'synthetic-request-1',deliveryVerified:false}));};
    assert.equal((await request(aggregate,'test-auth')).value.status,'accepted');
    assert.equal(forwarded.action,'legacy_hr_business_v1');assert.deepEqual(forwarded.businessPayload.lineMessages,['result']);
    for(const invalid of [{status:'send',lineText:'old fallback'}, {status:'accepted',count:1,deliveryVerified:false},
      {status:'accepted',count:2,requestId:'synthetic-request-1',deliveryVerified:false},
      {status:'accepted',count:1,requestId:'synthetic-request-1',deliveryVerified:true},
      {status:'accepted',count:1,requestId:'synthetic-request-1',deliveryVerified:false,lineText:'must not resend'}]) {
      requests=0;global.fetch=async()=>{requests++;return response(ack(aggregate,invalid));};
      assert.equal((await request(aggregate,'test-auth')).code,502);
      assert.equal(requests,1,'invalid or unknown LINE receipt is never retried');
    }
    global.fetch=async()=>response(ack(aggregate,{status:'held'}));
    assert.equal((await request(aggregate,'test-auth')).code,200,'ordinary completed aggregate waiting stays compatible');
    requests=0;global.fetch=async()=>{requests++;return response({status:'error'});};
    assert.equal((await request(photo,'test-auth')).code,502);assert.equal(requests,1,'unknown GAS outcome must not be automatically retried');
    console.log('attendance archive tests passed: legacy pure/mock semantics plus authenticated strict source/effect envelope, bound ack and no retry');
  } finally {
    global.fetch=savedFetch;
    for(const key of ['HR_AUTOMATION_SECRET','ATTENDANCE_ARCHIVE_URL','ATTENDANCE_ARCHIVE_SECRET']){
      if(savedEnv[key]===undefined)delete process.env[key];else process.env[key]=savedEnv[key];
    }
  }
})().catch(error=>{console.error(error);process.exitCode=1;});

const fs = require('node:fs');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const start = html.indexOf('<button aria-label={`刪除分店 ${b}`}');
assert.ok(start > 0);
const body = html.slice(start).split('onClick={async ()=>{')[1].split('}} className=')[0];
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
const run = new AsyncFunction('window','b','globalBranches','db','getPublicPath','currentBranch','setCurrentBranch','triggerNotify',body);
(async()=>{
 for (const mode of ['cancel','confirm','failure']) {
  let writes=0,branch='甲店',messages=[];
  await run({confirm:message=>{assert.ok(message.includes('甲店'));return mode!=='cancel';}},'甲店',['甲店','乙店'],{doc:()=>({set:async data=>{writes++;assert.deepEqual(data.list,['乙店']);if(mode==='failure')throw Error('offline');}})},x=>x,branch,x=>branch=x,(...m)=>messages.push(m));
  assert.equal(writes,mode==='cancel'?0:1);
  assert.equal(branch,mode==='confirm'?'乙店':'甲店');
  assert.equal(messages.length,mode==='cancel'?0:1);
  if(mode==='failure')assert.equal(messages[0][1],'error');
 }
 console.log('Branch deletion: cancel, confirm, write failure passed');
})().catch(e=>{console.error(e);process.exitCode=1;});

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const helpers = source.slice(source.indexOf('const orderingActualQty ='), source.indexOf('const OrderingSystem ='));
const start = source.indexOf('const saveOrderToHistory = async');
const saveSource = source.slice(start, source.indexOf('const monthlyStats =', start));
let history = [{id:'original', date:'2026-10-11', receivedAt:1, items:[{name:'A',qty:10,receivedQty:10,unitPrice:2}]}];
const sandbox = vm.createContext({
 supplementId:'extra-one', orderDate:'2026-10-11', selectedBranch:'test',
 currentDb:{ history, ingredients:[{id:'a',name:'A',vendor:'V',unit:'kg',zone:'Z',unitPrice:2}] },
 orderQuantities:{a:3}, crypto:{randomUUID:()=> 'new-regular'},
 getPublicPath:x=>x, triggerNotify:()=>{},
 db:{doc:x=>x,runTransaction:async callback=>callback({
  get:async()=>({data:()=>({history})}),set:(ref,data)=>{history=data.history;}
 })}
});
vm.runInContext(helpers + saveSource + ';globalThis.api={saveOrderToHistory,orderingMonthlyCosts};',sandbox);
(async()=>{
 assert.equal(await sandbox.api.saveOrderToHistory(),true);
 assert.equal(history.length,2);
 assert.equal(history[0].receivedAt,1);
 assert.equal(history[1].kind,'supplement');
 assert.equal(await sandbox.api.saveOrderToHistory(),true);
 assert.equal(history.length,2,'Repeat share must not duplicate supplement');
 sandbox.supplementId='extra-two';
 assert.equal(await sandbox.api.saveOrderToHistory(),true);
 assert.equal(history.length,3);
 history[1].items[0].receivedQty=2;
 history[1].receivedAt=2;
 assert.equal(sandbox.api.orderingMonthlyCosts(history,'2026-10').total,30);
 sandbox.supplementId='extra-one';
 assert.equal(await sandbox.api.saveOrderToHistory(),false,'Cannot overwrite received supplement');
 sandbox.supplementId=null;
 assert.equal(await sandbox.api.saveOrderToHistory(),false,'Cannot overwrite received regular order');
 console.log('Supplement isolation, idempotency, receipt lock and totals PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});

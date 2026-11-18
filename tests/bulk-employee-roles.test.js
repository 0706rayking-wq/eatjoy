const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const roles = html.slice(html.indexOf('    const ROLE_OPTIONS ='), html.indexOf('    const HYGIENE_COURSES ='));
const handler = html.slice(html.indexOf('     const handleBulkRoleChange ='), html.indexOf('     const adminTabItems ='));
async function run({cancel=false, stale=false, fail=false, locked=false, target='點心坊計時人員', branch='A'}={}) {
 const names = ['內場正職人員', '外場正職人員', '點心坊正職人員'];
 const people = names.map((role,i)=>({phone:String(i), name:String(i), normalizedRole:role, branch:['A']}));
 const writes=[], messages=[];
 let selected=people.map(u=>u.phone), saving=false;
 const context = {bulkTargetRole:target, selectedEmployees:selected, visibleUsers:people, currentBranch:'A', bulkRoleLock:{current:locked},
 window:{confirm:()=>!cancel}, getPublicPath:x=>x,
 setSelectedEmployees:x=>selected=x, setBulkRoleSaving:x=>saving=x, triggerNotify:(...x)=>messages.push(x),
 db:{collection:()=>({doc:id=>id}),runTransaction:async fn=>{
  if(fail) throw new Error('offline');
  const staged=[];
  await fn({get:async id=>({exists:true,data:()=>({role:stale?'內場主管':names[Number(id)],branch:[branch],status:'approved'})}),update:(id,data)=>staged.push({id,data})});
  writes.push(...staged);
 }}};
 await vm.runInNewContext(roles+handler+';handleBulkRoleChange()',context);
 return {writes,messages,selected,saving,context};
}
(async()=>{
 const good=await run();
 assert.deepEqual(good.writes.map(x=>x.data.role),Array(3).fill('點心坊計時人員'));
 good.writes.forEach(x=>assert.deepEqual(Object.keys(x.data),['role']));
 assert.equal(good.selected.length,0);
 for(const option of ['cancel','stale','fail','locked']) {
  const result=await run({[option]:true});
  assert.equal(result.writes.length,0,option);
  assert.equal(result.selected.length,3,option);
  assert.equal(result.saving,false,option);
 }
 const options=vm.runInNewContext(roles+';ROLE_OPTIONS');
 for(const target of options) {
  const result=await run({target});
  assert.equal(result.writes.length,3);
  assert.ok(result.writes.every(x=>x.data.role===target));
 }
 assert.equal((await run({target:''})).writes.length,0);
 assert.equal((await run({target:'invalid'})).writes.length,0);
 assert.equal((await run({branch:'B'})).writes.length,0);
 console.log('Bulk role conversion: all eight targets, validation, branch guard, cancellation, stale records and failures passed');
})().catch(e=>{console.error(e);process.exitCode=1;});

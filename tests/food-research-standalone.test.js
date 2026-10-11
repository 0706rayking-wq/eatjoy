const fs = require('node:fs');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const solo = fs.readFileSync(path.join(root, 'food-research.html'), 'utf8');
const original = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert.ok(solo.includes("const soloPath = col => getPublicPath('frsolo_' + col)"));
assert.ok(solo.includes("const saveKey = 'frsolo_save_'"));
assert.ok(original.includes("const saveKey = 'fr_save_'"));
assert.ok(!solo.includes('const renderPage ='));
assert.ok(!solo.includes('Task 3: Daily knowledge quiz'));
assert.ok(solo.includes('{todayDone}/2'));
assert.ok(solo.includes('complete: true };'));
assert.ok(solo.includes('function showRevivalQuiz(){ goBackToCamp(); return;'));
const start = solo.indexOf(' const writeSave = (data, options = {}) => {');
const end = solo.indexOf(' const compareFoodResearchRanks', start);
for (const [balance, expected] of [[120,200],[80,80],[100,100]]) {
 const sandbox = vm.createContext({ loadSave: () => ({gold:100}), foodResearchResetAt:0,
  mergeFoodResearchSaves:(a,b)=>({...a,...b}),cacheFoodResearchSave:s=>{sandbox.saved=s;},syncFoodResearchSave:()=>{} });
 vm.runInContext(solo.slice(start,end) + ';writeSave({gold:' + balance + '});', sandbox);
 assert.equal(sandbox.saved.gold, expected);
}
console.log('Standalone isolation, rules and gold multiplier checks passed');

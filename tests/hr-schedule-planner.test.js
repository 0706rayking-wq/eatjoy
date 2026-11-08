const assert = require('node:assert/strict');
const { planSchedule } = require('../lib/hr-schedule-planner');

const options = [
  { value: 'A', label: '早班(09:30~15:00)' },
  { value: 'B', label: '晚班(17:00~20:00)' },
  { value: 'C', label: '晚班(17:00~21:30)' }
];
const plans = planSchedule([{
  employeeNumber: '1',
  name: '王小明',
  date: '2026-08-21',
  scheduledShifts: [
    { start: '09:30', end: '15:00' },
    { start: '17:00', end: '21:00' }
  ]
}], options);
assert.equal(plans[0].status, 'manual');
assert.equal(plans[0].selectedShifts, undefined);
const exact = planSchedule([{scheduledShifts:[{start:'09:30',end:'15:00'},{start:'17:00',end:'21:30'}]}], options)[0];
assert.equal(exact.status, 'ready');
assert.deepEqual(exact.selectedShifts.map(s=>s.value), ['A','C']);

assert.equal(planSchedule([{ scheduledShifts: [{ start: '09:30', end: null }] }], options)[0].status, 'manual');
assert.equal(planSchedule([{ scheduledShifts: [{ start: '10:00', end: '15:00' }] }], options)[0].status, 'manual');
assert.equal(planSchedule([{
  scheduledShifts: [{ start: '09:30', end: '15:00' }]
}], [...options, { value: 'A2', label: '早班(09:30~15:00)' }])[0].status, 'manual');

const tiedFinal = planSchedule([{
  scheduledShifts: [{ start: '16:00', end: '21:45' }]
}], [
  { value: 'L1', label: '晚班(16:00~21:30)' },
  { value: 'L2', label: '晚班(16:00~22:00)' }
])[0];
assert.equal(tiedFinal.status, 'manual');
assert.equal(tiedFinal.selectedShifts, undefined);

const longestFinal = planSchedule([{
  scheduledShifts: [{ start: '17:00', end: '21:00' }]
}], [
  { value: 'A', label: '晚班(17:00~21:00)' },
  { value: 'B', label: '晚班(17:00~22:30)' }
])[0];
assert.equal(longestFinal.status, 'ready');
assert.equal(longestFinal.selectedShifts[0].value, 'A');

for (const bad of ['24:00','09:99','09:30junk','09:30:01']) {
  assert.equal(planSchedule([{scheduledShifts:[{start:bad,end:'15:00'}]}],options)[0].status,'manual');
}
assert.equal(planSchedule([{scheduledShifts:[{start:'09:30:00',end:'15:00:00'}]}],[options[0],options[0]])[0].status,'ready');
const overnight=planSchedule([{scheduledShifts:[{start:'22:00',end:'02:00'}]}],[{value:'N',label:'夜班(22:00~02:00)'}])[0];
assert.equal(overnight.status,'ready');
assert.equal(overnight.selectedShifts[0].value,'N');

console.log('hr-schedule-planner tests passed');

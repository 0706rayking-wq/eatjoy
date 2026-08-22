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
assert.equal(plans[0].status, 'ready');
assert.deepEqual(plans[0].selectedShifts.map((shift) => shift.value), ['A', 'C']);

assert.equal(planSchedule([{ scheduledShifts: [{ start: '09:30', end: null }] }], options)[0].status, 'manual');
assert.equal(planSchedule([{ scheduledShifts: [{ start: '10:00', end: '15:00' }] }], options)[0].status, 'manual');
assert.equal(planSchedule([{
  scheduledShifts: [{ start: '09:30', end: '15:00' }]
}], [...options, { value: 'A2', label: '早班(09:30~15:00)' }])[0].status, 'ready');

const tiedFinal = planSchedule([{
  scheduledShifts: [{ start: '16:00', end: '21:45' }]
}], [
  { value: 'L1', label: '晚班(16:00~21:30)' },
  { value: 'L2', label: '晚班(16:00~22:00)' }
])[0];
assert.equal(tiedFinal.status, 'ready');
assert.equal(tiedFinal.selectedShifts[0].value, 'L1');

console.log('hr-schedule-planner tests passed');

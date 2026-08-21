const assert = require('node:assert/strict');
const { normalizeRecords } = require('../lib/hr-attendance-explanation-sync')._test;

assert.deepEqual(normalizeRecords([{
  employeeNumber: '403003',
  name: '王永銓',
  date: '2026-08-21',
  clockEntries: [
    { time: '09:16:50', type: '上班' },
    { time: '15:11:10', type: '下班' }
  ]
}])[0].clockEntries, [
  { time: '09:16:50', type: '上班', explanation: '09:16:50' },
  { time: '15:11:10', type: '下班', explanation: '15:11:10' }
]);

assert.throws(() => normalizeRecords([{
  employeeNumber: '403003', name: '王永銓', date: '2026-08-21', clockEntries: []
}]), /Invalid punches/);
assert.throws(() => normalizeRecords([{
  employeeNumber: '403003', name: '王永銓', date: '8\/21',
  clockEntries: [{ time: '09:00', type: '上班' }]
}]), /Invalid normal record identity/);

console.log('hr-attendance-explanation-sync tests passed');

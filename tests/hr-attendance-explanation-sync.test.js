const assert = require('node:assert/strict');
const {
  attendanceRowSelectors,
  explanationDepartmentValues,
  normalizeRecords,
  scheduleDepartment,
  weekIndexForDate
} = require('../lib/hr-attendance-explanation-sync')._test;

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

assert.equal(scheduleDepartment({ department: '南港三井Lalaport外場' }), '南港三井Lalaport外場');
assert.equal(scheduleDepartment({ department: '南港三井Lalaport內場' }), '南港三井Lalaport內場');
assert.throws(() => scheduleDepartment({ name: '測試員工', department: '未知' }), /無法判斷/);
assert.equal(weekIndexForDate('2026-08-21'), 3);
assert.deepEqual(explanationDepartmentValues(
  { department: '南港三井Lalaport內場' },
  '15451',
  {}
), ['15451_103016', '15451_0']);
assert.deepEqual(explanationDepartmentValues(
  { department: '南港三井Lalaport外場' },
  '15451',
  { NUEIP_FRONT_WASH_DEPARTMENT_VALUES: '15451_103017,15451_103018' }
), ['15451_103017', '15451_103018', '15451_0']);
assert.match(attendanceRowSelectors().modify, /data-th\*="修改"/);

console.log('hr-attendance-explanation-sync tests passed');

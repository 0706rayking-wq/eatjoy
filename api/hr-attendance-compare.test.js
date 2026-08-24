const assert = require('node:assert/strict');
const {
  assessAttendanceSource,
  alignClockOuts,
  compareAttendance,
  formatLineMessages,
  normalizeDate,
  parseAllOptions,
  parseAttendanceHtml,
  parseSelectOptions,
  resolveDepartmentValues,
  uniqueAttendance,
  wrapLine
} = require('./hr-attendance-compare')._test;

const departmentHtml = `
<select id="SLayer" name="SLayer">
  <option value="15451_103016">南港內場</option>
  <option value="15451_103017">南港外場</option>
  <option value="15451_103018">南港洗滌</option>
  <option value="15451_203017">台中外場</option>
</select>`;
assert.deepEqual(parseSelectOptions(departmentHtml, 'SLayer').map((option) => option.value), [
  '15451_103016',
  '15451_103017',
  '15451_103018',
  '15451_203017'
]);
assert.equal(parseAllOptions(departmentHtml).length, 4);
assert.deepEqual(resolveDepartmentValues(
  { sheet_type: '內場' },
  departmentHtml,
  '15451_103016',
  {}
), ['15451_103016']);
assert.deepEqual(resolveDepartmentValues(
  { sheet_type: '外場／洗滌' },
  departmentHtml,
  '15451_103016',
  {}
), ['15451_103017']);
assert.deepEqual(resolveDepartmentValues(
  { sheet_type: '外場／洗滌' },
  '',
  '15451_103016',
  { NUEIP_FRONT_WASH_DEPARTMENT_VALUES: '15451_9, 15451_10,15451_9' }
), ['15451_9', '15451_10']);

const html = `
<table><tbody>
  <tr role="row">
    <td data-th="員工編號">703043</td>
    <td data-th="員工"><span class="ctrl-dept-kit">南港內場</span><div class="user-popover">謝采穎</div></td>
    <td data-th="日期"><span class="dateday">2026-08-06</span></td>
    <td data-th="表定時間"><div data-original-title="18:00~22:00">晚班(P6)</div></td>
    <td data-th="上班"><span>17:55:14</span></td>
    <td data-th="下班"><span>21:58:47</span></td>
    <td data-th="工時">3小時58分</td>
    <td data-th="出勤狀況"></td>
  </tr>
  <tr role="row">
    <td data-th="員工編號">703065</td>
    <td data-th="員工"><div class="user-popover">陳玉清福</div></td>
    <td data-th="日期"><span class="dateday">2026-08-06</span></td>
    <td data-th="表定時間">晚班(P6)</td>
    <td data-th="上班"><span>17:49:30</span></td>
    <td data-th="下班"><span>21:56:48</span></td>
    <td data-th="工時">3小時56分</td>
    <td data-th="出勤狀況"></td>
  </tr>
  <tr role="row">
    <td data-th="員工編號">703048</td>
    <td data-th="員工"><div class="user-popover">劉軒菱</div></td>
    <td data-th="日期"><span class="dateday">2026-08-06</span></td>
    <td data-th="表定時間">休息日</td>
    <td data-th="上班"><span>09:26:42</span><span>15:56:22</span></td>
    <td data-th="下班"><span>14:02:30</span><span>20:50:02</span></td>
    <td data-th="工時"></td>
    <td data-th="出勤狀況"></td>
  </tr>
  <tr role="row">
    <td data-th="員工編號">100004</td>
    <td data-th="員工"><div class="user-popover">黃遠志</div></td>
    <td data-th="日期"><span class="dateday">2026-08-06</span></td>
    <td data-th="表定時間"></td>
    <td data-th="上班"><span>09:27:35</span></td>
    <td data-th="下班"><span>19:00:00</span></td>
    <td data-th="工時"></td>
    <td data-th="出勤狀況"></td>
  </tr>
</tbody></table>`;

const attendance = parseAttendanceHtml(html);
assert.equal(attendance.length, 4);
assert.equal(attendance[0].name, '謝采穎');
assert.deepEqual(attendance[2].clockOuts, ['14:02', '20:50']);
assert.equal(uniqueAttendance([attendance[0], attendance[0], attendance[1]]).length, 2);

const positionalHtml = `
<table><tbody><tr>
  <td>補卡</td><td>修改</td><td>403003</td>
  <td><div class="user-popover">王永銓</div></td>
  <td>2026-08-06(四)</td><td>全日(A930)</td>
  <td>09:24:03 16:59:38</td><td>15:03:02 20:41:40</td>
  <td>9小時15分</td><td></td>
</tr></tbody></table>`;
const positionalAttendance = parseAttendanceHtml(positionalHtml);
assert.equal(positionalAttendance.length, 1);
assert.equal(positionalAttendance[0].name, '王永銓');
assert.deepEqual(positionalAttendance[0].clockOuts, ['15:03', '20:41']);

const adjustedAndPhysicalHtml = `
<table><tbody><tr>
  <td>補卡</td><td>修改</td><td>900001</td><td><div class="user-popover">測試員工</div></td>
  <td>2026-08-03</td><td>早班</td><td><span class="help color_black">09:30:59</span></td>
  <td><span class="help color_yellow" data-original-title="辦公補卡">15:00:00</span>
      <span class="help color_black" data-original-title="無">15:02:08</span></td>
  <td>5小時32分</td><td></td>
</tr></tbody></table>`;
const adjustedAndPhysical = parseAttendanceHtml(adjustedAndPhysicalHtml)[0];
assert.deepEqual(adjustedAndPhysical.clockOuts, ['15:02']);
assert.deepEqual(adjustedAndPhysical.adjustedClockOuts, ['15:00']);

const schedule = {
  date: '8/6',
  employees: [
    { name: '采穎', shifts: [{ start: '18:00', end: '21:45' }], off_or_unclear: false },
    { name: '清福', shifts: [{ start: '18:00', end: '22:00' }], off_or_unclear: false },
    {
      name: '軒菱',
      shifts: [
        { start: '09:30', end: '14:00' },
        { start: '16:00', end: '20:45' }
      ],
      off_or_unclear: false
    }
  ]
};

const comparison = compareAttendance(schedule, attendance, ['黃遠志']);
assert.equal(comparison.issues.some((issue) => issue.type === 'late' && issue.name === '謝采穎'), false);
assert.equal(comparison.issues.some((issue) => issue.type === 'early' && issue.name === '陳玉清福'), true);
assert.equal(comparison.issues.some((issue) => issue.type === 'rest_day_work' && issue.name === '劉軒菱'), true);
assert.equal(comparison.issues.some((issue) => issue.name === '黃遠志'), false);
assert.deepEqual(comparison.normalRecords, [{
  employeeNumber: '703043',
  name: '謝采穎',
  date: '2026-08-06',
  department: '',
  scheduledShifts: [{ start: '18:00', end: '21:45' }],
  clockEntries: [
    { time: '17:55:14', type: '上班' },
    { time: '21:58:47', type: '下班' }
  ]
}]);

const incompleteSchedule = {
  employees: Array.from({ length: 26 }, (_, index) => ({
    name: `測試員工${index + 1}`,
    shifts: [{ start: '09:30', end: '15:00' }]
  }))
};
const oneUnrelatedAttendance = [{
  employeeNumber: 'ONLY-1',
  name: '無關員工',
  schedule: '出勤日',
  status: '',
  clockIns: ['09:30'],
  clockOuts: ['15:00']
}];
assert.deepEqual(assessAttendanceSource(incompleteSchedule, oneUnrelatedAttendance), {
  complete: false,
  scheduleCount: 26,
  attendanceCount: 1,
  matchedCount: 0,
  minimumAttendanceCount: 13,
  minimumMatchedCount: 6
});

const completeAttendance = incompleteSchedule.employees.map((employee, index) => ({
  employeeNumber: `E${index + 1}`,
  name: employee.name,
  schedule: '出勤日',
  status: '',
  clockIns: ['09:30'],
  clockOuts: ['15:00']
}));
assert.equal(assessAttendanceSource(incompleteSchedule, completeAttendance).complete, true);

const messages = formatLineMessages('2026-08-06', comparison);
assert.ok(messages.length >= 1);
assert.equal(messages.join('\n').includes('黃遠志'), false);
assert.equal(messages.join('\n').includes('排除'), false);
for (const line of messages.join('\n').split('\n')) {
  assert.ok(Array.from(line).length <= 28, `line exceeds 28 characters: ${line}`);
}

const frontWashMessages = formatLineMessages('2026-08-15', { issues: [], normalCount: 1, offMatchedCount: 0 }, {
  sheet_type: '外場／洗滌'
});
assert.equal(frontWashMessages.join('\n').includes('店別：南港外場／洗滌'), true);

const silentComparison = {
  issues: [
    { type: 'late', name: '羽婕', detail: '晚打卡15分鐘' },
    { type: 'early', name: '其他員工', detail: '早退2分鐘' }
  ],
  normalCount: 2,
  offMatchedCount: 1,
  offMatchedNames: ['靜妍'],
  normalRecords: [
    { name: '羽婕' },
    { name: '其他正常員工' }
  ]
};
const silentMessages = formatLineMessages(
  '2026-08-24',
  silentComparison,
  { sheet_type: '外場／洗滌' },
  ['羽婕', '靜妍']
).join('\n');
assert.equal(silentMessages.includes('羽婕'), false);
assert.equal(silentMessages.includes('靜妍'), false);
assert.equal(silentMessages.includes('異常：1項'), true);
assert.equal(silentMessages.includes('下班正常：1人'), true);
assert.equal(silentMessages.includes('休假相符：0人'), true);

const threeShiftAttendance = [{
  employeeNumber: 'E900',
  name: '測試外場',
  schedule: '出勤日',
  status: '',
  clockIns: ['09:00', '12:00', '17:00'],
  clockOuts: ['11:00', '14:00', '22:00']
}];
const threeShiftComparison = compareAttendance({
  employees: [{
    name: '測試外場',
    shifts: [
      { start: '09:00', end: '11:00' },
      { start: '12:00', end: '14:00' },
      { start: '17:00', end: '22:00' }
    ]
  }]
}, threeShiftAttendance, []);
assert.equal(threeShiftComparison.issues.length, 0);
assert.equal(threeShiftComparison.normalCount, 1);
assert.deepEqual(threeShiftComparison.normalRecords[0].clockEntries, [
  { time: '09:00', type: '上班' },
  { time: '11:00', type: '下班' },
  { time: '12:00', type: '上班' },
  { time: '14:00', type: '下班' },
  { time: '17:00', type: '上班' },
  { time: '22:00', type: '下班' }
]);

const duplicateNameComparison = compareAttendance({
  employees: [{ name: '阮氏情', shifts: [{ start: '09:30', end: '15:30' }] }]
}, [
  {
    employeeNumber: '702079', name: '阮氏情', department: '南港三井Lalaport外場',
    schedule: '出勤日', status: '', clockIns: ['16:52'], clockOuts: ['17:28']
  },
  {
    employeeNumber: '703099', name: '阮氏情', department: '南港三井Lalaport內場',
    schedule: '出勤日', status: '', clockIns: ['09:21'], clockOuts: ['15:34']
  }
], []);
assert.equal(duplicateNameComparison.issues.some((issue) => issue.type === 'name_ambiguous'), false);
assert.equal(duplicateNameComparison.normalRecords[0].employeeNumber, '703099');
assert.equal(duplicateNameComparison.normalRecords[0].department, '南港三井Lalaport內場');

assert.equal(normalizeDate('8/6', new Date('2026-08-07T00:00:00+08:00')), '2026-08-06');
assert.deepEqual(wrapLine('123456', 3), ['123', '456']);

const fourteenMinutesLate = alignClockOuts(['21:00'], ['21:14:59']);
assert.equal(fourteenMinutesLate.pairs[0].differenceSeconds, 14 * 60);
assert.equal(fourteenMinutesLate.pairs[0].actual, '21:14');

const fourteenMinuteComparison = compareAttendance({
  employees: [{ name: '測試員工', shifts: [{ start: '17:00', end: '21:00' }] }]
}, [{
  employeeNumber: 'T001', name: '測試員工', department: '南港三井Lalaport內場',
  schedule: '出勤日', status: '', clockIns: ['16:55'], clockOuts: ['21:14']
}]);
assert.equal(fourteenMinuteComparison.issues.some((issue) => issue.type === 'late'), false);

const fifteenMinuteComparison = compareAttendance({
  employees: [{ name: '測試員工', shifts: [{ start: '17:00', end: '21:00' }] }]
}, [{
  employeeNumber: 'T001', name: '測試員工', department: '南港三井Lalaport內場',
  schedule: '出勤日', status: '', clockIns: ['16:55'], clockOuts: ['21:15']
}]);
assert.equal(fifteenMinuteComparison.issues.some((issue) => issue.type === 'late'), true);

const adjustedComparison = compareAttendance({
  employees: [{ name: '測試員工', shifts: [{ start: '09:30', end: '15:00' }] }]
}, [adjustedAndPhysical]);
assert.equal(adjustedComparison.issues.some((issue) => issue.type === 'nueip_status'), false);

const flaggedComparison = compareAttendance({
  employees: [{ name: '測試員工', shifts: [{ start: '09:30', end: '15:02' }] }]
}, [{ ...adjustedAndPhysical, status: '打卡異常' }]);
assert.equal(flaggedComparison.normalCount, 0);
assert.equal(flaggedComparison.normalRecords.length, 0);

const unclearComparison = compareAttendance({
  employees: [{
    name: '測試員工',
    shifts: [{ start: '09:30', end: '15:00' }],
    needs_review: true
  }]
}, [{ ...adjustedAndPhysical, clockOuts: ['15:13', '21:33'] }]);
assert.equal(unclearComparison.issues.some((issue) => issue.type === 'schedule_review'), true);
assert.equal(unclearComparison.issues.some((issue) => issue.type === 'nueip_status'), false);

console.log('hr-attendance-compare tests passed');

const assert = require('node:assert/strict');
const {
  compareAttendance,
  formatLineMessages,
  normalizeDate,
  parseAttendanceHtml,
  wrapLine
} = require('./hr-attendance-compare')._test;

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
assert.deepEqual(attendance[2].clockOuts, ['14:02:30', '20:50:02']);

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
assert.equal(comparison.issues.some((issue) => issue.type === 'late' && issue.name === '謝采穎'), true);
assert.equal(comparison.issues.some((issue) => issue.type === 'early' && issue.name === '陳玉清福'), true);
assert.equal(comparison.issues.some((issue) => issue.type === 'rest_day_work' && issue.name === '劉軒菱'), true);
assert.equal(comparison.issues.some((issue) => issue.name === '黃遠志'), false);

const messages = formatLineMessages('2026-08-06', comparison);
assert.ok(messages.length >= 1);
assert.equal(messages.join('\n').includes('黃遠志'), false);
assert.equal(messages.join('\n').includes('排除'), false);
for (const line of messages.join('\n').split('\n')) {
  assert.ok(Array.from(line).length <= 28, `line exceeds 28 characters: ${line}`);
}

assert.equal(normalizeDate('8/6', new Date('2026-08-07T00:00:00+08:00')), '2026-08-06');
assert.deepEqual(wrapLine('123456', 3), ['123', '456']);

console.log('hr-attendance-compare tests passed');

'use strict';

const assert = require('node:assert/strict');
const {
  buildDueMemos,
  buildMonthlyReminder,
  parseAssistantCommand,
  statutoryLeaveDays
} = require('./little-thunder-assistant-core');

const state = {};
const now = new Date('2026-08-10T09:00:00+08:00');

const helpMessage = parseAssistantCommand('小雷神，請問你可以做什麼', {}, now);
assert.match(helpMessage, /我能幫你紀錄以下事情/);
assert.match(helpMessage, /1\.【特休提醒】/);
assert.match(helpMessage, /6\.【刪除資料】/);

assert.match(parseAssistantCommand('小雷神，幫我新增王小明特休，8/1開始計算', state, now), /特休已新增/);
assert.equal(state.people.王小明.leaveStartDate, '2026-08-01');
assert.match(parseAssistantCommand('小雷神，幫我新增王小明7/6生日', state, now), /生日已新增/);
assert.equal(state.people.王小明.birthday, '07-06');
assert.match(parseAssistantCommand('小雷神，幫我新增王小明7/6體檢完成', state, now), /6\/25/);
assert.equal(state.people.王小明.medicalCompletedDate, '2026-07-06');
assert.match(parseAssistantCommand('小雷神，製冰機8/25保養完成', state, now), /每3個月/);
assert.match(parseAssistantCommand('小雷神，下個月10號要開月大會，請提前十天通知我', state, now), /8\/31 09:00/);

assert.equal(statutoryLeaveDays(0.5), 3);
assert.equal(statutoryLeaveDays(1), 7);
assert.equal(statutoryLeaveDays(2), 10);
assert.equal(statutoryLeaveDays(3), 14);
assert.equal(statutoryLeaveDays(5), 15);
assert.equal(statutoryLeaveDays(10), 16);
assert.equal(statutoryLeaveDays(24), 30);

const leaveState = { people: { 王小明: { leaveStartDate: '2026-08-01' } } };
assert.match(buildMonthlyReminder(leaveState, new Date('2027-01-25T09:00:00+08:00')), /滿半年3日/);
assert.match(buildMonthlyReminder(leaveState, new Date('2027-07-25T09:00:00+08:00')), /滿1年7日/);

const memoState = {};
parseAssistantCommand('小雷神，下個月10號要開月大會，請提前十天通知我', memoState, now);
assert.match(buildDueMemos(memoState, new Date('2026-08-31T09:00:00+08:00')), /開月大會/);
assert.equal(buildDueMemos(memoState, new Date('2026-08-31T09:01:00+08:00')), null);

assert.match(parseAssistantCommand('小雷神，幫我刪除王小明的所有紀錄', state, now), /刪除完成/);
assert.equal(state.people.王小明, undefined);

console.log('little-thunder-assistant tests passed');

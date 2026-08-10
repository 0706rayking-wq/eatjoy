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

assert.match(parseAssistantCommand('小雷神，幫我新增王小明特休，8/1開始計算', state, now), /新增王小明已經完成/);
assert.equal(state.people.王小明.leaveStartDate, '2026-08-01');
assert.match(parseAssistantCommand('小雷神，幫我新增王小明7/6生日', state, now), /新增王小明已經完成/);
assert.equal(state.people.王小明.birthday, '07-06');

const batchBirthdayState = {};
const batchBirthdayReply = parseAssistantCommand(
  '小雷神，幫我新增以下生日\n楊過 9/11\n郭靖 9/16\n周伯通10/22\n洪七公11/11',
  batchBirthdayState,
  now
);
assert.match(batchBirthdayReply, /新增楊過、郭靖、周伯通、洪七公已經完成/);
assert.match(batchBirthdayReply, /還有什麼我能協助你的嗎/);
assert.equal(batchBirthdayState.people.楊過.birthday, '09-11');
assert.equal(batchBirthdayState.people.郭靖.birthday, '09-16');
assert.equal(batchBirthdayState.people.周伯通.birthday, '10-22');
assert.equal(batchBirthdayState.people.洪七公.birthday, '11-11');
assert.match(parseAssistantCommand('小雷神，幫我新增王小明7/6體檢完成', state, now), /新增王小明已經完成/);
assert.equal(state.people.王小明.medicalCompletedDate, '2026-07-06');
assert.match(parseAssistantCommand('小雷神，製冰機8/25保養完成', state, now), /新增製冰機已經完成/);
assert.match(parseAssistantCommand('小雷神，下個月10號要開月大會，請提前十天通知我', state, now), /新增開月大會已經完成/);

const batchState = {};
assert.match(
  parseAssistantCommand('小雷神，幫我新增以下特休\n楊過 8/1開始計算\n郭靖 9/1開始計算', batchState, now),
  /新增楊過、郭靖已經完成/
);
assert.equal(batchState.people.楊過.leaveStartDate, '2026-08-01');
assert.equal(batchState.people.郭靖.leaveStartDate, '2026-09-01');

assert.match(
  parseAssistantCommand('小雷神，幫我新增以下體檢\n楊過 7/6體檢完成\n郭靖 8/2體檢完成', batchState, now),
  /新增楊過、郭靖已經完成/
);
assert.equal(batchState.people.楊過.medicalCompletedDate, '2026-07-06');
assert.equal(batchState.people.郭靖.medicalCompletedDate, '2026-08-02');

assert.match(
  parseAssistantCommand('小雷神，幫我新增以下設備保養\n製冰機 8/25保養完成 每3個月\n冷氣 8/20保養完成 每6個月', batchState, now),
  /新增製冰機、冷氣已經完成/
);
assert.equal(batchState.equipment.製冰機.cycleMonths, 3);
assert.equal(batchState.equipment.冷氣.cycleMonths, 6);

assert.match(
  parseAssistantCommand('小雷神，幫我新增以下備忘錄\n下個月10號要開月大會，請提前十天通知我\n下個月20號要盤點，請提前三天通知我', batchState, now),
  /新增開月大會、盤點已經完成/
);
assert.equal(batchState.memos.length, 2);

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

assert.match(parseAssistantCommand('小雷神，幫我刪除王小明的所有紀錄', state, now), /請再次確認/);
assert.notEqual(state.people.王小明, undefined);
assert.match(parseAssistantCommand('小雷神，確認刪除王小明的所有紀錄', state, new Date(now.getTime() + 5 * 60000)), /刪除完成/);
assert.equal(state.people.王小明, undefined);

const expiredDeleteState = { people: { 陳小華: { birthday: '01-01' } } };
assert.match(parseAssistantCommand('小雷神，刪除陳小華的所有紀錄', expiredDeleteState, now), /請再次確認/);
assert.match(parseAssistantCommand('小雷神，確認刪除陳小華的所有紀錄', expiredDeleteState, new Date(now.getTime() + 11 * 60000)), /無法刪除/);
assert.notEqual(expiredDeleteState.people.陳小華, undefined);

assert.match(parseAssistantCommand('小雷神，刪除陳小華的所有紀錄', expiredDeleteState, now), /請再次確認/);
assert.match(parseAssistantCommand('小雷神，取消刪除陳小華的所有紀錄', expiredDeleteState, now), /已取消刪除/);
assert.notEqual(expiredDeleteState.people.陳小華, undefined);

console.log('little-thunder-assistant tests passed');

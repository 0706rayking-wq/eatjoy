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

const birthdayCleanupState = {
  people: {
    王小明: { birthday: '07-06', medicalCompletedDate: '2026-07-06' },
    李小華: { birthday: '09-11' }
  },
  sent: {
    'birthday:王小明:2026': '2026-06-25',
    'medical:王小明:2026-07-06': '2026-06-25'
  }
};
parseAssistantCommand('小雷神，檢視目前提醒清單', birthdayCleanupState, now);
assert.equal(birthdayCleanupState.people.王小明.birthday, undefined);
assert.equal(birthdayCleanupState.people.王小明.medicalCompletedDate, '2026-07-06');
assert.equal(birthdayCleanupState.people.李小華.birthday, undefined);
assert.equal(birthdayCleanupState.sent['birthday:王小明:2026'], undefined);
assert.equal(birthdayCleanupState.sent['medical:王小明:2026-07-06'], '2026-06-25');

const helpMessage = parseAssistantCommand('小雷神，請問你可以做什麼', {}, now);
assert.match(helpMessage, /我能幫你紀錄以下事情/);
assert.match(helpMessage, /1\.【體檢提醒】/);
assert.match(helpMessage, /4\.【刪除資料】/);
assert.match(helpMessage, /5\.【檢視目前提醒清單】/);
assert.doesNotMatch(helpMessage, /生日|特休/);

const reminderListState = {
  people: {
    王小明: { leaveStartDate: '2026-08-01', birthday: '07-06', medicalCompletedDate: '2026-07-06' }
  },
  equipment: {
    製冰機: { completedDate: '2026-08-25', cycleMonths: 3 }
  },
  memos: [
    { id: 'memo-1', eventDate: '2026-09-01', remindDate: '2026-09-01', text: '調整內場正職底薪', sent: false },
    { id: 'memo-2', eventDate: '2026-08-01', remindDate: '2026-08-01', text: '已完成事項', sent: true }
  ]
};
const reminderListReply = parseAssistantCommand('小雷神，檢視目前提醒清單', reminderListState, now);
assert.match(reminderListReply, /【小雷神｜目前提醒清單】/);
assert.match(reminderListReply, /王小明｜7\/6完成/);
assert.match(reminderListReply, /製冰機｜8\/25完成｜每3個月/);
assert.match(reminderListReply, /9\/1提醒｜調整內場正職底薪/);
assert.doesNotMatch(reminderListReply, /已完成事項/);
assert.doesNotMatch(reminderListReply, /生日|特休|起算8\/1/);
assert.equal(reminderListReply.split('\n').every((line) => Array.from(line).length <= 28), true);

assert.match(parseAssistantCommand('小雷神，幫我新增王小明特休，8/1開始計算', state, now), /功能已停用/);
assert.equal(state.people?.王小明?.leaveStartDate, undefined);
assert.match(parseAssistantCommand('小雷神，幫我新增王小明7/6生日', state, now), /功能已停用/);
assert.equal(state.people?.王小明?.birthday, undefined);

const batchBirthdayState = {};
const batchBirthdayReply = parseAssistantCommand(
  '小雷神，幫我新增以下生日\n楊過 9/11\n郭靖 9/16\n周伯通10/22\n洪七公11/11',
  batchBirthdayState,
  now
);
assert.match(batchBirthdayReply, /功能已停用/);
assert.deepEqual(batchBirthdayState.people, {});
assert.match(parseAssistantCommand('小雷神，幫我新增王小明7/6體檢完成', state, now), /新增王小明已經完成/);
assert.equal(state.people.王小明.medicalCompletedDate, '2026-07-06');
assert.match(parseAssistantCommand('小雷神，製冰機8/25保養完成', state, now), /新增製冰機已經完成/);
assert.match(parseAssistantCommand('小雷神，下個月10號要開月大會，請提前十天通知我', state, now), /新增開月大會已經完成/);

const batchState = {};
assert.match(
  parseAssistantCommand('小雷神，幫我新增以下特休\n楊過 8/1開始計算\n郭靖 9/1開始計算', batchState, now),
  /功能已停用/
);
assert.equal(batchState.people.楊過, undefined);

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

const naturalMemoState = {};
const naturalMemoReply = parseAssistantCommand(
  '小雷神，8/26開月大會，提前一週提醒我要統計請假名單',
  naturalMemoState,
  now
);
assert.match(naturalMemoReply, /備忘錄新增完成/);
assert.match(naturalMemoReply, /還有什麼我能協助你的嗎/);
assert.equal(naturalMemoState.memos[0].eventDate, '2026-08-26');
assert.equal(naturalMemoState.memos[0].remindDate, '2026-08-19');
assert.equal(naturalMemoState.memos[0].text, '開月大會；統計請假名單');

const sameDayMemoState = {};
assert.match(
  parseAssistantCommand('小雷神，明天提醒我訂會議室', sameDayMemoState, now),
  /新增訂會議室已經完成/
);
assert.equal(sameDayMemoState.memos[0].remindDate, '2026-08-11');

const reminderPrefixMemoState = {};
const reminderPrefixMemoReply = parseAssistantCommand(
  '小雷神，提醒我9/1要請大家於系統調整內場正職底薪',
  reminderPrefixMemoState,
  now
);
assert.match(reminderPrefixMemoReply, /備忘錄新增完成/);
assert.equal(reminderPrefixMemoState.memos[0].eventDate, '2026-09-01');
assert.equal(reminderPrefixMemoState.memos[0].remindDate, '2026-09-01');
assert.equal(reminderPrefixMemoState.memos[0].text, '請大家於系統調整內場正職底薪');

assert.match(parseAssistantCommand('小雷神，記得處理請假名單', {}, now), /請補充提醒時間/);

assert.equal(statutoryLeaveDays(0.5), 3);
assert.equal(statutoryLeaveDays(1), 7);
assert.equal(statutoryLeaveDays(2), 10);
assert.equal(statutoryLeaveDays(3), 14);
assert.equal(statutoryLeaveDays(5), 15);
assert.equal(statutoryLeaveDays(10), 16);
assert.equal(statutoryLeaveDays(24), 30);

const leaveState = { people: { 王小明: { leaveStartDate: '2026-08-01', birthday: '07-06' } } };
const privacyMonthlyMessage = buildMonthlyReminder(leaveState, new Date('2027-01-25T09:00:00+08:00'));
assert.doesNotMatch(privacyMonthlyMessage, /特休|生日|王小明|滿半年/);

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

const batchDeleteState = {
  people: {
    楊過: { leaveStartDate: '2026-08-01', birthday: '09-11' },
    郭靖: { medicalCompletedDate: '2026-07-06' }
  }
};
const batchDeleteRequest = parseAssistantCommand(
  '小雷神，幫我批量刪除以下人員\n楊過\n郭靖\n周伯通',
  batchDeleteState,
  now
);
assert.match(batchDeleteRequest, /楊過｜查無資料/);
assert.match(batchDeleteRequest, /郭靖｜體檢/);
assert.match(batchDeleteRequest, /周伯通｜查無資料/);
assert.notEqual(batchDeleteState.people.楊過, undefined);

assert.match(
  parseAssistantCommand('小雷神，確認批量刪除郭靖、楊過、周伯通', batchDeleteState, now),
  /名單不一致/
);
assert.notEqual(batchDeleteState.people.楊過, undefined);

const batchDeleteResult = parseAssistantCommand(
  '小雷神，確認批量刪除楊過、郭靖、周伯通',
  batchDeleteState,
  new Date(now.getTime() + 5 * 60000)
);
assert.match(batchDeleteResult, /楊過：刪除完成/);
assert.match(batchDeleteResult, /郭靖：刪除完成/);
assert.match(batchDeleteResult, /周伯通：查無資料/);
assert.equal(batchDeleteState.people.楊過, undefined);
assert.equal(batchDeleteState.people.郭靖, undefined);

const expiredBatchDeleteState = { people: { 黃蓉: {}, 小龍女: {} } };
parseAssistantCommand('小雷神，批量刪除以下人員\n黃蓉\n小龍女', expiredBatchDeleteState, now);
assert.match(
  parseAssistantCommand('小雷神，確認批量刪除黃蓉、小龍女', expiredBatchDeleteState, new Date(now.getTime() + 11 * 60000)),
  /無法批量刪除/
);
assert.notEqual(expiredBatchDeleteState.people.黃蓉, undefined);

const flexibleDeleteState = {
  people: {
    周伯通: { birthday: '10-22' },
    洪七公: { birthday: '11-11' },
    王小明: { leaveStartDate: '2026-08-01' }
  }
};
const flexibleBatchDelete = parseAssistantCommand(
  '小雷神，刪除周伯通及洪七公的所有資料',
  flexibleDeleteState,
  now
);
assert.match(flexibleBatchDelete, /批量刪除待確認/);
assert.match(flexibleBatchDelete, /周伯通｜查無資料/);
assert.match(flexibleBatchDelete, /洪七公｜查無資料/);
assert.deepEqual(flexibleDeleteState.pendingBatchDelete.names, ['周伯通', '洪七公']);

const flexibleSingleDelete = parseAssistantCommand(
  '小雷神，請幫我移除王小明全部資料',
  flexibleDeleteState,
  now
);
assert.match(flexibleSingleDelete, /請再次確認/);
assert.notEqual(flexibleDeleteState.people.王小明, undefined);

assert.match(
  parseAssistantCommand('小雷神，幫我把周伯通和洪七公的資料刪掉', flexibleDeleteState, now),
  /批量刪除待確認/
);

const malformedDeleteState = {};
assert.match(parseAssistantCommand('小雷神，幫我刪除資料', malformedDeleteState, now), /無法辨識刪除名單/);
assert.equal(malformedDeleteState.memos.length, 0);

parseAssistantCommand('小雷神，批量刪除以下人員\n黃蓉\n小龍女', expiredBatchDeleteState, now);
assert.match(parseAssistantCommand('小雷神，取消批量刪除', expiredBatchDeleteState, now), /已取消批量刪除/);
assert.notEqual(expiredBatchDeleteState.people.黃蓉, undefined);

assert.match(parseAssistantCommand('小雷神，刪除陳小華的所有紀錄', expiredDeleteState, now), /請再次確認/);
assert.match(parseAssistantCommand('小雷神，取消刪除陳小華的所有紀錄', expiredDeleteState, now), /已取消刪除/);
assert.notEqual(expiredDeleteState.people.陳小華, undefined);

console.log('little-thunder-assistant tests passed');

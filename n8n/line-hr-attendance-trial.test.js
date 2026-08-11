'use strict';

const assert = require('node:assert/strict');
const workflow = require('./line-hr-attendance-trial.json');

const recognitionNode = workflow.nodes.find((node) => node.name === '辨識下班條');
const normalizeNode = workflow.nodes.find((node) => node.name === '整理辨識結果');
assert.ok(recognitionNode);
assert.ok(normalizeNode);
assert.match(recognitionNode.parameters.text, /上班, 下班, 上班, 下班/);
assert.match(recognitionNode.parameters.text, /ONLY when one visible printed table header row/);

const normalize = new Function('$json', normalizeNode.parameters.jsCode);
const baseSchedule = {
  date: '2026-08-10',
  employees: [{ name: '王小明', shifts: [{ start: '09:30', end: '15:00' }] }],
  warnings: [],
  confidence: 0.95
};

const accepted = normalize({
  text: JSON.stringify({
    ...baseSchedule,
    is_attendance_sheet: true,
    header_sequence: ['上班', '下班', '上班', '下班']
  })
});
assert.equal(accepted.length, 1);
assert.equal(accepted[0].json.date, '2026-08-10');

const rejectedOrdinaryImage = normalize({
  text: JSON.stringify({
    ...baseSchedule,
    is_attendance_sheet: false,
    header_sequence: []
  })
});
assert.deepEqual(rejectedOrdinaryImage, []);

const rejectedWrongHeaderOrder = normalize({
  text: JSON.stringify({
    ...baseSchedule,
    is_attendance_sheet: true,
    header_sequence: ['上班', '上班', '下班', '下班']
  })
});
assert.deepEqual(rejectedWrongHeaderOrder, []);

console.log('line-hr-attendance-trial tests passed');

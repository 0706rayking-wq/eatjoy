'use strict';

const assert = require('node:assert/strict');
const workflow = require('./line-hr-attendance-trial.json');

const recognitionNode = workflow.nodes.find((node) => node.name === '辨識下班條');
const normalizeNode = workflow.nodes.find((node) => node.name === '整理辨識結果');
const lineResponseNode = workflow.nodes.find((node) => node.name === '回傳LINE人事群');
const explanationPreviewNode = workflow.nodes.find((node) => node.name === '寫入正常人員NUEIP說明');
const schedulePreviewNode = workflow.nodes.find((node) => node.name === '預覽NUEIP快速排班');
assert.ok(recognitionNode);
assert.ok(normalizeNode);
assert.ok(lineResponseNode);
assert.ok(explanationPreviewNode);
assert.ok(schedulePreviewNode);
assert.match(explanationPreviewNode.parameters.jsonBody, /mode: 'commit'/);
assert.match(explanationPreviewNode.parameters.jsonBody, /normalRecords/);
assert.match(schedulePreviewNode.parameters.jsonBody, /preview_schedule/);
assert.match(schedulePreviewNode.parameters.jsonBody, /updated.*unchanged/);
assert.equal(workflow.connections['寫入正常人員NUEIP說明'].main[0][0].node, '預覽NUEIP快速排班');
assert.match(lineResponseNode.parameters.jsonBody, /^\{\{/);
assert.doesNotMatch(lineResponseNode.parameters.jsonBody, /^=/);
assert.match(lineResponseNode.parameters.jsonBody, /南港外場／洗滌/);
assert.match(recognitionNode.parameters.text, /上班, 下班, 上班, 下班/);
assert.match(recognitionNode.parameters.text, /上班1, 下班1, 上班2, 下班2/);
assert.match(recognitionNode.parameters.text, /上班3, 下班3/);
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

const acceptedFrontWash = normalize({
  text: JSON.stringify({
    ...baseSchedule,
    is_attendance_sheet: true,
    sheet_type: '外場／洗滌',
    header_sequence: ['姓名', '上班1', '下班1', '上班2', '下班2']
  })
});
assert.equal(acceptedFrontWash.length, 1);
assert.equal(acceptedFrontWash[0].json.sheet_type, '外場／洗滌');

const acceptedThreeShifts = normalize({
  text: JSON.stringify({
    ...baseSchedule,
    is_attendance_sheet: true,
    sheet_type: '外場／洗滌',
    header_sequence: ['上班１', '下班１', '上班２', '下班２', '上班３', '下班３'],
    employees: [{
      name: '王小明',
      shifts: [
        { start: '09:00', end: '11:00' },
        { start: '12:00', end: '14:00' },
        { start: '17:00', end: '22:00' }
      ]
    }]
  })
});
assert.equal(acceptedThreeShifts.length, 1);
assert.equal(acceptedThreeShifts[0].json.employees[0].shifts.length, 3);

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

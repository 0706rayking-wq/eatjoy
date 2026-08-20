'use strict';

const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, 'line-hr-attendance-trial.json');
const outputPath = path.join(__dirname, 'attendance-image-test-workflow.json');
const source = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
const cloneNode = (name) => structuredClone(source.nodes.find((node) => node.name === name));

const webhook = {
  parameters: {
    httpMethod: 'POST',
    path: 'attendance-image-test-20260820',
    options: {}
  },
  id: '4b8c0eb3-0e93-4f6e-92ac-4a997fe62001',
  name: '測試圖片入口',
  type: 'n8n-nodes-base.webhook',
  typeVersion: 2.1,
  position: [0, 0],
  webhookId: '99690664-27dc-4dc2-98d8-d5074f13e215'
};
const recognition = cloneNode('辨識下班條');
const normalize = cloneNode('整理辨識結果');
const compare = cloneNode('NUEIP每日出勤比對');
recognition.position = [240, 0];
normalize.position = [480, 0];
compare.position = [720, 0];

const workflow = {
  name: '測試－下班條圖片（不傳LINE）',
  nodes: [webhook, recognition, normalize, compare],
  pinData: {},
  connections: {
    測試圖片入口: { main: [[{ node: '辨識下班條', type: 'main', index: 0 }]] },
    辨識下班條: { main: [[{ node: '整理辨識結果', type: 'main', index: 0 }]] },
    整理辨識結果: { main: [[{ node: 'NUEIP每日出勤比對', type: 'main', index: 0 }]] }
  },
  settings: { executionOrder: 'v1' },
  active: false
};

fs.writeFileSync(outputPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
console.log(outputPath);

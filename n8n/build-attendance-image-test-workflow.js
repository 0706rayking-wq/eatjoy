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
normalize.parameters.jsCode = normalize.parameters.jsCode.replace(
  "if (!schedule.date || !Array.isArray(schedule.employees)) throw new Error('下班條缺少日期或員工資料');",
  `if (!schedule.date || !Array.isArray(schedule.employees)) throw new Error('下班條缺少日期或員工資料');

const normalizeAttendanceDate = (value) => {
  const rawDate = String(value || '').trim().replace(/[.]/g, '/').replace(/-/g, '/');
  const match = rawDate.match(/^(\\d{2,4})\\/(\\d{1,2})\\/(\\d{1,2})$/);
  if (!match) throw new Error('無法辨識下班條日期：' + rawDate);
  let year = Number(match[1]);
  if (year < 1911) {
    const currentYear = new Date().getFullYear();
    const currentRocYear = currentYear - 1911;
    year = Math.abs(year - currentRocYear) <= 2 ? currentYear : year + 1911;
  }
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new Error('下班條日期無效：' + rawDate);
  }
  return [year, String(month).padStart(2, '0'), String(day).padStart(2, '0')].join('-');
};
schedule.date = normalizeAttendanceDate(schedule.date);`
);
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

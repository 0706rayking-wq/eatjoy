'use strict';
const fs = require('node:fs');
const path = require('node:path');

function addArchive(workflow) {
  const compare = workflow.nodes.find(n => n.name === 'NUEIP每日出勤比對');
  const reply = workflow.nodes.find(n => n.name === '回傳LINE人事群');
  if (!compare || !reply) throw new Error('Missing attendance nodes');
  workflow.nodes = workflow.nodes.filter(n => !['保存下班條照片', '恢復下班條資料', '回傳LINE相簿連結', '存檔索引寫入比對結果', '彙整部門比對結果', '僅在彙整完成後回傳'].includes(n.name));
  workflow.nodes.push({
    ...JSON.parse(JSON.stringify(compare)), id: 'attendance-photo-archive', name: '保存下班條照片', position: [900, -220],
    retryOnFail: true, maxTries: 3, waitBetweenTries: 3000, onError: 'continueRegularOutput',
    parameters: {...compare.parameters, url: compare.parameters.url,
      jsonBody: "={{ { action: 'archive_photo', messageId: $('僅處理下班條照片').first().json.event.message.id, schedule: $('整理辨識結果').first().json } }}",
      options: {timeout: 55000}}
  }, {
    id: 'attendance-restore-schedule', name: '恢復下班條資料', type: 'n8n-nodes-base.code', typeVersion: 2, position: [1120, -220],
    parameters: {jsCode: "return [{json: $('整理辨識結果').first().json}];"}
  });
  workflow.connections['整理辨識結果'] = {main: [[{node: '保存下班條照片', type: 'main', index: 0}]]};
  workflow.connections['保存下班條照片'] = {main: [[{node: '恢復下班條資料', type: 'main', index: 0}]]};
  workflow.connections['恢復下班條資料'] = {main: [[{node: 'NUEIP每日出勤比對', type: 'main', index: 0}]]};
  const archive = workflow.nodes.find(n => n.name === '保存下班條照片');
  const aggregator = {...JSON.parse(JSON.stringify(archive)), id: 'attendance-line-aggregator', name: '彙整部門比對結果', position: [1344, 0],
    retryOnFail: true, maxTries: 3, waitBetweenTries: 3000, onError: 'continueRegularOutput',
    parameters: {...archive.parameters,
      jsonBody: "={{ { action: 'aggregate_line', messageId: $('僅處理下班條照片').first().json.event.message.id, groupId: $('僅處理下班條照片').first().json.event.source.groupId, date: $('整理辨識結果').first().json.date, sheetType: $('整理辨識結果').first().json.sheet_type, lineMessages: $json.lineMessages || [], archiveText: $('保存下班條照片').first().json.lineText || '下班條照片存檔失敗，請稍後重新傳送照片。' } }}",
      options: {timeout: 55000}}
  };
  workflow.nodes.push(aggregator, {
    id: 'attendance-line-send-filter', name: '僅在彙整完成後回傳', type: 'n8n-nodes-base.code', typeVersion: 2, position: [1584, 0],
    parameters: {jsCode: `if ($json.status === 'held') return [];
if ($json.status === 'send' && $json.lineText) return [{json: {lineText: String($json.lineText)}}];
const comparison = $('NUEIP每日出勤比對').first().json;
const schedule = $('整理辨識結果').first().json;
const lines = Array.isArray(comparison.lineMessages) ? comparison.lineMessages.map(String) : [];
if (!lines.length) {
  const displayDate = String(schedule.date || '').replace(/^\\d{4}-/, '').replace('-', '/');
  lines.push('【' + displayDate + ' 下班條比對】\\n比對服務暫時無回應，請稍後重新傳送這張照片。');
}
const archiveText = $('保存下班條照片').first().json.lineText || '下班條照片存檔失敗，請稍後重新傳送照片。';
return [{json: {lineText: lines.join('\\n') + '\\n\\n' + archiveText}}];`}
  });
  reply.position = [1808, 0];
  reply.parameters.jsonBody = "={{ { to: $('僅處理下班條照片').first().json.event.source.groupId, messages: [{ type: 'text', text: $json.lineText }] } }}";
  workflow.connections['彙整部門比對結果'] = {main: [[{node: '僅在彙整完成後回傳', type: 'main', index: 0}]]};
  workflow.connections['僅在彙整完成後回傳'] = {main: [[{node: '回傳LINE人事群', type: 'main', index: 0}]]};
  delete workflow.connections['回傳LINE人事群'];
  workflow.nodes.push({...JSON.parse(JSON.stringify(archive)), id: 'attendance-index-result', name: '存檔索引寫入比對結果', position: [1344, -400],
    parameters: {...archive.parameters, jsonBody: "={{ { action: 'archive_result', messageId: $('僅處理下班條照片').first().json.event.message.id, result: { status: $json.status, normalCount: $json.normalCount, lineMessages: $json.lineMessages || [] } } }}"}});
  workflow.connections['NUEIP每日出勤比對'].main[0] = workflow.connections['NUEIP每日出勤比對'].main[0].filter(c => c.node !== '存檔索引寫入比對結果');
  workflow.connections['NUEIP每日出勤比對'].main[0] = workflow.connections['NUEIP每日出勤比對'].main[0].filter(c => c.node !== '回傳LINE人事群' && c.node !== '彙整部門比對結果');
  workflow.connections['NUEIP每日出勤比對'].main[0].push({node: '彙整部門比對結果', type: 'main', index: 0});
  workflow.connections['NUEIP每日出勤比對'].main[0].push({node: '存檔索引寫入比對結果', type: 'main', index: 0});
  return workflow;
}

if (require.main === module) {
  const target = path.join(__dirname, 'line-hr-attendance-trial.json');
  fs.writeFileSync(target, JSON.stringify(addArchive(JSON.parse(fs.readFileSync(target, 'utf8'))), null, 2) + '\n');
}
module.exports = {addArchive};

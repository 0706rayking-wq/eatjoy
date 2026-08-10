'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'api', 'little-thunder-assistant-core.js'), 'utf8');
const core = source.match(/\/\/ N8N_CORE_START\n([\s\S]*?)\/\/ N8N_CORE_END/)[1].trim();

const wrapper = `
${core}

const state = ensureState($getWorkflowStaticData('global'));
const input = $input.first().json;
const messages = [];

if (Array.isArray(input.body?.events)) {
  for (const event of input.body.events) {
    if (event?.source?.groupId) state.groupId = event.source.groupId;
    if (event?.type !== 'message' || event?.message?.type !== 'text') continue;
    const reply = parseAssistantCommand(event.message.text, state, new Date());
    if (reply) messages.push(reply);
  }
} else {
  const now = new Date();
  const memoMessage = buildDueMemos(state, now);
  const monthlyMessage = buildMonthlyReminder(state, now);
  if (memoMessage) messages.push(memoMessage);
  if (monthlyMessage) messages.push(monthlyMessage);
}

if (!messages.length || !state.groupId) return [];

return [{
  json: {
    linePayload: {
      to: state.groupId,
      messages: messages.slice(0, 5).map((text) => ({ type: 'text', text }))
    }
  }
}];
`.trim();

const workflow = {
  name: '小雷神－人事提醒助理',
  nodes: [
    {
      parameters: {
        httpMethod: 'POST',
        path: 'little-thunder-assistant',
        authentication: 'headerAuth',
        options: {}
      },
      id: '74be1873-f591-47fd-ac4b-8db06b967d15',
      name: '小雷神LINE入口',
      type: 'n8n-nodes-base.webhook',
      typeVersion: 2.1,
      position: [0, 0],
      webhookId: 'cff738b9-155f-409b-8886-e744d2a25dda',
      credentials: {
        httpHeaderAuth: {
          id: '3MgQHeI5cuvePCWR',
          name: 'Header Auth account'
        }
      }
    },
    {
      parameters: {
        rule: {
          interval: [
            {
              field: 'cronExpression',
              expression: '0 9 * * *'
            }
          ]
        }
      },
      id: '0b6a7dde-ff66-4a78-91c5-49af42fef51d',
      name: '每日09點提醒',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [0, 240]
    },
    {
      parameters: {
        jsCode: wrapper
      },
      id: '9551e615-eb3b-4842-a296-c23497d84c88',
      name: '辨識並保存小雷神任務',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [320, 120]
    },
    {
      parameters: {
        method: 'POST',
        url: 'https://api.line.me/v2/bot/message/push',
        authentication: 'genericCredentialType',
        genericAuthType: 'httpHeaderAuth',
        sendBody: true,
        specifyBody: 'json',
        jsonBody: '={{ $json.linePayload }}',
        options: {}
      },
      id: 'fe64007c-4e9c-43d7-af8b-52d8d05948c1',
      name: '回傳小雷神結果',
      type: 'n8n-nodes-base.httpRequest',
      typeVersion: 4.4,
      position: [640, 120],
      credentials: {
        httpHeaderAuth: {
          id: 'eqZPgNeJ2WPXRyVW',
          name: 'Header Auth account 2'
        }
      }
    }
  ],
  connections: {
    小雷神LINE入口: {
      main: [[{ node: '辨識並保存小雷神任務', type: 'main', index: 0 }]]
    },
    每日09點提醒: {
      main: [[{ node: '辨識並保存小雷神任務', type: 'main', index: 0 }]]
    },
    辨識並保存小雷神任務: {
      main: [[{ node: '回傳小雷神結果', type: 'main', index: 0 }]]
    }
  },
  pinData: {},
  settings: {
    executionOrder: 'v1',
    timezone: 'Asia/Taipei',
    binaryMode: 'separate',
    availableInMCP: false
  },
  active: false,
  tags: []
};

const target = path.join(__dirname, 'little-thunder-assistant.json');
fs.writeFileSync(target, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
console.log(target);

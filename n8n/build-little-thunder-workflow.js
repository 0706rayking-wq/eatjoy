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
let eventInput = input;
const aiOutput = input.output || null;

// Scheduled reminders do not pass through Gemini. For a Gemini execution,
// recover the untouched LINE webhook payload for all safety decisions.
if (!Array.isArray(eventInput.body?.events)) {
  try {
    const originalInput = $('小雷神LINE入口').first().json;
    if (Array.isArray(originalInput.body?.events)) eventInput = originalInput;
  } catch {}
}

if (Array.isArray(eventInput.body?.events)) {
  for (const event of eventInput.body.events) {
    if (event?.source?.groupId) state.groupId = event.source.groupId;
    if (event?.type !== 'message' || event?.message?.type !== 'text') continue;

    const rawText = String(event.message.text || '').trim();
    // A normal group conversation must never become a task merely because the
    // AI can understand it. The wake word has to exist in the original text.
    if (!rawText.includes('小雷神')) continue;
    const safetyCommand = /刪除|確認|取消/.test(rawText);
    const privacyDisabledCommand = /生日|特休/.test(rawText);
    const helpCommand = /可以做什麼|能做什麼|可用指令|功能|怎麼用|如何使用/.test(rawText);
    const reminderListCommand = /提醒清單|待提醒(?:的)?(?:任務|事項|紀錄|記錄)|(?:檢視|查看|顯示|列出).*(?:提醒|待辦)|(?:目前|現在).*(?:提醒|待辦)/.test(rawText);
    let commandText = rawText;

    // AI may normalize additions and memos, but it can never rewrite or
    // authorize deletion, confirmation, cancellation, or help commands.
    if (!safetyCommand && !privacyDisabledCommand && !helpCommand && !reminderListCommand && aiOutput?.needsClarification && aiOutput?.clarificationQuestion) {
      messages.push(['【小雷神｜需要確認】', aiOutput.clarificationQuestion].join('\\n'));
      continue;
    }

    if (!safetyCommand && !privacyDisabledCommand && !helpCommand && !reminderListCommand && typeof aiOutput?.canonicalText === 'string' && aiOutput.canonicalText.trim()) {
      commandText = aiOutput.canonicalText.trim();
      if (!commandText.includes('小雷神')) commandText = '小雷神，' + commandText;
    }

    const reply = parseAssistantCommand(commandText, state, new Date());
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

const extractorExample = JSON.stringify({
  canonicalText: '小雷神，8/26開月大會，提前7天提醒我統計請假名單',
  intent: 'memo',
  confidence: 0.95,
  needsClarification: false,
  clarificationQuestion: ''
});

const extractorPrompt = `你是LINE人事助理「小雷神」的語意理解層。只負責把使用者原話整理成既有規則可讀的標準指令，不得執行或承諾完成任何操作。

可用標準格式：
- 體檢：小雷神，新增王小明7/6體檢完成
- 保養：小雷神，製冰機8/25保養完成，每3個月保養一次
- 備忘：小雷神，8/26開月大會，提前7天提醒我統計請假名單
- 清單：小雷神，檢視目前提醒清單
一次多筆資料時，每筆各占一行並保留姓名、日期、週期與事項。

安全規則：
1. 原文含「刪除」「確認」或「取消」時，canonicalText 必須逐字等於原文，intent 填 safety_command，絕不可改寫、補字或代替確認。
2. 原文含「生日」或「特休」時，canonicalText 必須逐字等於原文，intent 填 privacy_disabled；不得改寫成備忘錄或其他任務。
3. 不得猜測姓名、日期、設備、保養週期或提醒天數。
4. 必要資料不足時，needsClarification=true，clarificationQuestion 只問一個簡短問題；canonicalText 保留原意。
5. 除體檢、設備保養外，有日期的交辦事項一律視為 memo。
6. 原文必須含「小雷神」才是有效任務；不得替一般聊天補上喚醒詞。
7. 僅輸出結構化資料，不要輸出說明文字。`;

const workflow = {
  name: '小雷神｜人事提醒助理',
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
          interval: [{ field: 'cronExpression', expression: '0 9 * * *' }]
        }
      },
      id: '0b6a7dde-ff66-4a78-91c5-49af42fef51d',
      name: '每日09點提醒',
      type: 'n8n-nodes-base.scheduleTrigger',
      typeVersion: 1.2,
      position: [0, 300]
    },
    {
      parameters: {
        text: '={{ $json.body.events[0].message.text }}',
        schemaType: 'fromJson',
        jsonSchemaExample: extractorExample,
        options: { systemPromptTemplate: extractorPrompt }
      },
      id: 'adf94be0-2109-4a42-932e-b977d8c75530',
      name: 'Gemini語意理解',
      type: '@n8n/n8n-nodes-langchain.informationExtractor',
      typeVersion: 1.2,
      position: [300, 0],
      retryOnFail: true,
      maxTries: 2,
      onError: 'continueRegularOutput'
    },
    {
      parameters: {
        modelName: 'models/gemini-3.6-flash',
        options: { temperature: 0.1 }
      },
      id: 'd9255f4d-e30c-468d-96a3-dd098567df5e',
      name: 'Google Gemini Chat Model',
      type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini',
      typeVersion: 1,
      position: [300, 180],
      credentials: {
        googlePalmApi: {
          id: 'ZpWaBKltRioEKUas',
          name: 'Google Gemini(PaLM) Api account'
        }
      }
    },
    {
      parameters: { jsCode: wrapper },
      id: '9551e615-eb3b-4842-a296-c23497d84c88',
      name: '辨識並保存小雷神任務',
      type: 'n8n-nodes-base.code',
      typeVersion: 2,
      position: [620, 150]
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
      position: [920, 150],
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
      main: [[{ node: 'Gemini語意理解', type: 'main', index: 0 }]]
    },
    'Google Gemini Chat Model': {
      ai_languageModel: [[{ node: 'Gemini語意理解', type: 'ai_languageModel', index: 0 }]]
    },
    Gemini語意理解: {
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

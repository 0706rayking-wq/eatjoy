'use strict';

const fs = require('node:fs');
const path = require('node:path');

const repoDir = path.resolve(__dirname, '..');
const learningPath = path.join(repoDir, 'local', 'review-study-output', 'google-review-reply-learning.json');
const learningFallback = {
  statistics: { trainingPairCount: 161 },
  styleRules: [
    '使用繁體中文，語氣誠懇、克制、具體，不與顧客爭辯。',
    '開頭感謝顧客撥空回饋，接著為未達期待的體驗致歉。',
    '逐項回應評論中最重要的二至四個問題，避免只寫制式道歉。',
    '說明會交由相關主管查核、檢討流程、加強教育訓練或品質把關；不得承諾尚未核准的補償。',
    '不要公開責怪或辨認特定員工，也不要否定顧客的主觀感受。',
    '涉及身體不適或食安疑慮時，表達關心並建議就醫；在未查證前不要承認餐點與症狀有直接因果。',
    '結尾感謝提醒，表達持續改善，並保留未來再次服務的機會。',
    '回覆以三至五段為原則，通常控制在繁體中文 180 至 320 字；簡短評論可以更短。',
    '不得虛構已完成的調查、改善、退款、贈送或聯絡紀錄。',
    '輸出必須標示「回覆初稿」，由主管確認後才能發布。'
  ],
  trainingPairs: [
    {
      storeKey: 'nangang', storeName: '饗麻饗辣PLUS - LaLaport南港店', stars: 1,
      review: '顧客反映食材新鮮度、湯底偏鹹，以及用餐時間提醒方式讓生日聚餐感受不佳。',
      reply: '感謝分享並致歉，逐項回應食材、湯底與服務提醒方式，說明將轉達主管檢視並加強服務教育。'
    },
    {
      storeKey: 'taichung-lalaport', storeName: '饗麻饗辣PLUS - LaLaport台中店', stars: 1,
      review: '顧客反映用餐後身體不適並質疑食材安全。',
      reply: '先關心顧客健康並建議儘早就醫，詢問用餐時間以利查核；在未查證前不直接承認因果。'
    },
    {
      storeKey: 'zhonghua', storeName: '饗麻饗辣-中華旗艦店', stars: 1,
      review: '顧客反映補餐不及、座位鄰近廁所、肉品海鮮品質與用餐後不適。',
      reply: '感謝回饋並致歉，分別回應補餐速度、座位需求與食材品質，說明將由團隊查核檢討。'
    }
  ]
};
const learning = fs.existsSync(learningPath)
  ? JSON.parse(fs.readFileSync(learningPath, 'utf8'))
  : learningFallback;

const examples = ['nangang', 'taichung-lalaport', 'zhonghua']
  .map((storeKey) => learning.trainingPairs.find((pair) => pair.storeKey === storeKey))
  .filter(Boolean)
  .map((pair, index) => [
    `範例${index + 1}（${pair.storeName}／${pair.stars}星）`,
    `評論：${pair.review.slice(0, 700)}`,
    `既有店家回覆：${pair.reply.slice(0, 700)}`
  ].join('\n'))
  .join('\n\n');

const styleRules = learning.styleRules.map((rule, index) => `${index + 1}. ${rule}`).join('\n');
const systemPrompt = `你是饗麻饗辣 Google 評論回覆助理。你已參考南港店、台中 LaLaport 店、中華店共 ${learning.statistics.trainingPairCount} 組低星評論與既有回覆。
任務：根據本次完整評論原文，擬定一份主管可審核的繁體中文回覆初稿。必須針對評論中實際提到的 2～4 個問題具體回應，不可只套用通用道歉模板。

公司回覆風格：
${styleRules}

安全規則：
- 感謝並致歉，語氣誠懇、節制、具體，不與客人爭辯。
- 不可捏造已完成的調查、監視器查核、員工處分、退款、贈品、補償、聯絡或改善成果。
- 可寫將請主管查核、加強教育訓練或檢討流程，但不可承諾未經授權的補償。
- 不得責怪或點名員工。
- 若涉及食安、身體不適、歧視、騷擾、受傷、退款或法律爭議，riskLevel 必須是 high，並明確列入 draftNeedsReview。
- draftNeedsReview 列出主管在發布前必須確認的具體事實；不可寫空泛的「請主管確認」。
- draftReply 只輸出回覆正文，不加標題，通常 3～5 段、180～320 字。

代表性學習範例：
${examples}`;

const splitCode = `const body = $json.body || {};
const reviews = Array.isArray(body.reviews) ? body.reviews : [];
return reviews
  .filter((review) => String(review.reviewText || '').trim())
  .slice(0, 4)
  .map((review) => ({
    json: {
      date: body.date || '',
      storeName: body.storeName || '南港店',
      reviewerId: review.reviewerId || '',
      reviewer: review.reviewer || '未辨識',
      stars: Number(review.stars || 0),
      ageLabel: review.ageLabel || '',
      reviewText: String(review.reviewText || '').trim()
    }
  }));`;

const formatCode = `const review = $('準備負評原文').item.json;
const result = $json.output || $json;
const draftReply = String(result.draftReply || '').trim();
if (!draftReply) throw new Error('Gemini 未產生回覆初稿');

function wrap(value, width = 28) {
  return String(value || '').split('\\n').flatMap((line) => {
    if (!line) return [''];
    const chars = Array.from(line);
    const lines = [];
    for (let index = 0; index < chars.length; index += width) {
      lines.push(chars.slice(index, index + width).join(''));
    }
    return lines;
  });
}

const needsReview = Array.isArray(result.draftNeedsReview)
  ? result.draftNeedsReview.filter(Boolean)
  : [];
const lines = [
  \`【AI回覆初稿｜\${review.storeName}】\`,
  \`評論者：\${review.reviewer}\`,
  \`星等：\${review.stars || '-'}星\`,
  \`風險：\${result.riskLevel || 'medium'}\`,
  '發布前須經主管確認',
  '────────────',
  ...wrap(draftReply)
];
if (needsReview.length) {
  lines.push('', '主管應確認：', ...needsReview.flatMap((item, index) => wrap(\`\${index + 1}.\${item}\`)));
}

return [{
  json: {
    linePayload: {
      to: 'Cf47f4ae2865992470b5dc0a7c3ff3170',
      messages: [{ type: 'text', text: lines.join('\\n') }]
    }
  }
}];`;

const lineCredential = { httpHeaderAuth: { id: 'eqZPgNeJ2WPXRyVW', name: 'Header Auth account 2' } };
const workflow = {
  name: 'Google評論－本機巡檢接收',
  nodes: [
    {
      parameters: { httpMethod: 'POST', path: 'google-review-local-7ef4236b-a736-4cab-a5d7-8a873ea0d4d6', options: {} },
      type: 'n8n-nodes-base.webhook', typeVersion: 2.1, position: [0, -180],
      id: 'dfe66ab6-aa32-45b5-b2b1-806ab05a7fdd', name: '巡檢結果入口',
      webhookId: '47b6b285-0f9a-4378-8470-81a3d8aabfbb'
    },
    {
      parameters: {
        method: 'POST', url: 'https://api.line.me/v2/bot/message/push',
        authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
        sendBody: true, specifyBody: 'json',
        jsonBody: '={{ {"to":"Cf47f4ae2865992470b5dc0a7c3ff3170","messages":$json.body.lineMessageObjects.slice(0,5)} }}',
        options: {}
      },
      id: 'ada0de07-a66f-4a95-8e73-847dff45dbd6', name: '發送巡檢與截圖',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4, position: [300, -180], credentials: lineCredential
    },
    {
      parameters: { httpMethod: 'POST', path: 'google-review-draft-local-7ef4236b-a736-4cab-a5d7-8a873ea0d4d6', options: {} },
      type: 'n8n-nodes-base.webhook', typeVersion: 2.1, position: [0, 180],
      id: '58b02436-d657-4396-a1ef-17a691cbfbd0', name: '負評初稿入口',
      webhookId: '93c1c020-2495-47d4-b210-d3b65c935580'
    },
    {
      parameters: { jsCode: splitCode }, id: '8fc80849-3449-4b58-8b42-1f16b9c8f535',
      name: '準備負評原文', type: 'n8n-nodes-base.code', typeVersion: 2, position: [240, 180]
    },
    {
      parameters: {
        text: '={{ $json.reviewText }}', schemaType: 'fromJson',
        jsonSchemaExample: JSON.stringify({
          draftReply: '您好，感謝您撥空分享此次用餐經驗。',
          categories: ['service_attitude'],
          draftNeedsReview: ['當日服務人員與現場處理經過'],
          riskLevel: 'medium'
        }),
        options: { systemPromptTemplate: systemPrompt }
      },
      id: '7cb78a9a-0a97-49fa-bd6a-13fa3ab33ae0', name: 'Gemini依評論擬稿',
      type: '@n8n/n8n-nodes-langchain.informationExtractor', typeVersion: 1.2,
      position: [500, 180], retryOnFail: true, maxTries: 2
    },
    {
      parameters: { modelName: 'models/gemini-3.6-flash', options: { temperature: 0.25 } },
      id: 'acb6eef3-ff6a-4448-8046-090af3b46a7b', name: 'Google Gemini回覆模型',
      type: '@n8n/n8n-nodes-langchain.lmChatGoogleGemini', typeVersion: 1, position: [500, 380],
      credentials: { googlePalmApi: { id: 'ZpWaBKltRioEKUas', name: 'Google Gemini(PaLM) Api account' } }
    },
    {
      parameters: { jsCode: formatCode }, id: '5a4de464-3874-48bb-92ce-95630589933a',
      name: '整理AI回覆初稿', type: 'n8n-nodes-base.code', typeVersion: 2, position: [760, 180]
    },
    {
      parameters: {
        method: 'POST', url: 'https://api.line.me/v2/bot/message/push',
        authentication: 'genericCredentialType', genericAuthType: 'httpHeaderAuth',
        sendBody: true, specifyBody: 'json', jsonBody: '={{ $json.linePayload }}', options: {}
      },
      id: '17240274-61d7-4bb2-a425-62b8379a551d', name: '發送AI回覆初稿',
      type: 'n8n-nodes-base.httpRequest', typeVersion: 4.4, position: [1020, 180], credentials: lineCredential
    }
  ],
  pinData: {},
  connections: {
    '巡檢結果入口': { main: [[{ node: '發送巡檢與截圖', type: 'main', index: 0 }]] },
    '負評初稿入口': { main: [[{ node: '準備負評原文', type: 'main', index: 0 }]] },
    '準備負評原文': { main: [[{ node: 'Gemini依評論擬稿', type: 'main', index: 0 }]] },
    'Google Gemini回覆模型': { ai_languageModel: [[{ node: 'Gemini依評論擬稿', type: 'ai_languageModel', index: 0 }]] },
    'Gemini依評論擬稿': { main: [[{ node: '整理AI回覆初稿', type: 'main', index: 0 }]] },
    '整理AI回覆初稿': { main: [[{ node: '發送AI回覆初稿', type: 'main', index: 0 }]] }
  },
  active: false,
  settings: {
    executionOrder: 'v1', binaryMode: 'separate', availableInMCP: false,
    timeSavedMode: 'fixed', callerPolicy: 'workflowsFromSameOwner'
  },
  tags: []
};

const outputPath = path.join(__dirname, 'google-review-local-receiver.json');
fs.writeFileSync(outputPath, `${JSON.stringify(workflow, null, 2)}\n`, 'utf8');
console.log(outputPath);

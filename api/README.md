# LINE 人事 Webhook 分流器

`line-webhook.js` 是 LINE Developers 的新 Webhook 入口。它會：

1. 使用原始 request body 與 `x-line-signature` 驗證 LINE 簽章。
2. 僅接受指定 LINE 人事群組的圖片、文字、postback 與 join 事件。
3. 使用獨立的 Bearer Secret 將事件轉送至 n8n。

## Vercel 環境變數

- `LINE_CHANNEL_SECRET`
- `LINE_HR_GROUP_ID`
- `N8N_RELAY_URL`
- `N8N_RELAY_SECRET`

所有值都必須設在 Vercel Project Settings 的 Environment Variables；禁止寫入
GitHub、前端 JavaScript、Apps Script 原始碼或 n8n 一般文字欄位。

## 切換順序

1. 在 n8n 建立具 Header Auth 的 Webhook，尚不發布。
2. 將 n8n production webhook URL 與 relay secret 設入 Vercel。
3. 部署並用簽章測試確認 Vercel → n8n 成功。
4. 將 LINE Developers Webhook URL 改為
   `https://<eatjoy-domain>/api/line-webhook`，執行 Verify。
5. 確認舊巡檢推播仍可正常送出後，再開始群組圖片測試。

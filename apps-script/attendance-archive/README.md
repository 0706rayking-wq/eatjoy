# 下班條照片存檔（尚未部署）

本機程式與 n8n 工作流程已修改；Apps Script 雲端專案已建立並儲存程式。Google 授權、Apps Script 部署、Vercel 環境設定、線上 n8n 更新及真實照片驗收尚未完成。

雲端專案：https://script.google.com/home/projects/1dgUhM1tx031Px8aLzzV6EkntpyDhAa-lvHtFz3_ZFLfojbK83S-wCTxr/edit

既有 n8n 正式流程：https://rayking0706.app.n8n.cloud/workflow/71jv8TYYNxIPFFHN

2026-09-18 已確認登入 n8n，現有凭證僅 Header Auth account、Header Auth account 2、Google Gemini(PaLM) Api account。未讀取或變更現有密鑰，未改動線上正式流程。

## 行為

- 辨識通過後保存照片，再繼續原本出勤比對；存檔失敗最多嘗試三次，仍會繼續比對。
- `下班條存檔 / YYYY / MM / 部門`。行政／洗滌同張照片各保存一份，未知部門進入待確認。
- 使用下班條日期，加三個日曆月計算到期日，月底截到有效日期。例如 11/30 → 次年 2/28。每天台北時間約 04:00 清理，不是精確到秒的保存承諾。
- 僅移到垃圾桶，不清空垃圾桶；垃圾桶仍可能占空間。
- 主資料夾知道連結即可檢視，子資料夾繼承；管理索引放在私人雲端硬碟，不跟相簿公開。
- LINE 回覆加入月份、部門及照片網址；每個訊息 ID 與部門只建立一份，腳本鎖避免並行重複。
- 索引包含存檔、到期及比對狀態；出勤比對完成後另寫入私人索引，寫入失敗不阻擋 LINE 回覆。
- 有限重試耗盡後 LINE 提示重新傳送；尚未建置跨日持久重試佇列。

## 上線順序

1. 使用照片擁有者帳號建立 Google Apps Script，貼入 Code.js 與 appsscript.json。
2. 在 Script Properties 設定既有 LINE_CHANNEL_ACCESS_TOKEN。不得貼入對話或版本庫。
3. 執行 setupArchive，完成 Google 授權。此函式建立公開唯讀照片資料夾、私人索引及每日到期清理觸發器；ROOT_ID、INDEX_ID 與隨機 ARCHIVE_SECRET 自動保存。執行記錄會顯示容量資訊，但不輸出密鑰。
4. 部署為網頁應用程式：執行身分為擁有者，允許任何人呼叫。程式另以 ARCHIVE_SECRET 驗證所有上傳請求。記下 /exec URL。
5. 在既有 Vercel 專案新增 ATTENDANCE_ARCHIVE_URL 及 ATTENDANCE_ARCHIVE_SECRET，後者與 Script Properties 相同。既有 HR_AUTOMATION_SECRET（或 N8N_RELAY_SECRET）繼續作為 n8n → Vercel 驗證。
6. 部署 api/hr-attendance-compare.js 與 lib/hr-attendance-archive.js。沿用既有 API 的 archive_photo / archive_result action，避免超過 Vercel Hobby 的 12 個函式上限。
7. 先備份線上 n8n 工作流程。比對本機與線上版本後套用 n8n/add-attendance-archive.js 的變更，不要盲目覆蓋線上較新流程。HTTP 存檔節點沿用出勤比對節點的 Header Auth credential。
8. 傳送一張測試照片，確認目標部門、索引、LINE 三種連結及免登入瀏覽／下載。重跑同一訊息測防重複；刻意設錯存檔端點驗證出勤比對照常執行。
9. 在獨立測試資料夾確認三個月到期邊界與垃圾桶恢復。確認 Google Drive 可用容量，再啟用正式流程。

## 本機驗證

`node tests/attendance-archive.test.js`

`node n8n/line-hr-attendance-trial.test.js`

日期、月底／閏年、部門分類、防重複、上傳後索引失敗恢復、到期清理及 API 授權有離線測試。Google 與 n8n 實際服務仍需上線驗收。

Google 官方參考：https://developers.google.com/apps-script/reference/drive/access

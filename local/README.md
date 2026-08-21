# 本機 Google 評論巡檢

此程式使用獨立 Chrome 設定檔讀取南港店當日評論，將三星以下評論裁切成圖片，透過目前 GitHub 測試分支提供 LINE 可讀取的 HTTPS 圖片網址，再把訊息送往 n8n Webhook。

設定檔 `google-review-config.json` 僅保存在執行電腦，不可提交到 GitHub。首次執行請加上 `--show-browser`，在專用 Chrome 視窗確認 Google 頁面能正常開啟；每日排程則不加此參數。

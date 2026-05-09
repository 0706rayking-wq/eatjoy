# 廚務系統 - EatJoy Kitchen System

## 開發環境

```bash
npm install
npm run dev
```

## 部署

推送到 `main` 分支後，GitHub Actions 會自動：
1. 執行 `npm run build`
2. 部署到 Firebase Hosting

## GitHub Actions 設定步驟

1. 到 Firebase Console → 專案設定 → 服務帳戶
2. 點「產生新的私密金鑰」下載 JSON
3. 到 GitHub Repository → Settings → Secrets → Actions
4. 新增 Secret：名稱 `FIREBASE_SERVICE_ACCOUNT`，內容貼上整個 JSON

## 檔案結構

```
src/
├── App.jsx                    # 主應用程式、路由
├── main.jsx                   # 入口點
├── firebase.js                # Firebase 設定（共用）
├── index.css                  # Tailwind CSS
└── components/
    ├── shared/
    │   ├── Icon.jsx           # 圖示元件
    │   ├── Ticker.jsx         # 跑馬燈
    │   ├── SignaturePad.jsx   # 簽名板
    │   └── managers.jsx       # 列表管理器
    ├── AuthPage.jsx           # 登入頁
    ├── Nav.jsx                # 導航列
    ├── ScheduleSystem.jsx     # 排班系統
    ├── MenuDisplayPage.jsx    # 菜單顯示
    ├── UnifiedRulesPage.jsx   # 守則頁面
    ├── InspectionPage.jsx     # 巡視頁面
    ├── OrderingSystem.jsx     # 點餐系統
    ├── ListDetailPage.jsx     # 列表詳細
    ├── admin/
    │   ├── AdminPage.jsx      # 管理後台
    │   └── GameAdminManager.jsx
    └── game/
        └── GameCenter.jsx     # 食研所遊戲
```

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const storesPath = path.join(__dirname, 'google-review-study-stores.json');
if (!fs.existsSync(storesPath)) {
  throw new Error(`Missing store list: ${storesPath}`);
}

const stores = JSON.parse(fs.readFileSync(storesPath, 'utf8'));
for (const store of stores) {
  console.log(`\n開始讀取：${store.name}`);
  const result = spawnSync(process.execPath, [path.join(__dirname, 'google-review-history-reader.js')], {
    stdio: 'inherit',
    windowsHide: true,
    env: {
      ...process.env,
      GOOGLE_REVIEW_STUDY_STORE_KEY: store.key,
      GOOGLE_REVIEW_STUDY_STORE_NAME: store.name,
      GOOGLE_REVIEW_STUDY_URL: store.url
    }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('\n三間分店的評論學習資料皆已更新。');

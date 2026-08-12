const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { checkGoogleReviewsWithScreenshots } = require('../api/google-review-lib');

const repoDir = path.resolve(__dirname, '..');
const configPath = process.env.GOOGLE_REVIEW_CONFIG
  ? path.resolve(process.env.GOOGLE_REVIEW_CONFIG)
  : path.join(__dirname, 'google-review-config.json');

function loadConfig() {
  if (!fs.existsSync(configPath)) throw new Error(`Missing config: ${configPath}`);
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function displayDate(value) {
  return String(value || '').replace(/^\d{4}-/, '').replace('-', '/');
}

function reportText(result, storeName) {
  const counts = result.counts || {};
  return [
    `【${displayDate(result.date)} Google評論】`,
    `店別：${storeName}`,
    `★★★★★：${counts[5] || 0}則`,
    `★★★★：${counts[4] || 0}則`,
    `★★★：${counts[3] || 0}則`,
    `★★：${counts[2] || 0}則`,
    `★：${counts[1] || 0}則`
  ].join('\n');
}

function runGit(args) {
  return execFileSync('git', args, { cwd: repoDir, encoding: 'utf8', windowsHide: true }).trim();
}

function safeAssetName(review, index) {
  const id = String(review.reviewerId || index + 1).replace(/[^a-zA-Z0-9_-]/g, '').slice(-32);
  return `${id || index + 1}.png`;
}

async function publishScreenshots(result, screenshots, config) {
  if (!screenshots.length) return [];
  const relativeDir = path.posix.join('assets', 'google-review-local', result.date);
  const outputDir = path.join(repoDir, ...relativeDir.split('/'));
  fs.mkdirSync(outputDir, { recursive: true });
  const items = [];

  for (let index = 0; index < screenshots.length; index += 1) {
    const { review, image } = screenshots[index];
    const name = safeAssetName(review, index);
    const relativePath = path.posix.join(relativeDir, name);
    fs.writeFileSync(path.join(outputDir, name), image);
    items.push({ review, relativePath });
  }

  runGit(['add', '--', relativeDir]);
  if (runGit(['diff', '--cached', '--name-only'])) {
    runGit(['commit', '-m', `Add ${result.date} Google review screenshots`]);
    runGit(['push', 'origin', runGit(['branch', '--show-current'])]);
  }
  const commit = runGit(['rev-parse', 'HEAD']);
  return items.map(({ review, relativePath }) => ({
    review,
    imageUrl: `https://raw.githubusercontent.com/${config.repository}/${commit}/${relativePath}`
  }));
}

async function sendToN8n(config, result, images) {
  const messages = [{ type: 'text', text: reportText(result, config.storeName || '南港店') }];
  if (process.argv.includes('--test')) {
    messages[0].text = `【功能測試】\n${messages[0].text}`;
  }
  for (const item of images.slice(0, 4)) {
    messages.push({ type: 'image', originalContentUrl: item.imageUrl, previewImageUrl: item.imageUrl });
  }
  const headers = { 'content-type': 'application/json' };
  if (config.n8nWebhookSecret) headers['x-eatjoy-secret'] = config.n8nWebhookSecret;
  const response = await fetch(config.n8nWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      date: result.date,
      counts: result.counts,
      total: result.total,
      lineMessageObjects: messages
    })
  });
  if (!response.ok) throw new Error(`n8n returned HTTP ${response.status}`);

  await sendDraftsToN8n(config, result);
}

async function sendDraftsToN8n(config, result) {
  const reviews = (result.negativeReviews || [])
    .filter((review) => String(review.reviewText || '').trim())
    .slice(0, 4);
  if (!reviews.length) return 0;

  const headers = { 'content-type': 'application/json' };
  if (config.n8nWebhookSecret) headers['x-eatjoy-secret'] = config.n8nWebhookSecret;
  const draftWebhookUrl = config.draftN8nWebhookUrl
    || config.n8nWebhookUrl.replace('/google-review-local-', '/google-review-draft-local-');
  const draftResponse = await fetch(draftWebhookUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      date: result.date,
      messageType: 'google_review_reply_requests',
      storeName: config.storeName || '南港店',
      reviews: reviews.map(({ reviewerId, reviewer, stars, ageLabel, reviewText }) => ({
        reviewerId,
        reviewer,
        stars,
        ageLabel,
        reviewText
      }))
    })
  });
  if (!draftResponse.ok) throw new Error(`n8n draft delivery returned HTTP ${draftResponse.status}`);
  return reviews.length;
}

async function main() {
  const config = loadConfig();
  const dateArgIndex = process.argv.indexOf('--date');
  const requestedDate = dateArgIndex >= 0 ? String(process.argv[dateArgIndex + 1] || '') : '';
  if (requestedDate) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(requestedDate)) throw new Error('--date must use YYYY-MM-DD');
    const today = new Date(`${new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date())}T12:00:00+08:00`);
    const target = new Date(`${requestedDate}T12:00:00+08:00`);
    const ageDays = Math.round((today.getTime() - target.getTime()) / 86400000);
    if (ageDays < 0 || ageDays > 7) throw new Error('--date supports today through 7 days ago');
    process.env.GOOGLE_REVIEW_AGE_DAYS = String(ageDays);
    process.env.GOOGLE_REVIEW_REPORT_DATE = requestedDate;
  }
  const captureOnly = process.argv.includes('--capture-only');
  const draftOnly = process.argv.includes('--draft-only');
  process.env.GOOGLE_REVIEW_RUNTIME = 'local';
  process.env.GOOGLE_REVIEW_URL = config.googleReviewUrl;
  process.env.GOOGLE_CHROME_PATH = config.chromePath;
  process.env.GOOGLE_REVIEW_PROFILE_DIR = config.chromeProfileDir;
  process.env.GOOGLE_REVIEW_HEADLESS = process.argv.includes('--show-browser') ? 'false' : 'true';
  const result = await checkGoogleReviewsWithScreenshots();
  const negativeReviews = (result.negativeReviews || []).slice(0, 4);
  if (draftOnly) {
    const sent = await sendDraftsToN8n(config, result);
    console.log(`${result.date}: sent ${sent} review draft(s)`);
    return;
  }
  if (captureOnly) {
    console.log(reportText(result, config.storeName || '南港店'));
    if (result.debugCards) console.log(JSON.stringify(result.debugCards, null, 2));
    if (process.argv.includes('--test-screenshot')) {
      const testDir = path.join(__dirname, 'test-output', result.date);
      fs.mkdirSync(testDir, { recursive: true });
      for (let index = 0; index < result.negativeScreenshots.length; index += 1) {
        const item = result.negativeScreenshots[index];
        const output = path.join(testDir, safeAssetName(item.review, index));
        fs.writeFileSync(output, item.image);
        console.log(`截圖：${output}`);
      }
    }
    console.log(`擷取完成：${result.total} 則，三星以下 ${negativeReviews.length} 則`);
    return;
  }
  const images = await publishScreenshots(result, result.negativeScreenshots, config);
  await sendToN8n(config, result, images);
  console.log(`${result.date}: sent ${result.total} reviews, ${negativeReviews.length} negative`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exitCode = 1;
});

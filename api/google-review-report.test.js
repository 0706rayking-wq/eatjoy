const assert = require('node:assert/strict');
const {
  buildLineMessageObjects,
  deliverReviewDrafts,
  draftWebhookUrl,
  formatReportText,
  safePathSegment
} = require('./google-review-report')._test;

const report = {
  date: '2026-08-07',
  counts: { 5: 4, 4: 1, 3: 1, 2: 0, 1: 0 },
  negativeReviews: [{ reviewerId: '12345', reviewer: '測試評論者', stars: 3 }]
};
const text = formatReportText(report, null);
assert.equal(text.includes('【08/07 Google評論】'), true);
assert.equal(text.includes('★★★★★：4則'), true);

process.env.N8N_RELAY_SECRET = 'test-secret';
const messages = buildLineMessageObjects(
  { headers: { host: 'example.test', 'x-forwarded-proto': 'https' } },
  report,
  null
);
assert.equal(messages.length, 1);
assert.equal(messages[0].type, 'text');
assert.match(messages[0].text, /測試評論者｜3星/);
assert.match(messages[0].text, /未填寫評論文字/);
const detailed = buildLineMessageObjects({}, { ...report, negativeReviews: [{reviewer:'棋云', stars:2, ageLabel:'2 小時前', reviewText:'服務等待太久', imageUrl:'https://unused.test/image.png'}] }, null);
assert.equal(detailed.length, 1);
assert.match(detailed[0].text, /棋云｜2星｜2 小時前/);
assert.match(detailed[0].text, /服務等待太久/);
assert.doesNotMatch(detailed[0].text, /unused.test/);
const long = buildLineMessageObjects({}, { ...report, negativeReviews: [{reviewer:'長評論', stars:1, reviewText:'😀'.repeat(4000)}] }, null);
assert.ok(long.length > 1);
assert.ok(long.every(m => m.type === 'text' && m.text.length <= 5000));
assert.ok(long.map(m=>m.text).join('').includes('😀'.repeat(4000)));

const failed = buildLineMessageObjects({}, { date: '2026-08-07' }, 'blocked');
assert.equal(failed.length, 1);
assert.equal(failed[0].type, 'text');
assert.match(failed[0].text, /Google評論巡檢失敗/);
const signInFailed = buildLineMessageObjects({}, { date: '2026-10-04' }, 'GOOGLE_REVIEW_SIGNIN_REQUIRED: sign in required');
assert.match(signInFailed[0].text, /Google 要求登入/);
assert.doesNotMatch(signInFailed[0].text, /重試 3 次/);
assert.equal(formatReportText({ date: '2026-08-07' }, 'blocked'), '');

assert.equal(draftWebhookUrl({ GOOGLE_REVIEW_DRAFT_WEBHOOK_URL: 'https://example.test/drafts' }), 'https://example.test/drafts');

(async () => {
  let delivered;
  const result = await deliverReviewDrafts({
    date: '2026-08-07',
    negativeReviews: [
      { reviewerId: '12345', reviewer: '測試評論者', stars: 3, ageLabel: '1 小時前', reviewText: '服務等待太久' },
      { reviewerId: '67890', reviewer: '空白評論', stars: 2, ageLabel: '2 小時前', reviewText: '' }
    ]
  }, async (url, options) => {
    delivered = { url, options };
    return { ok: true, status: 200 };
  }, { GOOGLE_REVIEW_DRAFT_WEBHOOK_URL: 'https://example.test/drafts' });

  assert.deepEqual(result, { status: 'sent', count: 1 });
  assert.equal(delivered.url, 'https://example.test/drafts');
  const deliveredBody = JSON.parse(delivered.options.body);
  assert.equal(deliveredBody.source, 'browserbase');
  assert.equal(deliveredBody.reviews.length, 1);
  assert.equal(deliveredBody.reviews[0].reviewText, '服務等待太久');

  console.log('google-review-report tests passed');
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

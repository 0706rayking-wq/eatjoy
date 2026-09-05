const assert = require('node:assert/strict');
const {
  buildLineMessageObjects,
  deliverReviewDrafts,
  draftWebhookUrl,
  formatReportText
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
assert.equal(messages[0].type, 'text');
assert.equal(messages[1].type, 'image');
assert.equal(messages.length, 2);

const messagesWithoutReviewerId = buildLineMessageObjects(
  { headers: { host: 'example.test', 'x-forwarded-proto': 'https' } },
  {
    ...report,
    negativeReviews: [{ reviewerId: '', reviewer: '陳伯鋼', stars: 3, ageLabel: '12 小時前' }]
  },
  null
);
assert.equal(messagesWithoutReviewerId.length, 2);
assert.match(messagesWithoutReviewerId[1].originalContentUrl, /reviewKey=/);

const failed = buildLineMessageObjects({}, { date: '2026-08-07' }, 'blocked');
assert.deepEqual(failed, []);
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

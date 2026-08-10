const assert = require('node:assert/strict');
const { buildLineMessageObjects, formatReportText } = require('./google-review-report')._test;

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

const failed = buildLineMessageObjects({}, { date: '2026-08-07' }, 'blocked');
assert.deepEqual(failed, []);
assert.equal(formatReportText({ date: '2026-08-07' }, 'blocked'), '');

console.log('google-review-report tests passed');

const assert = require('node:assert/strict');
const {
  extractAgeLabel,
  isRecentAgeLabel,
  reviewSignature,
  verifyReviewSignature
} = require('./google-review-lib');

assert.equal(isRecentAgeLabel('剛剛'), true);
assert.equal(isRecentAgeLabel('18 分鐘前'), true);
assert.equal(isRecentAgeLabel('23 小時前'), true);
assert.equal(isRecentAgeLabel('1 天前'), false);
assert.equal(isRecentAgeLabel('2 days ago'), false);
assert.equal(isRecentAgeLabel('3 hours ago'), true);
assert.equal(extractAgeLabel('五星 21 小時前 最新'), '21 小時前');

const signature = reviewSignature('12345', '2026-08-07', 'secret');
assert.equal(verifyReviewSignature('12345', '2026-08-07', signature, 'secret'), true);
assert.equal(verifyReviewSignature('12345', '2026-08-06', signature, 'secret'), false);

console.log('google-review-lib tests passed');

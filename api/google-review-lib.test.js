const assert = require('node:assert/strict');
const {
  extractAgeLabel,
  isReviewEntryLabel,
  isRecentAgeLabel,
  resolveReviewUrl,
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
assert.equal(isReviewEntryLabel('Google 評論'), true);
assert.equal(isReviewEntryLabel('2,529 則 Google 評論'), true);
assert.equal(isReviewEntryLabel('查看所有 Google 評論'), true);
assert.equal(isReviewEntryLabel('2,529 Google reviews'), true);
assert.equal(isReviewEntryLabel('2,529 則評論'), true);
assert.equal(isReviewEntryLabel('評論'), true);
assert.equal(isReviewEntryLabel('撰寫評論'), false);
assert.equal(isReviewEntryLabel('查看針對王小明的評論可使用的評論選項'), false);
assert.match(resolveReviewUrl('https://share.google/tHH2TSFPQhsFBcnuL'), /^https:\/\/www\.google\.com\/maps\?/);
assert.equal(resolveReviewUrl('https://www.google.com/search?q=test'), 'https://www.google.com/search?q=test');
assert.match(resolveReviewUrl('not-a-url'), /^https:\/\/www\.google\.com\/maps\?/);

const signature = reviewSignature('12345', '2026-08-07', 'secret');
assert.equal(verifyReviewSignature('12345', '2026-08-07', signature, 'secret'), true);
assert.equal(verifyReviewSignature('12345', '2026-08-06', signature, 'secret'), false);

console.log('google-review-lib tests passed');

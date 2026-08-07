const crypto = require('node:crypto');
const {
  buildReviewImageUrl,
  checkGoogleReviews
} = require('./google-review-lib');

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const secret = String(process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '').trim();
    const actual = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
    if (!secret || !safeEqual(actual, secret)) {
      return response.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    const result = await checkGoogleReviews();
    return response.status(200).json({
      status: 'ok',
      ...result,
      negativeReviews: result.negativeReviews.map((review) => ({
        ...review,
        imageUrl: buildReviewImageUrl(request, review, result.date, secret)
      }))
    });
  } catch (error) {
    console.error('Google review check failed', error);
    return response.status(500).json({
      status: 'error',
      message: String(error.message || 'Google review check failed').slice(0, 300)
    });
  }
};

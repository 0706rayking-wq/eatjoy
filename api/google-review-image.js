const {
  screenshotReview,
  verifyReviewSignature
} = require('./google-review-lib');

module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    response.setHeader('Allow', 'GET');
    return response.status(405).send('Method not allowed');
  }

  try {
    const reviewerId = String(request.query.reviewerId || '').trim();
    const date = String(request.query.date || '').trim();
    const signature = String(request.query.signature || '').trim();
    const secret = String(process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '').trim();
    if (!reviewerId || !/^\d+$/.test(reviewerId) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return response.status(400).send('Invalid screenshot request');
    }
    if (!secret || !verifyReviewSignature(reviewerId, date, signature, secret)) {
      return response.status(403).send('Forbidden');
    }

    const image = await screenshotReview(reviewerId);
    response.setHeader('Content-Type', 'image/png');
    response.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300');
    return response.status(200).send(image);
  } catch (error) {
    console.error('Google review screenshot failed', error);
    return response.status(500).send('Screenshot failed');
  }
};

const crypto = require('node:crypto');
const {
  buildReviewImageUrl,
  checkGoogleReviews,
  taipeiDate
} = require('./google-review-lib');

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function authorize(request) {
  const secret = String(process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '').trim();
  const actual = String(request.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return Boolean(secret) && safeEqual(actual, secret);
}

function displayDate(value) {
  return String(value || taipeiDate()).replace(/^\d{4}-/, '').replace('-', '/');
}

function formatReportText(result, error) {
  const date = displayDate(result?.date);
  if (error) {
    return [
      `【${date} Google評論】`,
      '店別：南港店',
      '巡檢失敗，請主管人工確認'
    ].join('\n');
  }
  const counts = result?.counts || {};
  return [
    `【${date} Google評論】`,
    '店別：南港店',
    `★★★★★：${counts[5] || 0}則`,
    `★★★★：${counts[4] || 0}則`,
    `★★★：${counts[3] || 0}則`,
    `★★：${counts[2] || 0}則`,
    `★：${counts[1] || 0}則`
  ].join('\n');
}

function buildLineMessageObjects(request, result, error) {
  // The cloud fallback cannot access the signed-in Google session used by the
  // local screenshot patrol. Suppress its expected failure instead of sending
  // a false alarm immediately before the local patrol succeeds.
  if (error) return [];
  const messages = [{ type: 'text', text: formatReportText(result, null) }];
  const secret = String(process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '').trim();
  for (const review of (result?.negativeReviews || []).filter((item) => item.reviewerId).slice(0, 4)) {
    const imageUrl = buildReviewImageUrl(request, review, result.date, secret);
    messages.push({
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl
    });
  }
  return messages;
}

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ status: 'error', message: 'Method not allowed' });
  }
  if (!authorize(request)) {
    return response.status(401).json({ status: 'error', message: 'Unauthorized' });
  }

  try {
    const result = await checkGoogleReviews();
    return response.status(200).json({
      status: 'ok',
      ...result,
      lineMessageObjects: buildLineMessageObjects(request, result, null)
    });
  } catch (error) {
    const message = String(error.message || 'Google review check failed').slice(0, 300);
    console.error('Google review report failed', message);
    return response.status(200).json({
      status: 'degraded',
      date: taipeiDate(),
      error: message,
      lineMessageObjects: buildLineMessageObjects(request, { date: taipeiDate() }, message)
    });
  }
};

module.exports._test = { buildLineMessageObjects, formatReportText };

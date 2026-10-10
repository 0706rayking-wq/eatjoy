const crypto = require('node:crypto');
const {
  checkGoogleReviews,
  taipeiDate
} = require('./google-review-lib');

function safePathSegment(value) {
  return String(value || 'review').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
}

async function uploadReviewScreenshots(result) {
  const token = String(process.env.BLOB_READ_WRITE_TOKEN || '').trim();
  if (!token) throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  const { put } = await import('@vercel/blob');
  const screenshots = result?.negativeScreenshots || [];
  const uploaded = [];
  for (let index = 0; index < screenshots.length; index += 1) {
    const { review, image } = screenshots[index];
    const key = safePathSegment(review.reviewerId || review.reviewer || index + 1);
    const blob = await put(`google-reviews/${result.date}/${index + 1}-${key}.png`, image, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'image/png',
      cacheControlMaxAge: 86400,
      token
    });
    uploaded.push({ review, imageUrl: blob.url });
  }
  return uploaded;
}

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
  if (error) return '';
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
  if (error) {
    return [{
      type: 'text',
      text: [
        `【${displayDate(result?.date)} Google評論巡檢失敗】`,
        String(error).includes('GOOGLE_REVIEW_SIGNIN_REQUIRED')
          ? 'Google 要求登入才能讀取完整評論；請更新評論專用 Google 登入狀態。'
          : 'Google 評論擷取在自動重試後仍未完成。',
        `原因：${String(error).slice(0, 180)}`
      ].join('\n')
    }];
  }
  const sections = [formatReportText(result, null)];
  for (const review of result?.negativeReviews || []) {
    sections.push([
      `【${review.reviewer || '未知評論者'}｜${review.stars}星｜${review.ageLabel || ''}】`,
      String(review.reviewText || '').trim() || '（未填寫評論文字）',
      ...(review.hasPhotos ? ['備註：有附圖'] : [])
    ].join('\n'));
  }
  const text = sections.join('\n\n');
  const messages = [];
  for (let offset = 0; offset < text.length;) {
    let end = Math.min(offset + 4900, text.length);
    if (end < text.length && /[\uD800-\uDBFF]/.test(text[end - 1])) end -= 1;
    messages.push({ type: 'text', text: text.slice(offset, end) });
    offset = end;
  }
  return messages;
}

function draftWebhookUrl(environment = process.env) {
  return String(environment.GOOGLE_REVIEW_DRAFT_WEBHOOK_URL
    || 'https://rayking0706.app.n8n.cloud/webhook/google-review-draft-local-7ef4236b-a736-4cab-a5d7-8a873ea0d4d6').trim();
}

async function deliverReviewDrafts(result, fetchImpl = globalThis.fetch, environment = process.env) {
  const reviews = (result?.negativeReviews || [])
    .filter((review) => String(review.reviewText || '').trim())
    .slice(0, 4);
  if (!reviews.length) return { status: 'skipped', count: 0 };
  if (typeof fetchImpl !== 'function') throw new Error('Draft delivery fetch is unavailable');

  const payload = {
    date: result.date,
    messageType: 'google_review_reply_requests',
    source: 'browserbase',
    storeName: '南港店',
    reviews: reviews.map(({ reviewerId, reviewer, stars, ageLabel, reviewText }) => ({
      reviewerId,
      reviewer,
      stars,
      ageLabel,
      reviewText
    }))
  };

  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const draftResponse = await fetchImpl(draftWebhookUrl(environment), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!draftResponse.ok) throw new Error(`n8n draft delivery returned HTTP ${draftResponse.status}`);
      return { status: 'sent', count: reviews.length };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
  throw lastError;
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
    const previewOnly = request.query?.preview === '1' || request.body?.preview === true;
    const result = await checkGoogleReviews({ includeOneDay: previewOnly });
    const screenshotDelivery = { status: 'disabled-text-only', count: 0 };
    const draftDelivery = { status: 'paused', count: 0 };
    return response.status(200).json({
      status: 'ok',
      ...result,
      negativeScreenshots: undefined,
      screenshotDelivery,
      draftDelivery,
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

module.exports._test = {
  buildLineMessageObjects,
  deliverReviewDrafts,
  draftWebhookUrl,
  formatReportText,
  safePathSegment,
  uploadReviewScreenshots
};

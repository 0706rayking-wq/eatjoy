const crypto = require('node:crypto');
const {
  buildReviewImageUrl,
  checkGoogleReviewsWithScreenshots,
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
      addRandomSuffix: false,
      allowOverwrite: true,
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
        'Browserbase 已自動重試 3 次仍無法讀取 Google 評論。',
        `原因：${String(error).slice(0, 180)}`
      ].join('\n')
    }];
  }
  const messages = [{ type: 'text', text: formatReportText(result, null) }];
  const secret = String(process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '').trim();
  for (const review of (result?.negativeReviews || []).slice(0, 4)) {
    const imageUrl = review.imageUrl || buildReviewImageUrl(request, review, result.date, secret);
    messages.push({
      type: 'image',
      originalContentUrl: imageUrl,
      previewImageUrl: imageUrl
    });
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
    const result = await checkGoogleReviewsWithScreenshots();
    let screenshotDelivery;
    try {
      const uploaded = await uploadReviewScreenshots(result);
      const urlsByReviewer = new Map(uploaded.map(({ review, imageUrl }) => [
        String(review.reviewerId || review.reviewer), imageUrl
      ]));
      result.negativeReviews = result.negativeReviews.map((review) => ({
        ...review,
        imageUrl: urlsByReviewer.get(String(review.reviewerId || review.reviewer)) || ''
      }));
      screenshotDelivery = { status: 'uploaded', count: uploaded.length };
    } catch (screenshotError) {
      console.error('Google review screenshot upload failed', screenshotError);
      screenshotDelivery = {
        status: 'fallback',
        count: 0,
        error: String(screenshotError.message || screenshotError).slice(0, 300)
      };
    }
    let draftDelivery;
    try {
      draftDelivery = await deliverReviewDrafts(result);
    } catch (draftError) {
      console.error('Google review draft delivery failed', draftError);
      draftDelivery = {
        status: 'failed',
        count: 0,
        error: String(draftError.message || draftError).slice(0, 300)
      };
    }
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

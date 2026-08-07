const crypto = require('node:crypto');

const DEFAULT_REVIEW_URL =
  'https://www.google.com/maps?hl=zh-TW&cid=10154763518669145936';
const REVIEW_CARD_SELECTOR = '.bwb7ce, .jftiEf';
const REVIEW_CONTENT_SELECTOR = '.OA1nbd, .wiI7pd';
const REVIEWER_SELECTOR = '.Vpc5Fe';

async function launchBrowser(viewport = { width: 1280, height: 1600 }) {
  const chromiumModule = await import('@sparticuz/chromium');
  const puppeteerModule = await import('puppeteer-core');
  const chromium = chromiumModule.default || chromiumModule;
  const puppeteer = puppeteerModule.default || puppeteerModule;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: viewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });
}

function isRecentAgeLabel(value) {
  const label = String(value || '').trim().toLowerCase();
  if (!label) return false;
  if (/剛剛|分鐘前|小時前/.test(label)) return true;
  if (/just now|minute[s]? ago|hour[s]? ago/.test(label)) return true;
  return false;
}

function extractAgeLabel(text) {
  const value = String(text || '');
  return value.match(/(?:剛剛|\d+\s*(?:分鐘|小時|天|週|個月|年)前)/)?.[0]
    || value.match(/(?:just now|\d+\s+(?:minute|hour|day|week|month|year)s? ago)/i)?.[0]
    || '';
}

function taipeiDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const read = (type) => parts.find((part) => part.type === type)?.value;
  return `${read('year')}-${read('month')}-${read('day')}`;
}

function resolveReviewUrl(value) {
  const configured = String(value || '').trim();
  if (!configured) return DEFAULT_REVIEW_URL;
  try {
    const url = new URL(configured);
    if (url.hostname.toLowerCase() === 'share.google') return DEFAULT_REVIEW_URL;
  } catch {
    return DEFAULT_REVIEW_URL;
  }
  return configured;
}

function isReviewEntryLabel(value) {
  const label = String(value || '').replace(/\s+/g, ' ').trim();
  if (/撰寫評論|評論可使用的評論選項|write a review|review options/i.test(label)) return false;
  return /google\s*評論/i.test(label)
    || /google\s*reviews?/i.test(label)
    || /(?:^|\s|[^\p{L}])(?:[\d,]+\s*則\s*)?評論(?:$|\s)/u.test(label)
    || /(?:^|\s)(?:[\d,]+\s+)?reviews?(?:$|\s)/i.test(label);
}

async function clickReviewEntry(page) {
  return page.evaluate(() => {
    const element = [...document.querySelectorAll('button, a, [role="button"]')]
      .find((candidate) => {
        const label = `${candidate.textContent || ''} ${candidate.getAttribute('aria-label') || ''}`
          .replace(/\s+/g, ' ')
          .trim();
        if (/撰寫評論|評論可使用的評論選項|write a review|review options/i.test(label)) return false;
        return /google\s*評論/i.test(label)
          || /google\s*reviews?/i.test(label)
          || /(?:^|\s|[^\p{L}])(?:[\d,]+\s*則\s*)?評論(?:$|\s)/u.test(label)
          || /(?:^|\s)(?:[\d,]+\s+)?reviews?(?:$|\s)/i.test(label);
      });
    if (!element) return false;
    element.click();
    return true;
  });
}

async function describeReviewPage(page) {
  const details = await page.evaluate(() => ({
    title: document.title,
    labels: [...document.querySelectorAll('button, a, [role="button"]')]
      .map((candidate) => `${candidate.textContent || ''} ${candidate.getAttribute('aria-label') || ''}`
        .replace(/\s+/g, ' ')
        .trim())
      .filter(Boolean)
      .slice(0, 12)
  }));
  return `url=${page.url()} title=${details.title || '-'} labels=${details.labels.join(' | ') || '-'}`;
}

async function ensureReviewDialog(page) {
  if (await page.$(REVIEW_CARD_SELECTOR)) return;

  const clicked = await clickReviewEntry(page);
  if (!clicked) {
    throw new Error(`Google review entry button was not found; ${await describeReviewPage(page)}`);
  }
  try {
    await page.waitForSelector(REVIEW_CARD_SELECTOR, { timeout: 20000 });
  } catch (error) {
    throw new Error(`Google review dialog did not open: ${error.message}`);
  }
}

async function openLatestReviews(page) {
  const reviewUrl = resolveReviewUrl(process.env.GOOGLE_REVIEW_URL);
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      + '(KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.7' });
  await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'light' }]);
  await page.goto(reviewUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await ensureReviewDialog(page);
  const latestWasVisible = await page.evaluate(() => {
    const latest = [...document.querySelectorAll('[role="radio"], [role="menuitemradio"]')]
      .find((element) => /^(最新|newest)$/i.test((element.textContent || '').trim()));
    if (!latest) return false;
    latest.click();
    return true;
  });
  if (!latestWasVisible) {
    const openedSort = await page.evaluate(() => {
      const sort = [...document.querySelectorAll('button, [role="button"]')]
        .find((element) => /排序評論|sort reviews/i.test(
          `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`
        ));
      if (!sort) return false;
      sort.click();
      return true;
    });
    if (!openedSort) throw new Error('Google review sort button was not found');
    await page.waitForFunction(() => [...document.querySelectorAll('[role="radio"], [role="menuitemradio"]')]
      .some((element) => /^(最新|newest)$/i.test((element.textContent || '').trim())), { timeout: 15000 });
    await page.evaluate(() => {
      const latest = [...document.querySelectorAll('[role="radio"], [role="menuitemradio"]')]
        .find((element) => /^(最新|newest)$/i.test((element.textContent || '').trim()));
      latest.click();
    });
  }
  await new Promise((resolve) => setTimeout(resolve, 900));
}

async function readCards(page) {
  return page.$$eval(REVIEW_CARD_SELECTOR, (cards) => cards.map((card) => {
    const text = card.innerText || '';
    const ratingAlt = [...card.querySelectorAll('img, [role="img"], [aria-label]')]
      .map((image) => image.getAttribute('alt') || image.getAttribute('aria-label') || '')
      .find((alt) => /(?:獲評為|rated|顆星|stars?)\D*[1-5](?:\.0)?|[1-5](?:\.0)?\D*(?:顆星|stars?)/i.test(alt)) || '';
    const stars = Number(ratingAlt.match(/([1-5](?:\.0)?)/)?.[1] || 0);
    const reviewerLink = [...card.querySelectorAll('a')]
      .find((link) => /\/maps\/contrib\/\d+/.test(link.href || ''));
    const reviewerId = (reviewerLink?.href || '').match(/\/maps\/contrib\/(\d+)/)?.[1] || '';
    const reviewer = card.querySelector('.Vpc5Fe, .d4r55')?.textContent?.trim()
      || reviewerLink?.textContent?.trim()
      || '未知評論者';
    const ageLabel = text.match(/(?:剛剛|\d+\s*(?:分鐘|小時|天|週|個月|年)前)/)?.[0]
      || text.match(/(?:just now|\d+\s+(?:minute|hour|day|week|month|year)s? ago)/i)?.[0]
      || '';
    return { reviewerId, reviewer, stars, ageLabel };
  }));
}

async function scrollReviewList(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.bwb7ce, .jftiEf');
    let container = card?.parentElement;
    while (container) {
      const style = getComputedStyle(container);
      if (/auto|scroll/.test(style.overflowY) && container.scrollHeight > container.clientHeight) {
        container.scrollTop += Math.max(700, container.clientHeight * 0.8);
        return true;
      }
      container = container.parentElement;
    }
    return false;
  });
}

async function loadRecentReviews(page) {
  const reviews = new Map();
  let stableRounds = 0;
  let previousSize = 0;

  for (let round = 0; round < 16; round += 1) {
    const cards = await readCards(page);
    for (const card of cards) {
      if (!isRecentAgeLabel(card.ageLabel)) continue;
      const key = card.reviewerId || `${card.reviewer}|${card.stars}|${card.ageLabel}`;
      reviews.set(key, card);
    }

    const hasOlderReview = cards.some((card) => card.ageLabel && !isRecentAgeLabel(card.ageLabel));
    stableRounds = reviews.size === previousSize ? stableRounds + 1 : 0;
    if (hasOlderReview && stableRounds >= 1) break;
    previousSize = reviews.size;
    if (!await scrollReviewList(page)) break;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return [...reviews.values()];
}

async function checkGoogleReviews() {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await openLatestReviews(page);
    const reviews = await loadRecentReviews(page);
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const review of reviews) {
      if (counts[review.stars] !== undefined) counts[review.stars] += 1;
    }
    return {
      date: taipeiDate(),
      total: reviews.length,
      counts,
      negativeReviews: reviews.filter((review) => review.stars > 0 && review.stars <= 3)
    };
  } finally {
    await browser.close();
  }
}

function reviewSignature(reviewerId, date, secret) {
  return crypto.createHmac('sha256', secret)
    .update(`${reviewerId}|${date}`)
    .digest('hex');
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(String(left || ''));
  const rightBuffer = Buffer.from(String(right || ''));
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function verifyReviewSignature(reviewerId, date, signature, secret) {
  return safeEqual(reviewSignature(reviewerId, date, secret), signature);
}

function buildReviewImageUrl(request, review, date, secret) {
  const protocol = String(request.headers['x-forwarded-proto'] || 'https').split(',')[0].trim();
  const host = String(request.headers['x-forwarded-host'] || request.headers.host || '').split(',')[0].trim();
  const query = new URLSearchParams({
    reviewerId: review.reviewerId,
    date,
    signature: reviewSignature(review.reviewerId, date, secret)
  });
  return `${protocol}://${host}/api/google-review-image?${query.toString()}`;
}

async function findReviewCard(page, reviewerId) {
  for (let round = 0; round < 18; round += 1) {
    const cards = await page.$$(REVIEW_CARD_SELECTOR);
    for (const card of cards) {
      const id = await card.evaluate((element) => {
        const link = [...element.querySelectorAll('a')]
          .find((candidate) => /\/maps\/contrib\/\d+/.test(candidate.href || ''));
        return (link?.href || '').match(/\/maps\/contrib\/(\d+)/)?.[1] || '';
      });
      if (id === reviewerId) return card;
    }
    if (!await scrollReviewList(page)) break;
    await new Promise((resolve) => setTimeout(resolve, 450));
  }
  return null;
}

async function screenshotReview(reviewerId) {
  const browser = await launchBrowser({ width: 1280, height: 1800 });
  try {
    const page = await browser.newPage();
    await openLatestReviews(page);
    const card = await findReviewCard(page, reviewerId);
    if (!card) throw new Error('Review is no longer available');

    await card.evaluate((element) => {
      element.scrollIntoView({ block: 'center', inline: 'nearest' });
      const more = [...element.querySelectorAll('[role="button"], button')]
        .find((button) => /更多|閱讀.*其他評論|more/i.test(
          `${button.textContent || ''} ${button.getAttribute('aria-label') || ''}`
        ));
      if (more) more.click();
    });
    await new Promise((resolve) => setTimeout(resolve, 250));

    await card.evaluate((element) => {
      const cardRect = element.getBoundingClientRect();
      const action = [...element.querySelectorAll('[aria-label]')]
        .find((candidate) => /^(回應|分享|like|share)/i.test(candidate.getAttribute('aria-label') || ''));
      const content = element.querySelector('.OA1nbd, .wiI7pd');
      const photos = [...element.querySelectorAll('button[aria-label*="評論中的第"]')];
      const contentBottom = content?.getBoundingClientRect().bottom || cardRect.top + 130;
      const photoBottom = photos.reduce(
        (bottom, photo) => Math.max(bottom, photo.getBoundingClientRect().bottom),
        contentBottom
      );
      const actionTop = action?.getBoundingClientRect().top || photoBottom + 8;
      const targetHeight = Math.max(120, Math.ceil(Math.min(actionTop - 6, photoBottom + 8) - cardRect.top));
      element.style.height = `${targetHeight}px`;
      element.style.overflow = 'hidden';
      element.style.boxSizing = 'border-box';
    });

    return card.screenshot({ type: 'png' });
  } finally {
    await browser.close();
  }
}

module.exports = {
  buildReviewImageUrl,
  checkGoogleReviews,
  extractAgeLabel,
  isReviewEntryLabel,
  isRecentAgeLabel,
  resolveReviewUrl,
  reviewSignature,
  screenshotReview,
  taipeiDate,
  verifyReviewSignature
};

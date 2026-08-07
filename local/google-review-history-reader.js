const fs = require('node:fs');
const path = require('node:path');
const { launchBrowser, openLatestReviews, taipeiDate } = require('../api/google-review-lib');

const configPath = path.join(__dirname, 'google-review-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const CARD_SELECTOR = '.jftiEf, .bwb7ce';

function isWithinOneYear(ageLabel) {
  const label = String(ageLabel || '').toLowerCase();
  if (!label) return false;
  if (/年(?:前| ago)|years? ago/.test(label)) return false;
  return /分鐘前|小時前|天前|週前|星期前|個月前|月前|剛剛|minute|hour|day|week|month|just now/.test(label);
}

function reachedOneYear(ageLabel) {
  return /年(?:前| ago)|years? ago/i.test(String(ageLabel || ''));
}

async function readCards(page) {
  return page.$$eval(CARD_SELECTOR, (cards) => cards.map((card) => {
    const text = card.innerText || '';
    const ratingLabel = card.querySelector('.kvMYJc')?.getAttribute('aria-label')
      || [...card.querySelectorAll('[aria-label]')]
        .map((element) => element.getAttribute('aria-label') || '')
        .find((value) => /[1-5].*(?:星|star)|(?:星|star).*[1-5]/i.test(value))
      || '';
    const stars = Number(ratingLabel.match(/([1-5](?:\.0)?)/)?.[1] || 0);
    const reviewer = card.querySelector('.d4r55, .Vpc5Fe')?.textContent?.trim() || '未知評論者';
    const ageLabel = card.querySelector('.rsqaWe')?.textContent?.trim()
      || text.match(/(?:剛剛|\d+\s*(?:分鐘前|小時前|天前|週前|星期前|個月前|月前|年前))/)?.[0]
      || text.match(/(?:just now|\d+\s+(?:minute|hour|day|week|month|year)s? ago)/i)?.[0]
      || '';
    const ownerBlock = card.querySelector('.CDe7pd');
    const ownerReply = ownerBlock?.querySelector('.wiI7pd, .OA1nbd')?.textContent?.trim() || '';
    const ownerReplyAge = ownerBlock?.querySelector('.DZSIDd, .rsqaWe')?.textContent?.trim() || '';
    const reviewNodes = [...card.querySelectorAll('.wiI7pd, .OA1nbd')]
      .filter((node) => !ownerBlock || !ownerBlock.contains(node));
    const reviewText = reviewNodes[0]?.textContent?.trim() || '';
    const reviewId = card.getAttribute('data-review-id') || card.getAttribute('data-reviewid') || '';
    return { reviewId, reviewer, stars, ageLabel, reviewText, ownerReply, ownerReplyAge };
  }));
}

async function scrollReviewList(page) {
  return page.evaluate(() => {
    const card = document.querySelector('.jftiEf, .bwb7ce');
    let container = card?.parentElement;
    while (container) {
      const style = getComputedStyle(container);
      if (/auto|scroll/.test(style.overflowY) && container.scrollHeight > container.clientHeight) {
        const before = container.scrollTop;
        container.scrollTop = container.scrollHeight;
        return { moved: container.scrollTop > before, top: container.scrollTop, height: container.scrollHeight };
      }
      container = container.parentElement;
    }
    return { moved: false, top: 0, height: 0 };
  });
}

async function expandLoadedReviews(page) {
  await page.$$eval(CARD_SELECTOR, (cards) => {
    for (const card of cards) {
      for (const button of card.querySelectorAll('.w8nwRe, button, [role="button"]')) {
        const label = `${button.textContent || ''} ${button.getAttribute('aria-label') || ''}`.trim();
        if (button.matches('.w8nwRe') || /更多|more/i.test(label)) button.click();
      }
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 300));
}

async function sortByLowestRating(page) {
  const opened = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button, [role="button"]')]
      .find((element) => /排序評論|sort reviews/i.test(
        `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`
      ));
    button?.click();
    return Boolean(button);
  });
  if (!opened) throw new Error('找不到評論排序按鈕');
  await new Promise((resolve) => setTimeout(resolve, 500));
  const selected = await page.evaluate(() => {
    const option = [...document.querySelectorAll('[role="radio"], [role="menuitemradio"], [role="menuitem"], button')]
      .find((element) => /最低|lowest/i.test(
        `${element.textContent || ''} ${element.getAttribute('aria-label') || ''}`
      ));
    option?.click();
    return Boolean(option);
  });
  if (!selected) throw new Error('找不到「最低評分」排序選項');
  await new Promise((resolve) => setTimeout(resolve, 900));
}

async function main() {
  process.env.GOOGLE_REVIEW_RUNTIME = 'local';
  process.env.GOOGLE_REVIEW_URL = config.googleReviewUrl;
  process.env.GOOGLE_CHROME_PATH = config.chromePath;
  process.env.GOOGLE_REVIEW_PROFILE_DIR = config.chromeProfileDir;
  process.env.GOOGLE_REVIEW_HEADLESS = 'true';

  const browser = await launchBrowser({ width: 1280, height: 1600 });
  try {
    const page = await browser.newPage();
    await openLatestReviews(page);
    await sortByLowestRating(page);
    const collected = new Map();
    let highRatingRounds = 0;
    let stableRounds = 0;
    let previousCount = 0;

    for (let round = 1; round <= 160; round += 1) {
      const cards = await readCards(page);
      for (const card of cards) {
        const key = card.reviewId || `${card.reviewer}|${card.ageLabel}|${card.stars}|${card.reviewText}`;
        collected.set(key, card);
      }

      const lowCount = [...collected.values()]
        .filter((card) => isWithinOneYear(card.ageLabel) && card.stars >= 1 && card.stars <= 3).length;
      const tail = cards.slice(-8);
      highRatingRounds = tail.some((card) => card.stars >= 4) ? highRatingRounds + 1 : 0;
      stableRounds = collected.size === previousCount ? stableRounds + 1 : 0;
      previousCount = collected.size;

      if (round === 1 || round % 10 === 0) {
        console.log(`進度：已載入 ${collected.size} 則；一年內低星 ${lowCount} 則`);
      }
      if (highRatingRounds >= 2 || stableRounds >= 6) break;
      const scroll = await scrollReviewList(page);
      if (!scroll.moved && stableRounds >= 2) break;
      await new Promise((resolve) => setTimeout(resolve, 650));
    }

    await expandLoadedReviews(page);
    const finalCards = await readCards(page);
    for (const card of finalCards) {
      const key = card.reviewId || `${card.reviewer}|${card.ageLabel}|${card.stars}|${card.reviewText}`;
      collected.set(key, card);
    }

    const lowReviews = [...collected.values()]
      .filter((card) => isWithinOneYear(card.ageLabel) && card.stars >= 1 && card.stars <= 3);
    const output = {
      capturedAt: new Date().toISOString(),
      storeName: config.storeName || '南港店',
      scope: '最近一年內的 1～3 星評論（依 Google 相對日期）',
      loadedReviewCount: collected.size,
      lowReviewCount: lowReviews.length,
      ownerReplyCount: lowReviews.filter((review) => review.ownerReply).length,
      reviews: lowReviews
    };
    const outputDir = path.join(__dirname, 'review-study-output');
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, `${taipeiDate()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');
    console.log(`完成：${lowReviews.length} 則低星評論；${output.ownerReplyCount} 則有店家回覆`);
    console.log(outputPath);
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

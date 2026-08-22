function browserbaseConfig(environment = process.env) {
  return {
    apiKey: String(environment.BROWSERBASE_API_KEY || '').trim(),
    projectId: String(environment.BROWSERBASE_PROJECT_ID || '').trim(),
    contextId: String(environment.BROWSERBASE_CONTEXT_ID || '').trim(),
    region: String(environment.BROWSERBASE_REGION || 'ap-southeast-1').trim(),
    timeout: Number(environment.BROWSERBASE_SESSION_TIMEOUT || 900)
  };
}

function hasBrowserbaseConfig(environment = process.env) {
  const config = browserbaseConfig(environment);
  return Boolean(config.apiKey && config.projectId && config.contextId);
}

function buildSessionPayload(environment = process.env) {
  const config = browserbaseConfig(environment);
  if (!config.apiKey || !config.projectId || !config.contextId) {
    throw new Error('Missing Browserbase configuration');
  }
  const timeout = Number.isFinite(config.timeout)
    ? Math.max(60, Math.min(900, Math.round(config.timeout)))
    : 900;
  return {
    projectId: config.projectId,
    browserSettings: {
      timeout,
      region: config.region,
      viewport: { width: 1920, height: 1080 },
      context: {
        id: config.contextId,
        persist: true
      }
    },
    userMetadata: {
      workflow: 'nueip-hr-automation'
    }
  };
}

async function launchLocalBrowser() {
  const chromiumModule = await import('@sparticuz/chromium');
  const puppeteerModule = await import('puppeteer-core');
  const chromium = chromiumModule.default || chromiumModule;
  const puppeteer = puppeteerModule.default || puppeteerModule;
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless
  });
}

async function launchBrowser(environment = process.env, fetchImpl = globalThis.fetch) {
  if (!hasBrowserbaseConfig(environment)) return launchLocalBrowser();
  if (typeof fetchImpl !== 'function') throw new Error('Browserbase fetch is unavailable');

  const config = browserbaseConfig(environment);
  const response = await fetchImpl('https://api.browserbase.com/v1/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-BB-API-Key': config.apiKey
    },
    body: JSON.stringify(buildSessionPayload(environment))
  });
  const text = await response.text();
  let session;
  try {
    session = JSON.parse(text);
  } catch {
    session = null;
  }
  if (!response.ok || !session?.connectUrl) {
    const detail = session?.message || session?.error || text || `HTTP ${response.status}`;
    throw new Error(`Browserbase session creation failed: ${String(detail).slice(0, 180)}`);
  }

  const puppeteerModule = await import('puppeteer-core');
  const puppeteer = puppeteerModule.default || puppeteerModule;
  const browser = await puppeteer.connect({
    browserWSEndpoint: session.connectUrl,
    defaultViewport: null
  });
  browser.browserbaseSessionId = session.id;
  return browser;
}

module.exports = {
  browserbaseConfig,
  buildSessionPayload,
  hasBrowserbaseConfig,
  launchBrowser
};

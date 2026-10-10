const assert = require('node:assert/strict');
const {
  browserbaseConfig,
  buildSessionPayload,
  hasBrowserbaseConfig
} = require('../lib/browserbase-browser');

const environment = {
  BROWSERBASE_API_KEY: 'bb_live_test',
  BROWSERBASE_PROJECT_ID: 'project-id',
  BROWSERBASE_CONTEXT_ID: 'context-id',
  BROWSERBASE_REGION: 'ap-southeast-1',
  BROWSERBASE_SESSION_TIMEOUT: '1200'
};

assert.equal(hasBrowserbaseConfig(environment), true);
assert.equal(hasBrowserbaseConfig({ BROWSERBASE_API_KEY: 'only-key' }), false);
assert.deepEqual(browserbaseConfig(environment), {
  apiKey: 'bb_live_test',
  projectId: 'project-id',
  contextId: 'context-id',
  region: 'ap-southeast-1',
  timeout: 1200
});
assert.deepEqual(buildSessionPayload(environment), {
  projectId: 'project-id',
  timeout: 900,
  region: 'us-west-2',
  proxies: true,
  browserSettings: {
    solveCaptchas: true,
    viewport: { width: 1920, height: 1080 },
    context: { id: 'context-id', persist: true }
  },
  userMetadata: { workflow: 'nueip-hr-automation' }
});
assert.deepEqual(buildSessionPayload(environment, {
  viewport: { width: 1280, height: 1800 },
  workflow: 'google-review-patrol'
}), {
  projectId: 'project-id',
  timeout: 900,
  region: 'us-west-2',
  proxies: true,
  browserSettings: {
    solveCaptchas: true,
    viewport: { width: 1280, height: 1800 },
    context: { id: 'context-id', persist: true }
  },
  userMetadata: { workflow: 'google-review-patrol' }
});
const statelessPayload = buildSessionPayload(environment, { useContext: false });
assert.equal('context' in statelessPayload.browserSettings, false);
assert.equal(statelessPayload.region, 'ap-southeast-1');
assert.equal(buildSessionPayload(environment, { region: 'ap-southeast-1' }).region, 'ap-southeast-1');
assert.equal(statelessPayload.timeout, 900);
assert.equal('region' in statelessPayload.browserSettings, false);
assert.equal('timeout' in statelessPayload.browserSettings, false);
assert.deepEqual(buildSessionPayload(environment, { useContext: false, proxyCountry: 'TW' }).proxies,
  [{ type: 'browserbase', geolocation: { country: 'TW' } }]);

console.log('browserbase browser tests passed');

(async () => {
  let requested = false;
  await assert.rejects(require('../lib/browserbase-browser').launchBrowser(environment, async () => { requested = true; }), /BROWSERBASE_PAUSED/);
  assert.equal(requested, false);
  for (const workflow of ['nueip-attendance-compare', 'nueip-attendance-explanation-sync']) {
    await assert.rejects(require('../lib/browserbase-browser').launchBrowser(environment, async () => { throw new Error('AUTHORIZED_REQUEST'); }, { workflow }), /AUTHORIZED_REQUEST/);
  }
  await assert.rejects(require('../lib/browserbase-browser').launchBrowser(environment, async () => { throw new Error('unexpected'); }, { workflow: 'google-review-patrol' }), /BROWSERBASE_PAUSED/);
  console.log('Browserbase pause prevents remote requests');
})().catch(error => { console.error(error); process.exitCode = 1; });

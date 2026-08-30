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
  browserSettings: {
    timeout: 900,
    region: 'ap-southeast-1',
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
  browserSettings: {
    timeout: 900,
    region: 'ap-southeast-1',
    viewport: { width: 1280, height: 1800 },
    context: { id: 'context-id', persist: true }
  },
  userMetadata: { workflow: 'google-review-patrol' }
});

console.log('browserbase browser tests passed');

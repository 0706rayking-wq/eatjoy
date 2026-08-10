const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const {
  selectHumanResourcesEvents,
  selectLittleThunderEvents,
  verifyLineSignature
} = require('./line-webhook')._test;

const secret = 'test-channel-secret';
const rawBody = Buffer.from(JSON.stringify({ events: [] }));
const validSignature = crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('base64');

assert.equal(verifyLineSignature(rawBody, validSignature, secret), true);
assert.equal(verifyLineSignature(rawBody, 'invalid', secret), false);
assert.equal(verifyLineSignature(rawBody, '', secret), false);

const payload = {
  events: [
    {
      type: 'message',
      source: { type: 'group', groupId: 'HR_GROUP', userId: 'U1' },
      message: { id: 'M1', type: 'image' }
    },
    {
      type: 'message',
      source: { type: 'group', groupId: 'OTHER_GROUP', userId: 'U2' },
      message: { id: 'M2', type: 'image' }
    },
    {
      type: 'message',
      source: { type: 'group', groupId: 'HR_GROUP', userId: 'U3' },
      message: { id: 'M3', type: 'video' }
    },
    {
      type: 'postback',
      source: { type: 'group', groupId: 'HR_GROUP', userId: 'U4' },
      postback: { data: 'approve=1' }
    },
    {
      type: 'message',
      source: { type: 'group', groupId: 'HR_GROUP', userId: 'U5' },
      message: { id: 'M5', type: 'text', text: '小雷神，幫我新增王小明7/6生日' }
    }
  ]
};

const selected = selectHumanResourcesEvents(payload, 'HR_GROUP');
assert.equal(selected.length, 3);
assert.equal(selected[0].message.id, 'M1');
assert.equal(selected[1].type, 'postback');
assert.equal(selected[2].message.id, 'M5');

const assistantEvents = selectLittleThunderEvents(selected);
assert.equal(assistantEvents.length, 1);
assert.equal(assistantEvents[0].message.id, 'M5');

console.log('line-webhook tests passed');

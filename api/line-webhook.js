const crypto = require('node:crypto');

const MAX_BODY_BYTES = 1024 * 1024;

function readRequiredEnv(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

async function readRawBody(request) {
  const chunks = [];
  let totalBytes = 0;

  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_BODY_BYTES) {
      const error = new Error('Request body is too large');
      error.statusCode = 413;
      throw error;
    }
    chunks.push(buffer);
  }

  return Buffer.concat(chunks);
}

function verifyLineSignature(rawBody, signature, channelSecret) {
  if (!signature) return false;

  const expected = crypto
    .createHmac('sha256', channelSecret)
    .update(rawBody)
    .digest('base64');

  const actualBuffer = Buffer.from(String(signature));
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function selectHumanResourcesEvents(payload, groupId) {
  const events = Array.isArray(payload.events) ? payload.events : [];

  return events.filter((event) => {
    const source = event && event.source;
    if (!source || source.type !== 'group' || source.groupId !== groupId) {
      return false;
    }

    if (event.type === 'message') {
      return event.message && ['image', 'text'].includes(event.message.type);
    }

    return event.type === 'postback' || event.type === 'join';
  });
}

async function forwardToN8n(payload, events, relayUrl, relaySecret) {
  const response = await fetch(relayUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${relaySecret}`,
      'Content-Type': 'application/json',
      'X-EatJoy-Relay-Version': '1'
    },
    body: JSON.stringify({
      version: 1,
      destination: payload.destination || '',
      receivedAt: new Date().toISOString(),
      events
    })
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `n8n relay failed with ${response.status}: ${responseText.slice(0, 300)}`
    );
  }
}

async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ status: 'error', message: 'Method not allowed' });
  }

  try {
    const channelSecret = readRequiredEnv('LINE_CHANNEL_SECRET');
    const humanResourcesGroupId = readRequiredEnv('LINE_HR_GROUP_ID');
    const n8nRelayUrl = readRequiredEnv('N8N_RELAY_URL');
    const n8nRelaySecret = readRequiredEnv('N8N_RELAY_SECRET');
    const rawBody = await readRawBody(request);
    const signature = request.headers['x-line-signature'];

    if (!verifyLineSignature(rawBody, signature, channelSecret)) {
      return response.status(401).json({
        status: 'error',
        message: 'Invalid LINE signature'
      });
    }

    const payload = JSON.parse(rawBody.toString('utf8'));
    const events = selectHumanResourcesEvents(payload, humanResourcesGroupId);

    if (events.length > 0) {
      await forwardToN8n(payload, events, n8nRelayUrl, n8nRelaySecret);
    }

    return response.status(200).json({
      status: 'ok',
      forwardedEvents: events.length
    });
  } catch (error) {
    const statusCode = Number(error.statusCode) || 500;
    console.error('LINE webhook relay failed', error);
    return response.status(statusCode).json({
      status: 'error',
      message: statusCode === 500 ? 'Webhook relay failed' : error.message
    });
  }
}

module.exports = handler;
module.exports.config = {
  api: {
    bodyParser: false
  }
};
module.exports._test = {
  readRawBody,
  selectHumanResourcesEvents,
  verifyLineSignature
};

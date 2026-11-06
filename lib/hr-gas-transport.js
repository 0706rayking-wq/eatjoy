'use strict';
// Only the existing HR Apps Script exec URL contract is accepted. No login,
// credential discovery, redirect credential forwarding or arbitrary egress.
const EXEC_URL = /^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/;
const CONTENT_URL = /^https:\/\/script\.googleusercontent\.com\/macros\/echo(?:\?|$)/;
const MAX_RESPONSE_BYTES = 512 * 1024;
function permittedContentUrl(value) {
  if (typeof value !== 'string' || /[\u0000-\u0020\u007f]/.test(value) || value.includes('#') || !CONTENT_URL.test(value)) return false;
  let url;
  try { url = new URL(value); } catch { return false; }
  return url.protocol === 'https:' && url.hostname === 'script.googleusercontent.com'
    && !url.username && !url.password && !url.port && !url.hash
    && url.pathname === '/macros/echo';
}
async function readResult(response) {
  if (!response || !Number.isInteger(response.status) || response.redirected || response.status < 200 || response.status >= 300 || !response.ok) {
    throw new Error('HR_GAS_RESPONSE_REJECTED');
  }
  const text = await response.text();
  if (Buffer.byteLength(text, 'utf8') > MAX_RESPONSE_BYTES) throw new Error('HR_GAS_RESPONSE_TOO_LARGE');
  try { return JSON.parse(text); } catch { throw new Error('HR_GAS_RESPONSE_INVALID'); }
}
async function postHrGas(url, payload, fetchImpl = globalThis.fetch) {
  if (typeof url !== 'string' || !EXEC_URL.test(url)) throw new Error('HR_GAS_URL_REJECTED');
  if (typeof fetchImpl !== 'function') throw new Error('HR_GAS_TRANSPORT_UNAVAILABLE');
  const signal = AbortSignal.timeout(45000);
  const first = await fetchImpl(url, {
    method: 'POST', redirect: 'manual', credentials: 'omit', referrerPolicy: 'no-referrer',
    headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload), signal
  });
  if (first?.redirected) throw new Error('HR_GAS_UNEXPECTED_REDIRECT');
  if (first?.status !== 302) return readResult(first);
  const location = first.headers?.get?.('location');
  if (!permittedContentUrl(location)) throw new Error('HR_GAS_REDIRECT_REJECTED');
  // Exactly one read-only GET to Google's content host. No POST body, headers,
  // authorization, cookies or referrer is carried across the redirect.
  const second = await fetchImpl(location, {
    method: 'GET', redirect: 'manual', credentials: 'omit', referrerPolicy: 'no-referrer', signal
  });
  return readResult(second);
}
module.exports = {postHrGas};
module.exports._test = {permittedContentUrl};

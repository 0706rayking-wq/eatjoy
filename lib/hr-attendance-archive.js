'use strict';
const crypto = require('node:crypto');
const {validateEnvelope,validateReply} = require('./hr-cloud-business-envelope');
const {postHrGas} = require('./hr-gas-transport');

function normalizeArchiveDate(value, now = new Date()) {
  const raw = String(value || '').trim();
  const year = Number(new Intl.DateTimeFormat('en-US', {timeZone: 'Asia/Taipei', year: 'numeric'}).format(now));
  const match = raw.match(/^(?:(\d{3,4})[\/-])?(\d{1,2})[\/-](\d{1,2})$/);
  if (!match) throw new Error('Invalid date');
  const inputYear = match[1] ? Number(match[1]) + (match[1].length === 3 ? 1911 : 0) : year;
  const date = `${inputYear}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
  const parsed = new Date(date + 'T00:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Invalid date');
  return date;
}

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({status:'error'});
  const expected = process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '';
  const actual = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const a=Buffer.from(actual), b=Buffer.from(expected);
  if (!expected || a.length!==b.length || !crypto.timingSafeEqual(a,b)) return res.status(401).json({status:'error'});
  // Shape validation does not authenticate a caller receipt. Only the GAS
  // source/effect ledger under the approved release can authorize effects.
  let envelope;
  try { envelope=validateEnvelope(req.body); }
  catch (_) { return res.status(409).json({status:'error',code:'hr_source_authorization_required'}); }
  const url=process.env.ATTENDANCE_ARCHIVE_URL,secret=process.env.ATTENDANCE_ARCHIVE_SECRET;
  if (!url || !secret) return res.status(503).json({status:'error',code:'archive_not_configured'});
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) {
    return res.status(503).json({status:'error',code:'invalid_archive_url'});
  }
  try {
    const reply=await postHrGas(url,{
      action:envelope.action, secret,
      sourceAuthorization:envelope.sourceAuthorization,
      businessPayload:envelope.businessPayload
    });
    // A bare legacy "saved"/"send" reply is never a successful gated result.
    const result=validateReply(reply,envelope);
    if (reply.status==='held') return res.status(409).json({status:'held',code:'hr_archive_effect_held'});
    return res.status(200).json(result);
  } catch (_) {
    // No retry and no response-body/credential logging on an unknown outcome.
    return res.status(502).json({status:'error',code:'hr_archive_gate_unconfirmed'});
  }
}
module.exports=handler;
module.exports.normalizeArchiveDate=normalizeArchiveDate;

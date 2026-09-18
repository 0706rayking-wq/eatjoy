'use strict';
const crypto = require('node:crypto');

async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({status: 'error'});
  const expected = process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '';
  const actual = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(actual), b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({status: 'error'});
  const url = process.env.ATTENDANCE_ARCHIVE_URL;
  const secret = process.env.ATTENDANCE_ARCHIVE_SECRET;
  if (!url || !secret) return res.status(503).json({status: 'error', code: 'archive_not_configured'});
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) return res.status(503).json({status: 'error', code: 'invalid_archive_url'});
  const action = req.body?.action === 'archive_result' ? 'comparison_result' : 'archive';
  if (!/^\d{1,40}$/.test(String(req.body?.messageId)) || (action === 'archive' && req.body?.schedule?.is_attendance_sheet !== true)) return res.status(400).json({status: 'error', code: 'invalid_input'});
  try {
    const upstream = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret, action, messageId: req.body.messageId, schedule: req.body.schedule, result: req.body.result}), signal: AbortSignal.timeout(45000)});
    if (!upstream.ok) throw new Error('Archive unavailable');
    const result = await upstream.json();
    if (!['saved', 'expired', 'recorded'].includes(result.status)) throw new Error('Archive failed');
    return res.status(200).json(result);
  } catch {
    return res.status(502).json({status: 'error', code: 'archive_failed'});
  }
}
module.exports = handler;

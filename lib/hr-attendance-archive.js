'use strict';
const crypto = require('node:crypto');

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
  if (req.method !== 'POST') return res.status(405).json({status: 'error'});
  const expected = process.env.HR_AUTOMATION_SECRET || process.env.N8N_RELAY_SECRET || '';
  const actual = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const a = Buffer.from(actual), b = Buffer.from(expected);
  if (!expected || a.length !== b.length || !crypto.timingSafeEqual(a, b)) return res.status(401).json({status: 'error'});
  const url = process.env.ATTENDANCE_ARCHIVE_URL;
  const secret = process.env.ATTENDANCE_ARCHIVE_SECRET;
  if (!url || !secret) return res.status(503).json({status: 'error', code: 'archive_not_configured'});
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(url)) return res.status(503).json({status: 'error', code: 'invalid_archive_url'});
  const action = req.body?.action === 'archive_result' ? 'comparison_result'
    : req.body?.action === 'aggregate_line' ? 'line_batch' : 'archive';
  if (!/^\d{1,40}$/.test(String(req.body?.messageId))
    || (action === 'archive' && req.body?.schedule?.is_attendance_sheet !== true)
    || (action === 'line_batch' && (!req.body?.groupId || !req.body?.date))) {
    return res.status(400).json({status: 'error', code: 'invalid_input'});
  }
  try {
    const schedule = action === 'archive' ? {...req.body.schedule, date: normalizeArchiveDate(req.body.schedule.date)} : undefined;
    const upstream = await fetch(url, {method: 'POST', headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret, action, messageId: req.body.messageId, schedule, result: req.body.result,
        groupId: req.body.groupId, date: req.body.date, sheetType: req.body.sheetType,
        lineMessages: req.body.lineMessages, archiveText: req.body.archiveText}), signal: AbortSignal.timeout(45000)});
    if (!upstream.ok) throw new Error('Archive unavailable');
    const result = await upstream.json();
    if (!['saved', 'expired', 'recorded', 'send', 'held'].includes(result.status)) throw new Error('Archive failed');
    return res.status(200).json(result);
  } catch {
    return res.status(502).json({status: 'error', code: 'archive_failed'});
  }
}
module.exports = handler;
module.exports.normalizeArchiveDate = normalizeArchiveDate;

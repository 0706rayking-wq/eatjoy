const crypto = require('node:crypto');
function windowFor(now = Date.now()) {
  const d = new Date(now + 8 * 3600000);
  const y = d.getUTCFullYear(), m = d.getUTCMonth();
  const target = new Date(Date.UTC(y, m + 1, 1));
  return { month: target.toISOString().slice(0, 7), cutoff: Date.UTC(y, m, 20, 16), now, open: now < Date.UTC(y, m, 20, 16) };
}
function validate(body, now) {
  const w = windowFor(now);
  if (!w.open || String(body.date).slice(0, 7) !== w.month) throw new Error('本月登記已截止，或日期不是下個月');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(body.date) || new Date(body.date + 'T00:00:00Z').toISOString().slice(0, 10) !== body.date) throw new Error('日期不正確');
  if (!['off', 'available', 'unavailable', 'clear'].includes(body.kind)) throw new Error('登記類型不正確');
  const slots = body.kind === 'available' ? body.slots : [];
  if (!Array.isArray(slots) || (body.kind === 'available' && (!slots.length || slots.length > 8))) throw new Error('請填寫可上班時段');
  const sorted = slots.map(s => {
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(s.start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(s.end) || s.start >= s.end) throw new Error('結束時間需晚於開始時間，跨日請分日填寫');
    return { start: s.start, end: s.end };
  }).sort((a,b)=>a.start.localeCompare(b.start));
  if (sorted.some((s,i)=>i && s.start < sorted[i-1].end)) throw new Error('可上班時段不能重疊');
  return sorted;
}
function update(entries, person, body, now) {
  const slots = validate(body, now);
  const previous = entries.find(e=>e.id === person.id);
  const rest = entries.filter(e=>e.id !== person.id);
  if (body.kind !== 'clear') rest.push({ ...person, kind: body.kind, slots, submittedAt: previous?.kind === body.kind ? previous.submittedAt : now, updatedAt: now });
  return rest.sort((a,b)=>a.submittedAt-b.submittedAt || a.id.localeCompare(b.id));
}
const personId = phone => crypto.createHash('sha256').update('schedule-intent:' + phone).digest('hex').slice(0,24);
module.exports = { windowFor, validate, update, personId };

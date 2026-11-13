const { windowFor, update, personId } = require('../lib/schedule-intent');
const root = 'https://firestore.googleapis.com/v1/projects/nangangeatjoycook/databases/(default)/documents';
const prefix = 'artifacts/kitchen-v16/public/data/';
const value = x => x === null ? { nullValue: null } : Array.isArray(x) ? { arrayValue: { values: x.map(value) } } : typeof x === 'object' ? { mapValue: { fields: Object.fromEntries(Object.entries(x).map(([k,v])=>[k,value(v)])) } } : typeof x === 'number' ? { integerValue: String(x) } : { stringValue: String(x) };
const decode = x => x?.mapValue ? Object.fromEntries(Object.entries(x.mapValue.fields || {}).map(([k,v])=>[k,decode(v)])) : x?.arrayValue ? (x.arrayValue.values || []).map(decode) : x?.integerValue !== undefined ? Number(x.integerValue) : x?.stringValue ?? null;
module.exports = async (req,res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'GET') return res.status(200).json(windowFor());
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const token = req.headers.authorization;
  if (!token?.startsWith('Bearer ')) return res.status(401).json({ error: '請重新登入' });
  const call = async (path, options = {}) => {
    const r = await fetch(root + path, { ...options, headers: { Authorization: token, 'Content-Type': 'application/json' }, signal: AbortSignal.timeout(12000) });
    const json = await r.json();
    if (!r.ok) { const e = new Error('資料服務暫時無法完成，請重新送出'); e.code = ['FAILED_PRECONDITION','ABORTED','ALREADY_EXISTS'].includes(json.error?.status) ? 409 : r.status; throw e; }
    return json;
  };
  try {
    const b = req.body || {};
    if (!/^\d{10}$/.test(b.phone) || typeof b.branch !== 'string' || b.branch.length > 80) return res.status(400).json({ error: '請使用已核准的員工帳號' });
    const doc = await call('/' + prefix + 'users/' + b.phone);
    const user = decode({ mapValue: { fields: doc.fields } });
    const branches = Array.isArray(user.branch) ? user.branch : [user.branch];
    if (user.status !== 'approved' || !branches.includes(b.branch)) return res.status(403).json({ error: '只能登記自己所屬分店' });
    const person = { id: personId(b.phone), name: user.name };
    const path = prefix + 'schedule_intents/' + encodeURIComponent(b.branch + '__' + String(b.date).slice(0,7)) + '/days/' + b.date;
    for (let attempt = 0; attempt < 5; attempt++) {
      let old = null;
      try { old = await call('/' + path.split('/').map(encodeURIComponent).join('/')); } catch(e) { if(e.code !== 404) throw e; }
      const entries = update(old ? decode({ mapValue: { fields: old.fields } }).entries || [] : [], person, b, Date.now());
      const fields = value({ entries, date: b.date, branch: b.branch }).mapValue.fields;
      try {
        await call(':commit', { method: 'POST', body: JSON.stringify({ writes: [{ update: { name: 'projects/nangangeatjoycook/databases/(default)/documents/' + path, fields }, currentDocument: old ? { updateTime: old.updateTime } : { exists: false } }] }) });
        return res.status(200).json({ ok: true, personId: person.id });
      } catch(e) { if (![409,412].includes(e.code) || attempt === 4) throw e; }
    }
  } catch(e) { return res.status(e.code === 401 ? 401 : 400).json({ error: e.message }); }
};

const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const helpers = html.slice(html.indexOf('    const sessionStorageSafe ='), html.indexOf('    const AuthPage ='));
const page = html.slice(html.indexOf('    const AuthPage ='));
const handler = page.slice(page.indexOf('     const handleAuth ='), page.indexOf('     return ('));
async function check(phone, ready, brokenStorage, expected) {
 const events = [];
 const c = {phone, usersReady: ready, usersError: '', submitting: false, mode: 'login', branch: 'TEST',
  users: [{phone: '0912345678', name: 'TEST', branch: ['TEST'], role: 'staff', status: 'approved'}],
  normalizeRole: x => x, isSupervisorRole: () => false,
  localStorage: {getItem: () => '{broken', setItem() {if(brokenStorage) throw Error('quota');}, removeItem() {}},
  setSubmitting() {}, setCurrentUser() {}, setCurrentBranch() {}, setIsManager() {},
  setCurrentPage: x => events.push(x), setMode: x => events.push(x), triggerNotify: x => events.push(x), console};
 vm.createContext(c);
 vm.runInContext(helpers + handler + '\nthis.run=handleAuth; this.saved=readSavedUser;', c);
 assert.equal(c.saved(), null);
 await c.run();
 assert(events.includes(expected), JSON.stringify(events));
 assert(!events.includes('register'));
}
(async () => {
 for (const phone of ['0912345678', '0912 345 678', '+886912345678', '０９１２３４５６７８']) await check(phone, true, false, 'home');
 await check('0912345678', false, false, '帳號資料載入中，請稍候再試');
 await check('0912345678', true, true, 'home');
 const c = {localStorage: {getItem() {throw Error('blocked');}}};
 vm.createContext(c); vm.runInContext(helpers + '\nthis.saved=readSavedUser;', c);
 assert.equal(c.saved(), null);
 assert(html.includes('if (s.metadata.fromCache) return;'));
 assert(html.includes('onClick={retryConnection}'));
 console.log('Login normalization, loading gate, blocked/full storage and corrupt session PASS');
})().catch(e => {console.error(e);process.exitCode=1;});

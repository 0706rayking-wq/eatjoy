const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const source = html.slice(html.indexOf('    const ROLE_OPTIONS ='), html.indexOf('    const HYGIENE_COURSES ='));
const r = vm.runInNewContext(source + ';({ROLE_OPTIONS,ROLE_META,normalizeRole,isSupervisorRole,HYGIENE_REQUIRED_ROLES})');
assert.equal(r.ROLE_OPTIONS.length, 8);
for (const role of r.ROLE_OPTIONS) {
 assert.equal(r.normalizeRole(role), role);
 assert.equal(r.ROLE_META[role].label, role);
 assert.equal(r.isSupervisorRole(role), role.includes('主管'));
}
assert.equal(r.normalizeRole('內場正職/計時人員'), '內場正職人員');
assert.equal(r.normalizeRole('外場正職/計時人員'), '外場正職人員');
assert.equal(r.normalizeRole(''), '內場正職人員');
assert.equal(r.normalizeRole('主管'), '內場主管');
for (const role of ['內場正職人員', '內場計時人員', '內場主管']) assert.ok(r.HYGIENE_REQUIRED_ROLES.includes(role));
for (const role of ['外場正職人員', '外場計時人員']) assert.ok(!r.HYGIENE_REQUIRED_ROLES.includes(role));
assert.ok((html.match(/ROLE_OPTIONS\.map\(r =>/g) || []).length >= 3);
console.log('Employee roles: eight options, legacy defaults, permissions and training requirements passed');

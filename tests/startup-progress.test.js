const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const html = fs.readFileSync(require('node:path').join(__dirname, '../index.html'), 'utf8');
const expression = html.match(/const startupProgress = ([^;]+);/)[1];
for (const fbReady of [false, true]) for (const branchesReady of [false, true]) for (const usersReady of [false, true]) {
 const value = vm.runInNewContext(expression, {fbReady, branchesReady, usersReady});
 assert.equal(value, 25 + 25 * [fbReady, branchesReady, usersReady].filter(Boolean).length);
 assert.equal(value === 100, fbReady && branchesReady && usersReady);
}
assert(html.includes('if (fbReady && branchesReady && usersReady) setStartupComplete(true)'));
assert(html.includes('clearTimeout(branchesTimeout)'));
assert(html.includes('aria-valuenow={startupProgress}'));
assert(html.includes('motion-reduce:transition-none'));
console.log('Startup progress stages, completion gate and accessible markup PASS');

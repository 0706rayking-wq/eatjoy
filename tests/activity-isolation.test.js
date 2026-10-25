const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(!/food.research|FoodResearch|FOOD_RESEARCH|食研所/.test(html));
for (const activity of ['snake', 'leftover', 'gathering']) assert(html.includes("'" + activity + "'"));
const context = {window: {}};
vm.createContext(context);
for (const file of ['activity-question-bank.js', 'activity-question-bank-expansion.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context);
}
assert(context.window.ACTIVITY_QUESTIONS.length > 0);
assert(!fs.existsSync(path.join(root, 'assets/food-research')));
assert(!fs.existsSync(path.join(root, 'game.js')));
console.log('Other activities and shared question bank preserved; game files removed');

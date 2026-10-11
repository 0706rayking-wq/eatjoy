const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const helpers = source.slice(source.indexOf('const orderingActualQty ='), source.indexOf('const OrderingSystem ='));
const context = vm.createContext({});
vm.runInContext(helpers + ';globalThis.api = { orderingActualQty, orderingMonthlyCosts };', context);
const { orderingActualQty, orderingMonthlyCosts } = context.api;
assert.equal(orderingActualQty({ qty: 10, receivedQty: 0 }), 0);
assert.equal(orderingActualQty({ qty: 10, receivedQty: 2.5 }), 2.5);
assert.equal(orderingActualQty({ qty: 10 }), 10);
const history = [{ id: 1, date: '2026-10-11', receivedAt: 1, items: [
  { name: 'A', qty: 10, receivedQty: 2.5, unitPrice: 12 },
  { name: 'B', qty: 5, receivedQty: 0, unitPrice: 20 },
  { name: 'C', qty: 4 }
] }];
const stats = orderingMonthlyCosts(history, '2026-10');
assert.equal(stats.total, 30);
assert.equal(stats.unpriced, 1);
assert.equal(stats.rows.length, 3);
assert.equal(history[0].items[0].qty, 10);
assert.equal(orderingMonthlyCosts(history, '2026-09').total, 0);
assert.ok(source.includes('(!inventoryVendor || i.vendor === inventoryVendor)'));
assert.ok(source.includes("setInventoryVendor('')"));
assert.ok(source.includes('value > Number(item.qty)'));
assert.ok(source.includes('JSON.stringify(history[index]) !== original'));
assert.ok(source.includes('tx.update(ref, { history: next'));
console.log('Ordering receipt, cost and filter checks passed');

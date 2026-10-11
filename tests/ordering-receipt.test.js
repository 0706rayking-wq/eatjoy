const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const helpers = source.slice(source.indexOf('const orderingActualQty ='), source.indexOf('const OrderingSystem ='));
const context = vm.createContext({});
vm.runInContext(helpers + ';globalThis.api = { orderingActualQty, orderingMonthlyCosts, orderingRecordKey };', context);
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
assert.ok(source.includes('orderingRecordKey(history[index]) !== original'));
assert.equal(context.api.orderingRecordKey({ id: 1, items: [{ qty: 5, name: 'A' }] }), context.api.orderingRecordKey({ items: [{ name: 'A', qty: 5 }], id: 1 }));
assert.notEqual(context.api.orderingRecordKey({ qty: 5 }), context.api.orderingRecordKey({ qty: 4 }));
assert.ok(source.includes('tx.update(ref, { history: next'));
console.log('Ordering receipt, cost and filter checks passed');
const submitSource = source.slice(source.indexOf('const submitReceipt = async'), source.indexOf('const [editingIngredientId', source.indexOf('const submitReceipt = async')));
async function checkSubmit(receivedAt) {
  let saved;
  const record = { id: 1, date: '2026-10-11', items: [{ name: 'A', qty: 10, unitPrice: 12 }], ...(receivedAt ? { receivedAt } : {}) };
  const remote = { ...record, items: [{ unitPrice: 12, qty: 10, name: 'A' }] };
  const notices = [];
  const sandbox = vm.createContext({
    receiptRecord: record, receiptBusy: false, receiptDraft: { 0: '4' }, receiptDate: record.date,
    selectedBranch: 'test', getPublicPath: x => x, setReceiptBusy: () => {}, setReceiptDraft: () => {},
    triggerNotify: (...args) => notices.push(args), console,
    db: { doc: x => x, runTransaction: async callback => callback({
      get: async () => ({ data: () => ({ history: [remote] }) }), update: (ref, data) => { saved = data; }
    }) }
  });
  vm.runInContext(helpers + submitSource + ';globalThis.submit = submitReceipt;', sandbox);
  await sandbox.submit();
  assert.equal(saved.history[0].items[0].receivedQty, 4);
  assert.equal(saved.history[0].items[0].qty, 10);
  assert.equal(notices[0][1], 'success');
}
Promise.all([checkSubmit(null), checkSubmit(123)]).then(() => console.log('Initial and repeat receipt submission passed')).catch(error => { console.error(error); process.exitCode = 1; });

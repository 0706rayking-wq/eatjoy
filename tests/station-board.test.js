const assert = require('node:assert/strict');
const {roster, cleanAssignments, stationColors} = require('../station-board.js');
assert.equal(stationColors('#000000').foreground, '#ffffff');
assert.equal(stationColors('#ffffff').foreground, '#000000');
assert.equal(stationColors('invalid').background, '#ffffff');
assert.equal(stationColors('#163b60').background, '#163b60');
const staffList = [
 {id:'1', name:'早班', shifts:{'2026-10-30':'A'}},
 {id:'2', name:'晚班', shifts:{'2026-10-30':'P4'}},
 {id:'3', name:'全天', shifts:{}},
 {id:'4', name:'休假', shifts:{'2026-10-30':'X'}}
];
const schedule = {months:{'2026-10':{staffList:[], publishedSnapshot:{staffList}}},shiftRules:[{code:'A',type:'morning'},{code:'P4',type:'evening'},{code:'X',type:'off'}]};
const all = roster(schedule, '2026-10-30', 'all');
assert.equal(all.active.length, 4);
assert.equal(all.published, true);
assert.equal(all.active[2].code, '全天');
assert.equal(all.active[3].code, 'X');
assert.deepEqual(roster(schedule,'2026-10-30','working').active.map(p=>p.id),['1','2','3']);
assert.equal(roster(schedule,'2026-11-01','all').exists, false);
assert.deepEqual(cleanAssignments({'1':'soup','2':'deleted','gone':'soup'}, all.active, [{id:'soup'}]), {'1':'soup'});
assert.equal(roster({months:{'2026-10':{staffList}}},'2026-10-30','all').published,false);
assert.equal(staffList[2].shifts['2026-10-30'], undefined);
console.log('Whole-day roster, published preference, draft fallback, date isolation and assignment cleanup PASS');

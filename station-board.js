(function (root) {
 'use strict';
 const defaults = ['湯區', '冷檯', '海鮮', '蔬果', '熟食一', '熟食二', '輕食', '大切肉', '機動', '休假'];
 function roster(schedule, date, period) {
  const month = schedule?.months?.[date.slice(0, 7)];
  const source = month?.publishedSnapshot || month;
  const staff = source?.staffList || (!schedule?.months ? schedule?.staffList : []) || [];
  const rules = schedule?.shiftRules || [{code:'A-6',type:'morning'}, {code:'P1',type:'evening'}, {code:'P4',type:'evening'}, {code:'P5',type:'evening'}, {code:'P6',type:'evening'}, {code:'F',type:'full'}];
  const rows = staff.map(person => {
   const code = String(person.shifts?.[date] || '').trim();
   const type = rules.find(rule => rule.code === code)?.type || (['X', '/', '特'].includes(code.toUpperCase()) ? 'off' : 'full');
   return {...person, id:String(person.id), code:code || '全天', shiftType:type};
  });
  return {published:!!month?.publishedSnapshot, exists:!!source || (!schedule?.months && !!schedule?.staffList),
   active:period === 'all' ? rows : rows.filter(p => p.shiftType !== 'off' && (p.shiftType === 'full' || p.shiftType === period)),
   off:rows.filter(p => p.shiftType === 'off')};
 }
 function cleanAssignments(assignments, staff, stations) {
  const people = new Set(staff.map(p => String(p.id))), places = new Set(stations.map(s => s.id));
  return Object.fromEntries(Object.entries(assignments || {}).filter(([id, station]) => people.has(id) && places.has(station)));
 }
 const api = {defaults, roster, cleanAssignments};
 if (typeof module === 'object' && module.exports) module.exports = api;
 else root.StationBoardData = api;
})(typeof window === 'undefined' ? globalThis : window);

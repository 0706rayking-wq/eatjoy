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
   active:period === 'all' ? rows : rows.filter(p => p.shiftType !== 'off' && (period === 'working' || p.shiftType === 'full' || p.shiftType === period)),
   off:rows.filter(p => p.shiftType === 'off')};
 }
 function cleanAssignments(assignments, staff, stations) {
  const people = new Set(staff.map(p => String(p.id))), places = new Set(stations.map(s => s.id));
  return Object.fromEntries(Object.entries(assignments || {}).filter(([id, station]) => people.has(id) && places.has(station)));
 }
 function stationColors(color) {
  const background = /^#[0-9a-f]{6}$/i.test(color || '') ? color : '#ffffff';
  const rgb = [1,3,5].map(i => parseInt(background.slice(i,i+2),16)/255).map(v => v <= 0.04045 ? v/12.92 : Math.pow((v+0.055)/1.055,2.4));
  const luminance = rgb[0]*0.2126+rgb[1]*0.7152+rgb[2]*0.0722;
  return {background,foreground:luminance > 0.179 ? '#000000' : '#ffffff'};
 }
 function periodRange(value) {
  const match = /^(\d{2}):(\d{2})[–-](\d{2}):(\d{2})$/.exec(value || '');
  if (!match) return null;
  const [,h,m,H,M]=match.map(Number);
  if(h>23||H>23||m>59||M>59)return null;
  const start=h*60+m,end=H*60+M;
  return end>start?[start,end]:null;
 }
 function periodsOverlap(a,b) {
  if(a==='全天'||b==='全天'||a===b)return true;
  if(['早班','晚班'].includes(a)&&['早班','晚班'].includes(b))return false;
  const x=periodRange(a),y=periodRange(b);
  // Named shifts have no fixed clock boundaries; require manual review with custom times.
  return x&&y?x[0]<y[1]&&y[0]<x[1]:null;
 }
 const api = {defaults, roster, cleanAssignments, stationColors, periodRange, periodsOverlap};
 if (typeof module === 'object' && module.exports) module.exports = api;
 else root.StationBoardData = api;
})(typeof window === 'undefined' ? globalThis : window);

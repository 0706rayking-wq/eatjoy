window.StationAssignmentBoard = function StationAssignmentBoard({currentBranch, currentUser, db, getPublicPath, onBack, triggerNotify, Icon, BackButton}) {
 const {useState, useEffect, useRef} = React;
 const {defaults, roster, cleanAssignments} = window.StationBoardData;
 const [date, setDate] = useState(() => new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Taipei'}).format(new Date()));
 const period = 'all';
 const [schedule, setSchedule] = useState(null);
 const [stations, setStations] = useState([]);
 const [assignments, setAssignments] = useState({});
 const [notes, setNotes] = useState({});
 const [revision, setRevision] = useState(0);
 const [configRevision, setConfigRevision] = useState(0);
 const [selected, setSelected] = useState('');
 const [newName, setNewName] = useState('');
 const [dirty, setDirty] = useState(false);
 const [loading, setLoading] = useState(true);
 const [saving, setSaving] = useState(false);
 const [error, setError] = useState('');
 const [reload, setReload] = useState(0);
 const generation = useRef(0);
 const boardId = `${encodeURIComponent(currentBranch)}__${date}__${period}`;
 const configRef = () => db.doc(getPublicPath(`station_board_config/${encodeURIComponent(currentBranch)}`));
 const boardRef = () => db.doc(getPublicPath(`station_board_days/${boardId}`));
 const team = roster(schedule, date, period);
 const effective = cleanAssignments(assignments, team.active, stations);
 useEffect(() => {
  const run = ++generation.current;
  setLoading(true); setError(''); setSelected(''); setDirty(false);
  Promise.all([
   db.doc(getPublicPath(`schedules_data/branch_${currentBranch}`)).get({source:'server'}),
   configRef().get({source:'server'}), boardRef().get({source:'server'})
  ]).then(([s, c, b]) => {
   if (run !== generation.current) return;
   setSchedule(s.exists ? s.data() : {});
   const config = c.exists ? c.data() : {}, board = b.exists ? b.data() : {};
   setStations(config.stations || defaults.map((name, i) => ({id:`station-${i}`, name})));
   setAssignments(board.assignments || {});
   setNotes(board.notes || {});
   setRevision(board.revision || 0); setConfigRevision(config.revision || 0);
  }).catch(e => {if (run === generation.current) setError(`讀取失敗（${e.code || 'network-error'}），請重試。`);})
   .finally(() => {if (run === generation.current) setLoading(false);});
  return () => {generation.current++;};
 }, [currentBranch, date, period, reload]);
 useEffect(() => {
  const warn = e => {if(dirty) {e.preventDefault(); e.returnValue = '';}};
  window.addEventListener('beforeunload', warn);
  return () => window.removeEventListener('beforeunload', warn);
 }, [dirty]);
 const leave = callback => {if(!saving && (!dirty || window.confirm('尚有未儲存的安排，要放棄變更嗎？'))) callback();};
 const assign = (person, station) => {
  if (loading || saving || error || !team.active.some(p => p.id === person)) return;
  if (station && !stations.some(s => s.id === station)) return;
  setAssignments(prev => {const next = {...prev}; if(station) next[person] = station; else delete next[person]; return next;});
  setSelected(''); setDirty(true);
 };
 const addStation = e => {
  e.preventDefault(); const name = newName.trim();
  if (!name || stations.some(s => s.name === name)) return;
  setStations(prev => [...prev, {id:`station-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,name}]);
  setNewName(''); setDirty(true);
 };
 const save = async () => {
  if (saving || loading || error) return;
  setSaving(true);
  try {
   const cRef = configRef(), bRef = boardRef();
   await db.runTransaction(async tx => {
    const c = await tx.get(cRef), b = await tx.get(bRef);
    if ((c.exists ? c.data().revision || 0 : 0) !== configRevision || (b.exists ? b.data().revision || 0 : 0) !== revision) throw Error('conflict');
    tx.set(cRef, {stations, revision:configRevision + 1, updatedAt:Date.now()});
    const validNotes = Object.fromEntries(team.active.filter(p => Object.prototype.hasOwnProperty.call(notes, p.id)).map(p => [p.id, notes[p.id]]));
    tx.set(bRef, {branch:currentBranch, date, period, assignments:effective, notes:validNotes, revision:revision + 1, updatedAt:Date.now(), updatedBy:currentUser?.name || ''});
   });
   setRevision(v => v + 1); setConfigRevision(v => v + 1); setDirty(false);
   triggerNotify('崗位安排已儲存', 'success');
  } catch(e) {triggerNotify(e.message === 'conflict' ? '其他同仁已更新看板，請重新載入後再安排。' : `儲存失敗（${e.code || 'network-error'}），變更已保留，請重試。`, 'error');}
  finally {setSaving(false);}
 };
 const personButton = person => <div key={person.id} className="w-[132px] max-w-full min-w-0"><button type="button" draggable={!saving} aria-pressed={selected === person.id}
  onDragStart={e => {e.dataTransfer.setData('text/plain', person.id); e.dataTransfer.effectAllowed = 'move';}}
  onClick={e => {e.stopPropagation(); setSelected(selected === person.id ? '' : person.id);}}
  disabled={saving} className={`min-h-[44px] w-full px-3 py-2 rounded border text-left ${selected === person.id ? 'bg-blue-100 border-blue-600' : 'bg-white border-slate-300'}`}>
  <span className="block font-bold break-words">{person.name}</span><span className="block text-xs text-slate-600">班表：{person.code}</span>
 </button><input aria-label={`${person.name}的班別備註`} placeholder="班別備註" maxLength={40} value={notes[person.id] ?? person.code} disabled={saving} onChange={e => {setNotes(prev => ({...prev, [person.id]:e.target.value})); setDirty(true);}} className="mt-1 w-full min-w-0 min-h-[44px] px-2 border rounded bg-white text-sm"/></div>;
 const zone = (id, name) => <div key={id || 'unassigned'} onDragOver={e => {e.preventDefault(); e.dataTransfer.dropEffect = 'move';}}
  onDrop={e => {e.preventDefault(); assign(e.dataTransfer.getData('text/plain'), id);}}
  className="border-t border-slate-300 py-4 min-w-0">
  <div className="flex items-center justify-between gap-2 mb-3">
   <h3 className="font-bold text-base break-words">{name} <span className="text-slate-500 text-sm">{team.active.filter(p => (effective[p.id] || '') === id).length}</span></h3>
   {id && <button type="button" title={`移除${name}`} aria-label={`移除${name}`} disabled={saving} className="min-h-[44px] min-w-[44px] flex items-center justify-center" onClick={() => {
    if(!window.confirm(`崗位清單為此分店各日期共用。移除「${name}」後，各日該崗位人員將顯示為未分派，確定移除？`)) return;
    setStations(prev => prev.filter(s => s.id !== id)); setAssignments(prev => Object.fromEntries(Object.entries(prev).filter(([,value]) => value !== id))); setDirty(true);
   }}><Icon name="trash-2" size={16}/></button>}
  </div>
  <div className="flex flex-wrap gap-2 min-h-[64px]">{team.active.filter(p => (effective[p.id] || '') === id).map(personButton)}</div>
  {selected && <button type="button" disabled={saving} onClick={() => assign(selected, id)} className="mt-2 min-h-[44px] px-3 rounded bg-blue-600 text-white text-sm">{id ? '分派至此' : '移回未分派'}</button>}
 </div>;
 return <div className="p-4 text-slate-800 text-left pb-12">
  <BackButton title="崗位安排" onClick={() => leave(onBack)} />
  <div className="flex justify-between items-center gap-3 my-4"><h2 className="font-bold text-lg break-words">{currentBranch}</h2><button type="button" title="重新載入" aria-label="重新載入" disabled={saving} onClick={() => leave(() => setReload(n => n + 1))} className="min-w-[44px] min-h-[44px] flex items-center justify-center"><Icon name="refresh-cw" size={18}/></button></div>
  <div className="flex flex-wrap gap-3 mb-4">
   <label className="min-w-0 flex-1">日期<input type="date" value={date} disabled={saving} onChange={e => {const value = e.target.value; if(value) leave(() => setDate(value));}} className="block w-full min-w-0 border rounded p-2 min-h-[44px] bg-white"/></label>
  </div>
  {loading ? <p role="status">讀取班表與崗位中...</p> : error ? <p role="alert" className="text-red-700">{error}</p> : <>
   <p className="text-sm text-slate-600 mb-4">{team.exists ? (team.published ? '已發布班表' : '未發布班表（草稿）') : '本月尚無班表'} · 全日 {team.active.length} 人 · 未分派 {team.active.filter(p => !effective[p.id]).length} 人</p>
   <form onSubmit={addStation} className="flex gap-2 mb-4"><input aria-label="新增崗位名稱" placeholder="新增崗位名稱" maxLength={30} value={newName} onChange={e => setNewName(e.target.value)} disabled={saving} className="min-w-0 flex-1 border rounded p-2 bg-white"/><button type="submit" title="新增崗位" aria-label="新增崗位" disabled={saving || !newName.trim()} className="min-h-[44px] min-w-[44px] rounded border flex items-center justify-center"><Icon name="plus" size={20}/></button></form>
   {zone('', '未分派')}
   <div className="grid grid-cols-2 gap-x-3">{stations.map(s => zone(s.id, s.name))}</div>
   <div className="sticky bottom-0 bg-white border-t py-3 flex justify-between items-center gap-3"><span role="status" className="text-sm">{dirty ? '尚未儲存' : '已同步'}</span><button type="button" disabled={!dirty || saving} onClick={save} className="min-h-[44px] px-4 rounded bg-blue-600 text-white disabled:opacity-50 flex items-center gap-2"><Icon name="save" size={18}/>{saving ? '儲存中...' : '儲存安排'}</button></div>
  </>}
 </div>;
};

window.StationAssignmentBoard = function StationAssignmentBoard({currentBranch,currentUser,db,getPublicPath,onBack,triggerNotify,Icon,BackButton}) {
 const {useState,useEffect,useRef}=React;
 const [date,setDate]=useState(()=>{
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(new Date());
  const next=new Date(today+'T12:00:00+08:00');next.setUTCDate(next.getUTCDate()+1);
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(next);
 });
 const [schedule,setSchedule]=useState(null),[stations,setStations]=useState([]),[placements,setPlacements]=useState({}),[notes,setNotes]=useState({});
 const [revision,setRevision]=useState(0),[configRevision,setConfigRevision]=useState(0),[selected,setSelected]=useState(''),[newName,setNewName]=useState('');
 const [dirty,setDirty]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[ghost,setGhost]=useState(null);
 const generation=useRef(0),surface=useRef(null),tray=useRef(null),viewport=useRef(null),drag=useRef(null),suppressClick=useRef(false);
 const team=window.StationBoardData.roster(schedule,date,'working');
 const boardHeight=Math.max(540,Math.ceil(stations.length/3)*180);
 const valid=p=>p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&(!p.stationId||stations.some(s=>s.id===p.stationId));
 const placed=Object.fromEntries(team.active.filter(p=>valid(placements[p.id])).map(p=>[p.id,placements[p.id]]));
 const waiting=team.active.filter(p=>!placed[p.id]);
 const configRef=()=>db.doc(getPublicPath(`station_board_config/${encodeURIComponent(currentBranch)}`));
 const boardRef=()=>db.doc(getPublicPath(`station_board_days/${encodeURIComponent(currentBranch)}__${date}__all`));
 useEffect(()=>{
  const run=++generation.current;setLoading(true);setError('');setSelected('');setDirty(false);setGhost(null);drag.current=null;
  Promise.all([db.doc(getPublicPath(`schedules_data/branch_${currentBranch}`)).get({source:'server'}),configRef().get({source:'server'}),boardRef().get({source:'server'})]).then(([s,c,b])=>{
   if(run!==generation.current)return;
   setSchedule(s.exists?s.data():{});
   const config=c.exists?c.data():{},board=b.exists?b.data():{};
   const list=config.stations||window.StationBoardData.defaults.filter(name=>name!=='休假').map((name,i)=>({id:`station-${i}`,name}));
   setStations(list);
   // Preserve assignments saved before the free-position whiteboard was introduced.
   const migrated={},counts={};
   Object.entries(board.assignments||{}).forEach(([id,stationId])=>{
    const i=list.findIndex(s=>s.id===stationId);if(i<0)return;
    const count=counts[stationId]||0;counts[stationId]=count+1;
    migrated[id]={x:(i%3)/3+(count%2)*0.15,y:(Math.floor(i/3)*180+55+Math.floor(count/2)*80)/Math.max(540,Math.ceil(list.length/3)*180),stationId};
   });
   setPlacements(board.placements||migrated);setNotes(board.notes||{});setRevision(board.revision||0);setConfigRevision(config.revision||0);
  }).catch(e=>{if(run===generation.current)setError(`讀取失敗（${e.code||'network-error'}），請重試。`);}).finally(()=>{if(run===generation.current)setLoading(false);});
  return()=>{generation.current++;};
 },[currentBranch,date,reload]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 const leave=fn=>{if(!saving&&(!dirty||window.confirm('尚有未儲存的安排，要放棄變更嗎？')))fn();};
 const toTray=id=>{if(saving)return;setPlacements(prev=>{const next={...prev};delete next[id];return next;});setSelected('');setDirty(true);};
 const put=(id,clientX,clientY)=>{
  if(saving||loading||!surface.current||!team.active.some(p=>p.id===id))return;
  const rect=surface.current.getBoundingClientRect();
  const tagWidth=Math.min(112,rect.width*0.28);
  const x=Math.max(0,Math.min(rect.width-tagWidth,clientX-rect.left-tagWidth/2)),y=Math.max(0,Math.min(rect.height-82,clientY-rect.top-25));
  const index=Math.floor((y+25)/180)*3+Math.min(2,Math.floor((x+tagWidth/2)/(rect.width/3)));
  setPlacements(prev=>({...prev,[id]:{x:x/rect.width,y:y/rect.height,stationId:stations[index]?.id||''}}));setSelected('');setDirty(true);
 };
 const inside=(r,x,y)=>r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
 const pointerDown=(e,id)=>{if(saving||e.button!==0)return;suppressClick.current=false;drag.current={id,x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);};
 const pointerMove=e=>{
  const d=drag.current;if(!d)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>5)d.moved=true;if(!d.moved)return;
  setGhost({id:d.id,x:e.clientX,y:e.clientY});
  if(e.clientY<48)window.scrollBy(0,-20);
  if(e.clientY>window.innerHeight-48)window.scrollBy(0,20);
  const view=viewport.current,r=view?.getBoundingClientRect();
  if(inside(r,e.clientX,e.clientY)){if(e.clientX>r.right-28)view.scrollLeft+=16;if(e.clientX<r.left+28)view.scrollLeft-=16;if(e.clientY>r.bottom-28)view.scrollTop+=16;if(e.clientY<r.top+28)view.scrollTop-=16;}
 };
 const pointerUp=e=>{
  const d=drag.current;drag.current=null;setGhost(null);if(!d?.moved)return;suppressClick.current=true;
  if(inside(tray.current?.getBoundingClientRect(),e.clientX,e.clientY))toTray(d.id);
  else if(inside(viewport.current?.getBoundingClientRect(),e.clientX,e.clientY))put(d.id,e.clientX,e.clientY);
 };
 const updateStations=list=>{
  const nextHeight=Math.max(540,Math.ceil(list.length/3)*180);
  setPlacements(prev=>Object.fromEntries(Object.entries(prev).flatMap(([id,p])=>{
   const before=stations.findIndex(s=>s.id===p.stationId),after=list.findIndex(s=>s.id===p.stationId);
   if(p.stationId&&after<0)return [];
   const dx=before>=0&&after>=0?((after%3)-(before%3))/3:0;
   const dy=before>=0&&after>=0?(Math.floor(after/3)-Math.floor(before/3))*180:0;
   return [[id,{...p,x:Math.max(0,p.x+dx),y:Math.max(0,(p.y*boardHeight+dy)/nextHeight)}]];
  })));
  setStations(list);setDirty(true);
 };
 const addStation=e=>{e.preventDefault();const name=newName.trim();if(!name||stations.some(s=>s.name===name))return;updateStations([...stations,{id:`station-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,name}]);setNewName('');};
 const rename=s=>{const name=window.prompt('崗位名稱',s.name)?.trim();if(!name||name.length>30||stations.some(other=>other.id!==s.id&&other.name===name))return;setStations(prev=>prev.map(other=>other.id===s.id?{...other,name}:other));setDirty(true);};
 const remove=s=>{
  if(!window.confirm(`崗位為此店各日期共用。刪除「${s.name}」後，該崗位人員會回到待分派區，確定刪除？`))return;
  updateStations(stations.filter(other=>other.id!==s.id));
 };
 const save=async()=>{
  if(saving||loading||error)return;setSaving(true);
  try{
   const cRef=configRef(),bRef=boardRef();
   await db.runTransaction(async tx=>{
    const c=await tx.get(cRef),b=await tx.get(bRef);
    if((c.exists?c.data().revision||0:0)!==configRevision||(b.exists?b.data().revision||0:0)!==revision)throw Error('conflict');
    tx.set(cRef,{stations,revision:configRevision+1,updatedAt:Date.now()});
    const validNotes=Object.fromEntries(team.active.filter(p=>Object.prototype.hasOwnProperty.call(notes,p.id)).map(p=>[p.id,notes[p.id]]));
    tx.set(bRef,{branch:currentBranch,date,period:'all',placements:placed,assignments:Object.fromEntries(Object.entries(placed).filter(([,p])=>p.stationId).map(([id,p])=>[id,p.stationId])),notes:validNotes,revision:revision+1,updatedAt:Date.now(),updatedBy:currentUser?.name||''});
   });
   setRevision(n=>n+1);setConfigRevision(n=>n+1);setDirty(false);triggerNotify('白板安排已儲存','success');
  }catch(e){triggerNotify(e.message==='conflict'?'其他同仁已更新看板，請重新載入後再安排。':`儲存失敗（${e.code||'network-error'}），變更已保留。`,'error');}finally{setSaving(false);}
 };
 const tag=p=><div className="sb-tag" key={p.id} data-person={p.id}>
  <button type="button" className={`sb-name ${selected===p.id?'sb-selected':''}`} aria-label={`移動${p.name}`} aria-pressed={selected===p.id} disabled={saving}
   onPointerDown={e=>pointerDown(e,p.id)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{drag.current=null;setGhost(null);}}
   onClick={e=>{e.stopPropagation();if(suppressClick.current){suppressClick.current=false;return;}setSelected(selected===p.id?'':p.id);}}>{p.name}</button>
  <input aria-label={`${p.name}的班別備註`} title={`原班別：${p.code}`} maxLength={40} value={notes[p.id]??p.code} disabled={saving} onClick={e=>e.stopPropagation()} onChange={e=>{const value=e.target.value;setNotes(prev=>({...prev,[p.id]:value}));setDirty(true);}}/>
 </div>;
 return <div className="station-whiteboard p-3 text-left pb-6">
  <style>{`
   .station-whiteboard{color:#1e293b;max-width:100%;letter-spacing:0}
   .sb-layout{display:flex;flex-direction:column;gap:16px;min-width:0}
   .sb-viewport{width:100%;box-sizing:border-box;border:4px solid #94a3b8;border-radius:6px;background:#fff}
   .sb-surface{position:relative;width:100%;background:#fff;color:#1e293b}
   .sb-stations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));pointer-events:none}
   .sb-station{height:180px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:8px;box-sizing:border-box}
   .sb-heading{display:flex;align-items:flex-start;gap:4px;pointer-events:auto}
   .sb-heading button{min-width:36px;min-height:44px;color:#475569}
   .sb-heading .sb-title{flex:1;text-align:left;font-size:16px;font-weight:700;color:#1e293b;overflow-wrap:anywhere;border-bottom:3px solid #0d9488;padding:4px}
   .sb-tray{width:100%;border-top:1px solid #cbd5e1;padding-top:12px}
   .sb-roster{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
   .sb-tag{width:112px;max-width:100%;background:#fff;border:1px solid #94a3b8;border-radius:6px;box-shadow:0 2px 4px #0f172a15;overflow:hidden;margin-bottom:8px}
   .sb-name{display:block;width:100%;min-height:44px;padding:8px 5px;font-size:15px;font-weight:700;color:#1e293b;background:#f1f5f9;touch-action:none;user-select:none;cursor:grab;overflow-wrap:anywhere}
   .sb-name:active{cursor:grabbing}.sb-selected{background:#dbeafe;box-shadow:inset 0 0 0 2px #2563eb}
   .sb-tag input{display:block;width:100%;min-width:0;min-height:36px;padding:5px;font-size:14px;text-align:center;color:#475569;background:#fff;border:0;box-sizing:border-box}
   .sb-placed{position:absolute;width:28%;max-width:112px}.sb-placed:focus-within{z-index:20}
   .sb-ghost{position:fixed;pointer-events:none;z-index:99999;width:112px;padding:10px;border:2px solid #2563eb;border-radius:6px;background:#eff6ff;color:#1e293b;transform:translate(-50%,-50%)}
   @media(max-width:480px){.sb-station{padding:4px}.sb-heading{gap:0}.sb-heading button{min-width:24px}.sb-heading .sb-title{font-size:14px;padding:4px 1px}.sb-name{font-size:14px}}
  `}</style>
  <BackButton title="崗位白板" onClick={()=>leave(onBack)}/>
  <div className="flex flex-wrap items-end gap-3 my-4"><h2 className="font-bold text-lg flex-1 min-w-0 break-words">{currentBranch}</h2>
   <label className="text-sm">日期<input aria-label="排班日期" type="date" value={date} disabled={saving} onChange={e=>{const v=e.target.value;if(v)leave(()=>setDate(v));}} className="block min-h-[44px] max-w-full border rounded p-2 bg-white"/></label>
   <button title="重新載入" aria-label="重新載入" disabled={saving} onClick={()=>leave(()=>setReload(n=>n+1))} className="min-h-[44px] min-w-[44px] flex justify-center items-center"><Icon name="refresh-cw" size={18}/></button>
  </div>
  {loading?<p role="status">讀取班表與白板中...</p>:error?<p role="alert">{error}</p>:<>
   <div className="flex flex-wrap justify-between gap-2 mb-3 text-sm text-slate-600"><p>{team.exists?(team.published?'已發布班表':'未發布班表（草稿）'):'本月尚無班表'} · 上班 {team.active.length} 人</p><span>待分派 {waiting.length} 人</span></div>
   <form onSubmit={addStation} className="flex gap-2 mb-3 max-w-md"><input aria-label="新增崗位名稱" placeholder="新增崗位名稱" maxLength={30} value={newName} onChange={e=>setNewName(e.target.value)} disabled={saving} className="min-w-0 flex-1 border rounded p-2 bg-white"/><button type="submit" title="新增崗位" aria-label="新增崗位" disabled={saving||!newName.trim()} className="min-h-[44px] min-w-[44px] border rounded flex items-center justify-center"><Icon name="plus" size={20}/></button></form>
   <div className="sb-layout"><div ref={viewport} className="sb-viewport" aria-label="崗位白板"><div ref={surface} className="sb-surface" style={{height:boardHeight}} onClick={e=>{if(selected&&e.target===e.currentTarget)put(selected,e.clientX,e.clientY);}}>
    <div className="sb-stations">{stations.map(s=><div className="sb-station" key={s.id}><div className="sb-heading"><button className="sb-title" title={`重新命名${s.name}`} aria-label={`重新命名${s.name}`} disabled={saving} onClick={()=>rename(s)}>{s.name}</button><button title={`刪除${s.name}`} aria-label={`刪除${s.name}`} disabled={saving} onClick={()=>remove(s)}><Icon name="x" size={16}/></button></div></div>)}</div>
    {team.active.filter(p=>placed[p.id]).map(p=><div key={p.id} className="sb-placed" style={{left:`clamp(0px, ${placed[p.id].x*100}%, calc(100% - min(112px, 28%)))`,top:`clamp(0px, ${placed[p.id].y*100}%, calc(100% - 82px))`,zIndex:selected===p.id?15:5}}>{tag(p)}</div>)}
   </div></div><aside ref={tray} className="sb-tray" aria-label="上班人員"><h3 className="font-bold text-sm mb-3">上班人員 · {team.active.length} 人／待分派 {waiting.length} 人</h3><div className="sb-roster">{team.active.map(p=><div key={p.id}>{tag(p)}<span className="block text-xs text-slate-500 mb-2">{placed[p.id]?'已放上白板':'待分派'}</span></div>)}</div>{selected&&<button className="min-h-[44px] text-sm text-blue-700" disabled={saving} onClick={()=>toTray(selected)}>移回待分派</button>}</aside></div>
   {!team.active.length&&<p className="py-4 text-sm">此日期沒有上班人員。</p>}
   <div className="flex justify-between items-center gap-3 border-t mt-4 pt-3"><span role="status" className="text-sm">{dirty?'尚未儲存':'已同步'}</span><button type="button" disabled={!dirty||saving} onClick={save} className="min-h-[44px] px-4 rounded bg-blue-600 text-white disabled:opacity-50 flex gap-2 items-center"><Icon name="save" size={18}/>{saving?'儲存中...':'儲存安排'}</button></div>
  </>}
  {ghost&&<div className="sb-ghost" style={{left:ghost.x,top:ghost.y}}>{team.active.find(p=>p.id===ghost.id)?.name}</div>}
 </div>;
};

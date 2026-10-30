window.StationAssignmentBoard = function StationAssignmentBoard({currentBranch,currentUser,db,getPublicPath,onBack,triggerNotify,Icon,BackButton}) {
 const {useState,useEffect,useRef}=React;
 const {stationColors}=window.StationBoardData;
 const [date,setDate]=useState(()=>{
  const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(new Date());
  const next=new Date(today+'T12:00:00+08:00');next.setUTCDate(next.getUTCDate()+1);
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Taipei'}).format(next);
 });
 const [schedule,setSchedule]=useState(null),[stations,setStations]=useState([]),[placements,setPlacements]=useState({}),[notes,setNotes]=useState({});
 const [revision,setRevision]=useState(0),[configRevision,setConfigRevision]=useState(0),[selected,setSelected]=useState(''),[newName,setNewName]=useState('');
 const [dirty,setDirty]=useState(false),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false),[error,setError]=useState(''),[reload,setReload]=useState(0),[ghost,setGhost]=useState(null);
 const [preview,setPreview]=useState(null),[exporting,setExporting]=useState(false);
 const [supports,setSupports]=useState([]);
 const [actionPerson,setActionPerson]=useState('');
 const [menuPosition,setMenuPosition]=useState({left:0,top:0});
 useEffect(()=>{const close=e=>{if(e.type==='keydown'&&e.key!=='Escape')return;if(e.type==='pointerdown'&&e.target.closest('.sb-tag'))return;setActionPerson('');};document.addEventListener('pointerdown',close);document.addEventListener('keydown',close);window.addEventListener('wheel',close,true);window.addEventListener('resize',close);return()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',close);window.removeEventListener('wheel',close,true);window.removeEventListener('resize',close);};},[]);
 const showActions=!!selected&&actionPerson===selected;
 const [periods,setPeriods]=useState({}),[editor,setEditor]=useState(null);
 const periodOf=p=>p.support?p.code:periods[p.id]||({morning:'早班',evening:'晚班'}[p.shiftType]||'全天');
 const openPeriod=(p,add=false)=>{const period=add?'晚班':periodOf(p);setEditor({id:p.id,add,mode:['全天','早班','晚班'].includes(period)?period:'custom',custom:period,note:notes[p.id]??p.code});};
 const generation=useRef(0),surface=useRef(null),tray=useRef(null),viewport=useRef(null),drag=useRef(null),suppressClick=useRef(false);
 const team=window.StationBoardData.roster(schedule,date,'working');
 const valid=p=>p&&stations.some(s=>s.id===p.stationId);
 const placed=Object.fromEntries(team.active.filter(p=>valid(placements[p.id])).map(p=>[p.id,placements[p.id]]));
 const waiting=team.active.filter(p=>!placed[p.id]);
 const supportPeople=supports.filter(s=>valid(s)&&team.active.some(p=>p.id===s.personId)).map(s=>({...team.active.find(p=>p.id===s.personId),id:s.id,code:s.period,support:true,stationId:s.stationId}));
 const allTags=[...team.active,...supportPeople];
 const stationPeople=id=>[...team.active.filter(p=>placed[p.id]?.stationId===id),...supportPeople.filter(p=>p.stationId===id)];
 const assign=(id,stationId)=>{if(saving)return;if(supportPeople.some(p=>p.id===id))setSupports(prev=>prev.map(s=>s.id===id?{...s,stationId}:s));else setPlacements(prev=>({...prev,[id]:{x:0,y:0,stationId}}));setSelected('');setDirty(true);};
 const addSupport=()=>{const p=team.active.find(p=>p.id===selected);if(!saving&&p&&placed[p.id])openPeriod(p,true);};
 const applyPeriod=e=>{
  e.preventDefault();const p=allTags.find(p=>p.id===editor.id);if(!p)return;
  const period=editor.mode==='custom'?editor.custom.trim().replace(/\s/g,''):editor.mode;
  if(editor.mode==='custom'&&!window.StationBoardData.periodRange(period)){triggerNotify('請輸入有效的同日時段，例如 18:00-21:00','error');return;}
  const personId=p.support?supports.find(s=>s.id===p.id).personId:p.id;
  const others=[...(placed[personId]?[team.active.find(p=>p.id===personId)]:[]),...supportPeople.filter(p=>supports.find(s=>s.id===p.id)?.personId===personId)].filter(other=>editor.add||other.id!==p.id);
  const overlap=others.map(other=>window.StationBoardData.periodsOverlap(period,periodOf(other)));
  if(overlap.includes(true)&&!window.confirm('此人已有重疊時段的崗位安排，仍要保留嗎？'))return;
  if(!overlap.includes(true)&&overlap.includes(null)&&!window.confirm('早晚班未設定確切時間，無法自動判斷與自訂時段是否重疊，確認保留？'))return;
  if(editor.add){const id='support:'+Date.now()+'-'+Math.random().toString(36).slice(2,8);setSupports(prev=>[...prev,{id,personId,stationId:placed[personId].stationId,period}]);setSelected(id);}
  else if(p.support)setSupports(prev=>prev.map(s=>s.id===p.id?{...s,period}:s));
  else {setPeriods(prev=>({...prev,[p.id]:period}));setNotes(prev=>({...prev,[p.id]:editor.note}));}
  setEditor(null);setDirty(true);
 };
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
   setPeriods(board.periods||{});setEditor(null);setPlacements(board.placements||migrated);setSupports(Array.isArray(board.supports)?board.supports:[]);setNotes(board.notes||{});setRevision(board.revision||0);setConfigRevision(config.revision||0);
  }).catch(e=>{if(run===generation.current)setError(`讀取失敗（${e.code||'network-error'}），請重試。`);}).finally(()=>{if(run===generation.current)setLoading(false);});
  return()=>{generation.current++;};
 },[currentBranch,date,reload]);
 useEffect(()=>{const warn=e=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn);},[dirty]);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview.url);},[preview]);
 const leave=fn=>{if(!saving&&(!dirty||window.confirm('尚有未儲存的安排，要放棄變更嗎？')))fn();};
 const toTray=id=>{if(saving)return;if(supportPeople.some(p=>p.id===id))setSupports(prev=>prev.filter(s=>s.id!==id));else setPlacements(prev=>{const next={...prev};delete next[id];return next;});setSelected('');setDirty(true);};
 const put=(id,clientX,clientY)=>{
  if(saving||loading||!surface.current||!allTags.some(p=>p.id===id))return;
  const target=Array.from(surface.current.querySelectorAll('[data-station]')).find(el=>inside(el.getBoundingClientRect(),clientX,clientY));
  if(!target)return;
  assign(id,target.dataset.station);
 };
 const inside=(r,x,y)=>r&&x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;
 const pointerDown=(e,id)=>{if(saving||e.button!==0)return;suppressClick.current=false;drag.current={id,x:e.clientX,y:e.clientY,moved:false};e.currentTarget.setPointerCapture(e.pointerId);};
 const pointerMove=e=>{
  const d=drag.current;if(!d)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>5)d.moved=true;if(!d.moved)return;
  setActionPerson('');setGhost({id:d.id,x:e.clientX,y:e.clientY});
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
  setSupports(prev=>prev.filter(p=>list.some(s=>s.id===p.stationId)));
  setPlacements(prev=>Object.fromEntries(Object.entries(prev).filter(([,p])=>list.some(s=>s.id===p.stationId))));
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
    tx.set(bRef,{branch:currentBranch,date,period:'all',periods:Object.fromEntries(team.active.filter(p=>periods[p.id]).map(p=>[p.id,periods[p.id]])),placements:placed,supports:supports.filter(s=>supportPeople.some(p=>p.id===s.id)),assignments:Object.fromEntries(Object.entries(placed).filter(([,p])=>p.stationId).map(([id,p])=>[id,p.stationId])),notes:validNotes,revision:revision+1,updatedAt:Date.now(),updatedBy:currentUser?.name||''});
   });
   setRevision(n=>n+1);setConfigRevision(n=>n+1);setDirty(false);triggerNotify('白板安排已儲存','success');
  }catch(e){triggerNotify(e.message==='conflict'?'其他同仁已更新看板，請重新載入後再安排。':`儲存失敗（${e.code||'network-error'}），變更已保留。`,'error');}finally{setSaving(false);}
 };
 const exportImage=async()=>{
  setExporting(true);
  try{
   const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');
   if(!ctx)throw Error('canvas');
   const wrap=(text,width)=>{const lines=[];let line='';for(const c of String(text)){if(line&&ctx.measureText(line+c).width>width){lines.push(line);line='';}line+=c;}lines.push(line);return lines;};
   ctx.font='22px sans-serif';
   const groups=stations.map(s=>({name:s.name,...stationColors(s.color),rows:stationPeople(s.id).map(p=>wrap(`${p.name} · ${periodOf(p)}${!p.support&&notes[p.id]?' · '+notes[p.id]:''}`,330))}));
   ctx.font='bold 24px sans-serif';groups.forEach(g=>{g.title=wrap(g.name,330);g.header=28*g.title.length+30;});
   const heights=[];for(let i=0;i<groups.length;i+=3)heights.push(Math.max(130,...groups.slice(i,i+3).map(g=>g.header+20+g.rows.reduce((n,r)=>n+r.length*30+12,0))));
   ctx.font='22px sans-serif';
   const pending=wrap('未分派：'+(waiting.map(p=>`${p.name}（${notes[p.id]??p.code}）`).join('、')||'無'),1100);
   canvas.width=1200;canvas.height=180+heights.reduce((a,b)=>a+b,0)+pending.length*32+60;
   ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle='#0f172a';ctx.font='bold 32px sans-serif';ctx.fillText(`${currentBranch}｜崗位安排`,40,52);
   ctx.font='22px sans-serif';ctx.fillText(`${date}　上班 ${team.active.length} 人${dirty?'　（未儲存草稿）':''}`,40,94);
   let y=130;groups.forEach((g,i)=>{if(i&&i%3===0)y+=heights[Math.floor(i/3)-1];const x=40+(i%3)*374,h=heights[Math.floor(i/3)];ctx.fillStyle=g.background;ctx.fillRect(x,y,374,h);ctx.strokeStyle='#cbd5e1';ctx.strokeRect(x,y,374,h);ctx.fillStyle=g.foreground;ctx.font='bold 24px sans-serif';g.title.forEach((line,j)=>ctx.fillText(line,x+16,y+32+j*28));ctx.font='22px sans-serif';let rowY=y+g.header+10;g.rows.forEach(lines=>{lines.forEach(line=>{ctx.fillText(line,x+16,rowY);rowY+=30;});rowY+=12;});});
   ctx.font='22px sans-serif';ctx.fillStyle='#475569';pending.forEach((line,i)=>ctx.fillText(line,40,150+heights.reduce((a,b)=>a+b,0)+i*32));
   const blob=await new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(Error('encode')),'image/png'));
   setPreview({url:URL.createObjectURL(blob),file:new File([blob],`崗位安排-${currentBranch}-${date}.png`,{type:'image/png'})});
  }catch(e){triggerNotify('圖片產生失敗，請重試。','error');}finally{setExporting(false);}
 };
 const shareImage=async()=>{try{if(navigator.canShare?.({files:[preview.file]}))await navigator.share({files:[preview.file],title:'崗位安排'});else triggerNotify('此瀏覽器不支援圖片分享，請下載圖片後傳送。','info');}catch(e){if(e.name!=='AbortError')triggerNotify('分享失敗，請改用下載圖片。','error');}};
 const tag=p=><div className="sb-tag" key={p.id} data-person={p.id}>
  <button type="button" className={`sb-name ${selected===p.id?'sb-selected':''}`} title={p.name} aria-label={`移動${p.name}${p.support?'新增時段':''}`} aria-pressed={selected===p.id} aria-expanded={showActions&&selected===p.id} disabled={saving}
   onPointerDown={e=>pointerDown(e,p.id)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={()=>{drag.current=null;setGhost(null);}}
   onClick={e=>{e.stopPropagation();if(suppressClick.current){suppressClick.current=false;return;}const r=e.currentTarget.getBoundingClientRect();setMenuPosition({left:Math.max(8,Math.min(r.left,window.innerWidth-188)),top:Math.max(8,Math.min(r.bottom+4,window.innerHeight-156))});const next=actionPerson===p.id?'':p.id;setSelected(next);setActionPerson(next);}}>{p.name}</button>
  <button type="button" className="sb-period" aria-label={`${p.name}${p.support?'新增':'主要'}時段`} title={periodOf(p)} disabled={saving} onClick={()=>openPeriod(p)}>{periodOf(p)}</button>
  {showActions&&selected===p.id&&<div className="sb-person-menu" role="group" aria-label={`${p.name}操作選單`} style={menuPosition}>{placed[p.id]&&<button type="button" disabled={saving} onClick={()=>{setActionPerson('');addSupport();}}><Icon name="plus" size={16}/>新增時段安排</button>}<button type="button" disabled={saving} onClick={()=>{setActionPerson('');openPeriod(p);}}><Icon name="clock" size={16}/>設定時段</button>{(placed[p.id]||p.support)&&<button type="button" disabled={saving} onClick={()=>toTray(p.id)}><Icon name="undo-2" size={16}/>{p.support?'移除此時段':'移回待分派'}</button>}</div>}
 </div>;
 return <div className="station-whiteboard p-3 text-left pb-6" onClick={e=>{if(!e.target.closest('button,input,select,form,[role="dialog"]')){setActionPerson('');setSelected('');}}}>
  <style>{`
   .station-whiteboard{color:#1e293b;max-width:100%;letter-spacing:0}
   .sb-layout{display:flex;flex-direction:column;gap:16px;min-width:0}
   .sb-viewport{width:100%;box-sizing:border-box;border:4px solid #94a3b8;border-radius:6px;background:#fff}
   .sb-surface{position:relative;width:100%;background:#fff;color:#1e293b}
   .sb-stations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}
   .sb-station{min-height:130px;border-right:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:8px;box-sizing:border-box;min-width:0}
   .sb-members{display:flex;flex-direction:column;gap:5px;padding-top:8px}
   .sb-heading{display:flex;align-items:center;gap:2px;pointer-events:auto}
   .sb-heading button{min-width:36px;min-height:44px;color:var(--station-ink,#475569)}
   .sb-heading .sb-title{flex:1;min-width:0;text-align:left;font-size:16px;font-weight:700;color:var(--station-ink,#1e293b);overflow-wrap:anywhere;border-bottom:3px solid currentColor;padding:4px}
   .sb-color{display:block;flex:0 0 24px;width:24px;min-width:0;height:44px;padding:2px;cursor:pointer;background:transparent;border:0;box-sizing:border-box}
   .sb-tray{width:100%;border-top:1px solid #cbd5e1;padding-top:12px}
   .sb-roster{display:flex;flex-wrap:wrap;gap:8px;align-items:flex-start}
   .sb-tag{display:flex;align-items:stretch;width:160px;max-width:100%;background:#fff;border:1px solid #94a3b8;border-radius:4px;overflow:hidden}
   .sb-person-menu{position:fixed;z-index:1000;width:180px;padding:4px;background:#fff;color:#1e293b;border:1px solid #cbd5e1;border-radius:6px;box-shadow:0 4px 16px #0002}
   .sb-person-menu button{display:flex;align-items:center;gap:8px;width:100%;min-height:44px;padding:8px;text-align:left;font-size:14px}.sb-person-menu button:hover,.sb-person-menu button:focus-visible{background:#eff6ff}
   .sb-members .sb-tag{width:100%}
   .sb-name{display:block;flex:1;min-width:0;min-height:44px;padding:5px 3px;font-size:14px;font-weight:700;color:#1e293b;background:#f1f5f9;touch-action:none;user-select:none;cursor:grab;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
   .sb-name:active{cursor:grabbing}.sb-selected{background:#dbeafe;box-shadow:inset 0 0 0 2px #2563eb}
   .sb-tag .sb-period{display:block;width:40%;min-width:0;min-height:44px;padding:2px;font-size:13px;text-align:center;overflow-wrap:anywhere;color:#475569;background:#fff;border:0;border-left:1px solid #e2e8f0;box-sizing:border-box}
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
   <div className="sb-layout"><div ref={viewport} className="sb-viewport" aria-label="崗位白板"><div ref={surface} className="sb-surface">
    <div className="sb-stations">{stations.map(s=><div className="sb-station" data-station={s.id} key={s.id} style={{backgroundColor:stationColors(s.color).background,'--station-ink':stationColors(s.color).foreground}} onClick={e=>{if(selected&&e.target===e.currentTarget)put(selected,e.clientX,e.clientY);}}><div className="sb-heading"><button className="sb-title" title={`重新命名${s.name}`} aria-label={`重新命名${s.name}`} disabled={saving} onClick={()=>rename(s)}>{s.name}</button><input type="color" className="sb-color" aria-label={`${s.name}色塊顏色`} title={`${s.name}色塊顏色`} value={stationColors(s.color).background} disabled={saving} onClick={e=>e.stopPropagation()} onChange={e=>{const color=e.target.value;setStations(prev=>prev.map(item=>item.id===s.id?{...item,color}:item));setDirty(true);}}/><button title={`刪除${s.name}`} aria-label={`刪除${s.name}`} disabled={saving} onClick={()=>remove(s)}><Icon name="x" size={16}/></button></div><div className="sb-members">{stationPeople(s.id).map(tag)}</div>{selected&&<button type="button" className="min-h-[44px] text-sm bg-white text-blue-700 rounded px-1" disabled={saving} onClick={()=>assign(selected,s.id)}>分派至此</button>}</div>)}</div>
   </div></div><aside ref={tray} className="sb-tray" aria-label="待分派人員"><h3 className="font-bold text-sm mb-3">待分派 · {waiting.length} 人</h3><div className="sb-roster">{waiting.map(tag)}</div>{!waiting.length&&<p className="text-sm text-slate-500">已全數分派</p>}</aside></div>
   {!team.active.length&&<p className="py-4 text-sm">此日期沒有上班人員。</p>}
   <button type="button" onClick={exportImage} disabled={exporting} className="my-3 min-h-[44px] border rounded px-4 flex items-center gap-2"><Icon name="image" size={18}/>{exporting?'產生圖片中...':'輸出圖片'}</button>
   <div className="flex justify-between items-center gap-3 border-t mt-4 pt-3"><span role="status" className="text-sm">{dirty?'尚未儲存':'已同步'}</span><button type="button" disabled={!dirty||saving} onClick={save} className="min-h-[44px] px-4 rounded bg-blue-600 text-white disabled:opacity-50 flex gap-2 items-center"><Icon name="save" size={18}/>{saving?'儲存中...':'儲存安排'}</button></div>
  </>}
  {editor&&<div role="dialog" aria-modal="true" aria-label="設定崗位時段" className="fixed inset-0 z-[9999] bg-black/60 p-4 flex items-center justify-center"><form onSubmit={applyPeriod} className="bg-white rounded-lg p-4 w-full max-w-sm text-slate-800"><h3 className="font-bold mb-3">{allTags.find(p=>p.id===editor.id)?.name} · {editor.add?'新增時段安排':'設定崗位時段'}</h3><label>時段<select autoFocus aria-label="崗位時段" value={editor.mode} onChange={e=>setEditor({...editor,mode:e.target.value})} className="block w-full min-h-[44px] border rounded mb-3 bg-white"><option>全天</option><option>早班</option><option>晚班</option><option value="custom">自訂時間</option></select></label>{editor.mode==='custom'&&<label>起訖時間<input aria-label="自訂起訖時間" placeholder="18:00-21:00" value={editor.custom} onChange={e=>setEditor({...editor,custom:e.target.value})} className="block w-full min-h-[44px] border rounded mb-3"/></label>}{!editor.add&&!supportPeople.some(p=>p.id===editor.id)&&<label>班別備註<input aria-label="班別備註" maxLength={40} value={editor.note} onChange={e=>setEditor({...editor,note:e.target.value})} className="block w-full min-h-[44px] border rounded mb-3"/></label>}<div className="flex justify-end gap-3"><button type="button" className="min-h-[44px] px-3" onClick={()=>setEditor(null)}>取消</button><button type="submit" className="min-h-[44px] px-3 bg-blue-600 text-white rounded">確認時段</button></div></form></div>}
  {ghost&&<div className="sb-ghost" style={{left:ghost.x,top:ghost.y}}>{allTags.find(p=>p.id===ghost.id)?.name}</div>}
  {preview&&<div role="dialog" aria-modal="true" aria-label="崗位圖片" className="fixed inset-0 z-[9999] bg-black/60 p-4 flex items-center justify-center"><div className="bg-white rounded-lg p-4 w-full max-w-3xl max-h-[90vh] overflow-auto"><div className="flex justify-between items-center mb-3"><h3>崗位圖片</h3><button aria-label="關閉圖片" className="min-h-[44px] min-w-[44px]" onClick={()=>setPreview(null)}><Icon name="x" size={20}/></button></div><img src={preview.url} alt="崗位安排圖片" className="w-full h-auto"/><div className="flex flex-wrap gap-3 mt-4"><a className="min-h-[44px] p-3 border rounded" href={preview.url} download={preview.file.name}>下載 PNG</a><button className="min-h-[44px] p-3 border rounded" onClick={shareImage}>分享圖片</button></div></div></div>}
 </div>;
};

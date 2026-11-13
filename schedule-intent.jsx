(() => {
  const { useState, useEffect } = React;
  window.ScheduleIntent = function ScheduleIntent({ currentBranch, currentUser, db, getPublicPath, onBack, Icon }) {
    const [clock,setClock] = useState(null), [month,setMonth] = useState(''), [days,setDays] = useState({});
    const [selected,setSelected] = useState(''), [kind,setKind] = useState('off'), [slots,setSlots] = useState([{start:'10:00',end:'14:00'}]);
    const [error,setError] = useState(''), [busy,setBusy] = useState(false), [ready,setReady] = useState(false), [id,setId] = useState('');
    const [message,setMessage] = useState('');
    useEffect(()=>{
      let live = true;
      fetch('/api/schedule-intent', {cache:'no-store'}).then(r=>{if(!r.ok) throw Error('無法取得截止時間');return r.json();}).then(x=>{if(live){setClock(x);setMonth(x.month);}}).catch(e=>live&&setError(e.message));
      if(currentUser?.phone) crypto.subtle.digest('SHA-256',new TextEncoder().encode('schedule-intent:'+currentUser.phone)).then(b=>live&&setId(Array.from(new Uint8Array(b)).map(x=>x.toString(16).padStart(2,'0')).join('').slice(0,24)));
      return ()=>{live=false;};
    },[currentUser?.phone]);
    useEffect(()=>{
      if(!month) return;
      setReady(false);setDays({});setSelected('');
      return db.collection(getPublicPath('schedule_intents')).doc(encodeURIComponent(currentBranch+'__'+month)).collection('days').onSnapshot(s=>{
        setDays(Object.fromEntries(s.docs.map(d=>[d.id,d.data().entries||[]])));setReady(true);
      },()=>{setReady(false);setError('讀取登記失敗，請重新開啟此頁');});
    },[month,currentBranch]);
    const entries = days[selected] || [], mine = entries.find(e=>e.id===id);
    const closed = !clock?.open || month !== clock?.month;
    function choose(date) {
      setSelected(date);setError('');setMessage('');
      const own = (days[date]||[]).find(e=>e.id===id);
      setKind(own?.kind || 'off');setSlots(own?.slots?.length ? own.slots.map(x=>({...x})) : [{start:'10:00',end:'14:00'}]);
    }
    async function save(nextKind=kind) {
      setBusy(true);setError('');setMessage('');
      try {
        const authUser = firebase.auth().currentUser;
        if(!authUser || !currentUser?.phone) throw Error('請先使用員工帳號登入');
        const token = await authUser.getIdToken();
        const r = await fetch('/api/schedule-intent',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+token},body:JSON.stringify({phone:currentUser.phone,branch:currentBranch,date:selected,kind:nextKind,slots})});
        const result = await r.json();if(!r.ok) throw Error(result.error || '送出失敗');
        setMessage(nextKind==='clear'?'已取消登記':'已儲存');
      } catch(e){setError(e.message);} finally{setBusy(false);}
    }
    const count = month ? new Date(Number(month.slice(0,4)),Number(month.slice(5)),0).getDate() : 0;
    const offset = month ? new Date(month+'-01T00:00:00+08:00').getUTCDay() : 0;
    const firstDay = month ? new Date(month+'-01T12:00:00+08:00').getUTCDay() : offset;
    const order = es => es.filter(e=>e.kind==='off').sort((a,b)=>a.submittedAt-b.submittedAt || a.id.localeCompare(b.id));
    const time = n => new Date(n).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false});
    return <main className="si-root">
      <style>{`.si-root{padding:16px;max-width:1000px;margin:auto;color:var(--t1,#24343d)}.si-root button,.si-root input,.si-root select{min-height:44px;font:inherit;border:1px solid #bcc8cf;border-radius:6px;padding:8px;background:var(--s0,#fff);color:inherit}.si-root button:disabled{opacity:.5}.si-head{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.si-head h2{font-size:20px;font-weight:700}.si-meta{margin:16px 0;font-size:14px}.si-calendar{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}.si-calendar>span{text-align:center;font-size:13px;padding:6px}.si-calendar button{padding:6px 2px;min-height:72px;display:flex;align-items:center;flex-direction:column;gap:4px}.si-calendar small{font-size:12px}.si-calendar [aria-pressed=true]{outline:2px solid #137e78;background:var(--s2,#e7f4f1)}.si-detail{margin-top:20px;padding-top:16px;border-top:1px solid #bcc8cf}.si-detail h3{font-weight:700;font-size:18px;margin-bottom:12px}.si-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:12px 0}.si-row input{min-width:0;width:120px}.si-list{list-style:none;padding:0}.si-list li{display:flex;flex-wrap:wrap;gap:8px;justify-content:space-between;padding:12px 0;border-bottom:1px solid #cbd5df}.si-list time{font-size:13px;color:var(--t2,#526675)}.si-primary{background:#136f68!important;color:white!important}.si-error{color:#b91c1c;margin:12px 0}.si-success{color:#16806c;margin:12px 0}.si-summary{margin-top:28px}.si-summary td,.si-summary th{text-align:left;padding:10px 4px;border-bottom:1px solid #bdcbd1;overflow-wrap:anywhere}.si-summary table{width:100%;table-layout:fixed}@media(max-width:380px){.si-root{padding:10px}.si-calendar{gap:3px}.si-calendar small{font-size:11px}}`}</style>
      <header className="si-head"><button onClick={onBack} aria-label="返回班表"><Icon name="arrow-left" size={20}/></button><h2>下月排班意願</h2></header>
      <div className="si-meta">{currentBranch} · {currentUser?.name || '主管檢視'}<br/>每月 20 日 23:59 截止（台灣時間） · 指定休假非核准休假</div>
      <div className="si-row"><label>排班月份 <input aria-label="排班月份" type="month" value={month} onChange={e=>setMonth(e.target.value)}/></label><span>{closed?'唯讀 / 已截止':'開放登記'}</span></div>
      {error&&<p className="si-error" role="alert">{error}</p>}{message&&<p role="status" className="si-success">{message}</p>}
      {!ready?<p role="status">讀取登記中…</p>:<>
      <div className="si-calendar">{['日','一','二','三','四','五','六'].map(d=><span key={d}>{d}</span>)}{Array.from({length:firstDay},(_,i)=><span key={'empty'+i}/>)}{Array.from({length:count},(_,i)=>{
        const date=month+'-'+String(i+1).padStart(2,'0'), es=days[date]||[], own=es.find(e=>e.id===id);
        return <button key={date} disabled={busy} onClick={()=>choose(date)} aria-pressed={selected===date} aria-label={`${date}，${order(es).length}人指定休假`}><b>{i+1}</b><small>{order(es).length} 人休</small>{own&&<small>{own.kind==='off'?'我：休':own.kind==='available'?'我：可上班':'我：不可'}</small>}</button>;
      })}</div>
      {selected&&<section className="si-detail"><h3>{selected} · 指定休假 {order(entries).length} 人</h3>
        <ol className="si-list">{order(entries).map((e,i)=><li key={e.id}><strong>{i+1}. {e.name}</strong><time>{time(e.submittedAt)}</time></li>)}</ol>
        {!order(entries).length&&<p>尚無指定休假</p>}
        <h3 style={{marginTop:20}}>兼職可上班時段</h3><ul className="si-list">{entries.filter(e=>e.kind!=='off').map(e=><li key={e.id}><strong>{e.name}</strong><span>{e.kind==='unavailable'?'不能上班':e.slots.map(s=>s.start+'～'+s.end).join('、')}</span></li>)}</ul>
        {currentUser?.phone&&<fieldset disabled={closed||busy||!id}><legend>我的登記</legend><div className="si-row"><select aria-label="登記類型" value={kind} onChange={e=>setKind(e.target.value)}><option value="off">指定休假</option><option value="available">兼職：可上班時段</option><option value="unavailable">兼職：不能上班</option></select></div>
        {kind==='available'&&<>{slots.map((s,i)=><div className="si-row" key={i}><input aria-label={`開始時間${i+1}`} type="time" value={s.start} onChange={e=>setSlots(slots.map((x,j)=>i===j?{...x,start:e.target.value}:x))}/><span>至</span><input aria-label={`結束時間${i+1}`} type="time" value={s.end} onChange={e=>setSlots(slots.map((x,j)=>i===j?{...x,end:e.target.value}:x))}/><button aria-label={`刪除時段${i+1}`} onClick={()=>setSlots(slots.filter((_,j)=>i!==j))}><Icon name="trash-2" size={16}/></button></div>)}<button onClick={()=>setSlots([...slots,{start:'17:00',end:'22:00'}])} disabled={slots.length>=8}>新增時段</button></>}
        <div className="si-row"><button className="si-primary" onClick={()=>save()}>{busy?'儲存中…':'儲存登記'}</button>{mine&&<button onClick={()=>{if(confirm('取消後重新登記會重新排序，確定取消？'))save('clear');}}>取消登記</button>}</div></fieldset>}
      </section>}
      <section className="si-summary"><h3>整月登記總覽</h3><table><thead><tr><th style={{width:85}}>日期</th><th>休假順序 / 可上班時段</th></tr></thead><tbody>{Object.keys(days).sort().filter(d=>days[d].length).map(d=><tr key={d}><td><button onClick={()=>choose(d)}>{d.slice(5)}</button></td><td>{order(days[d]).map((e,i)=><div key={e.id}>#{i+1} {e.name}（休）</div>)}{days[d].filter(e=>e.kind!=='off').map(e=><div key={e.id}>{e.name}：{e.kind==='unavailable'?'不能上班':e.slots.map(s=>s.start+'～'+s.end).join('、')}</div>)}</td></tr>)}</tbody></table></section>
      </>}
    </main>;
  };
})();

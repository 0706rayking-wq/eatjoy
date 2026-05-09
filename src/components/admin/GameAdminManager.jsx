import React, { useState, useEffect } from 'react'
import { db, getPublicPath } from '../../firebase.js'
import Icon from '../shared/Icon.jsx'

const GameAdminManager = ({ getPublicPath, triggerNotify, globalBranches }) => {
const [adminTab, setAdminTab] = useState('lobby'); // 分頁狀態：lobby, snake_settings, snake_leaderboard

const defaultActivities = [
  { id: 'snake', title: '靈蛇識食', subtitle: '淨化小食怪', img: null, isOpen: false },
  { id: 'leftover', title: '廢材不廢', subtitle: '頂尖剩食廚藝賞', img: null, isOpen: false },
  { id: 'food_research', title: '食研所', subtitle: '爆食戰線', img: null, isOpen: false },
  { id: 'gathering', title: '饗聚一堂', subtitle: '員餐與茶點', img: null, isOpen: false }
];

const [config, setConfig] = useState({ isOpen: false, bossName: '被感染的小雷神', bossImg: null, bgImg: null, questions: [], activities: defaultActivities });
const [showModal, setShowModal] = useState(false);
const [qForm, setQForm] = useState({ q: '', a: '', b: '', c: '', d: '', ansIdx: 0 });

// --- 全台總排行榜狀態與抓取邏輯 ---
const [globalLeaderboard, setGlobalLeaderboard] = useState([]);
const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
const [globalTab, setGlobalTab] = useState('scores'); 

const activitiesList = config.activities || defaultActivities;

const fetchGlobalLeaderboard = async () => {
  if (!globalBranches || globalBranches.length === 0) return;
  setIsLoadingLeaderboard(true);
  try {
    let allRecords = [];
    await Promise.all(globalBranches.map(async (branch) => {
      const snap = await db.collection(getPublicPath(`game_leaderboard_${branch}`)).orderBy('score', 'desc').get();
      snap.forEach(doc => {
        allRecords.push({ id: doc.id, branch, ...doc.data() });
      });
    }));
    allRecords.sort((a, b) => b.score - a.score);
    setGlobalLeaderboard(allRecords); 
  } catch (error) {
    console.error("讀取總排行榜失敗", error);
    triggerNotify("讀取排行榜失敗", "error");
  }
  setIsLoadingLeaderboard(false);
};

const handleResetLeaderboard = async () => {
  const pwd = window.prompt("⚠️ 警告：這將會清空「全台所有分店」的排行榜紀錄！\n請輸入最高權限密碼「0706」確認執行：");
  if (pwd !== '0706') {
    if (pwd !== null) triggerNotify("密碼錯誤，已取消清空作業", "error");
    return;
  }
  setIsLoadingLeaderboard(true);
  try {
    await Promise.all(globalBranches.map(async (branch) => {
      const snapshot = await db.collection(getPublicPath(`game_leaderboard_${branch}`)).get();
      const batch = db.batch();
      snapshot.forEach(doc => { batch.delete(doc.ref); });
      await batch.commit();
    }));
    triggerNotify("全台排行榜已成功清空！", "success");
    fetchGlobalLeaderboard(); 
  } catch (error) {
    console.error("清空失敗", error);
    triggerNotify("清空失敗，請檢查網路狀態", "error");
  }
  setIsLoadingLeaderboard(false);
};

useEffect(() => {
  fetchGlobalLeaderboard();
}, [globalBranches, getPublicPath]);

useEffect(() => {
  const unsub = db.doc(getPublicPath('system/game_config')).onSnapshot(d => {
    if(d.exists) setConfig(d.data());
  });
  return () => unsub();
}, [getPublicPath]);

const saveConfig = (updates) => {
  db.doc(getPublicPath('system/game_config')).set(updates, { merge: true });
};

const handleSaveActivity = (id, field, value) => {
  const newActivities = [...activitiesList];
  const idx = newActivities.findIndex(a => a.id === id);
  if (idx > -1) {
    newActivities[idx][field] = value;
    saveConfig({ activities: newActivities });
  } else if (config.activities === undefined && defaultActivities.find(a => a.id === id)) {
    // 如果資料庫以前沒建立過 activities 陣列，首次觸發時建立
    const initialActivities = [...defaultActivities];
    initialActivities.find(a => a.id === id)[field] = value;
    saveConfig({ activities: initialActivities });
  }
};

const handleSaveQuestion = () => {
  if(!qForm.q || !qForm.a || !qForm.b || !qForm.c || !qForm.d) {
    triggerNotify("請填寫完整題目與四個選項", "error");
    return;
  }
  const newQ = { 
    q: qForm.q, 
    a: qForm.a, 
    b: qForm.b, 
    c: qForm.c, 
    d: qForm.d, 
    ansIdx: parseInt(qForm.ansIdx) 
  };
  const updatedQs = [...(config.questions || []), newQ];
  saveConfig({ questions: updatedQs });
  setShowModal(false);
  setQForm({ q: '', a: '', b: '', c: '', d: '', ansIdx: 0 });
  triggerNotify("題目已成功新增！", "success");
};

const handleDelete = (idx) => {
  if(!window.confirm("確定刪除此題？")) return;
  const updatedQs = config.questions.filter((_, i) => i !== idx);
  saveConfig({ questions: updatedQs });
  triggerNotify("題目已刪除", "info");
};

const currentGlobalList = globalTab === 'scores' 
  ? globalLeaderboard.slice(0, 100) 
  : Object.values(globalLeaderboard.reduce((acc, curr) => {
    const key = curr.branch + '_' + curr.name; 
    if (!acc[key] || acc[key].score < curr.score) {
      acc[key] = curr;
    }
    return acc;
  }, {})).sort((a, b) => b.score - a.score).slice(0, 100); 

return (
  <div className="space-y-6 animate-in fade-in">
    
    {/* --- 後台分頁導覽列 --- */}
    <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar gap-1.5 shadow-inner">
      <button onClick={()=>setAdminTab('lobby')} className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${adminTab==='lobby'?'bg-white text-brand-red shadow-sm':'text-slate-400'}`}>活動卡片設定</button>
      <button onClick={()=>setAdminTab('snake_settings')} className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${adminTab==='snake_settings'?'bg-white text-brand-red shadow-sm':'text-slate-400'}`}>靈蛇識食-設定</button>
      <button onClick={()=>setAdminTab('snake_leaderboard')} className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${adminTab==='snake_leaderboard'?'bg-white text-brand-red shadow-sm':'text-slate-400'}`}>靈蛇識食-榜單</button>
    </div>

    {/* === 分頁一：大廳卡片設定 === */}
    {adminTab === 'lobby' && (
      <div className="space-y-4">
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs font-bold text-amber-700 leading-relaxed shadow-inner mb-4">
          💡 提示：在這裡控制前台「限時活動大廳」各個主題卡片的外觀與開放狀態。<br/>若該活動尚未開發完成，請保持「隱藏狀態」，前台點擊時將會顯示「建置中」。
        </div>
        {activitiesList.map(act => (
          <div key={act.id} className={`glass-panel p-5 rounded-[2rem] bg-white border shadow-sm space-y-3 transition-all ${act.isOpen ? 'border-l-4 border-l-emerald-500' : 'opacity-80'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-sm text-slate-800 flex items-center gap-2"><Icon name="layout-template" size={16} className="text-brand-red"/> 卡片：{act.title}</h3>
              <button onClick={() => handleSaveActivity(act.id, 'isOpen', !act.isOpen)}
                  className={`px-4 py-2 rounded-full text-[10px] font-black transition-all shadow-sm ${act.isOpen ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500 hover:bg-slate-300'}`}>
                {act.isOpen ? "✅ 前台開放中" : "🔒 已隱藏 (鎖定)"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 pl-1">主標題</label><input value={act.title} onChange={e => handleSaveActivity(act.id, 'title', e.target.value)} className="w-full input-light p-3 rounded-xl text-xs font-bold outline-none" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 pl-1">副標題</label><input value={act.subtitle} onChange={e => handleSaveActivity(act.id, 'subtitle', e.target.value)} className="w-full input-light p-3 rounded-xl text-xs font-bold outline-none" /></div>
            </div>
            <label className="block w-full bg-slate-50 border border-dashed border-slate-300 py-4 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-slate-100 transition-all mt-2">
              {act.img ? "✅ 卡片封面圖已設定 (點擊可更換)" : "+ 上傳卡片封面圖 (建議長寬比 4:3 或 16:9)"}
              <input type="file" className="hidden" accept="image/*" onChange={async (e)=>{
                const file = e.target.files[0];
                if (file) {
                  const r = new FileReader();
                  r.onloadend = async () => {
                    const compressed = await compressImage(r.result, 800, 0.6);
                    handleSaveActivity(act.id, 'img', compressed);
                    triggerNotify("封面圖上傳成功","success");
                  };
                  r.readAsDataURL(file);
                }
              }}/>
            </label>
            {act.img && (
              <div className="relative mt-2">
                <img src={act.img} className="w-full h-32 object-cover rounded-xl border shadow-inner" />
                <button onClick={() => handleSaveActivity(act.id, 'img', null)} className="absolute top-2 right-2 bg-slate-900/60 hover:bg-red-500 text-white p-1.5 rounded-full backdrop-blur-sm transition-all"><Icon name="x" size={14}/></button>
              </div>
            )}
          </div>
        ))}
      </div>
    )}

    {/* === 分頁二：貪食蛇魔王與題庫設定 === */}
    {adminTab === 'snake_settings' && (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-black text-sm flex items-center gap-2"><Icon name="gamepad-2" className="text-brand-red"/> 靈蛇識食：內部設定</h3>
          </div>
          <div className="space-y-3">
            <label className="text-[10px] text-slate-400 font-bold">遊戲內魔王名稱</label>
            <input type="text" value={config.bossName || ''} onChange={(e) => saveConfig({ bossName: e.target.value })} className="w-full bg-white/10 p-3 rounded-xl text-sm outline-none text-white focus:ring-1 focus:ring-brand-red" placeholder="例：食安大魔王"/>
            
            <div className="grid grid-cols-2 gap-3 pt-2">
              <label className="block w-full bg-white/10 border border-dashed border-white/20 py-3 px-2 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-white/20 transition-all">
                {config.bossImg ? "✅ 魔王大頭照已設 (點擊換)" : "+ 上傳魔王照 (正方形)"}
                <input type="file" className="hidden" accept="image/*" onChange={async (e)=>{
                  const file = e.target.files[0];
                  if (file) {
                    const r = new FileReader();
                    r.onloadend = async () => {
                      const compressed = await compressImage(r.result, 400, 0.6);
                      saveConfig({ bossImg: compressed });
                      triggerNotify("魔王圖片上傳成功","success");
                    };
                    r.readAsDataURL(file);
                  }
                }}/>
              </label>
              <label className="block w-full bg-white/10 border border-dashed border-white/20 py-3 px-2 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-white/20 transition-all">
                {config.bgImg ? "✅ 遊戲背板圖已設 (點擊換)" : "+ 上傳遊戲背板浮水印"}
                <input type="file" className="hidden" accept="image/*" onChange={async (e)=>{
                  const file = e.target.files[0];
                  if (file) {
                    const r = new FileReader();
                    r.onloadend = async () => {
                      const compressed = await compressImage(r.result, 800, 0.6);
                      saveConfig({ bgImg: compressed });
                      triggerNotify("背景圖片上傳成功","success");
                    };
                    r.readAsDataURL(file);
                  }
                }}/>
              </label>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 rounded-[2.5rem] bg-white border shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-brand-red text-sm flex items-center gap-2">
              <Icon name="list" size={18} /> 題庫管理 ({(config.questions || []).length}題)
            </h3>
            <button onClick={() => setShowModal(true)} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] font-black shadow-sm active:scale-95 transition-all">+ 新增題目</button>
          </div>
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
            {(config.questions || []).map((item, idx) => {
              const isArr = Array.isArray(item);
              const qText = isArr ? item[0] : item.q;
              const optA = isArr ? item[1] : item.a;
              const optB = isArr ? item[2] : item.b;
              const optC = isArr ? item[3] : item.c;
              const optD = isArr ? item[4] : item.d;
              const ans = isArr ? item[5] : item.ansIdx;

              return (
                <div key={idx} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-start gap-4 shadow-sm">
                  <div className="flex-1">
                    <p className="font-black text-xs text-slate-800 mb-2">Q{idx+1}: {qText}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-bold">
                      <span className={`p-1.5 rounded-md ${ans===0?"bg-emerald-100 text-emerald-700 border-emerald-200 border":"bg-white border"}`}>A: {optA}</span>
                      <span className={`p-1.5 rounded-md ${ans===1?"bg-emerald-100 text-emerald-700 border-emerald-200 border":"bg-white border"}`}>B: {optB}</span>
                      <span className={`p-1.5 rounded-md ${ans===2?"bg-emerald-100 text-emerald-700 border-emerald-200 border":"bg-white border"}`}>C: {optC}</span>
                      <span className={`p-1.5 rounded-md ${ans===3?"bg-emerald-100 text-emerald-700 border-emerald-200 border":"bg-white border"}`}>D: {optD}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(idx)} className="text-slate-300 hover:text-red-500 p-2 bg-white rounded-lg border shadow-sm active:scale-90 transition-all"><Icon name="trash-2" size={16}/></button>
                </div>
              );
            })}
            {!(config.questions?.length > 0) && <p className="text-center text-slate-400 text-xs py-8 glass-panel rounded-2xl">目前尚無題目，請點擊上方新增</p>}
          </div>
        </div>
      </div>
    )}

    {/* === 分頁三：貪食蛇全台傷害戰力榜 === */}
    {adminTab === 'snake_leaderboard' && (
      <div className="glass-panel p-6 rounded-[2.5rem] bg-white border shadow-sm space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-2"><Icon name="trophy" size={18} className="text-amber-500" /> 全台傷害戰力榜</h3>
          <div className="flex items-center gap-2">
            <button onClick={handleResetLeaderboard} disabled={isLoadingLeaderboard} className="bg-red-50 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-all flex items-center gap-1 shadow-sm border border-red-100">
              <Icon name="trash-2" size={14} /> 清空榜單
            </button>
            <button onClick={fetchGlobalLeaderboard} disabled={isLoadingLeaderboard} className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black active:scale-95 transition-all flex items-center gap-1 shadow-sm">
              <Icon name="refresh-cw" size={14} className={isLoadingLeaderboard ? "animate-spin" : ""} /> {isLoadingLeaderboard ? '讀取中' : '更新'}
            </button>
          </div>
        </div>

        <div className="flex bg-slate-50 p-1 rounded-xl mb-4 w-full max-w-[320px]">
          <button onClick={() => setGlobalTab('scores')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${globalTab === 'scores' ? 'bg-white text-amber-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>歷史高分 (可重複)</button>
          <button onClick={() => setGlobalTab('employees')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${globalTab === 'employees' ? 'bg-white text-amber-600 shadow-sm border border-slate-200' : 'text-slate-400 hover:text-slate-600'}`}>員工實力榜 (不重複)</button>
        </div>
        
        <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
          {isLoadingLeaderboard ? (
            <p className="text-center text-slate-400 text-xs py-8 animate-pulse">正在彙整全台分店數據...</p>
          ) : currentGlobalList.length > 0 ? (
            currentGlobalList.map((player, idx) => (
              <div key={`${player.branch}-${player.id || player.timestamp}`} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${idx === 0 ? 'bg-amber-50 border-amber-200' : (idx === 1 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100')}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-xl w-6 text-center ${idx === 0 ? 'text-amber-500' : (idx === 1 ? 'text-slate-400' : 'text-slate-300')}`}>{idx + 1}</span>
                  <div>
                    <div className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      {player.name}
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md font-bold shadow-inner">{player.branch}</span>
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 flex items-center gap-1"><Icon name="clock" size={10}/> {new Date(player.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-brand-red text-2xl">{player.score}</span> <span className="text-[10px] text-slate-400 font-bold">點</span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-slate-400 text-xs py-8 glass-panel rounded-2xl border border-dashed">目前全台尚無挑戰紀錄</p>
          )}
        </div>
      </div>
    )}

    {/* 新增題目彈窗 */}
    {showModal && (
      <div className="fixed inset-0 z-[10000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 page-enter">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-lg text-slate-800 flex items-center gap-2"><Icon name="plus-circle" className="text-brand-red"/> 新增挑戰題目</h3>
            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors active:scale-90"><Icon name="x" size={20}/></button>
          </div>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 ml-1">題目內容</label>
              <textarea value={qForm.q} onChange={e=>setQForm({...qForm, q: e.target.value})} className="w-full input-light p-4 rounded-2xl text-sm font-bold outline-none border-slate-200 focus:border-brand-red focus:ring-1 focus:ring-brand-red" rows="2" placeholder="請輸入問題敘述..."></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 ml-1">選項 A</label><input value={qForm.a} onChange={e=>setQForm({...qForm, a: e.target.value})} className="w-full input-light p-3 rounded-xl text-sm font-bold outline-none" placeholder="選項內容" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 ml-1">選項 B</label><input value={qForm.b} onChange={e=>setQForm({...qForm, b: e.target.value})} className="w-full input-light p-3 rounded-xl text-sm font-bold outline-none" placeholder="選項內容" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 ml-1">選項 C</label><input value={qForm.c} onChange={e=>setQForm({...qForm, c: e.target.value})} className="w-full input-light p-3 rounded-xl text-sm font-bold outline-none" placeholder="選項內容" /></div>
              <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-500 ml-1">選項 D</label><input value={qForm.d} onChange={e=>setQForm({...qForm, d: e.target.value})} className="w-full input-light p-3 rounded-xl text-sm font-bold outline-none" placeholder="選項內容" /></div>
            </div>
            <div className="space-y-1.5 pt-2">
              <label className="text-[10px] font-black text-emerald-600 ml-1">正確答案是？</label>
              <div className="relative">
                <select value={qForm.ansIdx} onChange={e=>setQForm({...qForm, ansIdx: e.target.value})} className="w-full input-light p-4 rounded-xl text-sm font-black outline-none bg-emerald-50 border-emerald-200 text-emerald-700 appearance-none">
                  <option value={0}>A 選項為正解</option><option value={1}>B 選項為正解</option><option value={2}>C 選項為正解</option><option value={3}>D 選項為正解</option>
                </select>
                <Icon name="chevron-down" size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
              </div>
            </div>
            <button onClick={handleSaveQuestion} className="w-full mt-4 bg-brand-red text-white font-black py-4 rounded-2xl shadow-lg shadow-brand-red/20 active:scale-95 transition-all text-sm">確認儲存題目</button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};

export default GameAdminManager

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { db, getPublicPath } from '../../firebase.js'
import Icon from '../shared/Icon.jsx'
import SignaturePad from '../shared/SignaturePad.jsx'
import { UniversalListManager, RecipeAdminManager, AnnouncementAdminManager } from '../shared/managers.jsx'

const AdminPage = ({ onBack, onLogout, announcements, standards, users, triggerNotify, menu, onboarding, benefits, rulesData, isSuperAdmin, currentBranch, setCurrentBranch, globalBranches, branchZones, getPublicPath, signatures, tickerText, setTickerText, globalRecipes, currentUser }) => {
const [tab, setTab] = useState('members'); const [subCat, setSubCat] = useState('list');
const [selectedZone, setSelectedZone] = useState('');
const [signSubCat, setSignSubCat] = useState('廚房規則');
const [newZoneName, setNewZoneName] = useState('');
const [newBranchName, setNewBranchName] = useState('');
const [expandedSig, setExpandedSig] = useState(null);

// 新增：編輯人員狀態
const [editingUser, setEditingUser] = useState(null);
const [editFormData, setEditFormData] = useState({ role: '', branches: [] });

useEffect(() => {
  if(branchZones && branchZones.length > 0 && !selectedZone) setSelectedZone(branchZones[0].id);
}, [branchZones]);

// 過濾顯示的成員 (相容字串與陣列)
const visibleUsers = users.filter(u => {
  const uBranches = Array.isArray(u.branch) ? u.branch : [u.branch].filter(Boolean);
  if (isSuperAdmin) {
    return uBranches.includes(currentBranch) || u.role === '主管';
  } else {
    return uBranches.includes(currentBranch) && u.role !== '主管';
  }
});

// 儲存編輯後的人員資料
const handleSaveUserEdit = async () => {
  if(editFormData.branches.length === 0) {
    triggerNotify("請至少選擇一間分店", "error");
    return;
  }
  try {
    await db.collection(getPublicPath('users')).doc(editingUser.phone).update({
      role: editFormData.role,
      branch: editFormData.branches
    });
    triggerNotify("員工資料更新成功", "success");
    setEditingUser(null);
  } catch(e) { triggerNotify("更新失敗", "error"); }
};

return (
  <div className="p-4 pb-24 page-enter text-left font-bold">
    <div className="flex justify-between items-center mb-4"><BackButton onClick={onBack} title="管理後台" /><button onClick={onLogout} className="bg-red-50 text-red-600 font-black text-[10px] px-4 py-2 rounded-full border border-red-100 active:scale-90 transition-all">登出</button></div>
    
{/* 支援最高權限與多店主管：後台快速切換分店 */}
    {(isSuperAdmin || (Array.isArray(currentUser?.branch) && currentUser.branch.length > 1)) && (
      <div className="mb-6 bg-slate-900 text-white p-4 rounded-3xl flex items-center justify-between shadow-xl mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">目前管理分店</p>
          <select 
            value={currentBranch} 
            onChange={e => setCurrentBranch(e.target.value)} 
            className="bg-transparent border-none text-lg font-black outline-none appearance-none cursor-pointer text-white"
          >
            {(isSuperAdmin ? globalBranches : currentUser.branch).map(b => (
              <option key={b} value={b} className="text-slate-900">{b}</option>
            ))}
          </select>
        </div>
        <Icon name="chevron-down" className="text-brand-red"/>
      </div>
    )}

    <div className="flex bg-slate-100 p-1.5 rounded-2xl overflow-x-auto no-scrollbar gap-1.5 mb-6 shadow-inner">
      {[{id:'members',n:'人員'},{id:'menu',n:'菜單'},{id:'content',n:'公告'},{id:'onboard',n:'入職'},{id:'benefit',n:'福利'},{id:'rules',n:'守則'},{id:'safety',n:'各店巡視'},{id:'sign',n:'簽署'}, ...(isSuperAdmin ? [{id:'system',n:'系統設定'}, {id:'game',n:'限時活動'}] : [])].map(t => (
        <button key={t.id} onClick={()=>{setTab(t.id); if(t.id==='rules') setSubCat('廚房規則'); else if(t.id==='sign') setSignSubCat('廚房規則'); else if(t.id==='benefit') setSubCat('eval'); else setSubCat('list');}} className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab===t.id?'bg-brand-red text-white shadow-md':'text-slate-400'}`}>{t.n}</button>
      ))}
    </div>
    
    <div className="space-y-4">
      {tab === 'members' && (
        <div>
          <h3 className="text-xs text-slate-400 mb-2 pl-2">顯示：{isSuperAdmin ? `${currentBranch} 人員 & 全部分店主管` : `${currentBranch} 店內人員`}</h3>
          {visibleUsers.map(u=>{
            const displayBranches = Array.isArray(u.branch) ? u.branch.join(', ') : u.branch;
            return (
            <div key={u.phone} className="glass-panel p-4 rounded-[2rem] border flex justify-between items-center bg-white mb-2 shadow-sm">
              <div className="flex-1 min-w-0 pr-2">
                <p className="font-bold text-slate-800 mb-1 flex flex-wrap items-center gap-2">
                  {u.name} 
                  <span className={`text-[9px] px-2 py-0.5 rounded-full whitespace-nowrap ${u.role==='主管' ? 'bg-brand-red text-white' : 'bg-slate-100 text-slate-500'}`}>{u.role}</span>
                  <span className="text-[9px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]" title={displayBranches}>{displayBranches}</span>
                </p>
                <p className="text-[10px] text-slate-400">{u.phone}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                {u.status==='pending' ? (
                  <button onClick={()=>db.collection(getPublicPath('users')).doc(u.phone).update({status:'approved'})} className="bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-[10px] font-black active:scale-95 shadow-sm">核准</button>
                ) : (
                  <span className="text-[9px] font-black text-emerald-600 border px-2.5 py-1.5 rounded-lg bg-emerald-50 flex items-center">已授權</span>
                )}
                {/* 新增：編輯按鈕 */}
                <button onClick={() => {
                  setEditingUser(u);
                  setEditFormData({
                    role: u.role || '正職人員',
                    branches: Array.isArray(u.branch) ? u.branch : [u.branch].filter(Boolean)
                  });
                }} className="p-2 text-slate-400 hover:text-blue-500 transition-all bg-slate-50 rounded-xl hover:bg-blue-50">
                  <Icon name="edit-3" size={16}/>
                </button>
                {/* 修改：加上防呆二次確認 */}
                <button onClick={() => {
                  if(window.confirm(`確定要刪除「${u.name}」的帳號嗎？此動作無法復原。`)) {
                    db.collection(getPublicPath('users')).doc(u.phone).delete();
                    triggerNotify("員工帳號已刪除", "info");
                  }
                }} className="p-2 text-slate-400 hover:text-red-500 transition-all bg-slate-50 rounded-xl hover:bg-red-50">
                  <Icon name="trash-2" size={16}/>
                </button>
              </div>
            </div>
          )})}
          {visibleUsers.length === 0 && <p className="text-center text-slate-400 py-10 text-xs">尚無人員紀錄</p>}
        </div>
      )}
      
      {/* === 編輯人員 Modal === */}
      {editingUser && (
        <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 page-enter">
          <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative">
            <h3 className="text-xl font-black text-slate-800 mb-4 flex items-center gap-2">
              <Icon name="user" className="text-brand-red" /> 變更員工資料
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-500 mb-1">員工</p>
                <p className="font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border">{editingUser.name} ({editingUser.phone})</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 mb-1">職位 / 權限</p>
                <select
                  value={editFormData.role}
                  onChange={e => setEditFormData({...editFormData, role: e.target.value})}
                  className="w-full bg-white border border-slate-200 p-3 rounded-xl outline-none font-bold text-sm"
                >
                  <option value="正職人員">正職人員</option>
                  <option value="計時人員">計時人員</option>
                  <option value="主管">主管 (有後台管理權限)</option>
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-500 mb-2">
                  所屬分店 {isSuperAdmin ? '(可複選)' : '(僅最高權限可變更)'}
                </p>
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar p-3 bg-slate-50 rounded-xl border border-slate-100">
                  {globalBranches.map(b => (
                    <label key={b} className={`flex items-center gap-3 ${isSuperAdmin ? 'cursor-pointer' : 'cursor-not-allowed opacity-70'}`}>
                      <input
                        type="checkbox"
                        checked={editFormData.branches.includes(b)}
                        onChange={(e) => {
                          if (!isSuperAdmin) return; // 防呆：不是最高權限就不能改
                          if(e.target.checked) {
                            setEditFormData({...editFormData, branches: [...editFormData.branches, b]});
                          } else {
                            setEditFormData({...editFormData, branches: editFormData.branches.filter(br => br !== b)});
                          }
                        }}
                        disabled={!isSuperAdmin} // 鎖定勾選框
                        className="w-4 h-4 accent-brand-red rounded disabled:grayscale"
                      />
                      <span className="font-bold text-sm text-slate-700">{b}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingUser(null)} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-xl active:scale-95 transition-all text-sm">取消</button>
                <button onClick={handleSaveUserEdit} className="flex-1 bg-brand-red text-white font-black py-4 rounded-xl active:scale-95 transition-all shadow-lg shadow-brand-red/20 text-sm">儲存變更</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {tab === 'menu' && <RecipeAdminManager categoryPath="menu/list" currentBranch={currentBranch} globalBranches={globalBranches} isSuperAdmin={isSuperAdmin} items={menu?.items || []} triggerNotify={triggerNotify} getPublicPath={getPublicPath} categories={MENU_CATEGORIES} globalRecipes={globalRecipes} />}
      
      {tab === 'content' && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-[2.5rem] bg-white border shadow-sm space-y-4">
            <h3 className="font-black text-slate-800 text-xs flex items-center gap-2 uppercase tracking-widest"><Icon name="megaphone" size={16} className="text-brand-red" />跑馬燈 ({currentBranch})</h3>
            <textarea value={tickerText} onChange={e=>setTickerText(e.target.value)} rows="2" className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none" placeholder="公告文字..." />
            <button onClick={()=>db.doc(getPublicPath(`ticker/branch_${currentBranch}`)).set({ text: tickerText }).then(()=>triggerNotify(`跑馬燈已同步至 ${currentBranch}`,"success"))} className="w-full bg-slate-900 text-white font-black py-3 rounded-xl text-[10px]">更新分店跑馬燈</button>
          </div>
          <AnnouncementAdminManager currentBranch={currentBranch} globalBranches={globalBranches} isSuperAdmin={isSuperAdmin} announcements={announcements} triggerNotify={triggerNotify} getPublicPath={getPublicPath} />
        </div>
      )}

      {tab === 'onboard' && (
        <div>
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            {[{id:'list',n:'清單'},{id:'parking',n:'停車'},{id:'video',n:'影片'}].map(c=>(
              <button key={c.id} onClick={()=>setSubCat(c.id)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${subCat===c.id?'bg-white text-brand-red shadow-sm':'text-slate-400'}`}>{c.n}</button>
            ))}
          </div>
          {subCat === 'video' ? (
            <div className="space-y-4 bg-white p-6 rounded-[2.5rem] border shadow-sm">
              {[{f:'routeBusUrl', l:'大眾運輸引導影片連結'}, {f:'routeCarUrl', l:'自行前往引導影片連結'}].map(x => (
                <div key={x.f} className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 ml-1 uppercase">{x.l}</p>
                  <input placeholder="貼上外部連結..." className="w-full input-light p-4 rounded-xl text-xs outline-none" onBlur={(e) => db.doc(getPublicPath(`onboarding/settings_${currentBranch}`)).set({ [x.f]: e.target.value }, {merge:true}).then(()=>triggerNotify("網址儲存成功","success"))} defaultValue={onboarding?.[x.f] || ''} />
                </div>
              ))}
            </div>
          ) : <UniversalListManager categoryPath={subCat==='list'?'onboarding/list':'onboarding/parking'} currentBranch={currentBranch} globalBranches={globalBranches} isSuperAdmin={isSuperAdmin} items={subCat==='list'?(onboarding?.list || []):(onboarding?.parking || [])} triggerNotify={triggerNotify} getPublicPath={getPublicPath} />}
        </div>
      )}

      {tab === 'benefit' && (
        <div>
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            {[{id:'eval',n:'考核'},{id:'wel',n:'福利'}].map(c=>(
              <button key={c.id} onClick={()=>setSubCat(c.id)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold ${subCat===c.id?'bg-white text-brand-red shadow-sm':'text-slate-400'}`}>{c.n}</button>
            ))}
          </div>
          <UniversalListManager categoryPath={subCat==='eval'?'benefits/eval':'benefits/welfare'} currentBranch={currentBranch} globalBranches={globalBranches} isSuperAdmin={isSuperAdmin} items={subCat==='eval'?(benefits?.evaluation || []):(benefits?.welfare || [])} triggerNotify={triggerNotify} getPublicPath={getPublicPath} />
        </div>
      )}

      {tab === 'rules' && (
        <div>
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 overflow-x-auto no-scrollbar">
            {RULE_CATEGORIES.map(c=>(<button key={c} onClick={()=>setSubCat(c)} className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold ${subCat===c?'bg-white text-brand-red shadow-sm':'text-slate-400'}`}>{c}</button>))}
          </div>
          <UniversalListManager categoryPath={`rules/${subCat}`} currentBranch={currentBranch} globalBranches={globalBranches} isSuperAdmin={isSuperAdmin} items={rulesData[subCat] || []} triggerNotify={triggerNotify} getPublicPath={getPublicPath} />
        </div>
      )}

      {tab === 'safety' && (
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-[2.5rem] bg-white border shadow-sm space-y-4">
            <h3 className="font-black text-brand-red text-sm flex items-center gap-2"><Icon name="layout-grid" size={18} /> {currentBranch} 區站管理</h3>
            <div className="flex gap-3">
              <input placeholder="新區站名稱..." value={newZoneName} onChange={e=>setNewZoneName(e.target.value)} className="flex-1 input-light p-4 rounded-xl text-sm min-w-0" />
              <button onClick={()=>{
                if(!newZoneName.trim()) return;
                const newZ = [...branchZones, { id: Date.now().toString(), name: newZoneName }];
                db.doc(getPublicPath(`config/zones_${currentBranch}`)).set({ zones: newZ }).then(()=>{setNewZoneName(''); triggerNotify("區站新增成功", "success");});
              }} className="bg-slate-900 text-white px-6 py-4 rounded-xl text-sm font-black shrink-0 whitespace-nowrap shadow-sm">新增</button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {branchZones.map(z => (
                <div key={z.id} className="bg-slate-50 px-3 py-2 rounded-xl text-xs flex justify-between items-center border">
                  <span>{z.name}</span>
                  <button onClick={()=>{
                    const newZ = branchZones.filter(bz => bz.id !== z.id);
                    db.doc(getPublicPath(`config/zones_${currentBranch}`)).set({ zones: newZ });
                  }} className="text-slate-400 hover:text-red-500"><Icon name="x" size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          {branchZones.length > 0 && (
            <div className="glass-panel p-6 rounded-[2.5rem] space-y-4 bg-white border text-left">
              <h3 className="font-black text-brand-red text-sm flex items-center gap-2"><Icon name="camera" size={18} /> {currentBranch} 巡視標準設定</h3>
              <select value={selectedZone} onChange={e=>setSelectedZone(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none">
                {branchZones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 border shadow-inner">
                <input id="std-note" placeholder="檢查標註..." className="w-full input-light p-3 rounded-xl text-xs outline-none" />
                <label className="bg-slate-900 text-white w-full block py-4 rounded-xl text-[10px] font-black text-center cursor-pointer active:scale-95 transition-all">上傳標準照<input type="file" className="hidden" onChange={e=>{const f=e.target.files[0]; if(f){const r=new FileReader(); const note=document.getElementById('std-note').value; r.onloadend=async ()=>{ const compressed = await compressImage(r.result, 800, 0.5); db.collection(getPublicPath(`standards_${currentBranch}`)).add({ zoneId: selectedZone, url: compressed, note: note, timestamp: Date.now() }).then(() => { document.getElementById('std-note').value=''; triggerNotify("標準圖已同步","success"); }); }; r.readAsDataURL(f);}}}/></label>
              </div>
              <div className="space-y-3 mt-4">{(standards[selectedZone] || []).map(item => (<div key={item.id} className="bg-white p-3 rounded-2xl border flex gap-4 items-center shadow-sm"><img src={item.url} className="w-12 h-12 rounded-lg object-cover" /><div className="flex-1 text-xs">{item.note}</div><button onClick={()=>db.collection(getPublicPath(`standards_${currentBranch}`)).doc(item.id).delete()} className="text-slate-300 active:text-red-500"><Icon name="x" size={14}/></button></div>))}</div>
            </div>
          )}
        </div>
      )}
      {tab === 'sign' && (
        <div className="space-y-4">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-4 overflow-x-auto no-scrollbar">{RULE_CATEGORIES.map(c => (<button key={c} onClick={() => setSignSubCat(c)} className={`shrink-0 px-4 py-2 rounded-lg text-[10px] font-bold transition-all ${signSubCat === c ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>{c}</button>))}</div>
          <div className="space-y-2">
            {signatures.filter(s => s.category === `守則簽署 - ${signSubCat}` && (isSuperAdmin ? true : s.branch === currentBranch)).map((s, i) => (
              <div key={s.id || i} className="bg-white rounded-[2rem] border shadow-sm overflow-hidden transition-all">
                <div onClick={()=>setExpandedSig(expandedSig === i ? null : i)} className="p-5 flex justify-between items-center cursor-pointer active:bg-slate-50">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-800">{s.userName}</span>
                    {isSuperAdmin && s.branch !== currentBranch && <span className="text-[9px] bg-slate-100 text-slate-400 px-2 rounded-full">{s.branch}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">{new Date(s.timestamp).toLocaleDateString()}</span>
                    <button onClick={(e) => { e.stopPropagation(); db.collection(getPublicPath(`signatures_${s.branch}`)).doc(s.id).delete().then(()=>triggerNotify("簽名紀錄已刪除","info")); }} className="p-1.5 text-slate-300 hover:text-red-500 transition-all rounded-lg active:bg-red-50">
                      <Icon name="trash-2" size={16} />
                    </button>
                    <Icon name={expandedSig === i ? "chevron-up" : "chevron-down"} size={16} className="text-slate-300 ml-1" />
                  </div>
                </div>
                {expandedSig === i && (
                  <div className="p-4 bg-slate-50 border-t">
                    <img src={s.signature} className="w-full h-32 object-contain bg-white rounded-xl border border-dashed border-slate-200" alt="簽名" />
                  </div>
                )}
              </div>
            ))}
            {signatures.filter(s => s.category === `守則簽署 - ${signSubCat}` && (isSuperAdmin ? true : s.branch === currentBranch)).length === 0 && <p className="text-center py-10 text-slate-400 text-xs">目前無簽署紀錄</p>}
          </div>
        </div>
      )}
      {tab === 'game' && <GameAdminManager getPublicPath={getPublicPath} triggerNotify={triggerNotify} globalBranches={globalBranches} />}
      {tab === 'system' && isSuperAdmin && (
        <div className="glass-panel p-6 rounded-[2.5rem] bg-white border shadow-sm space-y-4">
          <h3 className="font-black text-brand-red text-sm flex items-center gap-2"><Icon name="building-2" size={18} /> 全域分店管理</h3>
          <div className="flex gap-3">
            <input placeholder="新分店名稱..." value={newBranchName} onChange={e=>setNewBranchName(e.target.value)} className="flex-1 input-light p-4 rounded-xl text-sm min-w-0" />
            <button onClick={()=>{
              if(!newBranchName.trim() || globalBranches.includes(newBranchName)) return;
              const newB = [...globalBranches, newBranchName.trim()];
              db.doc(getPublicPath('system/branches')).set({ list: newB }).then(()=>{
                setNewBranchName(''); 
                triggerNotify("分店新增成功", "success");
              });
            }} className="bg-slate-900 text-white px-6 py-4 rounded-xl text-sm font-black shrink-0 whitespace-nowrap shadow-sm">新增分店</button>
          </div>
          <div className="space-y-2 mt-4">
            {globalBranches.map(b => (
              <div key={b} className="bg-slate-50 p-4 rounded-2xl font-bold flex justify-between items-center border">
                <span>{b}</span>
                {globalBranches.length > 1 && (
                  <button onClick={()=>{
                    const newB = globalBranches.filter(i => i !== b);
                    db.doc(getPublicPath('system/branches')).set({ list: newB });
                    if(currentBranch === b) setCurrentBranch(newB[0]);
                  }} className="text-slate-300 hover:text-red-500"><Icon name="trash-2" size={16}/></button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);
};
// --- 主題配色設定陣列 (加入專屬極淺背景色) ---
/* ═══════════════════════════════════════════════
 20 款完整風格主題
 每款含：品牌色 + 背景 + 面板層次 + 邊框 + 文字 + 特效
═══════════════════════════════════════════════ */
const APP_THEMES = [
// ── 奢華系列 (Luxury) ──────────────────────────
{
  id: 'crimson-gold',
  name: '酒紅金箔',
  emoji: '🏆',
  desc: '奢華皮革',
  hex: '#b9121b',
  previewBg: 'linear-gradient(135deg,#2a0508,#5e1519)',
  previewAccent: '#d4a017',
  color: '185 18 27',
  bgHex: '#3d0a0e',
  vars: {
    '--leather-deep':'#2a0508','--leather-base':'#3d0a0e',
    '--leather-mid':'#4e0f14','--leather-light':'#5e1519',
    '--leather-lift':'#701a1f','--leather-hover':'#821e24',
    '--gold-bright':'#f0c040','--gold-mid':'#d4a017',
    '--gold-dim':'#a07c10','--gold-shadow':'#6b5208',
    '--gold-glow':'rgba(212,160,23,0.35)','--gold-subtle':'rgba(212,160,23,0.12)',
    '--gold-border':'rgba(212,160,23,0.55)',
    '--t1':'#f8e8c8','--t2':'#c9a870','--t3':'#8a6a3a','--t4':'#5a3e20',
    '--s0':'#2a0508','--s1':'#3d0a0e','--s2':'#4e0f14','--s3':'#5e1519','--s4':'#701a1f',
    '--b1':'rgba(212,160,23,0.25)','--b2':'rgba(212,160,23,0.45)','--b3':'rgba(212,160,23,0.70)',
    '--accent-10':'rgba(185,18,27,0.15)','--accent-20':'rgba(185,18,27,0.25)','--accent-30':'rgba(185,18,27,0.40)',
  }
},
{
  id: 'midnight-sapphire',
  name: '午夜藍寶',
  emoji: '💎',
  desc: '深海奢藍',
  hex: '#1e3a8a',
  previewBg: 'linear-gradient(135deg,#060d1f,#0d1f4a)',
  previewAccent: '#60a5fa',
  color: '37 99 235',
  bgHex: '#060d1f',
  vars: {
    '--s0':'#060d1f','--s1':'#0d1a3a','--s2':'#112348','--s3':'#162d5a','--s4':'#1e3a6e',
    '--b1':'rgba(96,165,250,0.15)','--b2':'rgba(96,165,250,0.30)','--b3':'rgba(96,165,250,0.50)',
    '--t1':'#e0f0ff','--t2':'#93c5fd','--t3':'#3b72c5','--t4':'#1e3a6e',
    '--gold-border':'rgba(96,165,250,0.40)','--gold-glow':'rgba(96,165,250,0.25)',
    '--gold-subtle':'rgba(96,165,250,0.10)','--gold-bright':'#93c5fd','--gold-mid':'#60a5fa',
    '--gold-dim':'#3b82f6','--gold-shadow':'#1d4ed8',
    '--gold-gradient':'linear-gradient(135deg,#1d4ed8,#3b82f6,#93c5fd,#60a5fa,#1d4ed8)',
    '--gold-gradient-h':'linear-gradient(90deg,#1d4ed8,#60a5fa,#93c5fd,#60a5fa,#1d4ed8)',
    '--leather-deep':'#060d1f','--leather-base':'#0d1a3a','--leather-mid':'#112348',
    '--leather-light':'#162d5a','--leather-lift':'#1e3a6e','--leather-hover':'#254888',
    '--accent-10':'rgba(37,99,235,0.15)','--accent-20':'rgba(37,99,235,0.25)','--accent-30':'rgba(37,99,235,0.40)',
  }
},
{
  id: 'obsidian-emerald',
  name: '黑曜翡翠',
  emoji: '🌿',
  desc: '暗夜林綠',
  hex: '#065f46',
  previewBg: 'linear-gradient(135deg,#021510,#053d2c)',
  previewAccent: '#34d399',
  color: '5 150 105',
  bgHex: '#021510',
  vars: {
    '--s0':'#021510','--s1':'#042e20','--s2':'#064030','--s3':'#085540','--s4':'#0a6a50',
    '--b1':'rgba(52,211,153,0.15)','--b2':'rgba(52,211,153,0.28)','--b3':'rgba(52,211,153,0.50)',
    '--t1':'#d1fae5','--t2':'#6ee7b7','--t3':'#1d6b50','--t4':'#0d4030',
    '--gold-border':'rgba(52,211,153,0.40)','--gold-glow':'rgba(52,211,153,0.25)',
    '--gold-subtle':'rgba(52,211,153,0.10)','--gold-bright':'#6ee7b7','--gold-mid':'#34d399',
    '--gold-dim':'#10b981','--gold-shadow':'#059669',
    '--gold-gradient':'linear-gradient(135deg,#059669,#34d399,#6ee7b7,#34d399,#059669)',
    '--gold-gradient-h':'linear-gradient(90deg,#059669,#34d399,#6ee7b7,#34d399,#059669)',
    '--leather-deep':'#021510','--leather-base':'#042e20','--leather-mid':'#064030',
    '--leather-light':'#085540','--leather-lift':'#0a6a50','--leather-hover':'#0c7a5c',
    '--accent-10':'rgba(5,150,105,0.15)','--accent-20':'rgba(5,150,105,0.25)','--accent-30':'rgba(5,150,105,0.40)',
  }
},
{
  id: 'volcanic-amber',
  name: '火山琥珀',
  emoji: '🔥',
  desc: '熔岩橘金',
  hex: '#b45309',
  previewBg: 'linear-gradient(135deg,#1c0a00,#4a1800)',
  previewAccent: '#fbbf24',
  color: '217 119 6',
  bgHex: '#1c0a00',
  vars: {
    '--s0':'#1c0a00','--s1':'#2e1000','--s2':'#3d1500','--s3':'#4f1c00','--s4':'#652400',
    '--b1':'rgba(251,191,36,0.18)','--b2':'rgba(251,191,36,0.35)','--b3':'rgba(251,191,36,0.55)',
    '--t1':'#fef3c7','--t2':'#fcd34d','--t3':'#a16207','--t4':'#633d0a',
    '--gold-border':'rgba(251,191,36,0.50)','--gold-glow':'rgba(251,191,36,0.30)',
    '--gold-subtle':'rgba(251,191,36,0.12)','--gold-bright':'#fde68a','--gold-mid':'#fbbf24',
    '--gold-dim':'#f59e0b','--gold-shadow':'#d97706',
    '--gold-gradient':'linear-gradient(135deg,#d97706,#fbbf24,#fde68a,#fbbf24,#d97706)',
    '--gold-gradient-h':'linear-gradient(90deg,#d97706,#fbbf24,#fde68a,#fbbf24,#d97706)',
    '--leather-deep':'#1c0a00','--leather-base':'#2e1000','--leather-mid':'#3d1500',
    '--leather-light':'#4f1c00','--leather-lift':'#652400','--leather-hover':'#7a2d00',
    '--accent-10':'rgba(217,119,6,0.15)','--accent-20':'rgba(217,119,6,0.25)','--accent-30':'rgba(217,119,6,0.40)',
  }
},
{
  id: 'royal-violet',
  name: '皇家紫羅',
  emoji: '👑',
  desc: '暗夜紫晶',
  hex: '#6d28d9',
  previewBg: 'linear-gradient(135deg,#0d0518,#200a40)',
  previewAccent: '#a78bfa',
  color: '109 40 217',
  bgHex: '#0d0518',
  vars: {
    '--s0':'#0d0518','--s1':'#160824','--s2':'#1e0d30','--s3':'#28103e','--s4':'#33154e',
    '--b1':'rgba(167,139,250,0.15)','--b2':'rgba(167,139,250,0.28)','--b3':'rgba(167,139,250,0.50)',
    '--t1':'#ede9fe','--t2':'#c4b5fd','--t3':'#6d3ec0','--t4':'#3b1f70',
    '--gold-border':'rgba(167,139,250,0.40)','--gold-glow':'rgba(167,139,250,0.28)',
    '--gold-subtle':'rgba(167,139,250,0.10)','--gold-bright':'#c4b5fd','--gold-mid':'#a78bfa',
    '--gold-dim':'#7c3aed','--gold-shadow':'#5b21b6',
    '--gold-gradient':'linear-gradient(135deg,#5b21b6,#7c3aed,#a78bfa,#c4b5fd,#7c3aed)',
    '--gold-gradient-h':'linear-gradient(90deg,#5b21b6,#a78bfa,#c4b5fd,#a78bfa,#5b21b6)',
    '--leather-deep':'#0d0518','--leather-base':'#160824','--leather-mid':'#1e0d30',
    '--leather-light':'#28103e','--leather-lift':'#33154e','--leather-hover':'#3f1a60',
    '--accent-10':'rgba(109,40,217,0.15)','--accent-20':'rgba(109,40,217,0.25)','--accent-30':'rgba(109,40,217,0.40)',
  }
},
// ── 科技系列 (Tech) ──────────────────────────
{
  id: 'cyber-neon',
  name: '霓虹賽博',
  emoji: '⚡',
  desc: '科技青光',
  hex: '#0891b2',
  previewBg: 'linear-gradient(135deg,#020d14,#041e2e)',
  previewAccent: '#22d3ee',
  color: '8 145 178',
  bgHex: '#020d14',
  vars: {
    '--s0':'#020d14','--s1':'#041e2e','--s2':'#062840','--s3':'#083550','--s4':'#0a4260',
    '--b1':'rgba(34,211,238,0.15)','--b2':'rgba(34,211,238,0.28)','--b3':'rgba(34,211,238,0.55)',
    '--t1':'#e0f7ff','--t2':'#67e8f9','--t3':'#0e7490','--t4':'#064e63',
    '--gold-border':'rgba(34,211,238,0.45)','--gold-glow':'rgba(34,211,238,0.30)',
    '--gold-subtle':'rgba(34,211,238,0.10)','--gold-bright':'#a5f3fc','--gold-mid':'#22d3ee',
    '--gold-dim':'#06b6d4','--gold-shadow':'#0891b2',
    '--gold-gradient':'linear-gradient(135deg,#0891b2,#06b6d4,#22d3ee,#67e8f9,#22d3ee)',
    '--gold-gradient-h':'linear-gradient(90deg,#0891b2,#22d3ee,#67e8f9,#22d3ee,#0891b2)',
    '--leather-deep':'#020d14','--leather-base':'#041e2e','--leather-mid':'#062840',
    '--leather-light':'#083550','--leather-lift':'#0a4260','--leather-hover':'#0c5070',
    '--accent-10':'rgba(8,145,178,0.15)','--accent-20':'rgba(8,145,178,0.25)','--accent-30':'rgba(8,145,178,0.40)',
  }
},
{
  id: 'matrix-green',
  name: '駭客綠陣',
  emoji: '🖥️',
  desc: '終端矩陣',
  hex: '#16a34a',
  previewBg: 'linear-gradient(135deg,#000d04,#011a08)',
  previewAccent: '#4ade80',
  color: '22 163 74',
  bgHex: '#000d04',
  vars: {
    '--s0':'#000d04','--s1':'#011a08','--s2':'#02260d','--s3':'#033312','--s4':'#044018',
    '--b1':'rgba(74,222,128,0.15)','--b2':'rgba(74,222,128,0.28)','--b3':'rgba(74,222,128,0.55)',
    '--t1':'#dcfce7','--t2':'#86efac','--t3':'#16a34a','--t4':'#0d6030',
    '--gold-border':'rgba(74,222,128,0.40)','--gold-glow':'rgba(74,222,128,0.25)',
    '--gold-subtle':'rgba(74,222,128,0.08)','--gold-bright':'#bbf7d0','--gold-mid':'#4ade80',
    '--gold-dim':'#22c55e','--gold-shadow':'#16a34a',
    '--gold-gradient':'linear-gradient(135deg,#16a34a,#22c55e,#4ade80,#86efac,#4ade80)',
    '--gold-gradient-h':'linear-gradient(90deg,#16a34a,#4ade80,#86efac,#4ade80,#16a34a)',
    '--leather-deep':'#000d04','--leather-base':'#011a08','--leather-mid':'#02260d',
    '--leather-light':'#033312','--leather-lift':'#044018','--leather-hover':'#054e1e',
    '--accent-10':'rgba(22,163,74,0.15)','--accent-20':'rgba(22,163,74,0.25)','--accent-30':'rgba(22,163,74,0.40)',
  }
},
{
  id: 'titanium',
  name: '鈦金屬',
  emoji: '🔩',
  desc: '冷調銀灰',
  hex: '#475569',
  previewBg: 'linear-gradient(135deg,#0a0c0e,#1a1e24)',
  previewAccent: '#94a3b8',
  color: '71 85 105',
  bgHex: '#0a0c0e',
  vars: {
    '--s0':'#0a0c0e','--s1':'#131619','--s2':'#1a1e24','--s3':'#222730','--s4':'#2c323c',
    '--b1':'rgba(148,163,184,0.12)','--b2':'rgba(148,163,184,0.22)','--b3':'rgba(148,163,184,0.40)',
    '--t1':'#f1f5f9','--t2':'#94a3b8','--t3':'#475569','--t4':'#2d3748',
    '--gold-border':'rgba(148,163,184,0.35)','--gold-glow':'rgba(148,163,184,0.18)',
    '--gold-subtle':'rgba(148,163,184,0.08)','--gold-bright':'#e2e8f0','--gold-mid':'#94a3b8',
    '--gold-dim':'#64748b','--gold-shadow':'#475569',
    '--gold-gradient':'linear-gradient(135deg,#475569,#64748b,#94a3b8,#cbd5e1,#94a3b8)',
    '--gold-gradient-h':'linear-gradient(90deg,#475569,#94a3b8,#cbd5e1,#94a3b8,#475569)',
    '--leather-deep':'#0a0c0e','--leather-base':'#131619','--leather-mid':'#1a1e24',
    '--leather-light':'#222730','--leather-lift':'#2c323c','--leather-hover':'#363d48',
    '--accent-10':'rgba(71,85,105,0.15)','--accent-20':'rgba(71,85,105,0.25)','--accent-30':'rgba(71,85,105,0.40)',
  }
},
// ── 自然系列 (Nature) ──────────────────────────
{
  id: 'cherry-blossom',
  name: '京都櫻花',
  emoji: '🌸',
  desc: '粉紫和風',
  hex: '#db2777',
  previewBg: 'linear-gradient(135deg,#1a0510,#320a1e)',
  previewAccent: '#f9a8d4',
  color: '219 39 119',
  bgHex: '#1a0510',
  vars: {
    '--s0':'#1a0510','--s1':'#280818','--s2':'#380c22','--s3':'#461030','--s4':'#58143c',
    '--b1':'rgba(249,168,212,0.15)','--b2':'rgba(249,168,212,0.28)','--b3':'rgba(249,168,212,0.55)',
    '--t1':'#fce7f3','--t2':'#f9a8d4','--t3':'#be185d','--t4':'#831843',
    '--gold-border':'rgba(249,168,212,0.45)','--gold-glow':'rgba(249,168,212,0.28)',
    '--gold-subtle':'rgba(249,168,212,0.10)','--gold-bright':'#fce7f3','--gold-mid':'#f9a8d4',
    '--gold-dim':'#ec4899','--gold-shadow':'#db2777',
    '--gold-gradient':'linear-gradient(135deg,#db2777,#ec4899,#f9a8d4,#fce7f3,#f9a8d4)',
    '--gold-gradient-h':'linear-gradient(90deg,#be185d,#ec4899,#f9a8d4,#ec4899,#be185d)',
    '--leather-deep':'#1a0510','--leather-base':'#280818','--leather-mid':'#380c22',
    '--leather-light':'#461030','--leather-lift':'#58143c','--leather-hover':'#6a1848',
    '--accent-10':'rgba(219,39,119,0.15)','--accent-20':'rgba(219,39,119,0.25)','--accent-30':'rgba(219,39,119,0.40)',
  }
},
{
  id: 'deep-ocean',
  name: '深海蔚藍',
  emoji: '🌊',
  desc: '海洋藍綠',
  hex: '#0d9488',
  previewBg: 'linear-gradient(135deg,#010d10,#021e24)',
  previewAccent: '#5eead4',
  color: '13 148 136',
  bgHex: '#010d10',
  vars: {
    '--s0':'#010d10','--s1':'#021e24','--s2':'#022e38','--s3':'#033d48','--s4':'#044e5c',
    '--b1':'rgba(94,234,212,0.15)','--b2':'rgba(94,234,212,0.28)','--b3':'rgba(94,234,212,0.55)',
    '--t1':'#ccfbf1','--t2':'#5eead4','--t3':'#0d9488','--t4':'#065f58',
    '--gold-border':'rgba(94,234,212,0.40)','--gold-glow':'rgba(94,234,212,0.28)',
    '--gold-subtle':'rgba(94,234,212,0.10)','--gold-bright':'#99f6e4','--gold-mid':'#5eead4',
    '--gold-dim':'#2dd4bf','--gold-shadow':'#0d9488',
    '--gold-gradient':'linear-gradient(135deg,#0d9488,#14b8a6,#5eead4,#99f6e4,#5eead4)',
    '--gold-gradient-h':'linear-gradient(90deg,#0d9488,#5eead4,#99f6e4,#5eead4,#0d9488)',
    '--leather-deep':'#010d10','--leather-base':'#021e24','--leather-mid':'#022e38',
    '--leather-light':'#033d48','--leather-lift':'#044e5c','--leather-hover':'#056070',
    '--accent-10':'rgba(13,148,136,0.15)','--accent-20':'rgba(13,148,136,0.25)','--accent-30':'rgba(13,148,136,0.40)',
  }
},
// ── 復古系列 (Retro) ──────────────────────────
{
  id: 'vintage-burgundy',
  name: '波爾多紅',
  emoji: '🍷',
  desc: '復古酒館',
  hex: '#881337',
  previewBg: 'linear-gradient(135deg,#14020a,#2d0615)',
  previewAccent: '#fb7185',
  color: '136 19 55',
  bgHex: '#14020a',
  vars: {
    '--s0':'#14020a','--s1':'#200410','--s2':'#2d0615','--s3':'#3a081c','--s4':'#480a24',
    '--b1':'rgba(251,113,133,0.15)','--b2':'rgba(251,113,133,0.28)','--b3':'rgba(251,113,133,0.55)',
    '--t1':'#ffe4e6','--t2':'#fda4af','--t3':'#e11d48','--t4':'#881337',
    '--gold-border':'rgba(251,113,133,0.40)','--gold-glow':'rgba(251,113,133,0.25)',
    '--gold-subtle':'rgba(251,113,133,0.10)','--gold-bright':'#fecdd3','--gold-mid':'#fb7185',
    '--gold-dim':'#f43f5e','--gold-shadow':'#e11d48',
    '--gold-gradient':'linear-gradient(135deg,#881337,#e11d48,#fb7185,#fecdd3,#fb7185)',
    '--gold-gradient-h':'linear-gradient(90deg,#881337,#f43f5e,#fb7185,#f43f5e,#881337)',
    '--leather-deep':'#14020a','--leather-base':'#200410','--leather-mid':'#2d0615',
    '--leather-light':'#3a081c','--leather-lift':'#480a24','--leather-hover':'#580c2c',
    '--accent-10':'rgba(136,19,55,0.15)','--accent-20':'rgba(136,19,55,0.25)','--accent-30':'rgba(136,19,55,0.40)',
  }
},
{
  id: 'antique-bronze',
  name: '古銅歲月',
  emoji: '⚗️',
  desc: '蒸汽朋克',
  hex: '#92400e',
  previewBg: 'linear-gradient(135deg,#0f0800,#241500)',
  previewAccent: '#d97706',
  color: '146 64 14',
  bgHex: '#0f0800',
  vars: {
    '--s0':'#0f0800','--s1':'#1e1000','--s2':'#2a1500','--s3':'#351b00','--s4':'#422200',
    '--b1':'rgba(217,119,6,0.20)','--b2':'rgba(217,119,6,0.38)','--b3':'rgba(217,119,6,0.60)',
    '--t1':'#fef3c7','--t2':'#fcd34d','--t3':'#b45309','--t4':'#78350f',
    '--gold-border':'rgba(217,119,6,0.55)','--gold-glow':'rgba(217,119,6,0.30)',
    '--gold-subtle':'rgba(217,119,6,0.12)','--gold-bright':'#fde68a','--gold-mid':'#d97706',
    '--gold-dim':'#b45309','--gold-shadow':'#92400e',
    '--gold-gradient':'linear-gradient(135deg,#78350f,#b45309,#d97706,#fbbf24,#d97706)',
    '--gold-gradient-h':'linear-gradient(90deg,#92400e,#d97706,#fbbf24,#d97706,#92400e)',
    '--leather-deep':'#0f0800','--leather-base':'#1e1000','--leather-mid':'#2a1500',
    '--leather-light':'#351b00','--leather-lift':'#422200','--leather-hover':'#502800',
    '--accent-10':'rgba(146,64,14,0.15)','--accent-20':'rgba(146,64,14,0.25)','--accent-30':'rgba(146,64,14,0.40)',
  }
},
{
  id: 'ink-indigo',
  name: '墨水靛藍',
  emoji: '🖊️',
  desc: '書法禪意',
  hex: '#312e81',
  previewBg: 'linear-gradient(135deg,#05040f,#0e0c24)',
  previewAccent: '#818cf8',
  color: '99 102 241',
  bgHex: '#05040f',
  vars: {
    '--s0':'#05040f','--s1':'#0e0c24','--s2':'#141238','--s3':'#1c1848','--s4':'#241e5c',
    '--b1':'rgba(129,140,248,0.15)','--b2':'rgba(129,140,248,0.28)','--b3':'rgba(129,140,248,0.55)',
    '--t1':'#e0e7ff','--t2':'#a5b4fc','--t3':'#4f46e5','--t4':'#312e81',
    '--gold-border':'rgba(129,140,248,0.40)','--gold-glow':'rgba(129,140,248,0.28)',
    '--gold-subtle':'rgba(129,140,248,0.10)','--gold-bright':'#c7d2fe','--gold-mid':'#818cf8',
    '--gold-dim':'#6366f1','--gold-shadow':'#4f46e5',
    '--gold-gradient':'linear-gradient(135deg,#312e81,#4f46e5,#818cf8,#c7d2fe,#818cf8)',
    '--gold-gradient-h':'linear-gradient(90deg,#312e81,#6366f1,#a5b4fc,#6366f1,#312e81)',
    '--leather-deep':'#05040f','--leather-base':'#0e0c24','--leather-mid':'#141238',
    '--leather-light':'#1c1848','--leather-lift':'#241e5c','--leather-hover':'#2e2570',
    '--accent-10':'rgba(99,102,241,0.15)','--accent-20':'rgba(99,102,241,0.25)','--accent-30':'rgba(99,102,241,0.40)',
  }
},
// ── 特殊系列 (Special) ──────────────────────────
{
  id: 'rose-gold',
  name: '玫瑰金',
  emoji: '🌹',
  desc: '時尚玫瑰',
  hex: '#c2185b',
  previewBg: 'linear-gradient(135deg,#1a0810,#32121e)',
  previewAccent: '#f48fb1',
  color: '194 24 91',
  bgHex: '#1a0810',
  vars: {
    '--s0':'#1a0810','--s1':'#280d18','--s2':'#361222','--s3':'#44162c','--s4':'#541a38',
    '--b1':'rgba(244,143,177,0.18)','--b2':'rgba(244,143,177,0.32)','--b3':'rgba(244,143,177,0.55)',
    '--t1':'#fce4ec','--t2':'#f48fb1','--t3':'#c2185b','--t4':'#880e4f',
    '--gold-border':'rgba(244,143,177,0.48)','--gold-glow':'rgba(244,143,177,0.30)',
    '--gold-subtle':'rgba(244,143,177,0.12)','--gold-bright':'#fce4ec','--gold-mid':'#f48fb1',
    '--gold-dim':'#e91e63','--gold-shadow':'#c2185b',
    '--gold-gradient':'linear-gradient(135deg,#880e4f,#c2185b,#f48fb1,#fce4ec,#f48fb1)',
    '--gold-gradient-h':'linear-gradient(90deg,#ad1457,#e91e63,#f48fb1,#e91e63,#ad1457)',
    '--leather-deep':'#1a0810','--leather-base':'#280d18','--leather-mid':'#361222',
    '--leather-light':'#44162c','--leather-lift':'#541a38','--leather-hover':'#651e44',
    '--accent-10':'rgba(194,24,91,0.15)','--accent-20':'rgba(194,24,91,0.25)','--accent-30':'rgba(194,24,91,0.40)',
  }
},
{
  id: 'arctic-white',
  name: '北極冰原',
  emoji: '❄️',
  desc: '純白冰藍',
  hex: '#0284c7',
  previewBg: 'linear-gradient(135deg,#f0f9ff,#e0f2fe)',
  previewAccent: '#0ea5e9',
  color: '2 132 199',
  bgHex: '#f0f9ff',
  vars: {
    '--s0':'#f0f9ff','--s1':'#e0f2fe','--s2':'#bae6fd','--s3':'#ffffff','--s4':'#f8fafc',
    '--b1':'rgba(2,132,199,0.15)','--b2':'rgba(2,132,199,0.25)','--b3':'rgba(2,132,199,0.45)',
    '--t1':'#0c4a6e','--t2':'#0369a1','--t3':'#38bdf8','--t4':'#7dd3fc',
    '--gold-border':'rgba(2,132,199,0.35)','--gold-glow':'rgba(2,132,199,0.20)',
    '--gold-subtle':'rgba(2,132,199,0.08)','--gold-bright':'#0c4a6e','--gold-mid':'#0284c7',
    '--gold-dim':'#0ea5e9','--gold-shadow':'#38bdf8',
    '--gold-gradient':'linear-gradient(135deg,#0c4a6e,#0284c7,#0ea5e9,#38bdf8,#0ea5e9)',
    '--gold-gradient-h':'linear-gradient(90deg,#0c4a6e,#0284c7,#38bdf8,#0284c7,#0c4a6e)',
    '--leather-deep':'#e0f2fe','--leather-base':'#f0f9ff','--leather-mid':'#ffffff',
    '--leather-light':'#f8fafc','--leather-lift':'#ffffff','--leather-hover':'#f0f9ff',
    '--accent-10':'rgba(2,132,199,0.10)','--accent-20':'rgba(2,132,199,0.18)','--accent-30':'rgba(2,132,199,0.30)',
  }
},
{
  id: 'sakura-white',
  name: '和風白紙',
  emoji: '🗾',
  desc: '日式簡約',
  hex: '#be123c',
  previewBg: 'linear-gradient(135deg,#fff5f5,#fff1f2)',
  previewAccent: '#f43f5e',
  color: '190 18 60',
  bgHex: '#fff5f5',
  vars: {
    '--s0':'#fff5f5','--s1':'#fff1f2','--s2':'#ffe4e6','--s3':'#fecdd3','--s4':'#fda4af',
    '--b1':'rgba(190,18,60,0.12)','--b2':'rgba(190,18,60,0.22)','--b3':'rgba(190,18,60,0.40)',
    '--t1':'#1e293b','--t2':'#475569','--t3':'#94a3b8','--t4':'#cbd5e1',
    '--gold-border':'rgba(190,18,60,0.30)','--gold-glow':'rgba(190,18,60,0.15)',
    '--gold-subtle':'rgba(190,18,60,0.06)','--gold-bright':'#be123c','--gold-mid':'#e11d48',
    '--gold-dim':'#f43f5e','--gold-shadow':'#fb7185',
    '--gold-gradient':'linear-gradient(135deg,#be123c,#e11d48,#f43f5e,#fb7185,#f43f5e)',
    '--gold-gradient-h':'linear-gradient(90deg,#9f1239,#e11d48,#f43f5e,#e11d48,#9f1239)',
    '--leather-deep':'#ffe4e6','--leather-base':'#fff1f2','--leather-mid':'#fff5f5',
    '--leather-light':'#ffffff','--leather-lift':'#fef2f2','--leather-hover':'#ffe4e6',
    '--accent-10':'rgba(190,18,60,0.08)','--accent-20':'rgba(190,18,60,0.15)','--accent-30':'rgba(190,18,60,0.25)',
  }
},
{
  id: 'forest-moss',
  name: '苔蘚森林',
  emoji: '🍃',
  desc: '自然綠調',
  hex: '#15803d',
  previewBg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)',
  previewAccent: '#22c55e',
  color: '21 128 61',
  bgHex: '#f0fdf4',
  vars: {
    '--s0':'#f0fdf4','--s1':'#dcfce7','--s2':'#bbf7d0','--s3':'#ffffff','--s4':'#f8fafc',
    '--b1':'rgba(21,128,61,0.15)','--b2':'rgba(21,128,61,0.25)','--b3':'rgba(21,128,61,0.45)',
    '--t1':'#14532d','--t2':'#15803d','--t3':'#4ade80','--t4':'#86efac',
    '--gold-border':'rgba(21,128,61,0.35)','--gold-glow':'rgba(21,128,61,0.20)',
    '--gold-subtle':'rgba(21,128,61,0.08)','--gold-bright':'#14532d','--gold-mid':'#15803d',
    '--gold-dim':'#16a34a','--gold-shadow':'#22c55e',
    '--gold-gradient':'linear-gradient(135deg,#14532d,#15803d,#16a34a,#22c55e,#16a34a)',
    '--gold-gradient-h':'linear-gradient(90deg,#14532d,#16a34a,#4ade80,#16a34a,#14532d)',
    '--leather-deep':'#dcfce7','--leather-base':'#f0fdf4','--leather-mid':'#ffffff',
    '--leather-light':'#f8fafc','--leather-lift':'#ffffff','--leather-hover':'#f0fdf4',
    '--accent-10':'rgba(21,128,61,0.10)','--accent-20':'rgba(21,128,61,0.18)','--accent-30':'rgba(21,128,61,0.28)',
  }
},
{
  id: 'lava-orange',
  name: '活力橘焰',
  emoji: '🧡',
  desc: '熱情暖橙',
  hex: '#ea580c',
  previewBg: 'linear-gradient(135deg,#fff7ed,#ffedd5)',
  previewAccent: '#f97316',
  color: '234 88 12',
  bgHex: '#fff7ed',
  vars: {
    '--s0':'#fff7ed','--s1':'#ffedd5','--s2':'#fed7aa','--s3':'#ffffff','--s4':'#fef3c7',
    '--b1':'rgba(234,88,12,0.15)','--b2':'rgba(234,88,12,0.25)','--b3':'rgba(234,88,12,0.45)',
    '--t1':'#431407','--t2':'#9a3412','--t3':'#f97316','--t4':'#fdba74',
    '--gold-border':'rgba(234,88,12,0.35)','--gold-glow':'rgba(234,88,12,0.20)',
    '--gold-subtle':'rgba(234,88,12,0.08)','--gold-bright':'#431407','--gold-mid':'#ea580c',
    '--gold-dim':'#f97316','--gold-shadow':'#fb923c',
    '--gold-gradient':'linear-gradient(135deg,#9a3412,#ea580c,#f97316,#fb923c,#f97316)',
    '--gold-gradient-h':'linear-gradient(90deg,#7c2d12,#ea580c,#f97316,#ea580c,#7c2d12)',
    '--leather-deep':'#ffedd5','--leather-base':'#fff7ed','--leather-mid':'#ffffff',
    '--leather-light':'#fef9f5','--leather-lift':'#ffffff','--leather-hover':'#fff7ed',
    '--accent-10':'rgba(234,88,12,0.10)','--accent-20':'rgba(234,88,12,0.18)','--accent-30':'rgba(234,88,12,0.28)',
  }
},
];

export default AdminPage

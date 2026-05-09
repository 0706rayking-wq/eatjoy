import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'

const OrderingSystem = ({ onBack, triggerNotify, globalBranches, currentBranch, isSuperAdmin, getPublicPath }) => {
const [storeDatabases, setStoreDatabases] = useState({});
const branches = isSuperAdmin ? globalBranches : [currentBranch];
const [selectedBranch, setSelectedBranch] = useState(currentBranch);
const currentDb = storeDatabases[selectedBranch] || { ingredients: [], zones: [...INITIAL_ORDER_ZONES], vendors: [], history: [] };

// 即時同步點貨數量：新增 useEffect 處理來自 Firebase 的更新
const [orderQuantities, setOrderQuantities] = useState({});

useEffect(() => {
  if (!selectedBranch) return;
  const docPath = getPublicPath(`ordering/db_${selectedBranch}`);
  const unsubscribe = db.doc(docPath).onSnapshot(docSnap => {
    if (docSnap.exists) {
      const data = docSnap.data();
      setStoreDatabases(prev => ({ ...prev, [selectedBranch]: data }));
      // 從資料庫中讀取 activeQuantities，並更新本地畫面
      if (data.activeQuantities) {
        setOrderQuantities(data.activeQuantities);
      } else {
        setOrderQuantities({});
      }
    } else {
      const defaultDb = { ingredients: [], zones: [...INITIAL_ORDER_ZONES], vendors: [], history: [], activeQuantities: {} };
      setStoreDatabases(prev => ({ ...prev, [selectedBranch]: defaultDb }));
      db.doc(docPath).set(defaultDb);
    }
  }, err => {
    console.error("讀取叫貨資料庫失敗:", err);
    triggerNotify("讀取叫貨資料庫失敗", "error");
  });
  return () => unsubscribe();
}, [selectedBranch]);

const [view, setView] = useState('setup'); 
const [adminTab, setAdminTab] = useState('ingredients');
// --- 數據報表狀態 (修改為區站分類) ---
const [analyticsZone, setAnalyticsZone] = useState(null);
const [expandedAnalyticsItem, setExpandedAnalyticsItem] = useState(null);
const [analyticsMonth, setAnalyticsMonth] = useState(() => new Date().toISOString().substring(0, 7));

const [orderDate, setOrderDate] = useState(() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
});

const [selectedZone, setSelectedZone] = useState(null);
const [searchQuery, setSearchQuery] = useState('');
const [copyStatus, setCopyStatus] = useState({});
const [draggedId, setDraggedId] = useState(null);
const [overId, setOverId] = useState(null);
const [editedOrderTexts, setEditedOrderTexts] = useState({});

const [adminZoneFilter, setAdminZoneFilter] = useState('全部');
const [adminVendorFilter, setAdminVendorFilter] = useState('全部');
// 【修改重點：分頁載入數量限制，防閃退】
const [adminItemLimit, setAdminItemLimit] = useState(30); 

const [newItem, setNewItem] = useState({ name: '', vendor: '', unit: '包', zone: '菜區' });
const [newVendorName, setNewVendorName] = useState('');
const [newZoneName, setNewZoneName] = useState('');

const [editingIngredientId, setEditingIngredientId] = useState(null);
const [editIngredientData, setEditIngredientData] = useState(null);

const [editingVendorName, setEditingVendorName] = useState(null);
const [editVendorNewName, setEditVendorNewName] = useState('');

const updateCurrentDb = (newData) => {
  const updatedDb = { ...currentDb, ...newData };
  setStoreDatabases(prev => ({ ...prev, [selectedBranch]: updatedDb }));
  db.doc(getPublicPath(`ordering/db_${selectedBranch}`)).set(updatedDb, { merge: true }).catch(e => {
    console.error("更新叫貨資料失敗", e);
    triggerNotify("儲存失敗，請檢查網路連線", "error");
  });
};

const saveOrderToHistory = () => {
  const orderItems = currentDb.ingredients
    .map(item => ({
      name: item.name,
      qty: parseFloat(orderQuantities[item.id] || 0),
      unit: item.unit
    }))
    .filter(i => i.qty > 0);
    
  if (orderItems.length === 0) return;

  // 1. 尋找是否已經有「今天(同一天)」的紀錄
  const existingRecordIndex = currentDb.history.findIndex(r => r.date === orderDate);
  let newHistory = [...currentDb.history];

  if (existingRecordIndex > -1) {
    // 如果有，直接覆蓋該天的紀錄 (避免同仁按多次發送導致重複疊加)
    newHistory[existingRecordIndex] = {
      ...newHistory[existingRecordIndex],
      timestamp: new Date().toLocaleString(),
      items: orderItems
    };
  } else {
    // 如果沒有，才新增一筆
    const newHistoryRecord = {
      id: Date.now(),
      date: orderDate,
      timestamp: new Date().toLocaleString(),
      items: orderItems
    };
    newHistory.push(newHistoryRecord);
  }

  // 2. 限制歷史紀錄最多保留 365 筆 (約一年)，避免 Firebase 單一文件超載
  if (newHistory.length > 365) {
    newHistory = newHistory.slice(-365);
  }

  updateCurrentDb({ history: newHistory });
};

const monthlyStats = useMemo(() => {
  const stats = {};
  // 👇 將原本的 orderDate 改成依賴 analyticsMonth
  currentDb.history.forEach(record => {
    if (record.date.startsWith(analyticsMonth)) {
      record.items.forEach(item => {
        stats[item.name] = (stats[item.name] || 0) + item.qty;
      });
    }
  });
  return stats;
}, [currentDb.history, analyticsMonth]); // 👈 這裡的依賴陣列也要改

const handleDragStart = (id) => setDraggedId(id);
const handleDragOver = (e, id) => { e.preventDefault(); if (id !== draggedId) setOverId(id); };
const handleDragEnd = () => {
  if (draggedId !== null && overId !== null) {
    const newIngredients = [...currentDb.ingredients];
    const fromIndex = newIngredients.findIndex(i => i.id === draggedId);
    const toIndex = newIngredients.findIndex(i => i.id === overId);
    const [movedItem] = newIngredients.splice(fromIndex, 1);
    newIngredients.splice(toIndex, 0, movedItem);
    updateCurrentDb({ ingredients: newIngredients });
  }
  setDraggedId(null);
  setOverId(null);
};

    const groupedOrders = useMemo(() => {
      const list = currentDb.ingredients
        .map(item => ({ ...item, orderQty: parseFloat(orderQuantities[item.id] || 0) }))
        .filter(i => i.orderQty > 0);

      return list.reduce((acc, item) => {
        if (!acc[item.vendor]) acc[item.vendor] = [];

        // 尋找該廠商清單中是否已經存在同名的食材
        const existingItem = acc[item.vendor].find(i => i.name === item.name);

        if (existingItem) {
// 如果名字一模一樣，直接累加數量
          existingItem.orderQty += item.orderQty;
        } else {
// 如果不存在，則新增一筆（為了避免影響原始數據，建議展開拷貝一份）
          acc[item.vendor].push({ ...item });
        }

        return acc;
      }, {});
    }, [currentDb.ingredients, orderQuantities]);

useEffect(() => {
  if (view === 'result') {
    const initialTexts = {};
    const [y, m, d] = orderDate.split('-');
    const dateStr = `${parseInt(m)}/${parseInt(d)}`;
    Object.entries(groupedOrders).forEach(([vendor, items]) => {
      let text = `${selectedBranch} ${dateStr}\n`;
      items.forEach(item => { text += `${item.name} ${item.orderQty}${item.unit}\n`; });
      initialTexts[vendor] = text.trim();
    });
    setEditedOrderTexts(initialTexts);
  }
}, [view, groupedOrders, selectedBranch, orderDate]);

const handleTextChange = (vendor, newText) => {
  setEditedOrderTexts(prev => ({ ...prev, [vendor]: newText }));
};

const handleShare = async (vendorName) => {
  saveOrderToHistory(); 
  const text = editedOrderTexts[vendorName] || "";
  
  const el = document.createElement('textarea');
  el.value = text;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
  
  setCopyStatus({ ...copyStatus, [vendorName]: true });
  triggerNotify(`${vendorName} 訂單已複製內容！請直接貼上分享`, "success");
  
  setTimeout(() => setCopyStatus(prev => ({ ...prev, [vendorName]: false })), 3000);
  
  if (navigator.share) {
    try { 
      await navigator.share({ title: `訂貨單-${vendorName}`, text }); 
      return; 
    } catch (err) {
      console.log("Share cancelled or failed", err);
    }
  }
};

// 用於處理數量更新，解決 1 跟 0 互跳的問題並即時寫入 DB
const handleQuantityChange = (itemId, newVal) => {
  const val = Math.max(0, parseFloat(newVal) || 0);
  // 1. 本地即時更新，讓 UI 馬上反應不會卡頓
  setOrderQuantities(prev => ({ ...prev, [itemId]: val }));
  
  // 2. 針對性地寫入 Firebase 中 activeQuantities 的單一屬性，避免被覆寫掉
  const docRef = db.doc(getPublicPath(`ordering/db_${selectedBranch}`));
  docRef.update({
    [`activeQuantities.${itemId}`]: val
  }).catch(() => {
    // 若 activeQuantities 尚未存在則初始化它
    docRef.set({ activeQuantities: { [itemId]: val } }, { merge: true });
  });
};

const Nav = ({ title, onBackAction, rightAction }) => (
  <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-3">
      {onBackAction && (
        <button onClick={onBackAction} className="w-10 h-10 bg-slate-100 rounded-xl active-scale btn-touch flex items-center justify-center">
          <OrderSymbolIcon name="ChevronLeft" className="text-slate-700" />
        </button>
      )}
      <h1 className="text-lg font-black text-slate-800 tracking-tight">{title}</h1>
    </div>
    {rightAction}
  </div>
);

return (
  <div className="text-slate-900 pb-24 selection:bg-rose-100 overflow-x-hidden page-enter">
    {/* 1. 設定頁面 */}
    {view === 'setup' && (
      <div className="max-w-md mx-auto px-6 pt-10">
        <div className="flex justify-center mb-8">
          <div className="bg-brand-red w-20 h-20 rounded-[2.5rem] shadow-2xl shadow-brand-red/20 flex items-center justify-center rotate-3 font-black text-white text-3xl">
            <OrderSymbolIcon name="Package" className="text-4xl" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-center text-slate-800 mb-1">簡易下單系統</h2>
        <p className="text-center text-slate-400 text-sm mb-8 font-medium">各區下單完成後整合送出</p>

        <div className="bg-white rounded-[3rem] shadow-xl border border-white overflow-hidden">
          <div className="flex flex-col">
            <div className="bg-slate-50 px-8 py-5 border-b border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{isSuperAdmin ? '選擇分店' : '當前分店'}</label>
              {isSuperAdmin ? (
                <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)} className="w-full bg-transparent border-none p-0 text-xl font-black outline-none mt-1 text-brand-red">
                  {branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              ) : (
                <div className="w-full text-xl font-black mt-1 text-brand-red py-1">{selectedBranch}</div>
              )}
            </div>
            <div className="px-8 py-5 border-b border-slate-100">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">進貨日期</label>
              <input type="date" value={orderDate} onChange={e => setOrderDate(e.target.value)} className="w-full bg-transparent border-none p-0 text-xl font-black outline-none mt-1" />
            </div>
            
            <div className="p-8">
              <button onClick={() => setView('zone_select')} className="w-full bg-brand-red text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-brand-red/20 flex items-center justify-center gap-3 active-scale transition-all">
                開始點貨 <OrderSymbolIcon name="ArrowRight" className="text-xl" />
              </button>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={() => { setView('analytics'); setSelectedItemName(''); setAnalyticsSearch(''); }} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active-scale transition-all">
                  <OrderSymbolIcon name="Chart" /> 數據分析報表
                </button>
                <button onClick={() => { setView('admin'); setAdminTab('ingredients'); }} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 active-scale transition-all">
                  <OrderSymbolIcon name="Settings" /> 食材廠商設定
                </button>
              </div>
              <button onClick={onBack} className="w-full py-4 text-slate-400 font-bold text-xs uppercase mt-4">返回廚務OS</button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* 2. 區站選擇 */}
    {view === 'zone_select' && (
      <div className="max-w-md mx-auto">
        <Nav title={`${selectedBranch} - 區站`} onBackAction={() => setView('setup')} />
        <div className="p-6 space-y-6 pb-20 mt-4">
          <div className="grid grid-cols-1 gap-4">
            {currentDb.zones.map((zone) => {
              const zoneItems = currentDb.ingredients.filter(i => i.zone === zone.name);
              const activeCount = zoneItems.filter(i => (orderQuantities[i.id] || 0) > 0).length;
              return (
                <button key={zone.name} onClick={() => { setSelectedZone(zone.name); setView('inventory'); }} className={`p-5 rounded-[2.5rem] border transition-all active-scale flex items-center justify-between bg-white shadow-sm hover:border-brand-red/30 ${activeCount > 0 ? 'border-brand-red/30 ring-4 ring-rose-50' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`${zone.color} w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center font-black text-white text-2xl`}>
                      <OrderSymbolIcon name={zone.icon} />
                    </div>
                    <div className="text-left">
                      <h3 className="font-black text-lg text-slate-800">{zone.name}</h3>
                      <p className="text-xs font-bold text-slate-400">{activeCount > 0 ? `已點: ${activeCount} 項` : `清單共 ${zoneItems.length} 項`}</p>
                    </div>
                  </div>
                  <OrderSymbolIcon name="ChevronRight" className="text-slate-300 text-xl" />
                </button>
              );
            })}
          </div>

          {Object.keys(groupedOrders).length > 0 && (
            <button 
              onClick={() => setView('result')} 
              className="w-full bg-emerald-600 text-white py-5 rounded-3xl font-black shadow-2xl flex items-center justify-center gap-2 active-scale transition-all mt-2"
            >
              <OrderSymbolIcon name="ClipboardCheck" /> 生成廠商訂單 ({Object.keys(groupedOrders).length})
            </button>
          )}
        </div>
      </div>
    )}

    {/* 3. 食材點貨頁面 */}
    {view === 'inventory' && (
      <div className="max-w-md mx-auto">
        <Nav title={selectedZone} onBackAction={() => { setView('zone_select'); setSearchQuery(''); }} />
        <div className="bg-white/80 backdrop-blur-md sticky top-[61px] z-40 px-4 py-4 border-b border-slate-100 shadow-sm">
          <div className="relative flex items-center">
            <div className="absolute left-4 font-black text-slate-300 flex items-center"><OrderSymbolIcon name="Search" /></div>
            <input type="text" placeholder={`搜尋${selectedZone}...`} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-red/50 outline-none" />
          </div>
        </div>
        <div className="p-4 space-y-4 pb-40">
          {currentDb.ingredients.filter(i => i.zone === selectedZone && i.name.includes(searchQuery)).map((item) => {
            const qty = orderQuantities[item.id] || 0;
            const isDragging = draggedId === item.id;
            const isOver = overId === item.id;
            return (
              <div key={item.id} draggable onDragStart={() => handleDragStart(item.id)} onDragOver={(e) => handleDragOver(e, item.id)} onDragEnd={handleDragEnd} className={`bg-white p-5 rounded-[2rem] border shadow-sm flex items-center justify-between transition-all duration-300 ${isDragging ? 'drag-ghost' : 'border-slate-100'} ${isOver ? 'border-brand-red/40 translate-y-1 shadow-md' : ''}`}>
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="p-1.5 text-slate-300 drag-handle font-black text-xl flex items-center"><OrderSymbolIcon name="GripVertical" /></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-slate-800 text-lg truncate leading-tight">{item.name}</h4>
                    <p className="text-[10px] font-black text-brand-red uppercase mt-0.5">{item.vendor}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-100/50 p-1.5 rounded-3xl shrink-0 ml-4">
                  <button onClick={() => handleQuantityChange(item.id, qty - 1)} className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center active-scale btn-touch text-slate-400 font-black text-2xl"><OrderSymbolIcon name="Minus" /></button>
                  
                  <OrderQtyInput value={qty} onChange={(val) => handleQuantityChange(item.id, val)} unit={item.unit} />
                  
                  <button onClick={() => handleQuantityChange(item.id, qty + 1)} className="w-12 h-12 bg-brand-red rounded-2xl shadow-lg flex items-center justify-center text-white active-scale btn-touch font-black text-2xl"><OrderSymbolIcon name="Plus" /></button>
                </div>
              </div>
            );
          })}
          <div className="mt-12 pt-6 border-t border-slate-200">
            <button 
              onClick={() => { setView('zone_select'); window.scrollTo(0,0); }}
              className="w-full bg-white border-2 border-brand-red text-brand-red py-5 rounded-3xl font-black text-lg active-scale transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <OrderSymbolIcon name="ChevronLeft" /> 點貨完畢，返回區站選擇
            </button>
          </div>
        </div>
      </div>
    )}

    {/* 4. 結果頁面 */}
    {view === 'result' && (
      <div className="max-w-md mx-auto px-6">
        <Nav title="確認訂單並編輯" onBackAction={() => setView('zone_select')} />
        <div className="space-y-8 pb-32 mt-6">
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs font-bold text-amber-700 leading-relaxed">
            提示：點擊「發送」後系統會自動保存此次叫貨紀錄至數據報表中。
          </div>
          {Object.keys(groupedOrders).length === 0 ? (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-dashed border-slate-200">
              <div className="font-black text-slate-200 text-5xl mb-4">?</div>
              <p className="text-slate-400 font-black">尚未叫貨</p>
            </div>
          ) : (
            Object.entries(groupedOrders).map(([vendor, items]) => (
              <div key={vendor} className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 bg-slate-900 flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-black text-xl">{vendor}</h3>
                    <p className="text-rose-200 text-[10px] font-bold uppercase mt-1 flex items-center gap-1"><OrderSymbolIcon name="Edit" className="w-3 h-3" /> 文字框可編輯</p>
                  </div>
                  <div className="bg-white/10 px-4 py-1.5 rounded-full text-[10px] text-white font-black uppercase">{items.length} 項</div>
                </div>
                <div className="p-6 space-y-5">
                  <textarea className="editable-order-text no-scrollbar" rows={Math.max(4, (editedOrderTexts[vendor]?.split('\n').length || 0) + 1)} value={editedOrderTexts[vendor] || ""} onChange={(e) => handleTextChange(vendor, e.target.value)} />
                  <button onClick={() => handleShare(vendor)} className={`w-full py-5 rounded-2xl font-black flex items-center justify-center gap-3 shadow-lg active-scale transition-all ${copyStatus[vendor] ? 'bg-emerald-500 text-white' : 'bg-brand-red text-white shadow-brand-red/20'}`}>
                    <OrderSymbolIcon name={copyStatus[vendor] ? "CheckCircle2" : "Share2"} /> {copyStatus[vendor] ? '紀錄已保存！已複製內容' : `發送訂單給 ${vendor}`}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    )}

    {/* 數據分析報表頁面 (區站分類版) */}
    {view === 'analytics' && (
      <div className="max-w-md mx-auto">
        <Nav 
          title={`${selectedBranch} - 數據報表`} 
          onBackAction={() => {
            if (analyticsZone) {
              setAnalyticsZone(null);
              setExpandedAnalyticsItem(null);
            } else {
              setView('setup');
            }
          }} 
        />
        <div className="p-6 space-y-6">
          {!analyticsZone ? (
            // 第一層：顯示所有區站清單
            // 第一層：顯示所有區站清單
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs font-bold text-amber-700 leading-relaxed shadow-inner flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span>💡 提示：請先選擇要檢視的月份 ➔</span>
                  <input 
                    type="month" 
                    value={analyticsMonth} 
                    onChange={(e) => setAnalyticsMonth(e.target.value)} 
                    className="bg-white border border-amber-300 text-amber-900 rounded-lg px-2 py-1.5 outline-none font-black text-sm shadow-sm"
                  />
                </div>
                <div className="text-amber-600/80 mt-1 border-t border-amber-200/50 pt-2">
                  目前正顯示 <span className="font-black text-brand-red">{analyticsMonth}</span> 累計叫貨數據。
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentDb.zones.map(zone => {
                  // 計算該區站在本月有叫貨的品項數量
                  const activeItemsCount = currentDb.ingredients.filter(i => 
                    i.zone === zone.name && monthlyStats[i.name] > 0
                  ).length;

                  return (
                    <button 
                      key={zone.name} 
                      onClick={() => setAnalyticsZone(zone.name)}
                      className="p-5 bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:border-brand-red/30 active:scale-95 transition-all text-left flex flex-col justify-between aspect-square group"
                    >
                      <div className={`${zone.color} w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center font-black text-white text-xl mb-2 group-hover:scale-110 transition-transform`}>
                        <OrderSymbolIcon name={zone.icon} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800 text-base">{zone.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1">
                          {activeItemsCount > 0 ? <span className="text-brand-red">已叫貨 {activeItemsCount} 項</span> : '尚無叫貨紀錄'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // 第二層：顯示該區站的所有食材叫貨量
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 pb-20">
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between sticky top-[61px] z-40">
                <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                  <span className="w-2.5 h-6 bg-brand-red rounded-full block"></span>
                  {analyticsZone}
                </h3>
                <span className="text-xs font-black text-brand-red bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100">{analyticsMonth} 統計</span>
              </div>

              <div className="space-y-3">
                {currentDb.ingredients
                  .filter(i => i.zone === analyticsZone)
                  .sort((a, b) => (monthlyStats[b.name] || 0) - (monthlyStats[a.name] || 0)) // 叫貨數量多的排在前面
                  .map(item => {
                    const totalQty = monthlyStats[item.name] || 0;
                    const isExpanded = expandedAnalyticsItem === item.name;

                    return (
                      <div key={item.id} className={`bg-white rounded-[1.5rem] border transition-all overflow-hidden ${isExpanded ? 'border-brand-red/40 shadow-md' : 'border-slate-100 shadow-sm'}`}>
                        <div 
                          onClick={() => setExpandedAnalyticsItem(isExpanded ? null : item.name)}
                          className={`p-5 flex justify-between items-center cursor-pointer active:bg-slate-50 transition-colors ${totalQty === 0 ? 'opacity-60 grayscale-[50%]' : ''}`}
                        >
                          <div className="flex-1 min-w-0 pr-4">
                            <h4 className="font-black text-slate-800 text-base truncate">{item.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{item.vendor}</p>
                          </div>
                          <div className="text-right flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              {totalQty > 0 ? (
                                <>
                                  <span className="font-black text-brand-red text-xl">{totalQty}</span>
                                  <span className="text-[10px] text-slate-400 font-bold ml-1">{item.unit}</span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-slate-300">0 {item.unit}</span>
                              )}
                            </div>
                            <Icon name={isExpanded ? "chevron-up" : "chevron-down"} size={18} className="text-slate-300" />
                          </div>
                        </div>

                        {/* 點擊展開：顯示本月叫貨明細 */}
                        {isExpanded && (
                          <div className="p-4 bg-slate-50 border-t border-slate-100 shadow-inner">
                            <h5 className="text-[10px] font-black text-slate-500 mb-3 uppercase tracking-widest flex items-center gap-1.5"><Icon name="history" size={14}/> 本店近期紀錄</h5>
                            <div className="space-y-2">
                              {currentDb.history.slice().reverse()
                                .filter(r => r.date.startsWith(analyticsMonth) && r.items.some(i => i.name === item.name))
                                .slice(0, 5) // 顯示最近 5 筆
                                .map(record => {
                                  const match = record.items.find(i => i.name === item.name);
                                  return (
                                    <div key={record.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                                      <span className="text-xs font-bold text-slate-600">{record.date}</span>
                                      <span className="font-black text-slate-800 text-sm">+{match.qty} <span className="text-[10px] text-slate-400">{match.unit}</span></span>
                                    </div>
                                  )
                                })
                              }
                              {(!currentDb.history.some(r => r.date.startsWith(analyticsMonth) && r.items.some(i => i.name === item.name))) && (
                                <div className="text-center py-4 text-xs font-bold text-slate-400">本月尚無此食材的叫貨紀錄</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                {currentDb.ingredients.filter(i => i.zone === analyticsZone).length === 0 && (
                  <div className="text-center py-12 text-slate-400 text-xs font-bold bg-white rounded-[2rem] border border-dashed border-slate-200 shadow-sm">此區站尚未設定任何食材</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )}

    {/* 後台管理 */}
    {view === 'admin' && (
      <div className="max-w-md mx-auto">
        <Nav title={`${selectedBranch} - 管理`} onBackAction={() => setView('setup')} />
        <div className="flex bg-white border-b border-slate-100 px-4 py-3 gap-2 overflow-x-auto no-scrollbar shadow-sm sticky top-[61px] z-50">
          {[
            { id: 'ingredients', label: '食材', icon: 'Layers' }, 
            { id: 'vendors', label: '廠商', icon: 'Filter' }, 
            { id: 'zones', label: '區站', icon: 'LayoutGrid' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setAdminTab(tab.id)} className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 whitespace-nowrap ${adminTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-100'}`}>
              <OrderSymbolIcon name={tab.icon} /> {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-6 pb-20">
          {adminTab === 'ingredients' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2"><OrderSymbolIcon name="Plus" className="text-brand-red" /> 新增食材</h3>
                <input placeholder="食材名稱" className="w-full bg-slate-50 rounded-xl p-4 font-bold outline-none ring-1 ring-slate-100" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
                <div className="grid grid-cols-2 gap-3">
                  <select className="bg-slate-50 rounded-xl p-4 font-bold outline-none" value={newItem.vendor} onChange={e => setNewItem({...newItem, vendor: e.target.value})}>
                    <option value="">選擇廠商</option>
                    {currentDb.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select className="bg-slate-50 rounded-xl p-4 font-bold outline-none" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})}>
                    {DEFAULT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
                <select className="w-full bg-slate-50 rounded-xl p-4 font-bold outline-none" value={newItem.zone} onChange={e => setNewItem({...newItem, zone: e.target.value})}>
                  {currentDb.zones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                </select>
                <button onClick={() => { if(newItem.name && newItem.vendor) { updateCurrentDb({ ingredients: [...currentDb.ingredients, { ...newItem, id: Date.now() }] }); setNewItem({ ...newItem, name: '', vendor: '', unit: '包', zone: currentDb.zones[0]?.name }); triggerNotify('新增食材成功', 'success'); } }} className="w-full bg-brand-red text-white p-5 rounded-2xl font-black shadow-lg">確認新增</button>
              </div>
              <div className="bg-slate-200/50 p-4 rounded-3xl grid grid-cols-2 gap-2">
                <select className="bg-white rounded-xl p-2 text-xs font-bold border-none shadow-sm" value={adminZoneFilter} onChange={e => {setAdminZoneFilter(e.target.value); setAdminItemLimit(30);}}><option value="全部">全部區站</option>{currentDb.zones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}</select>
                <select className="bg-white rounded-xl p-2 text-xs font-bold border-none shadow-sm" value={adminVendorFilter} onChange={e => {setAdminVendorFilter(e.target.value); setAdminItemLimit(30);}}><option value="全部">全部廠商</option>{currentDb.vendors.map(v => <option key={v} value={v}>{v}</option>)}</select>
              </div>
              <div className="space-y-2">
                {currentDb.ingredients
                  .filter(i => (adminZoneFilter === '全部' || i.zone === adminZoneFilter) && (adminVendorFilter === '全部' || i.vendor === adminVendorFilter))
                  .slice().reverse()
                  .slice(0, adminItemLimit)
                  .map(item => (
                  editingIngredientId === item.id ? (
                    <div key={item.id} className="bg-slate-50 p-5 rounded-[2.5rem] shadow-sm border border-brand-red/30 space-y-3">
                      <input placeholder="食材名稱" className="w-full bg-white rounded-xl p-3.5 font-bold outline-none ring-1 ring-slate-200" value={editIngredientData.name} onChange={e => setEditIngredientData({...editIngredientData, name: e.target.value})} />
                      <div className="grid grid-cols-2 gap-2">
                        <select className="bg-white rounded-xl p-3.5 font-bold outline-none text-sm" value={editIngredientData.vendor} onChange={e => setEditIngredientData({...editIngredientData, vendor: e.target.value})}>
                          <option value="">選擇廠商</option>
                          {currentDb.vendors.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                        <select className="bg-white rounded-xl p-3.5 font-bold outline-none text-sm" value={editIngredientData.unit} onChange={e => setEditIngredientData({...editIngredientData, unit: e.target.value})}>
                          {DEFAULT_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                      <select className="w-full bg-white rounded-xl p-3.5 font-bold outline-none text-sm" value={editIngredientData.zone} onChange={e => setEditIngredientData({...editIngredientData, zone: e.target.value})}>
                        {currentDb.zones.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                      </select>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => setEditingIngredientId(null)} className="flex-1 bg-slate-200 text-slate-600 p-3 rounded-xl font-bold active:scale-95 transition-all">取消</button>
                        <button onClick={() => {
                          if(editIngredientData.name && editIngredientData.vendor) {
                            const newIngredients = currentDb.ingredients.map(i => i.id === item.id ? editIngredientData : i);
                            updateCurrentDb({ ingredients: newIngredients });
                            setEditingIngredientId(null);
                            triggerNotify('食材更新成功', 'success');
                          }
                        }} className="flex-1 bg-brand-red text-white p-3 rounded-xl font-bold active:scale-95 transition-all shadow-lg">儲存</button>
                      </div>
                    </div>
                  ) : (
                    <div key={item.id} className="bg-white p-5 rounded-[2rem] flex justify-between items-center shadow-sm border border-slate-50">
                      <div className="min-w-0 pr-4">
                        <p className="font-black text-slate-700 truncate">{item.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.vendor} • {item.zone} • {item.unit}</p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditingIngredientId(item.id); setEditIngredientData(item); }} className="bg-slate-50 text-slate-400 hover:text-blue-500 p-2.5 rounded-xl"><OrderSymbolIcon name="Edit" /></button>
                        <button onClick={() => updateCurrentDb({ ingredients: currentDb.ingredients.filter(i => i.id !== item.id) })} className="bg-rose-50 text-rose-400 hover:text-rose-600 p-2.5 rounded-xl"><OrderSymbolIcon name="Trash2" /></button>
                      </div>
                    </div>
                  )
                ))}
                
                {/* 分頁載入更多按鈕 */}
                {currentDb.ingredients.filter(i => (adminZoneFilter === '全部' || i.zone === adminZoneFilter) && (adminVendorFilter === '全部' || i.vendor === adminVendorFilter)).length > adminItemLimit && (
                  <button 
                    onClick={() => setAdminItemLimit(prev => prev + 30)} 
                    className="w-full py-4 mt-4 bg-slate-100 text-slate-500 font-black rounded-2xl active:scale-95 transition-all shadow-sm border border-slate-200"
                  >
                    載入更多食材 (目前顯示 {adminItemLimit} 筆)
                  </button>
                )}
              </div>
            </div>
          )}
          {adminTab === 'vendors' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-3">
                <input placeholder="新廠商名稱" className="flex-1 bg-slate-50 rounded-2xl p-4 font-bold outline-none ring-1 ring-slate-100 border-none min-w-0" value={newVendorName} onChange={e => setNewVendorName(e.target.value)} />
                <button onClick={() => { if(newVendorName && !currentDb.vendors.includes(newVendorName)) { updateCurrentDb({ vendors: [...currentDb.vendors, newVendorName] }); setNewVendorName(''); triggerNotify('新增廠商成功', 'success'); } else if (currentDb.vendors.includes(newVendorName)) { triggerNotify('廠商已存在', 'error'); } }} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shrink-0 whitespace-nowrap shadow-sm">新增</button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {currentDb.vendors.map(v => (
                  editingVendorName === v ? (
                    <div key={v} className="bg-slate-50 p-4 rounded-[1.5rem] flex gap-2 items-center shadow-sm border border-brand-red/30 w-full col-span-2">
                      <input className="flex-1 bg-white rounded-xl p-3 font-bold outline-none ring-1 ring-slate-200 text-sm" value={editVendorNewName} onChange={e => setEditVendorNewName(e.target.value)} />
                      <button onClick={() => setEditingVendorName(null)} className="text-slate-400 font-bold px-3 py-2 text-sm active:scale-95 transition-all">取消</button>
                      <button onClick={() => {
                        const newName = editVendorNewName.trim();
                        if (newName && newName !== v && !currentDb.vendors.includes(newName)) {
                          const newVendors = currentDb.vendors.map(vendor => vendor === v ? newName : vendor);
                          const newIngredients = currentDb.ingredients.map(i => i.vendor === v ? { ...i, vendor: newName } : i);
                          updateCurrentDb({ vendors: newVendors, ingredients: newIngredients });
                          triggerNotify('廠商名稱已更新並同步至相關食材', 'success');
                          setEditingVendorName(null);
                        } else if (currentDb.vendors.includes(newName) && newName !== v) {
                          triggerNotify('廠商名稱已存在', 'error');
                        } else {
                          setEditingVendorName(null);
                        }
                      }} className="bg-brand-red text-white px-4 py-2 rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all">儲存</button>
                    </div>
                  ) : (
                    <div key={v} className="bg-white p-5 rounded-[1.5rem] flex justify-between items-center shadow-sm border border-slate-50">
                      <span className="font-bold text-sm truncate pr-2">{v}</span>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => { setEditingVendorName(v); setEditVendorNewName(v); }} className="text-slate-300 hover:text-blue-500 font-black p-2"><OrderSymbolIcon name="Edit" /></button>
                        <button onClick={() => updateCurrentDb({ vendors: currentDb.vendors.filter(i => i !== v) })} className="text-slate-300 hover:text-rose-500 font-black p-2"><OrderSymbolIcon name="Trash2" /></button>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
          {adminTab === 'zones' && (
            <div className="space-y-8">
              <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-black text-slate-800 flex items-center gap-2"><OrderSymbolIcon name="LayoutGrid" className="text-brand-red" /> 叫貨區站管理</h3>
                <div className="flex gap-3"><input placeholder="新區站名稱" className="flex-1 bg-slate-50 rounded-xl p-4 font-bold outline-none min-w-0" value={newZoneName} onChange={e => setNewZoneName(e.target.value)} /><button onClick={() => { if(newZoneName) { updateCurrentDb({ zones: [...currentDb.zones, { name: newZoneName, icon: 'Package', color: 'bg-slate-500' }] }); setNewZoneName(''); triggerNotify('區站新增成功', 'success'); } }} className="bg-slate-900 text-white px-8 py-4 rounded-xl font-black shrink-0 whitespace-nowrap shadow-sm">新增</button></div>
                <div className="grid grid-cols-2 gap-2">{currentDb.zones.map(z => (<div key={z.name} className="bg-slate-50 px-4 py-3 rounded-xl flex justify-between items-center text-xs font-bold text-slate-700 border border-slate-100"><span>{z.name}</span><button onClick={() => updateCurrentDb({ zones: currentDb.zones.filter(i => i.name !== z.name) })} className="text-slate-300 font-black px-2 hover:text-rose-500"><OrderSymbolIcon name="X" /></button></div>))}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    )}
  </div>
);
};
// --- 遊戲活動大廳與貪食蛇遊戲中心 (卡片選單模組化版) ---

export default OrderingSystem

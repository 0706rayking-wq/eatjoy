import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { db, auth, getPublicPath } from './firebase.js'
import Icon from './components/shared/Icon.jsx'
import { NavCard, SectionItem, BackButton, RuleStandardBlock } from './components/shared/Icon.jsx'
import Ticker from './components/shared/Ticker.jsx'
import Nav from './components/Nav.jsx'
import AuthPage from './components/AuthPage.jsx'
import ScheduleSystem from './components/ScheduleSystem.jsx'
import MenuDisplayPage from './components/MenuDisplayPage.jsx'
import UnifiedRulesPage from './components/UnifiedRulesPage.jsx'
import InspectionPage from './components/InspectionPage.jsx'
import OrderingSystem from './components/OrderingSystem.jsx'
import ListDetailPage from './components/ListDetailPage.jsx'
import AdminPage from './components/admin/AdminPage.jsx'
import GameCenter from './components/game/GameCenter.jsx'
import { APP_THEMES } from './constants.js'

// --- 1. 配置與核心常數 ---
const appIdGlobal = 'kitchen-v16';

const DEFAULT_ZONES = [
{ id: 'beverage', name: '飲調區' }, { id: 'light-meal', name: '輕食區' },
{ id: 'seafood', name: '海鮮區' }, { id: 'vegetable', name: '蔬菜區' },
{ id: 'meat', name: '切肉區' }, { id: 'cold-platter', name: '冷盤區' },
{ id: 'cooked-food', name: '熟食區' }, { id: 'soup', name: '湯品區' }
];

const RULE_CATEGORIES = ['廚房規則', '食品衛生安全', '設備操作安全', '出缺勤規範'];

const MENU_CATEGORIES = [
'湯頭', '前菜/小菜', '沙拉', '壽司', '炸物/烤物',
'披薩/濃湯', '主食', '熱道', '鐵板燒', '甜點',
'自助吧飲料', '吧檯調飲', '限時限量', '壽星招待', '合作品牌'
];

const INITIAL_ORDER_ZONES = [
{ name: "菜區", icon: 'Carrot', color: "bg-emerald-500" },
{ name: "海鮮", icon: 'Fish', color: "bg-blue-500" },
{ name: "湯區", icon: 'Soup', color: "bg-brand-red" }, 
{ name: "熟食", icon: 'UtensilsCrossed', color: "bg-rose-500" },
{ name: "冷台", icon: 'IceCream', color: "bg-cyan-500" },
{ name: "飲調", icon: 'Coffee', color: "bg-amber-600" },
{ name: "輕食區", icon: 'Timer', color: "bg-pink-500" }
];

const DEFAULT_UNITS = ["件", "箱", "包", "斤", "公斤","兩" ,"顆", "條", "罐", "桶", "籃", "袋", "捲", "盒", "兩", "串", "瓶", "組", "板", "塊"];

// --- 工具函式 ---
const compressImage = (base64Str, maxWidth = 800, quality = 0.5) => {
return new Promise((resolve) => {
  const img = new Image();
  img.src = base64Str;
  img.onload = () => {
    const canvas = document.createElement('canvas');
    let width = img.width; let height = img.height;
    if (width > maxWidth) { height = Math.round((height * maxWidth) / width); width = maxWidth; }
    canvas.width = width; canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    resolve(canvas.toDataURL('image/jpeg', quality));
  };
});
};

const triggerLineAlert = async (type, payload = {}) => {
try {
  await fetch("https://script.google.com/macros/s/AKfycby0UlQoywWc1P4UPwOEHeEMS8HbzvKADE_Mzyv4W99Pf1Nk8E_5POBCCGC0UM6okXIb/exec", {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: type, payload: payload })
  });
} catch (e) { console.error("LINE 推播發送失敗", e); }
};

// --- 基礎組件 ---


const App = () => {
const [currentPage, setCurrentPage] = useState('auth');
// 新增：主題彈窗開關與當前主題狀態 (會自動記住使用者的選擇)
const [showThemeModal, setShowThemeModal] = useState(false);
const [activeTheme, setActiveTheme] = useState(() => localStorage.getItem('k_app_theme') || 'red');

// useEffect：切換主題時把所有 CSS 變數寫入 :root
useEffect(() => {
  const themeObj = APP_THEMES.find(t => t.id === activeTheme) || APP_THEMES[0];
  const root = document.documentElement;
  // 基礎品牌色（必要）
  root.style.setProperty('--brand-red', themeObj.color);
  root.style.setProperty('--app-bg', themeObj.bgHex);
  // 完整主題變數
  if (themeObj.vars) {
    Object.entries(themeObj.vars).forEach(([k, v]) => {
      root.style.setProperty(k, v);
    });
  }
  // accent helpers from brand-red
  const [r,g,b] = themeObj.color.split(' ');
  root.style.setProperty('--accent', `rgb(${r},${g},${b})`);
  root.style.setProperty('--accent-10', themeObj.vars?.['--accent-10'] || `rgba(${r},${g},${b},0.15)`);
  root.style.setProperty('--accent-20', themeObj.vars?.['--accent-20'] || `rgba(${r},${g},${b},0.25)`);
  root.style.setProperty('--accent-30', themeObj.vars?.['--accent-30'] || `rgba(${r},${g},${b},0.40)`);
  localStorage.setItem('k_app_theme', activeTheme);
}, [activeTheme]);
const [currentUser, setCurrentUser] = useState(() => { const saved = localStorage.getItem('k_active_user'); return saved ? JSON.parse(saved) : null; });
const [isSuperAdmin, setIsSuperAdmin] = useState(() => localStorage.getItem('k_super_admin') === 'true');
const [isManager, setIsManager] = useState(() => {
  if (localStorage.getItem('k_super_admin') === 'true') return true;
  const saved = localStorage.getItem('k_active_user');
  if (saved) {
    try { return JSON.parse(saved).role === '主管'; } catch(e) {}
  }
  return false;
});
const [fbReady, setFbReady] = useState(false);
const [user, setUser] = useState(null);
const [notifications, setNotifications] = useState([]);
const [users, setUsers] = useState([]);

const [activeAnnouncement, setActiveAnnouncement] = useState(null);

// 全域資料
const [globalBranches, setGlobalBranches] = useState(['南港Lalaport']);
const [currentBranch, setCurrentBranch] = useState('南港Lalaport');
const [branchZones, setBranchZones] = useState([]);
const [announcements, setAnnouncements] = useState([]);
const [tickerText, setTickerText] = useState('');
// --- 貪食蛇遊戲專用狀態 ---
const [gameConfig, setGameConfig] = useState({
  isOpen: false,
  bossName: "被感染的小雷神",
  bossImg: null,
  questions: []
});
const [menuData, setMenuData] = useState({});
const [onboardingData, setOnboardingData] = useState({});
const [benefitsData, setBenefitsData] = useState({});
const [rulesData, setRulesData] = useState({});
const [globalRecipes, setGlobalRecipes] = useState([]);

// 分店特定資料
const [completedZones, setCompletedZones] = useState([]);
const [standards, setStandards] = useState({});
const [signatures, setSignatures] = useState([]);

const logout = () => { 
  setCurrentUser(null); setIsManager(false); setIsSuperAdmin(false); setCurrentPage('auth'); 
  localStorage.removeItem('k_active_user'); 
  localStorage.removeItem('k_super_admin');
};
const triggerNotify = useCallback((msg, type = "info") => {
  const id = Date.now(); setNotifications(prev => [...prev, { id, msg, type }]);
  setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
}, []);

const openAnnouncement = (a) => {
  setActiveAnnouncement(a);
  const readBy = a.readBy || [];
  if (currentUser && !readBy.includes(currentUser.name)) {
    const newReadBy = [...readBy, currentUser.name];
    
    // 更新新的獨立文件結構
    db.collection(getPublicPath(`announcements/branch_${currentBranch}/items`)).doc(String(a.id)).set({ readBy: newReadBy }, { merge: true });
    
    // 為了向下相容，也同步更新舊版陣列中的已讀狀態
    db.doc(getPublicPath(`announcements/branch_${currentBranch}`)).get().then(doc => {
      if(doc.exists && doc.data().items) {
        const items = doc.data().items;
        const idx = items.findIndex(i => String(i.id) === String(a.id));
        if(idx > -1) {
          items[idx].readBy = newReadBy;
          db.doc(getPublicPath(`announcements/branch_${currentBranch}`)).set({ items });
        }
      }
    });
  }
};

// 前端定時排程檢查 (修改版：防重複推播與管理員全店巡檢)
useEffect(() => {
  if (!currentUser || !currentBranch) return;

  let intervalId;
  // 【防重複發送 1】：產生 1~15 秒的隨機延遲，防止所有裝置在 23:00 整「同時」發送請求
  const randomDelay = Math.floor(Math.random() * 15000);

  const checkCronTasks = async () => {
    try {
      const now = new Date();
      const h = now.getHours();

      // 【重點修改】：如果是最高權限，一次檢查全部分店；否則只檢查自己當前畫面上的分店
      const branchesToCheck = isSuperAdmin ? globalBranches : [currentBranch];

      for (const branch of branchesToCheck) {
        const cronRef = db.doc(getPublicPath(`system/cron_${branch}`));
        const docSnap = await cronRef.get();
        const data = docSnap.exists ? docSnap.data() : {};

        // 1. 每天 18:00 重置巡視進度與照片
        let targetResetDate = new Date(now);
        if (h < 18) targetResetDate.setDate(targetResetDate.getDate() - 1);
        const targetResetStr = `${targetResetDate.getFullYear()}-${targetResetDate.getMonth()+1}-${targetResetDate.getDate()}`;

        if (data.lastReset !== targetResetStr) {
          // 【防重複發送 2】：先寫入標記，再執行清空
          await cronRef.set({ lastReset: targetResetStr }, {merge: true});
          const photos = await db.collection(getPublicPath(`daily_photos_${branch}`)).get();
          const batch = db.batch();
          photos.forEach(d => batch.delete(d.ref));
          await batch.commit();
          await db.doc(getPublicPath(`system/progress_${branch}`)).set({ completedZones: [] }, {merge: true});
        }

        // 2. 每天 23:00 檢查未完成區站並推播
        let targetAlertDate = new Date(now);
        if (h < 23) targetAlertDate.setDate(targetAlertDate.getDate() - 1);
        const targetAlertStr = `${targetAlertDate.getFullYear()}-${targetAlertDate.getMonth()+1}-${targetAlertDate.getDate()}`;

        if (h >= 23 && data.lastMissingAlert !== targetAlertStr) {
          // 【防重複發送 2】：先寫入資料庫標記「今晚已發送過」，再實際發送推播！
          await cronRef.set({ lastMissingAlert: targetAlertStr }, {merge: true});

          const progSnap = await db.doc(getPublicPath(`system/progress_${branch}`)).get();
          const completed = progSnap.exists ? (progSnap.data().completedZones || []) : [];
          const zoneSnap = await db.doc(getPublicPath(`config/zones_${branch}`)).get();
          const zones = zoneSnap.exists ? (zoneSnap.data().zones || []) : [];

          if (zones.length > 0 && completed.length < zones.length) {
            const missing = zones.filter(z => !completed.includes(z.id)).map(z => z.name);
            triggerLineAlert("INCOMPLETE_ALERT", { branch: branch, missingZones: missing.join(', ') });
          }
        }

        // 3. 每天 00:00 重置叫貨暫存
        const targetOrderResetStr = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`;
        if (data.lastOrderReset !== targetOrderResetStr) {
          await cronRef.set({ lastOrderReset: targetOrderResetStr }, {merge: true});
          await db.doc(getPublicPath(`ordering/db_${branch}`)).set({ activeQuantities: {} }, {merge: true});
        }
      }
    } catch(e) { console.error("定時排程錯誤:", e); }
  };

  // 等待隨機延遲後，再開始定時任務
  const timeoutId = setTimeout(() => {
    checkCronTasks(); 
    intervalId = setInterval(checkCronTasks, 60000);
  }, randomDelay);

  return () => {
    clearTimeout(timeoutId);
    if (intervalId) clearInterval(intervalId);
  };
}, [currentUser, currentBranch, isSuperAdmin, globalBranches]);

useEffect(() => {
  const initAuth = async () => { 
    try { 
      await auth.signInAnonymously(); 
      setFbReady(true); 
      if (currentUser || localStorage.getItem('k_super_admin') === 'true') setCurrentPage('home'); 
    } catch (e) { 
      triggerNotify("連線失敗", "error"); 
    } 
  };
  initAuth(); return auth.onAuthStateChanged(u => setUser(u));
}, []);

// 全域系統資料監聽 (保留使用者清單、分店清單與全域菜單庫)
useEffect(() => {
  if (!user) return;
  const errH = () => triggerNotify("讀取失敗", "error");
  const subs = [
    db.doc(getPublicPath('system/branches')).onSnapshot(d => d.exists && d.data().list && setGlobalBranches(d.data().list), errH),
    db.collection(getPublicPath('global_recipes')).onSnapshot(s => setGlobalRecipes(s.docs.map(d => ({id: d.id, ...d.data()}))), errH),
    db.collection(getPublicPath('users')).onSnapshot(s => { 
      const all = s.docs.map(d => d.data()); setUsers(all); 
      if (currentUser) { 
        const upd = all.find(u => u.phone === currentUser.phone); 
        if (upd && (upd.status !== currentUser.status || upd.role !== currentUser.role)) { 
          setCurrentUser(upd); localStorage.setItem('k_active_user', JSON.stringify(upd)); 
          if(upd.status === 'approved' && upd.role === '主管') setIsManager(true);
        } 
      } 
    }, errH)
  ];
  return () => subs.forEach(un => un());
}, [user, currentUser]);

// 依據目前選擇的分店 (currentBranch) 動態切換資料庫監聽 (全面分流)
useEffect(() => {
  if(!user || !currentBranch) return;
  const errH = () => {};
  
  const subZone = db.doc(getPublicPath(`config/zones_${currentBranch}`)).onSnapshot(d => { setBranchZones(d.exists && d.data().zones ? d.data().zones : DEFAULT_ZONES); }, errH);
  const subProg = db.doc(getPublicPath(`system/progress_${currentBranch}`)).onSnapshot(d => setCompletedZones(d.exists ? (d.data().completedZones || []) : []), errH);
  const subStd = db.collection(getPublicPath(`standards_${currentBranch}`)).onSnapshot(s => { const m = {}; s.forEach(doc => { const d = doc.data(); if (!m[d.zoneId]) m[d.zoneId] = []; m[d.zoneId].push({...d, id: doc.id}); }); setStandards(m); }, errH);
  const subTicker = db.doc(getPublicPath(`ticker/branch_${currentBranch}`)).onSnapshot(d => { setTickerText(d.exists ? d.data().text || '' : ''); }, errH);
  const subGame = db.doc(getPublicPath('system/game_config')).onSnapshot(d => {
    if (d.exists) setGameConfig(d.data());
  }, errH);
  const subOnboardVid = db.doc(getPublicPath(`onboarding/settings_${currentBranch}`)).onSnapshot(d => setOnboardingData(p => ({...p, ...(d.exists ? d.data() : {})})), errH);
  const subSigs = db.collection(getPublicPath(`signatures_${currentBranch}`)).onSnapshot(s => setSignatures(s.docs.map(d => ({ ...d.data(), id: d.id })).sort((a,b)=>b.timestamp-a.timestamp)), errH);

  // --- 自動向下相容與新舊架構合併讀取，並支援拖曳排序與異常修復 ---
  const createMergedListener = (colPath, docPath, setter, sortDesc = true) => {
    return db.collection(getPublicPath(colPath)).onSnapshot(s => {
      const newItemsMap = new Map();
      s.docs.forEach(doc => {
        const data = doc.data();
        if (!data.id) data.id = doc.id;
        newItemsMap.set(String(data.id), data);
      });
      
      db.doc(getPublicPath(docPath)).get().then(d => {
        const oldItems = d.exists && d.data().items ? d.data().items : [];
        const merged = [];
        const processedNewIds = new Set();

        // 合併舊資料與新資料 (如果新資料是不完整的空殼，就以舊資料為主並補上排序)
        oldItems.forEach(oldItem => {
          const oldIdStr = String(oldItem.id);
          if (newItemsMap.has(oldIdStr)) {
            const newItem = newItemsMap.get(oldIdStr);
            if (!newItem.title && !newItem.content && !newItem.img && !newItem.instructions) {
              merged.push({ ...oldItem, ...newItem });
            } else {
              merged.push(newItem);
            }
            processedNewIds.add(oldIdStr);
          } else {
            merged.push(oldItem);
          }
        });

        // 把不在舊陣列中的全新資料加進來，並自動清理垃圾空殼
        newItemsMap.forEach((newItem, idStr) => {
          if (!processedNewIds.has(idStr)) {
            if (newItem.title || newItem.img || newItem.content) {
              merged.push(newItem);
            } else {
              // 自動清除純空殼異常資料
              db.collection(getPublicPath(colPath)).doc(idStr).delete().catch(()=>{});
            }
          }
        });
        
        merged.sort((a, b) => {
          const orderA = a.sortOrder !== undefined ? a.sortOrder : 999999;
          const orderB = b.sortOrder !== undefined ? b.sortOrder : 999999;
          if (orderA !== orderB) return orderA - orderB;
          if (sortDesc) return (b.timestamp || 0) - (a.timestamp || 0);
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        
        setter(merged);
      }).catch(() => {
        const pureNewItems = Array.from(newItemsMap.values()).filter(i => i.title || i.img || i.content);
        pureNewItems.sort((a, b) => {
          const orderA = a.sortOrder !== undefined ? a.sortOrder : 999999;
          const orderB = b.sortOrder !== undefined ? b.sortOrder : 999999;
          if (orderA !== orderB) return orderA - orderB;
          if (sortDesc) return (b.timestamp || 0) - (a.timestamp || 0);
          return (a.timestamp || 0) - (b.timestamp || 0);
        });
        setter(pureNewItems);
      });
    }, errH);
  };

  const subAnn = createMergedListener(`announcements/branch_${currentBranch}/items`, `announcements/branch_${currentBranch}`, items => setAnnouncements(items));
  const subMenu = createMergedListener(`menu/list_${currentBranch}/items`, `menu/list_${currentBranch}`, items => setMenuData({items}));
  const subOnboardList = createMergedListener(`onboarding/list_${currentBranch}/items`, `onboarding/list_${currentBranch}`, items => setOnboardingData(p => ({...p, list: items})));
  const subOnboardPark = createMergedListener(`onboarding/parking_${currentBranch}/items`, `onboarding/parking_${currentBranch}`, items => setOnboardingData(p => ({...p, parking: items})));
  const subBenEval = createMergedListener(`benefits/eval_${currentBranch}/items`, `benefits/eval_${currentBranch}`, items => setBenefitsData(p => ({...p, evaluation: items})));
  const subBenWel = createMergedListener(`benefits/welfare_${currentBranch}/items`, `benefits/welfare_${currentBranch}`, items => setBenefitsData(p => ({...p, welfare: items})));
  
  const ruleSubs = RULE_CATEGORIES.map(cat => 
    createMergedListener(`rules/${cat}_${currentBranch}/items`, `rules/${cat}_${currentBranch}`, items => setRulesData(prev => ({ ...prev, [cat]: items })))
  );

  return () => { 
    subZone(); subProg(); subStd(); subAnn(); subTicker(); subGame();subOnboardVid(); subSigs();
    subMenu(); subOnboardList(); subOnboardPark(); subBenEval(); subBenWel();
    ruleSubs.forEach(un => un());
  };
}, [user, currentBranch]);

// 確保非最高權限者強制綁定自己的分店 (支援複數分店切換)
useEffect(() => {
  if (!isSuperAdmin && currentUser && currentUser.branch) {
    const allowedBranches = Array.isArray(currentUser.branch) ? currentUser.branch : [currentUser.branch];
    // 如果當前選擇的分店不在該使用者的允許清單內，則強制跳回他的第一間分店
    if (!allowedBranches.includes(currentBranch)) {
      setCurrentBranch(allowedBranches[0]);
    }
  }
}, [currentUser, isSuperAdmin, currentBranch]);

const renderPage = () => {
  switch(currentPage) {
    case 'home': {
      const progressPercent = branchZones.length > 0 ? Math.round((completedZones.length / branchZones.length) * 100) : 0;
      return (
        <div className="page-enter pb-10">
          <Ticker text={tickerText} />
          <div className="p-4 space-y-6 mt-2 text-left font-bold">
            
{/* 支援最高權限與多店主管：首頁快速切換分店 */}
            {(isSuperAdmin || (Array.isArray(currentUser?.branch) && currentUser.branch.length > 1)) && (
              <div className="bg-slate-900 text-white p-4 rounded-[2rem] flex items-center justify-between shadow-xl mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 mb-0.5">目前檢視分店</p>
                  <select 
                    value={currentBranch} 
                    onChange={e => setCurrentBranch(e.target.value)} 
                    className="bg-transparent border-none text-xl font-black outline-none appearance-none cursor-pointer text-white"
                  >
                    {(isSuperAdmin ? globalBranches : currentUser.branch).map(b => (
                      <option key={b} value={b} className="text-slate-900">{b}</option>
                    ))}
                  </select>
                </div>
                <div className="bg-brand-red w-10 h-10 rounded-xl flex items-center justify-center shadow-lg">
                  <Icon name="building-2" size={20} className="text-white"/>
                </div>
              </div>
            )}

            <div onClick={() => setCurrentPage('inspection')} className="glass-panel p-6 rounded-[2.5rem] border-l-4 border-l-brand-red bg-white shadow-sm active-scale cursor-pointer">
              <div className="flex justify-between items-end mb-4 px-1"><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">巡視進度 (18:00刷新)</p><h3 className="text-lg font-black text-slate-800 leading-tight">{completedZones.length >= branchZones.length && branchZones.length > 0 ? "✅ 全數巡視完成" : `進度：${completedZones.length} / ${branchZones.length || 1}`}</h3></div><span className="text-sm font-black text-brand-red">{progressPercent}%</span></div>
              <div className="bg-slate-100 h-3.5 rounded-full overflow-hidden border shadow-inner"><div className="h-full bg-brand-red opacity-80 transition-all duration-700" style={{ width: `${progressPercent}%` }}></div></div>
            </div>
            
            {/* 最新公告區塊 */}
            <div className="space-y-3">
              <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2 mb-2"><Icon name="bell" size={20} className="text-brand-red" /> {currentBranch} 最新公告</h3>
              {announcements.length > 0 ? announcements.slice(0, 3).map(a => {
                // 加入 currentUser 的安全檢查
                const isRead = currentUser?.name ? a.readBy?.includes(currentUser.name) : false;
                return (
                  <div key={a.id} onClick={() => openAnnouncement(a)} className={`glass-panel p-4 rounded-2xl border cursor-pointer active:scale-[0.98] transition-all flex gap-4 ${isRead ? 'opacity-70 bg-slate-50 border-slate-200 shadow-none' : 'bg-white border-brand-red/30 shadow-sm'}`}>
                    {!isRead && <div className="w-2 h-2 rounded-full bg-brand-red mt-2 shrink-0 animate-pulse" />}
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-black truncate ${isRead ? 'text-slate-600' : 'text-slate-800'}`}>{a.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-1">{a.content}</p>
                    </div>
                    <div className="text-[10px] text-slate-300 whitespace-nowrap pt-1">
                      {new Date(a.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                )
              }) : <div className="text-center py-6 text-slate-400 text-xs font-bold glass-panel rounded-2xl border border-dashed shadow-sm">目前無新公告</div>}
            </div>

            <section className="grid grid-cols-2 gap-4">
              <NavCard title="叫貨系統" onClick={() => setCurrentPage('ordering')} colorClass="bg-rose-50/80" iconName="package-plus" />
              <NavCard title="員工守則" onClick={() => setCurrentPage('unifiedRules')} colorClass="bg-emerald-50/50" iconName="book-open" />
              <NavCard title="每月班表" onClick={() => setCurrentPage('schedule')} colorClass="bg-indigo-50/50" iconName="calendar" />
              <NavCard title="入職相關" onClick={() => setCurrentPage('onboarding')} colorClass="bg-blue-50/50" iconName="user-plus" />
              <NavCard title="薪資福利" onClick={() => setCurrentPage('benefits')} colorClass="bg-rose-50/50" iconName="wallet" />
              <NavCard title="本季菜單" onClick={() => setCurrentPage('menu')} colorClass="bg-yellow-50/50" iconName="utensils" />
              <NavCard title="限時活動" onClick={() => setCurrentPage('game-center')} colorClass="bg-amber-50/50" iconName="gamepad-2" />
              <NavCard title="個人成就" onClick={() => setCurrentPage('achievements')} colorClass="bg-purple-50/50" iconName="trophy" />
            </section>
          </div>
        </div>
      );
    }
    case 'ordering': return <OrderingSystem onBack={()=>setCurrentPage('home')} triggerNotify={triggerNotify} globalBranches={globalBranches} currentBranch={currentBranch} isSuperAdmin={isSuperAdmin} getPublicPath={getPublicPath} />;
    case 'inspection': return <InspectionPage onBack={()=>setCurrentPage('home')} standards={standards} completedZones={completedZones} triggerNotify={triggerNotify} branchZones={branchZones} currentBranch={currentBranch} getPublicPath={getPublicPath} currentUser={currentUser} />;
    case 'unifiedRules': return <UnifiedRulesPage rulesData={rulesData} onBack={()=>setCurrentPage('home')} user={currentUser} currentBranch={currentBranch} triggerNotify={triggerNotify} getPublicPath={getPublicPath} signatures={signatures} />;
    case 'menu': return <MenuDisplayPage onBack={()=>setCurrentPage('home')} items={menuData?.items} />;
    case 'game-center': return <GameCenter onBack={()=>setCurrentPage('home')} config={gameConfig} currentBranch={currentBranch} currentUser={currentUser} getPublicPath={getPublicPath} allUsers={users} isSuperAdmin={isSuperAdmin} />;
    case 'schedule': return <ScheduleSystem onBack={()=>setCurrentPage('home')} currentBranch={currentBranch} isManager={isManager || isSuperAdmin} getPublicPath={getPublicPath} triggerNotify={triggerNotify} />;
    case 'onboarding': return (
      <div className="p-4 space-y-4 page-enter text-left">
        <BackButton onClick={()=>setCurrentPage('home')} title="入職相關" />
        <SectionItem title="員工準備清單" iconName="list-checks" onClick={()=>setCurrentPage('onboard-list')} />
        <SectionItem title="停車資訊指引" iconName="car" onClick={()=>setCurrentPage('onboard-parking')} />
        <SectionItem title="上班動線引導" iconName="navigation" onClick={()=>setCurrentPage('workRoute')} />
      </div>
    );
    case 'onboard-list': return <ListDetailPage onBack={()=>setCurrentPage('onboarding')} title="準備清單" list={onboardingData?.list} />;
    case 'onboard-parking': return <ListDetailPage onBack={()=>setCurrentPage('onboarding')} title="停車資訊" list={onboardingData?.parking} />;
    case 'workRoute': return (
      <div className="p-4 space-y-8 page-enter text-left pb-10 font-bold">
        <BackButton onClick={()=>setCurrentPage('onboarding')} title="上班動線" />
        <div className="space-y-4">
          {[{l:'大眾運輸引導',u:onboardingData?.routeBusUrl, icon:'bus'}, {l:'自行前往引導',u:onboardingData?.routeCarUrl, icon:'car'}].map(x => (
            <div key={x.l} onClick={() => x.u && window.open(x.u, '_blank')} className="glass-panel p-6 rounded-[2.5rem] bg-white border flex items-center justify-between active:bg-slate-50 cursor-pointer group transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-brand-red rounded-2xl flex items-center justify-center shadow-inner"><Icon name={x.icon} size={22} /></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase mb-1">Guide</p><h3 className="text-sm font-black text-slate-800">{x.l}</h3></div>
              </div>
              <Icon name="chevron-right" size={18} className="text-slate-300 group-active:text-brand-red" />
            </div>
          ))}
        </div>
      </div>
    );
    case 'benefits': return (
      <div className="p-4 space-y-4 page-enter text-left">
        <BackButton onClick={()=>setCurrentPage('home')} title="薪資福利" />
        <SectionItem title="考核加給標準" iconName="coins" onClick={()=>setCurrentPage('benefit-eval')} />
        <SectionItem title="員工相關福利" iconName="heart" onClick={()=>setCurrentPage('benefit-wel')} />
      </div>
    );
    case 'benefit-eval': return <ListDetailPage onBack={()=>setCurrentPage('benefits')} title="考核標準" list={benefitsData?.evaluation} />;
    case 'benefit-wel': return <ListDetailPage onBack={()=>setCurrentPage('benefits')} title="福利項目" list={benefitsData?.welfare} />;
    case 'admin': return <AdminPage onBack={()=>setCurrentPage('home')} onLogout={logout} announcements={announcements} standards={standards} users={users} triggerNotify={triggerNotify} menu={menuData} onboarding={onboardingData} benefits={benefitsData} rulesData={rulesData} isSuperAdmin={isSuperAdmin} currentBranch={currentBranch} setCurrentBranch={setCurrentBranch} globalBranches={globalBranches} branchZones={branchZones} getPublicPath={getPublicPath} signatures={signatures} tickerText={tickerText} setTickerText={setTickerText} globalRecipes={globalRecipes} currentUser={currentUser} />;
    default: return <div className="p-20 text-center text-slate-400 font-black h-screen flex flex-col items-center justify-center gap-4"><Icon name="loader-2" className="animate-spin text-brand-red" size={32}/> 系統啟動中...</div>;
  }
};

return (
  <div className="min-h-screen flex flex-col">
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xs space-y-3 px-4">
      {notifications.map(n => (<div key={n.id} className={`toast-enter p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 glass-panel border-l-4 ${n.type === 'success' ? 'border-l-emerald-500 text-emerald-700' : 'border-l-brand-red text-brand-red'}`}><Icon name={n.type === 'success' ? 'check-circle' : 'alert-triangle'} size={24} /><span className="font-bold text-xs leading-tight">{n.msg}</span></div>))}
    </div>

    {currentPage !== 'auth' && (
      <header className="p-5 sticky top-0 z-50 flex justify-between items-center bg-white/80 backdrop-blur-md border-b">
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => (isManager || currentUser?.status === 'approved') && setCurrentPage('home')}>
          <div className="bg-brand-red w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0 font-black text-xl leading-none">
            饗
          </div>
          <div>
            <span className="font-black text-xl text-slate-800 tracking-tighter leading-none block">EATJOY <span className="text-brand-red">OS</span></span>
            <span className="text-[9px] text-slate-400 font-bold uppercase">{currentBranch}</span>
          </div>
        </div>
        <div className="flex gap-2">
          {/* 新增的主題按鈕 */}
          <button onClick={() => setShowThemeModal(true)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-slate-100 text-slate-600 hover:text-brand-red active:scale-95 transition-all shadow-sm shrink-0 whitespace-nowrap">
            <Icon name="palette" size={16} />
          </button>
          <button onClick={() => isManager ? setCurrentPage('admin') : (currentUser?.status === 'approved' && setCurrentPage('home'))} className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black active:scale-95 transition-all shadow-sm shrink-0 whitespace-nowrap ${isSuperAdmin ? 'bg-brand-red text-white' : (isManager ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600')}`}>
            <Icon name={isManager ? "settings" : "bell"} size={16} />
            {isManager ? "後台" : "通知"}
          </button>
          {(currentUser || isManager) && (
            <button onClick={logout} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black bg-rose-50 text-brand-red border border-rose-100 active:scale-95 transition-all shadow-sm shrink-0 whitespace-nowrap">
              <Icon name="log-out" size={16} />
              登出
            </button>
          )}
        </div>
      </header>
    )}
    <main className={`flex-grow mx-auto w-full font-bold ${currentPage === 'schedule' ? 'max-w-[1600px] px-2' : 'max-w-lg'}`}>
      {!fbReady ? <div className="p-20 text-center h-screen flex flex-col items-center justify-center gap-4 font-bold"><Icon name="loader-2" className="animate-spin text-brand-red" size={48}/><p className="text-slate-400 font-black text-xs">連線中...</p></div>
      : (!isManager && !currentUser) ? <AuthPage users={users} setCurrentUser={setCurrentUser} setCurrentPage={setCurrentPage} setIsManager={setIsManager} setIsSuperAdmin={setIsSuperAdmin} setCurrentBranch={setCurrentBranch} globalBranches={globalBranches} triggerNotify={triggerNotify} getPublicPath={getPublicPath} />
      : (isManager || currentUser?.status === 'approved') ? renderPage() : (
        <div className="p-10 pt-32 text-center h-screen space-y-8 font-bold">
          <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-lg"><Icon name="clock" size={48} className="text-brand-red animate-pulse" /></div>
          <div className="space-y-2 text-center px-4"><h3 className="text-2xl font-black text-slate-800">授權等待中</h3><p className="text-slate-500 text-sm">註冊申請已提交。請聯繫您的主管進行核准。</p></div>
          <button onClick={logout} className="text-slate-400 font-bold border-b pb-1 text-sm">登出</button>
        </div>
      )}
      {/* 主題選擇彈跳視窗 */}
      {showThemeModal && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 page-enter" onClick={() => setShowThemeModal(false)}>
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm shadow-2xl font-bold text-left flex flex-col" style={{maxHeight:'85vh'}} onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center px-6 pt-6 pb-4 shrink-0" style={{borderBottom:'1px solid var(--gold-border,rgba(255,255,255,0.1))'}}>
              <h2 className="text-base font-black text-slate-800 flex items-center gap-2">
                <Icon name="sparkles" size={18} className="text-brand-red" />
                介面風格選擇
              </h2>
              <button onClick={() => setShowThemeModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-brand-red transition-colors active:scale-90"><Icon name="x" size={16} /></button>
            </div>

            {/* Theme grid — scrollable */}
            <div className="overflow-y-auto no-scrollbar px-5 py-4 flex-1">
              {/* Group labels */}
              {[
                { label: '✨ 奢華系列', ids: ['crimson-gold','midnight-sapphire','obsidian-emerald','volcanic-amber','royal-violet'] },
                { label: '⚡ 科技系列', ids: ['cyber-neon','matrix-green','titanium'] },
                { label: '🌿 自然系列', ids: ['cherry-blossom','deep-ocean','forest-moss'] },
                { label: '🕯️ 復古系列', ids: ['vintage-burgundy','antique-bronze','ink-indigo'] },
                { label: '✦ 特殊系列', ids: ['rose-gold','arctic-white','sakura-white','lava-orange'] },
              ].map(group => (
                <div key={group.label} className="mb-5">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2.5 px-1" style={{color:'var(--t3,#888)'}}>{group.label}</p>
                  <div className="grid grid-cols-1 gap-2">
                    {APP_THEMES.filter(t => group.ids.includes(t.id)).map(t => (
                      <button
                        key={t.id}
                        onClick={() => { setActiveTheme(t.id); triggerNotify(`已切換：${t.name}`, "success"); }}
                        className="relative flex items-center gap-3 p-3 rounded-2xl transition-all active:scale-[0.98] text-left overflow-hidden"
                        style={{
                          background: t.previewBg,
                          border: activeTheme === t.id
                            ? `2px solid ${t.previewAccent}`
                            : '2px solid rgba(255,255,255,0.08)',
                          boxShadow: activeTheme === t.id
                            ? `0 0 0 1px ${t.previewAccent}40, 0 4px 16px rgba(0,0,0,0.4)`
                            : '0 2px 8px rgba(0,0,0,0.25)',
                        }}
                      >
                        {/* Color dot */}
                        <div className="shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg"
                          style={{background:`linear-gradient(135deg,${t.hex},${t.previewAccent})`,boxShadow:`0 2px 8px ${t.previewAccent}50`}}>
                          {t.emoji}
                        </div>
                        {/* Text */}
                        <div className="flex-1 min-w-0">
                          <div className="font-black text-sm leading-none mb-0.5" style={{color:'#fff',textShadow:'0 1px 4px rgba(0,0,0,0.6)'}}>{t.name}</div>
                          <div className="text-[10px] font-bold" style={{color:'rgba(255,255,255,0.55)'}}>{t.desc}</div>
                        </div>
                        {/* Active check */}
                        {activeTheme === t.id && (
                          <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
                            style={{background:t.previewAccent,boxShadow:`0 2px 6px ${t.previewAccent}60`}}>
                            <Icon name="check" size={13} style={{color:'#000'}} />
                          </div>
                        )}
                        {/* Shimmer overlay for active */}
                        {activeTheme === t.id && (
                          <div className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{background:`linear-gradient(90deg,transparent,${t.previewAccent}15,transparent)`,animation:'shimmerSlide 2s ease-in-out infinite'}} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-3 shrink-0" style={{borderTop:'1px solid var(--gold-border,rgba(255,255,255,0.1))'}}>
              <button onClick={() => setShowThemeModal(false)} className="w-full bg-brand-red text-white font-black py-4 rounded-2xl active:scale-95 transition-all text-sm">
                套用風格
              </button>
            </div>
          </div>
          <style>{`
            @keyframes shimmerSlide {
              0%   { transform: translateX(-100%); }
              100% { transform: translateX(100%); }
            }
          `}</style>
        </div>
      )}
      
      {/* 獨立公告彈出視窗 */}
      {activeAnnouncement && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 page-enter">
          <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl max-h-[85vh] overflow-y-auto font-bold text-left">
            <h2 className="text-xl font-black text-slate-800 mb-2 leading-tight">{activeAnnouncement.title}</h2>
            <p className="text-[10px] text-slate-400 mb-4 flex items-center gap-1"><Icon name="clock" size={12}/> {new Date(activeAnnouncement.timestamp).toLocaleString()}</p>
            {activeAnnouncement.img && <img src={activeAnnouncement.img} className="w-full rounded-2xl mb-5 object-cover border shadow-sm" alt="公告圖片" />}
            <p className="text-sm font-bold text-slate-600 whitespace-pre-wrap leading-relaxed">{activeAnnouncement.content}</p>
            <button onClick={() => setActiveAnnouncement(null)} className="mt-8 w-full bg-brand-red text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-lg">關閉</button>
          </div>
        </div>
      )}
    </main>
  </div>
);
};


export default App

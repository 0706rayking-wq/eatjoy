import React, { useState, useEffect, useRef, useCallback } from 'react'
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


export default OrderingSystem

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { db, getPublicPath } from '../../firebase.js'
import Icon from './Icon.jsx'

const UniversalListManager = ({ categoryPath, currentBranch, globalBranches, isSuperAdmin, items = [], titleLabel = "名稱", triggerNotify, getPublicPath, categories = null }) => {
const [newT, setNewT] = useState(''); 
const [newC, setNewC] = useState(''); 
const [newI, setNewI] = useState(null);
const [newCat, setNewCat] = useState(categories ? categories[0] : '');
const [editingId, setEditingId] = useState(null);
const [syncToAll, setSyncToAll] = useState(false);

// 拖曳狀態
const [draggedId, setDraggedId] = useState(null);
const [overId, setOverId] = useState(null);

const startEdit = (item) => {
  setEditingId(item.id);
  setNewT(item.title);
  setNewC(item.content || '');
  setNewI(item.img || null);
  if (categories) setNewCat(item.category || categories[0]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  setEditingId(null); setNewT(''); setNewC(''); setNewI(null);
  if (categories) setNewCat(categories[0]);
};

const handleSave = async () => {
  if (!newT.trim() || !newC.trim()) return triggerNotify("標題與內容不能為空", "error");
  let imgToSave = newI; 
  if (newI && newI.startsWith('data:')) imgToSave = await compressImage(newI);
  
  const targetBranches = (isSuperAdmin && syncToAll) ? globalBranches : [currentBranch];
  const sharedId = editingId ? String(editingId) : crypto.randomUUID();
  const now = Date.now();

  try {
    await Promise.all(targetBranches.map(async (branch) => {
      const itemData = { id: sharedId, title: newT.trim(), content: newC.trim(), img: imgToSave, updateTime: now };
      if (!editingId) {
        itemData.timestamp = now;
        itemData.sortOrder = items.length; // 預設放在最後面
      }
      if (categories) itemData.category = newCat;

      const colPath = getPublicPath(`${categoryPath}_${branch}/items`);
      return db.collection(colPath).doc(sharedId).set(itemData, { merge: true });
    }));
    triggerNotify(editingId ? "更新成功" : "發佈成功", "success");
    cancelEdit();
  } catch (e) { triggerNotify("存檔失敗 (可能是圖片太大)", "error"); }
};

const deleteItem = async (id) => {
  const isConfirmed = window.confirm(syncToAll && isSuperAdmin ? "確定要刪除嗎？這會同時刪除所有分店的該項目。" : "確定要刪除嗎？");
  if(!isConfirmed) return;

  const targetBranches = (isSuperAdmin && syncToAll) ? globalBranches : [currentBranch];
  try {
    await Promise.all(targetBranches.map(async (branch) => {
      const idStr = String(id);
      // 從新的獨立 Collection 刪除
      await db.collection(getPublicPath(`${categoryPath}_${branch}/items`)).doc(idStr).delete();
      
      // 為了向下相容，同時也清空舊版陣列裡可能殘留的同名資料
      const oldDocRef = db.doc(getPublicPath(`${categoryPath}_${branch}`));
      const oldSnap = await oldDocRef.get();
      if(oldSnap.exists && oldSnap.data().items) {
        const newItems = oldSnap.data().items.filter(i => String(i.id) !== idStr);
        await oldDocRef.set({ items: newItems });
      }
    }));
    triggerNotify("項目已刪除", "info");
  } catch(e) { triggerNotify("刪除失敗", "error"); console.error(e); }
};

const handleDragStart = (id) => setDraggedId(id);
const handleDragOver = (e, id) => { e.preventDefault(); if (id !== draggedId) setOverId(id); };
const handleDragEnd = async () => {
  if (draggedId !== null && overId !== null && draggedId !== overId) {
    const newItems = [...items];
    const fromIndex = newItems.findIndex(i => String(i.id) === String(draggedId));
    const toIndex = newItems.findIndex(i => String(i.id) === String(overId));
    
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      try {
        const batch = db.batch();
        newItems.forEach((item, index) => {
          const docRef = db.collection(getPublicPath(`${categoryPath}_${currentBranch}/items`)).doc(String(item.id));
          batch.set(docRef, { ...item, sortOrder: index }, { merge: true });
        });
        await batch.commit();
      } catch(e) {
        triggerNotify("排序儲存失敗", "error");
      }
    }
  }
  setDraggedId(null);
  setOverId(null);
};

return (
  <div className="space-y-4">
    <div className={`glass-panel p-6 rounded-[2.5rem] space-y-4 bg-white shadow-sm border transition-all ${editingId ? 'border-blue-500/30 shadow-blue-500/10' : 'border-slate-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-slate-800 text-xs flex items-center gap-2 uppercase tracking-widest">
          {editingId ? <><Icon name="edit" size={16} className="text-blue-500" /> 編輯項目</> : <><Icon name="plus-circle" size={16} className="text-brand-red" /> 新增項目</>}
        </h3>
        {isSuperAdmin && (
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
            <input type="checkbox" checked={syncToAll} onChange={e=>setSyncToAll(e.target.checked)} className="accent-brand-red w-3.5 h-3.5 rounded" />
            套用至全部分店
          </label>
        )}
      </div>
      {categories && (
        <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none appearance-none">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
      <input placeholder={titleLabel} value={newT} onChange={e=>setNewT(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none" />
      <textarea placeholder="詳細描述..." rows="3" value={newC} onChange={e=>setNewC(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm outline-none" />
      
      <label className="block w-full bg-slate-50 border border-slate-200 py-3 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-slate-100 transition-colors">
        {newI ? "✅ 已選擇圖片 (點擊更換)" : "+ 上傳附圖"}
        <input type="file" className="hidden" accept="image/*" onChange={e=>{const file = e.target.files[0]; if (file) { const r=new FileReader(); r.onloadend=()=>setNewI(r.result); r.readAsDataURL(file); }}}/>
      </label>
      {newI && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border">
          <img src={newI} className="w-full h-full object-cover" />
          <button onClick={(e)=>{e.preventDefault(); setNewI(null);}} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"><Icon name="x" size={14}/></button>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        {editingId && <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm">取消編輯</button>}
        <button onClick={handleSave} className={`flex-[2] text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm ${editingId ? 'bg-blue-600 shadow-blue-500/20' : 'bg-brand-red shadow-brand-red/20'}`}>
          {editingId ? "儲存修改" : "確認發佈"}
        </button>
      </div>
    </div>
    <div className="space-y-3">
      {items.length > 1 && <p className="text-center text-[10px] text-slate-400 mb-2 mt-4 font-bold flex items-center justify-center gap-1"><Icon name="arrow-up-down" size={12}/> 按住左側圖示可拖曳排序</p>}
      {items.map((r) => (
        <div 
          key={r.id} 
          draggable
          onDragStart={() => handleDragStart(r.id)}
          onDragOver={(e) => handleDragOver(e, r.id)}
          onDragEnd={handleDragEnd}
          className={`bg-white p-4 rounded-[1.5rem] border flex gap-3 items-center shadow-sm transition-all duration-200 ${draggedId === r.id ? 'opacity-40 scale-95 border-brand-red/50' : 'border-slate-100'} ${overId === r.id ? 'border-brand-red shadow-md -translate-y-1' : ''}`}
        >
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-brand-red shrink-0 p-1 flex items-center justify-center">
            <Icon name="grip-vertical" size={18} />
          </div>
          {r.img && <img src={r.img} className="w-12 h-12 rounded-xl object-cover border shrink-0" alt="圖" />}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-slate-800 text-sm truncate">{r.title || "(無標題)"}</p>
              {r.category && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-md font-bold whitespace-nowrap">{r.category}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{r.content || ""}</p>
          </div>
          <div className="flex gap-1.5 shrink-0 border-l pl-2 border-slate-100">
            <button onClick={() => startEdit(r)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors bg-slate-50 hover:bg-blue-50 rounded-xl"><Icon name="edit-3" size={16} /></button>
            <button onClick={() => deleteItem(r.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors bg-slate-50 hover:bg-red-50 rounded-xl"><Icon name="trash-2" size={16} /></button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-center text-slate-400 text-xs py-10 glass-panel rounded-3xl">尚未發佈任何項目</p>}
    </div>
  </div>
);
};

// --- 專屬食譜管理器 (支援食材、做法、備註與全域同步、拖曳排序，以及從資料庫匯入) ---

const RecipeAdminManager = ({ categoryPath, currentBranch, globalBranches, isSuperAdmin, items = [], triggerNotify, getPublicPath, categories, globalRecipes = [] }) => {
const [newT, setNewT] = useState(''); 
const [newCat, setNewCat] = useState(categories ? categories[0] : '');
const [newIngList, setNewIngList] = useState([{ name: '', qty: '' }]);
const [newInst, setNewInst] = useState('');
const [newNote, setNewNote] = useState('');
const [newI, setNewI] = useState(null);
const [editingId, setEditingId] = useState(null);
const [syncToAll, setSyncToAll] = useState(false);
const [showLibrary, setShowLibrary] = useState(false);

// 拖曳狀態
const [draggedId, setDraggedId] = useState(null);
const [overId, setOverId] = useState(null);

const startEdit = (item) => {
  setEditingId(item.id);
  setNewT(item.title || '');
  
  if (item.ingredientsList && item.ingredientsList.length > 0) {
    setNewIngList(item.ingredientsList);
  } else if (item.ingredients) {
    setNewIngList([{ name: item.ingredients, qty: '' }]);
  } else {
    setNewIngList([{ name: '', qty: '' }]);
  }

  setNewInst(item.instructions || item.content || ''); 
  setNewNote(item.notes || '');
  setNewI(item.img || null);
  if (categories) setNewCat(item.category || categories[0]);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const cancelEdit = () => {
  setEditingId(null); setNewT(''); setNewIngList([{ name: '', qty: '' }]); setNewInst(''); setNewNote(''); setNewI(null);
  if (categories) setNewCat(categories[0]);
};

const handleSave = async () => {
  if (!newT.trim()) return triggerNotify("菜單名稱不能為空", "error");
  let imgToSave = newI; 
  if (newI && newI.startsWith('data:')) imgToSave = await compressImage(newI);
  
  const targetBranches = (isSuperAdmin && syncToAll) ? globalBranches : [currentBranch];
  const sharedId = editingId ? String(editingId) : crypto.randomUUID();
  const now = Date.now();
  
  const validIngList = newIngList.filter(i => i.name.trim() !== '');

  const itemData = { 
    id: sharedId, 
    title: newT.trim(), 
    ingredientsList: validIngList, 
    instructions: newInst.trim(),
    notes: newNote.trim(),
    content: newInst.trim(), 
    img: imgToSave, 
    updateTime: now 
  };

  try {
    // 1. 儲存到所選的分店菜單中
    await Promise.all(targetBranches.map(async (branch) => {
      const branchItemData = { ...itemData };
      if (!editingId) {
        branchItemData.timestamp = now;
        branchItemData.sortOrder = items.length;
      }
      if (categories) branchItemData.category = newCat;

      const colPath = getPublicPath(`${categoryPath}_${branch}/items`);
      return db.collection(colPath).doc(sharedId).set(branchItemData, { merge: true });
    }));

    // 2. 同步備份到全域的「菜色資料庫」(以菜色名稱為 ID 防止重複)
    const globalRecipeData = { ...itemData, timestamp: now };
    if (categories) globalRecipeData.category = newCat;
    await db.collection(getPublicPath('global_recipes')).doc(newT.trim()).set(globalRecipeData, { merge: true });

    triggerNotify(editingId ? "更新成功" : "發佈成功，已同步至資料庫", "success");
    cancelEdit();
  } catch (e) { 
    console.error(e);
    triggerNotify("存檔失敗 (檔案太大或網路異常)", "error"); 
  }
};

const deleteItem = async (id) => {
  const isConfirmed = window.confirm(syncToAll && isSuperAdmin ? "確定要刪除嗎？這會同時刪除所有分店的該食譜。" : "確定要刪除嗎？");
  if(!isConfirmed) return;

  const targetBranches = (isSuperAdmin && syncToAll) ? globalBranches : [currentBranch];
  try {
    await Promise.all(targetBranches.map(async (branch) => {
      const idStr = String(id);
      await db.collection(getPublicPath(`${categoryPath}_${branch}/items`)).doc(idStr).delete();
      
      const oldDocRef = db.doc(getPublicPath(`${categoryPath}_${branch}`));
      const oldSnap = await oldDocRef.get();
      if(oldSnap.exists && oldSnap.data().items) {
        const newItems = oldSnap.data().items.filter(i => String(i.id) !== idStr);
        await oldDocRef.set({ items: newItems });
      }
    }));
    triggerNotify("食譜已刪除", "info");
  } catch(e) { triggerNotify("刪除失敗", "error"); console.error(e); }
};

const handleDragStart = (id) => setDraggedId(id);
const handleDragOver = (e, id) => { e.preventDefault(); if (id !== draggedId) setOverId(id); };
const handleDragEnd = async () => {
  if (draggedId !== null && overId !== null && draggedId !== overId) {
    const newItems = [...items];
    const fromIndex = newItems.findIndex(i => String(i.id) === String(draggedId));
    const toIndex = newItems.findIndex(i => String(i.id) === String(overId));
    
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      try {
        const batch = db.batch();
        newItems.forEach((item, index) => {
          const docRef = db.collection(getPublicPath(`${categoryPath}_${currentBranch}/items`)).doc(String(item.id));
          batch.set(docRef, { ...item, sortOrder: index }, { merge: true });
        });
        await batch.commit();
      } catch(e) {
        triggerNotify("排序儲存失敗", "error");
      }
    }
  }
  setDraggedId(null);
  setOverId(null);
};

return (
  <div className="space-y-4">
    <div className={`glass-panel p-6 rounded-[2.5rem] space-y-4 bg-white shadow-sm border transition-all ${editingId ? 'border-blue-500/30 shadow-blue-500/10' : 'border-slate-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-slate-800 text-xs flex items-center gap-2 uppercase tracking-widest">
          {editingId ? <><Icon name="edit" size={16} className="text-blue-500" /> 編輯食譜</> : <><Icon name="plus-circle" size={16} className="text-brand-red" /> 新增食譜</>}
        </h3>
        <div className="flex items-center gap-3">
          {!editingId && (
            <button onClick={() => setShowLibrary(true)} className="px-3 py-1.5 bg-rose-50 text-brand-red rounded-lg text-[10px] font-black flex items-center gap-1 hover:bg-brand-red hover:text-white transition-colors">
              <Icon name="database" size={14} /> 從資料庫導入
            </button>
          )}
          {isSuperAdmin && (
            <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
              <input type="checkbox" checked={syncToAll} onChange={e=>setSyncToAll(e.target.checked)} className="accent-brand-red w-3.5 h-3.5 rounded" />
              套用至全部分店
            </label>
          )}
        </div>
      </div>
      {categories && (
        <select value={newCat} onChange={e=>setNewCat(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none appearance-none">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
      <input placeholder="輸入菜單名稱..." value={newT} onChange={e=>setNewT(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none border-brand-red/30 focus:border-brand-red" />
      
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 shadow-inner space-y-3">
        <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Icon name="shopping-bag" size={14}/> 食材清單配置</h4>
        {newIngList.map((ing, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input placeholder="食材 (例: 牛油)" value={ing.name} onChange={e => { const l = [...newIngList]; l[idx].name = e.target.value; setNewIngList(l); }} className="flex-1 input-light p-3 rounded-lg text-sm font-bold outline-none" />
            <input placeholder="數量單位 (例: 4 kg)" value={ing.qty} onChange={e => { const l = [...newIngList]; l[idx].qty = e.target.value; setNewIngList(l); }} className="w-2/5 input-light p-3 rounded-lg text-sm font-bold outline-none" />
            <button onClick={() => { if(newIngList.length > 1) setNewIngList(newIngList.filter((_, i) => i !== idx)) }} className={`p-2 rounded-lg transition-colors ${newIngList.length > 1 ? 'text-slate-400 hover:bg-red-50 hover:text-red-500' : 'text-slate-200 cursor-not-allowed'}`} disabled={newIngList.length === 1}><Icon name="x" size={18}/></button>
          </div>
        ))}
        <button onClick={() => setNewIngList([...newIngList, {name: '', qty: ''}])} className="w-full py-3 rounded-lg border-2 border-dashed border-slate-200 text-slate-500 font-bold text-xs hover:border-brand-red/50 hover:text-brand-red transition-colors flex items-center justify-center gap-2">
          <Icon name="plus" size={14} /> 新增一列食材
        </button>
      </div>
      
      <textarea placeholder="填寫詳細做法步驟..." rows="4" value={newInst} onChange={e=>setNewInst(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm outline-none" />
      <textarea placeholder="填寫備註 (選填)..." rows="2" value={newNote} onChange={e=>setNewNote(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm outline-none" />
      
      <label className="block w-full bg-slate-50 border border-slate-200 py-3 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-slate-100 transition-colors">
        {newI ? "✅ 已選擇圖片 (點擊更換)" : "+ 上傳菜色照片"}
        <input type="file" className="hidden" accept="image/*" onChange={e=>{const file = e.target.files[0]; if (file) { const r=new FileReader(); r.onloadend=()=>setNewI(r.result); r.readAsDataURL(file); }}}/>
      </label>
      {newI && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border">
          <img src={newI} className="w-full h-full object-cover" />
          <button onClick={(e)=>{e.preventDefault(); setNewI(null);}} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"><Icon name="x" size={14}/></button>
        </div>
      )}
      
      <div className="flex gap-3 pt-2">
        {editingId && <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm">取消</button>}
        <button onClick={handleSave} className={`flex-[2] text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm ${editingId ? 'bg-blue-600 shadow-blue-500/20' : 'bg-brand-red shadow-brand-red/20'}`}>
          {editingId ? "儲存修改" : "確認發佈"}
        </button>
      </div>
    </div>
    
    {/* 食譜資料庫彈窗 */}
    {showLibrary && (
      <div className="fixed inset-0 z-[10000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 page-enter">
        <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 max-h-[85vh] overflow-y-auto relative shadow-2xl">
          <h3 className="font-black text-xl mb-6 text-slate-800 flex items-center gap-2 border-b pb-4"><Icon name="database" className="text-brand-red" /> 全域菜色資料庫</h3>
          <button onClick={()=>setShowLibrary(false)} className="absolute top-6 right-6 text-slate-400 hover:bg-slate-100 p-2 rounded-full transition-colors"><Icon name="x" size={20}/></button>
          
          {globalRecipes.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-bold">目前資料庫中尚未建立任何食譜</div>
          ) : (
            <div className="space-y-6">
              {categories && categories.map(cat => {
                const catRecipes = globalRecipes.filter(r => r.category === cat);
                if (catRecipes.length === 0) return null;
                return (
                  <div key={cat} className="space-y-3">
                    <h4 className="font-black text-sm text-slate-700 border-l-4 border-brand-red pl-2">{cat}</h4>
                    <div className="flex flex-wrap gap-2">
                      {catRecipes.map(r => (
                        <button 
                          key={r.id} 
                          onClick={() => {
                            setNewT(r.title); 
                            setNewCat(r.category); 
                            setNewIngList(r.ingredientsList || [{name: r.ingredients || '', qty: ''}]); 
                            setNewInst(r.instructions || r.content || ''); 
                            setNewNote(r.notes || ''); 
                            setNewI(r.img || null); 
                            setShowLibrary(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }} 
                          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-brand-red hover:text-white hover:border-brand-red active:scale-95 transition-all shadow-sm"
                        >
                          {r.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )}

    <div className="space-y-3">
      {items.length > 1 && <p className="text-center text-[10px] text-slate-400 mb-2 mt-4 font-bold flex items-center justify-center gap-1"><Icon name="arrow-up-down" size={12}/> 按住左側圖示可拖曳排序</p>}
      {items.map((r) => (
        <div 
          key={r.id} 
          draggable
          onDragStart={() => handleDragStart(r.id)}
          onDragOver={(e) => handleDragOver(e, r.id)}
          onDragEnd={handleDragEnd}
          className={`bg-white p-4 rounded-[1.5rem] border flex gap-3 items-center shadow-sm transition-all duration-200 ${draggedId === r.id ? 'opacity-40 scale-95 border-brand-red/50' : 'border-slate-100'} ${overId === r.id ? 'border-brand-red shadow-md -translate-y-1' : ''}`}
        >
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-brand-red shrink-0 p-1 flex items-center justify-center">
            <Icon name="grip-vertical" size={18} />
          </div>
          {r.img && <img src={r.img} className="w-12 h-12 rounded-xl object-cover border shrink-0" alt="圖" />}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="font-bold text-slate-800 text-sm truncate">{r.title || "(無標題)"}</p>
              {r.category && <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] rounded-md font-bold whitespace-nowrap">{r.category}</span>}
            </div>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{r.instructions || r.content || '無描述'}</p>
          </div>
          <div className="flex gap-1.5 shrink-0 border-l pl-2 border-slate-100">
            <button onClick={() => startEdit(r)} className="text-slate-400 hover:text-blue-500 p-2 transition-colors bg-slate-50 hover:bg-blue-50 rounded-xl"><Icon name="edit-3" size={16} /></button>
            <button onClick={() => deleteItem(r.id)} className="text-slate-400 hover:text-red-500 p-2 transition-colors bg-slate-50 hover:bg-red-50 rounded-xl"><Icon name="trash-2" size={16} /></button>
          </div>
        </div>
      ))}
      {items.length === 0 && <p className="text-center text-slate-400 text-xs py-10 glass-panel rounded-3xl">尚未發佈任何食譜</p>}
    </div>
  </div>
);
};

// --- 分店專用公告管理器 (支援編輯、全域同步、拖曳排序、已讀名單) ---

const AnnouncementAdminManager = ({ currentBranch, globalBranches, isSuperAdmin, announcements, triggerNotify, getPublicPath }) => {
const [newT, setNewT] = useState('');
const [newC, setNewC] = useState('');
const [newI, setNewI] = useState(null);
const [editingId, setEditingId] = useState(null);
const [syncToAll, setSyncToAll] = useState(false);

const [draggedId, setDraggedId] = useState(null);
const [overId, setOverId] = useState(null);

const startEdit = (item) => {
  setEditingId(item.id); setNewT(item.title); setNewC(item.content || ''); setNewI(item.img || null);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
const cancelEdit = () => { setEditingId(null); setNewT(''); setNewC(''); setNewI(null); };

const handleSave = async () => {
  if (!newT.trim() || !newC.trim()) return triggerNotify("標題與內容不能為空", "error");
  let imgToSave = newI;
  if (newI && newI.startsWith('data:')) imgToSave = await compressImage(newI);
  
  const targetBranches = (isSuperAdmin && syncToAll) ? globalBranches : [currentBranch];
  const sharedId = editingId ? String(editingId) : crypto.randomUUID();
  const now = Date.now();

  try {
    await Promise.all(targetBranches.map(async (branch) => {
      const itemData = { id: sharedId, title: newT.trim(), content: newC.trim(), img: imgToSave, updateTime: now };
      if (!editingId) {
        itemData.timestamp = now;
        itemData.readBy = [];
        itemData.sortOrder = announcements.length;
      }
      const colPath = getPublicPath(`announcements/branch_${branch}/items`);
      return db.collection(colPath).doc(sharedId).set(itemData, { merge: true });
    }));

    if (!editingId && syncToAll === false) {
      triggerLineAlert("ANNOUNCEMENT", { branch: currentBranch, title: newT.trim(), content: newC.trim() });
    } else if (!editingId && syncToAll) {
      targetBranches.forEach(b => triggerLineAlert("ANNOUNCEMENT", { branch: b, title: newT.trim(), content: newC.trim() }));
    }

    triggerNotify(editingId ? "公告已更新" : "公告已發佈", "success");
    cancelEdit();
  } catch (e) { triggerNotify("儲存失敗", "error"); }
};

const deleteItem = async (id) => {
  const isConfirmed = window.confirm(syncToAll && isSuperAdmin ? "確定要刪除嗎？這會同時刪除所有分店的該公告。" : "確定要刪除嗎？");
  if(!isConfirmed) return;
  
  const targetBranches = (isSuperAdmin && syncToAll) ? globalBranches : [currentBranch];
  try {
    await Promise.all(targetBranches.map(async (branch) => {
      const idStr = String(id);
      await db.collection(getPublicPath(`announcements/branch_${branch}/items`)).doc(idStr).delete();
      
      const oldDocRef = db.doc(getPublicPath(`announcements/branch_${branch}`));
      const oldSnap = await oldDocRef.get();
      if(oldSnap.exists && oldSnap.data().items) {
        await oldDocRef.set({ items: oldSnap.data().items.filter(i => String(i.id) !== idStr) });
      }
    }));
    triggerNotify("公告已刪除", "info");
  } catch(e) { console.error(e); triggerNotify("刪除失敗", "error"); }
};

const handleDragStart = (id) => setDraggedId(id);
const handleDragOver = (e, id) => { e.preventDefault(); if (id !== draggedId) setOverId(id); };
const handleDragEnd = async () => {
  if (draggedId !== null && overId !== null && draggedId !== overId) {
    const newItems = [...announcements];
    const fromIndex = newItems.findIndex(i => String(i.id) === String(draggedId));
    const toIndex = newItems.findIndex(i => String(i.id) === String(overId));
    
    if (fromIndex !== -1 && toIndex !== -1) {
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);

      try {
        const batch = db.batch();
        newItems.forEach((item, index) => {
          const docRef = db.collection(getPublicPath(`announcements/branch_${currentBranch}/items`)).doc(String(item.id));
          batch.set(docRef, { ...item, sortOrder: index }, { merge: true });
        });
        await batch.commit();
      } catch(e) {
        triggerNotify("排序儲存失敗", "error");
      }
    }
  }
  setDraggedId(null);
  setOverId(null);
};

return (
  <div className="space-y-4">
    <div className={`glass-panel p-6 rounded-[2.5rem] space-y-4 bg-white shadow-sm border transition-all ${editingId ? 'border-blue-500/30 shadow-blue-500/10' : 'border-slate-100'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-black text-slate-800 text-xs flex items-center gap-2 uppercase tracking-widest">
          {editingId ? <><Icon name="edit" size={16} className="text-blue-500" /> 編輯分店公告</> : <><Icon name="edit" size={16} className="text-brand-red" /> 發佈分店公告 ({currentBranch})</>}
        </h3>
        {isSuperAdmin && (
          <label className="flex items-center gap-2 text-[10px] font-bold text-slate-600 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
            <input type="checkbox" checked={syncToAll} onChange={e=>setSyncToAll(e.target.checked)} className="accent-brand-red w-3.5 h-3.5 rounded" />
            套用至全部分店
          </label>
        )}
      </div>
      <input placeholder="公告標題" value={newT} onChange={e=>setNewT(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm font-bold outline-none" />
      <textarea placeholder="詳細描述..." rows="3" value={newC} onChange={e=>setNewC(e.target.value)} className="w-full input-light p-4 rounded-xl text-sm outline-none" />
      
      <label className="block w-full bg-slate-50 border border-slate-200 py-3 rounded-xl text-[10px] font-black text-center cursor-pointer hover:bg-slate-100 transition-colors">
        {newI ? "✅ 已選擇圖片 (點擊更換)" : "+ 上傳附圖"}
        <input type="file" className="hidden" accept="image/*" onChange={e=>{const file = e.target.files[0]; if (file) { const r=new FileReader(); r.onloadend=()=>setNewI(r.result); r.readAsDataURL(file); }}}/>
      </label>
      {newI && (
        <div className="relative w-full h-32 rounded-xl overflow-hidden border">
          <img src={newI} className="w-full h-full object-cover" />
          <button onClick={(e)=>{e.preventDefault(); setNewI(null);}} className="absolute top-2 right-2 bg-black/50 hover:bg-red-500 text-white p-1.5 rounded-full transition-colors"><Icon name="x" size={14}/></button>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {editingId && <button onClick={cancelEdit} className="flex-1 bg-slate-100 text-slate-600 font-black py-4 rounded-2xl active:scale-95 transition-all text-sm">取消編輯</button>}
        <button onClick={handleSave} className={`flex-[2] text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm ${editingId ? 'bg-blue-600 shadow-blue-500/20' : 'bg-brand-red shadow-brand-red/20'}`}>
          {editingId ? "儲存修改" : "發佈"}
        </button>
      </div>
    </div>
    <div className="space-y-3">
      {announcements.length > 1 && <p className="text-center text-[10px] text-slate-400 mb-2 mt-4 font-bold flex items-center justify-center gap-1"><Icon name="arrow-up-down" size={12}/> 按住左側圖示可拖曳排序</p>}
      {(announcements||[]).map((a) => (
        <div 
          key={a.id} 
          draggable
          onDragStart={() => handleDragStart(a.id)}
          onDragOver={(e) => handleDragOver(e, a.id)}
          onDragEnd={handleDragEnd}
          className={`bg-white p-4 rounded-[1.5rem] border flex gap-3 shadow-sm transition-all duration-200 text-left ${draggedId === a.id ? 'opacity-40 scale-95 border-brand-red/50' : 'border-slate-100'} ${overId === a.id ? 'border-brand-red shadow-md -translate-y-1' : ''}`}
        >
          <div className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-brand-red shrink-0 p-1 flex items-start justify-center pt-2">
            <Icon name="grip-vertical" size={18} />
          </div>
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-800">{a.title || "(無標題)"}</h4>
                <p className="text-[10px] text-slate-400 mt-1">{new Date(a.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex gap-1.5 border-l pl-2 border-slate-100 shrink-0">
                <button onClick={() => startEdit(a)} className="text-slate-400 hover:text-blue-500 p-1.5 transition-colors bg-slate-50 hover:bg-blue-50 rounded-xl"><Icon name="edit-3" size={16}/></button>
                <button onClick={() => deleteItem(a.id)} className="text-slate-400 hover:text-red-500 p-1.5 transition-colors bg-slate-50 hover:bg-red-50 rounded-xl"><Icon name="trash-2" size={16}/></button>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border shadow-inner">
              <p className="text-[10px] font-black text-slate-500 mb-2 flex items-center gap-1"><Icon name="eye" size={12}/> 已讀取人員 ({a.readBy?.length || 0})</p>
              <div className="flex flex-wrap gap-1">
                {a.readBy && a.readBy.length > 0 ? a.readBy.map(name => (
                  <span key={name} className="text-[9px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md font-bold">{name}</span>
                )) : <span className="text-[10px] text-slate-400">尚未有人讀取</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
      {(announcements||[]).length === 0 && <p className="text-center text-slate-400 text-xs py-10 glass-panel rounded-3xl">目前尚無分店公告</p>}
    </div>
  </div>
);
};


export { UniversalListManager, RecipeAdminManager, AnnouncementAdminManager }

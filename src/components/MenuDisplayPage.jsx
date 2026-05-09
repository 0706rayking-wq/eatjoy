import React, { useState, useEffect, useMemo } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'

const MenuDisplayPage = ({ onBack, items = [] }) => {
const [selectedRecipe, setSelectedRecipe] = useState(null);

const groupedItems = useMemo(() => {
  const groups = { '未分類': [] };
  MENU_CATEGORIES.forEach(c => groups[c] = []);
  items.forEach(item => {
    const c = item.category && MENU_CATEGORIES.includes(item.category) ? item.category : '未分類';
    groups[c].push(item);
  });
  return groups;
}, [items]);

// 過濾出「有菜色」的分類，避免顯示空空如也的分類選項
const availableCats = useMemo(() => {
  return MENU_CATEGORIES.concat('未分類').filter(cat => groupedItems[cat] && groupedItems[cat].length > 0);
}, [groupedItems]);

const [activeCat, setActiveCat] = useState('');

// 預設選擇第一個有資料的分類
useEffect(() => {
  if (availableCats.length > 0 && (!activeCat || !availableCats.includes(activeCat))) {
    setActiveCat(availableCats[0]);
  }
}, [availableCats, activeCat]);

const handlePrint = (item) => {
  const printWindow = window.open('', '_blank');
  
  const ingredientsHtml = item.ingredientsList && item.ingredientsList.length > 0
    ? `<table style="width:100%; border-collapse: collapse; margin-top: 10px; table-layout: fixed;">
      ${item.ingredientsList.map(ing => `
        <tr>
          <td style="padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 15px; color: #334155; word-break: break-word;">${ing.name}</td>
          <td style="padding: 8px 0; border-bottom: 1px dashed #cbd5e1; font-size: 15px; font-weight: 900; color: #d97706; text-align: right; width: 35%; white-space: nowrap;">${ing.qty}</td>
        </tr>
      `).join('')}
     </table>`
    : `<pre>${item.ingredients || '無提供'}</pre>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${item.title} - 食譜列印</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap');
          body { font-family: 'Noto Sans TC', sans-serif; margin: 0; padding: 0; color: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; background-color: #fff; }
          .print-container { max-width: 1000px; margin: 0 auto; overflow-x: hidden; }
          .header { background-color: #3b4252; padding: 50px 20px; text-align: center; }
          .title-wrapper { display: inline-block; border-bottom: 6px solid #ef4444; padding-bottom: 12px; max-width: 100%; word-break: break-word; }
          .title { font-size: 42px; font-weight: 900; color: #ffffff; margin: 0; letter-spacing: 2px; }
          .content { padding: 40px; display: flex; gap: 40px; align-items: flex-start; max-width: 100%; }
          .image-col { flex: 0 0 35%; max-width: 35%; }
          .image-col img { width: 100%; border-radius: 8px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); object-fit: cover; }
          .text-col { flex: 1; display: flex; gap: 40px; min-width: 0; }
          .col-half { flex: 1; min-width: 0; }
          h3 { font-size: 18px; font-weight: 900; color: #1e293b; margin-top: 0; margin-bottom: 15px; }
          pre { font-family: 'Noto Sans TC', sans-serif; font-size: 15px; line-height: 1.8; margin: 0; white-space: pre-wrap; word-break: break-all; overflow-wrap: break-word; color: #475569; max-width: 100%; }
          .notes-section { padding: 0 40px 40px 40px; min-width: 0; }
          .footer-bar { border-bottom: 3px solid #ef4444; margin: 0 40px 20px 40px; }
          .print-footer { text-align: center; font-size: 12px; color: #94a3b8; padding-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="print-container">
          <div class="header">
            <div class="title-wrapper">
              <h1 class="title">${item.title}</h1>
            </div>
          </div>
          <div class="content">
            ${item.img ? `<div class="image-col"><img src="${item.img}" alt="Recipe Image"/></div>` : ''}
            <div class="text-col" style="${!item.img ? 'width: 100%;' : ''}">
              <div class="col-half">
                <h3>食材</h3>
                ${ingredientsHtml}
              </div>
              <div class="col-half">
                <h3>做法：</h3>
                <pre>${item.instructions || item.content || '無提供'}</pre>
              </div>
            </div>
          </div>
          ${item.notes ? `
          <div class="notes-section">
            <h3>備註：</h3>
            <pre>${item.notes}</pre>
          </div>` : ''}
          <div class="footer-bar"></div>
          <div class="print-footer">EATJOY 廚務管理系統 - 列印時間：${new Date().toLocaleString()}</div>
        </div>
      </body>
    </html>
  `;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  
  // 改用父視窗控制延遲列印，避免插入 <script> 被 Babel 解析時截斷
  setTimeout(() => { 
    printWindow.print(); 
    printWindow.close(); 
  }, 500);
};

return (
  <div className="p-4 space-y-4 page-enter pb-24 text-left font-bold relative">
    <BackButton onClick={onBack} title="本季菜單與食譜" />
    
    {availableCats.length > 0 ? (
      <>
        {/* 頂部滑動導覽列 */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 pt-1 sticky top-[60px] z-30 bg-[#f8fafc] -mx-4 px-4 shadow-sm mb-4">
          {availableCats.map(cat => (
            <button 
              key={cat} 
              onClick={() => setActiveCat(cat)}
              className={`shrink-0 px-5 py-2.5 rounded-xl text-xs font-black transition-all border ${activeCat === cat ? 'bg-brand-red text-white border-brand-red shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 下方菜色卡片網格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(groupedItems[activeCat] || []).map(item => (
            <div 
              key={item.id} 
              onClick={() => setSelectedRecipe(item)}
              className="bg-white rounded-[1.5rem] overflow-hidden shadow-sm border border-slate-100 flex flex-col active:scale-95 transition-all cursor-pointer group"
            >
              <div className="h-28 sm:h-36 bg-slate-100 relative overflow-hidden flex items-center justify-center">
                {item.img ? (
                  <img src={item.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={item.title} />
                ) : (
                  <Icon name="image" size={28} className="opacity-30 text-slate-400" />
                )}
              </div>
              <div className="p-3 text-center bg-white z-10 border-t border-slate-50">
                <h4 className="font-black text-slate-800 text-sm truncate">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      </>
    ) : (
      <div className="py-20 mt-6 text-center glass-panel rounded-[3rem] border border-slate-100 bg-white text-slate-300 font-bold uppercase text-[10px]">
        目前尚未發佈任何菜單
      </div>
    )}

    {/* 食譜彈跳視窗 */}
    {selectedRecipe && (
      <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 page-enter">
        <div className="bg-white rounded-[2rem] w-full max-w-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50 shrink-0">
            <h2 className="text-2xl font-black text-slate-800 truncate pr-4 flex items-center gap-2">
              <Icon name="utensils" className="text-brand-red" />
              {selectedRecipe.title}
            </h2>
            <button onClick={() => setSelectedRecipe(null)} className="text-slate-400 hover:text-brand-red transition-colors p-1 bg-white rounded-lg border shadow-sm active:scale-90"><Icon name="x" size={24} /></button>
          </div>
          <div className="p-6 overflow-y-auto no-scrollbar font-bold text-left space-y-6 flex-1">
            <div className="flex flex-col md:flex-row gap-6">
              {selectedRecipe.img && (
                <div className="md:w-1/3 shrink-0">
                  <img src={selectedRecipe.img} className="w-full rounded-2xl object-cover border shadow-sm max-h-64 md:max-h-full" alt="菜色圖片" />
                </div>
              )}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${selectedRecipe.img ? 'md:w-2/3' : 'w-full'}`}>
                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 shadow-inner min-w-0">
                  <h4 className="text-xs font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-orange-200 pb-2"><Icon name="shopping-bag" size={16} /> 食材清單</h4>
                  
                  {selectedRecipe.ingredientsList && selectedRecipe.ingredientsList.length > 0 ? (
                    <div className="space-y-1.5 mt-3">
                      {selectedRecipe.ingredientsList.map((ing, idx) => (
                        <div key={idx} className="flex justify-between items-end border-b border-orange-200/50 pb-1.5 gap-2">
                          <span className="text-sm font-bold text-slate-700 break-words flex-1 min-w-0">{ing.name}</span>
                          <span className="text-sm font-black text-orange-600 bg-orange-100/50 px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">{ing.qty}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap break-all leading-relaxed">{selectedRecipe.ingredients || '未提供'}</p>
                  )}
                </div>
                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 shadow-inner min-w-0">
                  <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-emerald-200 pb-2"><Icon name="chef-hat" size={16} /> 詳細作法</h4>
                  <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap break-all leading-relaxed w-full">{selectedRecipe.instructions || selectedRecipe.content || '未提供'}</p>
                </div>
              </div>
            </div>
            
            {(selectedRecipe.notes || (!selectedRecipe.ingredients && !selectedRecipe.instructions && !selectedRecipe.content)) && (
              <div className="bg-slate-50 p-5 rounded-2xl border shadow-inner min-w-0">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Icon name="info" size={14} /> 備註</h4>
                <p className="text-sm font-bold text-slate-700 whitespace-pre-wrap break-all leading-relaxed">{selectedRecipe.notes || selectedRecipe.content}</p>
              </div>
            )}
          </div>
          <div className="p-5 border-t border-slate-100 bg-white shrink-0 flex justify-end gap-3">
            <button onClick={() => setSelectedRecipe(null)} className="px-8 py-3.5 rounded-xl bg-slate-100 text-slate-600 font-black text-sm active:scale-95 transition-all">關閉</button>
            <button onClick={() => handlePrint(selectedRecipe)} className="px-8 py-3.5 rounded-xl bg-blue-600 text-white font-black text-sm shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
              <Icon name="printer" size={16} /> 列印食譜
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
};


export default MenuDisplayPage

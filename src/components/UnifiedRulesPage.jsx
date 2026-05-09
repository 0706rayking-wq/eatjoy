import React, { useState, useEffect } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'
import SignaturePad from './shared/SignaturePad.jsx'

const UnifiedRulesPage = ({ rulesData, onBack, user, currentBranch, triggerNotify, getPublicPath, signatures = [] }) => {
const [activeTab, setActiveTab] = useState('廚房規則');

const hasSignedCurrent = signatures.some(s => s.category === `守則簽署 - ${activeTab}` && s.phone === user?.phone);

const handleSign = async (img) => {
  if (!user) return;
  try {
    await db.collection(getPublicPath(`signatures_${currentBranch}`)).add({ userName: user.name, phone: user.phone, branch: currentBranch, category: `守則簽署 - ${activeTab}`, signature: img, timestamp: Date.now() });
    triggerNotify(`[${activeTab}] 簽名成功`, "success");
  } catch (e) { triggerNotify("簽署失敗", "error"); }
};

const handlePrint = () => {
  let htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${currentBranch} - 員工守則簽署紀錄</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap');
        @page { margin: 12mm; }
        body { font-family: 'Noto Sans TC', sans-serif; margin: 0; padding: 0; color: #1e293b; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .print-container { max-width: 800px; margin: 0 auto; }
        h1 { text-align: center; font-size: 22px; border-bottom: 2px solid #b9121b; padding-bottom: 8px; margin-bottom: 15px; color: #b9121b; letter-spacing: 2px;}
        .category-section { margin-bottom: 24px; } /* 移除 page-break-inside: avoid，避免大片留白 */
        h2 { font-size: 16px; color: #1e293b; margin-top: 0; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; background-color: #f8fafc; padding: 6px 10px; border-radius: 4px; page-break-after: avoid; }
        .rule-item { margin-bottom: 12px; padding-left: 10px; page-break-inside: avoid; } /* 確保單一守則不斷頁 */
        .rule-title { font-weight: 900; font-size: 13px; margin-bottom: 4px; color: #334155; }
        .rule-desc { font-size: 11px; color: #475569; white-space: pre-wrap; line-height: 1.5; margin: 0; }
        .rule-img { max-width: 100%; max-height: 160px; margin-top: 8px; border-radius: 6px; border: 1px solid #cbd5e1; }
        .signature-box { margin-top: 12px; padding: 12px; border: 2px dashed #cbd5e1; background-color: #f8fafc; text-align: center; border-radius: 8px; page-break-inside: avoid; } /* 確保簽名框不斷頁 */
        .signature-img { max-height: 60px; max-width: 100%; mix-blend-mode: multiply; }
        .no-sig { color: #ef4444; font-weight: bold; font-size: 11px; }
        .footer { text-align: center; font-size: 9px; color: #94a3b8; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="print-container">
        <h1>${currentBranch} - 員工守則與簽署紀錄</h1>
        <div style="text-align: center; font-weight: bold; margin-bottom: 24px; font-size: 13px; background: #f1f5f9; padding: 10px; border-radius: 8px;">
          員工姓名：<span style="color:#b9121b;">${user?.name || '未登入'}</span> &nbsp;&nbsp;|&nbsp;&nbsp; 
          聯絡電話：<span style="color:#b9121b;">${user?.phone || '無'}</span>
        </div>
  `;

  RULE_CATEGORIES.forEach(cat => {
    const catRules = rulesData[cat] || [];
    const catSig = signatures.find(s => s.category === `守則簽署 - ${cat}` && s.phone === user?.phone);

    htmlContent += `<div class="category-section">`;
    htmlContent += `<h2>${cat}</h2>`;

    if (catRules.length === 0) {
      htmlContent += `<p class="rule-desc" style="padding-left:10px;">目前尚無守則內容</p>`;
    } else {
      catRules.forEach((rule, idx) => {
        htmlContent += `
          <div class="rule-item">
            <div class="rule-title">${idx + 1}. ${rule.title}</div>
            <div class="rule-desc">${rule.content || ''}</div>
            ${rule.img ? `<img src="${rule.img}" class="rule-img" />` : ''}
          </div>
        `;
      });
    }

    htmlContent += `<div class="signature-box">`;
    htmlContent += `<strong style="color: #334155;">【${cat}】簽署確認</strong><br/>`;
    if (catSig) {
      htmlContent += `<img src="${catSig.signature}" class="signature-img" /><br/>`;
      htmlContent += `<span style="font-size:10px; color:#64748b;">簽署時間：${new Date(catSig.timestamp).toLocaleString()}</span>`;
    } else {
      htmlContent += `<br/><span class="no-sig">尚未簽署</span>`;
    }
    htmlContent += `</div></div>`;
  });

  htmlContent += `
        <div class="footer">EATJOY 廚務管理系統 - 列印時間：${new Date().toLocaleString()}</div>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { 
    printWindow.print(); 
    printWindow.close(); 
  }, 500);
};

return (
  <div className="page-enter pb-20 text-left">
    <div className="p-3 sm:p-4 border-b bg-white/80 backdrop-blur sticky top-[60px] z-40 shadow-sm space-y-3">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={onBack} className="p-2 sm:p-2.5 glass-panel rounded-xl sm:rounded-2xl border active:scale-90 transition-all bg-white shadow-sm shrink-0"><Icon name="arrow-left" size={20}/></button>
          <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter truncate">員工守則</h2>
        </div>
        <button onClick={handlePrint} className="w-full md:w-auto justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-xl active:scale-95 transition-all shadow-sm text-xs sm:text-sm font-bold whitespace-nowrap">
          <Icon name="printer" size={14} /> 列印守則與簽名紀錄
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {RULE_CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveTab(cat)} className={`shrink-0 px-5 py-2.5 rounded-2xl text-xs font-black border transition-all ${activeTab === cat ? 'bg-brand-red text-white border-brand-red shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}>{cat}</button>
        ))}
      </div>
    </div>
    <div className="p-4 space-y-4">
      <h3 className="text-[10px] font-black text-brand-red mb-4 pl-1 uppercase tracking-widest"><Icon name="bookmark" size={14} /> 當前分類：{activeTab}</h3>
      {rulesData[activeTab] && rulesData[activeTab].length > 0 ? rulesData[activeTab].map((item, idx) => (
        <RuleStandardBlock key={item.id || idx} id={idx + 1} title={item.title} desc={item.content} img={item.img} />
      )) : <div className="p-20 text-center text-slate-300 font-bold text-[10px] glass-panel rounded-3xl bg-white border shadow-inner">內容讀取中...</div>}
      {!hasSignedCurrent ? <SignaturePad onSave={handleSign} /> : (
        <div className="glass-panel p-10 rounded-[3rem] bg-emerald-50 border-emerald-100 text-emerald-600 text-center font-bold shadow-sm"><Icon name="check-circle" size={48} className="mx-auto mb-2" /> 您已完成 [{activeTab}] 的簽署</div>
      )}
    </div>
  </div>
);
};

// 1. 參數新增 currentUser

export default UnifiedRulesPage

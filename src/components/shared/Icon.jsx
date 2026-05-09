import React from 'react'
import * as LucideIcons from 'lucide-react'

const Icon = ({ name, size = 20, className = "" }) => {
const iconRef = useRef(null);
useEffect(() => {
  if (iconRef.current && window.lucide) {
    iconRef.current.innerHTML = '';
    const i = document.createElement('i');
    i.setAttribute('data-lucide', name);
    iconRef.current.appendChild(i);
    window.lucide.createIcons({ attrs: { width: size, height: size, class: className }, nameAttr: 'data-lucide' });
  }
}, [name, size, className]);
return <span ref={iconRef} className="inline-flex items-center justify-center"></span>;
};

const Icon = ({ name, className = "" }) => {
const symbols = {
  "ChevronLeft": "chevron-left", "ChevronRight": "chevron-right", "Plus": "plus", "Minus": "minus", "Settings": "settings",
  "Trash2": "trash-2", "X": "x", "Search": "search", "Share2": "share-2", "ClipboardCheck": "clipboard-check",
  "Package": "package", "ArrowRight": "arrow-right", "GripVertical": "grip-vertical", "CheckCircle2": "check-circle-2",
  "Layers": "layers", "Filter": "filter", "Building2": "building-2", "LayoutGrid": "layout-grid", "Edit": "edit-3",
  "Chart": "bar-chart-3", "History": "history", "Carrot": "carrot", "Fish": "fish", "Soup": "soup",
  "UtensilsCrossed": "utensils-crossed", "IceCream": "ice-cream", "Coffee": "coffee", "Timer": "timer",
  "Calendar": "calendar", "Image": "image", "Download": "download"
};
return <Icon name={symbols[name] || "help-circle"} className={className} />;
};

const Icon = ({ size = 24 }) => (
<svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/>
</svg>
);

const Ticker = ({ text }) => (
<div className="bg-slate-900 text-white py-2.5 px-4 ticker-wrap">
  <div className="ticker-move flex gap-8 font-bold text-[11px] uppercase tracking-wider items-center">
    <span className="flex items-center gap-2 whitespace-nowrap"><span className="text-brand-red">●</span> {text || "歡迎使用 EATJOY廚務 OS 系統 ... "}</span>
    <span className="flex items-center gap-2 whitespace-nowrap"><span className="text-brand-red">●</span> {text || "使用上有BUG或優化建議可以私訊小雷神"}</span>
  </div>
</div>
);

const BackButton = ({ onClick, title }) => (
<div className="flex items-center gap-4 mb-8 text-left border-b border-slate-200/50 pb-4">
  <button onClick={onClick} className="p-3 glass-panel rounded-2xl border active:scale-90 transition-all bg-white shadow-sm"><Icon name="arrow-left" size={20}/></button>
  <h2 className="text-2xl font-black text-slate-800 tracking-tighter leading-tight font-bold">{title}</h2>
</div>
);

const SectionItem = ({ title, iconName, onClick }) => (
<div onClick={onClick} className="glass-panel p-6 rounded-[2rem] flex items-center justify-between active:bg-slate-50 cursor-pointer group transition-all mb-3 text-left bg-white shadow-sm">
  <div className="flex items-center gap-4 text-slate-400 group-active:text-brand-red font-bold">
    {iconName && <Icon name={iconName} size={18} />}
    <span className="text-slate-800 text-sm font-bold leading-none">{title}</span>
  </div>
  <Icon name="chevron-right" size={18} className="text-slate-300" />
</div>
);

const NavCard = ({ title, onClick, colorClass, iconName }) => (
<button onClick={onClick} className={`${colorClass} py-10 flex flex-col items-center justify-center rounded-[2.5rem] border border-slate-100 shadow-sm active:scale-95 transition-all group`}>
  {/* 重點修改：將顏色改為 text-brand-red，並在 hover 時稍微改變亮度或不透明度 */}
  <div className="mb-3 text-brand-red/80 group-hover:text-brand-red transition-colors">
    <Icon name={iconName} size={28} />
  </div>
  <span className="font-black text-slate-800 text-sm tracking-widest uppercase font-bold">{title}</span>
</button>
);

const RuleStandardBlock = ({ id, title, desc, img }) => (
<div className="glass-panel rounded-3xl p-6 border border-slate-100 mb-4 bg-white shadow-sm flex flex-col gap-4 text-left">
  <div className="flex gap-4">
    <div className="w-9 h-9 bg-rose-50 text-brand-red border border-rose-100 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 font-bold">{id}</div>
    <div className="space-y-1">
      <h3 className="font-bold text-slate-800 text-sm leading-tight font-black">{title}</h3>
      <p className="text-[10px] text-slate-600 leading-relaxed font-bold whitespace-pre-wrap">{desc}</p>
    </div>
  </div>
  {img && <img src={img} className="w-full rounded-2xl border border-slate-100 shadow-inner object-cover max-h-64" alt="附圖" />}
</div>
);

// --- 進階共用模組管理 (支援編輯、全域同步、拖曳排序) ---
const UniversalListManager = ({ categoryPath, currentBranch, globalBranches, isSuperAdmin, items = [], titleLabel = "名稱", triggerNotify, getPublicPath, categories = null }) => {

export default Icon

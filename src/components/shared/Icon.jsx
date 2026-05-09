import React, { useRef, useEffect } from 'react'

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

const OrderSymbolIcon = ({ name, className = "" }) => {
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

const ChefHatIcon = ({ size = 24 }) => (
<svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
  <path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" y1="17" x2="18" y2="17"/>
</svg>
);


export default Icon

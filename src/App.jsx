import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { db, auth, getPublicPath } from './firebase.js'
import Icon from './components/shared/Icon.jsx'
import { NavCard, SectionItem, BackButton, RuleStandardBlock, OrderSymbolIcon, ChefHatIcon } from './components/shared/Icon.jsx'
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

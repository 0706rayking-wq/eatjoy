import React, { useState, useEffect } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'

const ListDetailPage = ({ onBack, title, list = [] }) => (
<div className="p-4 space-y-6 page-enter pb-20 text-left font-bold">
  <BackButton onClick={onBack} title={title} />
  <div className="space-y-4">
    {list && list.length > 0 ? list.map((item, idx) => (
      <RuleStandardBlock key={item.id || idx} id={idx + 1} title={item.title} desc={item.content} img={item.img} />
    )) : <div className="py-20 text-center glass-panel rounded-[3rem] border border-slate-100 bg-white text-slate-300 font-bold uppercase text-[10px]">目前尚未發佈內容</div>}
  </div>
</div>
);

// --- 優化輸入體驗 (解決注音輸入法中斷問題) ---
const SyncInput = ({ value, onChange, readOnly, className, maxLength, placeholder, autoFocus }) => {

export default ListDetailPage

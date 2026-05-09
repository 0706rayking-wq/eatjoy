import React from 'react'

const Ticker = ({ text }) => (
  <div className="bg-slate-900 text-white py-2.5 px-4 ticker-wrap">
    <div className="ticker-move flex gap-8 font-bold text-[11px] uppercase tracking-wider items-center">
      <span className="flex items-center gap-2 whitespace-nowrap"><span className="text-brand-red">●</span> {text || "歡迎使用 EATJOY廚務 OS 系統 ... "}</span>
      <span className="flex items-center gap-2 whitespace-nowrap"><span className="text-brand-red">●</span> {text || "使用上有BUG或優化建議可以私訊小雷神"}</span>
    </div>
  </div>
)

export default Ticker

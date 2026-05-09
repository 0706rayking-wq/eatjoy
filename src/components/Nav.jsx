import React from 'react'
import Icon from './shared/Icon.jsx'

const Nav = ({ title, onBackAction, rightAction }) => (
  <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex items-center justify-between shadow-sm">
    <div className="flex items-center gap-3">
      {onBackAction && (
        <button onClick={onBackAction} className="w-10 h-10 bg-slate-100 rounded-xl active-scale btn-touch flex items-center justify-center">
          <Icon name="ChevronLeft" className="text-slate-700" />
        </button>
      )}
      <h1 className="text-lg font-black text-slate-800 tracking-tight">{title}</h1>
    </div>
    {rightAction}
  </div>
);

export default Nav

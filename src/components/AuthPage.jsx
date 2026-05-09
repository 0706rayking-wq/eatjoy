import React, { useState, useEffect } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'

const AuthPage = ({ users, setCurrentUser, setCurrentPage, setIsManager, setIsSuperAdmin, setCurrentBranch, globalBranches, triggerNotify, getPublicPath }) => {
const [phone, setPhone] = useState(''); 
const [name, setName] = useState(''); 
const [role, setRole] = useState('正職人員'); 
const [mode, setMode] = useState('login'); 
const [adminPass, setAdminPass] = useState('');
const [branch, setBranch] = useState(globalBranches[0] || '南港Lalaport');

useEffect(() => {
  if(globalBranches.length > 0 && !globalBranches.includes(branch)) setBranch(globalBranches[0]);
}, [globalBranches, branch]);

const handleAuth = async () => {
  if (mode === 'admin') {
    if (adminPass.toLowerCase() === 'eatjoy07060112') { 
      setIsSuperAdmin(true);
      setIsManager(true); 
      localStorage.setItem('k_super_admin', 'true');
      setCurrentBranch(branch);
      setCurrentPage('home'); 
      triggerNotify("行政主廚權限", "success"); 
    }
    else {
      triggerNotify("驗證碼錯誤", "error"); 
    }
    return;
  }
  
  if (!phone) {
    triggerNotify("請輸入手機號碼", "error");
    return;
  }
  
  const existing = users.find(u => u.phone === phone);
  
  if (mode === 'register') {
    if (!name) {
      triggerNotify("請輸入真實姓名", "error");
      return;
    }
    if (existing) {
      triggerNotify("此手機號碼已註冊過", "error");
      return;
    }
    // 將新註冊的分店儲存為陣列格式
    await db.collection(getPublicPath('users')).doc(phone).set({ phone, name, status: 'pending', branch: [branch], role });
    triggerNotify(`申請已提交(${role})，請聯絡主管`, "info");
  } else {
    if (existing) { 
      // 向下相容：將字串轉回陣列進行判斷
      const allowedBranches = Array.isArray(existing.branch) ? existing.branch : [existing.branch];
      if (!allowedBranches.includes(branch)) {
        triggerNotify(`登入失敗：您的帳號隸屬於「${allowedBranches.join(', ')}」，請選擇正確的分店。`, "error");
        return;
      }
      setCurrentUser(existing); localStorage.setItem('k_active_user', JSON.stringify(existing));
      if (existing.status === 'approved') { 
        if(existing.role === '主管') setIsManager(true);
        setCurrentBranch(existing.branch);
        setCurrentPage('home'); 
        triggerNotify(`歡迎回來, ${existing.name} (${existing.role})`, "success"); 
      } else {
        triggerNotify('帳號審核中，請聯繫主管核准', 'info');
      }
    }
    else { 
      triggerNotify('帳號不存在，請先進行註冊', 'error'); 
      setMode('register'); 
    }
  }
};

return (
  <div className="p-6 pt-16 text-center page-enter min-h-screen flex flex-col items-center justify-center -mt-20">
    <div className="w-[84px] h-[84px] bg-brand-red rounded-[1.5rem] shadow-xl shadow-brand-red/20 flex items-center justify-center mx-auto mb-6 text-white text-[40px] font-black leading-none">
      饗
    </div>
    
    <h2 className="text-[28px] font-black text-[#1e293b] mb-10 tracking-tight uppercase">
      EATJOY廚務 <span className="text-brand-red">OS</span>
    </h2>
    
    <div className="glass-panel p-6 sm:p-8 rounded-[2rem] w-full max-w-[340px] border border-slate-100 bg-white">
      <div className="flex bg-[#f1f5f9] p-1.5 rounded-[1rem] mb-6 border border-slate-100">
        <button onClick={() => setMode('login')} className={`flex-1 py-2.5 rounded-[0.85rem] font-bold text-xs transition-all ${mode === 'login' ? 'bg-white shadow-sm text-brand-red' : 'text-slate-400'}`}>登入</button>
        <button onClick={() => setMode('register')} className={`flex-1 py-2.5 rounded-[0.85rem] font-bold text-xs transition-all ${mode === 'register' ? 'bg-white shadow-sm text-brand-red' : 'text-slate-400'}`}>註冊</button>
        <button onClick={() => setMode('admin')} className={`flex-1 py-2.5 rounded-[0.85rem] font-bold text-xs transition-all ${mode === 'admin' ? 'bg-white shadow-sm text-brand-red' : 'text-slate-400'}`}>管理員</button>
      </div>
      
      <div className="space-y-4">
        <div className="relative">
          <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full input-light p-4 rounded-xl outline-none font-bold text-sm appearance-none text-slate-700 px-5 text-left bg-white">
            {globalBranches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <Icon name="chevron-down" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" />
        </div>

        {mode === 'register' && (
          <>
            <input placeholder="真實姓名" className="w-full input-light p-4 rounded-xl outline-none font-bold text-sm px-5" value={name} onChange={e => setName(e.target.value)} />
            <div className="relative">
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full input-light p-4 rounded-xl outline-none font-bold text-sm appearance-none text-slate-700 px-5 text-left bg-white">
                <option value="正職人員">正職人員</option>
                <option value="計時人員">計時人員</option>
                <option value="主管">主管 (需行政主廚審核)</option>
              </select>
              <Icon name="chevron-down" size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 pointer-events-none" />
            </div>
          </>
        )}
        
        {mode === 'admin' ? (
          <input type="password" placeholder="最高權限驗證碼" className="w-full input-light p-4 rounded-xl outline-none font-bold text-sm px-5 tracking-[0.2em]" value={adminPass} onChange={e => setAdminPass(e.target.value)} />
        ) : (
          <input placeholder="手機號碼 (登入帳號)" className="w-full input-light p-4 rounded-xl outline-none font-bold text-sm px-5 placeholder:text-slate-400" value={phone} onChange={e => setPhone(e.target.value)} />
        )}
        
        <button onClick={handleAuth} className="w-full bg-brand-red text-white font-black py-4 rounded-xl shadow-lg shadow-brand-red/20 active:scale-95 transition-all text-sm mt-2 tracking-widest">
          進入系統
        </button>
      </div>
    </div>
    
    <div className="absolute bottom-8 w-full text-center left-0">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© EATJOY TECH MANAGEMENT</p>
    </div>
  </div>
);
};

const ListDetailPage = ({ onBack, title, list = [] }) => (

export default AuthPage

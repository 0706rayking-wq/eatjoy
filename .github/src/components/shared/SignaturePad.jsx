import React, { useRef, useState, useEffect } from 'react'

const SignaturePad = ({ onSave }) => {
const canvasRef = useRef(null);
const [isDrawing, setIsDrawing] = useState(false);
const getPos = (e) => {
  const rect = canvasRef.current.getBoundingClientRect();
  const clientX = (e.clientX || (e.touches && e.touches[0].clientX));
  const clientY = (e.clientY || (e.touches && e.touches[0].clientY));
  const x = (clientX - rect.left) * (canvasRef.current.width / rect.width);
  const y = (clientY - rect.top) * (canvasRef.current.height / rect.height);
  return { x, y };
};
const startDrawing = (e) => {
  if (e.type === 'touchstart') e.preventDefault();
  const pos = getPos(e);
  const ctx = canvasRef.current.getContext('2d');
  ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.strokeStyle = '#1e293b';
  ctx.beginPath(); ctx.moveTo(pos.x, pos.y);
  setIsDrawing(true);
};
const draw = (e) => {
  if (!isDrawing) return;
  const pos = getPos(e);
  const ctx = canvasRef.current.getContext('2d');
  ctx.lineTo(pos.x, pos.y); ctx.stroke();
};
return (
  <div className="glass-panel p-6 rounded-[2.5rem] mt-8 bg-white border border-slate-200 text-center shadow-lg">
    <h4 className="font-black text-slate-800 mb-4 flex items-center justify-center gap-2 font-bold"><Icon name="pen-tool" size={18} className="text-brand-red" />確認閱讀完畢並簽名</h4>
    <canvas ref={canvasRef} width={600} height={300} className="signature-canvas mb-4 mx-auto shadow-inner" onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={()=>setIsDrawing(false)} onMouseLeave={()=>setIsDrawing(false)} onTouchStart={startDrawing} onTouchEnd={()=>setIsDrawing(false)} onTouchMove={draw}></canvas>
    <div className="flex gap-3">
      <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,600,300)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs uppercase">重寫</button>
      <button onClick={() => onSave(canvasRef.current.toDataURL())} className="flex-[2] py-3 rounded-xl bg-brand-red text-white font-black text-xs uppercase active:scale-95 transition-all">提交簽署</button>
    </div>
  </div>
);
};

const AuthPage = ({ users, setCurrentUser, setCurrentPage, setIsManager, setIsSuperAdmin, setCurrentBranch, globalBranches, triggerNotify, getPublicPath }) => {

export default SignaturePad

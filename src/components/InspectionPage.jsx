import React, { useState, useEffect, useRef } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'

const InspectionPage = ({ onBack, standards, completedZones, triggerNotify, branchZones, currentBranch, getPublicPath, currentUser }) => {
  const [activeZone, setActiveZone] = useState(null);
  const [dailyPhotos, setDailyPhotos] = useState({});
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
const unsubscribe = db.collection(getPublicPath(`daily_photos_${currentBranch}`)).onSnapshot(snapshot => {
const allPhotos = {}; 
snapshot.forEach(doc => { 
  const data = doc.data(); 
  allPhotos[`${data.zoneId}_${data.itemIdx}`] = {
    photo: data.photo,
    uploaderName: data.uploaderName || '未知'
  }; 
});
setDailyPhotos(allPhotos);
});
return () => unsubscribe();
  }, [currentBranch, getPublicPath]);

  const handleFile = (e, idx) => {
const file = e.target.files[0]; if (!file) return;
const r = new FileReader(); r.onloadend = async () => {
const compressed = await compressImage(r.result, 800, 0.5);
db.collection(getPublicPath(`daily_photos_${currentBranch}`)).doc(`${activeZone.id}_${idx}`).set({ 
  photo: compressed, 
  zoneId: activeZone.id, 
  itemIdx: idx, 
  timestamp: Date.now(),
  uploaderName: currentUser?.name || '未知'
}).then(() => triggerNotify("實拍照已更新", "success"));
};
r.readAsDataURL(file);
  };

  const isAllUploaded = useMemo(() => {
if (!activeZone) return false;
const currentStandards = standards[activeZone.id] || [];
if (currentStandards.length === 0) return true;
return currentStandards.every((_, i) => !!dailyPhotos[`${activeZone.id}_${i}`]?.photo);
  }, [activeZone, standards, dailyPhotos]);

  const handleSubmit = () => {
setLoading(true);
setTimeout(() => {
if (!completedZones.includes(activeZone.id)) {
  const progressRef = db.doc(getPublicPath(`system/progress_${currentBranch}`));
  progressRef.set({ 
    completedZones: firebase.firestore.FieldValue.arrayUnion(activeZone.id) 
  }, { merge: true }).then(async () => { 
    const snap = await progressRef.get();
    const latestCompleted = snap.exists ? (snap.data().completedZones || []) : [];
    const currentHour = new Date().getHours();
    if (latestCompleted.length >= branchZones.length && branchZones.length > 0 && currentHour < 23) {
      triggerLineAlert("COMPLETION", { branch: currentBranch, time: new Date().toLocaleTimeString() });
    }
  }).catch(e => console.error("更新進度失敗", e));
}
setLoading(false); 
setIsSubmitted(true); 
triggerNotify("善後巡視已上傳", "success");
}, 800);
  };

  const handleResetAll = async () => {
if (!window.confirm("確定要手動重置今天的「所有巡視紀錄與照片」嗎？\n(此動作無法復原)")) return;
setIsResetting(true);
try {
const photosRef = await db.collection(getPublicPath(`daily_photos_${currentBranch}`)).get();
const batch = db.batch();
photosRef.forEach(d => batch.delete(d.ref));
await batch.commit();
await db.doc(getPublicPath(`system/progress_${currentBranch}`)).set({ completedZones: [] }, {merge: true});
triggerNotify("已清空所有巡視紀錄", "success");
} catch (e) {
console.error(e);
triggerNotify("重置失敗", "error");
}
setIsResetting(false);
  };

  if(activeZone) return (
<div className="p-4 space-y-6 page-enter pb-24 text-left font-bold">
<button onClick={()=>{setActiveZone(null);setIsSubmitted(false);}} className="p-3 bg-white rounded-2xl shadow-sm border active:scale-90 transition-all"><Icon name="arrow-left" size={20}/></button>
<div className="space-y-4">
  {(standards[activeZone.id] || []).map((item, i) => (
    <div key={i} className="glass-panel p-4 rounded-[2rem] border border-slate-100 bg-white">
      <p className="text-[11px] font-black text-slate-700 mb-3 bg-slate-50 p-3 rounded-xl flex items-center gap-2 border shadow-inner"><Icon name="info" size={14} className="text-brand-red" />要求：{item.note || "無說明"}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="text-center"><span className="text-[9px] font-black text-emerald-600">標準照</span><img src={item.url} className="w-full aspect-square object-cover rounded-2xl border mt-2 shadow-inner" /></div>
        
        <div className="text-center">
          <span className="text-[9px] font-black text-brand-red">實拍照</span>
          {dailyPhotos[`${activeZone.id}_${i}`]?.photo ? (
            <div className="relative mt-2">
              <img src={dailyPhotos[`${activeZone.id}_${i}`].photo} className="w-full aspect-square object-cover rounded-2xl border" />
              
              <div className="absolute top-1.5 left-1.5 bg-slate-900/70 backdrop-blur-sm text-white text-[9px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm font-bold z-10">
                <Icon name="user" size={10} />
                {dailyPhotos[`${activeZone.id}_${i}`].uploaderName}
              </div>

              <label className="absolute bottom-1 right-1 bg-white/90 p-1.5 rounded-lg cursor-pointer border shadow-sm text-slate-600 hover:text-brand-red transition-colors z-10">
                <Icon name="refresh-cw" size={14}/>
                <input type="file" className="hidden" onChange={(e)=>handleFile(e, i)} />
              </label>
            </div>
          ) : (
            <label className="w-full aspect-square bg-slate-50 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center mt-2 cursor-pointer active:bg-slate-100">
              <Icon name="plus" size={20} className="text-slate-300"/>
              <input type="file" className="hidden" onChange={(e)=>handleFile(e, i)} />
            </label>
          )}
        </div>
      </div>
    </div>
  ))}
</div>
{!isSubmitted ? (
  <div className="space-y-3">
    {!isAllUploaded && <p className="text-[10px] text-red-500 font-bold text-center animate-pulse"><Icon name="alert-circle" size={12} /> 請完成所有善後巡視照上傳</p>}
    <button onClick={handleSubmit} disabled={!isAllUploaded || loading} className={`w-full py-5 rounded-[2rem] font-black text-white shadow-xl flex items-center justify-center gap-2 ${isAllUploaded ? 'bg-brand-red active:scale-95' : 'bg-slate-300 cursor-not-allowed'}`}>{loading ? "提交中..." : "確認提交結果"}</button>
  </div>
) : <div className="p-8 rounded-[3rem] bg-emerald-50 text-emerald-700 text-center font-black">提交完成 ✅</div>}
</div>
  );

  return (
<div className="p-4 space-y-4 page-enter pb-20 text-left font-bold">
<BackButton onClick={onBack} title="巡視崗位清單" />
<div className="bg-brand-red p-7 rounded-[2.5rem] text-white shadow-lg flex justify-between items-center mb-2">
  <div><p className="text-[10px] font-black uppercase opacity-60 mb-1 leading-none tracking-widest">巡視進度 (18:00刷新)</p><p className="text-3xl font-black mt-2 font-bold">{completedZones.length} / {branchZones.length || 1}</p></div>
  <div className="w-14 h-14 rounded-full border-4 border-white/20 flex items-center justify-center font-bold text-xs">{branchZones.length > 0 ? Math.round((completedZones.length/branchZones.length)*100) : 0}%</div>
</div>

<div className="flex justify-end mb-4 px-1">
  <button onClick={handleResetAll} disabled={isResetting || (completedZones.length === 0 && Object.keys(dailyPhotos).length === 0)} className={`text-[10px] px-4 py-2.5 rounded-xl font-black flex items-center gap-1.5 transition-all shadow-sm ${isResetting || (completedZones.length === 0 && Object.keys(dailyPhotos).length === 0) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-rose-50 text-brand-red border border-rose-100 active:scale-95'}`}>
    <Icon name="refresh-cw" size={14} className={isResetting ? "animate-spin" : ""} />
    {isResetting ? "重置中..." : "重置所有巡視紀錄"}
  </button>
</div>

{branchZones.length === 0 && <p className="text-center text-slate-400 py-10 text-xs">此分店尚未設定任何區站，請至後台設定。</p>}
<div className="grid grid-cols-1 gap-3">
  {branchZones.map(z => {
    const isCompleted = completedZones.includes(z.id);
    return (
      <div 
        key={z.id} 
        onClick={() => setActiveZone(z)} 
        className={`p-6 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all shadow-sm border ${
          isCompleted 
          ? 'bg-emerald-50 border-emerald-200 active:bg-emerald-100' 
          : 'bg-white border-slate-100 active:bg-slate-50 glass-panel'
        }`}
      >
        <div className={`flex items-center gap-4 font-bold ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`}>
          <Icon name={isCompleted ? "check-circle" : "camera"} size={22} />
          <span className={`text-sm font-bold leading-none ${isCompleted ? 'text-emerald-700' : 'text-slate-800'}`}>{z.name}</span>
        </div>
        {isCompleted ? (
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm"><Icon name="check" size={12}/> 已完成</span>
        ) : (
          <Icon name="chevron-right" size={18} className="text-slate-300" />
        )}
      </div>
    );
  })}
</div>
</div>
  );
};


export default InspectionPage

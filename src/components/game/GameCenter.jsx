import React, { useState, useEffect, useCallback } from 'react'
import { db, getPublicPath } from '../../firebase.js'
import Icon from '../shared/Icon.jsx'

const GameCenter = ({ onBack, config, currentBranch, currentUser, getPublicPath, allUsers = [], isSuperAdmin = false }) => {
const [selectedActivity, setSelectedActivity] = useState(null); // 新增：用來記錄使用者點選了哪個活動

const [leaderboard, setLeaderboard] = useState([]);
const [showLeaderboard, setShowLeaderboard] = useState(false);
const [leaderboardTab, setLeaderboardTab] = useState('scores');
// 食研所：夥伴選擇 state（必須在頂層 not inside if）
const [frPhase, setFrPhase] = useState('camp');
const [chosenPartners, setChosenPartners] = useState([]);
// 任務板 puzzle/image states（必須在頂層）
const [puzzleState, setPuzzleState] = useState({placed:{}, done:false});
const [imageAns, setImageAns] = useState(null);
const [imageCorrect, setImageCorrect] = useState(null);
const [activeAmuletTab, setActiveAmuletTab] = useState(0);

// --- 活動大廳預設資料與資料庫映射 ---
const defaultActivities = [
  { id: 'snake', title: '靈蛇識食', subtitle: '淨化小食怪', img: null, isOpen: config?.isOpen || false },
  { id: 'leftover', title: '廢材不廢', subtitle: '頂尖剩食廚藝賞', img: null, isOpen: false },
  { id: 'food_research', title: '食研所', subtitle: '爆食戰線', img: null, isOpen: false },
  { id: 'gathering', title: '饗聚一堂', subtitle: '員餐與茶點', img: null, isOpen: false }
];
const activities = config?.activities || defaultActivities;

useEffect(() => {
  if (!currentBranch) return;
  const unsub = db.collection(getPublicPath(`game_leaderboard_${currentBranch}`))
    .orderBy('score', 'desc')
    .onSnapshot(snap => {
      setLeaderboard(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  return () => unsub();
}, [currentBranch, getPublicPath]);

useEffect(() => {
  const handleMessage = (e) => {
    if (e.data && e.data.type === 'GAME_OVER') {
      const score = e.data.score;
      if (currentUser && score > 0) {
        db.collection(getPublicPath(`game_leaderboard_${currentBranch}`)).add({
          name: currentUser.name,
          score: score,
          timestamp: Date.now()
        });
      }
      setTimeout(() => setShowLeaderboard(true), 1500); 
    }
  };
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [currentUser, currentBranch, getPublicPath]);

const topScores = leaderboard.slice(0, 20);
const topEmployees = Object.values(leaderboard.reduce((acc, curr) => {
  if (!acc[curr.name] || acc[curr.name].score < curr.score) {
    acc[curr.name] = curr;
  }
  return acc;
}, {})).sort((a, b) => b.score - a.score).slice(0, 20);
const currentDisplayList = leaderboardTab === 'scores' ? topScores : topEmployees;
// 視圖一：限時活動大廳 (卡片選單)
if (!selectedActivity) {
  return (
    <div className="fixed inset-0 z-[10000] bg-slate-50 flex flex-col page-enter overflow-hidden">
      <div className="p-4 border-b bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="p-2 sm:p-2.5 glass-panel rounded-xl sm:rounded-2xl border active:scale-90 transition-all bg-white shadow-sm shrink-0"><Icon name="arrow-left" size={20}/></button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter flex items-center gap-2"><Icon name="layout-template" className="text-brand-red"/> 限時活動大廳</h2>
        <div className="w-10"></div>
      </div>
      
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 overflow-y-auto custom-scrollbar pb-24">
        {activities.map(act => (
          <div 
            key={act.id} 
            onClick={() => { if(act.isOpen) { if(act.id==='food_research'){setFrPhase('camp');setChosenPartners([]);} setSelectedActivity(act.id); } }} 
            className={`relative w-full aspect-[21/9] sm:aspect-[16/7] rounded-[2rem] overflow-hidden border-2 transition-all duration-300 shadow-sm ${act.isOpen ? 'border-brand-red/40 cursor-pointer active:scale-[0.98] hover:shadow-xl hover:-translate-y-1' : 'border-slate-200 grayscale-[80%] cursor-not-allowed opacity-90'}`}
          >
            {/* 第一層：背景圖片 */}
            {act.img ? (
              <img src={act.img} className="absolute inset-0 w-full h-full object-cover" alt={act.title} />
            ) : (
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-400 bg-slate-200">
                <Icon name="image" size={32}/>
              </div>
            )}

            {/* 第二層：黑色漸層遮罩 (由下往上，確保白色文字清晰可見) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent z-0"></div>

            {/* 未開放時的中央鎖定標籤與額外模糊遮罩 */}
            {!act.isOpen && (
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="bg-slate-900/90 text-white px-5 py-2.5 rounded-full font-black flex items-center gap-2 text-sm shadow-xl border border-slate-700">
                  <Icon name="lock" size={16}/> 即將開放
                </div>
              </div>
            )}

            {/* 第三層：純文字區 (移除播放按鈕) */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 z-20">
              <div className="text-left">
                <h3 className="font-black text-white text-xl sm:text-2xl leading-tight mb-1 drop-shadow-md">{act.title}</h3>
                <p className="text-[11px] sm:text-xs font-bold text-slate-300 drop-shadow-md">{act.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// 視圖二：建置中的通用畫面 (攔截尚未完成的活動)
if (selectedActivity !== 'snake' && selectedActivity !== 'food_research') {
  return (
    <div className="fixed inset-0 z-[10000] bg-slate-50 flex flex-col page-enter items-center justify-center p-6 text-center">
       <div className="w-24 h-24 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-xl"><Icon name="hammer" size={48} className="text-slate-300" /></div>
       <h3 className="text-2xl font-black text-slate-800 mb-2">活動建置中</h3>
       <p className="text-slate-500 text-sm mb-8 font-bold leading-relaxed">此活動的專屬企劃與程式正在趕工中<br/>敬請期待小雷神的最新消息！</p>
       <button onClick={() => setSelectedActivity(null)} className="w-full max-w-xs bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm">返回活動大廳</button>
    </div>
  );
}
// 視圖二‑B：食研所「爆食戰線」— 垂直飛行射擊遊戲 v2
if (selectedActivity === 'food_research') {
  // 所有 state 都在 GameCenter 頂層（frPhase, chosenPartners）
  // frPhase 值：'camp' | 'training' | 'treasury' | 'shop' |
  //             'quests' | 'gacha' | 'shrine' | 'equip' |
  //             'partner_select' | 'game'

  const branchmates = allUsers.filter(u =>
    u.status === 'approved' &&
    u.phone !== currentUser?.phone &&
    (Array.isArray(u.branch) ? u.branch.includes(currentBranch) : u.branch === currentBranch)
  );

  // ── 讀取/儲存玩家資料（localStorage per user）──
  const saveKey = 'fr_save_' + (currentUser?.phone || 'guest');
  const loadSave = () => {
    try { return JSON.parse(localStorage.getItem(saveKey)) || {}; } catch { return {}; }
  };
  const writeSave = (data) => {
    try { localStorage.setItem(saveKey, JSON.stringify({...loadSave(), ...data})); } catch {}
  };

  const save = loadSave();
  const playerGold   = save.gold   || 0;
  const training     = save.training || { atk:0, def:0, hp:0, stam:0, stamRegen:0, crit:0 };
  const ownedForms   = save.ownedForms  || [];   // bought food form IDs
  const equippedForm = save.equippedForm || 'normal';
  const equip        = save.equip  || { ranged:'初始食材砲', melee:'初始鍋鏟', amulets:['','',''] };
  const treasury     = save.treasury || [];
  const quests       = save.quests  || null;     // {date, tasks:[{type,desc,target,progress,reward,done}]}
  const weapons      = save.weapons  || { ranged:['初始食材砲'], melee:['初始鍋鏟'] };
  const amulets      = save.amulets  || [];

  // Shop refreshes every time you return to camp
  const shopKey = 'fr_shop_' + (currentUser?.phone || 'guest');
  const getShop = () => {
    try {
      const s = JSON.parse(localStorage.getItem(shopKey));
      if (s && s.refreshDate === new Date().toDateString()) return s.items;
    } catch {}
    const allFoods = [
      {id:'burger', name:'漢堡肉排', emoji:'🍔', desc:'受傷-15%', price:80},
      {id:'chili',  name:'辣椒粉',   emoji:'🌶️', desc:'燃燒+速度', price:75},
      {id:'tofu',   name:'板豆腐',   emoji:'🧆', desc:'回血+護盾', price:90},
      {id:'noodle', name:'拉麵叉燒', emoji:'🍜', desc:'速度+30%', price:70},
      {id:'rice',   name:'蛋炒飯',   emoji:'🍚', desc:'金幣+50%', price:65},
      {id:'ramen',  name:'豚骨濃湯', emoji:'🍲', desc:'爆擊+回血', price:100},
      {id:'sushi',  name:'鮭魚握壽司', emoji:'🍣', desc:'速度+爆擊', price:95},
      {id:'steak',  name:'和牛牛排', emoji:'🥩', desc:'攻擊+爆擊', price:120},
    ];
    const shuffled = [...allFoods].sort(() => Math.random()-.5).slice(0,6);
    try { localStorage.setItem(shopKey, JSON.stringify({refreshDate: new Date().toDateString(), items: shuffled})); } catch {}
    return shuffled;
  };
  const shopItems = getShop();

  // Training costs & max levels
  const TRAIN_STATS = [
    {key:'atk',   label:'⚔️ 攻擊力', costBase:15, max:10, effect:'+10% / Lv'},
    {key:'def',   label:'🛡️ 防禦力', costBase:15, max:10, effect:'-8%傷 / Lv'},
    {key:'hp',    label:'❤️ 最大血量', costBase:20, max:10, effect:'+20HP / Lv'},
    {key:'stam',  label:'💨 氣力量',  costBase:12, max:10, effect:'+10 / Lv'},
    {key:'stamRegen', label:'⚡ 氣力回復', costBase:12, max:10, effect:'+10% / Lv'},
    {key:'crit',  label:'🎯 爆擊率',  costBase:25, max:8,  effect:'+5% / Lv'},
  ];

  // Gacha pools
  const RANGED_POOL = [
    {id:'r1',name:'食材砲', emoji:'🏹', desc:'基本遠程'},
    {id:'r2',name:'調味料噴射器', emoji:'🧂', desc:'廣域彈幕'},
    {id:'r3',name:'冷凍光線', emoji:'❄️', desc:'冰結效果'},
    {id:'r4',name:'辣油火焰炮', emoji:'🔥', desc:'燃燒傷害'},
    {id:'r5',name:'醬汁雷射', emoji:'🍶', desc:'穿透彈'},
  ];
  const MELEE_POOL = [
    {id:'m1',name:'鍋鏟劍', emoji:'🗡️', desc:'基本近戰'},
    {id:'m2',name:'擀麵棍', emoji:'🥖', desc:'高傷近戰'},
    {id:'m3',name:'菜刀', emoji:'🔪', desc:'連斬型'},
    {id:'m4',name:'炒菜鍋', emoji:'🍳', desc:'範圍攻擊'},
    {id:'m5',name:'砧板護盾', emoji:'🪵', desc:'格擋型'},
  ];
  const AMULET_POOL = [
    {id:'a1',name:'廚神護符', emoji:'📿', desc:'攻擊+15%'},
    {id:'a2',name:'食安符', emoji:'🧿', desc:'HP+30'},
    {id:'a3',name:'鮮度符', emoji:'🌿', desc:'回血增加'},
    {id:'a4',name:'辛香符', emoji:'🌶️', desc:'爆擊+8%'},
    {id:'a5',name:'溫度符', emoji:'🌡️', desc:'受傷-10%'},
    {id:'a6',name:'時令符', emoji:'🍂', desc:'金幣+20%'},
  ];

  // ── 日常任務產生 ──
  const getTodayQuests = () => {
    const today = new Date().toDateString();
    if (quests && quests.date === today) return quests;
    const newQ = {
      date: today,
      tasks: [
        { type:'battle', desc:'擊倒 10 隻小怪', target:10, progress:0, reward:30, done:false },
        { type:'puzzle', desc:'完成食材部位拼圖', target:1, progress:0, reward:25, done:false },
        { type:'image',  desc:'辨識食材剪影', target:3, progress:0, reward:20, done:false },
      ]
    };
    writeSave({quests: newQ});
    return newQ;
  };
  const todayQuests = getTodayQuests();

  // Common styles
  const campBg  = {background:'#0d1117'};
  const cardStyle = {background:'#161b22', border:'1px solid #30363d', borderRadius:'16px', padding:'16px'};
  const btnPrimary = {background:'linear-gradient(135deg,#1f6feb,#388bfd)', color:'#fff', border:'none', borderRadius:'12px', padding:'10px 0', width:'100%', fontWeight:900, fontSize:'13px', cursor:'pointer'};
  const btnGold = {background:'linear-gradient(135deg,#b08800,#fbbf24)', color:'#000', border:'none', borderRadius:'12px', padding:'10px 0', width:'100%', fontWeight:900, fontSize:'13px', cursor:'pointer'};
  const sectionTitle = {fontSize:'11px', fontWeight:900, color:'#8b949e', letterSpacing:'1px', textTransform:'uppercase', marginBottom:'12px'};

  const NavBar = ({title, onBack}) => (
    <div style={{padding:'10px 14px', borderBottom:'1px solid #21262d', background:'#161b22', display:'flex', alignItems:'center', gap:'10px', flexShrink:0}}>
      <button onClick={onBack} style={{background:'rgba(255,255,255,.06)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'#8b949e', cursor:'pointer', fontWeight:900, fontSize:'14px'}}>‹</button>
      <span style={{fontWeight:900, fontSize:'14px', color:'#e6edf3'}}>{title}</span>
    </div>
  );
  // SUB-SCREENS

  // ── 訓練所 ──
  if (frPhase === 'training') {
    const cur = loadSave();
    const tr = cur.training || { atk:0, def:0, hp:0, stam:0, stamRegen:0, crit:0 };
    const g = cur.gold || 0;
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="⚔️ 訓練所" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div style={{...cardStyle, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{color:'#fbbf24', fontWeight:900, fontSize:'13px'}}>💰 現有金幣</span>
            <span style={{color:'#fde047', fontWeight:900, fontSize:'18px'}}>{g}</span>
          </div>
          {TRAIN_STATS.map(stat => {
            const lv = tr[stat.key] || 0;
            const cost = stat.costBase + lv * 10;
            const maxed = lv >= stat.max;
            return (
              <div key={stat.key} style={cardStyle}>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:'8px'}}>
                  <span style={{color:'#e6edf3', fontWeight:900, fontSize:'13px'}}>{stat.label}</span>
                  <span style={{color:'#8b949e', fontSize:'11px', fontWeight:700}}>Lv {lv}/{stat.max}</span>
                </div>
                <div style={{display:'flex', gap:'4px', marginBottom:'8px'}}>
                  {Array.from({length:stat.max},(_,i)=>(
                    <div key={i} style={{flex:1, height:'5px', borderRadius:'3px', background: i<lv ? '#1f6feb' : '#21262d'}} />
                  ))}
                </div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span style={{fontSize:'10px', color:'#58a6ff'}}>{stat.effect}</span>
                  {maxed ? (
                    <span style={{fontSize:'10px', color:'#3fb950', fontWeight:900}}>MAX ✓</span>
                  ) : (
                    <button onClick={()=>{
                      const s2 = loadSave();
                      const g2 = s2.gold||0;
                      if(g2 < cost) { alert('金幣不足！'); return; }
                      const tr2 = s2.training||{atk:0,def:0,hp:0,stam:0,stamRegen:0,crit:0};
                      tr2[stat.key] = (tr2[stat.key]||0)+1;
                      writeSave({gold: g2-cost, training: tr2});
                      setFrPhase('camp'); setTimeout(()=>setFrPhase('training'),10);
                    }} style={{...btnPrimary, width:'auto', padding:'6px 14px', fontSize:'11px', opacity: g<cost?'.4':'1'}}>
                      升級 💰{cost}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 寶庫 ──
  if (frPhase === 'treasury') {
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="🏺 寶庫" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4">
          {treasury.length === 0 ? (
            <div style={{textAlign:'center', padding:'40px 0', color:'#8b949e'}}>
              <div style={{fontSize:'48px', marginBottom:'12px'}}>📦</div>
              <div style={{fontWeight:900, fontSize:'13px'}}>尚無戰利品</div>
              <div style={{fontSize:'11px', marginTop:'6px'}}>出征擊敗魔王後會帶回寶箱！</div>
            </div>
          ) : (
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
              {treasury.map((item, i) => (
                <div key={i} style={{...cardStyle, textAlign:'center'}}>
                  <div style={{fontSize:'28px'}}>{item.emoji||'📦'}</div>
                  <div style={{fontSize:'11px', fontWeight:900, color:'#e6edf3', marginTop:'4px'}}>{item.name}</div>
                  <div style={{fontSize:'10px', color:'#8b949e'}}>{item.desc||''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── 商店 ──
  if (frPhase === 'shop') {
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="🛒 食物商店" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div style={{...cardStyle, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <span style={{color:'#8b949e', fontSize:'11px', fontWeight:700}}>每次回營地重新整備</span>
            <span style={{color:'#fde047', fontWeight:900, fontSize:'15px'}}>💰 {loadSave().gold||0}</span>
          </div>
          {shopItems.map(item => {
            const owned = (loadSave().ownedForms||[]).includes(item.id);
            const g = loadSave().gold||0;
            return (
              <div key={item.id} style={{...cardStyle, display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{fontSize:'32px', flexShrink:0}}>{item.emoji}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900, fontSize:'13px', color:'#e6edf3'}}>{item.name}</div>
                  <div style={{fontSize:'11px', color:'#8b949e', marginTop:'2px'}}>{item.desc}</div>
                </div>
                {owned ? (
                  <span style={{fontSize:'10px', color:'#3fb950', fontWeight:900, whiteSpace:'nowrap'}}>已持有 ✓</span>
                ) : (
                  <button onClick={()=>{
                    const s2=loadSave();
                    const g2=s2.gold||0;
                    if(g2<item.price){alert('金幣不足！');return;}
                    const of2=[...(s2.ownedForms||[])];
                    if(!of2.includes(item.id))of2.push(item.id);
                    writeSave({gold:g2-item.price, ownedForms:of2});
                    setFrPhase('camp'); setTimeout(()=>setFrPhase('shop'),10);
                  }} style={{...btnGold, width:'auto', padding:'7px 12px', fontSize:'11px', whiteSpace:'nowrap', opacity:g<item.price?'.4':'1'}}>
                    💰{item.price}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 任務板 ──
  if (frPhase === 'quests') {
    // puzzleState, imageAns, imageCorrect 在 GameCenter 頂層宣告

    // Puzzle data (cow body parts)
    const puzzleParts = [
      {id:'shoulder', label:'肩胛肉', emoji:'🥩', correct:'A'},
      {id:'rib',      label:'肋條肉', emoji:'🥩', correct:'B'},
      {id:'chest',    label:'胸腹肉', emoji:'🥩', correct:'C'},
      {id:'loin',     label:'腰脊肉', emoji:'🥩', correct:'D'},
    ];
    const puzzleSlots = ['A','B','C','D'];
    const puzzleCorrect = puzzleParts.every(p => puzzleState.placed[p.id] === p.correct);

    // Image quiz data
    const imageQuiz = {
      question: '這個食材剪影是？',
      silhouette: '🥦',
      options: ['A. 高麗菜', 'B. 白花椰菜', 'C. 青花菜', 'D. 茼蒿'],
      ans: 2
    };

    const claimQuest = (i) => {
      const s2 = loadSave();
      const q2 = s2.quests || todayQuests;
      q2.tasks[i].done = true;
      const reward = q2.tasks[i].reward;
      writeSave({gold:(s2.gold||0)+reward, quests:q2});
      setFrPhase('camp'); setTimeout(()=>setFrPhase('quests'),10);
    };

    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="📋 任務板" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Task 1: Battle */}
          <div style={cardStyle}>
            <div style={sectionTitle}>⚔️ 戰鬥任務</div>
            <div style={{color:'#e6edf3', fontWeight:900, fontSize:'13px', marginBottom:'6px'}}>{todayQuests.tasks[0].desc}</div>
            <div style={{display:'flex', alignItems:'center', gap:'8px', marginBottom:'10px'}}>
              <div style={{flex:1, height:'6px', background:'#21262d', borderRadius:'3px', overflow:'hidden'}}>
                <div style={{height:'100%', background:'#1f6feb', borderRadius:'3px', width:Math.min(100,(todayQuests.tasks[0].progress/todayQuests.tasks[0].target)*100)+'%'}}/>
              </div>
              <span style={{fontSize:'11px', color:'#8b949e', fontWeight:700}}>{todayQuests.tasks[0].progress}/{todayQuests.tasks[0].target}</span>
            </div>
            {todayQuests.tasks[0].done ? (
              <div style={{color:'#3fb950', fontWeight:900, fontSize:'12px'}}>✅ 已完成 +{todayQuests.tasks[0].reward}💰</div>
            ) : todayQuests.tasks[0].progress >= todayQuests.tasks[0].target ? (
              <button onClick={()=>claimQuest(0)} style={btnGold}>領取獎勵 +{todayQuests.tasks[0].reward}💰</button>
            ) : (
              <div style={{fontSize:'11px', color:'#8b949e'}}>出征擊敗敵人後回來領獎勵</div>
            )}
          </div>

          {/* Task 2: Puzzle */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🧩 食材拼圖</div>
            <div style={{color:'#e6edf3', fontWeight:900, fontSize:'12px', marginBottom:'10px'}}>將牛肉部位名稱拖曳到正確位置</div>
            {/* Simplified drag-and-click puzzle */}
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'10px'}}>
              {puzzleSlots.map(slot => {
                const placed = Object.entries(puzzleState.placed).find(([,v])=>v===slot);
                const part = placed ? puzzleParts.find(p=>p.id===placed[0]) : null;
                return (
                  <div key={slot} onClick={()=>{
                    // Click slot to remove placed piece
                    if(placed) {
                      const np = {...puzzleState.placed};
                      delete np[placed[0]];
                      setPuzzleState(s=>({...s, placed:np}));
                    }
                  }} style={{border:'2px dashed '+(part?'#1f6feb':'#30363d'), borderRadius:'10px', padding:'10px', textAlign:'center', minHeight:'50px', display:'flex', alignItems:'center', justifyContent:'center', background:part?'rgba(31,111,235,.15)':'transparent', cursor:part?'pointer':'default'}}>
                    {part ? (
                      <span style={{fontWeight:900, fontSize:'11px', color:'#58a6ff'}}>{part.label}</span>
                    ) : (
                      <span style={{fontSize:'11px', color:'#30363d', fontWeight:700}}>{slot}</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'10px'}}>
              {puzzleParts.filter(p=>!puzzleState.placed[p.id]).map(p=>(
                <button key={p.id} onClick={()=>{
                  // Find first empty slot
                  const empty = puzzleSlots.find(s=>!Object.values(puzzleState.placed).includes(s));
                  if(empty) setPuzzleState(st=>({...st, placed:{...st.placed,[p.id]:empty}}));
                }} style={{padding:'6px 10px', borderRadius:'8px', border:'1px solid #388bfd', background:'rgba(56,139,253,.15)', color:'#58a6ff', fontSize:'11px', fontWeight:900, cursor:'pointer'}}>
                  {p.label}
                </button>
              ))}
            </div>
            {todayQuests.tasks[1].done ? (
              <div style={{color:'#3fb950', fontWeight:900, fontSize:'12px'}}>✅ 已完成 +{todayQuests.tasks[1].reward}💰</div>
            ) : puzzleCorrect ? (
              <button onClick={()=>claimQuest(1)} style={btnGold}>拼圖正確！領取 +{todayQuests.tasks[1].reward}💰</button>
            ) : (
              <div style={{fontSize:'11px', color:'#8b949e'}}>提示：A=肩胛、B=肋條、C=胸腹、D=腰脊</div>
            )}
          </div>

          {/* Task 3: Image quiz */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🖼️ 圖像辨識</div>
            <div style={{color:'#e6edf3', fontWeight:900, fontSize:'12px', marginBottom:'10px'}}>{imageQuiz.question}</div>
            <div style={{fontSize:'64px', textAlign:'center', margin:'8px 0', filter:'contrast(0) brightness(0.3)'}}>{imageQuiz.silhouette}</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'7px', marginBottom:'10px'}}>
              {imageQuiz.options.map((opt,i)=>(
                <button key={i} onClick={()=>{
                  if(imageAns!==null)return;
                  setImageAns(i);
                  setImageCorrect(i===imageQuiz.ans);
                }} style={{padding:'9px 7px', borderRadius:'9px', border:'2px solid '+(imageAns===null?'#30363d':i===imageQuiz.ans?'#3fb950':imageAns===i?'#f85149':'#30363d'), background:imageAns===null?'#0d1117':i===imageQuiz.ans?'rgba(63,185,80,.15)':imageAns===i?'rgba(248,81,73,.15)':'#0d1117', color:'#e6edf3', fontSize:'11px', fontWeight:900, cursor:'pointer', textAlign:'left'}}>
                  {opt}
                </button>
              ))}
            </div>
            {todayQuests.tasks[2].done ? (
              <div style={{color:'#3fb950', fontWeight:900, fontSize:'12px'}}>✅ 已完成 +{todayQuests.tasks[2].reward}💰</div>
            ) : imageCorrect ? (
              <button onClick={()=>claimQuest(2)} style={btnGold}>答對了！領取 +{todayQuests.tasks[2].reward}💰</button>
            ) : imageAns !== null && !imageCorrect ? (
              <div style={{color:'#f85149', fontWeight:900, fontSize:'12px'}}>❌ 答錯了，明天再來！</div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  // ── 時空轉蛋機 ──
  if (frPhase === 'gacha') {
    const GACHA_COST = 50;
    const doGacha = (type) => {
      const s2 = loadSave();
      const g2 = s2.gold||0;
      if(g2 < GACHA_COST){ alert('金幣不足 50！'); return; }
      const pool = type==='ranged' ? RANGED_POOL : MELEE_POOL;
      const got = pool[Math.floor(Math.random()*pool.length)];
      const ws = {...(s2.weapons||{ranged:['初始食材砲'],melee:['初始鍋鏟']})};
      const arr = ws[type]||[];
      if(!arr.includes(got.name)) arr.push(got.name);
      ws[type] = arr;
      writeSave({gold:g2-GACHA_COST, weapons:ws});
      alert('✨ 獲得：'+got.emoji+' '+got.name+'\n'+got.desc);
      setFrPhase('camp'); setTimeout(()=>setFrPhase('gacha'),10);
    };
    const g = loadSave().gold||0;
    const ws = loadSave().weapons||{ranged:[],melee:[]};
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="🎰 時空轉蛋機" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div style={{...cardStyle, textAlign:'center'}}>
            <div style={{fontSize:'11px', color:'#8b949e', fontWeight:700}}>每次抽取費用</div>
            <div style={{color:'#fde047', fontWeight:900, fontSize:'22px'}}>💰 {GACHA_COST}</div>
            <div style={{color:'#fbbf24', fontWeight:900, fontSize:'14px', marginTop:'4px'}}>現有 {g} 金幣</div>
          </div>
          <div style={cardStyle}>
            <div style={sectionTitle}>🏹 遠程武器池</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px'}}>
              {RANGED_POOL.map(w=>(
                <span key={w.id} style={{padding:'4px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:900, background:(ws.ranged||[]).includes(w.name)?'rgba(63,185,80,.2)':'rgba(255,255,255,.05)', color:(ws.ranged||[]).includes(w.name)?'#3fb950':'#8b949e', border:'1px solid '+(ws.ranged||[]).includes(w.name)?'#3fb950':'#21262d'}}>
                  {w.emoji} {w.name}
                </span>
              ))}
            </div>
            <button onClick={()=>doGacha('ranged')} style={{...btnPrimary, opacity:g<GACHA_COST?'.4':'1'}}>🎰 抽取遠程武器</button>
          </div>
          <div style={cardStyle}>
            <div style={sectionTitle}>🗡️ 近戰武器池</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px', marginBottom:'12px'}}>
              {MELEE_POOL.map(w=>(
                <span key={w.id} style={{padding:'4px 8px', borderRadius:'6px', fontSize:'10px', fontWeight:900, background:(ws.melee||[]).includes(w.name)?'rgba(63,185,80,.2)':'rgba(255,255,255,.05)', color:(ws.melee||[]).includes(w.name)?'#3fb950':'#8b949e', border:'1px solid '+(ws.melee||[]).includes(w.name)?'#3fb950':'#21262d'}}>
                  {w.emoji} {w.name}
                </span>
              ))}
            </div>
            <button onClick={()=>doGacha('melee')} style={{...btnPrimary, opacity:g<GACHA_COST?'.4':'1'}}>🎰 抽取近戰武器</button>
          </div>
        </div>
      </div>
    );
  }

  // ── 神社 ──
  if (frPhase === 'shrine') {
    const SHRINE_COST = 40;
    const doShrine = () => {
      const s2 = loadSave();
      const g2 = s2.gold||0;
      if(g2 < SHRINE_COST){ alert('金幣不足 40！'); return; }
      const got = AMULET_POOL[Math.floor(Math.random()*AMULET_POOL.length)];
      const am = [...(s2.amulets||[])];
      if(!am.includes(got.name)) am.push(got.name);
      writeSave({gold:g2-SHRINE_COST, amulets:am});
      alert('🙏 神明賜予：'+got.emoji+' '+got.name+'\n'+got.desc);
      setFrPhase('camp'); setTimeout(()=>setFrPhase('shrine'),10);
    };
    const g = loadSave().gold||0;
    const myAmulets = loadSave().amulets||[];
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="⛩️ 神社" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div style={{...cardStyle, textAlign:'center'}}>
            <div style={{fontSize:'48px'}}>⛩️</div>
            <div style={{color:'#e6edf3', fontWeight:900, fontSize:'14px', marginTop:'8px'}}>護身符抽取</div>
            <div style={{fontSize:'11px', color:'#8b949e', marginTop:'4px'}}>祈求神明賜予特殊被動護身符</div>
            <div style={{color:'#fde047', fontWeight:900, fontSize:'18px', marginTop:'8px'}}>💰 {SHRINE_COST} / 次</div>
            <div style={{color:'#8b949e', fontSize:'11px'}}>現有 {g} 金幣</div>
            <button onClick={doShrine} style={{...btnPrimary, marginTop:'12px', opacity:g<SHRINE_COST?'.4':'1'}}>🙏 祈求護符</button>
          </div>
          <div style={cardStyle}>
            <div style={sectionTitle}>📿 護符池</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px'}}>
              {AMULET_POOL.map(a=>(
                <div key={a.id} style={{padding:'8px', borderRadius:'10px', background:myAmulets.includes(a.name)?'rgba(63,185,80,.15)':'rgba(255,255,255,.03)', border:'1px solid '+( myAmulets.includes(a.name)?'#3fb950':'#21262d'), textAlign:'center'}}>
                  <div style={{fontSize:'22px'}}>{a.emoji}</div>
                  <div style={{fontSize:'10px', fontWeight:900, color:myAmulets.includes(a.name)?'#3fb950':'#8b949e', marginTop:'3px'}}>{a.name}</div>
                  <div style={{fontSize:'9px', color:'#6e7681'}}>{a.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 整備所 ──
  if (frPhase === 'equip') {
    const s2 = loadSave();
    const eq2 = s2.equip||{ranged:'初始食材砲',melee:'初始鍋鏟',amulets:['','','']};
    const ws2 = s2.weapons||{ranged:['初始食材砲'],melee:['初始鍋鏟']};
    const am2 = s2.amulets||[];
    const of2 = s2.ownedForms||[];
    const ef2 = s2.equippedForm||'normal';

    const setEq = (key, val) => {
      const s3=loadSave(); const e3={...(s3.equip||{ranged:'初始食材砲',melee:'初始鍋鏟',amulets:['','','']})};
      e3[key]=val; writeSave({equip:e3});
      setFrPhase('camp'); setTimeout(()=>setFrPhase('equip'),10);
    };
    const setAmuletSlot = (idx, val) => {
      const s3=loadSave(); const e3={...(s3.equip||{ranged:'初始食材砲',melee:'初始鍋鏟',amulets:['','','']})};
      const am3=[...(e3.amulets||['','',''])]; am3[idx]=val; e3.amulets=am3;
      writeSave({equip:e3}); setFrPhase('camp'); setTimeout(()=>setFrPhase('equip'),10);
    };

    const FOOD_FORMS_META = {
      normal:{name:'原味型',emoji:'🍙'}, burger:{name:'漢堡型',emoji:'🍔'}, chili:{name:'辣椒型',emoji:'🌶️'},
      tofu:{name:'豆腐型',emoji:'🧆'}, noodle:{name:'麵條型',emoji:'🍜'}, rice:{name:'炒飯型',emoji:'🍚'},
      ramen:{name:'豚骨型',emoji:'🍲'}, sushi:{name:'壽司型',emoji:'🍣'}, steak:{name:'牛排型',emoji:'🥩'},
    };

    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="🔧 整備所" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Ranged */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🏹 遠程武器</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              {(ws2.ranged||['初始食材砲']).map(w=>(
                <button key={w} onClick={()=>setEq('ranged',w)} style={{padding:'7px 12px', borderRadius:'9px', fontSize:'11px', fontWeight:900, border:'2px solid '+(eq2.ranged===w?'#1f6feb':'#30363d'), background:eq2.ranged===w?'rgba(31,111,235,.2)':'transparent', color:eq2.ranged===w?'#58a6ff':'#8b949e', cursor:'pointer'}}>{w}</button>
              ))}
            </div>
          </div>
          {/* Melee */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🗡️ 近戰武器</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              {(ws2.melee||['初始鍋鏟']).map(w=>(
                <button key={w} onClick={()=>setEq('melee',w)} style={{padding:'7px 12px', borderRadius:'9px', fontSize:'11px', fontWeight:900, border:'2px solid '+(eq2.melee===w?'#f0883e':'#30363d'), background:eq2.melee===w?'rgba(240,136,62,.2)':'transparent', color:eq2.melee===w?'#ffa657':'#8b949e', cursor:'pointer'}}>{w}</button>
              ))}
            </div>
          </div>
          {/* Amulets x3 */}
          {[0,1,2].map(idx=>(
            <div key={idx} style={cardStyle}>
              <div style={sectionTitle}>📿 護身符欄位 {idx+1}</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
                <button onClick={()=>setAmuletSlot(idx,'')} style={{padding:'7px 12px', borderRadius:'9px', fontSize:'11px', fontWeight:900, border:'2px solid '+(eq2.amulets[idx]===''?'#30363d':'#21262d'), background:eq2.amulets[idx]===''?'rgba(255,255,255,.06)':'transparent', color:'#6e7681', cursor:'pointer'}}>空</button>
                {am2.map(a=>(
                  <button key={a} onClick={()=>setAmuletSlot(idx,a)} style={{padding:'7px 12px', borderRadius:'9px', fontSize:'11px', fontWeight:900, border:'2px solid '+(eq2.amulets[idx]===a?'#bc8cff':'#30363d'), background:eq2.amulets[idx]===a?'rgba(188,140,255,.2)':'transparent', color:eq2.amulets[idx]===a?'#d2a8ff':'#8b949e', cursor:'pointer'}}>{a}</button>
                ))}
                {am2.length===0&&<span style={{fontSize:'11px',color:'#6e7681'}}>前往神社抽取護符</span>}
              </div>
            </div>
          ))}
          {/* Form slot */}
          <div style={cardStyle}>
            <div style={sectionTitle}>🍴 切換型態</div>
            <div style={{display:'flex', flexWrap:'wrap', gap:'6px'}}>
              {['normal', ...of2].map(fid=>{
                const fm = FOOD_FORMS_META[fid]||{name:fid,emoji:'🍽️'};
                return (
                  <button key={fid} onClick={()=>{writeSave({equippedForm:fid});setFrPhase('camp');setTimeout(()=>setFrPhase('equip'),10);}} style={{padding:'7px 12px', borderRadius:'9px', fontSize:'11px', fontWeight:900, border:'2px solid '+(ef2===fid?'#3fb950':'#30363d'), background:ef2===fid?'rgba(63,185,80,.2)':'transparent', color:ef2===fid?'#7ee787':'#8b949e', cursor:'pointer'}}>{fm.emoji} {fm.name}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 出口：夥伴選擇 ──
  if (frPhase === 'partner_select') {
    const togglePartner = (u) => {
      setChosenPartners(prev => {
        if (prev.some(p => p.phone === u.phone)) return prev.filter(p => p.phone !== u.phone);
        if (prev.length >= 2) return prev;
        return [...prev, u];
      });
    };
    const handleDeparture = async () => {
      for (const partner of chosenPartners) {
        try {
          const ref = db.collection(getPublicPath('users')).doc(partner.phone);
          const snap = await ref.get();
          const cur = (snap.exists && snap.data().gameGold) || 0;
          await ref.update({ gameGold: cur + 1 });
        } catch(e) { console.warn('gold update fail', e); }
      }
      setFrPhase('game');
    };
    return (
      <div className="fixed inset-0 z-[10000] flex flex-col" style={campBg}>
        <NavBar title="🚪 出發！選擇夥伴" onBack={()=>setFrPhase('camp')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <div style={{...cardStyle, textAlign:'center'}}>
            <div style={{fontSize:'11px', color:'#8b949e', fontWeight:700}}>最多選擇 2 位同事一起出征</div>
            <div style={{fontSize:'10px', color:'#3fb950', marginTop:'4px', fontWeight:700}}>被選到的夥伴獲得 +1 💰 獎勵</div>
          </div>
          <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
            {[0,1].map(i=>{
              const p=chosenPartners[i];
              return (
                <div key={i} style={{width:'100px', height:'80px', borderRadius:'14px', border:'2px solid '+(p?'#388bfd':'#30363d'), background:p?'rgba(31,111,235,.15)':'rgba(255,255,255,.03)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'4px'}}>
                  {p ? (<><div style={{fontSize:'24px'}}>🐾</div><div style={{fontSize:'10px', fontWeight:900, color:'#58a6ff', textAlign:'center'}}>{p.name}</div></>) : (<div style={{fontSize:'11px', color:'#30363d', fontWeight:700}}>空位</div>)}
                </div>
              );
            })}
          </div>
          {branchmates.length === 0 ? (
            <div style={{textAlign:'center', padding:'20px 0', color:'#8b949e', fontSize:'12px', fontWeight:700}}>無同事可選，單人出征！</div>
          ) : branchmates.map(u => {
            const selected = chosenPartners.some(p=>p.phone===u.phone);
            return (
              <div key={u.phone} onClick={()=>togglePartner(u)} style={{...cardStyle, display:'flex', alignItems:'center', gap:'12px', borderColor:selected?'#388bfd':'#30363d', background:selected?'rgba(31,111,235,.12)':'#161b22', cursor:'pointer'}}>
                <div style={{width:'38px', height:'38px', borderRadius:'50%', background:'rgba(31,111,235,.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0}}>🐾</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:900, fontSize:'13px', color:'#e6edf3'}}>{u.name}</div>
                  <div style={{fontSize:'10px', color:'#8b949e'}}>{u.role||'員工'}</div>
                </div>
                {selected && <div style={{width:'22px', height:'22px', borderRadius:'50%', background:'#1f6feb', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px'}}>✓</div>}
              </div>
            );
          })}
        </div>
        <div style={{padding:'14px', borderTop:'1px solid #21262d', background:'#161b22', flexShrink:0}}>
          <button onClick={handleDeparture} style={{...btnPrimary, padding:'14px 0', fontSize:'14px'}}>
            ⚔️ 帶著{chosenPartners.length>0?chosenPartners.map(p=>p.name).join('、'):'單人'}出征！
          </button>
        </div>
      </div>
    );
  }
  // 遊戲本體 iframe
        if (frPhase === 'game') {
  const frSS = "<scr" + "ipt>";
  const frSE = "</scr" + "ipt>";
  const s2 = loadSave();
  const partnerData = JSON.stringify(chosenPartners.map(p => ({ name: p.name, phone: p.phone })));
  const saveData = JSON.stringify({
    training: s2.training||{atk:0,def:0,hp:0,stam:0,stamRegen:0,crit:0},
    equip: s2.equip||{ranged:'初始食材砲',melee:'初始鍋鏟',amulets:['','','']},
    equippedForm: s2.equippedForm||'normal',
    gold: s2.gold||0,
    quests: s2.quests||null,
    playerName: currentUser?.name || (isSuperAdmin ? '主廚' : '玩家'),
  });

  const foodResearchHTML = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>食研所 爆食戰線</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
html,body{width:100%;height:100%;overflow:hidden;background:#f5f0e8;font-family:'Segoe UI',sans-serif;color:#3d2b1f;touch-action:none}
#gc{position:relative;width:100%;height:100%;background:#fdf8f0;overflow:hidden}
canvas{display:block;width:100%;height:100%}
/* ── HUD ── */
#hud{position:absolute;top:0;left:0;right:0;padding:10px 14px 8px;display:flex;align-items:flex-start;justify-content:space-between;z-index:20;background:linear-gradient(rgba(253,248,240,.96),transparent 90%)}
#charBars{display:flex;flex-direction:column;gap:5px;pointer-events:auto}
.charBar{display:flex;align-items:center;gap:7px;margin-bottom:1px}
.charBarEmoji{font-size:24px;flex-shrink:0}
.charBarInfo{display:flex;flex-direction:column;gap:1px}
.charBarName{font-size:13px;font-weight:900;color:#92400e;white-space:nowrap}
.charBarTrack{width:200px;height:17px;background:#fde8c8;border-radius:8px;border:2px solid #f59e0b;overflow:hidden}
.charBarFill{height:100%;border-radius:7px;transition:width .2s}
.charBarNum{font-size:13px;font-weight:900;color:#b45309}
#stamRow{display:flex;align-items:center;gap:6px;margin-top:5px}
#stamTrack{width:190px;height:13px;background:#e0e7ff;border-radius:7px;border:2px solid #818cf8;overflow:hidden}
#stamFill{height:100%;border-radius:6px;transition:width .15s;background:linear-gradient(90deg,#6366f1,#a5b4fc)}
#stamNum{font-size:14px;font-weight:900;color:#4338ca}
.hM{text-align:center;pointer-events:none;flex-shrink:0}
#formBadge{display:block;font-size:15px;font-weight:900;color:#92400e;background:rgba(251,191,36,.18);border-radius:10px;padding:3px 10px}
#formPassive{font-size:11px;color:#7c3aed;font-weight:700}
.hR{text-align:right;font-size:14px;font-weight:900;line-height:1.9;color:#78350f;flex-shrink:0}
/* Boss HUD */
#bossHud{position:absolute;top:88px;left:50%;transform:translateX(-50%);width:90%;max-width:460px;z-index:20;pointer-events:none;display:none}
#bossName{text-align:center;font-size:18px;font-weight:900;color:#b91c1c;margin-bottom:6px}
#bossTrack{height:18px;background:#fee2e2;border-radius:9px;border:2px solid #f87171;overflow:hidden}
#bossFill{height:100%;background:linear-gradient(90deg,#ef4444,#f97316);border-radius:8px;transition:width .25s}
/* Skill row */
#skillRow{position:absolute;top:72px;left:50%;transform:translateX(-50%);display:flex;gap:12px;z-index:20}
.skBadge{width:90px;height:90px;border-radius:26px;border:2px solid #d97706;background:rgba(253,248,240,.95);display:flex;align-items:center;justify-content:center;font-size:42px;position:relative;cursor:pointer;box-shadow:0 4px 16px rgba(180,83,9,.3)}
.skCd{position:absolute;inset:0;border-radius:25px;background:rgba(253,248,240,.88);display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:900;color:#92400e}
/* ── 搖桿（左下） ── */
#joystickWrap{position:absolute;left:14px;bottom:18px;width:140px;height:140px;z-index:20}
#joystickBase{position:absolute;inset:0;border-radius:50%;background:rgba(253,248,240,.78);border:3px solid rgba(217,119,6,.45);box-shadow:0 4px 18px rgba(0,0,0,.18)}
#joystickThumb{position:absolute;width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 38% 38%,rgba(253,248,240,.98),rgba(253,220,160,.92));border:2px solid #d97706;box-shadow:0 4px 14px rgba(0,0,0,.28);top:50%;left:50%;transform:translate(-50%,-50%);touch-action:none}
/* ── 角色切換欄（右側中間，直排） ── */
#charSwitchBar{position:absolute;right:14px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:12px;z-index:20}
.cSwBtn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:9px 7px;border-radius:18px;border:2px solid #e5e7eb;background:rgba(253,248,240,.95);cursor:pointer;width:84px;transition:all .15s;box-shadow:0 3px 12px rgba(0,0,0,.14)}
.cSwBtn.active-char{border-color:#f59e0b;background:rgba(251,191,36,.3);box-shadow:0 0 20px rgba(245,158,11,.55)}
.cSwBtn.dead-char{opacity:.32;filter:grayscale(1);cursor:not-allowed}
.cSwEmoji{font-size:30px;line-height:1}
.cSwName{font-size:12px;font-weight:900;color:#92400e;max-width:72px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;text-align:center}
.cSwHpTrack{width:68px;height:8px;background:#e5e7eb;border-radius:4px;overflow:hidden}
.cSwHpFill{height:100%;background:#22c55e;border-radius:4px;transition:width .2s}
.cSwDead{font-size:16px;color:#9ca3af;display:none}
/* ── 右側主控制（右下） ── */
#rightCtrl{position:absolute;right:14px;bottom:18px;display:flex;flex-direction:column;align-items:center;gap:14px;z-index:20}
.rBtn{width:96px;height:96px;border-radius:28px;border:2px solid;background:rgba(253,248,240,.95);display:flex;align-items:center;justify-content:center;font-size:44px;cursor:pointer;font-weight:900;position:relative;box-shadow:0 4px 18px rgba(0,0,0,.2)}
.rBtn:active{opacity:.65;transform:scale(.92)}
#dodgeBtnR{border-color:#dc2626;background:linear-gradient(145deg,#fee2e2,#fecaca);box-shadow:0 5px 22px rgba(220,38,38,.45);width:112px;height:112px;border-radius:34px;font-size:52px}
#dodgeBtnR.cooling{opacity:.35}
.skRow{display:flex;gap:12px}
#wpnToggle{border-color:#d97706;background:rgba(251,191,36,.2);width:88px;height:88px;border-radius:26px;font-size:42px}
/* Toast */
#toast{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(253,248,240,.97);border:2px solid #d97706;border-radius:20px;padding:18px 24px;text-align:center;font-size:16px;font-weight:900;color:#92400e;z-index:60;pointer-events:none;opacity:0;transition:opacity .3s;line-height:1.7;max-width:85%;box-shadow:0 5px 24px rgba(0,0,0,.18)}
/* Back btn */
#backBtn{position:absolute;top:10px;left:10px;z-index:25;background:rgba(253,248,240,.88);border:2px solid #d97706;border-radius:14px;padding:7px 13px;font-size:15px;font-weight:900;color:#92400e;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.15)}
/* QA Overlay */
#qaOverlay{position:absolute;inset:0;z-index:80;display:none;pointer-events:none}
#qaCard{position:absolute;top:10px;left:50%;transform:translateX(-50%);width:90%;max-width:360px;background:rgba(253,248,240,.97);border:2px solid #d97706;border-radius:14px;padding:12px 16px;z-index:82;pointer-events:none;box-shadow:0 4px 20px rgba(0,0,0,.18)}
#qaText{font-size:19px;font-weight:900;color:#78350f;text-align:center;line-height:1.5;margin-bottom:8px}
#timerBar{width:100%;height:7px;background:#fde8c8;border-radius:4px;overflow:hidden}
#timerFill{height:100%;background:linear-gradient(90deg,#22c55e,#eab308,#ef4444);border-radius:4px;transition:width .1s linear}
#timerLabel{text-align:center;font-size:12px;color:#92400e;margin-top:3px;font-weight:700}
#qaZones{position:absolute;inset:0;display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;z-index:81;pointer-events:none}
.qzone{display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;border:1px solid rgba(255,255,255,.1)}
.qzone .zLetter{font-size:80px;font-weight:900;opacity:.18;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}
.qzone .zLabel{position:absolute;bottom:8%;font-size:18px;font-weight:900;text-align:center;padding:0 8px;line-height:1.4;text-shadow:0 2px 4px rgba(0,0,0,.6);width:100%}
#zA{background:rgba(167,139,250,.2);color:#7c3aed}#zA .zLetter{color:#7c3aed}
#zB{background:rgba(34,197,94,.2);color:#15803d}#zB .zLetter{color:#15803d}
#zC{background:rgba(59,130,246,.2);color:#1d4ed8}#zC .zLetter{color:#1d4ed8}
#zD{background:rgba(249,115,22,.2);color:#c2410c}#zD .zLetter{color:#c2410c}
.qzone.cf{animation:cf .6s ease-out}@keyframes cf{0%{background:rgba(74,222,128,.5)}100%{}}
.qzone.wf{animation:wf .5s ease-out}@keyframes wf{0%{background:rgba(239,68,68,.5)}100%{}}
#pzr{position:absolute;width:56px;height:56px;border-radius:50%;border:4px solid #facc15;box-shadow:0 0 18px #facc15;pointer-events:none;z-index:83;display:none}
/* Modals */
.modal{position:absolute;inset:0;background:rgba(61,43,31,.6);display:flex;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(6px)}
.mbox{background:#fdf8f0;border:2px solid #d97706;border-radius:22px;padding:24px 20px;max-width:320px;width:92%;text-align:center;max-height:92vh;overflow-y:auto;box-shadow:0 8px 32px rgba(0,0,0,.2)}
.mbox h2{font-size:26px;font-weight:900;color:#92400e;margin-bottom:10px}
.mbox p{font-size:16px;color:#78350f;line-height:1.7;margin-bottom:18px}
.mbtn{width:100%;padding:14px;border-radius:14px;border:2px solid;font-size:16px;font-weight:900;cursor:pointer;margin-bottom:8px}
.mbtn.blue{background:linear-gradient(135deg,#fef3c7,#fde68a);border-color:#d97706;color:#92400e}
.mbtn.red{background:linear-gradient(135deg,#fee2e2,#fecaca);border-color:#dc2626;color:#991b1b}
.mbtn.grey{background:#f5f0e8;border-color:#a8a29e;color:#57534e}
#revProg{display:flex;gap:7px;justify-content:flex-start;margin-bottom:10px}
.quizOpts{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
.qopt{padding:13px 10px;border-radius:13px;border:2px solid #d6d3d1;background:#fdf8f0;color:#3d2b1f;font-size:16px;font-weight:900;cursor:pointer;text-align:left;line-height:1.5}
.qopt:active{background:#fef3c7}
.qopt.correct{border-color:#16a34a!important;background:#dcfce7!important;color:#14532d!important}
.qopt.wrong{border-color:#dc2626!important;background:#fee2e2!important;color:#991b1b!important}
/* Stage flash */
#stageFlash{position:absolute;inset:0;display:none;align-items:center;justify-content:center;z-index:70;pointer-events:none}
</style>
</head>
<body>
<div id="gc">
<canvas id="gameCanvas"></canvas>
<div id="backBtn" onclick="goBackToCamp()">🏕️</div>
<div id="hud">
 <div>
  <div id="charBars"></div>
  <div id="stamRow"><div style="font-size:13px">💨</div><div id="stamTrack"><div id="stamFill" style="width:100%"></div></div><div id="stamNum"></div></div>
 </div>
 <div class="hM"><span id="formBadge">🍙 原味</span><br><span id="formPassive">✨ 普通型</span></div>
 <div class="hR"><span style="color:#e96d2a">💰<span id="coinDisp">0</span></span><br><span style="color:#7c3aed">🏆<span id="scoreDisp">0</span></span><br><span style="color:#059669">LV<span id="lvlDisp">1</span></span></div>
</div>
<div id="skillRow">
 <div class="skBadge" id="skP"><span id="skPI">✨</span></div>
</div>
<!-- 搖桿（左下） -->
<div id="joystickWrap"><div id="joystickBase"></div><div id="joystickThumb"></div></div>
<!-- 角色切換欄（右側中間） -->
<div id="charSwitchBar">
 <div class="cSwBtn" id="csBtn0" onclick="switchToChar(0)"><div class="cSwEmoji" id="csEmoji0">🐾</div><div class="cSwName" id="csName0">—</div><div class="cSwHpTrack"><div class="cSwHpFill" id="csHpFill0" style="width:100%"></div></div><div class="cSwDead" id="csDead0">💀</div></div>
 <div class="cSwBtn" id="csBtn1" onclick="switchToChar(1)"><div class="cSwEmoji" id="csEmoji1">🐾</div><div class="cSwName" id="csName1">—</div><div class="cSwHpTrack"><div class="cSwHpFill" id="csHpFill1" style="width:100%"></div></div><div class="cSwDead" id="csDead1">💀</div></div>
 <div class="cSwBtn" id="csBtn2" onclick="switchToChar(2)"><div class="cSwEmoji" id="csEmoji2">🐾</div><div class="cSwName" id="csName2">—</div><div class="cSwHpTrack"><div class="cSwHpFill" id="csHpFill2" style="width:100%"></div></div><div class="cSwDead" id="csDead2">💀</div></div>
</div>
<div id="bossHud"><div id="bossName">👿 魔王</div><div id="bossTrack"><div id="bossFill" style="width:100%"></div></div></div>
<div id="toast"></div>
<div id="qaOverlay">
 <div id="qaZones">
  <div id="zA" class="qzone"><span class="zLetter">A</span><span class="zLabel" id="zAL"></span></div>
  <div id="zB" class="qzone"><span class="zLetter">B</span><span class="zLabel" id="zBL"></span></div>
  <div id="zC" class="qzone"><span class="zLetter">C</span><span class="zLabel" id="zCL"></span></div>
  <div id="zD" class="qzone"><span class="zLetter">D</span><span class="zLabel" id="zDL"></span></div>
 </div>
 <div id="pzr"></div>
 <div id="qaCard"><div id="qaText">問題</div><div id="timerBar"><div id="timerFill" style="width:100%"></div></div><div id="timerLabel">5.0s</div></div>
</div>
<!-- 右側控制（右下） -->
<div id="rightCtrl">
 <div id="dodgeBtnR" class="rBtn" onclick="dodge()">💨</div>
 <div id="wpnToggle" class="rBtn" onclick="toggleWeapon()">🏹</div>
 <div class="skRow">
  <div class="skBadge" id="sk1" onclick="useSkill1()"><span id="sk1I">⚡</span><div class="skCd" id="sk1Cd" style="display:none"></div></div>
  <div class="skBadge" id="sk2" onclick="useSkill2()"><span id="sk2I">🌟</span><div class="skCd" id="sk2Cd" style="display:none"></div></div>
 </div>
</div>
<!-- Modals -->
<div class="modal" id="startModal">
 <div class="mbox">
  <div style="font-size:52px;margin-bottom:8px" id="startEmoji">🍙</div>
  <h2>食研所 · 爆食戰線</h2>
  <p>🕹️搖桿移動　👿魔王掉100金幣<br>💨迴避　⚔️切換近戰/遠程<br><b style="color:#92400e">魔王大絕→移到正確答案區！</b><br>全員陣亡後答對5題才能帶戰利品回營地</p>
  <div id="partnerPreview" style="font-size:12px;color:#059669;font-weight:900;margin-bottom:10px"></div>
  <button class="mbtn blue" onclick="startGame()">⚔️ 出征！</button>
 </div>
</div>
<div class="modal" id="revModal" style="display:none">
 <div class="mbox">
  <div style="font-size:32px;margin-bottom:4px">💊</div>
  <h2>醫治復活</h2>
  <p style="font-size:14px;margin-bottom:8px;line-height:1.6">答對 5 題帶著戰利品<b style="color:#059669">回到營地</b><br>⚠️ 答錯 3 題 → 金幣與裝備全數遺失！</p>
  <div id="charStatusRow" style="display:flex;justify-content:center;gap:12px;margin-bottom:10px"></div>
  <div style="margin-bottom:6px">
   <div style="font-size:10px;color:#78350f;font-weight:700;margin-bottom:5px;text-align:left">答對進度</div>
   <div id="revProg"></div>
  </div>
  <div style="margin-bottom:10px">
   <div style="font-size:10px;color:#78350f;font-weight:700;margin-bottom:5px;text-align:left">答錯次數</div>
   <div id="revWrongDisp" style="display:flex;gap:7px;justify-content:flex-start"></div>
  </div>
  <div id="revQ" style="font-size:15px;font-weight:900;color:#92400e;margin:8px 0 5px;line-height:1.5"></div>
  <div id="revNum" style="font-size:11px;color:#78350f;margin-bottom:4px"></div>
  <div class="quizOpts" id="revOpts"></div>
 </div>
</div>
<div class="modal" id="gameOverModal" style="display:none">
 <div class="mbox"><div style="font-size:50px">💀</div><h2 style="color:#ef4444">挑戰失敗</h2><p>全員陣亡……</p>
  <button class="mbtn blue" onclick="restartGame()">🔄 再次挑戰</button>
  <button class="mbtn red" onclick="goBackToCamp()">🏕️ 返回營地</button>
 </div>
</div>
<div id="stageFlash"><div style="font-size:24px;font-weight:900;color:#4ade80;text-shadow:0 0 20px #4ade80;text-align:center;line-height:1.6" id="stageFlashMsg"></div></div>
</div>
` + frSS + `
const PARTNERS = ${partnerData};
const SAVE = ${saveData};
const FOOD_FORMS = {
 normal:{ name:'原味型', emoji:'🍙', passive:'普通型',pIcon:'✨',sk1Icon:'⚡',sk2Icon:'🌟',sk1Name:'雙彈衝刺',sk2Name:'能量爆發',sk1Cd:4000,sk2Cd:12000,bulletColor:'#fbbf24',bulletDmg:12,spreadCount:0,speedBonus:0,defBonus:0 },
 burger:{ name:'漢堡型', emoji:'🍔', passive:'受傷-15%',pIcon:'🛡️',sk1Icon:'💥',sk2Icon:'🌪️',sk1Name:'重擊彈',sk2Name:'旋轉彈幕',sk1Cd:5000,sk2Cd:14000,bulletColor:'#fb923c',bulletDmg:18,spreadCount:0,speedBonus:0,defBonus:.15 },
 chili: { name:'辣椒型', emoji:'🌶️', passive:'燃燒附加',pIcon:'🔥',sk1Icon:'🎯',sk2Icon:'☄️',sk1Name:'追蹤彈',sk2Name:'火焰衝刺',sk1Cd:4500,sk2Cd:11000,bulletColor:'#f97316',bulletDmg:14,spreadCount:0,speedBonus:.15,defBonus:0 },
 tofu:  { name:'豆腐型', emoji:'🧆', passive:'每5s回血',pIcon:'💎',sk1Icon:'🌀',sk2Icon:'💫',sk1Name:'護盾',sk2Name:'治癒波',sk1Cd:6000,sk2Cd:15000,bulletColor:'#a3e635',bulletDmg:10,spreadCount:0,speedBonus:0,defBonus:0 },
 noodle:{ name:'麵條型', emoji:'🍜', passive:'速度+30%',pIcon:'⚡',sk1Icon:'🌊',sk2Icon:'🌈',sk1Name:'波動連射',sk2Name:'彩虹亂射',sk1Cd:3500,sk2Cd:10000,bulletColor:'#f472b6',bulletDmg:8,spreadCount:2,speedBonus:.3,defBonus:0 },
 rice:  { name:'炒飯型', emoji:'🍚', passive:'金幣+50%',pIcon:'💰',sk1Icon:'💸',sk2Icon:'🏆',sk1Name:'金幣彈',sk2Name:'黃金護罩',sk1Cd:4000,sk2Cd:13000,bulletColor:'#fde047',bulletDmg:11,spreadCount:0,speedBonus:0,defBonus:0 },
 ramen: { name:'豚骨型', emoji:'🍲', passive:'爆擊+回血',pIcon:'🍜',sk1Icon:'🌡️',sk2Icon:'💥',sk1Name:'熱湯潑灑',sk2Name:'骨湯爆炸',sk1Cd:4500,sk2Cd:13000,bulletColor:'#fb7185',bulletDmg:13,spreadCount:1,speedBonus:0,defBonus:.08 },
 sushi: { name:'壽司型', emoji:'🍣', passive:'速度+爆擊',pIcon:'🔮',sk1Icon:'🌊',sk2Icon:'🎯',sk1Name:'魚波',sk2Name:'精準連擊',sk1Cd:3800,sk2Cd:11500,bulletColor:'#818cf8',bulletDmg:12,spreadCount:1,speedBonus:.2,defBonus:0 },
 steak: { name:'牛排型', emoji:'🥩', passive:'攻擊+爆擊',pIcon:'💪',sk1Icon:'🔥',sk2Icon:'💢',sk1Name:'火炙彈',sk2Name:'牛排衝擊',sk1Cd:5000,sk2Cd:14000,bulletColor:'#ef4444',bulletDmg:22,spreadCount:0,speedBonus:0,defBonus:0 },
};
const qaBank=[
 {q:'發現吐司有一小塊發霉，正確處理方式是？',opts:['切掉發霉處繼續吃','煮熟再吃','整包直接丟棄','放冷凍殺菌'],ans:2},
 {q:'牛肉哪個部位最嫩？',opts:['肩胛肉','菲力（里脊）','牛腱','牛腩'],ans:1},
 {q:'冰箱冷藏標準溫度是？',opts:['0–4°C','6–10°C','15°C','-5°C以下'],ans:0},
 {q:'梅納反應發生在什麼條件下？',opts:['冷水長時間泡發','高溫煎烤加工','低溫舒肥慢煮','醃漬加鹽靜置'],ans:1},
 {q:'食品存放的「危險溫度帶」是？',opts:['0–7°C','7–60°C','60–100°C','100°C以上'],ans:1},
 {q:'「FIFO」在廚房管理中代表？',opts:['先進先出','後進先出','高溫消毒','食安自主管理'],ans:0},
 {q:'「Sous Vide」是哪種烹調方式？',opts:['高溫油炸','真空低溫水浴','大火快炒','蒸氣燜煮'],ans:1},
 {q:'澱粉糊化需要哪個條件？',opts:['冷水＋大力攪拌','加熱＋水分','冷凍＋鹽','酸性環境＋油脂'],ans:1},
 {q:'豬肉安全的中心烹調溫度？',opts:['55°C','65°C','75°C','85°C'],ans:2},
 {q:'哪種食材解凍方式最不安全？',opts:['室溫靜置解凍','冷藏緩慢解凍','微波爐解凍','流水沖洗解凍'],ans:0},
 {q:'冰箱冷藏室應保持幾度以下？',opts:['10°C以下','7°C以下','4°C以下','0°C以下'],ans:1},
 {q:'廚師刀磨刀的正確角度約是？',opts:['5度','15–20度','30度','45度'],ans:1},
 {q:'生食與熟食應如何存放？',opts:['可以放同層','熟食放上層生食放下層','生食放上層熟食放下層','依食材種類分開'],ans:1},
 {q:'手部清洗搓洗應持續幾秒？',opts:['5秒以上','10秒以上','20秒以上','30秒以上'],ans:2},
 {q:'牛的哪個部位適合做牛排？',opts:['牛腱','牛腩','肋眼（沙朗）','牛尾'],ans:2},
 {q:'新鮮雞蛋應存放在幾度以下？',opts:['15°C以下','10°C以下','7°C以下','4°C以下'],ans:2},
];
function randQa(){return qaBank[Math.floor(Math.random()*qaBank.length)];}
const tr=SAVE.training||{atk:0,def:0,hp:0,stam:0,stamRegen:0,crit:0};
const atkMult=1+(tr.atk||0)*.1;
const defMult=1-(tr.def||0)*.08;
const hpBonus=(tr.hp||0)*20;
const stamBonus=(tr.stam||0)*10;
const startForm=SAVE.equippedForm||'normal';
const STAM_REGEN=0.012*(1+(tr.stamRegen||0)*.1);
const AMULET_DEFS={
 '廚神護符':{atkBonus:.15},'食安符':{hpBonus:30},'鮮度符':{regenBonus:2},
 '辛香符':{critBonus:.08},'溫度符':{defBonus:.1},'時令符':{goldBonus:.2},
};
function calcBonus(amlets){
 let b={atk:0,def:0,hp:0,regen:0,crit:0,gold:0};
 amlets.forEach(a=>{const d=AMULET_DEFS[a]||{};b.atk+=(d.atkBonus||0);b.def+=(d.defBonus||0);b.hp+=(d.hpBonus||0);b.regen+=(d.regenBonus||0);b.crit+=(d.critBonus||0);b.gold+=(d.goldBonus||0);});
 return b;
}
const equippedAmulets=SAVE.equip?.amulets?.filter(Boolean)||[];
const myAmuletBonus=calcBonus(equippedAmulets);
const canvas=document.getElementById('gameCanvas');
const ctx=canvas.getContext('2d');
let CW=0,CH=0;
function resize(){const gc=document.getElementById('gc');CW=gc.clientWidth;CH=gc.clientHeight;canvas.width=CW;canvas.height=CH;}
function safeResize(){resize();if(CW===0||CH===0){requestAnimationFrame(safeResize);return;}buildStars();}
document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(safeResize));
window.addEventListener('resize',()=>{resize();buildStars();});
let gold=SAVE.gold||0,score=0,stage=1,gameRunning=false,stageCleared=false;
let currentForm={...FOOD_FORMS[startForm]||FOOD_FORMS.normal};
let sk1Cd=0,sk2Cd=0,passiveTimer=0;
let pCds=[0,0];
let spawnTimer=0,spawnQueue=[],bossSpawned=false;
let stamina=100+stamBonus;
const maxStamina=100+stamBonus;
let currentWeapon='ranged';
let dodgeCd=0;
const DODGE_CD=22000,DODGE_DUR=1000;
let swipeAnim={active:false,progress:0,color:'#d97706'};

// Stars
let stars=[];
function buildStars(){stars=[];for(let i=0;i<50;i++)stars.push({x:Math.random()*CW,y:Math.random()*CH,spd:.3+Math.random()*.8,r:1+Math.random()*2});}
const player={x:0,y:0,radius:22,hp:100+hpBonus,maxHp:100+hpBonus,invTimer:0,weaponCd:0,speed:3.5,shieldActive:false,shieldHp:0};
let pointer={x:0,y:0};
const jWrap=document.getElementById('joystickWrap');
const jThumb=document.getElementById('joystickThumb');
let jActive=false,jTouchId=null,jDx=0,jDy=0;
const JR=65;
function moveJoystick(cx,cy){
 const r=jWrap.getBoundingClientRect();
 const cx2=r.left+r.width/2,cy2=r.top+r.height/2;
 let dx=cx-cx2,dy=cy-cy2;
 const d=Math.sqrt(dx*dx+dy*dy);
 if(d>JR){dx=dx/d*JR;dy=dy/d*JR;}
 jDx=dx/JR;jDy=dy/JR;
 jThumb.style.transform=\`translate(calc(-50% + \${dx}px), calc(-50% + \${dy}px))\`;
}
function resetJoystick(){jActive=false;jTouchId=null;jDx=0;jDy=0;jThumb.style.transform='translate(-50%,-50%)';}
jWrap.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];jTouchId=t.identifier;jActive=true;moveJoystick(t.clientX,t.clientY);},{passive:false});
window.addEventListener('touchmove',e=>{if(!jActive)return;for(const t of e.changedTouches){if(t.identifier===jTouchId){moveJoystick(t.clientX,t.clientY);break;}}},{passive:false});
window.addEventListener('touchend',e=>{for(const t of e.changedTouches){if(t.identifier===jTouchId){resetJoystick();break;}}});
const keys={};
window.addEventListener('keydown',e=>keys[e.code]=true);
window.addEventListener('keyup',e=>keys[e.code]=false);
function getJoystickInput(){
 let dx=jDx,dy=jDy;
 if(keys['ArrowLeft']||keys['KeyA'])dx-=1;if(keys['ArrowRight']||keys['KeyD'])dx+=1;
 if(keys['ArrowUp']||keys['KeyW'])dy-=1;if(keys['ArrowDown']||keys['KeyS'])dy+=1;
 const m=Math.sqrt(dx*dx+dy*dy);if(m>1){dx/=m;dy/=m;}
 return{dx,dy};
}
let bullets=[],eBullets=[],enemies=[],particles=[],coins=[],texts=[];
let boss=null;
class Bullet{
 constructor(x,y,vx,vy,dmg,color,r,pierce=false,homing=false,burn=false){
  Object.assign(this,{x,y,vx,vy,dmg,color,r,pierce,homing,burn,age:0,hitTargets:new Set()});
 }
 update(){
  this.age++;
  if(this.homing){
   const t=findClosest(this.x,this.y,350);
   if(t){const a=Math.atan2(t.y-this.y,t.x-this.x),ca=Math.atan2(this.vy,this.vx);let na=ca+(a-ca)*.12;this.vx=Math.cos(na)*8;this.vy=Math.sin(na)*8;}
  }
  this.x+=this.vx;this.y+=this.vy;
 }
 draw(){ctx.save();ctx.fillStyle=this.color;ctx.shadowBlur=8;ctx.shadowColor=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}
 dead(){return this.x<-20||this.x>CW+20||this.y<-20||this.y>CH+20||this.age>200;}
}
class Enemy{
 constructor(x,y,type,hp,sv){
  Object.assign(this,{x,y,type,maxHp:hp,hp,scoreVal:sv,r:type===2?18:14,timer:0,vy:type===1?3:type===2?1.5:2,vx:0,frozenTimer:0});
  if(type===3)this.startX=x;
 }
 update(){
  this.timer++;const sm=this.frozenTimer>0?.4:1;if(this.frozenTimer>0)this.frozenTimer--;
  if(this.type===1){this.vx=player.x>this.x?1.2:-1.2;this.x+=this.vx*sm;this.y+=this.vy*sm;}
  else if(this.type===2){this.y+=this.vy*sm;if(this.timer%90===0&&this.y>0&&this.y<CH*.5){const a=Math.atan2(player.y-this.y,player.x-this.x);eBullets.push(new Bullet(this.x,this.y,Math.cos(a)*4,Math.sin(a)*4,12,'#f43f5e',5));}}
  else{this.x=this.startX+Math.sin(this.timer*.05)*50;this.y+=this.vy*sm;}
  if(this.y>CH+60)this.hp=0;
 }
 draw(){
  ctx.save();ctx.translate(this.x,this.y);
  ctx.fillStyle=this.frozenTimer>0?'#bfdbfe':(this.type===1?'#c084fc':this.type===2?'#f87171':'#fcd34d');
  ctx.shadowBlur=7;ctx.shadowColor=ctx.fillStyle;
  ctx.beginPath();
  if(this.type===1){ctx.moveTo(0,16);ctx.lineTo(13,-12);ctx.lineTo(-13,-12);}
  else if(this.type===2){ctx.moveTo(0,16);ctx.lineTo(16,0);ctx.lineTo(0,-16);ctx.lineTo(-16,0);}
  else ctx.arc(0,0,14,0,Math.PI*2);
  ctx.closePath();ctx.fill();
  if(this.hp<this.maxHp){ctx.fillStyle='#fde8c8';ctx.fillRect(-12,-22,24,4);ctx.fillStyle='#ef4444';ctx.fillRect(-12,-22,24*(this.hp/this.maxHp),4);}
  ctx.restore();
 }
 takeDamage(amt){
  this.hp-=amt*atkMult;addText(Math.floor(amt*atkMult).toString(),this.x,this.y,'#78350f');
  if(this.hp<=0){
   burst(this.x,this.y,'#fb923c',14);score+=this.scoreVal;
   const goldChance=currentForm.name==='炒飯型'?.45:.3;
   if(Math.random()<goldChance){
const earn=currentForm.name==='炒飯型'?2:1;gold+=earn;
addText('+'+earn+'💰',this.x,this.y-20,'#92400e');updateHUD();
   }
   reportKill();
  }
 }
}
class Boss extends Enemy{
 constructor(stg){
  super(CW/2,-90,10,Math.floor((200+stg*80)*Math.pow(1/atkMult,.5)),stg<=1?500:stg===2?1000:2000);
  this.r=64;this.phase=0;this.stg=stg;this.targetX=CW/2;this.targetY=130;this.atkTimer=0;this._defeated=false;
  this.color=stg<=1?'#f87171':stg===2?'#c084fc':'#f472b6';
  this.name=stg<=1?'腐敗食神':stg===2?'毒素領主':'終焉主廚';
  document.getElementById('bossHud').style.display='block';
  document.getElementById('bossName').textContent='👿 '+this.name;
  updateBossHp();
 }
 update(){
  this.timer++;if(this.y<this.targetY){this.y+=2.5;return;}
  const sm=this.frozenTimer>0?.7:1;if(this.frozenTimer>0)this.frozenTimer--;
  if(this.timer%100===0)this.targetX=50+Math.random()*(CW-100);
  this.x+=(this.targetX-this.x)*.025*sm;this.y+=(this.targetY-this.y)*.025*sm;
  this.atkTimer++;const intv=this.phase>=2?100:this.phase===1?140:200;
  if(this.atkTimer>=intv){this.atkTimer=0;this.fire();}
 }
 fire(){
  const bx=this.x,by=this.y+this.r,a=Math.atan2(player.y-by,player.x-bx);
  if(this.phase===0){for(let i=0;i<8;i++){const ang=(Math.PI*2/8)*i+(this.timer*.015);eBullets.push(new Bullet(this.x,this.y,Math.cos(ang)*3.5,Math.sin(ang)*3.5,15,'#f87171',6));}eBullets.push(new Bullet(bx,by,Math.cos(a)*5,Math.sin(a)*5,20,'#facc15',8));}
  else if(this.phase===1){for(let i=-2;i<=2;i++)eBullets.push(new Bullet(bx,by,i*2.5,5,18,'#d8b4fe',6));eBullets.push(new Bullet(bx,by,Math.cos(a)*6,Math.sin(a)*6,22,'#f87171',7));}
  else{for(let i=0;i<10;i++){const ang=(Math.PI*2/10)*i;eBullets.push(new Bullet(this.x,this.y,Math.cos(ang)*4.5,Math.sin(ang)*4.5,16,'#f472b6',5));}for(let i=-1;i<=1;i++)eBullets.push(new Bullet(bx,by,i*3,6,20,'#fbbf24',7));}
 }
 draw(){
  ctx.save();ctx.translate(this.x,this.y);ctx.shadowBlur=14;ctx.shadowColor=this.color;ctx.fillStyle=this.color;
  ctx.beginPath();
  if(this.stg<=1){ctx.moveTo(0,48);ctx.lineTo(48,0);ctx.lineTo(48,-26);ctx.lineTo(-48,-26);ctx.lineTo(-48,0);}
  else if(this.stg===2){ctx.moveTo(0,52);ctx.lineTo(36,12);ctx.lineTo(52,-12);ctx.lineTo(0,-36);ctx.lineTo(-52,-12);ctx.lineTo(-36,12);}
  else{ctx.rotate(this.timer*.018);ctx.arc(0,0,48,0,Math.PI*2);}
  ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';ctx.shadowBlur=0;ctx.beginPath();ctx.arc(0,0,12+Math.sin(this.timer*.1)*6,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 takeDamage(amt){
  if(this._defeated)return;
  this.hp-=amt*atkMult;addText(Math.floor(amt*atkMult).toString(),this.x,this.y,'#92400e');
  updateBossHp();
  if(this.hp<this.maxHp*.66&&this.phase===0){this.phase=1;setTimeout(triggerQa,0);}
  if(this.hp<this.maxHp*.33&&this.phase===1){this.phase=2;setTimeout(triggerQa,0);}
  if(this.hp<=0){
   this._defeated=true;
   if(qaActive){qaActive=false;document.getElementById('qaOverlay').style.display='none';document.getElementById('pzr').style.display='none';}
   document.getElementById('bossHud').style.display='none';
   for(let i=0;i<5;i++)setTimeout(()=>burst(this.x+(Math.random()-.5)*80,this.y+(Math.random()-.5)*80,this.color,25),i*200);
   score+=this.scoreVal;gold+=100;updateHUD();reportBossKill();
   for(let i=0;i<10;i++)coins.push(new Coin(this.x+(Math.random()-.5)*50,this.y+(Math.random()-.5)*30));
   stageCleared=true;gameRunning=false;
   setTimeout(()=>{
stage++;
const fl=document.getElementById('stageFlash'),fm=document.getElementById('stageFlashMsg');
fm.textContent='💰 +100　關卡 '+stage+' 開始！';fl.style.display='flex';
setTimeout(()=>fl.style.display='none',1200);
buildStage(stage);gameRunning=true;last=performance.now();requestAnimationFrame(loop);
   },1800);
  }
 }
}
class Coin{
 constructor(x,y){this.x=x;this.y=y;this.vx=(Math.random()-.5)*5;this.vy=-Math.random()*3-2;this.r=7;}
 update(){
  this.vy+=.14;if(this.vy>4)this.vy=4;
  const d=Math.hypot(player.x-this.x,player.y-this.y);
  if(d<180){this.vx+=(player.x-this.x)*.005;this.vy+=(player.y-this.y)*.005;}
  this.x+=this.vx;this.y+=this.vy;
  if(this.x<8){this.x=8;this.vx*=-.5;}if(this.x>CW-8){this.x=CW-8;this.vx*=-.5;}
 }
 draw(){ctx.save();ctx.translate(this.x,this.y);ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ca8a04';ctx.beginPath();ctx.arc(0,0,this.r-2,0,Math.PI*2);ctx.fill();ctx.restore();}
}
function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:2+Math.random()*3,color,life:1,decay:.03+Math.random()*.03});}}
function addText(t,x,y,color,sz=15,vy=-0.8){texts.push({t,x:x+(Math.random()-.5)*20,y,color,sz,life:1,vy});}
function findClosest(x,y,range){let best=null,bd=range*range;for(const e of enemies){const d=(e.x-x)**2+(e.y-y)**2;if(d<bd){bd=d;best=e;}}if(boss&&!boss._defeated){const d=(boss.x-x)**2+(boss.y-y)**2;if(d<bd)best=boss;}return best;}
function setWeapon(w){
 currentWeapon=w;
 const btn=document.getElementById('wpnToggle');if(!btn)return;
 if(w==='melee'){btn.textContent='🗡️';btn.style.borderColor='#7c3aed';btn.style.background='rgba(167,139,250,.25)';}
 else{btn.textContent='🏹';btn.style.borderColor='#d97706';btn.style.background='rgba(251,191,36,.2)';}
}
function toggleWeapon(){setWeapon(currentWeapon==='ranged'?'melee':'ranged');}
function dodge(){
 if(!gameRunning||dodgeCd>0||stamina<30)return;
 stamina=Math.max(0,stamina-30);dodgeCd=DODGE_CD;player.invTimer=60;
 burst(player.x,player.y,'#88d4ff',12);updateHUD();
 const btn=document.getElementById('dodgeBtnR');btn.classList.add('cooling');setTimeout(()=>btn.classList.remove('cooling'),DODGE_CD);
}
function startSwipe(){swipeAnim={active:true,progress:0,color:currentForm.bulletColor||'#d97706'};}
const WEAPON_CD=10,MELEE_CD=28;
function autoFire(){
 if(player.weaponCd>0){player.weaponCd--;return;}
 if(currentWeapon==='melee'){
  player.weaponCd=MELEE_CD;
  startSwipe();
  const sRange=68;
  enemies.forEach(e=>{const d=Math.sqrt((e.x-player.x)**2+(e.y-player.y)**2);if(d<sRange){e.takeDamage(currentForm.bulletDmg*2.0);burst(e.x,e.y,currentForm.bulletColor,5);}});
  if(boss&&!boss._defeated&&Math.hypot(boss.x-player.x,boss.y-player.y)<sRange+20)boss.takeDamage(currentForm.bulletDmg*2.0);
  // 子彈反彈
  let reflected=0;
  for(let i=eBullets.length-1;i>=0;i--){
   const b=eBullets[i];
   if(reflected<4&&Math.hypot(b.x-player.x,b.y-player.y)<sRange+24){
bullets.push(new Bullet(b.x,b.y,-b.vx*1.4,-b.vy*1.4,b.dmg*.8,currentForm.bulletColor,b.r+2));
eBullets.splice(i,1);reflected++;
   }
  }
 } else {
  player.weaponCd=WEAPON_CD;
  const f=currentForm,sc=f.spreadCount||0;
  if(sc>0){for(let i=-sc;i<=sc;i++)fire(player.x,player.y,Math.sin(i*.25)*10,-Math.cos(i*.25)*10,f.bulletColor,f.bulletDmg,5);}
  else{fire(player.x,player.y,1,-12,f.bulletColor,f.bulletDmg,5);fire(player.x,player.y,-1,-12,f.bulletColor,f.bulletDmg,5);}
 }
}
function fire(x,y,vx,vy,color,dmg,r,pierce=false,homing=false){bullets.push(new Bullet(x,y,vx,vy,dmg*atkMult,color,r,pierce,homing,currentForm.name==='辣椒型'));}
function updateSkillUI(){document.getElementById('sk1I').textContent=currentForm.sk1Icon;document.getElementById('sk2I').textContent=currentForm.sk2Icon;document.getElementById('skPI').textContent=currentForm.pIcon;document.getElementById('sk1Cd').style.display='none';document.getElementById('sk2Cd').style.display='none';}
function setForm(fid){const f=FOOD_FORMS[fid];if(!f)return;currentForm={...f};sk1Cd=0;sk2Cd=0;player.speed=3.5*(1+(f.speedBonus||0));updateSkillUI();document.getElementById('formBadge').textContent=f.emoji+' '+f.name;document.getElementById('formPassive').textContent=f.pIcon+' '+f.passive;}
function useSkill1(){
 if(!gameRunning||sk1Cd>0)return;sk1Cd=currentForm.sk1Cd;
 const f=currentForm;
 if(f.name==='漢堡型')fire(player.x,player.y,0,-14,f.bulletColor,35,9);
 else if(f.name==='辣椒型')fire(player.x,player.y,0,-10,f.bulletColor,25,7,false,true);
 else if(f.name==='豆腐型'){player.shieldActive=true;player.shieldHp=50;burst(player.x,player.y,'#67e8f9',18);addText('SHIELD',player.x,player.y-20,'#67e8f9');}
 else if(f.name==='麵條型'){for(let i=-2;i<=2;i++)fire(player.x,player.y,i*2.5,-9,f.bulletColor,16,5);}
 else if(f.name==='炒飯型'){for(let i=-1;i<=1;i++)fire(player.x,player.y,i*1.5,-10,'#fde047',20,6);}
 else{fire(player.x-4,player.y,-1,-12,f.bulletColor,14,5);fire(player.x+4,player.y,1,-12,f.bulletColor,14,5);}
 burst(player.x,player.y,f.bulletColor,7);
}
function useSkill2(){
 if(!gameRunning||sk2Cd>0)return;sk2Cd=currentForm.sk2Cd;
 const f=currentForm;
 if(f.name==='漢堡型'){for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2;fire(player.x,player.y,Math.cos(a)*7,Math.sin(a)*7,f.bulletColor,20,6);}}
 else if(f.name==='辣椒型'){player.invTimer=90;enemies.forEach(e=>{if(Math.hypot(e.x-player.x,e.y-player.y)<80)e.hp-=40*atkMult;});if(boss&&!boss._defeated)boss.hp-=40*atkMult;burst(player.x,player.y,'#f97316',22);}
 else if(f.name==='豆腐型'){player.hp=Math.min(player.maxHp,player.hp+50);if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;updateHUD();enemies.forEach(e=>e.takeDamage(22));if(boss&&!boss._defeated)boss.takeDamage(22);burst(player.x,player.y,'#67e8f9',22);}
 else if(f.name==='麵條型'){for(let i=0;i<14;i++){const a=(i/14)*Math.PI*2;fire(player.x,player.y,Math.cos(a)*7,Math.sin(a)*7,'hsl('+(i*25)+',100%,65%)',14,5);}}
 else if(f.name==='炒飯型'){player.shieldActive=true;player.shieldHp=60;enemies.forEach(e=>e.takeDamage(30));if(boss&&!boss._defeated)boss.takeDamage(30);burst(player.x,player.y,'#fde047',20);}
 else{enemies.forEach(e=>e.takeDamage(30));if(boss&&!boss._defeated)boss.takeDamage(30);burst(player.x,player.y,'#fbbf24',18);}
}
let charSlots=[],activeChar=0;
function initCharSlots(){
 charSlots=[];
 const baseHp=player.maxHp;
 const myHp=baseHp+(myAmuletBonus.hp||0);
 charSlots.push({name:SAVE.playerName||'玩家',emoji:currentForm.emoji,formId:startForm,hp:myHp,maxHp:myHp,alive:true});
 PARTNERS.forEach(p=>{
  const pFormId=p.formId||'normal';
  charSlots.push({name:p.name,emoji:(FOOD_FORMS[pFormId]||FOOD_FORMS.normal).emoji,formId:pFormId,hp:baseHp,maxHp:baseHp,alive:true});
 });
 activeChar=0;updateHUD();
}
function switchToNextAliveChar(){
 for(let i=activeChar+1;i<charSlots.length;i++){if(charSlots[i].alive){activeChar=i;return true;}}
 return false;
}
function switchToChar(slotIdx){
 if(!gameRunning&&slotIdx!==activeChar){}
 if(slotIdx===activeChar)return;
 if(!charSlots[slotIdx]||!charSlots[slotIdx].alive){addText('已陣亡！',CW/2,CH*.5,'#f87171',20,0);return;}
 charSlots[activeChar].hp=player.hp;
 activeChar=slotIdx;
 const nextCh=charSlots[activeChar];
 player.hp=Math.max(1,nextCh.hp);player.maxHp=nextCh.maxHp;
 player.invTimer=45;player.x=Math.max(50,CW/2);player.y=Math.max(100,CH*.8);
 player.shieldActive=false;player.shieldHp=0;
 const switchForm=FOOD_FORMS[nextCh.formId]||currentForm;
 currentForm={...switchForm};player.speed=3.5*(1+(switchForm.speedBonus||0));
 updateSkillUI();
 document.getElementById('formBadge').textContent=nextCh.emoji+' '+nextCh.name;
 document.getElementById('formPassive').textContent=(switchForm.pIcon||'✨')+' '+switchForm.passive;
 updateHUD();burst(player.x,player.y,'#a5b4fc',20);
 addText(nextCh.emoji+' '+nextCh.name+' 出擊！',CW/2,CH*.45,'#6366f1',22,0);
}
function getPartnerPassiveBonus(){
 let b={atk:0,def:0,hp:0,regen:0,crit:0,gold:0};
 if(!charSlots||!charSlots.length)return b;
 charSlots.forEach((ch,i)=>{
  if(i===activeChar||!ch.alive)return;
  const f=FOOD_FORMS[ch.formId]||null;if(!f)return;
  if(f.name==='漢堡型')b.def+=.06;if(f.name==='炒飯型')b.gold+=.2;
  if(f.name==='豆腐型')b.regen+=1.5;if(f.name==='壽司型')b.crit+=.04;
  if(f.name==='牛排型')b.atk+=.08;if(f.name==='辣椒型')b.atk+=.05;
  if(f.name==='麵條型')b.crit+=.03;if(f.name==='豚骨型')b.regen+=1;
 });
 return b;
}
function updateHUD(){
 const bars=document.getElementById('charBars');
 if(bars&&charSlots.length>0){
  bars.innerHTML=charSlots.map((ch,i)=>{
   const isActive=i===activeChar,alive=ch.alive;
   const pct=Math.max(0,ch.hp/ch.maxHp*100);
   const barColor=isActive?'linear-gradient(90deg,#f97316,#fbbf24)':alive?'linear-gradient(90deg,#fb923c,#fcd34d)':'#d1d5db';
   if(!alive)return '<div class="charBar"><span class="charBarEmoji" style="opacity:.4">'+ch.emoji+'</span><div class="charBarInfo"><div class="charBarName" style="color:#9ca3af">'+ch.name+'</div><div style="font-size:11px;color:#9ca3af">💀 陣亡</div></div></div>';
   const canSwitch=!isActive&&alive;
   return '<div class="charBar" style="cursor:'+(canSwitch?'pointer':'default')+'"'+(canSwitch?' onclick="switchToChar('+i+')"':'')+'>'+
'<span class="charBarEmoji" style="font-size:'+(isActive?'26px':'20px')+';'+(isActive?'filter:drop-shadow(0 0 5px #f97316)':'opacity:.75')+'">'+ch.emoji+'</span>'+
'<div class="charBarInfo">'+
 '<div class="charBarName" style="font-size:'+(isActive?'14px':'11px')+';color:'+(isActive?'#92400e':'#78350f')+'">'+
(isActive?'▶ ':canSwitch?'↩ ':'')+ch.name+
 '</div>'+
 '<div class="charBarTrack" style="width:'+(isActive?'200px':'160px')+';height:'+(isActive?'17px':'12px')+'"><div class="charBarFill" style="width:'+pct+'%;background:'+barColor+'"></div></div>'+
 '<div class="charBarNum" style="font-size:'+(isActive?'13px':'11px')+'">'+Math.ceil(ch.hp)+' / '+ch.maxHp+'</div>'+
'</div></div>';
  }).join('');
 }
 const st=Math.max(0,Math.floor(stamina));
 document.getElementById('stamFill').style.width=(st/maxStamina*100)+'%';
 document.getElementById('stamNum').textContent=st+'/'+maxStamina;
 document.getElementById('coinDisp').textContent=gold;
 document.getElementById('scoreDisp').textContent=score;
 document.getElementById('lvlDisp').textContent=stage;
 updatePSwitchUI();
}
function updatePSwitchUI(){
 if(!charSlots||!charSlots.length)return;
 charSlots.forEach((ch,i)=>{
  const btn=document.getElementById('csBtn'+i);if(!btn)return;
  const emoji=document.getElementById('csEmoji'+i),nameEl=document.getElementById('csName'+i),hpFill=document.getElementById('csHpFill'+i),deadEl=document.getElementById('csDead'+i);
  if(emoji)emoji.textContent=ch.emoji;
  if(nameEl)nameEl.textContent=ch.name.slice(0,6);
  const pct=Math.max(0,ch.hp/ch.maxHp*100);
  if(hpFill){hpFill.style.width=pct+'%';hpFill.style.background=pct>50?'#22c55e':pct>25?'#f59e0b':'#ef4444';}
  if(!ch.alive){btn.className='cSwBtn dead-char';if(deadEl)deadEl.style.display='block';}
  else if(i===activeChar){btn.className='cSwBtn active-char';if(deadEl)deadEl.style.display='none';}
  else{btn.className='cSwBtn';if(deadEl)deadEl.style.display='none';}
 });
}
function updateBossHp(){if(boss&&!boss._defeated)document.getElementById('bossFill').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';}
function hurtPlayer(raw){
 if(player.invTimer>0)return;
 let dmg=Math.ceil(raw*defMult);
 if(currentForm.defBonus)dmg=Math.ceil(dmg*(1-currentForm.defBonus));
 if(player.shieldActive){player.shieldHp-=dmg;burst(player.x,player.y,'#67e8f9',12);addText('SHIELD',player.x,player.y-20,'#67e8f9');if(player.shieldHp<=0)player.shieldActive=false;return;}
 player.hp-=dmg;
 if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;
 player.invTimer=22;burst(player.x,player.y,'#ef4444',10);addText('-'+dmg,player.x,player.y-20,'#ef4444');updateHUD();
 if(player.hp<=0)playerDied();
}
function buildStage(s){
 bullets=[];eBullets=[];enemies=[];particles=[];coins=[];texts=[];
 boss=null;bossSpawned=false;stageCleared=false;spawnTimer=0;spawnQueue=[];
 player.x=Math.max(50,CW/2);player.y=Math.max(100,CH*.8);
 player.invTimer=30;player.shieldActive=false;player.shieldHp=0;player.weaponCd=0;
 if(charSlots.length>0&&charSlots[activeChar]){player.hp=charSlots[activeChar].hp;player.maxHp=charSlots[activeChar].maxHp;}
 pCds=[0,0];passiveTimer=0;
 document.getElementById('bossHud').style.display='none';
 document.getElementById('lvlDisp').textContent=s;updateHUD();
 const n=12+s*6;
 for(let i=0;i<n;i++)spawnQueue.push({frame:i*35+20,x:20+Math.random()*(CW-40),type:Math.random()>.55?(Math.random()>.5?2:3):1});
}
function tickSpawner(){
 spawnTimer++;
 while(spawnQueue.length&&spawnQueue[0].frame<=spawnTimer){const cfg=spawnQueue.shift();enemies.push(new Enemy(cfg.x,-20,cfg.type,18+stage*5,10*stage));}
 if(!bossSpawned&&!spawnQueue.length&&!enemies.length){bossSpawned=true;boss=new Boss(stage);}
}
let qaActive=false,qaTimer=0,qaAns=0;
const QA_TIME=5000;
function triggerQa(){
 if(qaActive||stageCleared)return;
 const qa=randQa();qaActive=true;qaTimer=QA_TIME;qaAns=qa.ans;
 document.getElementById('zAL').textContent='A. '+qa.opts[0];
 document.getElementById('zBL').textContent='B. '+qa.opts[1];
 document.getElementById('zCL').textContent='C. '+(qa.opts[2]||'');
 document.getElementById('zDL').textContent='D. '+(qa.opts[3]||'');
 document.getElementById('qaText').textContent=qa.q;
 document.getElementById('timerFill').style.width='100%';
 document.getElementById('timerLabel').textContent=(QA_TIME/1000).toFixed(1)+'s';
 document.getElementById('qaOverlay').style.display='block';
 document.getElementById('pzr').style.display='block';
 updatePzr();
}
function updatePzr(){const r=document.getElementById('pzr');r.style.left=(player.x-28)+'px';r.style.top=(player.y-28)+'px';}
function getPlayerZone(){const hx=player.x<CW/2,hy=player.y<CH/2;return hx&&hy?0:!hx&&hy?1:hx&&!hy?2:3;}
function resolveQa(dt){
 qaTimer-=dt;
 document.getElementById('timerFill').style.width=(qaTimer/QA_TIME*100)+'%';
 document.getElementById('timerLabel').textContent=Math.max(0,qaTimer/1000).toFixed(1)+'s';
 updatePzr();
 if(qaTimer<=0){endQa(getPlayerZone()===qaAns);}
}
function endQa(correct){
 qaActive=false;document.getElementById('qaOverlay').style.display='none';document.getElementById('pzr').style.display='none';
 const ids=['zA','zB','zC','zD'];
 if(correct){document.getElementById(ids[qaAns]).classList.add('cf');setTimeout(()=>document.getElementById(ids[qaAns]).classList.remove('cf'),700);burst(player.x,player.y,'#4ade80',16);}
 else{const wc=getPlayerZone();document.getElementById(ids[Math.min(3,wc)]).classList.add('wf');setTimeout(()=>document.getElementById(ids[Math.min(3,wc)]).classList.remove('wf'),600);hurtPlayer(45);burst(player.x,player.y,'#ef4444',20);}
}
let revCorrect=0,revWrong=0,revPool=[];
function playerDied(){
 if(charSlots.length>0)charSlots[activeChar].alive=false;
 const hasNext=switchToNextAliveChar();
 if(hasNext){
  const nextCh=charSlots[activeChar];
  player.hp=Math.max(1,nextCh.hp);player.maxHp=nextCh.maxHp;
  player.invTimer=50;player.x=Math.max(50,CW/2);player.y=Math.max(100,CH*.8);
  player.shieldActive=false;player.shieldHp=0;
  const switchForm=FOOD_FORMS[nextCh.formId]||currentForm;
  currentForm={...switchForm};player.speed=3.5*(1+(switchForm.speedBonus||0));
  updateSkillUI();
  document.getElementById('formBadge').textContent=nextCh.emoji+' '+nextCh.name;
  document.getElementById('formPassive').textContent=(switchForm.pIcon||'✨')+' '+switchForm.passive;
  updateHUD();burst(player.x,player.y,'#a5b4fc',24);
  addText('🔄 '+nextCh.emoji+' '+nextCh.name+' 出擊！',CW/2,CH*.45,'#6366f1',22,0);
  return;
 }
 gameRunning=false;revCorrect=0;revWrong=0;
 revPool=[...qaBank].sort(()=>Math.random()-.5);
 document.getElementById('revModal').style.display='flex';
 updateCharStatusUI();drawRevProg();nextRevQ();
}
function updateCharStatusUI(){
 const row=document.getElementById('charStatusRow');if(!row)return;
 row.innerHTML=charSlots.map((ch,i)=>
  '<div style="display:flex;flex-direction:column;align-items:center;gap:2px;opacity:'+(ch.alive?1:.35)+'">'+
  '<div style="font-size:'+(i===activeChar?'24px':'20px')+'">'+ch.emoji+'</div>'+
  '<div style="font-size:10px;font-weight:900;color:'+(i===activeChar?'#059669':'#78350f')+'">'+ch.name+'</div>'+
  '<div style="font-size:11px">'+(ch.alive?'❤️':'💀')+'</div></div>'
 ).join('');
}
function drawRevProg(){
 document.getElementById('revProg').innerHTML=Array.from({length:5},(_,i)=>'<span style="font-size:22px;line-height:1">'+(i<revCorrect?'💚':'🩶')+'</span>').join('');
 document.getElementById('revWrongDisp').innerHTML=Array.from({length:3},(_,i)=>'<span style="font-size:22px;line-height:1">'+(i<revWrong?'❌':'🔘')+'</span>').join('');
}
let curRevQ=null;
function nextRevQ(){
 if(!revPool.length)revPool=[...qaBank].sort(()=>Math.random()-.5);
 curRevQ=revPool.pop();
 document.getElementById('revQ').textContent=curRevQ.q;
 document.getElementById('revNum').textContent='答對 '+revCorrect+' / 5　答錯 '+revWrong+' / 3';
 const opts=document.getElementById('revOpts');opts.innerHTML='';
 ['A','B','C','D'].slice(0,curRevQ.opts.length).forEach((l,i)=>{
  const btn=document.createElement('button');btn.className='qopt';btn.textContent=l+'. '+curRevQ.opts[i];
  btn.onclick=()=>{
   const ok=i===curRevQ.ans;btn.className='qopt '+(ok?'correct':'wrong');
   opts.querySelectorAll('.qopt').forEach((b,j)=>{b.onclick=null;if(j===curRevQ.ans)b.className='qopt correct';});
   if(ok){revCorrect++;drawRevProg();if(revCorrect>=5){setTimeout(()=>{document.getElementById('revModal').style.display='none';goBackToCamp();},700);return;}}
   else{revWrong++;drawRevProg();if(revWrong>=3){setTimeout(()=>{document.getElementById('revModal').style.display='none';gold=0;window.parent.postMessage({type:'FR_PENALTY_RETURN'},'*');},900);return;}}
   setTimeout(nextRevQ,900);
  };opts.appendChild(btn);
 });
}
function drawBg(){
 const g=ctx.createLinearGradient(0,0,0,CH);g.addColorStop(0,'#fdf8f0');g.addColorStop(1,'#f5ede0');
 ctx.fillStyle=g;ctx.fillRect(0,0,CW,CH);
 ctx.fillStyle='rgba(253,251,247,.8)';
 stars.forEach((s,i)=>{const y=((s.y)%CH+CH)%CH;if(i%5===0){ctx.beginPath();ctx.ellipse(s.x,y,s.r*6,s.r*2.5,0,0,Math.PI*2);ctx.fill();}});
 ctx.strokeStyle='rgba(180,160,130,.07)';ctx.lineWidth=1;
 for(let x=0;x<CW;x+=30){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,CH);ctx.stroke();}
 for(let y=0;y<CH;y+=30){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(CW,y);ctx.stroke();}
}
function drawPlayer(){
 if(player.invTimer>0&&Math.floor(Date.now()/80)%2===0)return;
 ctx.save();ctx.translate(player.x,player.y);
 ctx.font='36px sans-serif';ctx.textBaseline='middle';ctx.textAlign='center';ctx.fillText(currentForm.emoji,0,0);
 ctx.fillStyle='#fb923c';ctx.globalAlpha=.5+Math.random()*.35;
 ctx.beginPath();ctx.moveTo(-7,15);ctx.lineTo(0,26+Math.random()*8);ctx.lineTo(7,15);ctx.closePath();ctx.fill();
 ctx.globalAlpha=1;
 if(player.shieldActive){ctx.strokeStyle='#67e8f9';ctx.lineWidth=3;ctx.globalAlpha=.55;ctx.beginPath();ctx.arc(0,0,26,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.12;ctx.fillStyle='#67e8f9';ctx.fill();ctx.globalAlpha=1;}
 // 揮刀弧線
 if(swipeAnim.active){
  const p=swipeAnim.progress;
  const startA=Math.PI*.8,endA=-Math.PI*.1;
  const curA=startA+(endA-startA)*p;
  ctx.strokeStyle=swipeAnim.color;ctx.lineWidth=7*(1-p*.5);ctx.lineCap='round';
  ctx.globalAlpha=(1-p)*.92;ctx.shadowBlur=16;ctx.shadowColor=swipeAnim.color;
  ctx.beginPath();ctx.arc(0,0,44,startA,curA);ctx.stroke();
  ctx.fillStyle=swipeAnim.color;ctx.globalAlpha=(1-p);
  ctx.beginPath();ctx.arc(Math.cos(curA)*44,Math.sin(curA)*44,6,0,Math.PI*2);ctx.fill();
  ctx.restore();ctx.save();ctx.translate(player.x,player.y);ctx.globalAlpha=1;ctx.shadowBlur=0;
 }
 ctx.restore();
}
let last=0;
function loop(ts){
 if(!gameRunning||stageCleared)return;
 const dt=Math.min(ts-last,50);last=ts;
 // Stars scroll
 stars.forEach(s=>{s.y+=s.spd;if(s.y>CH){s.y=0;s.x=Math.random()*CW;}});
 // Player move (joystick)
 const ji=getJoystickInput();
 const spd=player.speed*(currentWeapon==='melee'?1.1:1);
 player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+ji.dx*spd));
 player.y=Math.max(player.radius,Math.min(CH-player.radius,player.y+ji.dy*spd));
 pointer.x=player.x;pointer.y=player.y;
 if(player.invTimer>0)player.invTimer--;
 if(dodgeCd>0)dodgeCd-=dt;
 // Swipe anim
 if(swipeAnim.active){swipeAnim.progress+=dt/180;if(swipeAnim.progress>=1)swipeAnim.active=false;}
 // Stamina regen
 stamina=Math.min(maxStamina,stamina+STAM_REGEN*dt);
 const st=Math.max(0,Math.floor(stamina));
 if(Math.floor(ts/100)%3===0){document.getElementById('stamFill').style.width=(st/maxStamina*100)+'%';document.getElementById('stamNum').textContent=st+'/'+maxStamina;}
 // Skill CDs
 if(sk1Cd>0){sk1Cd-=dt;const el=document.getElementById('sk1Cd');el.style.display='flex';el.textContent=Math.ceil(sk1Cd/1000)+'s';if(sk1Cd<=0){sk1Cd=0;el.style.display='none';}}
 if(sk2Cd>0){sk2Cd-=dt;const el=document.getElementById('sk2Cd');el.style.display='flex';el.textContent=Math.ceil(sk2Cd/1000)+'s';if(sk2Cd<=0){sk2Cd=0;el.style.display='none';}}
 // Partner passive
 const pb=getPartnerPassiveBonus();
 if((currentForm.name==='豆腐型'||currentForm.name==='豚骨型'||pb.regen>0)&&passiveTimer>=5000){
  passiveTimer=0;const regen=(pb.regen||0)+(currentForm.name==='豆腐型'||currentForm.name==='豚骨型'?5:0);
  player.hp=Math.min(player.maxHp,player.hp+regen);if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;burst(player.x,player.y,'#a3e635',5);
 } else passiveTimer+=dt;
 // QA
 if(qaActive)resolveQa(dt);
 // Spawner
 if(!bossSpawned)tickSpawner();
 // Enemies
 for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.update();if(Math.hypot(player.x-e.x,player.y-e.y)<player.radius+e.r&&player.invTimer<=0)hurtPlayer(10);if(e.hp<=0)enemies.splice(i,1);}
 if(boss&&!boss._defeated){boss.update();if(Math.hypot(player.x-boss.x,player.y-boss.y)<player.radius+boss.r&&player.invTimer<=0)hurtPlayer(20);}
 // Bullets
 for(let i=bullets.length-1;i>=0;i--){
  const b=bullets[i];b.update();let rm=false;
  for(const e of enemies){if(b.hitTargets.has(e))continue;if(Math.hypot(b.x-e.x,b.y-e.y)<b.r+e.r){e.takeDamage(b.dmg);burst(b.x,b.y,b.color,3);if(b.burn)setTimeout(()=>{if(e.hp>0)e.hp-=4;},800);if(!b.pierce)rm=true;else b.hitTargets.add(e);break;}}
  if(boss&&!boss._defeated&&!qaActive&&Math.hypot(b.x-boss.x,b.y-boss.y)<b.r+boss.r){boss.takeDamage(b.dmg);burst(b.x,b.y,b.color,3);rm=true;}
  if(b.dead())rm=true;if(rm)bullets.splice(i,1);
 }
 for(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];b.update();if(!qaActive&&Math.hypot(b.x-player.x,b.y-player.y)<b.r+player.radius&&player.invTimer<=0){hurtPlayer(b.dmg);burst(b.x,b.y,b.color,5);eBullets.splice(i,1);continue;}if(b.dead())eBullets.splice(i,1);}
 // Auto fire
 if(player.weaponCd>0)player.weaponCd--; else if(!qaActive)autoFire();
 // Coins
 for(let i=coins.length-1;i>=0;i--){const c=coins[i];c.update();if(Math.hypot(player.x-c.x,player.y-c.y)<player.radius+c.r){gold+=1;addText('+1💰',c.x,c.y,'#92400e');updateHUD();coins.splice(i,1);continue;}if(c.y>CH+20)coins.splice(i,1);}
 // Particles & texts
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=p.decay;if(p.life<=0)particles.splice(i,1);}
 for(let i=texts.length-1;i>=0;i--){const t=texts[i];t.y+=t.vy;t.life-=.022;if(t.life<=0)texts.splice(i,1);}
 // DRAW
 ctx.clearRect(0,0,CW,CH);drawBg();
 coins.forEach(c=>c.draw());
 enemies.forEach(e=>e.draw());if(boss&&!boss._defeated)boss.draw();
 drawPlayer();
 bullets.forEach(b=>b.draw());eBullets.forEach(b=>b.draw());
 particles.forEach(p=>{ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();});ctx.globalAlpha=1;
 texts.forEach(t=>{ctx.globalAlpha=Math.max(0,t.life);ctx.fillStyle=t.color;ctx.font='bold '+t.sz+'px sans-serif';ctx.textAlign='center';ctx.fillText(t.t,t.x,t.y);});ctx.globalAlpha=1;ctx.textAlign='left';
 requestAnimationFrame(loop);
}
function reportKill(){window.parent.postMessage({type:'FR_QUEST_KILL'},'*');}
function reportBossKill(){window.parent.postMessage({type:'FR_BOSS_KILLED',gold},'*');}
function goBackToCamp(){window.parent.postMessage({type:'FR_BACK_TO_CAMP',gold},'*');}
function startGame(){
 document.getElementById('startModal').style.display='none';
 setForm(startForm);buildStage(stage);initCharSlots();
 gameRunning=true;last=performance.now();requestAnimationFrame(loop);
}
function restartGame(){
 stage=1;score=0;['gameOverModal','revModal'].forEach(id=>document.getElementById(id).style.display='none');
 setForm(startForm);buildStage(stage);initCharSlots();updateHUD();
 gameRunning=true;last=performance.now();requestAnimationFrame(loop);
}

// Init UI
function initUI(){
 if(PARTNERS.length>0)document.getElementById('partnerPreview').textContent='🤝 夥伴：'+PARTNERS.map(p=>p.name).join('、');
 if(!PARTNERS.length)document.getElementById('charSwitchBar').style.display='none';
 const ff=FOOD_FORMS[startForm]||FOOD_FORMS.normal;
 document.getElementById('startEmoji').textContent=ff.emoji;
 document.getElementById('formBadge').textContent=ff.emoji+' '+ff.name;
 document.getElementById('formPassive').textContent=ff.pIcon+' '+ff.passive;
 updateSkillUI();updateHUD();
}
function safeInit(){if(CW===0||CH===0){requestAnimationFrame(safeInit);return;}initUI();}
requestAnimationFrame(safeInit);
` + frSE + `
</body>
</html>`;

  return (
    <div className="fixed inset-0 z-[10000]" style={{background:'#f5f0e8',overflow:'hidden'}}>
      <iframe
        srcDoc={foodResearchHTML}
        style={{width:'100%',height:'100%',border:'none',display:'block'}}
        sandbox="allow-scripts allow-same-origin"
        onLoad={() => {
          const handler = msg => {
            if (!msg.data) return;
            if (msg.data.type === 'FR_BACK_TO_CAMP') {
              writeSave({ gold: msg.data.gold });
              window.removeEventListener('message', handler);
              setFrPhase('camp');
            }
            if (msg.data.type === 'FR_GOLD_UPDATE') { writeSave({ gold: msg.data.gold }); }
            if (msg.data.type === 'FR_QUEST_KILL') {
              const s2 = loadSave(); const q2 = s2.quests;
              if (q2 && !q2.tasks[0].done) { q2.tasks[0].progress = Math.min(q2.tasks[0].target, (q2.tasks[0].progress||0)+1); writeSave({ quests: q2 }); }
            }
            if (msg.data.type === 'FR_PENALTY_RETURN') {
              writeSave({ gold: 0, equip: { ranged:'初始食材砲', melee:'初始鍋鏟', amulets:['','',''] } });
              window.removeEventListener('message', handler);
              setFrPhase('camp');
            }
            if (msg.data.type === 'FOOD_RESEARCH_BACK') {
              window.removeEventListener('message', handler);
              setSelectedActivity(null);
            }
          };
          window.addEventListener('message', handler);
        }}
      />
    </div>
  );
}
// 營地主畫面
  const FOOD_FORMS_CAMP = {
    normal:{name:'原味型',emoji:'🍙'}, burger:{name:'漢堡型',emoji:'🍔'},
    chili:{name:'辣椒型',emoji:'🌶️'}, tofu:{name:'豆腐型',emoji:'🧆'},
    noodle:{name:'麵條型',emoji:'🍜'}, rice:{name:'炒飯型',emoji:'🍚'},
    ramen:{name:'豚骨型',emoji:'🍲'}, sushi:{name:'壽司型',emoji:'🍣'}, steak:{name:'牛排型',emoji:'🥩'},
  };
  const campSave = loadSave();
  const campGold = campSave.gold || 0;
  const campForm = FOOD_FORMS_CAMP[campSave.equippedForm || 'normal'] || {name:'原味型',emoji:'🍙'};

  const FACILITIES = [
    { id:'training',  emoji:'⚔️', label:'訓練所',   sub:'提升白白能力數值',   color:'#1f6feb' },
    { id:'treasury',  emoji:'🏺', label:'寶庫',     sub:'戰利品與寶箱存放',   color:'#8b5cf6' },
    { id:'shop',      emoji:'🛒', label:'食物商店', sub:'購買食物變身型態',   color:'#f59e0b' },
    { id:'quests',    emoji:'📋', label:'任務板',   sub:'每日三任務領金幣',   color:'#10b981' },
    { id:'gacha',     emoji:'🎰', label:'時空轉蛋', sub:'抽取遠程/近戰武器', color:'#ec4899' },
    { id:'shrine',    emoji:'⛩️', label:'神社',     sub:'祈求護身符',         color:'#6366f1' },
    { id:'equip',     emoji:'🔧', label:'整備所',   sub:'裝備搭配與型態切換', color:'#0ea5e9' },
    { id:'partner_select', emoji:'🚪', label:'營地出口', sub:'出發！選擇夥伴出征', color:'#ef4444', primary:true },
  ];

  // Pre-compute today quest done count
  const todayDone = todayQuests.tasks.filter(t=>t.done).length;

  return (
    <div className="fixed inset-0 z-[10000] flex flex-col page-enter" style={{background:'#0d1117'}}>
      {/* Camp header */}
      <div className="p-4 border-b shrink-0" style={{background:'#161b22', borderColor:'#21262d'}}>
        <div className="flex justify-between items-center">
          <button onClick={() => setSelectedActivity(null)} style={{background:'rgba(255,255,255,.06)', border:'none', borderRadius:'8px', padding:'6px 10px', color:'#8b949e', cursor:'pointer', fontWeight:900}}>✕</button>
          <div className="text-center">
            <div className="font-black text-sm" style={{color:'#fde68a'}}>🏕️ 食研所 · 營地</div>
            <div className="text-[10px] font-bold" style={{color:'#8b949e'}}>白白的休息與整備基地</div>
          </div>
          <div className="text-right">
            <div className="font-black text-sm" style={{color:'#fde047'}}>💰 {campGold}</div>
            <div className="text-[10px]" style={{color:'#8b949e'}}>{campForm.emoji} {campForm.name}</div>
          </div>
        </div>
      </div>

      {/* White-white mascot area */}
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{borderBottom:'1px solid #21262d', background:'#161b22'}}>
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{background:'rgba(31,111,235,.15)', border:'2px solid rgba(31,111,235,.3)'}}>
          {campForm.emoji}
        </div>
        <div>
          <div className="font-black text-sm" style={{color:'#e6edf3'}}>白白</div>
          <div className="text-[10px]" style={{color:'#58a6ff'}}>型態：{campForm.name}</div>
          <div className="text-[10px]" style={{color:'#3fb950'}}>今日任務 {todayDone}/3 完成</div>
        </div>
        <div className="ml-auto text-right">
          <div className="text-[10px]" style={{color:'#8b949e'}}>訓練等級</div>
          {TRAIN_STATS.slice(0,3).map(s=>(
            <div key={s.key} className="text-[9px] font-bold" style={{color:'#58a6ff'}}>{s.label.slice(0,4)} Lv{campSave.training?.[s.key]||0}</div>
          ))}
        </div>
      </div>

      {/* Facility grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
          {FACILITIES.map(f => (
            <div key={f.id}
              onClick={()=>setFrPhase(f.id)}
              style={{
                background: f.primary ? `linear-gradient(135deg,${f.color}cc,${f.color})` : '#161b22',
                border: `1px solid ${f.primary ? f.color : '#21262d'}`,
                borderRadius:'14px', padding:'14px 12px', cursor:'pointer',
                transition:'transform .1s', position:'relative', overflow:'hidden'
              }}
              className="active:scale-95">
              {f.primary && <div style={{position:'absolute',inset:0,background:'linear-gradient(135deg,rgba(255,255,255,.08),transparent)',borderRadius:'14px'}}/>}
              <div style={{fontSize:'26px', marginBottom:'6px'}}>{f.emoji}</div>
              <div style={{fontWeight:900, fontSize:'13px', color: f.primary?'#fff':'#e6edf3', position:'relative'}}>{f.label}</div>
              <div style={{fontSize:'10px', color: f.primary?'rgba(255,255,255,.75)':'#8b949e', marginTop:'2px', position:'relative'}}>{f.sub}</div>
              {f.id==='quests' && todayDone < 3 && (
                <div style={{position:'absolute',top:'8px',right:'8px',width:'18px',height:'18px',borderRadius:'50%',background:'#f85149',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:900,color:'#fff'}}>{3-todayDone}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// 視圖三：靈蛇識食 (貪食蛇主遊戲)
const bossName = config.bossName || '被感染的小雷神';
const bossImgHtml = config.bossImg ? `<img src="${config.bossImg}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 4px solid #ef4444; background: white; box-shadow: 0 4px 10px -1px rgba(0, 0, 0, 0.2);" alt="Boss">` : `<div style="font-size:70px; line-height: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.2));">👿</div>`;
const bgImgHtml = config.bgImg ? `<div class="absolute inset-0 bg-cover bg-center opacity-30 z-0 pointer-events-none" style="background-image: url('${config.bgImg}');"></div>` : `<div class="absolute inset-0 bg-white z-0 pointer-events-none"></div>`;
const safeQuestions = config.questions && config.questions.length > 0 
  ? config.questions.map(item => Array.isArray(item) ? item : [item.q, item.a, item.b, item.c, item.d, item.ansIdx]) 
  : [["請通知行政主廚至後台設定題目！", "知道", "了解", "收到", "明白", 0]];

const scriptStart = "<scr" + "ipt>";
const scriptEnd = "</scr" + "ipt>";

const gameHTML = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script src="https://cdn.tailwindcss.com">` + scriptEnd + `
  <style> 
    body { touch-action: none; overflow: hidden; background: #f8fafc; } 
    @keyframes shake { 0% { transform: translate(-50%, 0); } 25% { transform: translate(-50%, -5px); } 50% { transform: translate(-50%, 5px); } 75% { transform: translate(-50%, -5px); } 100% { transform: translate(-50%, 0); } } 
    .boss-shake { animation: shake 0.2s ease-in-out; } 
  </style>
</head>
<body class="text-gray-800 font-sans h-screen flex flex-col p-1.5 sm:p-2">
  
  <div id="boss-bar-container" class="flex flex-col gap-1 mb-2 shrink-0 bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-slate-200 transition-transform">
    <div class="flex justify-between items-center">
      <div class="font-bold text-slate-700 text-sm">魔王血量: <span id="boss-hp-text" class="text-red-500 text-xl font-black">50</span></div>
      <div class="font-bold text-slate-700 text-sm">生命: <span id="lives-display">❤️❤️❤️</span></div>
    </div>
    <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200 shadow-inner mt-0.5">
      <div id="boss-hp-bar" class="h-full bg-gradient-to-r from-red-500 to-rose-400 transition-all duration-300" style="width: 100%;"></div>
    </div>
    <div class="flex justify-center items-center gap-2 pt-1 min-h-[20px]">
      <span class="text-[10px] font-bold text-slate-400">狀態：</span>
      <span id="buff-shield" style="display:none;" class="text-base drop-shadow-sm" title="防護罩 (抵擋一次傷害)">🛡️</span>
      <span id="buff-helmet" style="display:none;" class="text-base drop-shadow-sm" title="頭盔 (撞牆穿透)">⛑️</span>
      <span id="buff-sword" style="display:none;" class="text-base drop-shadow-sm" title="寶劍 (兩倍傷害)">⚔️</span>
      <span id="buff-wand" style="display:none;" class="text-base drop-shadow-sm" title="魔杖 (減少錯誤選項)">🪄</span>
      <span id="no-buff" class="text-[10px] text-slate-300 font-bold">無裝備</span>
    </div>
  </div>

  <div class="relative mx-auto shrink bg-white rounded-2xl overflow-hidden border-[3px] border-slate-300 shadow-sm" style="aspect-ratio: 1/1; max-height: 55vh; max-width: min(400px, 55vh); width: 100%;">
    ` + bgImgHtml + `
    <canvas id="gameCanvas" width="400" height="400" class="relative z-10 w-full h-full block touch-none"></canvas>
    <div id="flash" class="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-100 z-20"></div>
  </div>

  <div class="w-full max-w-[400px] mx-auto flex flex-col gap-1.5 mt-3 shrink-0">
    <div class="text-[13px] sm:text-sm font-black text-slate-800 bg-white p-2 rounded-xl border border-slate-200 shadow-sm line-clamp-2 leading-snug flex items-start">
      <span class="text-blue-600 mr-1.5 shrink-0 mt-0.5">Q<span id="q-number">1</span>:</span>
      <span id="q-text">問題載入中...</span>
    </div>
    
    <div class="grid grid-cols-2 gap-1.5 text-xs sm:text-[13px] font-bold">
      <div id="opt-a-box" class="border-2 border-blue-300 bg-blue-50 p-1.5 rounded-xl flex items-start gap-2 overflow-hidden transition-all"><span class="w-6 h-6 shrink-0 flex items-center justify-center bg-blue-500 text-white rounded-md mt-0.5">A</span><span id="opt-a" class="break-words whitespace-normal leading-snug">選項A</span></div>
      <div id="opt-b-box" class="border-2 border-yellow-300 bg-yellow-50 p-1.5 rounded-xl flex items-start gap-2 overflow-hidden transition-all"><span class="w-6 h-6 shrink-0 flex items-center justify-center bg-yellow-500 text-white rounded-md mt-0.5">B</span><span id="opt-b" class="break-words whitespace-normal leading-snug">選項B</span></div>
      <div id="opt-c-box" class="border-2 border-purple-300 bg-purple-50 p-1.5 rounded-xl flex items-start gap-2 overflow-hidden transition-all"><span class="w-6 h-6 shrink-0 flex items-center justify-center bg-purple-500 text-white rounded-md mt-0.5">C</span><span id="opt-c" class="break-words whitespace-normal leading-snug">選項C</span></div>
      <div id="opt-d-box" class="border-2 border-orange-300 bg-orange-50 p-1.5 rounded-xl flex items-start gap-2 overflow-hidden transition-all"><span class="w-6 h-6 shrink-0 flex items-center justify-center bg-orange-500 text-white rounded-md mt-0.5">D</span><span id="opt-d" class="break-words whitespace-normal leading-snug">選項D</span></div>
    </div>
  </div>

  <div class="mt-auto pb-4 pt-2 text-center text-[12px] text-slate-400 font-black animate-pulse shrink-0">
    👆 提示：請直接在畫布上「上下左右滑動」控制方向
  </div>

  <div id="modal-start" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white p-6 border-2 border-slate-200 shadow-2xl rounded-3xl max-w-sm w-full text-center max-h-[90vh] overflow-y-auto custom-scrollbar">
      <div class="flex justify-center mb-3">` + bossImgHtml + `</div>
      <h1 class="text-2xl font-black mb-2 text-slate-800">` + bossName + ` 來襲！</h1>
      <div class="text-slate-600 mb-6 text-left text-xs space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100 font-bold leading-relaxed">
        <p>🕹️ <b>操作：</b>請直接在畫布上滑動控制。</p>
        <p>🎯 <b>目標：</b>吃掉與題目相符的正確選項方塊。</p>
        <p class="text-[10px] text-brand-red border-t border-slate-200 pt-2 mt-2">🎁 <b>隨機道具：</b>答對時有機率在場上掉落道具！</p>
        <p class="text-[10px] text-slate-500">❤️愛心：回復生命<br/>🛡️泡泡：抵擋一次傷害<br/>⛑️頭盔：撞牆不會受傷 (該局永久)<br/>⚔️寶劍：兩倍傷害 (該局永久)<br/>🪄魔杖：刪除一個錯誤選項 (該局永久)<br/>📖書本：立即顯示答案<br/>💊減肥藥：大幅縮短身體</p>
      </div>
      <button onclick="startGame()" class="w-full bg-blue-600 active:bg-blue-700 text-white font-black py-4 rounded-2xl text-lg shadow-lg">開始挑戰</button>
    </div>
  </div>
  
  <div id="modal-gameover" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 hidden">
    <div class="bg-white p-8 border-2 border-slate-200 shadow-2xl rounded-3xl max-w-sm w-full text-center">
      <div class="text-6xl mb-4">💥</div>
      <h1 class="text-2xl font-black mb-4 text-slate-800">挑戰結束</h1>
      <div class="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
        <p class="text-slate-500 text-xs font-bold mb-1">本次單場造成傷害</p>
        <p class="text-4xl font-black text-red-600 mb-2"><span id="damage-dealt">0</span> <span class="text-sm text-slate-400">點</span></p>
        <p class="text-[10px] text-slate-400 font-bold border-t pt-2">魔王殘餘血量：<span id="end-boss-hp"></span></p>
      </div>
      <button onclick="startGame()" class="w-full bg-slate-900 active:bg-slate-800 text-white font-black py-4 rounded-2xl text-lg shadow-lg transition-all">再次挑戰</button>
    </div>
  </div>

  <div id="modal-victory" class="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 hidden">
    <div class="bg-white p-8 border-2 border-emerald-400 shadow-2xl rounded-3xl max-w-sm w-full text-center">
      <div class="text-6xl mb-4">🏆</div>
      <h1 class="text-2xl font-black mb-2 text-emerald-600">完美擊殺！</h1>
      <div class="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mb-6">
        <p class="text-emerald-600 text-xs font-bold mb-1">本次單場造成傷害</p>
        <p class="text-4xl font-black text-emerald-600 mb-2">100 <span class="text-sm text-emerald-500">點</span></p>
        <p class="text-[10px] text-emerald-500 font-bold border-t border-emerald-200 pt-2">你成功淨化了小雷神！</p>
      </div>
      <button onclick="startGame()" class="w-full bg-emerald-600 active:bg-emerald-700 text-white font-black py-4 rounded-2xl text-lg shadow-lg">再玩一次</button>
    </div>
  </div>

` + scriptStart + `
const questionsData = ` + JSON.stringify(safeQuestions) + `;
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const GRID_SIZE = 20; const TILE_COUNT = 20; const MAX_BOSS_HP = 100;

let snake = []; let dx = 0, dy = -1; let nextDx = 0, nextDy = -1; let inputLocked = false; 
let bossHP = MAX_BOSS_HP; let lives = 3; let currentQ = 0; let optionsOnBoard = []; 
let projectiles = []; let tickSpeed = 250; let lastTickTime = 0; let isPlaying = false; let animationFrameId;

let hasShield = false; let hasHelmet = false; let hasSword = false; let hasWand = false;
let showAnswerHint = false; let itemsOnBoard = []; let skippedOptionIndex = -1;

let availableQs = [];
function pickNextQuestion() {
  if (availableQs.length === 0) {
    for (let i = 0; i < questionsData.length; i++) availableQs.push(i);
  }
  let rIdx = Math.floor(Math.random() * availableQs.length);
  currentQ = availableQs[rIdx];
  availableQs.splice(rIdx, 1);
}

const COLORS = { snakeHead: '#10b981', snakeBody: '#34d399', gridLines: '#f3f4f6', proj: '#ef4444', opts: ['#3b82f6', '#eab308', '#a855f7', '#f97316'] };

function startGame() {
  document.getElementById('modal-start').classList.add('hidden'); document.getElementById('modal-gameover').classList.add('hidden'); document.getElementById('modal-victory').classList.add('hidden');
  bossHP = MAX_BOSS_HP; lives = 3; tickSpeed = 250; isPlaying = true;
  
  hasShield = false; hasHelmet = false; hasSword = false; hasWand = false; showAnswerHint = false; itemsOnBoard = []; skippedOptionIndex = -1;
  updateBuffUI();

  availableQs = [];
  pickNextQuestion();

  resetBoardState(); updateUI();
  if (animationFrameId) cancelAnimationFrame(animationFrameId);
  lastTickTime = performance.now(); animationFrameId = requestAnimationFrame(gameLoop);
}

function resetBoardState() {
  snake = [{x: 10, y: 16}, {x: 10, y: 17}, {x: 10, y: 18}]; dx = 0; dy = -1; nextDx = 0; nextDy = -1; projectiles = []; spawnOptions();
}

function spawnOptions() {
  optionsOnBoard = []; const letters = ['A', 'B', 'C', 'D'];
  const correctAnsIndex = questionsData[currentQ][5];
  skippedOptionIndex = -1;
  
  if (hasWand) {
    let wrongs = [0, 1, 2, 3].filter(i => i !== correctAnsIndex);
    skippedOptionIndex = wrongs[Math.floor(Math.random() * wrongs.length)];
  }

  for (let i = 0; i < 4; i++) {
    if (i === skippedOptionIndex) continue;

    let pos;
    while (true) {
      pos = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * (TILE_COUNT - 3)) + 3 };
      let conflict = snake.some(s => s.x === pos.x && s.y === pos.y) || optionsOnBoard.some(o => o.x === pos.x && o.y === pos.y) || itemsOnBoard.some(item => item.x === pos.x && item.y === pos.y);
      if (pos.x === snake[0].x + dx && pos.y === snake[0].y + dy) conflict = true;
      if (!conflict) break;
    }
    optionsOnBoard.push({ ...pos, letter: letters[i], index: i });
  }
  updateWandUI();
}

function spawnItem(type) {
  let pos, attempts = 0;
  while (attempts < 100) {
    pos = { x: Math.floor(Math.random() * TILE_COUNT), y: Math.floor(Math.random() * (TILE_COUNT - 3)) + 3 };
    let conflict = snake.some(s => s.x === pos.x && s.y === pos.y) || optionsOnBoard.some(o => o.x === pos.x && o.y === pos.y) || itemsOnBoard.some(i => i.x === pos.x && i.y === pos.y);
    if (pos.x === snake[0].x + dx && pos.y === snake[0].y + dy) conflict = true;
    if (!conflict) break;
    attempts++;
  }
  if (attempts < 100) itemsOnBoard.push({ x: pos.x, y: pos.y, type: type });
}

function applyItemEffect(type) {
  flashScreen('bg-yellow-200'); 
  if (type === 'heart') {
    lives++; updateUI();
  } else if (type === 'shield') {
    hasShield = true; updateBuffUI();
  } else if (type === 'helmet') {
    hasHelmet = true; updateBuffUI();
  } else if (type === 'sword') {
    hasSword = true; updateBuffUI();
  } else if (type === 'wand') {
    if (!hasWand) {
      hasWand = true; updateBuffUI();
      const correctAnsIndex = questionsData[currentQ][5];
      let wrongs = optionsOnBoard.filter(o => o.index !== correctAnsIndex);
      if (wrongs.length > 0) {
        let toRemove = wrongs[Math.floor(Math.random() * wrongs.length)];
        skippedOptionIndex = toRemove.index;
        optionsOnBoard = optionsOnBoard.filter(o => o.index !== skippedOptionIndex);
        updateWandUI();
      }
    }
  } else if (type === 'book') {
    showAnswerHint = true; updateUI();
  } else if (type === 'pill') {
    if (snake.length > 3) snake = snake.slice(0, Math.max(3, snake.length - 5));
  }
}

function gameLoop(currentTime) {
  if (!isPlaying) return;
  if (currentTime - lastTickTime >= tickSpeed) { lastTickTime = currentTime; updateLogic(); }
  drawCanvas(); if (isPlaying) animationFrameId = requestAnimationFrame(gameLoop);
}

function updateLogic() {
  dx = nextDx; dy = nextDy; inputLocked = false; 
  let head = { x: snake[0].x + dx, y: snake[0].y + dy };
  
  if (head.x < 0 || head.x >= TILE_COUNT || head.y < 0 || head.y >= TILE_COUNT) { 
    if (hasHelmet) {
      if (head.x < 0) head.x = TILE_COUNT - 1; else if (head.x >= TILE_COUNT) head.x = 0;
      if (head.y < 0) head.y = TILE_COUNT - 1; else if (head.y >= TILE_COUNT) head.y = 0;
    } else {
      handleDamage("撞牆了！"); return; 
    }
  }

  for (let i = 0; i < snake.length; i++) { if (snake[i].x === head.x && snake[i].y === head.y) { handleDamage("咬到自己了！"); return; } }
  
  let attackChance = 0.05 + ((MAX_BOSS_HP - bossHP) / MAX_BOSS_HP) * 0.15;
  if (Math.random() < attackChance) {
    projectiles.push({ x: Math.floor(Math.random() * TILE_COUNT), y: 0 });
    const bossBar = document.getElementById('boss-bar-container');
    if(bossBar) { bossBar.classList.remove('boss-shake'); void bossBar.offsetWidth; bossBar.classList.add('boss-shake'); }
  }
  
  for (let i = 0; i < projectiles.length; i++) projectiles[i].y += 1;
  projectiles = projectiles.filter(p => p.y < TILE_COUNT);
  
  let hitProjectile = false;
  for (let p of projectiles) {
    if (p.x === head.x && p.y === head.y) hitProjectile = true;
    for (let s of snake) { if (p.x === s.x && p.y === s.y) hitProjectile = true; }
  }
  if (hitProjectile) { handleDamage("被火焰擊中！"); return; }
  
  let hitFoodIndex = -1;
  for (let i = 0; i < optionsOnBoard.length; i++) { if (optionsOnBoard[i].x === head.x && optionsOnBoard[i].y === head.y) { hitFoodIndex = i; break; } }
  
  let hitItemIndex = -1;
  for (let i = 0; i < itemsOnBoard.length; i++) { if (itemsOnBoard[i].x === head.x && itemsOnBoard[i].y === head.y) { hitItemIndex = i; break; } }

  snake.unshift(head);
  
  if (hitFoodIndex !== -1) {
    const correctAnsIndex = questionsData[currentQ][5];
    if (optionsOnBoard[hitFoodIndex].index === correctAnsIndex) { 
      handleCorrectAnswer(); 
    } else { 
      snake.pop(); handleDamage("吃錯了！"); return; 
    }
  } else {
    snake.pop();
    if (hitItemIndex !== -1) {
      let item = itemsOnBoard[hitItemIndex];
      itemsOnBoard.splice(hitItemIndex, 1);
      applyItemEffect(item.type);
    }
  }
}

function handleDamage(reason) {
  if (hasShield) {
    hasShield = false; updateBuffUI(); flashScreen('bg-blue-300'); resetBoardState(); return;
  }

  lives--; updateUI(); flashScreen('bg-red-500');
  if (lives <= 0) { 
    isPlaying = false; 
    const damageDealt = MAX_BOSS_HP - bossHP;
    document.getElementById('end-boss-hp').innerText = bossHP; 
    document.getElementById('damage-dealt').innerText = damageDealt; 
    document.getElementById('modal-gameover').classList.remove('hidden');
    window.parent.postMessage({ type: 'GAME_OVER', score: damageDealt }, '*');
  } else { resetBoardState(); }
}

function handleCorrectAnswer() {
  bossHP -= (hasSword ? 2 : 1); 
  flashScreen('bg-green-500'); tickSpeed = Math.max(125, tickSpeed - 2.5); 
  showAnswerHint = false; 

  const dropRates = { 'heart': 10, 'shield': 10, 'helmet': 10, 'book': 5, 'pill': 5, 'sword': 2, 'wand': 2 };
  let roll = Math.random() * 100;
  let itemToSpawn = null;
  let currentThreshold = 0;
  for (const [item, rate] of Object.entries(dropRates)) {
    currentThreshold += rate;
    if (roll < currentThreshold && rate > 0) {
      itemToSpawn = item; break;
    }
  }
  if (itemToSpawn) spawnItem(itemToSpawn);

  if (bossHP <= 0) { 
    isPlaying = false; updateUI(); 
    document.getElementById('modal-victory').classList.remove('hidden');
    window.parent.postMessage({ type: 'GAME_OVER', score: MAX_BOSS_HP }, '*');
  } else { 
    pickNextQuestion();
    updateUI(); spawnOptions(); 
  }
}

function flashScreen(colorClass) {
  const flash = document.getElementById('flash'); flash.className = \`absolute inset-0 pointer-events-none transition-opacity duration-100 rounded-2xl z-20 \${colorClass}\`; flash.style.opacity = '0.4';
  setTimeout(() => { flash.style.opacity = '0'; }, 150);
}

function drawCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.strokeStyle = COLORS.gridLines; ctx.lineWidth = 1;
  for(let i = 0; i <= TILE_COUNT; i++) {
    ctx.beginPath(); ctx.moveTo(i * GRID_SIZE, 0); ctx.lineTo(i * GRID_SIZE, canvas.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * GRID_SIZE); ctx.lineTo(canvas.width, i * GRID_SIZE); ctx.stroke();
  }
  
  itemsOnBoard.forEach(item => {
    let icon = '';
    if(item.type === 'heart') icon = '❤️'; if(item.type === 'shield') icon = '🛡️';
    if(item.type === 'helmet') icon = '⛑️'; if(item.type === 'book') icon = '📖';
    if(item.type === 'pill') icon = '💊'; if(item.type === 'sword') icon = '⚔️';
    if(item.type === 'wand') icon = '🪄';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.beginPath();
    ctx.arc(item.x * GRID_SIZE + GRID_SIZE/2, item.y * GRID_SIZE + GRID_SIZE/2, GRID_SIZE/2 + 2, 0, Math.PI*2); ctx.fill();
    ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(icon, item.x * GRID_SIZE + GRID_SIZE / 2, item.y * GRID_SIZE + GRID_SIZE / 2 + 2);
  });

  optionsOnBoard.forEach(opt => {
    ctx.fillStyle = COLORS.opts[opt.index]; ctx.beginPath();
    ctx.roundRect(opt.x * GRID_SIZE + 1, opt.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(opt.letter, opt.x * GRID_SIZE + GRID_SIZE / 2, opt.y * GRID_SIZE + GRID_SIZE / 2 + 1);
  });

  snake.forEach((segment, index) => {
    ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snakeBody; ctx.beginPath();
    ctx.roundRect(segment.x * GRID_SIZE + 1, segment.y * GRID_SIZE + 1, GRID_SIZE - 2, GRID_SIZE - 2, 4); ctx.fill();
    if (index === 0) {
      ctx.fillStyle = 'white'; let eye1X, eye1Y, eye2X, eye2Y;
      if (dy === -1) { eye1X = segment.x*GRID_SIZE+6; eye1Y = segment.y*GRID_SIZE+6; eye2X = segment.x*GRID_SIZE+14; eye2Y = segment.y*GRID_SIZE+6; } 
      else if (dy === 1) { eye1X = segment.x*GRID_SIZE+6; eye1Y = segment.y*GRID_SIZE+14; eye2X = segment.x*GRID_SIZE+14; eye2Y = segment.y*GRID_SIZE+14; } 
      else if (dx === -1) { eye1X = segment.x*GRID_SIZE+6; eye1Y = segment.y*GRID_SIZE+6; eye2X = segment.x*GRID_SIZE+6; eye2Y = segment.y*GRID_SIZE+14; } 
      else { eye1X = segment.x*GRID_SIZE+14; eye1Y = segment.y*GRID_SIZE+6; eye2X = segment.x*GRID_SIZE+14; eye2Y = segment.y*GRID_SIZE+14; } 
      ctx.beginPath(); ctx.arc(eye1X, eye1Y, 2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.arc(eye2X, eye2Y, 2, 0, Math.PI*2); ctx.fill();
    }
  });

  ctx.font = '16px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  projectiles.forEach(p => {
    ctx.shadowColor = 'rgba(239, 68, 68, 0.5)'; ctx.shadowBlur = 5; ctx.fillText('🔥', p.x * GRID_SIZE + GRID_SIZE / 2, p.y * GRID_SIZE + GRID_SIZE / 2 + 2); ctx.shadowBlur = 0; 
  });
}

function updateUI() {
  document.getElementById('boss-hp-text').innerText = bossHP;
  let hearts = ''; for(let i = 0; i < 3; i++) hearts += i < lives ? '❤️' : '🖤'; document.getElementById('lives-display').innerText = hearts;
  document.getElementById('boss-hp-bar').style.width = ((bossHP / MAX_BOSS_HP) * 100) + '%';
  
  const qData = questionsData[currentQ];
  document.getElementById('q-number').innerText = "?"; 
  document.getElementById('q-text').innerText = qData[0];
  document.getElementById('opt-a').innerText = qData[1]; document.getElementById('opt-b').innerText = qData[2]; document.getElementById('opt-c').innerText = qData[3]; document.getElementById('opt-d').innerText = qData[4];
  
  const correctAnsIndex = qData[5];
  ['opt-a-box', 'opt-b-box', 'opt-c-box', 'opt-d-box'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if (showAnswerHint && idx === correctAnsIndex) { el.classList.add('ring-4', 'ring-green-500', 'bg-green-100'); } 
    else { el.classList.remove('ring-4', 'ring-green-500', 'bg-green-100'); }
  });
  updateWandUI();
}

function updateBuffUI() {
  document.getElementById('buff-shield').style.display = hasShield ? 'inline-block' : 'none';
  document.getElementById('buff-helmet').style.display = hasHelmet ? 'inline-block' : 'none';
  document.getElementById('buff-sword').style.display = hasSword ? 'inline-block' : 'none';
  document.getElementById('buff-wand').style.display = hasWand ? 'inline-block' : 'none';
  document.getElementById('no-buff').style.display = (!hasShield && !hasHelmet && !hasSword && !hasWand) ? 'inline-block' : 'none';
}

function updateWandUI() {
  ['opt-a-box', 'opt-b-box', 'opt-c-box', 'opt-d-box'].forEach((id, idx) => {
    const el = document.getElementById(id);
    if (idx === skippedOptionIndex) { el.classList.add('opacity-30', 'grayscale'); } 
    else { el.classList.remove('opacity-30', 'grayscale'); }
  });
}

function handleInput(direction) {
  if (inputLocked) return;
  if (direction === 'up' && dy !== 1) { nextDx = 0; nextDy = -1; inputLocked = true; }
  else if (direction === 'down' && dy !== -1) { nextDx = 0; nextDy = 1; inputLocked = true; }
  else if (direction === 'left' && dx !== 1) { nextDx = -1; nextDy = 0; inputLocked = true; }
  else if (direction === 'right' && dx !== -1) { nextDx = 1; nextDy = 0; inputLocked = true; }
}

window.addEventListener('keydown', (e) => {
  if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) e.preventDefault();
  if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') handleInput('up');
  if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') handleInput('down');
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleInput('left');
  if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleInput('right');
});

let touchStartX = 0; let touchStartY = 0;
canvas.addEventListener('touchstart', function(e) { touchStartX = e.changedTouches[0].screenX; touchStartY = e.changedTouches[0].screenY; e.preventDefault(); }, {passive: false});
canvas.addEventListener('touchend', function(e) {
  let deltaX = e.changedTouches[0].screenX - touchStartX;
  let deltaY = e.changedTouches[0].screenY - touchStartY;
  if(Math.abs(deltaX) > Math.abs(deltaY)) { if(Math.abs(deltaX) > 25) handleInput(deltaX > 0 ? 'right' : 'left'); } 
  else { if(Math.abs(deltaY) > 25) handleInput(deltaY > 0 ? 'down' : 'up'); }
  e.preventDefault();
}, {passive: false});
canvas.addEventListener('touchmove', function(e) { e.preventDefault(); }, {passive: false});

` + scriptEnd + `
</body>
</html>
`;

return (
  <div className="fixed inset-0 z-[10000] bg-slate-50 flex flex-col page-enter">
    <div className="p-3 sm:p-4 border-b flex justify-between items-center bg-white shadow-sm shrink-0">
      {/* --- 點擊返回鍵退回到大廳選單，而不是關閉大面板 --- */}
      <button onClick={() => setSelectedActivity(null)} className="p-2 bg-slate-100 rounded-xl active:scale-90 transition-all text-slate-600"><Icon name="chevron-left" /></button>
      <div className="text-center">
        <span className="block text-[10px] text-brand-red font-black uppercase tracking-widest">{currentBranch} 挑戰區</span>
        <span className="font-black text-slate-800 text-base">{bossName}</span>
      </div>
      <button onClick={() => setShowLeaderboard(true)} className="p-2 bg-rose-50 text-brand-red rounded-xl active:scale-90 transition-all shadow-sm">
        <Icon name="flame" size={20} />
      </button>
    </div>
    
    <iframe srcDoc={gameHTML} className="flex-1 w-full border-none bg-slate-50" sandbox="allow-scripts allow-same-origin" />

    {showLeaderboard && (
      <div className="fixed inset-0 z-[20000] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 page-enter" onClick={() => setShowLeaderboard(false)}>
        <div className="bg-white rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl relative" onClick={e => e.stopPropagation()}>
          <button onClick={() => setShowLeaderboard(false)} className="absolute top-6 right-6 text-slate-400 hover:text-brand-red transition-all active:scale-90 bg-slate-100 p-2 rounded-full"><Icon name="x" size={18}/></button>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-rose-50 text-brand-red rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner"><Icon name="flame" size={32} /></div>
            <h2 className="text-2xl font-black text-slate-800">{currentBranch} 戰力榜</h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
            <button onClick={() => setLeaderboardTab('scores')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${leaderboardTab === 'scores' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>歷史高分榜</button>
            <button onClick={() => setLeaderboardTab('employees')} className={`flex-1 py-1.5 text-xs font-black rounded-lg transition-all ${leaderboardTab === 'employees' ? 'bg-white text-brand-red shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>實力排行榜</button>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar pr-2">
            {currentDisplayList.length > 0 ? currentDisplayList.map((player, idx) => (
              <div key={player.id || player.timestamp} className={`flex items-center justify-between p-4 rounded-2xl border shadow-sm ${idx === 0 ? 'bg-rose-50 border-rose-200' : (idx === 1 ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-100')}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-black text-lg w-6 text-center ${idx === 0 ? 'text-brand-red' : (idx === 1 ? 'text-slate-400' : 'text-slate-300')}`}>{idx + 1}</span>
                  <span className="font-bold text-slate-800 text-sm">{player.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-black text-brand-red text-xl">{player.score}</span> <span className="text-[10px] text-slate-400 font-bold">點傷害</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-400 text-xs font-bold bg-slate-50 rounded-3xl border border-dashed">目前尚無挑戰紀錄<br/>快來搶下首殺！</div>
            )}
          </div>
          <button onClick={() => setShowLeaderboard(false)} className="w-full mt-6 bg-slate-900 text-white font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all text-sm">關閉排行榜</button>
        </div>
      </div>
    )}
  </div>
);
};
// --- 限時活動 (遊戲後台) 專屬管理組件 (支援大廳分頁管理版) ---

export default GameCenter

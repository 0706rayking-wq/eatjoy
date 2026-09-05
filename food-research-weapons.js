(function () {
  const rarities = {
    normal: { label: '普通', rate: 65, color: '#94a3b8', glow: 'rgba(148,163,184,.22)' },
    rare: { label: '稀有', rate: 20, color: '#38bdf8', glow: 'rgba(56,189,248,.22)' },
    noble: { label: '高貴', rate: 10, color: '#c084fc', glow: 'rgba(192,132,252,.22)' },
    top: { label: '頂級', rate: 5, color: '#fbbf24', glow: 'rgba(251,191,36,.24)' },
  };

  const ranged = [
    { id:'r01', name:'食材砲', rarity:'normal', icon:0, pattern:'basic', damage:1.00, cooldown:12, size:6, color:'#f59e0b', desc:'左右砲口交替射擊，隨機發射蔬菜、菇類或肉塊食材彈。' },
    { id:'r02', name:'調味料噴射器', rarity:'normal', icon:1, pattern:'fan', damage:.58, cooldown:16, size:5, color:'#fb7185', desc:'噴出五發鹽粒與辛香粉構成的扇形調味霧。' },
    { id:'r03', name:'豌豆連發槍', rarity:'normal', icon:2, pattern:'rapid', damage:.72, cooldown:8, size:4, color:'#84cc16', desc:'高速發射壓縮豌豆彈，以密集節奏持續壓制。' },
    { id:'r04', name:'筷子弩', rarity:'normal', icon:3, pattern:'pierce', damage:1.28, cooldown:16, size:5, color:'#f97316', pierce:true, desc:'射出高速長筷，貫穿敵人並留下木屑軌跡。' },
    { id:'r05', name:'魚丸彈弓', rarity:'normal', icon:4, pattern:'heavy', damage:1.55, cooldown:21, size:9, color:'#fde68a', desc:'拋射沉重魚丸，飛行時拉伸並在命中時產生震圈。' },
    { id:'r06', name:'茶壺水砲', rarity:'normal', icon:5, pattern:'triple', damage:.82, cooldown:16, size:6, color:'#38bdf8', desc:'同時噴出三道波浪水流，命中時濺起水花。' },
    { id:'r07', name:'玉米爆裂砲', rarity:'normal', icon:6, pattern:'popcorn', damage:.55, cooldown:19, size:6, color:'#fde047', desc:'散射三顆旋轉玉米粒，命中後爆成醒目的爆米花。' },
    { id:'r08', name:'蝦殼散彈槍', rarity:'normal', icon:7, pattern:'shotgun', damage:.50, cooldown:22, size:5, color:'#fb923c', desc:'近距離噴出七枚蝦殼碎片，射程短但貼近威力高。' },

    { id:'r09', name:'冷凍光線', rarity:'rare', icon:8, pattern:'freeze', damage:1.05, cooldown:15, size:7, color:'#60a5fa', freeze:150, pierce:true, desc:'凝聚單道高能冰晶光束，貫穿並凍結沿途敵人。' },
    { id:'r10', name:'辣油火焰砲', rarity:'rare', icon:9, pattern:'flame', damage:.78, cooldown:11, size:7, color:'#ef4444', burn:true, desc:'噴出三股不規則辣油火流，使敵人受到灼燒。' },
    { id:'r11', name:'醬汁雷射', rarity:'rare', icon:10, pattern:'laser', damage:1.55, cooldown:21, size:6, color:'#fbbf24', pierce:true, desc:'短暫聚焦後射出高能醬汁光束，貫穿整排敵人。' },
    { id:'r12', name:'起司黏彈槍', rarity:'rare', icon:11, pattern:'sticky', damage:1.42, cooldown:22, size:10, color:'#facc15', homing:true, desc:'大型起司彈追蹤並黏住敵人，延遲後拉絲爆開。' },
    { id:'r13', name:'湯圓迫擊砲', rarity:'rare', icon:12, pattern:'mortar', damage:1.20, cooldown:25, size:11, color:'#e2e8f0', splash:58, desc:'以高拋軌跡射出三顆湯圓，落點產生糯米震波。' },
    { id:'r14', name:'蜂蜜追蹤砲', rarity:'rare', icon:13, pattern:'homing', damage:1.02, cooldown:15, size:7, color:'#f59e0b', homing:true, desc:'兩發蜂蜜彈會自動修正方向追敵。' },

    { id:'r15', name:'黑蒜重力砲', rarity:'noble', icon:14, pattern:'gravity', damage:1.35, cooldown:25, size:13, color:'#111827', gravity:true, pierce:true, desc:'發射大型黑蒜重力核心，旋轉牽引周遭敵人並貫穿前進。' },
    { id:'r16', name:'松露雷霆砲', rarity:'noble', icon:15, pattern:'lightning', damage:1.18, cooldown:17, size:8, color:'#fef08a', chain:true, desc:'發射高速松露雷核，命中時顯示分叉閃電並連鎖敵人。' },
    { id:'r17', name:'龍果星隕砲', rarity:'noble', icon:16, pattern:'meteor', damage:1.25, cooldown:27, size:12, color:'#f43f5e', splash:76, burn:true, desc:'預告落點後從上方降下三顆龍果隕石，造成爆炸與灼燒。' },
    { id:'r18', name:'龍蝦艦隊砲', rarity:'noble', icon:17, pattern:'fleet', damage:.62, cooldown:22, size:7, color:'#fb7185', homing:true, desc:'四枚龍蝦彈先列成艦隊，再依序分散追蹤敵人。' },

    { id:'r19', name:'可可冰棒絕對零度砲', rarity:'top', icon:18, pattern:'absolute', damage:1.85, cooldown:27, size:16, color:'#67e8f9', freeze:220, pierce:true, desc:'蓄積寒氣後發射巨大冰棒光束，留下冰痕並長時間冰封。' },
    { id:'r20', name:'萬味自律浮游砲', rarity:'top', icon:19, pattern:'drones', damage:.85, cooldown:15, size:8, color:'#a78bfa', homing:true, pierce:true, desc:'三枚浮游砲環繞待命，再從不同角度鎖定追擊。' },
    { id:'r21', name:'白白神廚殲星砲', rarity:'top', icon:20, pattern:'star', damage:1.25, cooldown:27, size:12, color:'#fde047', pierce:true, homing:true, desc:'鎖定後依序發射四道神廚光束，追蹤、貫穿並清掃前方。' },
  ];

  const melee = [
    { id:'m01', name:'鍋鏟劍', rarity:'normal', icon:0, pattern:'basic', shape:'arc', arc:100, damage:1.00, cooldown:34, range:90, reflect:1, guardRatio:.72, color:'#cbd5e1', desc:'左右交替橫斬，第三擊改為較強的上挑鍋氣；有效軌跡可反彈普通子彈。' },
    { id:'m02', name:'擀麵棍', rarity:'normal', icon:1, pattern:'knock', shape:'slam', width:40, impact:38, damage:1.35, cooldown:54, range:90, reflect:0, knock:40, color:'#d97706', desc:'短暫舉起後向前重砸，落點產生震波並擊退敵人。' },
    { id:'m03', name:'菜刀', rarity:'normal', icon:2, pattern:'rapid', shape:'arc', arc:60, damage:.72, cooldown:22, range:70, reflect:0, cut:1, guardRatio:.45, color:'#e2e8f0', desc:'快速發動左右二連斬，兩段有效軌跡都能斬除普通子彈。' },
    { id:'m04', name:'炒菜鍋', rarity:'normal', icon:3, pattern:'circle', shape:'ring', inner:24, damage:.82, cooldown:68, range:92, reflect:1, guardRatio:.72, fullCircle:true, color:'#94a3b8', desc:'轉身揮出較慢的全周鍋面橫掃，擋彈時產生清楚的金屬震圈。' },
    { id:'m05', name:'砧板護盾', rarity:'normal', icon:4, pattern:'shield', shape:'thrust', width:80, damage:.72, cooldown:58, range:70, reflect:1, cut:1, guardRatio:1, color:'#a16207', shield:4, desc:'先將砧板架在前方防守，再向前盾擊、推開敵人並處理普通子彈。' },
    { id:'m06', name:'長柄湯勺', rarity:'normal', icon:5, pattern:'long', shape:'thrust', width:26, damage:1.05, cooldown:38, range:140, reflect:0, sweetTip:true, color:'#cbd5e1', desc:'直線長突刺；以勺頭末端命中時造成 30% 額外傷害。' },
    { id:'m07', name:'雙齒烤肉夾', rarity:'normal', icon:6, pattern:'double', shape:'dual', width:20, lane:14, damage:.58, cooldown:30, range:90, reflect:0, cut:1, guardRatio:.5, color:'#f97316', hits:2, desc:'雙軌向前刺出後向內夾擊，兩段軌跡都能斬除普通子彈。' },
    { id:'m08', name:'打蛋器', rarity:'normal', icon:7, pattern:'whirl', shape:'ring', inner:32, damage:.60, cooldown:38, range:82, reflect:0, cut:1, guardRatio:.58, fullCircle:true, color:'#e2e8f0', desc:'短時間持續旋轉並造成四段貼身傷害，可邊移動邊攻擊與斬除普通子彈。' },

    { id:'m09', name:'震肉鎚', rarity:'rare', icon:8, pattern:'stun', shape:'slam', width:46, impact:50, damage:1.62, cooldown:58, range:100, reflect:0, stun:70, color:'#94a3b8', desc:'明顯蓄力後砸裂地面，中心高傷害、外圈震波並使敵人暈眩。' },
    { id:'m10', name:'鋸齒麵包刀', rarity:'rare', icon:9, pattern:'bleed', shape:'arc', arc:70, damage:1.12, cooldown:30, range:100, reflect:0, cut:1, guardRatio:.55, bleed:true, color:'#f59e0b', desc:'向前拉鋸三次，最後一段撕裂敵人並造成流血。' },
    { id:'m11', name:'披薩滾刀', rarity:'rare', icon:10, pattern:'roll', shape:'thrust', width:30, damage:.76, cooldown:34, range:115, reflect:0, cut:1, guardRatio:.5, hits:2, color:'#fb923c', desc:'滾刀沿直線切出再弧線返回，形成去回兩段傷害與擋彈判定。' },
    { id:'m12', name:'寒霜冰雕刀', rarity:'rare', icon:11, pattern:'freeze', shape:'arc', arc:90, damage:1.18, cooldown:34, range:105, reflect:0, cut:1, guardRatio:.7, freeze:130, color:'#60a5fa', desc:'揮出帶有冰晶碎片的寬弧寒霜斬，使命中敵人結冰。' },
    { id:'m13', name:'烈焰鍋鏟', rarity:'rare', icon:12, pattern:'burn', shape:'arc', arc:110, damage:1.22, cooldown:34, range:110, reflect:1, guardRatio:.72, burn:true, color:'#ef4444', desc:'橫掃前方並留下短暫火焰軌跡，使敵人灼燒並反彈普通子彈。' },
    { id:'m14', name:'香腸鎖鏈', rarity:'rare', icon:13, pattern:'chain', shape:'chain', width:18, impact:32, damage:1.08, cooldown:38, range:155, reflect:0, pull:true, color:'#dc2626', desc:'鎖鏈甩出與收回各造成一次傷害，回程會拉回一般敵人。' },

    { id:'m15', name:'磁吸炒鍋', rarity:'noble', icon:14, pattern:'magnet', shape:'ring', inner:35, damage:1.35, cooldown:42, range:115, reflect:1, guardRatio:.95, pull:true, pullPower:1.15, fullCircle:true, color:'#38bdf8', desc:'旋轉吸近敵人與普通子彈，收招時將吸收的子彈向前釋放。' },
    { id:'m16', name:'雷切牛排刀', rarity:'noble', icon:15, pattern:'lightning', shape:'arc', arc:75, damage:1.55, cooldown:30, range:118, reflect:1, guardRatio:.68, chain:true, chainRange:120, chainDamage:.36, color:'#fef08a', desc:'瞬步斜斬並留下雷痕，命中後向附近敵人連鎖雷擊。' },
    { id:'m17', name:'黑蒜虛空刃', rarity:'noble', icon:16, pattern:'void', shape:'arc', arc:140, damage:1.65, cooldown:38, range:130, reflect:0, cut:1, guardRatio:.9, pull:true, pullPower:1.18, color:'#7c3aed', desc:'虛空月牙先穿過敵人，延遲後沿原軌跡裂開造成第二段傷害。' },
    { id:'m18', name:'八腕妖刀', rarity:'noble', icon:17, pattern:'octo', shape:'triple', arc:70, damage:.68, cooldown:34, range:100, reflect:0, cut:1, guardRatio:.8, hits:3, color:'#e879f9', desc:'從四個方向連續斬擊，最後以全周收刀斬結束。' },

    { id:'m19', name:'炎龍廚神刀', rarity:'top', icon:18, pattern:'dragon', shape:'slam', width:58, impact:32, damage:1.95, cooldown:38, range:150, reflect:1, guardRatio:.92, burn:true, burnPower:1.25, color:'#f97316', desc:'先橫斬聚火，再向前劈出龍首烈焰；兩段有效軌跡可反彈普通子彈。' },
    { id:'m20', name:'萬象料理機械臂', rarity:'top', icon:19, pattern:'machine', shape:'dual', width:38, lane:18, damage:1.15, cooldown:34, range:120, reflect:1, cut:1, guardRatio:.82, hits:2, shield:5, supportOnGuardOnly:true, supportCooldown:7000, color:'#38bdf8', desc:'雙臂高速連打後同時重擊，逐拳處理普通子彈；成功擋彈獲得 5 護盾，冷卻 7 秒。' },
    { id:'m21', name:'白白神廚聖鍋', rarity:'top', icon:20, pattern:'holy', shape:'ring', inner:0, damage:1.75, cooldown:42, range:125, reflect:1, cut:1, guardRatio:1, fullCircle:true, heal:3, shield:6, supportOnGuardOnly:true, supportCooldown:10000, color:'#fde68a', desc:'聖鍋旋轉後向外震出全周光環；成功擋彈恢復 3 HP 並獲得 6 護盾，冷卻 10 秒。' },
  ];

  const all = [...ranged, ...melee];
  const map = Object.fromEntries(all.map(item => [item.name, item]));
  map['初始食材砲'] = { ...ranged[0], name:'初始食材砲', icon:0 };
  map['初始鍋鏟'] = { ...melee[0], name:'初始鍋鏟', icon:0 };
  map['辣油火焰炮'] = { ...ranged[9], name:'辣油火焰炮' };

  window.FOOD_RESEARCH_WEAPON_RARITIES = rarities;
  window.FOOD_RESEARCH_RANGED_WEAPONS = ranged;
  window.FOOD_RESEARCH_MELEE_WEAPONS = melee;
  window.FOOD_RESEARCH_WEAPON_MAP = map;

  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify({ ranged, melee }))));
  window.FOOD_RESEARCH_WEAPON_PATCH = String.raw`
;(function(){
 const data=JSON.parse(decodeURIComponent(escape(atob('${encoded}'))));
 const weaponMap={};
 data.ranged.concat(data.melee).forEach(function(w){weaponMap[w.name]=w;});
 weaponMap['初始食材砲']=Object.assign({},data.ranged[0],{name:'初始食材砲'});
 weaponMap['初始鍋鏟']=Object.assign({},data.melee[0],{name:'初始鍋鏟'});
 weaponMap['辣油火焰炮']=Object.assign({},data.ranged[9],{name:'辣油火焰炮'});
 function defFor(type){
  const fallback=type==='ranged'?'初始食材砲':'初始鍋鏟',base=weaponMap[(SAVE.equip||{})[type]||fallback]||weaponMap[fallback];
  if(type==='melee'&&currentForm&&currentForm.id==='octopus_samurai')return Object.assign({},base,{range:Math.round((base.range||90)*1.2),cut:1,frFormCut:true,guardRatio:Math.max(base.guardRatio||0,.72)});
  return base;
 }
 const rarityRank={normal:0,rare:1,noble:2,top:3};
 const weaponFx=[];
 const frLowWeaponFx=!!((navigator.maxTouchPoints||0)>0||(window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)||(navigator.deviceMemory&&navigator.deviceMemory<=4));
 const frWeaponImgs={melee:{},ranged:{}};
 function frWeaponImg(type,index){
  const cache=frWeaponImgs[type],key=String(index);
  if(cache[key])return cache[key];
  const img=new Image();img.decoding='async';
  const folder=type==='melee'?'melee':'ranged-expedition';
  img.src='assets/food-research/weapons/'+folder+'/'+String(Number(index)+1).padStart(2,'0')+'.png?v=4';
  cache[key]=img;return img;
 }
 let frRangedKick=0,frFoodBarrel=-1;
 function drawWeaponImage(img,size,yOffset){
  if(!img.complete||!img.naturalWidth)return false;
  ctx.drawImage(img,-size/2,-size/2+(yOffset||0),size,size);
  return true;
 }
 function meleeVisualScale(){
  if(typeof window.frV2GetMeleeVisualScale!=='function')return 1;
  const scale=Number(window.frV2GetMeleeVisualScale());
  return Number.isFinite(scale)?Math.max(1,Math.min(5,scale)):1;
 }
 function drawRangedWeapon(def){
  if(currentWeapon!=='ranged'||!def)return;
  const rank=rarityRank[def.rarity]||0;
  const kick=Math.max(0,frRangedKick);
  const shake=kick*Math.sin(performance.now()*.12)*.035;
  ctx.save();
  ctx.translate(player.x+13,player.y-7+kick*7);
  ctx.rotate(shake+(jDx||0)*.025);
  ctx.globalAlpha=player.alpha==null?1:player.alpha;
  ctx.imageSmoothingEnabled=true;
  drawWeaponImage(frWeaponImg('ranged',def.icon),54+rank*2,0);
  ctx.restore();
  frRangedKick*=.68;
  if(frRangedKick<.025)frRangedKick=0;
 }
 function meleeMotion(def,p){
  const shape=def.shape||'arc';
  const thrust=shape==='thrust'||shape==='slam'||shape==='dual';
  if(thrust){
   const drive=Math.sin(Math.min(1,p)*Math.PI);
   return {x:0,y:-14-drive*Math.min(56,(def.range||90)*.42),rot:shape==='dual'?.06:0,size:62};
  }
  if(shape==='chain'){
   const drive=Math.sin(Math.min(1,p)*Math.PI);
   return {x:drive*34,y:-10-drive*38,rot:-.72+drive*1.22,size:60};
  }
  if(shape==='ring')return {x:0,y:-4,rot:-1.25+p*Math.PI*2,size:64};
  if(shape==='triple')return {x:0,y:-7,rot:-1.1+(Math.floor(p*3)%3)*1.1+(p*3%1)*.72,size:64};
  return {x:0,y:-7,rot:-1.02+p*2.04,size:64};
 }
 function drawIdleMeleeWeapon(def){
  if(currentWeapon!=='melee'||!def)return;
  const scale=meleeVisualScale(),giant=scale>1;
  ctx.save();ctx.translate(player.x-(giant?5:16),player.y-(giant?8:2));ctx.rotate(-.55);
  ctx.globalAlpha=(player.alpha==null?1:player.alpha)*.9;
  if(giant){ctx.shadowColor=def.color||'#ef4444';ctx.shadowBlur=24;ctx.globalAlpha*=.96;}
  const size=(52+(rarityRank[def.rarity]||0))*scale;
  drawWeaponImage(frWeaponImg('melee',def.icon),size,giant?-size*.32:0);
  ctx.restore();
 }
 function drawActiveMeleeWeapon(anim){
  const def=anim.weapon||defFor('melee'),p=Math.max(0,Math.min(1,anim.progress||0));
  const m=meleeMotion(def,p),rank=rarityRank[def.rarity]||0,scale=meleeVisualScale(),giant=scale>1;
  if((anim.frSide||1)<0){m.x*=-1;m.rot*=-1;}
  ctx.save();ctx.translate(player.x+m.x,player.y+m.y);ctx.rotate(m.rot);
  ctx.globalAlpha=Math.max(.35,1-p*.2);ctx.imageSmoothingEnabled=true;
  if(giant){ctx.shadowColor=def.color||'#ef4444';ctx.shadowBlur=28;}
  const size=(m.size+rank*2)*scale;
  drawWeaponImage(frWeaponImg('melee',def.icon),size,-size*.32);
  ctx.restore();
 }
 function pushWeaponFx(kind,x,y,color,size,life,rarity,pattern,extra){
  const cap=frLowWeaponFx?42:70;
  if(weaponFx.length>=cap)weaponFx.splice(0,weaponFx.length-cap+1);
  weaponFx.push(Object.assign({kind,x,y,color,size,life,age:0,rarity:rarity||'normal',pattern:pattern||'basic',seed:Math.random()*Math.PI*2},extra||{}));
 }
 function spawnMuzzle(def){
  const rank=rarityRank[def.rarity]||0;
  const special=(def.pattern||'basic')!=='basic';
  pushWeaponFx('muzzle',player.x,player.y-25,def.color,18+rank*3,(special?11:7)+rank,def.rarity,def.pattern);
 }
 const frImpactFxAt={};
 function spawnImpact(def,x,y,kind){
  if(kind!=='melee'&&/^(popcorn|fleet|star)$/.test(def.pattern||'')){
   const now=performance.now(),gap=frLowWeaponFx?80:45;
   if(now-(frImpactFxAt[def.pattern]||0)<gap)return;
   frImpactFxAt[def.pattern]=now;
  }
  const rank=rarityRank[def.rarity]||0;
  const longFx=/^(flame|gravity|sticky|meteor|absolute|drones|star)$/.test(def.pattern||'');
  const life=longFx?22:def.pattern==='mortar'?18:11+rank*2;
  pushWeaponFx(kind==='melee'?'meleeImpact':'impact',x,y,def.color,15+rank*4,life,def.rarity,def.pattern,{range:def.splash||0,ingredient:def.ingredient});
 }
 function frWeaponFxPolygon(sides,radius,rotation){
  ctx.beginPath();
  for(let i=0;i<sides;i++){const a=(rotation||0)+i*Math.PI*2/sides,x=Math.cos(a)*radius,y=Math.sin(a)*radius;if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}
  ctx.closePath();
 }
 function frWeaponFxBolt(x1,y1,x2,y2,segments,jitter,seed){
  ctx.beginPath();ctx.moveTo(x1,y1);
  for(let i=1;i<segments;i++){const t=i/segments,off=Math.sin((seed||0)+i*5.17)*jitter;ctx.lineTo(x1+(x2-x1)*t+off,y1+(y2-y1)*t+off*.35);}
  ctx.lineTo(x2,y2);ctx.stroke();
 }
 function drawWeaponFx(){
  for(let i=weaponFx.length-1;i>=0;i--){
   const f=weaponFx[i],p=f.age/f.life,ease=1-Math.pow(1-Math.min(1,p),2),rank=rarityRank[f.rarity]||0;
   ctx.save();ctx.translate(f.x,f.y);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
   if(f.kind==='target'){
    ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.max(0,1-p)*.78;ctx.strokeStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=8;ctx.lineWidth=2;
    const rr=(f.range||48)*(1-.46*ease);ctx.setLineDash([6,5]);ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=(1-p)*.28;ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(0,0,rr*.68,0,Math.PI*2);ctx.fill();
   }else if(f.kind==='lock'){
    ctx.globalAlpha=Math.max(0,1-p)*.72;ctx.strokeStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=8;ctx.lineWidth=1.5;ctx.setLineDash([7,6]);
    ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo((f.tx||f.x)-f.x,(f.ty||0)-f.y);ctx.stroke();ctx.setLineDash([]);
    const ex=(f.tx||f.x)-f.x,ey=(f.ty||0)-f.y;ctx.beginPath();ctx.arc(ex,ey,9-ease*4,0,Math.PI*2);ctx.stroke();
   }else if(f.kind==='charge'){
    ctx.globalAlpha=Math.max(0,1-p)*.82;ctx.strokeStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=13;ctx.lineWidth=2.5;
    for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,f.size*(1.2-ease*.72)+k*8,f.seed+k+ease*5,f.seed+k+ease*5+Math.PI*1.35);ctx.stroke();}
    ctx.fillStyle='rgba(255,255,255,'+Math.min(.8,ease)+')';ctx.beginPath();ctx.arc(0,0,3+ease*7,0,Math.PI*2);ctx.fill();
   }else if(f.kind==='chain'){
    ctx.globalAlpha=Math.max(0,1-p);ctx.strokeStyle='#fef9c3';ctx.lineWidth=5-p*3;ctx.shadowColor='#facc15';ctx.shadowBlur=12;
    frWeaponFxBolt(0,0,(f.tx||f.x)-f.x,(f.ty||f.y)-f.y,7,7,f.seed+f.age*.8);
    ctx.strokeStyle='#f59e0b';ctx.lineWidth=1.5;frWeaponFxBolt(0,0,(f.tx||f.x)-f.x,(f.ty||f.y)-f.y,8,11,f.seed+1.7+f.age);
   }else if(f.kind==='meleeSignature'){
    const alpha=Math.max(0,1-p),range=f.range||90,shape=f.shape||'arc',center=(f.center||0)*Math.PI/180,arc=(f.arc||90)*Math.PI/180;
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=alpha*.82;ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=10;ctx.lineWidth=3+rank;
    if(shape==='ring'){
     const rr=Math.max(18,range*(.35+ease*.65));ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
     ctx.globalAlpha=alpha*.25;ctx.lineWidth=Math.max(8,range*.13);ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
    }else if(shape==='slam'){
     const endY=-range;ctx.lineWidth=Math.max(7,(f.width||42)*.25);ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(0,endY);ctx.stroke();
     ctx.globalAlpha=alpha*.65;ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,endY,(f.impact||38)*(1+ease*.35),(f.impact||38)*(.35+ease*.22),0,0,Math.PI*2);ctx.stroke();
     for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*7,endY);ctx.lineTo(k*15,endY-10-Math.abs(k)*4);ctx.stroke();}
    }else if(shape==='thrust'||shape==='dual'){
     const lanes=shape==='dual'?[-(f.lane||14),(f.lane||14)]:[0];ctx.lineWidth=Math.max(5,(f.width||28)*.22);
     lanes.forEach(function(x){ctx.beginPath();ctx.moveTo(x,-8);ctx.lineTo(x,-range);ctx.stroke();ctx.beginPath();ctx.arc(x,-range,6+rank*2,0,Math.PI*2);ctx.stroke();});
    }else if(shape==='chain'){
     const bend=(f.side||1)*range*.3;ctx.setLineDash([7,5]);ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(bend,-range*.5,0,-range);ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(0,-range,f.impact||30,0,Math.PI*2);ctx.stroke();
    }else{
     const start=-Math.PI/2+center-arc/2,end=start+arc;ctx.lineWidth=8+rank*1.5;ctx.beginPath();ctx.arc(0,0,range,start,end);ctx.stroke();
     ctx.globalAlpha=alpha*.5;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,Math.max(12,range-6),start,end);ctx.stroke();
    }
    if(f.pattern==='shield'){
     ctx.globalCompositeOperation='source-over';ctx.globalAlpha=alpha*.24;ctx.fillStyle='#fef3c7';ctx.beginPath();ctx.arc(0,-18,Math.min(range,78),Math.PI,Math.PI*2);ctx.lineTo(0,-18);ctx.closePath();ctx.fill();
     ctx.globalAlpha=alpha*.9;ctx.strokeStyle='#fde68a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,-18,Math.min(range,78),Math.PI,Math.PI*2);ctx.stroke();
    }else if(f.phase==='uppercut'){
     ctx.strokeStyle='#f8fafc';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-range*.3,-8);ctx.quadraticCurveTo(0,-range*.75,range*.28,-range);ctx.stroke();
    }else if(f.pattern==='bleed'){
     ctx.strokeStyle='#fecaca';ctx.lineWidth=2;for(let k=0;k<6;k++){const x=-range*.35+k*range*.14;ctx.beginPath();ctx.moveTo(x,-range*.6);ctx.lineTo(x+8,-range*.78);ctx.stroke();}
    }else if(f.pattern==='freeze'){
     ctx.strokeStyle='#e0f2fe';ctx.lineWidth=2;for(let k=-2;k<=2;k++){const a=-Math.PI/2+center+k*.16;ctx.beginPath();ctx.moveTo(Math.cos(a)*range*.72,Math.sin(a)*range*.72);ctx.lineTo(Math.cos(a)*range*1.05,Math.sin(a)*range*1.05);ctx.stroke();}
    }else if(f.pattern==='burn'||f.pattern==='dragon'){
     ctx.strokeStyle='#facc15';ctx.lineWidth=4;for(let k=-2;k<=2;k++){const x=k*10+(f.side||1)*Math.sin(f.age+k)*5;ctx.beginPath();ctx.moveTo(x,-18);ctx.quadraticCurveTo(x+(f.side||1)*14,-range*.55,x*1.5,-range);ctx.stroke();}
    }else if(f.pattern==='lightning'){
     ctx.strokeStyle='#fff7ae';ctx.lineWidth=3;frWeaponFxBolt(0,-10,(f.side||1)*range*.25,-range,7,8,f.seed+f.age);
    }else if(f.pattern==='void'){
     ctx.strokeStyle='#c4b5fd';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,-range*.28,range*.72,-Math.PI*.88,-Math.PI*.12);ctx.stroke();
    }else if(f.pattern==='machine'){
     ctx.fillStyle='#bae6fd';ctx.globalAlpha=alpha*.55;ctx.beginPath();ctx.arc((f.side||1)*18,-range*.72,12+ease*12,0,Math.PI*2);ctx.fill();
    }else if(f.pattern==='holy'){
     ctx.strokeStyle='#fff7ae';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,range*(.55+ease*.55),0,Math.PI*2);ctx.stroke();
    }else if(f.pattern==='magnet'){
     ctx.strokeStyle='#7dd3fc';ctx.lineWidth=2;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,range*(.35+k*.2),f.seed+ease*4+k,f.seed+ease*4+k+Math.PI*1.25);ctx.stroke();}
    }else if(f.pattern==='roll'){
     ctx.strokeStyle='#fed7aa';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-range*(f.returning?.35:.85),14+rank*2,0,Math.PI*2);ctx.stroke();
    }
   }else if(f.kind==='muzzle'){
    ctx.globalAlpha=Math.max(0,1-p)*.78;ctx.strokeStyle=f.color;ctx.lineWidth=2+rank*.5;
    if(f.pattern==='gravity'){
     ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#a78bfa';ctx.shadowColor='#7c3aed';ctx.shadowBlur=12;
     for(let k=0;k<3;k++){ctx.globalAlpha=(1-p)*(.6-k*.12);ctx.lineWidth=3-k*.6;ctx.beginPath();ctx.arc(0,0,f.size*(1.3-ease*.85)+k*7,f.seed-ease*4+k,f.seed-ease*4+k+Math.PI*1.45);ctx.stroke();}
    }else if(f.pattern==='lightning'){
     ctx.strokeStyle='#fff7ae';ctx.shadowColor='#facc15';ctx.shadowBlur=10;
     for(let k=-1;k<=1;k++)frWeaponFxBolt(k*4,4,k*7,-f.size-ease*10,5,4,f.seed+k);
    }else if(f.pattern==='freeze'){
     ctx.strokeStyle='#e0f2fe';ctx.shadowColor='#38bdf8';ctx.shadowBlur=9;
     ctx.beginPath();ctx.arc(0,0,f.size*(.35+ease*.7),0,Math.PI*2);ctx.stroke();
     for(let k=-2;k<=2;k++){const a=-Math.PI/2+k*.18;ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a)*(f.size+ease*13),Math.sin(a)*(f.size+ease*13));ctx.stroke();}
    }else if(f.pattern==='flame'){
     for(let k=-2;k<=2;k++){const a=-Math.PI/2+k*.18,len=f.size*(.7+ease*.9)*(1-Math.abs(k)*.08);ctx.strokeStyle=k%2?'#facc15':'#fb7185';ctx.lineWidth=4-Math.abs(k)*.45;ctx.beginPath();ctx.moveTo(k*3,3);ctx.quadraticCurveTo(k*6,-len*.45+Math.sin(f.age+k)*4,Math.sin(a)*len*.18+Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();}
    }else if(f.pattern==='mortar'){
     ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(241,245,249,'+(1-p)*.55+')';
     for(let k=0;k<5;k++){const a=f.seed+k*Math.PI*2/5,rr=5+ease*13;ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,5+rank,0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='homing'){
     ctx.fillStyle='#fbbf24';for(let k=-1;k<=1;k++){ctx.save();ctx.translate(k*8,-ease*(13+Math.abs(k)*4));ctx.rotate(k*.35);ctx.beginPath();ctx.moveTo(0,-7);ctx.quadraticCurveTo(6,1,0,8);ctx.quadraticCurveTo(-6,1,0,-7);ctx.fill();ctx.restore();}
    }else if(f.pattern==='fan'){
     const colors=['#f8fafc','#fb7185','#fbbf24'];for(let k=-2;k<=2;k++){const a=-Math.PI/2+k*.22,rr=6+ease*(18+Math.abs(k)*4);ctx.fillStyle=colors[(k+5)%3];ctx.globalAlpha=(1-p)*(.48+Math.abs(k)*.06);ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,2.5+Math.abs(k)*.35,0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='rapid'){
     ctx.strokeStyle='#d9f99d';ctx.shadowColor='#84cc16';ctx.shadowBlur=8;for(let k=-1;k<=1;k++){ctx.lineWidth=3-Math.abs(k);ctx.beginPath();ctx.moveTo(k*4,3);ctx.lineTo(k*7,-10-ease*18);ctx.stroke();}
    }else if(f.pattern==='pierce'){
     ctx.strokeStyle='#fed7aa';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(-13,2);ctx.lineTo(13,2);ctx.stroke();ctx.beginPath();ctx.moveTo(-10,6);ctx.lineTo(0,-10-ease*12);ctx.lineTo(10,6);ctx.stroke();
    }else if(f.pattern==='heavy'){
     ctx.strokeStyle='#fef3c7';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,2,8+ease*10,Math.PI*.2,Math.PI*.8);ctx.stroke();ctx.beginPath();ctx.moveTo(-8,7);ctx.lineTo(0,-8-ease*10);ctx.lineTo(8,7);ctx.stroke();
    }else if(f.pattern==='triple'){
     ctx.strokeStyle='#bae6fd';ctx.shadowColor='#38bdf8';ctx.shadowBlur=7;for(let k=-1;k<=1;k++){ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(k*7,4);ctx.quadraticCurveTo(k*10+Math.sin(f.age+k)*3,-8,k*11,-18-ease*12);ctx.stroke();}
    }else if(f.pattern==='popcorn'){
     ctx.fillStyle='#fde68a';for(let k=0;k<4;k++){const a=f.seed+k*Math.PI/2,rr=5+ease*16;ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,2.5+(k%2),0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='shotgun'){
     ctx.strokeStyle='#fdba74';ctx.shadowColor='#f97316';ctx.shadowBlur=8;for(let k=-3;k<=3;k++){const a=-Math.PI/2+k*.15;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,3);ctx.lineTo(Math.cos(a)*(12+ease*18),Math.sin(a)*(12+ease*18));ctx.stroke();}
    }else if(f.pattern==='laser'||f.pattern==='star'){
     ctx.strokeStyle=f.pattern==='star'?'#fef9c3':'#fde68a';ctx.shadowColor=f.color;ctx.shadowBlur=f.pattern==='star'?7:12;ctx.lineWidth=f.pattern==='star'?2+rank*.5:3+rank;ctx.beginPath();ctx.moveTo(0,5);ctx.lineTo(0,-22-ease*(f.pattern==='star'?20:26));ctx.stroke();
    }else if(f.pattern==='sticky'){
     ctx.fillStyle='#facc15';for(let k=-1;k<=1;k++){ctx.beginPath();ctx.ellipse(k*7,-7-ease*(9+Math.abs(k)*5),4,7,0,0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='meteor'){
     ctx.strokeStyle='#fb7185';ctx.lineWidth=3;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*9,5);ctx.lineTo(k*13,-14-ease*18);ctx.stroke();}
    }else if(f.pattern==='fleet'||f.pattern==='drones'){
     const count=f.pattern==='fleet'?2:3;ctx.strokeStyle=f.color;ctx.lineWidth=2;for(let k=0;k<count;k++){const x=(k-(count-1)/2)*12;ctx.beginPath();ctx.arc(x,0,6+ease*7,-Math.PI*.9,-Math.PI*.1);ctx.stroke();}
    }else if(f.pattern==='absolute'){
     ctx.strokeStyle='#e0f2fe';ctx.shadowColor='#67e8f9';ctx.shadowBlur=12;ctx.lineWidth=3;for(let k=-2;k<=2;k++){const a=-Math.PI/2+k*.16;ctx.beginPath();ctx.moveTo(0,2);ctx.lineTo(Math.cos(a)*(18+ease*20),Math.sin(a)*(18+ease*20));ctx.stroke();}
    }else if(f.pattern==='basic'){
     const colors=['#84cc16','#f97316','#fda4af','#f8fafc'];ctx.globalCompositeOperation='source-over';
     for(let k=0;k<9;k++){const a=f.seed+k*Math.PI*2/9,rr=f.size*(.25+ease*(.75+(k%3)*.2));ctx.fillStyle=colors[k%4];ctx.globalAlpha=(1-p)*.72;ctx.save();ctx.translate(Math.cos(a)*rr,Math.sin(a)*rr);ctx.rotate(a+ease*2);ctx.fillRect(-2.5,-1.5,5+(k%2)*2,3);ctx.restore();}
    }else{
     ctx.beginPath();ctx.arc(0,0,f.size*(.35+ease*.55),0,Math.PI*2);ctx.stroke();
     for(let k=-1;k<=1;k++){const a=-Math.PI/2+k*.32;ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a)*(f.size+ease*8),Math.sin(a)*(f.size+ease*8));ctx.stroke();}
    }
   }else{
    ctx.globalAlpha=Math.max(0,1-p)*.82;ctx.strokeStyle=f.color;ctx.lineWidth=f.kind==='meleeImpact'?3+rank:2+rank*.55;
    if(f.pattern==='mortar'){
     const rr=Math.max(f.size*1.5,(f.range||58)*(.28+ease*.72));ctx.strokeStyle='#f8fafc';ctx.lineWidth=3*(1-p)+1;ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.stroke();
     ctx.fillStyle='rgba(255,255,255,'+(1-p)*.42+')';for(let k=0;k<7;k++){const a=f.seed+k*Math.PI*2/7;ctx.beginPath();ctx.arc(Math.cos(a)*rr*.7,Math.sin(a)*rr*.7,3+5*(1-p),0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='homing'){
     ctx.fillStyle='rgba(245,158,11,'+(1-p)*.3+')';ctx.strokeStyle='#fde68a';ctx.lineWidth=2;frWeaponFxPolygon(6,f.size*(.7+ease*.9),Math.PI/6);ctx.fill();ctx.stroke();
     for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.beginPath();ctx.arc(Math.cos(a)*f.size*(.6+ease),Math.sin(a)*f.size*(.6+ease),2.5+2*(1-p),0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='flame'){
     ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(239,68,68,'+(1-p)*.28+')';ctx.strokeStyle='rgba(251,146,60,'+(1-p)*.9+')';ctx.lineWidth=2;
     ctx.beginPath();for(let k=0;k<12;k++){const a=k*Math.PI/6,rr=f.size*(.45+ease*(k%2?1.15:.82));const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
     for(let k=0;k<5;k++){const a=f.seed+k*1.7;ctx.fillStyle=k%2?'#fbbf24':'#fb7185';ctx.beginPath();ctx.arc(Math.cos(a)*f.size*ease,Math.sin(a)*f.size*ease,2.5*(1-p)+1,0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='freeze'){
     ctx.strokeStyle='#e0f2fe';ctx.shadowColor='#38bdf8';ctx.shadowBlur=9;ctx.lineWidth=3*(1-p)+1;
     for(let k=0;k<8;k++){const a=k*Math.PI/4,inner=f.size*.2,outer=f.size*(.65+ease*.9);ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.stroke();}
     ctx.globalAlpha=(1-p)*.35;ctx.fillStyle='#bae6fd';frWeaponFxPolygon(8,f.size*(.35+ease*.5),Math.PI/8);ctx.fill();
    }else if(f.pattern==='gravity'||f.pattern==='void'){
     ctx.globalCompositeOperation='source-over';ctx.shadowColor='#7c3aed';ctx.shadowBlur=14;ctx.strokeStyle='rgba(167,139,250,'+(1-p)*.9+')';
     for(let k=0;k<3;k++){ctx.lineWidth=3-k*.6;ctx.beginPath();ctx.arc(0,0,f.size*(1.8-ease*.95)+k*8,f.seed+ease*5+k,f.seed+ease*5+k+Math.PI*1.45);ctx.stroke();}
     ctx.fillStyle='rgba(15,10,25,'+(1-p)*.7+')';ctx.beginPath();ctx.arc(0,0,f.size*(.85-ease*.28),0,Math.PI*2);ctx.fill();
    }else if(f.pattern==='lightning'){
     ctx.strokeStyle='#fff7ae';ctx.shadowColor='#facc15';ctx.shadowBlur=12;ctx.lineWidth=3*(1-p)+1;
     for(let k=0;k<7;k++){const a=f.seed+k*Math.PI*2/7,len=f.size*(.75+ease*1.2);frWeaponFxBolt(0,0,Math.cos(a)*len,Math.sin(a)*len,4,4,f.seed+k+f.age);}
    }else if(f.pattern==='fan'){
     const colors=['#f8fafc','#fb7185','#fbbf24'];for(let k=0;k<10;k++){const a=f.seed+k*2.4,rr=f.size*(.3+ease*(.7+(k%3)*.22));ctx.fillStyle=colors[k%3];ctx.globalAlpha=(1-p)*.62;ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,1.5+(k%3),0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='rapid'){
     ctx.fillStyle='#bef264';ctx.globalAlpha=(1-p)*.38;ctx.beginPath();ctx.arc(0,0,f.size*(.5+ease),0,Math.PI*2);ctx.fill();ctx.strokeStyle='#d9f99d';for(let k=0;k<5;k++){const a=f.seed+k*Math.PI*2/5;ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a)*f.size*(.8+ease),Math.sin(a)*f.size*(.8+ease));ctx.stroke();}
    }else if(f.pattern==='pierce'){
     ctx.strokeStyle='#fed7aa';ctx.lineWidth=2;for(let k=0;k<7;k++){const a=f.seed+k*.8;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*f.size*(.6+ease*1.2),Math.sin(a)*f.size*(.6+ease*1.2));ctx.stroke();}
    }else if(f.pattern==='heavy'){
     ctx.globalCompositeOperation='source-over';ctx.strokeStyle='#fef3c7';ctx.lineWidth=3*(1-p)+1;ctx.beginPath();ctx.ellipse(0,0,f.size*(.6+ease*1.15),f.size*(.25+ease*.42),0,0,Math.PI*2);ctx.stroke();
    }else if(f.pattern==='triple'){
     ctx.strokeStyle='#e0f2fe';ctx.shadowColor='#38bdf8';ctx.shadowBlur=7;ctx.lineWidth=2.5;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*3,0);ctx.quadraticCurveTo(k*7,-f.size*ease,k*10,-f.size*(.6+ease));ctx.stroke();}
    }else if(f.pattern==='popcorn'){
     ctx.fillStyle='#fef3c7';for(let k=0;k<5;k++){const a=f.seed+k*Math.PI*2/5,rr=f.size*(.35+ease*(.8+(k%2)*.3));ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,2+(k%2)*1.2,0,Math.PI*2);ctx.fill();}
    }else if(f.pattern==='shotgun'){
     ctx.strokeStyle='#fdba74';ctx.lineWidth=2;for(let k=0;k<8;k++){const a=f.seed+k*Math.PI*2/8,len=f.size*(.6+ease*1.5);ctx.beginPath();ctx.moveTo(Math.cos(a)*3,Math.sin(a)*3);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();}
    }else if(f.pattern==='laser'){
     ctx.strokeStyle='#fef3c7';ctx.shadowColor=f.color;ctx.shadowBlur=10;ctx.lineWidth=4*(1-p)+1;ctx.beginPath();ctx.moveTo(-f.size*(.6+ease),0);ctx.lineTo(f.size*(.6+ease),0);ctx.stroke();
    }else if(f.pattern==='sticky'){
     ctx.globalCompositeOperation='source-over';ctx.fillStyle='rgba(250,204,21,'+(1-p)*.45+')';ctx.strokeStyle='#fef08a';ctx.lineWidth=2;ctx.beginPath();for(let k=0;k<12;k++){const a=k*Math.PI/6,rr=f.size*(.5+ease*(k%2?1.25:.85));const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
    }else if(f.pattern==='meteor'){
     ctx.globalCompositeOperation='source-over';const rr=Math.max(f.size*1.5,(f.range||76)*(.25+ease*.75));ctx.fillStyle='rgba(244,63,94,'+(1-p)*.28+')';ctx.strokeStyle='#fda4af';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,rr,0,Math.PI*2);ctx.fill();ctx.stroke();for(let k=0;k<8;k++){const a=f.seed+k*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*rr*.45,Math.sin(a)*rr*.45);ctx.lineTo(Math.cos(a)*rr*1.12,Math.sin(a)*rr*1.12);ctx.stroke();}
    }else if(f.pattern==='fleet'){
     ctx.strokeStyle='#fecdd3';ctx.shadowColor='#fb7185';ctx.shadowBlur=5;for(let k=0;k<4;k++){const a=f.seed+k*Math.PI/2;ctx.beginPath();ctx.arc(Math.cos(a)*f.size*ease,Math.sin(a)*f.size*ease,3.5,0,Math.PI*1.4);ctx.stroke();}
    }else if(f.pattern==='absolute'){
     ctx.strokeStyle='#e0f2fe';ctx.shadowColor='#67e8f9';ctx.shadowBlur=13;ctx.lineWidth=3;for(let k=0;k<12;k++){const a=f.seed+k*Math.PI/6,len=f.size*(.7+ease*1.8);ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();}
    }else if(f.pattern==='drones'){
     ctx.strokeStyle='#ddd6fe';ctx.shadowColor='#8b5cf6';ctx.shadowBlur=10;ctx.lineWidth=2.5;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,f.size*(.5+ease*(.7+k*.28)),f.seed+k*2.1,f.seed+k*2.1+1.25);ctx.stroke();}
    }else if(f.pattern==='star'){
     ctx.strokeStyle='#fff7ae';ctx.shadowColor='#facc15';ctx.shadowBlur=8;ctx.lineWidth=2.5*(1-p)+1;for(let k=0;k<6;k++){const a=-Math.PI/2+k*Math.PI/3,len=f.size*(k%2?1:1.55)*(.45+ease);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();}
    }else if(f.pattern==='basic'){
     const palettes=[['#f97316','#65a30d','#ffedd5'],['#65a30d','#a3e635','#ecfccb'],['#fb7185','#fecdd3','#fff1f2'],['#f8fafc','#d6d3d1','#a8a29e']],colors=palettes[f.ingredient==null?Math.floor(f.seed*10)%4:f.ingredient%4];ctx.globalCompositeOperation='source-over';
     for(let k=0;k<10;k++){const a=f.seed+k*Math.PI*2/10,rr=f.size*(.25+ease*(.8+(k%3)*.22));ctx.fillStyle=colors[k%3];ctx.globalAlpha=(1-p)*.82;ctx.save();ctx.translate(Math.cos(a)*rr,Math.sin(a)*rr);ctx.rotate(a+ease*2.4);ctx.fillRect(-2.5,-1.5,5+(k%2)*2,3+(k%3===0?1:0));ctx.restore();}
    }else{
     ctx.beginPath();ctx.arc(0,0,f.size*(.28+ease*.85),0,Math.PI*2);ctx.stroke();
     const rays=f.kind==='meleeImpact'?6+rank:4+rank*2;
     for(let k=0;k<rays;k++){const a=f.seed+k*Math.PI*2/rays,len=f.size*(.55+ease*.75);ctx.beginPath();ctx.moveTo(Math.cos(a)*f.size*.25,Math.sin(a)*f.size*.25);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();}
    }
   }
   ctx.restore();f.age+=window.FR_FRAME_SCALE||1;
   if(f.age>=f.life)weaponFx.splice(i,1);
  }
 }
 function drawProjectile(b){
  const rank=rarityRank[b.frRarity]||0,pattern=b.frPattern||'basic';
  const maxR=pattern==='absolute'?28:pattern==='meteor'?21:17;
  const scale=pattern==='absolute'?1.3:.72+rank*.055,r=Math.min(maxR,Math.max(3.5,b.r*scale));
  const trail=b.frTrail||[];
  ctx.save();ctx.lineCap='round';
  if(trail.length>1){
   ctx.globalCompositeOperation='source-over';ctx.strokeStyle=b.color;ctx.lineWidth=Math.min(5,Math.max(1.4,r*(pattern==='laser'||pattern==='absolute'?.34:.22)));ctx.globalAlpha=.16+rank*.025;
   if(pattern==='lightning'){
    ctx.strokeStyle='#fde047';ctx.lineWidth=2.4;ctx.shadowColor='#facc15';ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);
    for(let i=1;i<trail.length;i++){const pt=trail[i],jitter=(i===trail.length-1?0:Math.sin(b.age*2.1+i*4.7)*5);ctx.lineTo(pt.x+jitter,pt.y+jitter*.25);}ctx.stroke();
   }else if(pattern==='homing'){
    ctx.strokeStyle='#fbbf24';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++){const pt=trail[i];ctx.lineTo(pt.x+Math.sin(i+b.age*.18)*2.5,pt.y);}ctx.stroke();
    ctx.fillStyle='#fde68a';for(let i=1;i<trail.length;i+=2){ctx.globalAlpha=.18+i/trail.length*.18;ctx.beginPath();ctx.arc(trail[i].x,trail[i].y,1.8,0,Math.PI*2);ctx.fill();}
   }else if(pattern==='freeze'){
    ctx.strokeStyle='#bae6fd';ctx.lineWidth=4;ctx.shadowColor='#38bdf8';ctx.shadowBlur=6;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
    ctx.strokeStyle='#f0f9ff';ctx.lineWidth=1;for(let i=1;i<trail.length;i+=2){const pt=trail[i],s=3+i*.25;ctx.beginPath();ctx.moveTo(pt.x-s,pt.y);ctx.lineTo(pt.x+s,pt.y);ctx.moveTo(pt.x,pt.y-s);ctx.lineTo(pt.x,pt.y+s);ctx.stroke();}
   }else if(pattern==='flame'){
    ctx.strokeStyle='#fb923c';ctx.lineWidth=Math.max(3,r*.65);ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++){const pt=trail[i];ctx.lineTo(pt.x+Math.sin(b.age*.7+i)*3,pt.y);}ctx.stroke();
    ctx.fillStyle='#facc15';for(let i=0;i<trail.length-1;i+=2){const pt=trail[i];ctx.globalAlpha=.24;ctx.beginPath();ctx.arc(pt.x+Math.sin(i+b.age)*5,pt.y,1.5+(i%3),0,Math.PI*2);ctx.fill();}
   }else if(pattern==='gravity'){
    ctx.strokeStyle='rgba(139,92,246,.55)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
   }else if(pattern==='triple'){
    ctx.strokeStyle='#7dd3fc';ctx.lineWidth=Math.max(2,r*.52);ctx.shadowColor='#38bdf8';ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++){const pt=trail[i];ctx.lineTo(pt.x+Math.sin(b.age*.35+i)*2.8,pt.y);}ctx.stroke();
   }else if(pattern==='popcorn'){
    ctx.fillStyle='#fde68a';for(let i=0;i<trail.length;i+=2){const pt=trail[i];ctx.globalAlpha=.12+i/trail.length*.18;ctx.beginPath();ctx.arc(pt.x+Math.sin(i+b.age)*3,pt.y,1.5+(i%3),0,Math.PI*2);ctx.fill();}
   }else if(pattern==='shotgun'){
    ctx.strokeStyle='#fb923c';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
   }else if(pattern==='laser'||pattern==='absolute'||pattern==='star'){
    ctx.strokeStyle=pattern==='absolute'?'#bae6fd':'#fef3c7';ctx.lineWidth=pattern==='absolute'?7:4;ctx.shadowColor=b.color;ctx.shadowBlur=9;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
   }else if(pattern==='sticky'){
    ctx.strokeStyle='#facc15';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++){const pt=trail[i];ctx.quadraticCurveTo(pt.x+Math.sin(i+b.age*.2)*5,pt.y-3,pt.x,pt.y);}ctx.stroke();
   }else if(pattern==='meteor'){
    ctx.strokeStyle='#fb7185';ctx.lineWidth=Math.max(5,r*.72);ctx.shadowColor='#ef4444';ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++){const pt=trail[i];ctx.lineTo(pt.x+Math.sin(i+b.age)*3,pt.y);}ctx.stroke();
   }else if(pattern==='fleet'){
    ctx.strokeStyle='#fb7185';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
   }else if(pattern==='drones'){
    ctx.strokeStyle='#c4b5fd';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++){const pt=trail[i];ctx.lineTo(pt.x+Math.sin(i+b.age*.28)*2,pt.y);}ctx.stroke();
   }else{
    ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
   }
  }
  const mortarLift=pattern==='mortar'?Math.sin(Math.min(1,b.age/58)*Math.PI)*26:pattern==='heavy'?Math.sin(Math.min(1,b.age/48)*Math.PI)*18:0;
  if(pattern==='mortar'||pattern==='heavy'){
   ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.18;ctx.fillStyle='#111827';ctx.beginPath();ctx.ellipse(b.x,b.y+5,r*(1.1-mortarLift/80),r*.42,0,0,Math.PI*2);ctx.fill();
   if(pattern==='mortar'){ctx.globalAlpha=.18;ctx.strokeStyle='#e2e8f0';ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(b.x,b.y,Math.max(8,r*1.4),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
  }
  ctx.globalCompositeOperation=(pattern==='mortar'||pattern==='gravity')?'source-over':'lighter';ctx.translate(b.x,b.y-mortarLift);ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);ctx.shadowColor=b.color;ctx.shadowBlur=3+rank*1.25;ctx.fillStyle=b.color;ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.globalAlpha=.92;
  if(pattern==='freeze'){
   ctx.shadowColor='#38bdf8';ctx.shadowBlur=10;ctx.fillStyle='#7dd3fc';ctx.strokeStyle='#f0f9ff';ctx.lineWidth=1.5;
   ctx.beginPath();ctx.moveTo(0,-r*3.2);ctx.lineTo(r*.82,-r*.35);ctx.lineTo(r*.55,r*1.4);ctx.lineTo(0,r*.8);ctx.lineTo(-r*.55,r*1.4);ctx.lineTo(-r*.82,-r*.35);ctx.closePath();ctx.fill();ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.72)';ctx.beginPath();ctx.moveTo(0,-r*2.45);ctx.lineTo(r*.24,-r*.25);ctx.lineTo(0,r*.42);ctx.lineTo(-r*.24,-r*.25);ctx.closePath();ctx.fill();
  }else if(pattern==='absolute'){
   ctx.shadowColor='#67e8f9';ctx.shadowBlur=16;ctx.fillStyle='#bae6fd';ctx.strokeStyle='#f0f9ff';ctx.lineWidth=2;
   ctx.beginPath();ctx.roundRect(-r*.7,-r*2.1,r*1.4,r*3.15,r*.45);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.62)';ctx.fillRect(-r*.25,-r*1.78,r*.24,r*2.15);ctx.fillStyle='#b45309';ctx.fillRect(-r*.24,r*.94,r*.48,r*.9);
   ctx.strokeStyle='#e0f2fe';ctx.globalAlpha=.7;for(let k=0;k<4;k++){const a=k*Math.PI/2+b.age*.08;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.7,Math.sin(a)*r*.7);ctx.lineTo(Math.cos(a)*r*1.35,Math.sin(a)*r*1.35);ctx.stroke();}
  }else if(pattern==='star'){
   ctx.fillStyle='#facc15';ctx.strokeStyle='#fff7ae';ctx.lineWidth=1.5;ctx.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r*.48:r*1.28;const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(0,0,r*.24,0,Math.PI*2);ctx.fill();
  }else if(pattern==='laser'){
   ctx.shadowColor='#fbbf24';ctx.shadowBlur=12;ctx.fillStyle='#fef3c7';ctx.fillRect(-r*.34,-r*3.4,r*.68,r*5.2);ctx.fillStyle='#fff';ctx.fillRect(-r*.12,-r*3.65,r*.24,r*5.55);ctx.globalAlpha=.5;ctx.strokeStyle='#f59e0b';ctx.strokeRect(-r*.52,-r*3.4,r*1.04,r*5.2);
  }else if(pattern==='pierce'){
   ctx.shadowBlur=4;ctx.fillStyle='#a16207';ctx.strokeStyle='#fed7aa';ctx.lineWidth=1;ctx.beginPath();ctx.roundRect(-r*.25,-r*2.4,r*.5,r*4.2,r*.2);ctx.fill();ctx.stroke();ctx.fillStyle='#fef3c7';ctx.fillRect(-r*.22,-r*2.55,r*.44,r*.42);
  }else if(pattern==='rapid'){
   ctx.fillStyle='#65a30d';ctx.strokeStyle='#d9f99d';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,r*.95,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.72)';ctx.beginPath();ctx.arc(-r*.28,-r*.3,r*.22,0,Math.PI*2);ctx.fill();
  }else if(pattern==='fan'){
   ctx.fillStyle=b.frSpiceColor||b.color;ctx.globalAlpha=.82;for(let k=0;k<3;k++){const a=(b.frSeed||0)+k*2.1;ctx.beginPath();ctx.arc(Math.cos(a)*r*.28,Math.sin(a)*r*.28,r*(.45-k*.05),0,Math.PI*2);ctx.fill();}
  }else if(pattern==='heavy'){
   ctx.fillStyle='#f8fafc';ctx.strokeStyle='#d6d3d1';ctx.lineWidth=1.5;ctx.shadowColor='#fde68a';ctx.shadowBlur=5;ctx.beginPath();ctx.ellipse(0,0,r*(1+Math.sin(b.age*.25)*.08),r*(.9-Math.sin(b.age*.25)*.05),0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#ef4444';ctx.globalAlpha=.5;ctx.beginPath();ctx.arc(-r*.2,-r*.15,r*.13,0,Math.PI*2);ctx.fill();
  }else if(pattern==='triple'){
   ctx.fillStyle='#38bdf8';ctx.strokeStyle='#e0f2fe';ctx.lineWidth=1.3;ctx.shadowColor='#0ea5e9';ctx.shadowBlur=7;ctx.beginPath();ctx.moveTo(0,-r*1.45);ctx.bezierCurveTo(r*.9,-r*.2,r*.7,r*.85,0,r*1.05);ctx.bezierCurveTo(-r*.7,r*.85,-r*.9,-r*.2,0,-r*1.45);ctx.fill();ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.ellipse(-r*.25,-r*.28,r*.16,r*.38,-.4,0,Math.PI*2);ctx.fill();
   ctx.fillRect(-r*.42,-r*1.8,r*.84,r*3.1);ctx.globalAlpha=.72;ctx.strokeRect(-r*.42,-r*1.8,r*.84,r*3.1);
  }else if(pattern==='flame'||b.burn){
   const wobble=Math.sin(b.age*.72+(b.frSeed||0))*r*.22;ctx.fillStyle='#ef4444';ctx.shadowColor='#f97316';ctx.shadowBlur=9;
   ctx.beginPath();ctx.moveTo(wobble,-r*1.75);ctx.bezierCurveTo(r*1.05,-r*.55,r*.75,r*.85,0,r*1.3);ctx.bezierCurveTo(-r*.75,r*.85,-r*1.05,-r*.55,wobble,-r*1.75);ctx.fill();
   ctx.fillStyle='#facc15';ctx.globalAlpha=.8;ctx.beginPath();ctx.moveTo(wobble*.45,-r*1.1);ctx.quadraticCurveTo(r*.4,0,0,r*.62);ctx.quadraticCurveTo(-r*.4,0,wobble*.45,-r*1.1);ctx.fill();
  }else if(pattern==='mortar'){
   ctx.fillStyle='#f8fafc';ctx.strokeStyle='#94a3b8';ctx.lineWidth=1.8;ctx.shadowColor='#fff';ctx.shadowBlur=5;ctx.beginPath();ctx.arc(0,0,r*1.05,0,Math.PI*2);ctx.fill();ctx.stroke();
   ctx.strokeStyle='#cbd5e1';ctx.lineWidth=1;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.arc(0,-r*.18+k*2,r*(.62-Math.abs(k)*.08),Math.PI*1.1,Math.PI*1.9);ctx.stroke();}
   ctx.fillStyle='#64748b';ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(-r*.28,-r*.12,1.2,0,Math.PI*2);ctx.arc(r*.28,-r*.12,1.2,0,Math.PI*2);ctx.fill();
  }else if(pattern==='homing'){
   ctx.fillStyle='#f59e0b';ctx.strokeStyle='#fde68a';ctx.lineWidth=1.4;ctx.shadowColor='#fbbf24';ctx.shadowBlur=8;
   ctx.beginPath();ctx.moveTo(0,-r*1.7);ctx.bezierCurveTo(r*.95,-r*.45,r*.82,r*.9,0,r*1.25);ctx.bezierCurveTo(-r*.82,r*.9,-r*.95,-r*.45,0,-r*1.7);ctx.fill();ctx.stroke();
   ctx.fillStyle='rgba(255,255,255,.72)';ctx.beginPath();ctx.ellipse(-r*.28,-r*.42,r*.16,r*.34,-.35,0,Math.PI*2);ctx.fill();
  }else if(pattern==='sticky'){
   ctx.shadowColor='#facc15';ctx.shadowBlur=9;ctx.fillStyle='#facc15';ctx.strokeStyle='#fef08a';ctx.lineWidth=1.4;ctx.beginPath();for(let k=0;k<12;k++){const a=k*Math.PI/6,rr=r*(k%2?1.08:.82)+Math.sin(b.age*.2+k)*1.2;const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#fef9c3';ctx.globalAlpha=.62;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc((k-1)*r*.35,-r*.12,r*.14,0,Math.PI*2);ctx.fill();}
  }else if(pattern==='meteor'){
   ctx.shadowColor='#ef4444';ctx.shadowBlur=13;ctx.fillStyle='#be123c';ctx.strokeStyle='#fda4af';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#f9a8d4';for(let k=0;k<10;k++){const a=k*Math.PI/5,rr=k%2?r*.45:r*.82;ctx.beginPath();ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,r*.13,0,Math.PI*2);ctx.fill();}ctx.strokeStyle='#fb923c';ctx.lineWidth=3;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*r*.28,r*.7);ctx.lineTo(k*r*.5,r*2.15);ctx.stroke();}
  }else if(pattern==='fleet'){
   ctx.fillStyle='#e11d48';ctx.strokeStyle='#fecdd3';ctx.lineWidth=1.5;ctx.shadowColor='#fb7185';ctx.shadowBlur=8;ctx.beginPath();ctx.ellipse(0,0,r*.72,r*1.15,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.arc(-r*.68,-r*.1,r*.42,-Math.PI*.55,Math.PI*.5);ctx.arc(r*.68,-r*.1,r*.42,Math.PI*.5,Math.PI*1.55);ctx.stroke();ctx.fillStyle='#fff1f2';ctx.beginPath();ctx.arc(0,-r*.4,r*.2,0,Math.PI*2);ctx.fill();
  }else if(pattern==='drones'){
   ctx.fillStyle='#4c1d95';ctx.strokeStyle='#ddd6fe';ctx.lineWidth=1.6;ctx.shadowColor='#8b5cf6';ctx.shadowBlur=10;ctx.beginPath();ctx.moveTo(0,-r*1.15);ctx.lineTo(r, r*.78);ctx.lineTo(0,r*.42);ctx.lineTo(-r,r*.78);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#f5f3ff';ctx.beginPath();ctx.arc(0,0,r*.28,0,Math.PI*2);ctx.fill();
  }else if(pattern==='popcorn'){
   ctx.fillStyle='#fef3c7';ctx.strokeStyle='#facc15';ctx.lineWidth=1;ctx.shadowColor='#fde047';ctx.shadowBlur=6;for(let k=0;k<4;k++){const a=k*Math.PI/2+b.age*.16;ctx.beginPath();ctx.arc(Math.cos(a)*r*.3,Math.sin(a)*r*.3,r*.5,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.ellipse(0,r*.48,r*.28,r*.42,0,0,Math.PI*2);ctx.fill();
  }else if(pattern==='shotgun'){
   ctx.fillStyle='#c2410c';ctx.strokeStyle='#fdba74';ctx.lineWidth=1;ctx.shadowColor='#fb923c';ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(0,-r*1.25);ctx.lineTo(r*.7,r*.8);ctx.lineTo(0,r*.45);ctx.lineTo(-r*.7,r*.8);ctx.closePath();ctx.fill();ctx.stroke();
  }else if(pattern==='gravity'){
   ctx.shadowColor='#7c3aed';ctx.shadowBlur=14;ctx.fillStyle='#090512';ctx.strokeStyle='#a78bfa';ctx.lineWidth=2;
   ctx.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5,rr=r*(k%2?1.02:.78);const x=Math.cos(a)*rr,y=Math.sin(a)*rr;if(k)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.closePath();ctx.fill();ctx.stroke();
   ctx.globalAlpha=.55;for(let k=0;k<3;k++){ctx.strokeStyle=k===1?'#7c3aed':'#c4b5fd';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,r*(1.35+k*.34),b.age*.12+k,b.age*.12+k+Math.PI*1.45);ctx.stroke();}
   ctx.globalAlpha=.12;ctx.strokeStyle='#a78bfa';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,Math.min(42,150*.24),0,Math.PI*2);ctx.stroke();
  }else if(pattern==='lightning'){
   ctx.fillStyle='#3f3210';ctx.strokeStyle='#fde047';ctx.lineWidth=2;ctx.shadowColor='#facc15';ctx.shadowBlur=12;frWeaponFxPolygon(8,r*.95,b.age*.12);ctx.fill();ctx.stroke();
   ctx.fillStyle='#fff7ae';ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,0,r*.38,0,Math.PI*2);ctx.fill();
   ctx.strokeStyle='#fef9c3';ctx.lineWidth=1.8;for(let k=0;k<4;k++){const a=k*Math.PI/2+b.age*.08;frWeaponFxBolt(Math.cos(a)*r*.55,Math.sin(a)*r*.55,Math.cos(a)*r*1.75,Math.sin(a)*r*1.75,3,2,b.age+k);}
  }else if(pattern==='basic'){
   const ingredient=b.frIngredient||0;
   ctx.shadowBlur=5;
   if(ingredient===0){
    ctx.fillStyle='#f97316';ctx.strokeStyle='#ffedd5';ctx.beginPath();ctx.moveTo(0,-r*1.25);ctx.lineTo(r*.62,r*.85);ctx.lineTo(-r*.62,r*.85);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#65a30d';ctx.fillRect(-r*.16,-r*1.55,r*.32,r*.48);
   }else if(ingredient===1){
    ctx.fillStyle='#65a30d';for(let k=0;k<4;k++){const a=k*Math.PI/2+b.age*.05;ctx.beginPath();ctx.arc(Math.cos(a)*r*.34,Math.sin(a)*r*.25-r*.25,r*.48,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#a3e635';ctx.fillRect(-r*.22,r*.05,r*.44,r*.92);
   }else if(ingredient===2){
    ctx.fillStyle='#fb7185';ctx.strokeStyle='#fecdd3';ctx.lineWidth=1.2;ctx.beginPath();ctx.roundRect(-r*.78,-r*.72,r*1.56,r*1.44,r*.35);ctx.fill();ctx.stroke();ctx.strokeStyle='#fff1f2';ctx.beginPath();ctx.moveTo(-r*.4,-r*.18);ctx.lineTo(r*.36,r*.28);ctx.stroke();
   }else{
    ctx.fillStyle='#f8fafc';ctx.strokeStyle='#d6d3d1';ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,-r*.25,r*.82,Math.PI,Math.PI*2);ctx.lineTo(r*.72,0);ctx.lineTo(-r*.72,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d6d3d1';ctx.fillRect(-r*.22,-r*.05,r*.44,r*.92);
   }
  }else{
   ctx.beginPath();ctx.ellipse(0,0,r*.72,r*1.15,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.48;ctx.stroke();
  }
  if(rank>=2){ctx.globalAlpha=.26;ctx.strokeStyle=b.color;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,r*(1.28+Math.sin(b.age*.35)*.08),0,Math.PI*2);ctx.stroke();}
  ctx.restore();
 }
 const oldBulletUpdate=Bullet.prototype.update;
 const oldBulletDraw=Bullet.prototype.draw;
 const oldBulletDead=Bullet.prototype.dead;
 Bullet.prototype.update=function(){
  let held=false;
  if(this.frAttached){
   this.age+=window.FR_FRAME_SCALE||1;held=true;
   const t=this.frAttachedTarget;
   if(t&&t.hp>0){this.x=t.x;this.y=t.y;}
   this.frStickyTimer--;
   if(this.frStickyTimer<=0){
    const damage=this.frStickyDamage||0,range=this.frStickyRange||70;
    for(const e of enemies){if(e&&e.hp>0&&Math.hypot(this.x-e.x,this.y-e.y)<range)e.takeDamage(damage*(e===t ? .45 : .28));}
    if(boss&&!boss._defeated&&Math.hypot(this.x-boss.x,this.y-boss.y)<range)boss.takeDamage(damage*.22);
    spawnImpact({color:this.color,rarity:this.frRarity,pattern:'sticky',splash:range},this.x,this.y,'ranged');
    burst(this.x,this.y,'#facc15',16);this.frAttached=false;this.frDetonated=true;this.frForceDead=true;this.x=-9999;this.y=-9999;
   }
  }else if(this.frHoldFrames&&this.age<this.frHoldFrames){
   this.age+=window.FR_FRAME_SCALE||1;held=true;
   if(this.frHoldType==='drones'){
    const a=(this.frSlot||0)*Math.PI*2/3+this.age*.2,radius=31+Math.sin(this.age*.3+(this.frSlot||0))*3;
    this.x=player.x+Math.cos(a)*radius;this.y=player.y-12+Math.sin(a)*radius*.55;
   }else{
    const slot=this.frSlotOffset==null?(this.frSlot||0)-2.5:this.frSlotOffset;this.x=player.x+slot*13;this.y=player.y-34-Math.abs(slot)*3+Math.sin(this.age*.35+slot)*2;
   }
  }else{
   if(this.frHoldFrames&&!this.frReleased){
    this.frReleased=true;this.homing=!!this.frReleaseHoming;
    const t=findClosest(this.x,this.y,9999),a=t?Math.atan2(t.y-this.y,t.x-this.x):-Math.PI/2,sp=this.frReleaseSpeed||8;
    this.vx=Math.cos(a)*sp;this.vy=Math.sin(a)*sp;
    pushWeaponFx('muzzle',this.x,this.y,this.color,13,8,this.frRarity,this.frPattern);
   }
   if(this.frWave)this.vx+=Math.sin(this.age*.55)*.16;
   oldBulletUpdate.call(this);
  }
  if(this.frVisual){
   if(!this.frTrail)this.frTrail=[];
   this.frTrail.push({x:this.x,y:this.y});
   const specialTrail={fan:5,rapid:5,pierce:7,heavy:5,triple:5,popcorn:2,shotgun:4,freeze:8,flame:6,laser:10,sticky:8,mortar:6,homing:9,gravity:7,lightning:9,meteor:8,fleet:3,absolute:11,drones:10,star:4};
   let trailMax=specialTrail[this.frPattern]||3+(rarityRank[this.frRarity]||0);
   if(frLowWeaponFx&&/^(triple|popcorn|fleet|star)$/.test(this.frPattern))trailMax=Math.max(2,Math.ceil(trailMax*.55));
   if(this.frTrail.length>trailMax)this.frTrail.shift();
  }
  if(held)return;
  const targets=enemies.filter(function(e){return e&&e.hp>0;});
  if(this.frSticky&&!this.frAttached&&!this.frDetonated){
   for(const e of targets){if(!this.hitTargets.has(e)&&Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r+3){
    e.takeDamage(this.dmg*.55);this.frStickyDamage=this.dmg;this.dmg=0;this.frAttached=true;this.frAttachedTarget=e;this.frStickyTimer=36;this.frStickyRange=70;this.pierce=true;this.r=1;this.vx=0;this.vy=0;this.hitTargets.add(e);
    if(!this.frVfxHits)this.frVfxHits=new Set();this.frVfxHits.add(e);spawnImpact({color:this.color,rarity:this.frRarity,pattern:'sticky'},this.x,this.y,'ranged');break;
   }}
  }
  if(this.frVisual){
   if(!this.frVfxHits)this.frVfxHits=new Set();
   for(const e of targets){if(!this.frVfxHits.has(e)&&Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r+3){this.frVfxHits.add(e);spawnImpact({color:this.color,rarity:this.frRarity,pattern:this.frPattern,splash:this.frSplash,ingredient:this.frIngredient},this.x,this.y,'ranged');}}
   if(boss&&!boss._defeated&&!this.frBossVfx&&Math.hypot(this.x-boss.x,this.y-boss.y)<this.r+boss.r){this.frBossVfx=true;spawnImpact({color:this.color,rarity:this.frRarity,pattern:this.frPattern,splash:this.frSplash,ingredient:this.frIngredient},this.x,this.y,'ranged');}
  }
  if(this.frFreeze){
   for(const e of targets){if(!this.hitTargets.has(e)&&Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r+3)e.frozenTimer=Math.max(e.frozenTimer||0,this.frFreeze);}
  }
  if(this.frGravity&&this.age%2===0){
   for(const e of targets){const dx=this.x-e.x,dy=this.y-e.y,d=Math.hypot(dx,dy)||1;if(d<150){e.x+=dx/d*2.2;e.y+=dy/d*2.2;}}
  }
  if(this.frChain&&this.age%12===0&&(this.frChainCount||0)<(this.frChainMax||1)){
   let best=null,bd=this.frChainRange||88;
   for(const e of targets){const d=Math.hypot(this.x-e.x,this.y-e.y);if(d<bd&&!this.frChainHits.has(e)){best=e;bd=d;}}
   if(best){
    this.frChainHits.add(best);this.frChainCount=(this.frChainCount||0)+1;
    best.takeDamage(this.dmg*(this.frChainDamage||.24));
    pushWeaponFx('chain',this.x,this.y,'#fef08a',12,9,'lightning',{tx:best.x,ty:best.y});
    burst(best.x,best.y,'#fef08a',5);
   }
  }
  if(this.frSplash&&!this.frSplashDone){
   for(const e of targets){if(Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r){
    this.frSplashDone=true;
    for(const near of targets){if(near!==e&&Math.hypot(e.x-near.x,e.y-near.y)<this.frSplash)near.takeDamage(this.dmg*.45);}
    burst(this.x,this.y,this.color,14);break;
   }}
  }
 };
 Bullet.prototype.dead=function(){
  return !!this.frForceDead||!!(this.frMaxAge&&this.age>this.frMaxAge)||oldBulletDead.call(this);
 };
 Bullet.prototype.draw=function(){
  if(!this.frVisual){oldBulletDraw.call(this);return;}
  drawProjectile(this);
 };
 function makeShot(def,angle,dmgScale,sizeScale,speedScale){
  const sp=(def.pattern==='heavy'||def.pattern==='mortar'?7:11)*(speedScale||1);
  const am=(window._curAtkMult||atkMult)*(typeof frFormDamageMultiplier==='function'?frFormDamageMultiplier():1),formId=currentForm&&currentForm.id;
  const formSize=formId==='popcorn'?1.55:1,formPierce=formId==='lotus_archer'||formId==='black_garlic_void';
  const b=new Bullet(player.x,player.y-18,Math.cos(angle)*sp,Math.sin(angle)*sp,currentForm.bulletDmg*def.damage*(dmgScale||1)*am,def.color,(def.size||6)*(sizeScale||1)*formSize,!!def.pierce||formPierce,!!def.homing,!!def.burn);
  b.frVisual=true;b.frRarity=def.rarity||'normal';b.frPattern=def.pattern||'basic';b.frFreeze=def.freeze||0;b.frGravity=!!def.gravity;b.frChain=!!def.chain;b.frChainHits=new Set();b.frSplash=def.splash||0;b.frWave=def.pattern==='popcorn';b.frSticky=def.pattern==='sticky';b.frSeed=Math.random()*Math.PI*2;
  if(def.pattern==='shotgun')b.frMaxAge=36;
  if(def.pattern==='lightning'){b.frChain=true;b.frChainRange=135;b.frChainDamage=.28;b.frChainMax=3;}
  if(formId==='lemon_battery'&&Math.random()<.28){b.frChain=true;b.frChainRange=110;b.frChainDamage=.28;b.frChainMax=1;}
  if(formId==='truffle_thunder'){b.frChain=true;b.frChainRange=135;b.frChainDamage=.36;b.frChainMax=3;}
  bullets.push(b);return b;
 }
 function frRangedVolleyAllowed(def){
  const cap={triple:18,popcorn:12,fleet:12,star:9}[def.pattern];
  if(!cap)return true;
  let active=0;
  for(const b of bullets){if(b&&b.frPattern===def.pattern&&!b.frForceDead)active++;}
  return active<cap;
 }
 function shootRanged(def){
  if(!frRangedVolleyAllowed(def))return;
  const up=-Math.PI/2;
  const kick={rapid:.55,fan:.9,heavy:1.65,shotgun:2,laser:1.5,meteor:1.45,absolute:2.2,star:1.8};
  frRangedKick=kick[def.pattern]||1;
  if(def.pattern!=='basic')spawnMuzzle(def);
  if(def.pattern==='basic'){
   frFoodBarrel*=-1;const b=makeShot(def,up+frFoodBarrel*.025,2,1.08,1);b.x+=frFoodBarrel*12;b.frIngredient=Math.floor(Math.random()*4);
   pushWeaponFx('muzzle',b.x,player.y-24,def.color,16,8,def.rarity,def.pattern);
  }
  else if(def.pattern==='fan'){
   const spice=['#f8fafc','#fb7185','#fbbf24','#fb7185','#f8fafc'];for(let i=-2;i<=2;i++){const b=makeShot(def,up+i*.19);b.color=spice[i+2];b.frSpiceColor=spice[i+2];}
  }
  else if(def.pattern==='rapid'){makeShot(def,up,2,1.12,1.28);}
  else if(def.pattern==='pierce'){makeShot(def,up,2,1.08,1.24);}
  else if(def.pattern==='heavy'){makeShot(def,up,2,1.28,.86);}
  else if(def.pattern==='triple'){for(let i=-1;i<=1;i++){const b=makeShot(def,up);b.x+=i*13;b.frWaterLane=i;}}
  else if(def.pattern==='popcorn'){for(let i=-1;i<=1;i++)makeShot(def,up+i*.14+(Math.random()-.5)*.1);}
  else if(def.pattern==='shotgun'){for(let i=-3;i<=3;i++)makeShot(def,up+i*.14);}
  else if(def.pattern==='freeze'){makeShot(def,up,2,1.2,1.08);}
  else if(def.pattern==='flame'){
   [-.13,0,.13].forEach(function(off,i){const b=makeShot(def,up+off+(Math.random()-.5)*.035,.68,i===1?1.08:.92,.82+i*.09);b.frSeed+=i*2.1;});
  }
  else if(def.pattern==='homing'){
   const left=makeShot(def,up-.08),right=makeShot(def,up+.08);left.x-=13;right.x+=13;
  }
  else if(def.pattern==='mortar'){
   for(let i=-1;i<=1;i++){const b=makeShot(def,up+i*.18,1,1,i===0?.86:.92);b.x+=i*16;b.frMortarLane=i;}
  }
  else if(def.pattern==='gravity'){makeShot(def,up,2,1.25,.72);}
  else if(def.pattern==='lightning'){makeShot(def,up,2,1.12,1.22);}
  else if(def.pattern==='laser'){
   pushWeaponFx('charge',player.x,player.y-24,def.color,23,10,def.rarity,def.pattern);
   pushWeaponFx('lock',player.x,player.y-24,def.color,12,10,def.rarity,def.pattern,{tx:player.x,ty:0});
   setTimeout(function(){if(gameRunning)makeShot(def,up,2,1.18,1.3);},120);
  }
  else if(def.pattern==='sticky'){const a=makeShot(def,up-.07),b=makeShot(def,up+.07);a.x-=9;b.x+=9;}
  else if(def.pattern==='meteor'){
   const target=findClosest(player.x,player.y,9999),baseX=target?target.x:player.x,baseY=target?target.y:CH*.28;
   for(let i=-1;i<=1;i++){
    const tx=Math.max(28,Math.min(CW-28,baseX+i*46)),ty=Math.max(55,Math.min(CH*.48,baseY+i*8));
    pushWeaponFx('target',tx,ty,def.color,18,30+i*2,def.rarity,def.pattern,{range:52});
    setTimeout(function(){if(!gameRunning)return;const b=makeShot(def,Math.PI/2,1,1.18,.78);b.x=tx;b.y=-28-Math.abs(i)*12;b.vx=0;b.vy=8;b.homing=false;},(i+1)*90);
   }
  }
  else if(def.pattern==='fleet'){
   for(let i=0;i<4;i++){const b=makeShot(def,up,.9,.9,1);b.frSlot=i;b.frSlotOffset=i-1.5;b.frHoldType='fleet';b.frHoldFrames=8+i*4;b.frReleaseHoming=true;b.frReleaseSpeed=8.8;b.homing=false;b.vx=0;b.vy=0;}
  }
  else if(def.pattern==='absolute'){
   pushWeaponFx('charge',player.x,player.y-25,def.color,34,17,def.rarity,def.pattern);
   setTimeout(function(){if(gameRunning)makeShot(def,up,2,1.35,.82);},240);
  }
  else if(def.pattern==='drones'){
   for(let i=0;i<3;i++){const b=makeShot(def,up,1,1,.85);b.frSlot=i;b.frHoldType='drones';b.frHoldFrames=15+i*3;b.frReleaseHoming=true;b.frReleaseSpeed=8.4;b.homing=false;b.vx=0;b.vy=0;}
  }
  else if(def.pattern==='star'){
   for(let i=0;i<4;i++){
    const offset=i-1.5,tx=player.x+Math.sin(offset*.32)*CW*.42;pushWeaponFx('lock',player.x,player.y-24,def.color,12,17+i,def.rarity,def.pattern,{tx:tx,ty:8});
    setTimeout(function(){if(gameRunning)makeShot(def,up+offset*.13,1,.75,1.12);},130+i*85);
   }
  }
  else {makeShot(def,up-.045);makeShot(def,up+.045);}
 }
 function frPointSegmentDistance(px,py,x1,y1,x2,y2){
  const vx=x2-x1,vy=y2-y1,wx=px-x1,wy=py-y1;
  const len=vx*vx+vy*vy||1,t=Math.max(0,Math.min(1,(wx*vx+wy*vy)/len));
  return Math.hypot(px-(x1+vx*t),py-(y1+vy*t));
 }
 function frSectorHit(side,forward,radius,range,arcDeg,centerDeg){
  const dist=Math.hypot(side,forward),limit=(range||90)+radius;
  if(dist>limit)return false;
  const angle=Math.atan2(side,forward)*180/Math.PI;
  const padding=dist>radius?Math.asin(Math.min(1,radius/dist))*180/Math.PI:90;
  return Math.abs(angle-(centerDeg||0))<=(arcDeg||90)/2+padding;
 }
 function frMeleePointHit(def,x,y,radius){
  const scale=meleeVisualScale(),side=x-player.x,forward=player.y-y,r=Math.max(0,radius||0),shape=def.shape||'arc',range=(def.range||90)*scale;
  if(shape==='arc')return frSectorHit(side,forward,r,range,def.arc||90,def.center||0);
  if(shape==='triple')return [-45,0,45].some(function(center){return frSectorHit(side,forward,r,range,def.arc||70,center);});
  if(shape==='ring'){
   const dist=Math.hypot(side,forward),inner=Math.max(0,def.inner||0);
   return dist<=range+r&&dist>=Math.max(0,inner-r);
  }
  if(shape==='dual'){
   const lane=(def.lane||14)*scale,half=(def.width||24)*scale/2+r;
   return forward>=-r&&forward<=range+r&&(Math.abs(side-lane)<=half||Math.abs(side+lane)<=half);
  }
  if(shape==='chain'){
   const shaft=frPointSegmentDistance(side,forward,0,0,0,range)<=(def.width||18)*scale/2+r;
   return shaft||Math.hypot(side,forward-range)<=(def.impact||28)*scale+r;
  }
  if(shape==='slam'){
   const shaft=frPointSegmentDistance(side,forward,0,8,0,range)<=(def.width||42)*scale/2+r;
   return shaft||Math.hypot(side,forward-range)<=(def.impact||36)*scale+r;
  }
  const half=(def.width||30)*scale/2+r;
  return forward>=-r&&forward<=range+r&&Math.abs(side)<=half;
 }
 function meleeTargetHit(def,t,extra){
  return frMeleePointHit(def,t.x,t.y,(t.r||0)+(extra||0));
 }
 function applyMeleeEffect(def,e,damage){
  const dx=e.x-player.x,dy=e.y-player.y,d=Math.hypot(dx,dy)||1;
  spawnImpact(def,e.x,e.y,'melee');
  if(def.pattern==='knock'){const force=def.knock||30;e.x+=dx/d*force;e.y+=dy/d*force;}
  if(def.pull){const pull=26*(def.pullPower||1);e.x-=dx/d*pull;e.y-=dy/d*pull;}
  if(def.freeze||def.stun)e.frozenTimer=Math.max(e.frozenTimer||0,def.freeze||def.stun||0);
  if(def.burn||def.bleed)setTimeout(function(){if(e.hp>0)e.takeDamage(damage*.22*(def.burnPower||1));},500);
   if(def.chain){for(const n of enemies){if(n!==e&&n.hp>0&&Math.hypot(e.x-n.x,e.y-n.y)<(def.chainRange||90))n.takeDamage(damage*(def.chainDamage||.28));}}
  }
  function frMeleeGuardActive(def,anim){
   return !!(anim&&anim.active&&(def.reflect||def.cut)&&anim.progress<=(def.guardRatio||.65));
  }
  const frMeleeSupportReadyAt={};
  function frTriggerMeleeSupport(def,anim,source){
   if(!anim||anim.supportTriggered||(!def.shield&&!def.heal))return;
   if(def.supportOnGuardOnly&&source!=='guard')return;
   const now=performance.now(),readyAt=frMeleeSupportReadyAt[def.id]||0;
   if(now<readyAt)return;
   anim.supportTriggered=true;
   frMeleeSupportReadyAt[def.id]=now+(def.supportCooldown||0);
   if(def.shield){player.shieldActive=true;player.shieldHp=Math.min(80,(player.shieldHp||0)+def.shield);}
   if(def.heal&&player.hp<player.maxHp){player.hp=Math.min(player.maxHp,player.hp+def.heal);if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;}
   updateHUD();
  }
  function frProcessMeleeGuard(def,anim){
   if(currentWeapon!=='melee'||!frMeleeGuardActive(def,anim))return;
   const am=window._curAtkMult||atkMult,base=currentForm.bulletDmg*def.damage*2.2*am;
   const returnScale=[.45,.55,.65,.75][rarityRank[def.rarity]||0];
   let reflected=0,cut=0;
   for(let i=eBullets.length-1;i>=0;i--){
    const b=eBullets[i];
    if(!b||b.unreflectable||b.frUnreflectable||(b.r||5)>10||!meleeTargetHit(def,b,0))continue;
    const shouldCut=!!def.frFormCut||!!def.cut&&(!def.reflect||(b.r||5)>=8);
    if(!shouldCut&&def.reflect){
     const lobsterBonus=typeof charSlots!=='undefined'&&charSlots.some(function(ch){return ch&&ch.formId==='lobster_general';})?1.4:1;
     const rb=new Bullet(b.x,b.y,-b.vx*1.25,-Math.abs(b.vy)*1.25,base*returnScale*lobsterBonus,def.color,Math.min(9,(b.r||5)+1),false,false,!!def.burn);
     rb.frVisual=true;rb.frRarity=def.rarity||'normal';rb.frPattern='reflect';bullets.push(rb);reflected++;
    }else{
     cut++;
    }
    burst(b.x,b.y,shouldCut?'#f8fafc':def.color,5);
    eBullets.splice(i,1);
   }
   if(reflected||cut){
    frTriggerMeleeSupport(def,anim,'guard');
    const now=performance.now();
    if(now-(anim.lastGuardFxAt||0)>90){
     anim.lastGuardFxAt=now;
     const label=[reflected?'反彈 '+reflected:'',cut?'斬除 '+cut:''].filter(Boolean).join(' / ');
     addText(label,player.x,player.y-34,'#e0f2fe',11,-.45);
     if(window.frSfx)window.frSfx('parry');
    }
   }
  }
  const frMeleeCombo={};
  let frMeleeAttackToken=0;
  function frMeleePlan(def){
   const step=function(delay,scale,extra){return Object.assign({delay:delay,scale:scale,bossScale:scale,effect:true},extra||{});};
   switch(def.pattern){
    case 'basic':{
     const count=(frMeleeCombo[def.id]||0)+1;frMeleeCombo[def.id]=count;
     if(count%3===0)return [step(105,1.2,{shape:'arc',arc:82,center:0,phase:'uppercut'})];
     return [step(45,1,{shape:'arc',arc:72,center:count%2?26:-26,side:count%2?1:-1})];
    }
    case 'knock':return [step(115,1,{shape:'slam',phase:'impact'})];
    case 'rapid':return [step(30,.5,{shape:'arc',arc:62,center:-28,side:-1,effect:false}),step(105,.5,{shape:'arc',arc:62,center:28,side:1})];
    case 'circle':return [step(55,1,{shape:'ring',inner:20})];
    case 'shield':return [step(130,1,{shape:'thrust',width:92,phase:'bash'})];
    case 'long':return [step(60,1,{shape:'thrust',phase:'tip'})];
    case 'double':return [step(35,1,{shape:'dual',side:-1,effect:false}),step(115,1,{shape:'thrust',width:58,side:1,phase:'pinch'})];
    case 'whirl':return [step(25,.25,{shape:'ring',side:1,effect:false}),step(80,.25,{shape:'ring',side:-1,effect:false}),step(135,.25,{shape:'ring',side:1,effect:false}),step(190,.25,{shape:'ring',side:-1})];
    case 'stun':return [step(145,1,{shape:'slam',phase:'impact'})];
    case 'bleed':return [step(25,.33,{shape:'arc',arc:68,center:-20,side:-1,effect:false}),step(85,.33,{shape:'arc',arc:68,center:20,side:1,effect:false}),step(145,.34,{shape:'arc',arc:82,center:0,phase:'finish'})];
    case 'roll':return [step(35,1,{shape:'thrust',width:34,side:1,effect:false}),step(135,1,{shape:'thrust',width:46,side:-1,returning:true})];
    case 'freeze':return [step(60,1,{shape:'arc',arc:100,center:0})];
    case 'burn':return [step(60,1,{shape:'arc',arc:118,center:0})];
    case 'chain':return [step(45,.5,{shape:'chain',side:1,pull:false,effect:false}),step(145,.5,{shape:'chain',side:-1,pull:true,returning:true})];
    case 'magnet':return [step(45,.35,{shape:'ring',pull:true,phase:'gather'}),step(155,.65,{shape:'arc',arc:115,pull:false,phase:'release'})];
    case 'lightning':return [step(48,1,{shape:'arc',arc:78,center:18,side:1})];
    case 'void':return [step(45,.65,{shape:'arc',arc:145,pull:true,side:-1}),step(150,.35,{shape:'arc',arc:145,pull:false,side:1,phase:'tear',effect:false})];
    case 'octo':return [
     step(25,.55,{bossScale:.35,shape:'arc',arc:66,center:-58,side:-1,effect:false}),
     step(80,.55,{bossScale:.35,shape:'arc',arc:66,center:0,side:1,effect:false}),
     step(135,.55,{bossScale:.35,shape:'arc',arc:66,center:58,side:-1,effect:false}),
     step(200,1.35,{bossScale:.95,shape:'ring',inner:0,side:1,phase:'finish'})
    ];
    case 'dragon':return [step(45,.35,{shape:'arc',arc:120,center:0,side:-1,effect:false}),step(155,.65,{shape:'slam',width:70,impact:42,side:1,phase:'dragon'})];
    case 'machine':return [
     step(20,.22,{shape:'thrust',width:34,center:-18,side:-1,effect:false}),step(55,.22,{shape:'thrust',width:34,center:18,side:1,effect:false}),
     step(90,.22,{shape:'thrust',width:34,center:-18,side:-1,effect:false}),step(125,.22,{shape:'thrust',width:34,center:18,side:1,effect:false}),
     step(160,.22,{shape:'thrust',width:40,center:0,side:-1,effect:false}),step(220,.9,{shape:'dual',width:46,lane:22,center:0,side:1,phase:'finish'})
    ];
    case 'holy':return [step(45,.45,{shape:'ring',inner:25,side:1,effect:false}),step(155,.55,{shape:'ring',inner:0,side:-1,phase:'release'})];
    default:return [step(45,1)];
   }
  }
  function frMeleeSignature(def,step){
   const scale=meleeVisualScale();
   pushWeaponFx('meleeSignature',player.x,player.y-7,def.color||'#e2e8f0',18,step.phase==='tear'?18:13,def.rarity,def.pattern,{
    shape:step.shape||def.shape,range:(step.range||def.range||90)*scale,width:(step.width||def.width||30)*scale,impact:(step.impact||def.impact||32)*scale,
    lane:(step.lane||def.lane||14)*scale,arc:step.arc||def.arc||90,center:step.center||0,side:step.side||1,phase:step.phase||'',returning:!!step.returning
   });
  }
  function frMeleeAbsorbProjectiles(def,state){
   const limit=(def.range||115)*meleeVisualScale();state.absorbed=0;
   for(let i=eBullets.length-1;i>=0&&state.absorbed<6;i--){
    const b=eBullets[i];if(!b||b.unreflectable||b.frUnreflectable||(b.r||5)>10||Math.hypot(b.x-player.x,b.y-player.y)>limit)continue;
    burst(b.x,b.y,'#7dd3fc',4);eBullets.splice(i,1);state.absorbed++;
   }
  }
  function frMeleeReleaseProjectiles(def,state,base){
   const count=state.absorbed||0;if(!count)return;
   for(let i=0;i<count;i++){
    const a=-Math.PI/2+(i-(count-1)/2)*.11,b=new Bullet(player.x,player.y-24,Math.cos(a)*9.5,Math.sin(a)*9.5,base*.18,def.color,5,false,false,false);
    b.frVisual=true;b.frRarity=def.rarity||'noble';b.frPattern='reflect';bullets.push(b);
   }
   addText('釋放 '+count,player.x,player.y-36,'#bae6fd',11,-.45);
  }
  function frPerformMeleeStep(def,step,state,token){
   if(!gameRunning||currentWeapon!=='melee'||token!==frMeleeAttackToken||defFor('melee').id!==def.id)return;
   const hitDef=Object.assign({},def,step,{pull:step.pull==null?def.pull:step.pull});
   startSwipe();const anim=swipeAnim;anim.weapon=hitDef;anim.frSide=step.side||1;anim.frPhase=step.phase||'';
   if(def.pattern==='magnet'&&step.phase==='gather')frMeleeAbsorbProjectiles(def,state);
   const am=(window._curAtkMult||atkMult)*(typeof frFormDamageMultiplier==='function'?frFormDamageMultiplier():1),base=currentForm.bulletDmg*def.damage*2.2*am;
   let didHit=false;
   enemies.slice().forEach(function(e){
    if(!e||e.hp<=0||!meleeTargetHit(hitDef,e,8))return;
    didHit=true;let mult=step.scale;
    if(def.sweetTip&&Math.hypot(e.x-player.x,e.y-player.y)>=(def.range||90)*meleeVisualScale()*.68)mult*=1.3;
    e.takeDamage(base*mult);
    if(step.effect!==false)applyMeleeEffect(hitDef,e,base*mult);else spawnImpact(hitDef,e.x,e.y,'melee');
    burst(e.x,e.y,def.color,Math.min(7,3+Math.round(mult*2)));
   });
   if(boss&&!boss._defeated&&meleeTargetHit(hitDef,boss,22)){
    didHit=true;let mult=step.bossScale;
    if(def.sweetTip&&Math.hypot(boss.x-player.x,boss.y-player.y)>=(def.range||90)*meleeVisualScale()*.68)mult*=1.3;
    boss.takeDamage(base*mult);spawnImpact(hitDef,boss.x,boss.y,'melee');
   }
   if(def.pattern==='magnet'&&step.phase==='release')frMeleeReleaseProjectiles(def,state,base);
   frMeleeSignature(hitDef,step);
   if(didHit)frTriggerMeleeSupport(def,anim,'hit');
  }
  function frStartMeleeSequence(def){
   const token=++frMeleeAttackToken,state={},plan=frMeleePlan(def);
   startSwipe();swipeAnim.frPhase='windup';
   plan.forEach(function(step){setTimeout(function(){frPerformMeleeStep(def,step,state,token);},step.delay);});
  }
  function drawMeleeSwipe(anim){
   const d=anim.weapon||defFor('melee'),p=Math.min(1,anim.progress),rank=rarityRank[d.rarity]||0;
   const scale=meleeVisualScale(),range=(d.range||90)*scale,fade=Math.max(0,1-p),color=d.color||'#e2e8f0',shape=d.shape||'arc',guardActive=frMeleeGuardActive(d,anim);
   ctx.save();ctx.translate(player.x,player.y-7);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle=color;
   ctx.shadowColor=guardActive?'#e0f2fe':color;ctx.shadowBlur=guardActive?18:5;
  if(shape==='slam'){
   const drive=Math.sin(p*Math.PI),endY=-range*(.35+drive*.65);ctx.globalAlpha=fade*.78;ctx.lineWidth=Math.max(8,(d.width||42)*scale*.28)+rank*2;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,endY);ctx.stroke();
   ctx.globalAlpha=fade*.56;ctx.lineWidth=3+rank*.5;ctx.beginPath();ctx.arc(0,endY,(d.impact||36)*scale*(.45+drive*.55),0,Math.PI*2);ctx.stroke();
  }else if(shape==='thrust'||shape==='dual'){
   const drive=Math.sin(p*Math.PI),endY=-range*(.28+drive*.72),lanes=shape==='dual'?[-(d.lane||14)*scale,(d.lane||14)*scale]:[0];
   ctx.globalAlpha=fade*.8;ctx.lineWidth=Math.max(5,(d.width||30)*scale*.2)+rank;
   lanes.forEach(function(x){ctx.beginPath();ctx.moveTo(x,-10);ctx.lineTo(x,endY);ctx.stroke();});
   ctx.globalAlpha=fade*.4;ctx.lineWidth=2;lanes.forEach(function(x){ctx.beginPath();ctx.arc(x,endY,8+rank*3,0,Math.PI*2);ctx.stroke();});
  }else if(shape==='chain'){
   const side=anim.frSide||1;ctx.globalAlpha=fade*.78;ctx.lineWidth=4+rank;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(0,-12);ctx.quadraticCurveTo(side*range*.48,-range*.6,side*Math.sin(p*Math.PI)*range*.28,-range);ctx.stroke();ctx.setLineDash([]);
   ctx.globalAlpha=fade*.52;ctx.beginPath();ctx.arc(side*Math.sin(p*Math.PI)*range*.28,-range,(d.impact||28)*scale,0,Math.PI*2);ctx.stroke();
  }else if(shape==='ring'){
   const side=anim.frSide||1,a=-Math.PI/2+side*p*Math.PI*2;ctx.globalAlpha=fade*.68;ctx.lineWidth=8+rank*2;ctx.beginPath();ctx.arc(0,0,range,a-1.15,a+.22);ctx.stroke();
   ctx.globalAlpha=fade*.38;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,Math.max(d.inner||0,range*.72),a-.8,a+.36);ctx.stroke();
  }else if(shape==='triple'){
   const phase=Math.min(2,Math.floor(p*3)),local=(p*3)%1,centers=[-45,0,45],center=-Math.PI/2+centers[phase]*Math.PI/180,arc=(d.arc||70)*Math.PI/180;
   ctx.globalAlpha=fade*.8;ctx.lineWidth=8+rank*1.6;ctx.beginPath();ctx.arc(0,0,range,center-arc/2,center-arc/2+arc*Math.max(.2,local));ctx.stroke();
  }else{
   const arc=(d.arc||90)*Math.PI/180,center=(d.center||0)*Math.PI/180,side=anim.frSide||1,start=-Math.PI/2+center-side*arc/2,end=start+side*arc*Math.max(.18,p);ctx.globalAlpha=fade*.74;ctx.lineWidth=8+rank*1.6;ctx.beginPath();ctx.arc(0,0,range,start,end,side<0);ctx.stroke();
   ctx.globalAlpha=fade*.42;ctx.lineWidth=2.5;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(0,0,Math.max(10,range-5),start,end,side<0);ctx.stroke();
  }
   if(rank>=2&&shape!=='thrust'&&shape!=='dual'&&shape!=='slam'){ctx.globalAlpha=fade*.26;ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,range*(.72+p*.18),-Math.PI*.9,-Math.PI*.1);ctx.stroke();}
   if(guardActive){ctx.shadowBlur=0;ctx.globalAlpha=.62;ctx.strokeStyle='#f8fafc';ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();ctx.arc(0,0,22,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);}
   ctx.restore();
  }
 startSwipe=function(){const d=defFor('melee');swipeAnim={active:true,progress:0,color:d.color||currentForm.bulletColor,r:d.range||128,weapon:d,supportTriggered:false,lastGuardFxAt:0};};
  const oldDrawPlayer=drawPlayer;
  drawPlayer=function(){
   const activeSwipe=swipeAnim.active,storedSwipe=swipeAnim;
   if(activeSwipe&&currentWeapon==='melee')frProcessMeleeGuard(storedSwipe.weapon||defFor('melee'),storedSwipe);
   if(activeSwipe)swipeAnim={active:false};
  if(currentWeapon==='ranged')drawRangedWeapon(defFor('ranged'));
  else if(activeSwipe)drawActiveMeleeWeapon(storedSwipe);
  else drawIdleMeleeWeapon(defFor('melee'));
  oldDrawPlayer();
  if(activeSwipe){swipeAnim=storedSwipe;drawMeleeSwipe(storedSwipe);}
  drawWeaponFx();
 };
 function frMeleeMinCooldown(def){
  return ({machine:15,octo:14,whirl:13,holy:11,magnet:11,dragon:11,void:11,chain:10,bleed:10,stun:10,roll:10,double:10})[def.pattern]||8;
 }
 function frRangedMinCooldown(def){
  return ({basic:6,fan:10,rapid:5,pierce:8,heavy:10,triple:10,popcorn:11,shotgun:12,freeze:8,flame:7,laser:11,sticky:11,mortar:12,homing:9,gravity:12,lightning:9,meteor:13,fleet:13,absolute:13,drones:10,star:14})[def.pattern]||6;
 }
 autoFire=function(){
  if(player.weaponCd>0){player.weaponCd--;return;}
  const activeTraining=(typeof charSlots!=='undefined'&&charSlots[activeChar]&&charSlots[activeChar].training)||tr||{};
  if(currentWeapon==='melee'){
   const d=defFor('melee');
   const formHaste=typeof frFormAttackSpeedMultiplier==='function'?frFormAttackSpeedMultiplier():1;
   const trainedCooldown=Math.max(16,Math.round((d.cooldown||28)/(1+(activeTraining.meleeSpeed||0)*FR_BALANCE.training.meleeSpeedPerLevel)));
   player.weaponCd=Math.max(frMeleeMinCooldown(d),Math.floor(trainedCooldown/((normalFrenzyTimer>0?2:1)*formHaste)));
   frStartMeleeSequence(d);
   }else{
   const d=defFor('ranged'),formHaste=typeof frFormAttackSpeedMultiplier==='function'?frFormAttackSpeedMultiplier():1;
   const trainedCooldown=Math.max(6,Math.round((d.cooldown||10)/(1+(activeTraining.rangedSpeed||0)*FR_BALANCE.training.rangedSpeedPerLevel)));
   player.weaponCd=Math.max(frRangedMinCooldown(d),Math.floor(trainedCooldown/((normalFrenzyTimer>0?2:1)*formHaste)));shootRanged(d);
  }
 };
})();
`;
})();

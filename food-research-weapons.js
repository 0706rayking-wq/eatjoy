(function () {
  const rarities = {
    normal: { label: '普通', rate: 65, color: '#94a3b8', glow: 'rgba(148,163,184,.22)' },
    rare: { label: '稀有', rate: 20, color: '#38bdf8', glow: 'rgba(56,189,248,.22)' },
    noble: { label: '高貴', rate: 10, color: '#c084fc', glow: 'rgba(192,132,252,.22)' },
    top: { label: '頂級', rate: 5, color: '#fbbf24', glow: 'rgba(251,191,36,.24)' },
  };

  const ranged = [
    { id:'r01', name:'食材砲', rarity:'normal', icon:0, pattern:'basic', damage:1.00, cooldown:10, size:6, color:'#f59e0b', desc:'雙發直線食材彈，射速與傷害均衡。' },
    { id:'r02', name:'調味料噴射器', rarity:'normal', icon:1, pattern:'fan', damage:.58, cooldown:12, size:5, color:'#fb7185', desc:'一次噴出五發扇形調味彈。' },
    { id:'r03', name:'豌豆連發槍', rarity:'normal', icon:2, pattern:'rapid', damage:.72, cooldown:6, size:4, color:'#84cc16', desc:'高射速單發，適合持續壓制。' },
    { id:'r04', name:'筷子弩', rarity:'normal', icon:3, pattern:'pierce', damage:1.28, cooldown:14, size:5, color:'#f97316', pierce:true, desc:'高速筷子箭可貫穿敵人。' },
    { id:'r05', name:'魚丸彈弓', rarity:'normal', icon:4, pattern:'heavy', damage:1.55, cooldown:18, size:9, color:'#fde68a', desc:'緩慢但沉重的大型魚丸彈。' },
    { id:'r06', name:'茶壺水砲', rarity:'normal', icon:5, pattern:'triple', damage:.82, cooldown:11, size:6, color:'#38bdf8', desc:'三道水流並排前進，覆蓋穩定。' },
    { id:'r07', name:'玉米爆裂砲', rarity:'normal', icon:6, pattern:'popcorn', damage:.55, cooldown:13, size:6, color:'#fde047', desc:'爆米花彈以不規則角度連續散射。' },
    { id:'r08', name:'蝦殼散彈槍', rarity:'normal', icon:7, pattern:'shotgun', damage:.50, cooldown:17, size:5, color:'#fb923c', desc:'近距離七發散彈，貼近時威力高。' },

    { id:'r09', name:'冷凍光線', rarity:'rare', icon:8, pattern:'freeze', damage:1.05, cooldown:12, size:7, color:'#60a5fa', freeze:150, pierce:true, desc:'冰晶光束貫穿並凍結沿途敵人。' },
    { id:'r10', name:'辣油火焰砲', rarity:'rare', icon:9, pattern:'flame', damage:.78, cooldown:8, size:7, color:'#ef4444', burn:true, desc:'連續火焰彈使敵人受到灼燒。' },
    { id:'r11', name:'醬汁雷射', rarity:'rare', icon:10, pattern:'laser', damage:1.55, cooldown:16, size:6, color:'#fbbf24', pierce:true, desc:'筆直高能雷射，能貫穿整排敵人。' },
    { id:'r12', name:'起司黏彈槍', rarity:'rare', icon:11, pattern:'sticky', damage:1.42, cooldown:17, size:10, color:'#facc15', homing:true, desc:'大型起司黏彈會微幅追蹤目標。' },
    { id:'r13', name:'湯圓迫擊砲', rarity:'rare', icon:12, pattern:'mortar', damage:1.20, cooldown:19, size:11, color:'#e2e8f0', splash:58, desc:'拋射三顆湯圓，命中時造成小範圍傷害。' },
    { id:'r14', name:'蜂蜜追蹤砲', rarity:'rare', icon:13, pattern:'homing', damage:1.02, cooldown:11, size:7, color:'#f59e0b', homing:true, desc:'兩發蜂蜜彈會自動修正方向追敵。' },

    { id:'r15', name:'黑蒜重力砲', rarity:'noble', icon:14, pattern:'gravity', damage:1.35, cooldown:20, size:13, color:'#111827', gravity:true, pierce:true, desc:'黑洞彈牽引周遭敵人後貫穿前進。' },
    { id:'r16', name:'松露雷霆砲', rarity:'noble', icon:15, pattern:'lightning', damage:1.18, cooldown:13, size:8, color:'#fef08a', chain:true, desc:'雷電彈會對周遭敵人跳躍放電。' },
    { id:'r17', name:'龍果星隕砲', rarity:'noble', icon:16, pattern:'meteor', damage:1.25, cooldown:20, size:12, color:'#f43f5e', splash:76, burn:true, desc:'三顆星隕彈造成範圍爆炸與灼燒。' },
    { id:'r18', name:'龍蝦艦隊砲', rarity:'noble', icon:17, pattern:'fleet', damage:.62, cooldown:12, size:7, color:'#fb7185', homing:true, desc:'六發龍蝦彈組成會追蹤的艦隊齊射。' },

    { id:'r19', name:'可可冰棒絕對零度砲', rarity:'top', icon:18, pattern:'absolute', damage:1.85, cooldown:20, size:16, color:'#67e8f9', freeze:220, pierce:true, desc:'巨大冰棒彈貫穿全場並長時間冰封。' },
    { id:'r20', name:'萬味自律浮游砲', rarity:'top', icon:19, pattern:'drones', damage:.85, cooldown:10, size:8, color:'#a78bfa', homing:true, pierce:true, desc:'三枚自律浮游彈從不同角度追蹤敵人。' },
    { id:'r21', name:'白白神廚殲星砲', rarity:'top', icon:20, pattern:'star', damage:1.25, cooldown:17, size:12, color:'#fde047', pierce:true, homing:true, desc:'五道神廚光束追蹤、貫穿並清掃前方。' },
  ];

  const melee = [
    { id:'m01', name:'鍋鏟劍', rarity:'normal', icon:0, pattern:'basic', shape:'arc', arc:100, damage:1.00, cooldown:32, range:90, reflect:1, guardRatio:.72, color:'#cbd5e1', desc:'均衡的前方橫斬；有效揮擊軌跡可反彈碰到的普通子彈。' },
    { id:'m02', name:'擀麵棍', rarity:'normal', icon:1, pattern:'knock', shape:'slam', width:40, impact:38, damage:1.35, cooldown:54, range:90, reflect:0, knock:40, color:'#d97706', desc:'向前重砸並產生衝擊，造成高傷害與擊退，但不能處理子彈。' },
    { id:'m03', name:'菜刀', rarity:'normal', icon:2, pattern:'rapid', shape:'arc', arc:60, damage:.72, cooldown:20, range:70, reflect:0, cut:1, guardRatio:.45, color:'#e2e8f0', desc:'快速的短距離斬擊；有效揮擊軌跡可斬除碰到的普通子彈。' },
    { id:'m04', name:'炒菜鍋', rarity:'normal', icon:3, pattern:'circle', shape:'arc', arc:170, damage:.92, cooldown:50, range:105, reflect:1, guardRatio:.95, color:'#94a3b8', desc:'緩慢的大角度橫掃；有效揮擊軌跡可反彈碰到的普通子彈。' },
    { id:'m05', name:'砧板護盾', rarity:'normal', icon:4, pattern:'shield', shape:'thrust', width:80, damage:.72, cooldown:54, range:70, reflect:1, cut:1, guardRatio:1, color:'#a16207', shield:4, desc:'以砧板向前盾擊，可處理軌跡內全部普通子彈；命中或成功擋彈時獲得護盾。' },
    { id:'m06', name:'長柄湯勺', rarity:'normal', icon:5, pattern:'long', shape:'thrust', width:26, damage:1.05, cooldown:38, range:140, reflect:0, color:'#cbd5e1', desc:'向前方進行長距離突刺，能在較安全的位置攻擊，但不能處理子彈。' },
    { id:'m07', name:'雙齒烤肉夾', rarity:'normal', icon:6, pattern:'double', shape:'dual', width:20, lane:14, damage:.64, cooldown:24, range:90, reflect:0, cut:1, guardRatio:.5, color:'#f97316', hits:2, desc:'向前發動兩段夾擊；有效突刺軌跡可斬除碰到的普通子彈。' },
    { id:'m08', name:'打蛋器', rarity:'normal', icon:7, pattern:'whirl', shape:'ring', inner:32, damage:.60, cooldown:36, range:82, reflect:0, cut:1, guardRatio:.58, fullCircle:true, color:'#e2e8f0', desc:'貼身旋轉攻擊周圍敵人；有效旋轉軌跡可斬除碰到的普通子彈。' },

    { id:'m09', name:'震肉鎚', rarity:'rare', icon:8, pattern:'stun', shape:'slam', width:46, impact:50, damage:1.62, cooldown:60, range:100, reflect:0, stun:70, color:'#94a3b8', desc:'向前重擊地面並產生震波，造成高傷害與暈眩，但不能處理子彈。' },
    { id:'m10', name:'鋸齒麵包刀', rarity:'rare', icon:9, pattern:'bleed', shape:'arc', arc:70, damage:1.12, cooldown:26, range:100, reflect:0, cut:1, guardRatio:.55, bleed:true, color:'#f59e0b', desc:'快速拉鋸並造成撕裂；有效揮擊軌跡可斬除碰到的普通子彈。' },
    { id:'m11', name:'披薩滾刀', rarity:'rare', icon:10, pattern:'roll', shape:'thrust', width:30, damage:.82, cooldown:24, range:115, reflect:0, cut:1, guardRatio:.5, hits:2, color:'#fb923c', desc:'滾刀向前推進並造成兩段切割；有效軌跡可斬除碰到的普通子彈。' },
    { id:'m12', name:'寒霜冰雕刀', rarity:'rare', icon:11, pattern:'freeze', shape:'arc', arc:90, damage:1.18, cooldown:34, range:105, reflect:0, cut:1, guardRatio:.7, freeze:130, color:'#60a5fa', desc:'揮出寒霜斬擊並凍結敵人；有效軌跡可斬除碰到的普通子彈。' },
    { id:'m13', name:'烈焰鍋鏟', rarity:'rare', icon:12, pattern:'burn', shape:'arc', arc:110, damage:1.22, cooldown:32, range:110, reflect:1, guardRatio:.72, burn:true, color:'#ef4444', desc:'橫掃前方並使敵人灼燒；有效揮擊軌跡可反彈碰到的普通子彈。' },
    { id:'m14', name:'香腸鎖鏈', rarity:'rare', icon:13, pattern:'chain', shape:'chain', width:18, impact:32, damage:1.08, cooldown:38, range:155, reflect:0, pull:true, color:'#dc2626', desc:'甩出長距離鎖鏈，將命中的遠方敵人拉到身邊，但不能處理子彈。' },

    { id:'m15', name:'磁吸炒鍋', rarity:'noble', icon:14, pattern:'magnet', shape:'ring', inner:35, damage:1.35, cooldown:44, range:115, reflect:1, guardRatio:.95, pull:true, pullPower:1.15, fullCircle:true, color:'#38bdf8', desc:'加速旋轉並強力牽引周圍敵人；有效軌跡可反彈碰到的普通子彈。' },
    { id:'m16', name:'雷切牛排刀', rarity:'noble', icon:15, pattern:'lightning', shape:'arc', arc:75, damage:1.55, cooldown:26, range:118, reflect:1, guardRatio:.68, chain:true, chainRange:120, chainDamage:.36, color:'#fef08a', desc:'高速雷電斜斬可在更大範圍連鎖敵人；有效揮擊軌跡可反彈普通子彈。' },
    { id:'m17', name:'黑蒜虛空刃', rarity:'noble', icon:16, pattern:'void', shape:'arc', arc:140, damage:1.65, cooldown:40, range:130, reflect:0, cut:1, guardRatio:.9, pull:true, pullPower:1.18, color:'#7c3aed', desc:'更快速的大範圍虛空月牙會強力牽引敵人；有效軌跡可斬除普通子彈。' },
    { id:'m18', name:'八腕妖刀', rarity:'noble', icon:17, pattern:'octo', shape:'triple', arc:70, damage:.72, cooldown:30, range:100, reflect:0, cut:1, guardRatio:.8, hits:3, color:'#e879f9', desc:'高速向左、中、右發動三段亂斬；三段有效軌跡都能斬除普通子彈。' },

    { id:'m19', name:'炎龍廚神刀', rarity:'top', icon:18, pattern:'dragon', shape:'slam', width:58, impact:32, damage:1.95, cooldown:40, range:150, reflect:1, guardRatio:.92, burn:true, burnPower:1.25, color:'#f97316', desc:'快速劈出高傷害炎龍斬並強化灼燒路徑；有效軌跡可反彈普通子彈。' },
    { id:'m20', name:'萬象料理機械臂', rarity:'top', icon:19, pattern:'machine', shape:'dual', width:38, lane:18, damage:1.15, cooldown:30, range:120, reflect:1, cut:1, guardRatio:.82, hits:2, shield:5, color:'#38bdf8', desc:'高速交替發動雙臂突擊，可處理軌跡內全部普通子彈；命中或擋彈時獲得 5 點護盾。' },
    { id:'m21', name:'白白神廚聖鍋', rarity:'top', icon:20, pattern:'holy', shape:'ring', inner:0, damage:1.75, cooldown:45, range:125, reflect:1, cut:1, guardRatio:1, fullCircle:true, heal:3, shield:6, color:'#fde68a', desc:'更快速釋放全周聖光衝擊，可處理全部普通子彈；命中或擋彈時恢復 3 HP 並獲得 6 點護盾。' },
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
 function defFor(type){const fallback=type==='ranged'?'初始食材砲':'初始鍋鏟';return weaponMap[(SAVE.equip||{})[type]||fallback]||weaponMap[fallback];}
 const rarityRank={normal:0,rare:1,noble:2,top:3};
 const weaponFx=[];
 const frWeaponImgs={melee:{},ranged:{}};
 function frWeaponImg(type,index){
  const cache=frWeaponImgs[type],key=String(index);
  if(cache[key])return cache[key];
  const img=new Image();img.decoding='async';
  const folder=type==='melee'?'melee':'ranged-expedition';
  img.src='assets/food-research/weapons/'+folder+'/'+String(Number(index)+1).padStart(2,'0')+'.png?v=4';
  cache[key]=img;return img;
 }
 let frRangedKick=0;
 function drawWeaponImage(img,size,yOffset){
  if(!img.complete||!img.naturalWidth)return false;
  ctx.drawImage(img,-size/2,-size/2+(yOffset||0),size,size);
  return true;
 }
 function drawRangedWeapon(def){
  if(currentWeapon!=='ranged'||!def)return;
  const rank=rarityRank[def.rarity]||0;
  const kick=Math.max(0,frRangedKick);
  const shake=kick*Math.sin(performance.now()*.12)*.035;
  ctx.save();
  ctx.translate(player.x+15,player.y-8+kick*7);
  ctx.rotate(shake+(jDx||0)*.025);
  ctx.globalAlpha=player.alpha==null?1:player.alpha;
  ctx.imageSmoothingEnabled=true;
  drawWeaponImage(frWeaponImg('ranged',def.icon),58+rank*2,0);
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
  ctx.save();ctx.translate(player.x-18,player.y-3);ctx.rotate(-.55);
  ctx.globalAlpha=(player.alpha==null?1:player.alpha)*.9;
  drawWeaponImage(frWeaponImg('melee',def.icon),55+(rarityRank[def.rarity]||0),0);
  ctx.restore();
 }
 function drawActiveMeleeWeapon(anim){
  const def=anim.weapon||defFor('melee'),p=Math.max(0,Math.min(1,anim.progress||0));
  const m=meleeMotion(def,p),rank=rarityRank[def.rarity]||0;
  ctx.save();ctx.translate(player.x+m.x,player.y+m.y);ctx.rotate(m.rot);
  ctx.globalAlpha=Math.max(.35,1-p*.2);ctx.imageSmoothingEnabled=true;
  const size=m.size+rank*2;
  drawWeaponImage(frWeaponImg('melee',def.icon),size,-size*.32);
  ctx.restore();
 }
 function pushWeaponFx(kind,x,y,color,size,life,rarity,pattern){
  if(weaponFx.length>70)weaponFx.splice(0,weaponFx.length-70);
  weaponFx.push({kind,x,y,color,size,life,age:0,rarity:rarity||'normal',pattern:pattern||'basic',seed:Math.random()*Math.PI*2});
 }
 function spawnMuzzle(def){
  const rank=rarityRank[def.rarity]||0;
  pushWeaponFx('muzzle',player.x,player.y-25,def.color,18+rank*3,7+rank,def.rarity,def.pattern);
 }
 function spawnImpact(def,x,y,kind){
  const rank=rarityRank[def.rarity]||0;
  pushWeaponFx(kind==='melee'?'meleeImpact':'impact',x,y,def.color,15+rank*4,9+rank*2,def.rarity,def.pattern);
 }
 function drawWeaponFx(){
  for(let i=weaponFx.length-1;i>=0;i--){
   const f=weaponFx[i],p=f.age/f.life,ease=1-Math.pow(1-Math.min(1,p),2),rank=rarityRank[f.rarity]||0;
   ctx.save();ctx.translate(f.x,f.y);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
   if(f.kind==='muzzle'){
    ctx.globalAlpha=Math.max(0,1-p)*.78;ctx.strokeStyle=f.color;ctx.lineWidth=2+rank*.5;
    ctx.beginPath();ctx.arc(0,0,f.size*(.35+ease*.55),0,Math.PI*2);ctx.stroke();
    for(let k=-1;k<=1;k++){const a=-Math.PI/2+k*.32;ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a)*(f.size+ease*8),Math.sin(a)*(f.size+ease*8));ctx.stroke();}
   }else{
    ctx.globalAlpha=Math.max(0,1-p)*.82;ctx.strokeStyle=f.color;ctx.lineWidth=f.kind==='meleeImpact'?3+rank:2+rank*.55;
    ctx.beginPath();ctx.arc(0,0,f.size*(.28+ease*.85),0,Math.PI*2);ctx.stroke();
    const rays=f.kind==='meleeImpact'?6+rank:4+rank*2;
    for(let k=0;k<rays;k++){const a=f.seed+k*Math.PI*2/rays,len=f.size*(.55+ease*.75);ctx.beginPath();ctx.moveTo(Math.cos(a)*f.size*.25,Math.sin(a)*f.size*.25);ctx.lineTo(Math.cos(a)*len,Math.sin(a)*len);ctx.stroke();}
    if(f.pattern==='freeze'){ctx.strokeStyle='#e0f2fe';ctx.beginPath();ctx.moveTo(-f.size*.7,0);ctx.lineTo(f.size*.7,0);ctx.moveTo(0,-f.size*.7);ctx.lineTo(0,f.size*.7);ctx.stroke();}
    if(f.pattern==='gravity'||f.pattern==='void'){ctx.strokeStyle='rgba(167,139,250,.9)';ctx.beginPath();ctx.arc(0,0,f.size*(1.15-ease*.45),f.seed+ease*3,f.seed+ease*3+Math.PI*1.35);ctx.stroke();}
   }
   ctx.restore();f.age++;
   if(f.age>=f.life)weaponFx.splice(i,1);
  }
 }
 function drawProjectile(b){
  const rank=rarityRank[b.frRarity]||0,r=Math.min(17,Math.max(3.5,b.r*(.72+rank*.055))),pattern=b.frPattern||'basic';
  const trail=b.frTrail||[];
  ctx.save();ctx.lineCap='round';
  if(trail.length>1){
   ctx.globalCompositeOperation='source-over';ctx.strokeStyle=b.color;ctx.lineWidth=Math.min(3.5,Math.max(1.4,r*(pattern==='laser'||pattern==='absolute'?.34:.22)));ctx.globalAlpha=.10+rank*.018;
   ctx.beginPath();ctx.moveTo(trail[0].x,trail[0].y);for(let i=1;i<trail.length;i++)ctx.lineTo(trail[i].x,trail[i].y);ctx.stroke();
  }
  ctx.globalCompositeOperation='lighter';ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy,b.vx)+Math.PI/2);ctx.shadowColor=b.color;ctx.shadowBlur=3+rank*1.25;ctx.fillStyle=b.color;ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.globalAlpha=.88;
  if(pattern==='freeze'||pattern==='absolute'||pattern==='star'){
   ctx.beginPath();ctx.moveTo(0,-r*1.65);ctx.lineTo(r*.72,0);ctx.lineTo(0,r*1.25);ctx.lineTo(-r*.72,0);ctx.closePath();ctx.fill();ctx.globalAlpha=.62;ctx.stroke();
  }else if(pattern==='laser'||pattern==='pierce'){
   ctx.fillRect(-r*.42,-r*1.8,r*.84,r*3.1);ctx.globalAlpha=.72;ctx.strokeRect(-r*.42,-r*1.8,r*.84,r*3.1);
  }else if(pattern==='flame'||b.burn){
   ctx.beginPath();ctx.moveTo(0,-r*1.45);ctx.bezierCurveTo(r*.95,-r*.25,r*.65,r*.95,0,r*1.2);ctx.bezierCurveTo(-r*.65,r*.95,-r*.95,-r*.25,0,-r*1.45);ctx.fill();
  }else if(pattern==='gravity'){
   ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle=b.color;ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*1.18,0,Math.PI*1.65);ctx.stroke();
  }else if(pattern==='shotgun'||pattern==='fan'||pattern==='popcorn'){
   ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.fill();
  }else{
   ctx.beginPath();ctx.ellipse(0,0,r*.72,r*1.15,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.48;ctx.stroke();
  }
  if(rank>=2){ctx.globalAlpha=.26;ctx.strokeStyle=b.color;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(0,0,r*(1.28+Math.sin(b.age*.35)*.08),0,Math.PI*2);ctx.stroke();}
  ctx.restore();
 }
 const oldBulletUpdate=Bullet.prototype.update;
 const oldBulletDraw=Bullet.prototype.draw;
 Bullet.prototype.update=function(){
  if(this.frVisual){
   if(!this.frTrail)this.frTrail=[];
   this.frTrail.push({x:this.x,y:this.y});
   const trailMax=3+(rarityRank[this.frRarity]||0);
   if(this.frTrail.length>trailMax)this.frTrail.shift();
  }
  if(this.frWave)this.vx+=Math.sin(this.age*.55)*.16;
  oldBulletUpdate.call(this);
  const targets=enemies.filter(function(e){return e&&e.hp>0;});
  if(this.frVisual){
   if(!this.frVfxHits)this.frVfxHits=new Set();
   for(const e of targets){if(!this.frVfxHits.has(e)&&Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r+3){this.frVfxHits.add(e);spawnImpact({color:this.color,rarity:this.frRarity,pattern:this.frPattern},this.x,this.y,'ranged');}}
   if(boss&&!boss._defeated&&!this.frBossVfx&&Math.hypot(this.x-boss.x,this.y-boss.y)<this.r+boss.r){this.frBossVfx=true;spawnImpact({color:this.color,rarity:this.frRarity,pattern:this.frPattern},this.x,this.y,'ranged');}
  }
  if(this.frFreeze){
   for(const e of targets){if(!this.hitTargets.has(e)&&Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r+3)e.frozenTimer=Math.max(e.frozenTimer||0,this.frFreeze);}
  }
  if(this.frGravity&&this.age%2===0){
   for(const e of targets){const dx=this.x-e.x,dy=this.y-e.y,d=Math.hypot(dx,dy)||1;if(d<150){e.x+=dx/d*2.2;e.y+=dy/d*2.2;}}
  }
  if(this.frChain&&this.age%12===0){
   let best=null,bd=88;
   for(const e of targets){const d=Math.hypot(this.x-e.x,this.y-e.y);if(d<bd&&!this.frChainHits.has(e)){best=e;bd=d;}}
   if(best){this.frChainHits.add(best);best.takeDamage(this.dmg*.24);burst(best.x,best.y,'#fef08a',5);}
  }
  if(this.frSplash&&!this.frSplashDone){
   for(const e of targets){if(Math.hypot(this.x-e.x,this.y-e.y)<this.r+e.r){
    this.frSplashDone=true;
    for(const near of targets){if(near!==e&&Math.hypot(e.x-near.x,e.y-near.y)<this.frSplash)near.takeDamage(this.dmg*.45);}
    burst(this.x,this.y,this.color,14);break;
   }}
  }
 };
 Bullet.prototype.draw=function(){
  if(!this.frVisual){oldBulletDraw.call(this);return;}
  drawProjectile(this);
 };
 function makeShot(def,angle,dmgScale,sizeScale,speedScale){
  const sp=(def.pattern==='heavy'||def.pattern==='mortar'?7:11)*(speedScale||1);
  const am=window._curAtkMult||atkMult;
  const b=new Bullet(player.x,player.y-18,Math.cos(angle)*sp,Math.sin(angle)*sp,currentForm.bulletDmg*def.damage*(dmgScale||1)*am,def.color,(def.size||6)*(sizeScale||1),!!def.pierce,!!def.homing,!!def.burn);
  b.frVisual=true;b.frRarity=def.rarity||'normal';b.frPattern=def.pattern||'basic';b.frFreeze=def.freeze||0;b.frGravity=!!def.gravity;b.frChain=!!def.chain;b.frChainHits=new Set();b.frSplash=def.splash||0;b.frWave=def.pattern==='popcorn';
  bullets.push(b);return b;
 }
 function shootRanged(def){
  const up=-Math.PI/2;
  frRangedKick=1;
  spawnMuzzle(def);
  if(def.pattern==='fan'){for(let i=-2;i<=2;i++)makeShot(def,up+i*.19);}
  else if(def.pattern==='triple'){for(let i=-1;i<=1;i++){const b=makeShot(def,up);b.x+=i*13;}}
  else if(def.pattern==='popcorn'){for(let i=-2;i<=2;i++)makeShot(def,up+i*.11+(Math.random()-.5)*.12);}
  else if(def.pattern==='shotgun'){for(let i=-3;i<=3;i++)makeShot(def,up+i*.14);}
  else if(def.pattern==='homing'){makeShot(def,up-.08);makeShot(def,up+.08);}
  else if(def.pattern==='mortar'){for(let i=-1;i<=1;i++)makeShot(def,up+i*.18,1,1,0.9);}
  else if(def.pattern==='meteor'){for(let i=-1;i<=1;i++)makeShot(def,up+i*.13,1,1.1,1);}
  else if(def.pattern==='fleet'){for(let i=-2.5;i<=2.5;i++)makeShot(def,up+i*.10,.9,.9,1);}
  else if(def.pattern==='drones'){for(let i=-1;i<=1;i++){const b=makeShot(def,up+i*.32,1,1,0.85);b.x+=i*22;}}
  else if(def.pattern==='star'){for(let i=-2;i<=2;i++)makeShot(def,up+i*.105,1,.68,1.08);}
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
  const side=x-player.x,forward=player.y-y,r=Math.max(0,radius||0),shape=def.shape||'arc',range=def.range||90;
  if(shape==='arc')return frSectorHit(side,forward,r,range,def.arc||90,0);
  if(shape==='triple')return [-45,0,45].some(function(center){return frSectorHit(side,forward,r,range,def.arc||70,center);});
  if(shape==='ring'){
   const dist=Math.hypot(side,forward),inner=Math.max(0,def.inner||0);
   return dist<=range+r&&dist>=Math.max(0,inner-r);
  }
  if(shape==='dual'){
   const lane=def.lane||14,half=(def.width||24)/2+r;
   return forward>=-r&&forward<=range+r&&(Math.abs(side-lane)<=half||Math.abs(side+lane)<=half);
  }
  if(shape==='chain'){
   const shaft=frPointSegmentDistance(side,forward,0,0,0,range)<=(def.width||18)/2+r;
   return shaft||Math.hypot(side,forward-range)<=(def.impact||28)+r;
  }
  if(shape==='slam'){
   const shaft=frPointSegmentDistance(side,forward,0,8,0,range)<=(def.width||42)/2+r;
   return shaft||Math.hypot(side,forward-range)<=(def.impact||36)+r;
  }
  const half=(def.width||30)/2+r;
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
  function frTriggerMeleeSupport(def,anim){
   if(!anim||anim.supportTriggered||(!def.shield&&!def.heal))return;
   anim.supportTriggered=true;
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
    const shouldCut=!!def.cut&&(!def.reflect||(b.r||5)>=8);
    if(!shouldCut&&def.reflect){
     const rb=new Bullet(b.x,b.y,-b.vx*1.25,-Math.abs(b.vy)*1.25,base*returnScale,def.color,Math.min(9,(b.r||5)+1),false,false,!!def.burn);
     rb.frVisual=true;rb.frRarity=def.rarity||'normal';rb.frPattern='reflect';bullets.push(rb);reflected++;
    }else{
     cut++;
    }
    burst(b.x,b.y,shouldCut?'#f8fafc':def.color,5);
    eBullets.splice(i,1);
   }
   if(reflected||cut){
    frTriggerMeleeSupport(def,anim);
    const now=performance.now();
    if(now-(anim.lastGuardFxAt||0)>90){
     anim.lastGuardFxAt=now;
     const label=[reflected?'反彈 '+reflected:'',cut?'斬除 '+cut:''].filter(Boolean).join(' / ');
     addText(label,player.x,player.y-34,'#e0f2fe',11,-.45);
     if(window.frSfx)window.frSfx('parry');
    }
   }
  }
  function drawMeleeSwipe(anim){
   const d=anim.weapon||defFor('melee'),p=Math.min(1,anim.progress),rank=rarityRank[d.rarity]||0;
   const range=d.range||90,fade=Math.max(0,1-p),color=d.color||'#e2e8f0',shape=d.shape||'arc',guardActive=frMeleeGuardActive(d,anim);
   ctx.save();ctx.translate(player.x,player.y-7);ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle=color;
   ctx.shadowColor=guardActive?'#e0f2fe':color;ctx.shadowBlur=guardActive?18:5;
  if(shape==='slam'){
   const drive=Math.sin(p*Math.PI),endY=-range*(.35+drive*.65);ctx.globalAlpha=fade*.78;ctx.lineWidth=Math.max(8,(d.width||42)*.28)+rank*2;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,endY);ctx.stroke();
   ctx.globalAlpha=fade*.56;ctx.lineWidth=3+rank*.5;ctx.beginPath();ctx.arc(0,endY,(d.impact||36)*(.45+drive*.55),0,Math.PI*2);ctx.stroke();
  }else if(shape==='thrust'||shape==='dual'){
   const drive=Math.sin(p*Math.PI),endY=-range*(.28+drive*.72),lanes=shape==='dual'?[-(d.lane||14),d.lane||14]:[0];
   ctx.globalAlpha=fade*.8;ctx.lineWidth=Math.max(5,(d.width||30)*.2)+rank;
   lanes.forEach(function(x){ctx.beginPath();ctx.moveTo(x,-10);ctx.lineTo(x,endY);ctx.stroke();});
   ctx.globalAlpha=fade*.4;ctx.lineWidth=2;lanes.forEach(function(x){ctx.beginPath();ctx.arc(x,endY,8+rank*3,0,Math.PI*2);ctx.stroke();});
  }else if(shape==='chain'){
   ctx.globalAlpha=fade*.78;ctx.lineWidth=4+rank;ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(0,-12);ctx.quadraticCurveTo(range*.48,-range*.6,Math.sin(p*Math.PI)*range*.28,-range);ctx.stroke();ctx.setLineDash([]);
   ctx.globalAlpha=fade*.52;ctx.beginPath();ctx.arc(Math.sin(p*Math.PI)*range*.28,-range,d.impact||28,0,Math.PI*2);ctx.stroke();
  }else if(shape==='ring'){
   const a=-Math.PI/2+p*Math.PI*2;ctx.globalAlpha=fade*.68;ctx.lineWidth=8+rank*2;ctx.beginPath();ctx.arc(0,0,range,a-1.15,a+.22);ctx.stroke();
   ctx.globalAlpha=fade*.38;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,Math.max(d.inner||0,range*.72),a-.8,a+.36);ctx.stroke();
  }else if(shape==='triple'){
   const phase=Math.min(2,Math.floor(p*3)),local=(p*3)%1,centers=[-45,0,45],center=-Math.PI/2+centers[phase]*Math.PI/180,arc=(d.arc||70)*Math.PI/180;
   ctx.globalAlpha=fade*.8;ctx.lineWidth=8+rank*1.6;ctx.beginPath();ctx.arc(0,0,range,center-arc/2,center-arc/2+arc*Math.max(.2,local));ctx.stroke();
  }else{
   const arc=(d.arc||90)*Math.PI/180,start=-Math.PI/2-arc/2,end=start+arc*Math.max(.18,p);ctx.globalAlpha=fade*.74;ctx.lineWidth=8+rank*1.6;ctx.beginPath();ctx.arc(0,0,range,start,end);ctx.stroke();
   ctx.globalAlpha=fade*.42;ctx.lineWidth=2.5;ctx.strokeStyle='#ffffff';ctx.beginPath();ctx.arc(0,0,Math.max(10,range-5),start,end);ctx.stroke();
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
 autoFire=function(){
  if(player.weaponCd>0){player.weaponCd--;return;}
  if(currentWeapon==='melee'){
   const d=defFor('melee');
   player.weaponCd=Math.max(1,Math.floor((d.cooldown||28)/(normalFrenzyTimer>0?2:1)));
   startSwipe();
   const am=window._curAtkMult||atkMult,base=currentForm.bulletDmg*d.damage*2.2*am,hits=d.hits||1;
    let didHit=false;
    enemies.forEach(function(e){if(meleeTargetHit(d,e,8)){didHit=true;e.takeDamage(base*hits);applyMeleeEffect(d,e,base);burst(e.x,e.y,d.color,Math.min(5,2+hits));}});
    if(boss&&!boss._defeated&&meleeTargetHit(d,boss,22)){didHit=true;boss.takeDamage(base*Math.min(2,hits));spawnImpact(d,boss.x,boss.y,'melee');}
    if(didHit)frTriggerMeleeSupport(d,swipeAnim);
   }else{
   const d=defFor('ranged');player.weaponCd=Math.max(1,Math.floor((d.cooldown||10)/(normalFrenzyTimer>0?2:1)));shootRanged(d);
  }
 };
})();
`;
})();

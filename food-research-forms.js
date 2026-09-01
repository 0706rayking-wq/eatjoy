(function () {
  const assetBase = 'assets/food-research/forms/';
  const assetVersion = '?v=4';
  const skillDetails = {
    onion_guard:{skill1Desc:'清除周圍 150 範圍的普通子彈，對附近敵人造成 24 傷害並擊退。',skill2Desc:'獲得 180 點護盾，向四周發射 24 道可貫穿震波，每道造成 25 傷害。'},
    popcorn:{skill1Desc:'向前扇形發射 11 顆爆米花，每顆造成 16 傷害。',skill2Desc:'朝上方廣角發射 18 顆可貫穿玉米砲彈，每顆造成 28 傷害，並對 230 範圍造成 45 傷害。'},
    healing_mushroom:{skill1Desc:'短暫無敵、清除 115 範圍的子彈並回復 12 HP。',skill2Desc:'回復 55 HP、獲得 70 點護盾，並對 210 範圍敵人造成 34 傷害。'},
    garlic_knight:{skill1Desc:'立即解除灼燒、中毒、冰凍等異常狀態，並無敵 2.2 秒。',skill2Desc:'解除異常狀態並無敵 6.5 秒，同時使所有敵人減速 6.5 秒。'},
    chili_sprite:{skill1Desc:'向前發射 9 道可貫穿火焰，每道造成 18 傷害並附加灼燒。',skill2Desc:'連續產生 8 次全場焚燒脈衝，每次對所有敵人造成 14 傷害。'},
    lotus_archer:{skill1Desc:'向前射出 7 支可貫穿藕矢，每支造成 18 傷害。',skill2Desc:'在前方展開 7 道貫穿光柱，每道造成 24 傷害。'},
    potato_armor:{skill1Desc:'獲得 80 點護盾，並清除 130 範圍內的普通子彈。',skill2Desc:'清除全場普通子彈，對所有敵人造成 38 傷害並大幅減速 6.5 秒。'},
    lemon_battery:{skill1Desc:'朝上方扇形發射 10 顆可貫穿連鎖電球，每顆造成 18 傷害，並電擊 180 範圍敵人。',skill2Desc:'連續降下 8 次全場雷擊，每次對所有敵人造成 22 傷害。'},
    cheese_mage:{skill1Desc:'對 160 範圍造成 18 傷害，並使所有敵人降至 30% 移速，持續 5 秒。',skill2Desc:'使所有敵人降至 15% 移速 9 秒，期間造成 6 次全場傷害，每次 14。'},
    honey_priest:{skill1Desc:'回復 22 HP，並提升攻擊速度與移動速度 5 秒。',skill2Desc:'回復 70 HP、獲得 120 點護盾，並使所有敵人減速 6 秒。'},
    coffee_pilot:{skill1Desc:'進入超頻 6.5 秒，大幅提升攻擊速度並額外提高移動速度。',skill2Desc:'清除全場普通子彈，使敵人近乎停止 8 秒，自身同時進入 8 秒超頻。'},
    octopus_samurai:{skill1Desc:'短暫無敵，反彈 140 範圍內的全部普通子彈。',skill2Desc:'反彈 240 範圍內的普通子彈，並向四周發射 32 道可貫穿斬擊，每道造成 24 傷害。'},
    salmon_ronin:{skill1Desc:'短暫無敵並向前突進，接著射出 5 道可貫穿斬擊，每道造成 28 傷害。',skill2Desc:'清除全場普通子彈，對所有敵人造成 60 傷害並將其推回上方。'},
    beef_berserker:{skill1Desc:'獲得 70 點護盾，並對 120 範圍敵人造成 30 傷害。',skill2Desc:'8 秒內不會死亡並進入狂暴狀態，同時對 160 範圍造成 42 傷害。'},
    puffer_alchemist:{skill1Desc:'朝上方廣角發射 18 枚可貫穿毒針，每枚造成 19 傷害。',skill2Desc:'連續釋放 10 次全場劇毒脈衝，每次造成 18 傷害並疊加 1 層中毒。'},
    black_garlic_void:{skill1Desc:'清除 220 範圍子彈，將敵人拉近 45%，並造成 26 範圍傷害。',skill2Desc:'清除全場普通子彈，向前發射 5 道可貫穿虛空砲，每道造成 42 傷害。'},
    lobster_general:{skill1Desc:'吸收 240 範圍內的普通子彈並記錄數量，同時獲得 100 點護盾。',skill2Desc:'朝上方廣角發射 30 發可貫穿砲彈；基礎傷害 24，每吸收 1 顆子彈再增加 2 傷害。'},
    truffle_thunder:{skill1Desc:'在 0.9 秒內發動 5 次追身雷擊，每次對所有敵人造成 14 傷害。',skill2Desc:'連續發動 8 次全場雷擊，每次對所有敵人造成 16 傷害。'},
    dragonfruit_emperor:{skill1Desc:'召喚 9 顆龍星依序轟炸，每次對所有敵人造成 11 傷害。',skill2Desc:'無敵 2.8 秒並連續吐息 10 次，每次發射 3 道貫穿灼燒火焰並造成範圍傷害。'},
    peach_divine:{skill1Desc:'進入 6 秒強化狀態，並向四周發射 12 道可貫穿仙氣，每道造成 18 傷害。',skill2Desc:'完全回復 HP、解除異常、清除全場普通子彈，並無敵 5 秒。'},
    cocoa_popsicle_wargod:{skill1Desc:'清除 190 範圍子彈，對 170 範圍造成 52 傷害並使敵人減速 4.2 秒。',skill2Desc:'無敵 2.2 秒並強化 6.5 秒，清除全場普通子彈、極凍敵人，持續釋放 8 波冰晶攻擊。'},
  };
  const forms = [
    { id:'onion_guard', rarity:'normal', name:'洋蔥守衛', emoji:'🧅', passive:'每 10 秒生成防護罩', skill1:'洋蔥震波', skill2:'三層堡壘', color:'#d8b4fe' },
    { id:'popcorn', rarity:'normal', name:'爆米花', emoji:'🍿', passive:'遠程子彈尺寸與命中範圍增加 55%', skill1:'爆米花散射', skill2:'玉米重砲', color:'#fde68a' },
    { id:'healing_mushroom', rarity:'normal', name:'療癒蘑菇', emoji:'🍄', passive:'每 5 秒自動治療', skill1:'蘑菇替身', skill2:'療癒菌林', color:'#f9a8d4' },
    { id:'garlic_knight', rarity:'normal', name:'蒜頭騎士', emoji:'🧄', passive:'異常狀態時間減半', skill1:'聖蒜淨化', skill2:'無垢聖域', color:'#f5f5dc' },
    { id:'chili_sprite', rarity:'normal', name:'辣椒精靈', emoji:'🌶️', passive:'150 範圍內每 0.75 秒造成 8 點灼燒傷害', skill1:'焚風', skill2:'烈焰油海', color:'#fb7185' },
    { id:'lotus_archer', rarity:'normal', name:'蓮藕射手', emoji:'🏹', passive:'遠程攻擊額外貫穿', skill1:'連環藕矢', skill2:'九孔光陣', color:'#fda4af' },
    { id:'potato_armor', rarity:'normal', name:'馬鈴薯裝甲', emoji:'🥔', passive:'受到的傷害降低 20%', skill1:'澱粉彈牆', skill2:'大地震盪', color:'#d6a86e' },
    { id:'lemon_battery', rarity:'normal', name:'檸檬電池', emoji:'🍋', passive:'遠程攻擊有 28% 機率觸發連鎖電流', skill1:'彈跳電球', skill2:'超載電網', color:'#facc15' },

    { id:'cheese_mage', rarity:'rare', name:'起司法師', emoji:'🧀', passive:'所有敵人移動速度降低', skill1:'濃稠起司陣', skill2:'熟成結界', color:'#fbbf24' },
    { id:'honey_priest', rarity:'rare', name:'蜂蜜祭司', emoji:'🍯', passive:'自動治療，溢補轉為護盾', skill1:'甜蜜祝福', skill2:'琥珀封印', color:'#f59e0b' },
    { id:'coffee_pilot', rarity:'rare', name:'咖啡飛行員', emoji:'☕', passive:'持續移動 4 秒可逐步獲得最高 28% 移速', skill1:'濃縮超頻', skill2:'子彈時間', color:'#a16207' },
    { id:'octopus_samurai', rarity:'rare', name:'章魚武士', emoji:'🐙', passive:'近戰範圍增加 20%，揮擊可斬除小彈', skill1:'墨流反擊', skill2:'八腕亂舞', color:'#c084fc' },
    { id:'salmon_ronin', rarity:'rare', name:'鮭魚浪客', emoji:'🍣', passive:'閃避後 3 秒內攻擊、攻速與移速提升 25%', skill1:'逆流一閃', skill2:'鮭潮斷浪', color:'#fb7185' },
    { id:'beef_berserker', rarity:'rare', name:'牛排狂戰士', emoji:'🥩', passive:'血量越低，攻擊最高 +45%、攻速最高 +55%', skill1:'猛牛挑釁', skill2:'血宴不倒', color:'#dc2626' },

    { id:'puffer_alchemist', rarity:'noble', name:'河豚毒師', emoji:'🐡', passive:'160 範圍每 0.75 秒疊毒；8 點起，每層 +3，最高 5 層', skill1:'萬毒棘輪', skill2:'死海劇毒', color:'#a3e635' },
    { id:'black_garlic_void', rarity:'noble', name:'黑蒜虛空使', emoji:'⚫', passive:'造成傷害 +12%，遠程攻擊額外貫穿', skill1:'蒜核黑洞', skill2:'虛無貫星砲', color:'#818cf8' },
    { id:'lobster_general', rarity:'noble', name:'龍蝦將軍', emoji:'🦞', passive:'每 8 秒獲得護甲，護盾格擋後 4 秒內傷害 +25%', skill1:'赤甲納彈', skill2:'百砲返還', color:'#ef4444' },
    { id:'truffle_thunder', rarity:'noble', name:'松露雷神', emoji:'⚡', passive:'所有遠程攻擊附帶不衰減連鎖電流', skill1:'追身雷雲', skill2:'萬雷天牢', color:'#60a5fa' },

    { id:'dragonfruit_emperor', rarity:'top', name:'火龍果龍皇', emoji:'🐉', passive:'185 範圍每 0.5 秒造成 14 點灼燒；擊破有 35% 機率爆破', skill1:'龍星雨', skill2:'焚界龍息', color:'#f43f5e' },
    { id:'peach_divine', rarity:'top', name:'仙桃神使', emoji:'🍑', passive:'每場戰鬥首次死亡可復活', skill1:'仙影分身', skill2:'蟠桃回天', color:'#f9a8d4' },
    { id:'cocoa_popsicle_wargod', rarity:'top', name:'可可冰棒戰神', emoji:'🍫', passive:'攻擊累積 5 層寒氣後凍結並觸發碎冰爆破', skill1:'冰棒巨斧', skill2:'極凍戰神', color:'#67e8f9' },
  ].map((form) => ({
    ...form,
    ...skillDetails[form.id],
    skill1Cost:form.rarity==='top'?26:form.rarity==='noble'?24:form.rarity==='rare'?22:20,
    skill2Cost:form.id==='peach_divine'?100:form.rarity==='top'?60:form.rarity==='noble'?56:form.rarity==='rare'?52:48,
    skill1Cooldown:form.rarity==='top'?4:form.rarity==='noble'?4.25:form.rarity==='rare'?4.5:4.75,
    skill2Cooldown:form.id==='peach_divine'?16:form.rarity==='top'?9.5:form.rarity==='noble'?10:form.rarity==='rare'?10.5:11,
    portrait: assetBase + form.id + '-front.png' + assetVersion,
    battle: assetBase + form.id + '-back.png' + assetVersion,
    passiveIcon: assetBase + form.id + '-passive.png' + assetVersion,
    skill1Icon: assetBase + form.id + '-skill1.png' + assetVersion,
    skill2Icon: assetBase + form.id + '-skill2.png' + assetVersion,
  }));

  window.FOOD_RESEARCH_FORMS = forms;
  window.FOOD_RESEARCH_FORM_MAP = Object.fromEntries(forms.map((form) => [form.id, form]));
  window.FOOD_RESEARCH_RARITIES = {
    normal: { label:'普通', rate:65, color:'#8b949e' },
    rare: { label:'稀有', rate:20, color:'#58a6ff' },
    noble: { label:'高貴', rate:10, color:'#d2a8ff' },
    top: { label:'頂級', rate:5, color:'#f2cc60' },
  };

  window.FOOD_RESEARCH_GAME_PATCH = String.raw`
const FR_FORM_CATALOG = ${JSON.stringify(forms)};
const FR_FORM_MAP = Object.fromEntries(FR_FORM_CATALOG.map(function(form){return [form.id, form];}));
Object.keys(FOOD_FORMS).forEach(function(key){if(key!=='normal')delete FOOD_FORMS[key];});
FOOD_FORMS.normal.id='normal';
FOOD_FORMS.normal.rarity='normal';
FOOD_FORMS.normal.sk1Cd=Math.round((FOOD_FORMS.normal.sk1Cd||4000)*.5);
FOOD_FORMS.normal.sk2Cd=Math.round((FOOD_FORMS.normal.sk2Cd||12000)*.5);
if(currentForm&&currentForm.name===FOOD_FORMS.normal.name){currentForm.id='normal';currentForm.rarity='normal';currentForm.sk1Cd=FOOD_FORMS.normal.sk1Cd;currentForm.sk2Cd=FOOD_FORMS.normal.sk2Cd;}
FR_FORM_CATALOG.forEach(function(form){
  FOOD_FORMS[form.id] = {
    id:form.id, name:form.name, emoji:form.emoji, passive:form.passive,
    pIcon:form.emoji, sk1Icon:'1', sk2Icon:'2', sk1Name:form.skill1, sk2Name:form.skill2,
    sk1Cd:form.skill1Cooldown*1000,
    sk2Cd:form.skill2Cooldown*1000,
    bulletColor:form.color, bulletDmg:form.rarity==='top'?16.5:form.rarity==='noble'?15:form.rarity==='rare'?13.5:12,
    spreadCount:0, speedBonus:0,
    defBonus:form.id==='potato_armor'?.20:form.id==='onion_guard'?.10:0,
    portrait:form.portrait, battle:form.battle, passiveIcon:form.passiveIcon,
    skill1Asset:form.skill1Icon, skill2Asset:form.skill2Icon, rarity:form.rarity
  };
});

const frFormImages = {};
function frImg(formId,key){
  const cacheKey=formId+':'+key;
  if(frFormImages[cacheKey])return frFormImages[cacheKey];
  const form=FR_FORM_MAP[formId];
  if(!form||!form[key])return null;
  const img=new Image();img.decoding='async';img.src=form[key];frFormImages[cacheKey]=img;
  return img;
}
const frCooldownStyle=document.createElement('style');
frCooldownStyle.textContent='.skCd{display:none!important;position:absolute;inset:0;border-radius:17px;align-items:center;justify-content:center;background:rgba(2,6,23,.76);color:#fff;font:900 16px/1 sans-serif;letter-spacing:0;z-index:3;pointer-events:none;text-shadow:0 1px 3px #000}.skCd[style*="flex"]{display:flex!important}';
document.head.appendChild(frCooldownStyle);
const frBattleSheets={};
const FR_BATTLE_CELL=128;
const FR_BATTLE_POSES=[
  {x:0,y:2,sx:1,sy:1,r:-.012},
  {x:-2,y:-2,sx:1.025,sy:.985,r:-.032},
  {x:0,y:-6,sx:.985,sy:1.035,r:.008},
  {x:2,y:-2,sx:1.02,sy:.99,r:.032}
];
function frBuildBattleSheet(formId,img){
  if(frBattleSheets[formId])return frBattleSheets[formId];
  if(!img||!img.complete||!img.naturalWidth)return null;
  const sheet=document.createElement('canvas');sheet.width=FR_BATTLE_CELL*4;sheet.height=FR_BATTLE_CELL;
  const sctx=sheet.getContext('2d');sctx.imageSmoothingEnabled=false;
  FR_BATTLE_POSES.forEach(function(pose,index){
    sctx.save();sctx.beginPath();sctx.rect(index*FR_BATTLE_CELL,0,FR_BATTLE_CELL,FR_BATTLE_CELL);sctx.clip();
    sctx.translate(index*FR_BATTLE_CELL+FR_BATTLE_CELL/2+pose.x,FR_BATTLE_CELL/2+pose.y);
    sctx.rotate(pose.r);sctx.scale(pose.sx,pose.sy);
    sctx.drawImage(img,-53,-53,106,106);sctx.restore();
  });
  frBattleSheets[formId]=sheet;return sheet;
}
function frIsRival(e){return typeof rivalEnemies!=='undefined'&&Array.isArray(rivalEnemies)&&rivalEnemies.indexOf(e)>=0;}
function frForEachEnemy(fn){
  enemies.forEach(fn);
  if(boss&&!boss._defeated)fn(boss);
  if(typeof rivalFightActive!=='undefined'&&rivalFightActive&&typeof rivalEnemies!=='undefined')rivalEnemies.forEach(function(r){if(!r.defeated)fn(r);});
}
function frApplyDamage(e,amount){
  if(e.takeDamage)e.takeDamage(amount);
  else if(frIsRival(e)&&typeof hitRival==='function')hitRival(e.x,e.y,amount,1-(e.r||28));
  else e.hp-=amount;
}
function frFormDamageMultiplier(){
  if(!currentForm)return 1;
  const now=performance.now(),id=currentForm.id;
  let mult=1;
  if(id==='black_garlic_void')mult*=1.12;
  if(id==='salmon_ronin'&&now<(window.frSalmonBuffUntil||0))mult*=1.25;
  if(id==='beef_berserker'&&player.maxHp>0)mult*=1+.45*(1-Math.max(0,player.hp)/player.maxHp);
  if(id==='lobster_general'&&now<(window.frLobsterGuardUntil||0))mult*=1.25;
  return mult;
}
function frFormAttackSpeedMultiplier(){
  if(!currentForm)return 1;
  const now=performance.now(),id=currentForm.id;
  if(id==='salmon_ronin'&&now<(window.frSalmonBuffUntil||0))return 1.25;
  if(id==='beef_berserker'&&player.maxHp>0)return 1+.55*(1-Math.max(0,player.hp)/player.maxHp);
  return 1;
}
function frActiveTraining(){
  return (typeof charSlots!=='undefined'&&charSlots[activeChar]&&charSlots[activeChar].training)||tr||{};
}
function frSkillPowerMultiplier(){
  return 1+(frActiveTraining().skillPower||0)*FR_BALANCE.training.skillDamagePerLevel;
}
let frCoffeeMomentum=0,frCoffeeMoveAt=performance.now();
function frFormMoveMultiplier(){
  if(!currentForm)return 1;
  const now=performance.now(),dt=Math.min(80,Math.max(0,now-frCoffeeMoveAt));frCoffeeMoveAt=now;
  const id=currentForm.id,moving=Math.hypot(jDx||0,jDy||0)>.08||keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown||keys.KeyA||keys.KeyD||keys.KeyW||keys.KeyS;
  if(id==='coffee_pilot')frCoffeeMomentum=Math.max(0,Math.min(1,frCoffeeMomentum+(moving?dt/4000:-dt/1200)));
  else frCoffeeMomentum=0;
  let mult=id==='coffee_pilot'?1+frCoffeeMomentum*.28:1;
  if(id==='coffee_pilot'&&now<(window.frCoffeeOverdriveUntil||0))mult*=1.25;
  if(id==='salmon_ronin'&&now<(window.frSalmonBuffUntil||0))mult*=1.25;
  return mult;
}
function frDamage(amount,radius,color,applySkillPower){
  const skillMult=applySkillPower===false?1:frSkillPowerMultiplier();
  frForEachEnemy(function(e){if(radius==null||Math.hypot(e.x-player.x,e.y-player.y)<=radius){frApplyDamage(e,amount*(window._curAtkMult||atkMult)*frFormDamageMultiplier()*skillMult);if(color)burst(e.x,e.y,color,5);}});
}
function frSkillBullet(x,y,vx,vy,color,damage,radius,pierce,burn,options){
  const mult=(window._curAtkMult||atkMult)*frFormDamageMultiplier()*frSkillPowerMultiplier(),opt=options||{};
  const shot=new Bullet(x,y,vx,vy,damage*mult,color,radius,!!pierce,!!opt.homing,!!burn);
  if(opt.chain){shot.frChain=true;shot.frChainHits=new Set();shot.frChainRange=opt.chainRange||110;shot.frChainDamage=opt.chainDamage||.3;shot.frChainMax=opt.chainMax||2;}
  bullets.push(shot);return shot;
}
function frRadial(count,speed,damage,color,pierce,burn){
  for(let i=0;i<count;i++){const a=Math.PI*2*i/count;frSkillBullet(player.x,player.y,Math.cos(a)*speed,Math.sin(a)*speed,color,damage,7,pierce,burn);}
}
function frFan(count,damage,color,pierce,burn){
  for(let i=0;i<count;i++){const a=-Math.PI/2+(i-(count-1)/2)*0.11;frSkillBullet(player.x,player.y,Math.cos(a)*9,Math.sin(a)*9,color,damage,8,pierce,burn);}
}
function frForwardFan(count,spread,speed,damage,color,pierce,burn,options){
  for(let i=0;i<count;i++){const t=count<=1?.5:i/(count-1),a=-Math.PI/2-spread/2+spread*t;frSkillBullet(player.x,player.y,Math.cos(a)*speed,Math.sin(a)*speed,color,damage,8,pierce,burn,options);}
}
function frHeal(amount){const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+amount);const healed=Math.max(0,Math.round(player.hp-before));if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;updateHUD();addText(healed>0?'+'+healed+' HP':'HP 已滿',player.x,player.y-28,healed>0?'#22c55e':'#86efac');return healed;}
function frClearBullets(radius,reflect){
  let cleared=0;
  for(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];if(radius==null||Math.hypot(b.x-player.x,b.y-player.y)<=radius){if(reflect)frSkillBullet(b.x,b.y,-b.vx,-b.vy,'#67e8f9',Math.max(12,b.dmg||12),7,true,false);eBullets.splice(i,1);cleared++;}}
  return cleared;
}
function frCurrentSlowFactor(e,now){
  const effects=(e._frSlowEffects||[]).filter(function(effect){return effect.until>now;});
  e._frSlowEffects=effects;
  if(!effects.length){e._frSlowUntil=0;e._frSlowFactor=1;return 1;}
  e._frSlowUntil=Math.max.apply(null,effects.map(function(effect){return effect.until;}));
  e._frSlowFactor=Math.min.apply(null,effects.map(function(effect){return effect.factor;}));
  return e._frSlowFactor;
}
function frSlowAll(ms,factor){
  const now=performance.now(),slow=Math.max(.08,Math.min(1,factor||.45));
  frForEachEnemy(function(e){e._frSlowEffects=(e._frSlowEffects||[]).filter(function(effect){return effect.until>now;});e._frSlowEffects.push({until:now+ms,factor:slow});frCurrentSlowFactor(e,now);});
}
function frCleanse(){player.burnTimer=0;player.poisoned=false;player.poisonTick=0;player.frozenTimer=0;window.frPoisonUntil=0;window.frSlowUntil=0;window.frAttackDownUntil=0;window.frParalyzedUntil=0;}

/* Lightweight skill presentation layer. It uses the existing form art and canvas
   primitives so every form gets readable feedback without extra bitmap assets. */
const frFxCanvas=document.createElement('canvas');
frFxCanvas.id='frFxCanvas';
frFxCanvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;z-index:18;pointer-events:none;';
document.getElementById('gc').appendChild(frFxCanvas);
const frFxCtx=frFxCanvas.getContext('2d');
const frFxState={rings:[],motes:[],slashes:[],bolts:[],grounds:[],flash:null,cutin:null,shakeUntil:0,shakePower:0,freezeUntil:0};
const frFreezeCanvas=document.createElement('canvas');
const frFxMobile=(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches)||Math.min(window.innerWidth||9999,window.innerHeight||9999)<=520;
const frFxCaps=frFxMobile?{rings:14,motes:90,slashes:18,bolts:14,grounds:6}:{rings:24,motes:150,slashes:32,bolts:24,grounds:10};
let frFxRaf=0;
let frAudioContext=null;
function frResizeFx(){if(frFxCanvas.width!==CW||frFxCanvas.height!==CH){frFxCanvas.width=CW;frFxCanvas.height=CH;frFreezeCanvas.width=CW;frFreezeCanvas.height=CH;}}
function frRgba(color,alpha){
  if(!color||color.charAt(0)!=='#')return 'rgba(255,255,255,'+alpha+')';
  let h=color.slice(1);if(h.length===3)h=h.split('').map(function(v){return v+v;}).join('');
  const n=parseInt(h,16);return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+alpha+')';
}
function frEaseOut(t){return 1-Math.pow(1-t,3);}
function frTrimFx(key){const list=frFxState[key],cap=frFxCaps[key];if(list&&cap&&list.length>cap)list.splice(0,list.length-cap);}
function frFxHasWork(now){return frFxState.rings.length||frFxState.motes.length||frFxState.slashes.length||frFxState.bolts.length||frFxState.grounds.length||frFxState.flash||frFxState.cutin||now<frFxState.shakeUntil||now<frFxState.freezeUntil;}
function frEnsureFxLoop(){if(!frFxRaf&&!document.hidden)frFxRaf=_origRaf(frFxLoop);}
function frRingFx(x,y,color,maxRadius,duration,width,delay){frFxState.rings.push({x:x,y:y,color:color,r:maxRadius,d:duration||450,w:width||4,s:performance.now()+(delay||0)});frTrimFx('rings');frEnsureFxLoop();}
function frGroundFx(x,y,color,maxRadius,duration,delay){frFxState.grounds.push({x:x,y:y,color:color,r:maxRadius,d:duration||900,s:performance.now()+(delay||0)});frTrimFx('grounds');frEnsureFxLoop();}
function frMoteFx(x,y,count,color,kind,spread,speed,duration,delay){
  const start=performance.now()+(delay||0);
  for(let i=0;i<count;i++){
    const a=Math.random()*Math.PI*2,sp=(speed||3)*(.45+Math.random()*.8),rad=Math.random()*(spread||20);
    frFxState.motes.push({x:x+Math.cos(a)*rad,y:y+Math.sin(a)*rad,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-(kind==='heal'||kind==='snow'?1.5:0),size:3+Math.random()*5,color:color,kind:kind||'spark',d:(duration||650)*(.75+Math.random()*.4),s:start});
  }
  frTrimFx('motes');frEnsureFxLoop();
}
function frSlashFx(x,y,color,length,angle,duration,delay,width){frFxState.slashes.push({x:x,y:y,color:color,len:length,a:angle,d:duration||340,s:performance.now()+(delay||0),w:width||8});frTrimFx('slashes');frEnsureFxLoop();}
function frBoltFx(x1,y1,x2,y2,color,duration,delay,width){frFxState.bolts.push({x1:x1,y1:y1,x2:x2,y2:y2,color:color,d:duration||260,s:performance.now()+(delay||0),w:width||4,seed:Math.random()*999});frTrimFx('bolts');frEnsureFxLoop();}
function frFlashFx(color,duration,alpha){frFxState.flash={color:color,d:duration||240,s:performance.now(),a:alpha||.32};frEnsureFxLoop();}
function frShakeFx(power,duration){frFxState.shakePower=Math.max(frFxState.shakePower,power||4);frFxState.shakeUntil=Math.max(frFxState.shakeUntil,performance.now()+(duration||300));frEnsureFxLoop();}
function frFreezeFx(duration){frResizeFx();const fctx=frFreezeCanvas.getContext('2d');fctx.clearRect(0,0,CW,CH);fctx.drawImage(canvas,0,0,CW,CH);frFxState.freezeUntil=performance.now()+(duration||65);frEnsureFxLoop();}
function frSoundFx(profile,level){
  try{
    if(!frAudioContext)frAudioContext=new (window.AudioContext||window.webkitAudioContext)();
    if(frAudioContext.state==='suspended')frAudioContext.resume();
    const ac=frAudioContext,now=ac.currentTime,osc=ac.createOscillator(),gain=ac.createGain();
    let f1=level===2?155:260,f2=level===2?70:520,type='sine';
    if(profile==='fire'||profile==='rage'){f1=120;f2=55;type='sawtooth';}
    else if(profile==='lightning'){f1=720;f2=170;type='square';}
    else if(profile==='heal'||profile==='ward'){f1=390;f2=780;type='sine';}
    else if(profile==='ice'||profile==='slow'){f1=620;f2=250;type='triangle';}
    else if(profile==='void'){f1=95;f2=38;type='sawtooth';}
    osc.type=type;osc.frequency.setValueAtTime(f1,now);osc.frequency.exponentialRampToValueAtTime(Math.max(25,f2),now+(level===2?.42:.18));
    gain.gain.setValueAtTime(.0001,now);gain.gain.exponentialRampToValueAtTime(level===2?.075:.045,now+.018);gain.gain.exponentialRampToValueAtTime(.0001,now+(level===2?.46:.22));
    osc.connect(gain);gain.connect(ac.destination);osc.start(now);osc.stop(now+(level===2?.48:.24));
  }catch(e){}
  if(navigator.vibrate)navigator.vibrate(level===2?[35,35,55]:18);
}
function frProfileFor(id){
  return ({onion_guard:'ward',popcorn:'burst',healing_mushroom:'heal',garlic_knight:'ward',chili_sprite:'fire',lotus_archer:'slash',potato_armor:'slam',lemon_battery:'lightning',cheese_mage:'slow',honey_priest:'heal',coffee_pilot:'speed',octopus_samurai:'slash',salmon_ronin:'slash',beef_berserker:'rage',puffer_alchemist:'poison',black_garlic_void:'void',lobster_general:'barrage',truffle_thunder:'lightning',dragonfruit_emperor:'fire',peach_divine:'heal',cocoa_popsicle_wargod:'ice'})[id]||'burst';
}
function frProfileFx(id,level,color){
  const x=player.x,y=player.y,p=frProfileFor(id),strong=level===2;
  if(p==='ward'){
    frRingFx(x,y,color,strong?170:105,strong?780:470,strong?9:5);frRingFx(x,y,'#ffffff',strong?135:78,strong?680:420,3,strong?90:45);frMoteFx(x,y,strong?30:14,color,'diamond',strong?110:65,strong?3.8:2.6,strong?900:620);
  }else if(p==='burst'){
    frMoteFx(x,y,strong?55:26,color,'square',strong?160:90,strong?7:5,strong?850:560);for(let i=0;i<(strong?12:6);i++)frSlashFx(x,y,color,strong?170:105,Math.PI*2*i/(strong?12:6),420,i*16,strong?10:6);
  }else if(p==='heal'){
    frGroundFx(x,y,color,strong?175:105,strong?1200:750);frRingFx(x,y,'#ffffff',strong?150:90,strong?850:520,4);frMoteFx(x,y,strong?48:22,color,'heal',strong?125:75,strong?3.6:2.5,strong?1250:820);
  }else if(p==='fire'){
    frGroundFx(x,y,'#ef4444',strong?200:125,strong?1500:850);for(let i=0;i<(strong?7:4);i++)frSlashFx(x,y,color,strong?250:150,-Math.PI/2+(i-(strong?3:1.5))*.18,strong?650:430,i*45,strong?18:11);frMoteFx(x,y,strong?60:28,'#fbbf24','flame',strong?170:100,strong?6:4,strong?1050:700);
  }else if(p==='slash'){
    for(let i=0;i<(strong?8:4);i++)frSlashFx(x,y,color,strong?270:170,-2.5+i*(strong?.34:.62),strong?520:350,i*35,strong?14:9);frMoteFx(x,y,strong?32:14,'#ffffff','spark',strong?150:80,strong?5:3,strong?620:430);
  }else if(p==='slam'){
    frGroundFx(x,y,color,strong?240:140,strong?1300:750);for(let i=0;i<(strong?4:2);i++)frRingFx(x,y,i%2?'#ffffff':color,(strong?90:60)+i*(strong?48:35),strong?780:480,strong?9:6,i*75);frMoteFx(x,y,strong?42:20,color,'rock',strong?170:95,strong?5.5:3.5,strong?900:600);
  }else if(p==='lightning'){
    const n=strong?11:5;for(let i=0;i<n;i++){const tx=Math.random()*CW,ty=90+Math.random()*CH*.58;frBoltFx(tx+30-Math.random()*60,0,tx,ty,color,strong?360:250,i*(strong?45:35),strong?7:4);}frFlashFx('#fde047',strong?330:190,strong?.34:.2);
  }else if(p==='slow'||p==='ice'){
    frGroundFx(x,y,p==='ice'?'#67e8f9':color,strong?245:155,strong?1700:1000);for(let i=0;i<(strong?5:3);i++)frRingFx(x,y,p==='ice'?'#bae6fd':color,(strong?100:70)+i*(strong?42:32),strong?1200:700,3,i*120);frMoteFx(x,y,strong?55:24,p==='ice'?'#e0f2fe':color,p==='ice'?'snow':'diamond',strong?200:110,strong?3.2:2.2,strong?1500:900);
  }else if(p==='speed'){
    for(let i=0;i<(strong?12:6);i++)frSlashFx(x,y,color,strong?230:140,-Math.PI/2+(Math.random()-.5)*.3,strong?650:390,i*32,strong?8:5);frMoteFx(x,y,strong?38:18,'#fef3c7','spark',strong?150:85,strong?7:4,strong?700:430);
  }else if(p==='rage'){
    frGroundFx(x,y,'#ef4444',strong?210:125,strong?1300:750);frRingFx(x,y,'#fecaca',strong?180:110,strong?650:420,strong?12:7);frMoteFx(x,y,strong?50:24,'#fb7185','flame',strong?150:85,strong?6:4,strong?850:550);frFlashFx('#7f1d1d',strong?360:210,strong?.38:.22);
  }else if(p==='poison'){
    frGroundFx(x,y,'#84cc16',strong?235:145,strong?1800:1050);frMoteFx(x,y,strong?64:30,'#bef264','bubble',strong?195:110,strong?3.8:2.6,strong?1450:900);frRingFx(x,y,'#a3e635',strong?205:125,strong?1050:650,5);
  }else if(p==='void'){
    frGroundFx(x,y,'#6d28d9',strong?260:170,strong?1750:1100);for(let i=0;i<(strong?6:3);i++)frRingFx(x,y,i%2?'#a78bfa':'#312e81',(strong?240:150)-i*(strong?30:28),strong?1200:700,strong?8:5,i*85);frMoteFx(x,y,strong?60:28,'#c4b5fd','void',strong?210:125,strong?-5:-3,strong?1200:750);frFlashFx('#1e1b4b',strong?420:240,strong?.42:.24);
  }else if(p==='barrage'){
    for(let i=0;i<(strong?20:10);i++)frSlashFx(x,y,color,strong?230:145,Math.PI*2*i/(strong?20:10),strong?600:380,i*18,strong?9:6);frRingFx(x,y,'#fb7185',strong?205:125,strong?720:450,strong?8:5);
  }
}
function frPlayCast(level,id,color,name){
  const now=performance.now(),profile=frProfileFor(id),strong=level===2;
  frSoundFx(profile,level);frProfileFx(id,level,color);frShakeFx(strong?7:3,strong?440:210);
  if(strong){frFreezeFx(35);frFlashFx(color,220,.14);frFxState.cutin={id:id,name:name,color:color,s:now,d:480};}
  else{frRingFx(player.x,player.y,'#ffffff',72,310,3);}
}
function frDrawMote(m,t,a){
  const life=(t-m.s)/m.d,x=m.x+m.vx*life*55,y=m.y+m.vy*life*55+(m.kind==='rock'?life*life*85:0),sz=m.size*(1-life*.45);
  frFxCtx.save();frFxCtx.translate(x,y);frFxCtx.globalAlpha=a;frFxCtx.fillStyle=m.color;frFxCtx.strokeStyle=m.color;
  if(m.kind==='bubble'){frFxCtx.lineWidth=2;frFxCtx.beginPath();frFxCtx.arc(0,0,sz,0,Math.PI*2);frFxCtx.stroke();}
  else if(m.kind==='heal'){frFxCtx.rotate(life*2);frFxCtx.fillRect(-sz*.28,-sz,sz*.56,sz*2);frFxCtx.fillRect(-sz,-sz*.28,sz*2,sz*.56);}
  else if(m.kind==='snow'){frFxCtx.rotate(life*3);frFxCtx.fillRect(-sz*.2,-sz,sz*.4,sz*2);frFxCtx.rotate(Math.PI/2);frFxCtx.fillRect(-sz*.2,-sz,sz*.4,sz*2);}
  else if(m.kind==='flame'){frFxCtx.rotate(Math.atan2(m.vy,m.vx)+Math.PI/2);frFxCtx.beginPath();frFxCtx.moveTo(0,-sz*1.6);frFxCtx.lineTo(sz,sz);frFxCtx.lineTo(-sz,sz);frFxCtx.closePath();frFxCtx.fill();}
  else if(m.kind==='void'){const pull=1-life;frFxCtx.translate(-m.vx*life*70,-m.vy*life*70);frFxCtx.rotate(life*8);frFxCtx.fillRect(-sz/2,-sz/2,sz,sz);frFxCtx.globalAlpha*=pull;}
  else{frFxCtx.rotate(life*5);frFxCtx.fillRect(-sz/2,-sz/2,sz,sz);}
  frFxCtx.restore();
}
function frFxLoop(now){
  frFxRaf=0;
  if(document.hidden)return;
  frResizeFx();frFxCtx.clearRect(0,0,CW,CH);
  if(now<frFxState.freezeUntil){frFxCtx.drawImage(frFreezeCanvas,0,0,CW,CH);}
  frFxState.grounds=frFxState.grounds.filter(function(g){const t=(now-g.s)/g.d;if(t<0)return true;if(t>=1)return false;const e=frEaseOut(t);frFxCtx.save();frFxCtx.globalAlpha=(1-t)*.34;frFxCtx.fillStyle=frRgba(g.color,.5);frFxCtx.beginPath();frFxCtx.ellipse(g.x,g.y+16,g.r*e,g.r*.42*e,0,0,Math.PI*2);frFxCtx.fill();frFxCtx.restore();return true;});
  frFxState.rings=frFxState.rings.filter(function(r){const t=(now-r.s)/r.d;if(t<0)return true;if(t>=1)return false;frFxCtx.save();frFxCtx.globalAlpha=1-t;frFxCtx.strokeStyle=r.color;frFxCtx.lineWidth=r.w*(1-t*.45);frFxCtx.shadowColor=r.color;frFxCtx.shadowBlur=frFxMobile?0:12;frFxCtx.beginPath();frFxCtx.arc(r.x,r.y,r.r*frEaseOut(t),0,Math.PI*2);frFxCtx.stroke();frFxCtx.restore();return true;});
  frFxState.slashes=frFxState.slashes.filter(function(s){const t=(now-s.s)/s.d;if(t<0)return true;if(t>=1)return false;const e=frEaseOut(t),dx=Math.cos(s.a)*s.len,dy=Math.sin(s.a)*s.len;frFxCtx.save();frFxCtx.globalAlpha=Math.sin(Math.PI*t);frFxCtx.strokeStyle=s.color;frFxCtx.lineWidth=s.w*(1-t*.5);frFxCtx.shadowColor=s.color;frFxCtx.shadowBlur=frFxMobile?0:14;frFxCtx.beginPath();frFxCtx.moveTo(s.x-dx*.18,s.y-dy*.18);frFxCtx.lineTo(s.x+dx*e,s.y+dy*e);frFxCtx.stroke();frFxCtx.restore();return true;});
  frFxState.bolts=frFxState.bolts.filter(function(b){const t=(now-b.s)/b.d;if(t<0)return true;if(t>=1)return false;frFxCtx.save();frFxCtx.globalAlpha=1-t*.75;frFxCtx.strokeStyle=b.color;frFxCtx.lineWidth=b.w;frFxCtx.shadowColor=b.color;frFxCtx.shadowBlur=frFxMobile?0:16;frFxCtx.beginPath();frFxCtx.moveTo(b.x1,b.y1);for(let i=1;i<7;i++){const q=i/7,j=Math.sin((i*13+b.seed)*5.17)*12*(1-q*.35);frFxCtx.lineTo(b.x1+(b.x2-b.x1)*q+j,b.y1+(b.y2-b.y1)*q);}frFxCtx.lineTo(b.x2,b.y2);frFxCtx.stroke();frFxCtx.restore();return true;});
  frFxState.motes=frFxState.motes.filter(function(m){const t=(now-m.s)/m.d;if(t<0)return true;if(t>=1)return false;frDrawMote(m,now,1-t);return true;});
  if(frFxState.flash){const f=frFxState.flash,t=(now-f.s)/f.d;if(t>=1)frFxState.flash=null;else if(t>=0){frFxCtx.fillStyle=frRgba(f.color,f.a*(1-t));frFxCtx.fillRect(0,0,CW,CH);}}
  if(frFxState.cutin){
    const c=frFxState.cutin,t=(now-c.s)/c.d;if(t>=1)frFxState.cutin=null;else if(t>=0){
      const enter=Math.min(1,t/.2),leave=t>.76?(1-t)/.24:1,alpha=Math.max(0,Math.min(enter,leave)),img=frImg(c.id,'skill2Icon');
      const size=Math.min(64,CW*.17),panelW=Math.min(CW*.48,size+150),panelH=Math.max(76,size+16),panelX=-panelW+(panelW+12)*frEaseOut(enter),panelY=Math.max(112,CH*.27-panelH/2);
      frFxCtx.save();frFxCtx.globalAlpha=alpha;frFxCtx.fillStyle='rgba(3,7,18,.78)';frFxCtx.strokeStyle=c.color;frFxCtx.lineWidth=2;frFxCtx.beginPath();frFxCtx.roundRect(panelX,panelY,panelW,panelH,10);frFxCtx.fill();frFxCtx.stroke();
      const iconX=panelX+12+size/2,iconY=panelY+panelH/2;frFxCtx.fillStyle='rgba(255,255,255,.94)';frFxCtx.beginPath();frFxCtx.arc(iconX,iconY,size*.44,0,Math.PI*2);frFxCtx.fill();if(img&&img.complete&&img.naturalWidth)frFxCtx.drawImage(img,iconX-size*.36,iconY-size*.36,size*.72,size*.72);
      frFxCtx.textAlign='left';frFxCtx.textBaseline='middle';frFxCtx.font='900 15px sans-serif';frFxCtx.fillStyle='#ffffff';frFxCtx.shadowColor='rgba(0,0,0,.85)';frFxCtx.shadowBlur=4;frFxCtx.fillText(c.name,panelX+size+20,panelY+panelH/2);frFxCtx.restore();
    }
  }
  if(now<frFxState.shakeUntil){const p=frFxState.shakePower*((frFxState.shakeUntil-now)/500),dx=(Math.random()-.5)*p*2,dy=(Math.random()-.5)*p*2;canvas.style.transform='translate('+dx+'px,'+dy+'px)';}
  else{canvas.style.transform='';frFxState.shakePower=0;}
  if(frFxHasWork(now))frEnsureFxLoop();
}

const frOriginalFire=fire;
fire=function(){
  frOriginalFire.apply(this,arguments);
  const b=bullets[bullets.length-1];if(!b)return;
  const id=currentForm.id;
  if(id==='popcorn'||id==='cocoa_popsicle_wargod')b.r*=1.55;
  if(id==='lotus_archer'||id==='black_garlic_void')b.pierce=true;
  if(id==='chili_sprite'||id==='dragonfruit_emperor')b.burn=true;
  if(id==='beef_berserker'){const missing=1-player.hp/player.maxHp;b.dmg*=1+missing*.8;}
  if(id==='lemon_battery'||id==='truffle_thunder'){if(Math.random()<(id==='truffle_thunder'?.45:.22)){setTimeout(function(){frDamage(id==='truffle_thunder'?10:6,115,'#fde047',false);},50);}}
  if(id==='cocoa_popsicle_wargod'){b.color='#67e8f9';b.dmg*=1.12;}
};

const FR_MINION_KITS=[
  [
    {name:'蹦糖追兵',icon:'◆',color:'#fb7185',move:'chase',pattern:'dash',cd:150,wind:42,speed:5.7,dmg:1.0},
    {name:'棒棒糖砲手',icon:'◎',color:'#60a5fa',move:'sway',pattern:'burst',cd:128,wind:38,speed:5.2,count:3,spread:.13,dmg:.72},
    {name:'爆米花魔偶',icon:'✦',color:'#fbbf24',move:'hover',pattern:'radial',cd:175,wind:48,speed:2.9,count:8,dmg:.55}
  ],
  [
    {name:'肉排突擊兵',icon:'▰',color:'#ef4444',move:'chase',pattern:'dash',cd:145,wind:44,speed:6.2,dmg:1.15},
    {name:'骨釘射手',icon:'➤',color:'#f8fafc',move:'sway',pattern:'predictive',cd:132,wind:46,speed:6.3,count:3,spread:.1,dmg:.78},
    {name:'絞肉機兵',icon:'◉',color:'#f97316',move:'hover',pattern:'spiral',cd:182,wind:52,speed:3.2,count:10,dmg:.58}
  ],
  [
    {name:'血椒蝙蝠',icon:'⌁',color:'#f43f5e',move:'zigzag',pattern:'twin',cd:112,wind:34,speed:5.4,spread:.3,dmg:.68},
    {name:'辣油侍從',icon:'▲',color:'#fb923c',move:'sway',pattern:'fan',cd:148,wind:44,speed:4.4,count:5,spread:.18,dmg:.62},
    {name:'灰燼術士',icon:'✹',color:'#dc2626',move:'hover',pattern:'radial',cd:190,wind:55,speed:3.1,count:12,dmg:.52}
  ],
  [
    {name:'藤蔓獵手',icon:'⌁',color:'#65a30d',move:'chase',pattern:'dash',cd:158,wind:46,speed:5.3,dmg:.95},
    {name:'孢子投手',icon:'●',color:'#a3e635',move:'sway',pattern:'lob',cd:138,wind:48,speed:2.25,count:3,spread:.16,dmg:.8},
    {name:'毒霧花妖',icon:'✾',color:'#84cc16',move:'hover',pattern:'fan',cd:176,wind:58,speed:3.3,count:7,spread:.22,dmg:.56}
  ],
  [
    {name:'飄魂',icon:'◌',color:'#c4b5fd',move:'blink',pattern:'aimed',cd:132,wind:52,speed:6.1,dmg:.95},
    {name:'提燈小鬼',icon:'◇',color:'#f59e0b',move:'sway',pattern:'burst',cd:142,wind:45,speed:4.9,count:4,spread:.09,dmg:.62},
    {name:'傘妖',icon:'☂',color:'#a78bfa',move:'hover',pattern:'spiral',cd:188,wind:56,speed:3.2,count:10,dmg:.55}
  ],
  [
    {name:'疾風足輕',icon:'»',color:'#f59e0b',move:'zigzag',pattern:'dash',cd:142,wind:38,speed:6.8,dmg:1.0},
    {name:'石弩兵',icon:'➤',color:'#a16207',move:'sway',pattern:'predictive',cd:145,wind:50,speed:6.5,count:3,spread:.08,dmg:.8},
    {name:'龍氣僧',icon:'◉',color:'#fbbf24',move:'hover',pattern:'wave',cd:184,wind:54,speed:3.8,count:7,spread:.27,dmg:.58}
  ],
  [
    {name:'雪球怪',icon:'●',color:'#bae6fd',move:'chase',pattern:'lob',cd:138,wind:44,speed:2.5,count:2,spread:.14,dmg:.9},
    {name:'冰針精',icon:'✧',color:'#38bdf8',move:'sway',pattern:'twin',cd:105,wind:30,speed:6.5,spread:.12,dmg:.62},
    {name:'暴雪靈',icon:'❉',color:'#7dd3fc',move:'hover',pattern:'pulse',cd:195,wind:62,speed:2.7,count:14,dmg:.48}
  ],
  [
    {name:'軟木塞兵',icon:'▰',color:'#d97706',move:'chase',pattern:'dash',cd:146,wind:40,speed:6.4,dmg:1.0},
    {name:'氣泡釀師',icon:'○',color:'#c084fc',move:'sway',pattern:'twin',cd:122,wind:42,speed:3.1,spread:.22,dmg:.72,size:10},
    {name:'酒瓶舞者',icon:'♢',color:'#8b5cf6',move:'hover',pattern:'fan',cd:172,wind:54,speed:3.7,count:7,spread:.24,dmg:.55}
  ],
  [
    {name:'曦光蝶',icon:'✧',color:'#fde047',move:'zigzag',pattern:'sweep',cd:124,wind:36,speed:5.1,count:4,spread:.32,dmg:.6},
    {name:'稜鏡祭司',icon:'◇',color:'#fef08a',move:'sway',pattern:'cross',cd:165,wind:55,speed:4.0,count:8,dmg:.58},
    {name:'太陽精靈',icon:'☀',color:'#facc15',move:'hover',pattern:'radial',cd:188,wind:58,speed:3.4,count:12,dmg:.52}
  ],
  [
    {name:'蝦槍兵',icon:'➤',color:'#fb7185',move:'chase',pattern:'dash',cd:138,wind:38,speed:6.6,dmg:1.05},
    {name:'墨汁槍手',icon:'●',color:'#334155',move:'sway',pattern:'burst',cd:126,wind:42,speed:5.0,count:4,spread:.14,dmg:.66,size:8},
    {name:'水母雷達',icon:'◉',color:'#22d3ee',move:'hover',pattern:'pulse',cd:192,wind:62,speed:2.8,count:14,dmg:.5}
  ]
];
function frEnemyKit(e){const map=Math.max(0,Math.min(9,e._frMap==null?currentBgIdx:e._frMap));return FR_MINION_KITS[map][Math.max(0,Math.min(2,(e.type||1)-1))];}
function frEnemyInit(e){
  if(e._frAiReady)return;e._frAiReady=true;e._frMap=currentBgIdx;e._frStartX=e.x;e._frHoverY=92+(e.type||1)*54+Math.random()*45;e._frAttackCd=55+Math.random()*75;e._frPending=null;e._frDashFrames=0;e._frBlinkCd=90+Math.random()*80;e._frPhase=Math.random()*Math.PI*2;
}
function frEnemyAim(e,predict){
  const lead=predict?24:0,px=player.x+(player.vx||0)*lead,py=player.y+(player.vy||0)*lead;
  return Math.atan2(py-e.y,px-e.x);
}
function frEnemyShot(e,angle,speed,dmg,color,size){eBullets.push(new Bullet(e.x,e.y+8,Math.cos(angle)*speed,Math.sin(angle)*speed,Math.max(4,Math.round(e.atk*dmg)),color,size||6));}
function frEnemyBeginAttack(e,k){
  const aim=frEnemyAim(e,k.pattern==='predictive'),line=['dash','aimed','predictive','lob'].includes(k.pattern),circle=['radial','spiral','pulse','cross'].includes(k.pattern);
  e._frPending={fireAt:e.timer+k.wind,aim:aim,targetX:player.x,targetY:player.y};
  e._frWarn={until:e.timer+k.wind,kind:line?'line':circle?'circle':'cone',aim:aim,color:k.color,name:k.name};
}
function frEnemyFire(e,k,p){
  const a=p.aim,speed=k.speed||4,count=k.count||1,spread=k.spread||.16,size=k.size||6;
  if(k.pattern==='dash'){
    e._frDashFrames=26;e._frDashVx=Math.cos(a)*speed;e._frDashVy=Math.sin(a)*speed;burst(e.x,e.y,k.color,8);
  }else if(k.pattern==='aimed')frEnemyShot(e,a,speed,k.dmg,k.color,size);
  else if(k.pattern==='predictive'||k.pattern==='burst'||k.pattern==='lob'){
    for(let i=0;i<count;i++)frEnemyShot(e,a+(i-(count-1)/2)*spread,speed,k.dmg,k.color,size);
  }else if(k.pattern==='twin'){
    frEnemyShot(e,a-spread,speed,k.dmg,k.color,size);frEnemyShot(e,a+spread,speed,k.dmg,k.color,size);
  }else if(k.pattern==='fan'||k.pattern==='wave'||k.pattern==='sweep'){
    for(let i=0;i<count;i++)frEnemyShot(e,a+(i-(count-1)/2)*spread,speed,k.dmg,k.color,size);
  }else if(k.pattern==='cross'){
    for(let i=0;i<count;i++)frEnemyShot(e,e._frPhase+Math.PI*2*i/count,speed,k.dmg,k.color,size);e._frPhase+=Math.PI/8;
  }else{
    const off=k.pattern==='spiral'?e._frPhase:0;
    for(let i=0;i<count;i++)frEnemyShot(e,off+Math.PI*2*i/count,speed,k.dmg,k.color,size);e._frPhase+=k.pattern==='spiral'?.34:.12;
  }
  if(k.pattern!=='dash')burst(e.x,e.y,k.color,Math.min(12,4+count));
}
function frEnemyMove(e,k,sm){
  const descend=(e.type===1?1.05:e.type===2?.82:.66)*(1+stage*.018)*sm;
  if(e._frDashFrames>0){e.x+=e._frDashVx*sm;e.y+=e._frDashVy*sm;e._frDashFrames--;return;}
  if(k.move==='chase'){e.x+=Math.sign(player.x-e.x)*.7*sm;e.y+=descend;}
  else if(k.move==='zigzag'){e.x+=Math.sin(e.timer*.105+e._frPhase)*2.1*sm;e.y+=descend*.9;}
  else if(k.move==='blink'){
    e._frBlinkCd--;if(e._frBlinkCd<=0&&e.y>35){e.x=Math.max(35,Math.min(CW-35,player.x+(Math.random()>.5?125:-125)));e._frBlinkCd=145+Math.random()*55;burst(e.x,e.y,k.color,8);}e.y+=descend*.7;
  }else if(k.move==='hover'){
    if(e.y<e._frHoverY)e.y+=descend;else{e.x=e._frStartX+Math.sin(e.timer*.025+e._frPhase)*65;e.y+=Math.sin(e.timer*.035+e._frPhase)*.24*sm;}
  }else{e.x=e._frStartX+Math.sin(e.timer*.045+e._frPhase)*52;e.y+=descend*.82;}
  e.x=Math.max(22,Math.min(CW-22,e.x));
}
if(typeof Enemy!=='undefined'){
  const frEnemyDraw=Enemy.prototype.draw;
  Enemy.prototype.update=function(){
    frEnemyInit(this);if(this.hp<=0)return;
    const k=frEnemyKit(this),frozen=this.frozenTimer>0?.4:1;if(this.frozenTimer>0)this.frozenTimer--;
    const slowed=frCurrentSlowFactor(this,performance.now()),sm=frozen*slowed;
    this.timer++;frEnemyMove(this,k,sm);
    if(this._frPending&&this.timer>=this._frPending.fireAt){frEnemyFire(this,k,this._frPending);this._frPending=null;this._frWarn=null;this._frAttackCd=Math.max(72,k.cd-Math.min(42,stage*2))+Math.random()*28;}
    else if(!this._frPending&&this.y>28&&this.y<CH*.68){this._frAttackCd-=sm;if(this._frAttackCd<=0)frEnemyBeginAttack(this,k);}
    if(this.y>CH+75||this.x<-90||this.x>CW+90)this.hp=0;
  };
  Enemy.prototype.draw=function(){
    frEnemyInit(this);const k=frEnemyKit(this),w=this._frWarn;
    if(w&&this.timer<w.until){
      const remain=Math.max(0,(w.until-this.timer)/(k.wind||40)),pulse=.35+.35*Math.sin(this.timer*.7);
      ctx.save();ctx.globalAlpha=.32+pulse*(1-remain);ctx.strokeStyle=w.color;ctx.fillStyle=frRgba(w.color,.12);ctx.lineWidth=2.5;ctx.setLineDash([7,5]);
      if(w.kind==='line'){ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x+Math.cos(w.aim)*Math.max(CW,CH),this.y+Math.sin(w.aim)*Math.max(CW,CH));ctx.stroke();}
      else if(w.kind==='circle'){ctx.beginPath();ctx.arc(this.x,this.y,28+(1-remain)*48,0,Math.PI*2);ctx.fill();ctx.stroke();}
      else{ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.arc(this.x,this.y,105,w.aim-.48,w.aim+.48);ctx.closePath();ctx.fill();ctx.stroke();}
      ctx.setLineDash([]);ctx.restore();
    }
    frEnemyDraw.call(this);
    ctx.save();ctx.textAlign='center';ctx.font='900 10px sans-serif';ctx.fillStyle=k.color;ctx.strokeStyle='rgba(15,23,42,.85)';ctx.lineWidth=3;const label=(w&&this.timer<w.until?k.icon+' '+k.name:k.icon);ctx.strokeText(label,this.x,this.y-49);ctx.fillText(label,this.x,this.y-49);ctx.restore();
  };
}

const frOriginalBuildStage=buildStage;
buildStage=function(s,keepPlayerPos){
  frOriginalBuildStage(s,keepPlayerPos);
  window.frPeachRevived=false;window.frSalmonBuffUntil=0;window.frLobsterGuardUntil=0;window.frCoffeeOverdriveUntil=0;frCoffeeMomentum=0;
  if(currentBgIdx===10){spawnQueue=[];stageInitSpawnLen=0;bossIntroTimer=1;mapCameraTargetY=0;}
};
const frOriginalInitCharSlots=initCharSlots;
initCharSlots=function(){
  frOriginalInitCharSlots();
  charSlots.forEach(function(ch,index){
    if(ch.formId!=='normal')return;
    ch.maxHp+=10;ch.hp+=10;
    if(index===activeChar){player.maxHp=ch.maxHp;player.hp=ch.hp;}
  });
  updateHUD();
};

function frApplySingleSlow(target,ms,factor){
  const now=performance.now();target._frSlowEffects=(target._frSlowEffects||[]).filter(function(effect){return effect.until>now;});target._frSlowEffects.push({until:now+ms,factor:factor});frCurrentSlowFactor(target,now);
}
function frFormRegisterHit(target,wasAlive){
  if(!target||!currentForm)return;
  const id=currentForm.id;
  if(target._frSkipChillOnce)target._frSkipChillOnce=false;
  else if(id==='cocoa_popsicle_wargod'&&target.hp>0){
    target._frChillStacks=(target._frChillStacks||0)+1;
    if(target._frChillStacks>=5){
      target._frChillStacks=0;target.frozenTimer=Math.max(target.frozenTimer||0,110);frApplySingleSlow(target,1800,.15);addText('碎冰爆破',target.x,target.y-28,'#67e8f9',13,-.5);burst(target.x,target.y,'#bae6fd',18);
      frForEachEnemy(function(near){if(near!==target&&near.hp>0&&Math.hypot(near.x-target.x,near.y-target.y)<=85){near._frSkipChillOnce=true;frApplyDamage(near,18*(window._curAtkMult||atkMult));}});
    }
  }
  if(wasAlive&&target.hp<=0&&id==='dragonfruit_emperor'&&!target._frNoDragonBlastOnce&&Math.random()<.35){
    burst(target.x,target.y,'#f97316',24);addText('龍焰爆破',target.x,target.y-28,'#fbbf24',12,-.5);
    frForEachEnemy(function(near){if(near!==target&&near.hp>0&&Math.hypot(near.x-target.x,near.y-target.y)<=95){near._frNoDragonBlastOnce=true;frApplyDamage(near,28*(window._curAtkMult||atkMult));near._frNoDragonBlastOnce=false;}});
  }
}
const frFormEnemyTakeDamage=Enemy.prototype.takeDamage;
Enemy.prototype.takeDamage=function(amount){const wasAlive=this.hp>0;frFormEnemyTakeDamage.call(this,amount);frFormRegisterHit(this,wasAlive);};
const frFormBossTakeDamage=Boss.prototype.takeDamage;
Boss.prototype.takeDamage=function(amount,isQa){const wasAlive=this.hp>0&&!this._defeated;frFormBossTakeDamage.call(this,amount,isQa);frFormRegisterHit(this,wasAlive);};

const frFormHitRival=hitRival;
hitRival=function(bx,by,dmg,br){
  const before=rivalEnemies.map(function(r){return {r:r,hp:r.hp,alive:!r.defeated&&r.hp>0};}),hit=frFormHitRival(bx,by,dmg,br);
  before.forEach(function(item){if(item.r.hp<item.hp)frFormRegisterHit(item.r,item.alive);});return hit;
};

const frFormHazardUpdate=ArenaHazard.prototype.update;
ArenaHazard.prototype.update=function(){
  const burn=player.burnTimer||0,frozen=player.frozenTimer||0,poisoned=!!player.poisoned;
  frFormHazardUpdate.call(this);
  if(currentForm&&currentForm.id==='garlic_knight'){
    if(player.burnTimer>burn)player.burnTimer=burn+Math.ceil((player.burnTimer-burn)*.5);
    if(player.frozenTimer>frozen)player.frozenTimer=frozen+Math.ceil((player.frozenTimer-frozen)*.5);
    if(!poisoned&&player.poisoned){const until=performance.now()+2500;window.frGarlicPoisonUntil=until;setTimeout(function(){if((window.frGarlicPoisonUntil||0)<=performance.now()){player.poisoned=false;player.poisonTick=0;}},2550);}
  }
};

const frOriginalHurtPlayer=hurtPlayer;
hurtPlayer=function(raw){
  if(window.frInvincibleUntil&&performance.now()<window.frInvincibleUntil)return;
  if(currentForm.id==='beef_berserker'&&window.frUndyingUntil&&performance.now()<window.frUndyingUntil&&player.hp<=raw){player.hp=1;updateHUD();return;}
  const guarded=currentForm.id==='lobster_general'&&player.shieldActive&&(player.shieldHp||0)>0,beforeShield=player.shieldHp||0;
  frOriginalHurtPlayer(raw);
  if(guarded&&(player.shieldHp||0)<beforeShield){window.frLobsterGuardUntil=performance.now()+4000;addText('赤甲增傷',player.x,player.y-42,'#fb7185',12,-.45);}
};
const frFormDodge=doDodge;
doDodge=function(){
  const wasDodging=player.dodging;frFormDodge();
  if(!wasDodging&&player.dodging&&currentForm.id==='salmon_ronin'){window.frSalmonBuffUntil=performance.now()+3000;addText('逆流強化',player.x,player.y-44,'#fb7185',12,-.45);}
};
const frOriginalPlayerDied=playerDied;
playerDied=function(){
  if(currentForm.id==='peach_divine'&&!window.frPeachRevived){window.frPeachRevived=true;player.hp=Math.max(1,Math.floor(player.maxHp*.5));if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;frClearBullets();frCleanse();player.invTimer=120;updateHUD();burst(player.x,player.y,'#f9a8d4',40);addText('蟠桃復生',player.x,player.y-35,'#f9a8d4',20);return;}
  frOriginalPlayerDied();
};

function frPufferPoisonWave(radius,damage){
  const now=performance.now();
  frForEachEnemy(function(target){
    if(radius!=null&&Math.hypot(target.x-player.x,target.y-player.y)>radius)return;
    if(!target._frPoisonAt||now-target._frPoisonAt>1800)target._frPoisonStacks=0;
    target._frPoisonAt=now;target._frPoisonStacks=Math.min(5,(target._frPoisonStacks||0)+1);
    const aura=FR_PASSIVE_AURAS.puffer_alchemist;
    const dealt=damage==null?aura.baseDamage+target._frPoisonStacks*aura.stackDamage:damage*frSkillPowerMultiplier();
    frApplyDamage(target,dealt*(window._curAtkMult||atkMult)*frFormDamageMultiplier());burst(target.x,target.y,'#a3e635',4);
  });
}
const FR_PASSIVE_AURAS={
  chili_sprite:{radius:150,damage:8,interval:750,color:'#fb7185',fill:'rgba(251,113,133,.055)',dash:[7,7]},
  puffer_alchemist:{radius:160,baseDamage:5,stackDamage:3,interval:750,color:'#a3e635',fill:'rgba(163,230,53,.055)',dash:[3,8]},
  dragonfruit_emperor:{radius:185,damage:14,interval:500,color:'#f97316',fill:'rgba(249,115,22,.07)',dash:[12,7]}
};
function frPufferAuraTick(){frPufferPoisonWave(FR_PASSIVE_AURAS.puffer_alchemist.radius,null);}

setInterval(function(){
  if(!gameRunning||!currentForm)return;
  const id=currentForm.id,now=performance.now();
  window.frPassiveTimes=window.frPassiveTimes||{};
  const ready=function(key,ms){if(!window.frPassiveTimes[key]||now-window.frPassiveTimes[key]>=ms){window.frPassiveTimes[key]=now;return true;}return false;};
  if(id==='onion_guard'&&ready(id,10000)){player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,35);burst(player.x,player.y,'#d8b4fe',10);}
  if(id==='healing_mushroom'&&ready(id,5000))frHeal(4);
  if(id==='honey_priest'&&ready(id,4500)){if(player.hp<player.maxHp)frHeal(5);else{player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,20);}}
  if(id==='lobster_general'&&ready(id,8000)){player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,45);}
  if(id==='chili_sprite'&&ready(id+':aura',FR_PASSIVE_AURAS.chili_sprite.interval))frDamage(FR_PASSIVE_AURAS.chili_sprite.damage,FR_PASSIVE_AURAS.chili_sprite.radius,'#fb7185',false);
  if(id==='puffer_alchemist'&&ready(id+':aura',FR_PASSIVE_AURAS.puffer_alchemist.interval))frPufferAuraTick();
  if(id==='dragonfruit_emperor'&&ready(id+':aura',FR_PASSIVE_AURAS.dragonfruit_emperor.interval))frDamage(FR_PASSIVE_AURAS.dragonfruit_emperor.damage,FR_PASSIVE_AURAS.dragonfruit_emperor.radius,'#f43f5e',false);
  if(id==='cheese_mage'&&ready(id+':slow',600))frSlowAll(900,.72);
},250);

const frOriginalTickRivalFight=tickRivalFight;
let frRivalSlowBudget=0;
tickRivalFight=function(){
  if(!rivalFightActive)return frOriginalTickRivalFight();
  const now=performance.now(),slowFactor=rivalEnemies.reduce(function(value,r){return r.defeated?value:Math.min(value,frCurrentSlowFactor(r,now));},1);
  if(slowFactor>=1){frRivalSlowBudget=0;return frOriginalTickRivalFight();}
  frRivalSlowBudget+=slowFactor;
  if(frRivalSlowBudget<1)return;
  frRivalSlowBudget-=1;
  return frOriginalTickRivalFight();
};

function frSetSkillArt(){
  const form=FR_FORM_MAP[currentForm.id];if(!form)return;
  [['sk1I','skill1Icon'],['sk2I','skill2Icon'],['skPI','passiveIcon']].forEach(function(pair){const el=document.getElementById(pair[0]);if(!el)return;el.textContent='';el.style.display='block';el.style.width='42px';el.style.height='42px';el.style.background='center/contain no-repeat url("'+form[pair[1]]+'")';});
}
const frOriginalUpdateSkillUI=updateSkillUI;
updateSkillUI=function(){frOriginalUpdateSkillUI();frSetSkillArt();};

useSkill1=function(){
  const cost=(FR_BALANCE.stamina.skill1ByRarity[currentForm.rarity]||22);
  if(!gameRunning||stamina<cost||sk1Cd>0)return;stamina-=cost;sk1Cd=currentForm.sk1Cd||9000;
  const id=currentForm.id,c=currentForm.bulletColor,name=currentForm.sk1Name;
  addText(name,player.x,player.y-36,c,16);frPlayCast(1,id,c,name);updateHUD();
  setTimeout(function(){
    if(!gameRunning)return;
    burst(player.x,player.y,c,16);
    if(id==='normal'){frHeal(5);burst(player.x,player.y,'#86efac',10);}
    else if(id==='onion_guard'){frClearBullets(150);frDamage(24,145,c);frForEachEnemy(function(e){const a=Math.atan2(e.y-player.y,e.x-player.x);e.x+=Math.cos(a)*35;e.y+=Math.sin(a)*35;});}
    else if(id==='popcorn')frFan(11,16,c,false,false);
    else if(id==='healing_mushroom'){player.invTimer=150;frClearBullets(115);frHeal(12);}
    else if(id==='garlic_knight'){frCleanse();window.frInvincibleUntil=performance.now()+2200;}
    else if(id==='chili_sprite')frFan(9,18,c,true,true);
    else if(id==='lotus_archer')frFan(7,18,c,true,false);
    else if(id==='potato_armor'){player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,80);frClearBullets(130);}
    else if(id==='lemon_battery'){frForwardFan(10,1.55,7,18,c,true,false,{chain:true,chainRange:125,chainDamage:.34,chainMax:2});frDamage(12,180,c);}
    else if(id==='cheese_mage'){frSlowAll(5000,.3);frDamage(18,160,c);}
    else if(id==='honey_priest'){frHeal(22);normalFrenzyTimer=5000;}
    else if(id==='coffee_pilot'){normalFrenzyTimer=6500;window.frCoffeeOverdriveUntil=performance.now()+6500;}
    else if(id==='octopus_samurai'){player.invTimer=100;frClearBullets(140,true);}
    else if(id==='salmon_ronin'){player.invTimer=90;player.y=Math.max(player.radius,player.y-150);frFan(5,28,c,true,false);}
    else if(id==='beef_berserker'){player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,70);frDamage(30,120,c);}
    else if(id==='puffer_alchemist')frForwardFan(18,2.15,7,19,c,true,false);
    else if(id==='black_garlic_void'){frClearBullets(220);frForEachEnemy(function(e){e.x+=(player.x-e.x)*.45;e.y+=(player.y-e.y)*.45;});frDamage(26,220,c);}
    else if(id==='lobster_general'){window.frLobsterCharge=frClearBullets(240);player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,100);addText('吸收 '+window.frLobsterCharge+' 發',player.x,player.y-52,'#fb7185',13,-.45);}
    else if(id==='truffle_thunder'){for(let i=0;i<5;i++)setTimeout(function(){frDamage(14,null,c);frBoltFx(Math.random()*CW,0,Math.random()*CW,CH*.65,c,220,0,4);},i*180);}
    else if(id==='dragonfruit_emperor'){for(let i=0;i<9;i++)setTimeout(function(){frDamage(11,null,c);const bx=Math.random()*CW,by=Math.random()*CH*.65;burst(bx,by,c,8);frMoteFx(bx,by,12,'#fbbf24','flame',45,4,520);},i*140);}
    else if(id==='peach_divine'){normalFrenzyTimer=6000;frRadial(12,8,18,c,true,false);}
    else if(id==='cocoa_popsicle_wargod'){frClearBullets(190);frDamage(52,170,c);frSlowAll(4200,.38);}
    else frFan(3,15,c,false,false);
    updateHUD();
  },95);
};

useSkill2=function(){
  const formMeta=FR_FORM_MAP[currentForm.id];
  const cost=(formMeta&&formMeta.skill2Cost)||(FR_BALANCE.stamina.skill2ByRarity[currentForm.rarity]||52);
  if(!gameRunning||stamina<cost||sk2Cd>0)return;stamina-=cost;sk2Cd=currentForm.sk2Cd||20000;
  const id=currentForm.id,c=currentForm.bulletColor,name=currentForm.sk2Name;
  frPlayCast(2,id,c,name);updateHUD();
  setTimeout(function(){
    if(!gameRunning)return;
    addText(name,CW/2,CH*.48,c,22);burst(player.x,player.y,c,30);frShakeFx(9,360);
    if(id==='normal'){normalFrenzyTimer=Math.max(normalFrenzyTimer,8000);addText('亢奮！全隊速度 x2',CW/2,CH*.39,'#fb923c',17,-.35);}
    else if(id==='onion_guard'){player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,180);frRadial(24,7,25,c,true,false);}
    else if(id==='popcorn'){frForwardFan(18,2.2,8,28,c,true,false);frDamage(45,230,c);}
    else if(id==='healing_mushroom'){frHeal(55);player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,70);frDamage(34,210,c);}
    else if(id==='garlic_knight'){frCleanse();window.frInvincibleUntil=performance.now()+6500;frSlowAll(6500,.55);}
    else if(id==='chili_sprite'){for(let i=0;i<8;i++)setTimeout(function(){frDamage(14,null,c);frGroundFx(CW/2,CH*.34,'#ef4444',Math.max(CW,CH)*.58,850);frMoteFx(CW/2,CH*.34,14,'#fbbf24','flame',Math.min(CW*.42,180),5,620);},i*250);}
    else if(id==='lotus_archer'){for(let i=-3;i<=3;i++){frSkillBullet(player.x+i*36,player.y,0,-14,c,24,10,true,false);frSlashFx(player.x+i*36,player.y,c,CH*.72,-Math.PI/2,650,Math.abs(i)*28,9);}}
    else if(id==='potato_armor'){frClearBullets();frDamage(38,null,c);frSlowAll(6500,.12);}
    else if(id==='lemon_battery'){for(let i=0;i<8;i++)setTimeout(function(){frDamage(22,null,c);const tx=Math.random()*CW;frBoltFx(tx+40-Math.random()*80,0,tx,CH*.7,c,300);frShakeFx(4,160);},i*160);}
    else if(id==='cheese_mage'){frSlowAll(9000,.15);for(let i=0;i<6;i++)setTimeout(function(){frDamage(14,null,c);frRingFx(player.x,player.y,c,110+i*28,850,4);},i*350);}
    else if(id==='honey_priest'){frHeal(70);player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,120);frSlowAll(6000,.35);}
    else if(id==='coffee_pilot'){frClearBullets();frSlowAll(8000,.12);normalFrenzyTimer=8000;window.frCoffeeOverdriveUntil=performance.now()+8000;}
    else if(id==='octopus_samurai'){frClearBullets(240,true);frRadial(32,8,24,c,true,false);}
    else if(id==='salmon_ronin'){frClearBullets();frDamage(60,null,c);frForEachEnemy(function(e){e.y-=100;});}
    else if(id==='beef_berserker'){window.frUndyingUntil=performance.now()+8000;normalFrenzyTimer=8000;frDamage(42,160,c);}
    else if(id==='puffer_alchemist'){for(let i=0;i<10;i++)setTimeout(function(){frPufferPoisonWave(null,18);frGroundFx(Math.random()*CW,120+Math.random()*CH*.6,'#84cc16',85,1100);frMoteFx(Math.random()*CW,160+Math.random()*CH*.5,10,'#bef264','bubble',55,2.5,950);},i*220);}
    else if(id==='black_garlic_void'){for(let i=-2;i<=2;i++)frSkillBullet(player.x+i*18,player.y,0,-18,c,42,14,true,false);frClearBullets();}
    else if(id==='lobster_general'){frForwardFan(30,2.35,9,24+(window.frLobsterCharge||0)*2,c,true,false);window.frLobsterCharge=0;}
    else if(id==='truffle_thunder'){for(let i=0;i<8;i++)setTimeout(function(){frDamage(16,null,c);const tx=Math.random()*CW,ty=100+Math.random()*CH*.65;frBoltFx(tx+35-Math.random()*70,0,tx,ty,c,250);frFlashFx(c,120,.13);},i*150);}
    else if(id==='dragonfruit_emperor'){window.frInvincibleUntil=performance.now()+2800;for(let i=0;i<10;i++)setTimeout(function(){frFan(3,15,c,true,true);frDamage(8,210,c);frMoteFx(player.x,player.y,16,'#fbbf24','flame',170,6,720);frGroundFx(player.x,player.y,'#ef4444',205,900);},i*190);}
    else if(id==='peach_divine'){frHeal(player.maxHp);frCleanse();frClearBullets();window.frInvincibleUntil=performance.now()+5000;frMoteFx(player.x,player.y,70,'#f9a8d4','heal',190,4,1500);}
    else if(id==='cocoa_popsicle_wargod'){window.frInvincibleUntil=performance.now()+2200;normalFrenzyTimer=6500;frClearBullets();frSlowAll(6500,.22);for(let i=0;i<8;i++)setTimeout(function(){frRadial(6,8,14,c,true,false);frDamage(12,150,c);frRingFx(player.x,player.y,'#bae6fd',90+i*10,760,5);frMoteFx(player.x,player.y,14,'#e0f2fe','snow',125,3.2,900);},i*460);}
    else frDamage(30,null,c);
    updateHUD();
  },240);
};

const frOriginalDrawPlayer=drawPlayer;
function frDrawPassiveAura(){
  if(!gameRunning||!currentForm)return;
  const aura=FR_PASSIVE_AURAS[currentForm.id];if(!aura)return;
  const now=performance.now(),pulse=.5+.5*Math.sin(now*.005),radius=aura.radius+pulse*2;
  ctx.save();ctx.translate(player.x,player.y);ctx.globalCompositeOperation='source-over';
  ctx.fillStyle=aura.fill;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.48+pulse*.18;ctx.strokeStyle=aura.color;ctx.lineWidth=currentForm.id==='dragonfruit_emperor'?3:2;
  ctx.setLineDash(aura.dash);ctx.lineDashOffset=-now*.02;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
  ctx.globalAlpha=.16+pulse*.08;ctx.lineWidth=8;ctx.setLineDash([]);ctx.beginPath();ctx.arc(0,0,radius-3,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}
function frDrawMeleeSwipe(){
  if(!swipeAnim||!swipeAnim.active)return;
  const p=Math.max(0,Math.min(1,swipeAnim.progress||0));
  const r=swipeAnim.r||110;
  const startA=Math.PI;
  const endA=startA+Math.PI*p;
  const color=swipeAnim.color||currentForm.bulletColor||'#d97706';
  ctx.save();
  ctx.translate(player.x,player.y);
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=(1-p*p)*.18;
  ctx.fillStyle=color;
  ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,r,startA,endA,false);ctx.closePath();ctx.fill();
  ctx.globalCompositeOperation='lighter';
  ctx.globalAlpha=(1-p)*.7;
  ctx.strokeStyle='#fff7d6';ctx.lineWidth=8-3*p;
  ctx.beginPath();ctx.arc(0,0,r,startA,endA,false);ctx.stroke();
  ctx.globalAlpha=(1-p)*.95;
  ctx.strokeStyle=color;ctx.lineWidth=4;
  ctx.beginPath();ctx.arc(0,0,r,startA,endA,false);ctx.stroke();
  ctx.globalCompositeOperation='source-over';
  ctx.globalAlpha=(1-p)*.78;
  ctx.strokeStyle='rgba(255,255,255,.9)';ctx.lineWidth=2;
  ctx.setLineDash([7,7]);
  ctx.beginPath();ctx.arc(0,0,r*.72,startA,endA,false);ctx.stroke();
  ctx.restore();
}
drawPlayer=function(){
  frDrawPassiveAura();
  if(!currentForm||!currentForm.id||currentForm.id==='normal'){frOriginalDrawPlayer();return;}
  const img=frImg(currentForm.id,'battle');
  if(!img||!img.complete||!img.naturalWidth){frOriginalDrawPlayer();return;}
  const sheet=frBuildBattleSheet(currentForm.id,img);
  if(!sheet){frOriginalDrawPlayer();return;}
  const moving=Math.hypot(jDx||0,jDy||0)>.06||keys.ArrowLeft||keys.ArrowRight||keys.ArrowUp||keys.ArrowDown||keys.KeyA||keys.KeyD||keys.KeyW||keys.KeyS;
  const frameTime=player.dodging?62:moving?92:175;
  const frame=Math.floor(performance.now()/frameTime)%4;
  const lift=[0,-2,-5,-2][frame],shadowW=[23,21,19,21][frame];
  ctx.save();ctx.globalAlpha=player.alpha==null?1:player.alpha;ctx.imageSmoothingEnabled=false;
  ctx.fillStyle='rgba(40,44,52,.20)';ctx.beginPath();ctx.ellipse(player.x,player.y+22,shadowW*.88,5,0,0,Math.PI*2);ctx.fill();
  ctx.translate(player.x,player.y+lift);ctx.rotate((jDx||0)*.045);if(player.dodging)ctx.scale(1.08,.94);
  ctx.drawImage(sheet,frame*FR_BATTLE_CELL,0,FR_BATTLE_CELL,FR_BATTLE_CELL,-38,-48,76,76);
  ctx.setTransform(1,0,0,1,0,0);
  if(player.shieldActive){ctx.strokeStyle='#67e8f9';ctx.lineWidth=3;ctx.beginPath();ctx.arc(player.x,player.y,34,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
  frDrawMeleeSwipe();
};

const frOriginalSetForm=setForm;
setForm=function(fid){frOriginalSetForm(FR_FORM_MAP[fid]?fid:'normal');if(currentForm.id!=='normal')frImg(currentForm.id,'battle');frSetSkillArt();};

drawRivalEnemies=function(){
 if(!rivalFightActive)return;
 rivalEnemies.forEach(function(r){
  if(r.defeated)return;
  ctx.save();ctx.translate(r.x,r.y);
  const hp=Math.max(0,r.hp/r.maxHp),barY=-r.r-22;
  ctx.fillStyle='rgba(0,0,0,.52)';ctx.fillRect(-34,barY,68,9);
  ctx.fillStyle=hp>.6?'#22c55e':hp>.3?'#f59e0b':'#ef4444';ctx.fillRect(-34,barY,68*hp,9);
  ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=1;ctx.strokeRect(-34,barY,68,9);
  if(r.invTimer>0&&r.invTimer%6<3)ctx.globalAlpha=.35;
  const portrait=r.formId&&r.formId!=='normal'?frImg(r.formId,'portrait'):null;
  ctx.fillStyle='rgba(15,23,42,.24)';ctx.beginPath();ctx.ellipse(0,28,24,6,0,0,Math.PI*2);ctx.fill();
  if(portrait&&portrait.complete&&portrait.naturalWidth){
   ctx.imageSmoothingEnabled=false;const bob=Math.sin((r.timer||0)*.09)*2;
   ctx.drawImage(portrait,-39,-47+bob,78,78);
  }else if(r.formId==='normal'&&rivalNormalDownImg.complete&&rivalNormalDownImg.naturalWidth>0){
   const frame=Math.floor((r.timer||0)/8)%HERO_FLOAT_FRAMES;ctx.imageSmoothingEnabled=false;
   ctx.drawImage(rivalNormalDownImg,frame*HERO_FLOAT_FRAME_W,0,HERO_FLOAT_FRAME_W,HERO_FLOAT_FRAME_H,-36,-45,72,72);
  }else{
   ctx.font='30px Segoe UI Emoji,Segoe UI Symbol,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(r.emoji,0,0);
  }
  ctx.globalAlpha=1;
  const modeIcon={sniper:'🎯',rusher:'💨',caster:'✨',deflector:'💧',evader:'↔',berserker:'🔥'};
  ctx.font='bold 10px Segoe UI Emoji,Segoe UI Symbol,sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#fbbf24';
  ctx.strokeStyle='rgba(15,23,42,.9)';ctx.lineWidth=3;const label=r.name+' '+(modeIcon[r.aiMode]||'');ctx.strokeText(label,0,barY-7);ctx.fillText(label,0,barY-7);
  ctx.restore();
 });
 const active=rivalEnemies.filter(function(r){return !r.defeated;}).length;
 if(active>0){ctx.save();ctx.font='bold 12px Segoe UI Emoji,Segoe UI Symbol,sans-serif';ctx.fillStyle='rgba(251,191,36,.92)';ctx.textAlign='right';ctx.textBaseline='top';ctx.fillText('入侵者 '+active+'名',CW-10,88);ctx.restore();}
};
`;
})();

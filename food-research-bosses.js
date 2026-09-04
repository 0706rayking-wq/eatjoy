(function () {
  const bossCatalog = [
    { map:0, id:'tiramisu-jazz', name:'提拉米蘇爵士', intro:'入場券？就用你的勇氣來付吧。', death:'呵……今晚的爵士曲，該落幕了。', sprite:'boss-tiramisu-jazz.png', color:'#a16207', normal:'cocoaFan', skills:['coffeePools','cookieRain','creamWalls'], masterSkill:'espressoSweep' },
    { map:0, id:'jelly-king', name:'史萊姆果凍王', intro:'在我的甜蜜王國，連腳步都會反彈！', death:'王冠碎了……甜蜜王國也融化了……', sprite:'boss-jelly-king.png', color:'#ec4899', normal:'jellyBounce', skills:['jellyClones','jellyRings','jellyRain'], masterSkill:'crownBounce' },
    { map:1, id:'niu-mowang', name:'牛魔王', intro:'站穩了！本王可不會替你讓路！', death:'好力道……本王認輸！', sprite:'boss-niu-mowang.png', color:'#dc2626', normal:'hornFan', skills:['doubleCharge','shockRings','cleaverLanes'], masterSkill:'hornQuake' },
    { map:1, id:'yang-mowang', name:'羊魔王', intro:'別被柔軟騙了，羊角可不懂手下留情。', death:'原來真正柔中帶剛的……是你。', sprite:'boss-yang-mowang.png', color:'#d8b4fe', normal:'woolSplit', skills:['sheepLanes','woolSpiral','slowCharge'], masterSkill:'woolPrison' },
    { map:2, id:'mala-vampire', name:'麻辣湯吸血鬼', intro:'讓我嚐嚐，你的熱血夠不夠辣。', death:'這股辣……竟燒盡了我的長夜……', sprite:'boss-mala-vampire.png', color:'#e11d48', normal:'chiliCurve', skills:['drainTether','chiliRain','bloodDash'], masterSkill:'boilingBloodHunt' },
    { map:2, id:'white-soup-princess', name:'白雪湯雪姬', intro:'一冷一熱，你能撐過幾回？', death:'冰雪融了……這鍋湯，交給你了……', sprite:'boss-white-soup-princess.png', color:'#e0f2fe', normal:'brothTriple', skills:['fogAim','iceFlower','hotCold'], masterSkill:'frostfireCorridor' },
    { map:3, id:'bitter-melon-witch', name:'苦瓜巫婆', intro:'吞下這份苦，才有資格談勝利。', death:'苦盡之後……原來真有回甘……', sprite:'boss-bitter-melon-witch.png', color:'#65a30d', normal:'crossCrescent', skills:['poisonSweep','seedMines','vineCage'], masterSkill:'bitterVineChase' },
    { map:3, id:'halloween-pumpkin-king', name:'萬聖南瓜王', intro:'猜猜看，下一顆南瓜會落在哪？', death:'燈火熄滅……萬聖夜結束了……', sprite:'boss-halloween-pumpkin-king.png', color:'#f97316', normal:'leadBurst', skills:['pumpkinRoll','lockBeam','pumpkinMeteors'], masterSkill:'pumpkinChainBurst' },
    { map:4, id:'karaage-superhero', name:'唐揚雞超人', intro:'正義要趁熱，壞蛋也要炸得酥脆！', death:'正義……今天站在你那邊。', sprite:'boss-karaage-superhero.png', color:'#f59e0b', normal:'chickenShotgun', skills:['bodySlam','oilRain','tripleDash'], masterSkill:'fryerShockDrop' },
    { map:4, id:'eel-dragon', name:'星鰻龍', intro:'踏錯一步，就會被醬香漩渦吞沒。', death:'醬香散了……好一場漂亮的翻身。', sprite:'boss-eel-dragon.png', color:'#92400e', normal:'sauceCurve', skills:['pathDash','conveyor','reverseSpiral'], masterSkill:'sauceRushTrail' },
    { map:5, id:'fried-rice-beast', name:'炒飯獸', intro:'鍋氣已起，你就是今天最後一味！', death:'你的鍋氣……比我更旺……', sprite:'boss-fried-rice-beast.png', color:'#facc15', normal:'riceFan', skills:['riceTornado','eggOrbit','wokShock'], masterSkill:'wokFlipBurst' },
    { map:5, id:'intestine-sandworm', name:'肥腸沙蟲', intro:'地面在動？不，是我來了。', death:'地面平靜了……但飢餓不會消失……', sprite:'boss-intestine-sandworm.png', color:'#fb7185', normal:'ringShot', skills:['sandTrail','lidCross','closingLoops'], masterSkill:'burrowAmbush' },
    { map:6, id:'durian-icepop-warrior', name:'榴槤冰棒戰士', intro:'聞到只是警告，凍住才是處刑。', death:'冰殼碎了……氣味仍會留下……', sprite:'boss-durian-icepop-warrior.png', color:'#84cc16', normal:'iceFan', skills:['iceSweep','iceColumns','avalanche'], masterSkill:'frostThornWheel' },
    { map:6, id:'mango-ice-monster', name:'芒果冰怪', intro:'甜得越迷人，雪崩就越無情。', death:'雪崩停了……甜味也化了……', sprite:'boss-mango-ice-monster.png', color:'#fbbf24', normal:'turnTwin', skills:['syrupPools','snowcone','sideAvalanche'], masterSkill:'syrupAvalanche' },
    { map:7, id:'fries-swordsman', name:'薯條劍宗', intro:'刀落如雨，接得住便算你有本事。', death:'此刀已鈍……你勝得漂亮。', sprite:'boss-fries-swordsman.png', color:'#f59e0b', normal:'crossSlash', skills:['fryColumns','lineSlashes','orbitFries'], masterSkill:'swordNet' },
    { map:7, id:'pasta-mummy', name:'義大利麵木乃伊', intro:'麵線纏身之時，掙扎只會打成死結。', death:'纏了千年的麵線……終於斷了……', sprite:'boss-pasta-mummy.png', color:'#ef4444', normal:'noodleCurve', skills:['tomatoSpiral','contractingCircles','noodleGrid'], masterSkill:'noodleBindGrid' },
    { map:8, id:'pastry-soup-wizard', name:'酥皮濃湯惡巫師', intro:'酥皮一裂，濃湯將吞沒整座戰場。', death:'酥皮崩裂……我的濃湯也冷了……', sprite:'boss-pastry-soup-wizard.png', color:'#d97706', normal:'flakeCross', skills:['groundEruptions','shieldRadial','insideOutside'], masterSkill:'pastryCollapse' },
    { map:8, id:'cream-chicken-pontiff', name:'奶油燉雞邪教宗', intro:'接受奶油的洗禮，沉入濃醇的永恆吧。', death:'洗禮結束……濃醇的神諭已散……', sprite:'boss-cream-chicken-pontiff.png', color:'#fef08a', normal:'creamSplit', skills:['chickenLegRain','creamSweep','closingWalls'], masterSkill:'creamBaptism' },
    { map:9, id:'octopus-warrior', name:'八爪章魚戰士', intro:'八臂皆刃，你能看住幾個方向？', death:'八臂皆敗……你看穿了所有攻勢……', sprite:'boss-octopus-warrior.png', color:'#7c3aed', normal:'inkFan', skills:['tentacleLanes','inkCloud','centerPull'], masterSkill:'eightArmCombo' },
    { map:9, id:'heavy-armor-mech', name:'重甲機兵', intro:'裝甲鎖定。所有逃生路線，全部封閉。', death:'裝甲解除……戰鬥系統，停止……', sprite:'boss-heavy-armor-mech.png', color:'#0891b2', normal:'clawCrescent', skills:['horizontalCharges','bubbleLock','waterWalls'], masterSkill:'pressureCannon' },
    { map:10, id:'little-thunder-god', name:'小雷神', intro:'能走到這裡……很好。接下我這一道雷。', intro22:'你果然回來了。這一次，我不會再保留。', stage11Defeat:'你的力量，我記住了……我們還會再見。', death:'痛快……能在全力一戰後敗給你，我沒有遺憾。', phase12:'真不簡單，盡你的全力吧', phase23:'看得出你很想贏啊？不過，我也是', nearDefeat:'很好……這才是我等待已久的戰鬥！', sprite:'little-thunder-god-phase1-spritesheet.png', color:'#60a5fa', normal:'hiddenSpark', skills:['thunderMarks','cloakDash','staticCage','fiveLaserCannons'], phaseKits:[
      { name:'第一型態・雷幕披風', color:'#a78bfa', normal:'hiddenSpark', skills:['thunderMarks','cloakDash','staticCage','fiveLaserCannons'] },
      { name:'第二型態・雷鎧真身', color:'#38bdf8', normal:'vajraFan', skills:['heavenLances','warDrumRings','armorCounter','sixWayLances','orbitLances','lanceRush'] },
      { name:'第三型態・閃電化身', color:'#facc15', normal:'livingLightning', skills:['ninefoldJudgment','thunderDomain','finalThunderstorm','crossThunderPillars','delayedThunderOrbs'] }
    ] }
  ];

  window.FOOD_RESEARCH_BOSSES = bossCatalog;
  window.FOOD_RESEARCH_BOSS_PATCH = String.raw`
const FR_BOSS_CATALOG = ${JSON.stringify(bossCatalog)};
const FR_BOSS_BY_MAP = FR_BOSS_CATALOG.reduce(function(out,item){(out[item.map]||(out[item.map]=[])).push(item);return out;},{});
const FR_STAGE11_THUNDER={hp:1.20,shield:1.15,damage:1.08,normalCd:.88,skillCd:.90,closeRadius:90,closeHold:60,closeWarn:42,closeCooldown:360};
const FR_BOSS_IMAGES = {};
const FR_THUNDER_IMAGES={};
const FR_THUNDER_SOURCES={
  phase1:'little-thunder-god-phase1-spritesheet-v2.png',
  phase2:'little-thunder-god-phase2-spritesheet.png',
  phase3:'little-thunder-god-phase3-spritesheet.png',
  transition12:'little-thunder-god-transition-1-to-2-spritesheet.png',
  transition23:'little-thunder-god-transition-2-to-3-spritesheet.png'
};
function frLoadBossImage(cache,key,src,version){
  if(cache[key])return cache[key];
  const img=new Image();img.decoding='async';img.src='assets/food-research/bosses/'+src+version;cache[key]=img;return img;
}
function frBossImage(item){return item?frLoadBossImage(FR_BOSS_IMAGES,item.id,item.sprite,'?v=1'):null;}
function frThunderImage(key){return FR_THUNDER_SOURCES[key]?frLoadBossImage(FR_THUNDER_IMAGES,key,FR_THUNDER_SOURCES[key],'?v=3'):null;}
function frReleaseBossImage(img){if(!img)return;img.onload=null;img.onerror=null;if(img.removeAttribute)img.removeAttribute('src');}
function frPreloadBossesForMap(mapIdx){
  const pool=FR_BOSS_BY_MAP[mapIdx]||[];
  const keep={};pool.forEach(function(item){keep[item.id]=true;frBossImage(item);});
  Object.keys(FR_BOSS_IMAGES).forEach(function(id){if(!keep[id]){frReleaseBossImage(FR_BOSS_IMAGES[id]);delete FR_BOSS_IMAGES[id];}});
  if(Number(mapIdx)===10)frThunderImage('phase1');
  else Object.keys(FR_THUNDER_IMAGES).forEach(function(key){frReleaseBossImage(FR_THUNDER_IMAGES[key]);delete FR_THUNDER_IMAGES[key];});
}

function frBossShuffle(list){
  const out=list.slice();
  for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=out[i];out[i]=out[j];out[j]=t;}
  return out;
}
function frBossTempo(stageNum){
  const s=Number(stageNum)||1;
  if(s>=19&&s<=21)return {normalCd:47,skillCd:72,normalBusy:42,skillBusy:63,busyRate:.86,eventScale:.52,warningMin:27,moveRetarget:48,moveRate:.032};
  if(s>=16&&s<=18)return {normalCd:55,skillCd:86,normalBusy:48,skillBusy:75,busyRate:.76,eventScale:.64,warningMin:31,moveRetarget:60,moveRate:.029};
  if(s>=12&&s<=15)return {normalCd:63,skillCd:102,normalBusy:58,skillBusy:87,busyRate:.62,eventScale:.78,warningMin:38,moveRetarget:72,moveRate:.026};
  return {normalCd:88,skillCd:165,normalBusy:76,skillBusy:118,busyRate:s>=16?.65:s>=11?.4:0,eventScale:1,warningMin:0,moveRetarget:110,moveRate:.02};
}
function frBossHighStageSkillPool(b){
  const pool=(b&&b._frDef&&b._frDef.skills||[]).slice();
  if(b&&b._frMasterSkillUnlocked&&b._frDef.masterSkill)pool.push(b._frDef.masterSkill);
  return pool;
}
function frBossAim(b,predict){
  const lead=predict?22:0;
  return Math.atan2(player.y+(player.vy||0)*lead-b.y,player.x+(player.vx||0)*lead-b.x);
}
function frBossShot(b,angle,speed,damage,color,radius,options){
  const opt=options||{};
  const stageSpeed=stage>=16?1.10:stage>=11?1.05:1;
  speed*=stageSpeed;
  const shot=new Bullet(b.x+(opt.ox||0),b.y+(opt.oy||36),Math.cos(angle)*speed,Math.sin(angle)*speed,damage,color||b.color,radius||7,false,false,!!opt.burn);
  const baseUpdate=shot.update.bind(shot);
  const baseDead=shot.dead.bind(shot);
  shot._frDead=false;
  shot.frStatus=opt.status||null;
  shot.update=function(){
    if(this._frDead)return;
    if(Number.isFinite(opt.stopX)&&Number.isFinite(opt.stopY)&&!this._frStopped){
      const remain=Math.hypot(opt.stopX-this.x,opt.stopY-this.y),step=Math.max(1,Math.hypot(this.vx,this.vy));
      if(remain<=step+8){this.x=opt.stopX;this.y=opt.stopY;this.vx=0;this.vy=0;this._frStopped=true;this._frStoppedAt=this.age;}
    }
    if(opt.curve){const a=Math.atan2(this.vy,this.vx)+opt.curve;const sp=Math.hypot(this.vx,this.vy);this.vx=Math.cos(a)*sp;this.vy=Math.sin(a)*sp;}
    if(opt.turnAt&&this.age===opt.turnAt){const a=frBossAim(b,true);const sp=Math.hypot(this.vx,this.vy);this.vx=Math.cos(a)*sp;this.vy=Math.sin(a)*sp;}
    baseUpdate();
    if(this._frStopped&&this.age-this._frStoppedAt>=18){frBossHazard({kind:'circle',x:this.x,y:this.y,r:68,color:opt.explodeColor||this.color,damage:opt.explodeDamage||this.dmg,status:opt.status||null,delay:30,minDelay:24,duration:12});this._frDead=true;}
    if(opt.bounce){if(this.x<this.r&&this.vx<0)this.vx*=-1;if(this.x>CW-this.r&&this.vx>0)this.vx*=-1;}
    if(opt.splitAt&&this.age===opt.splitAt){for(let i=0;i<opt.splitCount;i++){const a=Math.PI*2*i/opt.splitCount;frBossShot({x:this.x,y:this.y,color:this.color},a,opt.splitSpeed||3,Math.max(6,this.dmg*.7),this.color,Math.max(4,this.r*.7));}this._frDead=true;}
  };
  shot.dead=function(){return this._frDead||baseDead();};
  eBullets.push(shot);
  return shot;
}
function frBossFan(b,count,speed,damage,spread,color,options,aim){
  const a=aim==null?frBossAim(b,false):aim;
  for(let i=0;i<count;i++)frBossShot(b,a+(i-(count-1)/2)*spread,speed,damage,color||b.color,(options&&options.radius)||7,options);
}
function frBossRadial(b,count,speed,damage,color,offset,options){
  const start=offset||0;
  for(let i=0;i<count;i++)frBossShot(b,start+Math.PI*2*i/count,speed,damage,color||b.color,(options&&options.radius)||7,options);
}
function frBossLater(b,frames,fn){const scale=frBossTempo(stage).eventScale,delay=scale<1?Math.max(8,Math.round(frames*scale)):frames;b._frEvents.push({at:b.timer+delay,fn:fn});}
function frBossWarning(b,kind,frames,data){
  const tempo=frBossTempo(stage),scaled=tempo.eventScale<1?Math.max(tempo.warningMin,Math.round(frames*tempo.eventScale)):frames;
  const w=Object.assign({kind:kind,start:b.timer,end:b.timer+scaled,color:b.color,x:b.x,y:b.y},data||{});
  b._frWarnings.push(w);return w;
}
function frBossAnimate(b,frames){b._frAnimStart=b.timer;b._frAnimUntil=b.timer+(frames||30);}
function frPositionCombatDialogue(box){
  const gc=document.getElementById('gc')||document.body,hud=document.getElementById('hud'),bossHud=document.getElementById('bossHud');
  const gcRect=gc.getBoundingClientRect();let bottom=gcRect.top+58;
  if(hud){const r=hud.getBoundingClientRect();bottom=Math.max(bottom,r.bottom);}
  if(bossHud&&getComputedStyle(bossHud).display!=='none'){const r=bossHud.getBoundingClientRect();bottom=Math.max(bottom,r.bottom);}
  box.style.top=Math.round(bottom-gcRect.top+6)+'px';
}
function frCombatSpeakLine(text,color){
  if(!text)return;
  let box=document.getElementById('frBossDialogue');
  if(!box){box=document.createElement('div');box.id='frBossDialogue';box.style.cssText="position:absolute;left:8px;right:8px;top:72px;z-index:58;padding:8px 11px;border:1px solid rgba(255,255,255,.22);border-radius:8px;background:rgba(5,10,20,.86);color:#fff;text-align:center;font-size:14px;line-height:1.45;font-weight:900;text-shadow:0 1px 3px #000;pointer-events:none;opacity:0;transform:translate3d(0,6px,0);transition:opacity .5s ease,transform .5s ease;box-shadow:0 2px 10px rgba(0,0,0,.28)";(document.getElementById('gc')||document.body).appendChild(box);}
  frPositionCombatDialogue(box);
  clearTimeout(box._frHoldTimer);clearTimeout(box._frFadeTimer);box.textContent=text;box.style.color=color||'#fff';box.style.display='block';box.style.opacity='0';box.style.transform='translate3d(0,6px,0)';
  requestAnimationFrame(function(){box.style.opacity='1';box.style.transform='translate3d(0,0,0)';});
  box._frHoldTimer=setTimeout(function(){box.style.opacity='0';box.style.transform='translate3d(0,4px,0)';},2000);
  box._frFadeTimer=setTimeout(function(){box.style.display='none';},2550);
}
function frActorSpeak(text,color){frCombatSpeakLine(text,color);}
function frBossSpeak(b,text,color){
  if(!text)return;
  frCombatSpeakLine((b&&b.name?b.name:'BOSS')+'：「'+text+'」',color||b&&b.color||'#fff');
  if(b)b._frBusyUntil=Math.max(b._frBusyUntil||0,b.timer+150);
}
function frBossApplyStatus(status){
  if(!status||!player||player.hp<=0)return;
  const now=performance.now(),kind=typeof status==='string'?status:status.kind;
  if(!kind)return;
  window.frBossStatusCooldown=window.frBossStatusCooldown||{};
  if(now<(window.frBossStatusCooldown[kind]||0))return;
  window.frBossStatusCooldown[kind]=now+900;
  const formScale=(currentForm&&currentForm.id==='garlic_knight') ? 0.5 : 1;
  const amuletBonus=typeof frActiveAmuletBonus==='function'?frActiveAmuletBonus():{};
  const amuletScale=kind==='paralyze'?1-Math.min(.5,amuletBonus.paralyzeDuration||0):1;
  const scale=formScale*amuletScale;
  const duration=Math.round(((status&&status.duration)||2600)*scale);
  if(kind==='freeze'){player.frozenTimer=Math.max(player.frozenTimer||0,Math.round(75*scale));addText('冰凍',player.x,player.y-32,'#7dd3fc',13,-.5);}
  else if(kind==='burn'){player.burnTimer=Math.max(player.burnTimer||0,Math.round(240*scale));addText('灼燒',player.x,player.y-32,'#ef4444',13,-.5);}
  else if(kind==='poison'){
    if(typeof frApplyPlayerPoison==='function')frApplyPlayerPoison();
    else{player.poisoned=true;player.poisonTick=0;window.frPoisonUntil=now+20000;}
    addText('中毒 20秒',player.x,player.y-32,'#84cc16',13,-.5);
  }
  else if(kind==='slow'){window.frSlowUntil=Math.max(window.frSlowUntil||0,now+duration);addText('緩速',player.x,player.y-32,'#60a5fa',13,-.5);}
  else if(kind==='attackDown'){window.frAttackDownUntil=Math.max(window.frAttackDownUntil||0,now+duration);addText('攻擊降低',player.x,player.y-32,'#f59e0b',13,-.5);}
  else if(kind==='paralyze'){
    window.frParalyzedUntil=Math.max(window.frParalyzedUntil||0,now+duration);
    player.vx=0;player.vy=0;
    addText('麻痺',player.x,player.y-32,'#fde047',15,-.5);
  }
}
function frPlayerParalyzed(){return performance.now()<(window.frParalyzedUntil||0);}
function frBossSummonMinions(b,count,type){
  if(enemies.length>=18)return;
  for(let i=0;i<count;i++){
    const x=Math.max(34,Math.min(CW-34,b.x+(i-(count-1)/2)*92));
    const e=new Enemy(x,Math.max(45,b.y+40),type||1,40,2,stage);e.y=Math.max(45,b.y+40);enemies.push(e);
  }
  addText('召喚增援',b.x,b.y-82,'#fb7185',13,-.5);
}
function frBossHurtOnce(h,amount){
  if(player.invTimer<=0){hurtPlayer(amount);h.lastHit=h.age;}
}

class FrBossHazard{
  constructor(options){
    const opt=options||{},tempo=frBossTempo(stage);
    Object.assign(this,{age:0,dead:false,delay:60,duration:90,kind:'circle',x:CW/2,y:CH/2,r:60,w:60,h:60,color:'#ef4444',damage:18,lastHit:-999,slow:0,status:null,minDelay:60},opt);
    if(this.delay>0){
      const floor=tempo.eventScale<1?(Number.isFinite(opt.minDelay)?Math.max(24,Math.round(opt.minDelay*tempo.eventScale)):tempo.warningMin):(this.minDelay||60);
      this.delay=Math.max(floor,Math.round(this.delay*tempo.eventScale));
    }
  }
  update(){
    this.age++;
    if(this.age>this.delay){if(this.moveX)this.x+=this.moveX;if(this.moveY)this.y+=this.moveY;}
    if(this.pull&&this.age>this.delay){player.x+=(this.x-player.x)*this.pull;player.y+=(this.y-player.y)*this.pull;}
    if(this.age<=this.delay)return;
    if(this.age>this.delay+this.duration){this.dead=true;return;}
    let hit=false;
    if(this.kind==='circle')hit=Math.hypot(player.x-this.x,player.y-this.y)<this.r+player.radius;
    else if(this.kind==='ring'){const d=Math.hypot(player.x-this.x,player.y-this.y);hit=d>this.inner-player.radius&&d<this.r+player.radius;}
    else if(this.kind==='rect')hit=Math.abs(player.x-this.x)<this.w/2+player.radius&&Math.abs(player.y-this.y)<this.h/2+player.radius;
    else if(this.kind==='line'){
      const dx=this.x2-this.x,dy=this.y2-this.y,len=Math.hypot(dx,dy)||1;
      const t=Math.max(0,Math.min(1,((player.x-this.x)*dx+(player.y-this.y)*dy)/(len*len)));
      hit=Math.hypot(player.x-(this.x+dx*t),player.y-(this.y+dy*t))<(this.w||22)/2+player.radius;
    }
    if(hit&&this.age-this.lastHit>28){frBossHurtOnce(this,this.damage);if(this.slow)frBossApplyStatus({kind:'slow',duration:this.slow*32});if(this.status)frBossApplyStatus(this.status);}
  }
  draw(){
    const active=this.age>this.delay,pulse=.42+.22*Math.sin(this.age*.35),progress=this.delay>0?Math.max(0,Math.min(1,this.age/this.delay)):1;
    ctx.save();ctx.globalAlpha=active?.38:.2+pulse*.14;ctx.fillStyle=this.color;ctx.strokeStyle=this.color;ctx.lineWidth=active?4:2.5;ctx.setLineDash(active?[]:[9,7]);
    if(this.kind==='circle'||this.kind==='ring'){
      if(this.kind==='ring'){
        ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.arc(this.x,this.y,this.inner,0,Math.PI*2,true);if(active)ctx.fill('evenodd');ctx.stroke();
        ctx.beginPath();ctx.arc(this.x,this.y,this.inner,0,Math.PI*2);ctx.stroke();
      }else{ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);if(active)ctx.fill();ctx.stroke();}
    }else if(this.kind==='rect'){ctx.fillRect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);ctx.strokeRect(this.x-this.w/2,this.y-this.h/2,this.w,this.h);}
    else if(this.kind==='line'){ctx.lineWidth=active?(this.w||22):Math.max(3,(this.w||22)*.18);ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x2,this.y2);ctx.stroke();}
    ctx.setLineDash([]);
    if(!active&&this.delay>0){
      ctx.globalAlpha=.95;ctx.strokeStyle='#fff7cc';ctx.lineWidth=4;ctx.lineCap='round';ctx.shadowColor=this.color;ctx.shadowBlur=8;
      if(this.kind==='circle'||this.kind==='ring'){ctx.beginPath();ctx.arc(this.x,this.y,this.r+3,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();}
      else if(this.kind==='line'){ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x+(this.x2-this.x)*progress,this.y+(this.y2-this.y)*progress);ctx.stroke();}
      else if(this.kind==='rect')frBossDrawRectProgress(this,progress);
      ctx.shadowBlur=0;ctx.lineCap='butt';
    }
    ctx.restore();
  }
}
function frBossDrawRectProgress(h,progress){
  const x=h.x-h.w/2,y=h.y-h.h/2,perimeter=2*(h.w+h.h),distance=perimeter*progress;
  const points=[[x,y],[x+h.w,y],[x+h.w,y+h.h],[x,y+h.h],[x,y]],lengths=[h.w,h.h,h.w,h.h];
  let remain=distance;ctx.beginPath();ctx.moveTo(points[0][0],points[0][1]);
  for(let i=0;i<4&&remain>0;i++){const used=Math.min(lengths[i],remain),ratio=used/lengths[i];ctx.lineTo(points[i][0]+(points[i+1][0]-points[i][0])*ratio,points[i][1]+(points[i+1][1]-points[i][1])*ratio);remain-=used;}
  ctx.stroke();
}
class FrThunderFieldStrike extends FrBossHazard{
  constructor(x,y,damage){super({kind:'circle',x:x,y:y,r:44,color:'#facc15',damage:damage,status:{kind:'paralyze',duration:1000},delay:58,duration:10});this._frThunderField=true;}
  draw(){
    const active=this.age>this.delay,pulse=.45+.25*Math.sin(this.age*.5),progress=Math.max(0,Math.min(1,this.age/this.delay));
    ctx.save();ctx.globalAlpha=active?.48:pulse;ctx.strokeStyle=active?'#ffffff':'#fde047';ctx.fillStyle=active?'#facc154d':'#facc1518';ctx.lineWidth=active?5:2.5;ctx.setLineDash(active?[]:[8,6]);ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.setLineDash([]);
    if(!active){ctx.globalAlpha=.95;ctx.strokeStyle='#fff7cc';ctx.lineWidth=4;ctx.setLineDash([]);ctx.beginPath();ctx.arc(this.x,this.y,this.r+3,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();}
    if(active){ctx.globalAlpha=.9;ctx.strokeStyle='#fef08a';ctx.lineWidth=7;ctx.shadowBlur=18;ctx.shadowColor='#facc15';ctx.beginPath();ctx.moveTo(this.x-13,this.y-this.r-68);ctx.lineTo(this.x+8,this.y-this.r-35);ctx.lineTo(this.x-5,this.y-this.r-11);ctx.lineTo(this.x+14,this.y+2);ctx.stroke();}
    ctx.restore();
  }
}
function frBossHazard(options){const h=new FrBossHazard(options);hazards.push(h);return h;}
let frThunderArenaTimer=70;
class FrThunderChaserOrb{
  constructor(index){
    this._frThunderChaser=true;this.index=index||0;this.age=0;this.dead=false;this.r=23;this.hitCooldown=0;
    this.x=this.index?CW-58:58;this.y=135+this.index*54;
    this.vx=this.index?-1.1:1.1;this.vy=.45;
  }
  update(){
    this.age++;if(this.hitCooldown>0)this.hitCooldown--;
    if(Number(stage)!==11||currentBgIdx!==10||stageCleared){this.dead=true;return;}
    const dx=player.x-this.x,dy=player.y-this.y,dist=Math.hypot(dx,dy)||1;
    const other=hazards.find(function(h){return h&&h!==this&&h._frThunderChaser&&!h.dead;},this);
    let ax=dx/dist*.055,ay=dy/dist*.055;
    if(other){const odx=this.x-other.x,ody=this.y-other.y,od=Math.hypot(odx,ody)||1;if(od<82){const repel=(82-od)/82*.11;ax+=odx/od*repel;ay+=ody/od*repel;}}
    this.vx+=ax;this.vy+=ay;
    const maxSpeed=2.35,speed=Math.hypot(this.vx,this.vy)||1;
    if(speed>maxSpeed){this.vx=this.vx/speed*maxSpeed;this.vy=this.vy/speed*maxSpeed;}
    this.x+=this.vx;this.y+=this.vy;
    if(this.x<this.r){this.x=this.r;this.vx=Math.abs(this.vx)*.75;}
    else if(this.x>CW-this.r){this.x=CW-this.r;this.vx=-Math.abs(this.vx)*.75;}
    if(this.y<108+this.r){this.y=108+this.r;this.vy=Math.abs(this.vy)*.75;}
    else if(this.y>CH-this.r){this.y=CH-this.r;this.vy=-Math.abs(this.vy)*.75;}
    if(dist<this.r+player.radius&&this.hitCooldown<=0&&player.invTimer<=0){
      const nx=dx/dist,ny=dy/dist,damage=Math.round(10*frBalanceCurve(stage).bossDamage*frBossDamageScale(stage));
      hurtPlayer(damage);this.hitCooldown=62;this.vx=-nx*4.8;this.vy=-ny*4.8;
      player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+nx*54));
      player.y=Math.max(108+player.radius,Math.min(CH-player.radius,player.y+ny*54));
      player.vx=nx*4.5;player.vy=ny*4.5;
      burst(this.x,this.y,'#fde047',14);addText('雷球擊退',player.x,player.y-34,'#fde047',13,-.45);
    }
  }
  draw(){
    const pulse=.5+.5*Math.sin(this.age*.24+this.index*Math.PI),trail=Math.atan2(this.vy,this.vx);
    ctx.save();ctx.translate(this.x,this.y);ctx.rotate(trail);
    const grad=ctx.createRadialGradient(0,0,3,0,0,this.r+12);grad.addColorStop(0,'rgba(255,255,255,.98)');grad.addColorStop(.24,'rgba(254,240,138,.98)');grad.addColorStop(.58,'rgba(59,130,246,.78)');grad.addColorStop(1,'rgba(30,64,175,0)');
    ctx.globalAlpha=.28;ctx.fillStyle='#60a5fa';ctx.beginPath();ctx.ellipse(-18,0,30+pulse*8,12+pulse*3,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.shadowBlur=18+pulse*8;ctx.shadowColor='#60a5fa';ctx.fillStyle='#1d4ed8';ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,this.r+10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bfdbfe';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,this.r+2+pulse*3,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=8;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;ctx.lineCap='round';
    for(let i=0;i<4;i++){const a=this.age*.16+i*Math.PI/2;ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a+.32)*(this.r*.58),Math.sin(a+.32)*(this.r*.58));ctx.lineTo(Math.cos(a-.18)*(this.r+7+pulse*4),Math.sin(a-.18)*(this.r+7+pulse*4));ctx.stroke();}
    ctx.restore();
  }
}
function frThunderEnsureChaserOrbs(){
  const active=hazards.filter(function(h){return h&&h._frThunderChaser&&!h.dead;});
  if(Number(stage)!==11||currentBgIdx!==10||stageCleared){active.forEach(function(h){h.dead=true;});return;}
  const used={};active.forEach(function(h){used[h.index]=true;});
  for(let i=0;i<2;i++)if(!used[i])hazards.push(new FrThunderChaserOrb(i));
}
function frThunderSpawnFieldPair(){
  const curve=frBalanceCurve(stage),damage=Math.round(11*curve.bossDamage*frBossDamageScale(stage)),points=[];
  for(let i=0;i<2;i++){
    let x,y,tries=0;
    do{x=38+Math.random()*(CW-76);y=145+Math.random()*(CH-210);tries++;}while(points.length&&Math.hypot(x-points[0].x,y-points[0].y)<105&&tries<12);
    points.push({x:x,y:y});hazards.push(new FrThunderFieldStrike(x,y,damage));
  }
}
function frThunderArenaTick(){
  if(frPlayerParalyzed()&&player){player.vx=0;player.vy=0;}
  frThunderEnsureChaserOrbs();
  const active=hazards.filter(function(h){return h&&h._frThunderField&&!h.dead;}).length;
  frThunderArenaTimer--;if(frThunderArenaTimer<=0&&active===0){frThunderSpawnFieldPair();frThunderArenaTimer=150+Math.floor(Math.random()*65);}
}
function frBossLineRain(b,count,color,damage,gapIndex){
  const gap=gapIndex==null?Math.floor(Math.random()*count):gapIndex;
  for(let i=0;i<count;i++){if(i===gap)continue;const x=(i+.5)*CW/count;frBossShot({x:x,y:-22,color:color},Math.PI/2,4.2,damage,color,8,{oy:0});}
}
function frBossWallWithGap(b,side,color,damage){
  const rows=9,gap=2+Math.floor(Math.random()*(rows-4));
  for(let i=0;i<rows;i++){if(i===gap||i===gap+1)continue;const y=75+i*(CH-120)/rows;const src={x:side<0?-20:CW+20,y:y,color:color};frBossShot(src,side<0?0:Math.PI,4.4,damage,color,9,{oy:0});}
}
function frBossCrossLines(b,color,damage){
  frBossHazard({kind:'line',x:0,y:player.y,x2:CW,y2:player.y,w:34,color:color,damage:damage,delay:55,duration:32});
  frBossHazard({kind:'line',x:player.x,y:0,x2:player.x,y2:CH,w:34,color:color,damage:damage,delay:55,duration:32});
}
function frBossMeteor(b,count,color,damage,largeLast,status){
  for(let i=0;i<count;i++)frBossLater(b,i*18,function(){const x=35+Math.random()*(CW-70),y=130+Math.random()*(CH-210);frBossHazard({kind:'circle',x:x,y:y,r:largeLast&&i===count-1?88:42,color:color,damage:damage,status:status||null,delay:48,duration:14});});
}
function frBossCast(b,pattern,isSkill){
  const c=b.color,curve=frBalanceCurve(stage),phasePower=b._frFinal?[1,1.15,1.32][b._frThunderPhase||0]:1,stage11Power=b._frStage11Enhanced?FR_STAGE11_THUNDER.damage:1,d=Math.round((isSkill?14:9)*curve.bossDamage*frBossDamageScale(stage)*phasePower*stage11Power),w=55,tempo=frBossTempo(stage);
  b._frBusyUntil=b.timer+(isSkill?tempo.skillBusy:tempo.normalBusy);frBossAnimate(b,isSkill?105:72);
  if(isSkill)frBossWarning(b,'circle',48,{r:82});
  addText(isSkill?'⚠ '+b._frSkillLabels[pattern]:b._frNormalLabel,b.x,b.y-86,c,isSkill?15:12);
  if(pattern==='cocoaFan'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.58});frBossLater(b,w,function(){frBossFan(b,5,4.6,d,.18,c);});}
  else if(pattern==='coffeePools'){for(let i=0;i<3;i++)frBossLater(b,i*16,function(){frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*100,y:player.y+(Math.random()-.5)*80,r:48,color:'#78350f',damage:d,status:{kind:'slow',duration:2400},delay:48,duration:150});});}
  else if(pattern==='cookieRain'){frBossMeteor(b,7,'#d97706',d,true);}
  else if(pattern==='creamWalls'){frBossWarning(b,'rect',w,{x:CW/2,y:CH/2,w:CW,h:42});frBossLater(b,w,function(){frBossWallWithGap(b,-1,'#fff7ed',d);frBossWallWithGap(b,1,'#fff7ed',d);});}
  else if(pattern==='jellyBounce'){frBossWarning(b,'line',w,{angle:frBossAim(b)});frBossLater(b,w,function(){frBossShot(b,frBossAim(b),4,d,c,11,{bounce:true});});}
  else if(pattern==='jellyClones'){frBossLater(b,w,function(){frBossSummonMinions(b,2,1);});for(let s=-1;s<=1;s++)frBossLater(b,w+s*8,function(){frBossFan({x:b.x+s*70,y:b.y,color:c},3,4,d,.22,c);});}
  else if(pattern==='jellyRings'){for(let q=0;q<3;q++)frBossLater(b,w+q*26,function(){frBossRadial(b,10,3.2,d,c,q*.2);});}
  else if(pattern==='jellyRain'){frBossMeteor(b,9,c,d,true);}
  else if(pattern==='hornFan'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.35});frBossLater(b,w,function(){frBossFan(b,3,5.2,d,.2,c);});}
  else if(pattern==='doubleCharge'){for(let q=0;q<2;q++)frBossLater(b,q*82,function(){const a=frBossAim(b,true);frBossWarning(b,'line',48,{angle:a});frBossLater(b,48,function(){b._frDash={vx:Math.cos(a)*8,vy:Math.sin(a)*8,left:28,damage:d};});});}
  else if(pattern==='shockRings'){for(let q=0;q<3;q++)frBossLater(b,w+q*24,function(){frBossRadial(b,12,3+q*.5,d,c,q*.22);});}
  else if(pattern==='cleaverLanes'){frBossLater(b,w,function(){for(let i=0;i<5;i++)frBossHazard({kind:'rect',x:(i+.5)*CW/5,y:CH/2,w:CW/7,h:CH,color:c,damage:d,delay:50+i*10,duration:24});});}
  else if(pattern==='woolSplit'){frBossWarning(b,'line',w,{angle:frBossAim(b)});frBossLater(b,w,function(){frBossShot(b,frBossAim(b),3.2,d,c,13,{splitAt:40,splitCount:4,splitSpeed:3.3});});}
  else if(pattern==='sheepLanes'){for(let q=0;q<3;q++)frBossLater(b,w+q*30,function(){frBossLineRain(b,7,c,d);});}
  else if(pattern==='woolSpiral'){for(let q=0;q<5;q++)frBossLater(b,w+q*14,function(){frBossRadial(b,7,3.2,d,c,q*.35);});}
  else if(pattern==='slowCharge'){frBossHazard({kind:'ring',x:b.x,y:b.y,r:190,inner:105,color:c,damage:d,status:{kind:'slow',duration:2800},delay:50,duration:35});frBossLater(b,95,function(){const a=frBossAim(b);b._frDash={vx:Math.cos(a)*7,vy:Math.sin(a)*7,left:28,damage:d};});}
  else if(pattern==='chiliCurve'||pattern==='sauceCurve'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.4});frBossLater(b,w,function(){const a=frBossAim(b),status=pattern==='chiliCurve'?{kind:'burn',duration:3200}:null;frBossShot(b,a-.2,4,d,c,8,{curve:.012,burn:pattern==='chiliCurve',status:status});frBossShot(b,a+.2,4,d,c,8,{curve:-.012,burn:pattern==='chiliCurve',status:status});});}
  else if(pattern==='drainTether'){frBossWarning(b,'line',w,{angle:frBossAim(b)});frBossLater(b,w,function(){b._frTether={until:b.timer+150,damage:d,last:-99};});}
  else if(pattern==='chiliRain'){frBossMeteor(b,8,'#ef4444',d,true,{kind:'burn',duration:3400});}
  else if(pattern==='bloodDash'||pattern==='tripleDash'){for(let q=0;q<3;q++)frBossLater(b,q*70,function(){const a=frBossAim(b,true);frBossWarning(b,'line',42,{angle:a});frBossLater(b,42,function(){b._frDash={vx:Math.cos(a)*8,vy:Math.sin(a)*8,left:24,damage:d};});});}
  else if(pattern==='brothTriple'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.42});frBossLater(b,w,function(){frBossFan(b,3,3,d,.23,c,{radius:12});});}
  else if(pattern==='fogAim'){frBossWarning(b,'line',70,{angle:frBossAim(b,true),color:'#ffffff'});frBossLater(b,70,function(){frBossFan(b,1,7,d,0,'#e0f2fe',{status:{kind:'attackDown',duration:3200}},frBossAim(b,true));});}
  else if(pattern==='iceFlower'){for(let q=0;q<3;q++)frBossLater(b,w+q*26,function(){frBossRadial(b,12,3.3,d,'#7dd3fc',q*.25,{status:{kind:'freeze',duration:2200}});});}
  else if(pattern==='hotCold'){const left=Math.random()<.5;frBossHazard({kind:'rect',x:left?CW*.25:CW*.75,y:CH/2,w:CW/2,h:CH,color:left?'#38bdf8':'#ef4444',damage:d,status:left?{kind:'freeze',duration:2200}:{kind:'burn',duration:3200},delay:65,duration:75});frBossLater(b,155,function(){frBossHazard({kind:'rect',x:left?CW*.75:CW*.25,y:CH/2,w:CW/2,h:CH,color:left?'#ef4444':'#38bdf8',damage:d,status:left?{kind:'burn',duration:3200}:{kind:'freeze',duration:2200},delay:50,duration:60});});}
  else if(pattern==='crossCrescent'||pattern==='clawCrescent'){frBossLater(b,w,function(){const a=frBossAim(b);frBossShot(b,a-.32,4.4,d,c,9,{curve:.018});frBossShot(b,a+.32,4.4,d,c,9,{curve:-.018});});}
  else if(pattern==='poisonSweep'){for(let q=0;q<7;q++)frBossLater(b,w+q*9,function(){frBossShot(b,Math.PI*.2+q*.11,4,d,c,9,{status:{kind:'poison',duration:4200}});});}
  else if(pattern==='seedMines'||pattern==='syrupPools'){for(let q=0;q<5;q++){const x=35+Math.random()*(CW-70),y=150+Math.random()*(CH-230);frBossLater(b,q*14,function(){frBossHazard({kind:'circle',x:x,y:y,r:34,color:c,damage:d,status:pattern==='syrupPools'?{kind:'slow',duration:2600}:{kind:'poison',duration:4200},delay:65,duration:150});});}}
  else if(pattern==='vineCage'){const gap=Math.random()*Math.PI*2;for(let i=0;i<12;i++){if(Math.abs(((Math.PI*2*i/12-gap+Math.PI*3)%(Math.PI*2))-Math.PI)<.5)continue;const a=Math.PI*2*i/12;frBossHazard({kind:'circle',x:CW/2+Math.cos(a)*145,y:CH*.57+Math.sin(a)*145,r:25,color:c,damage:d,delay:60,duration:100});}}
  else if(pattern==='leadBurst'){frBossLater(b,w,function(){frBossFan(b,4,5,d,.11,c,null,frBossAim(b,true));});}
  else if(pattern==='pumpkinRoll'){for(let q=0;q<4;q++)frBossLater(b,q*24,function(){const side=Math.random()<.5?-1:1;frBossShot({x:side<0?-15:CW+15,y:150+Math.random()*(CH-230),color:c},side<0?0:Math.PI,4.5,d,c,14,{oy:0,bounce:true});});}
  else if(pattern==='lockBeam'){const a=frBossAim(b,true);frBossWarning(b,'line',75,{angle:a});frBossLater(b,75,function(){frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*CH*1.4,y2:b.y+Math.sin(a)*CH*1.4,w:42,color:c,damage:d,delay:0,duration:38});});}
  else if(pattern==='pumpkinMeteors'){frBossMeteor(b,7,c,d,true,{kind:'burn',duration:3200});}
  else if(pattern==='chickenShotgun'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.7});frBossLater(b,w,function(){frBossFan(b,7,5,d,.12,c);});}
  else if(pattern==='bodySlam'){const tx=player.x,ty=player.y;frBossHazard({kind:'circle',x:tx,y:ty,r:75,color:c,damage:d,delay:58,duration:20});frBossLater(b,58,function(){b.x=tx;b.y=Math.min(CH*.55,ty);});}
  else if(pattern==='oilRain'){frBossMeteor(b,6,'#a16207',d,false,{kind:'burn',duration:3000});}
  else if(pattern==='pathDash'){const a=frBossAim(b,true);frBossWarning(b,'line',60,{angle:a});frBossLater(b,60,function(){b._frDash={vx:Math.cos(a)*8.5,vy:Math.sin(a)*8.5,left:32,damage:d,trail:true};});}
  else if(pattern==='conveyor'){for(let q=0;q<3;q++)frBossLater(b,w+q*28,function(){frBossWallWithGap(b,q%2?-1:1,c,d);});}
  else if(pattern==='reverseSpiral'||pattern==='tomatoSpiral'){for(let q=0;q<8;q++)frBossLater(b,w+q*11,function(){frBossRadial(b,5,3.3,d,c,(pattern==='reverseSpiral'&&q>3?-q:q)*.32,pattern==='tomatoSpiral'?{status:{kind:'burn',duration:3000}}:null);});}
  else if(pattern==='riceFan'||pattern==='iceFan'||pattern==='inkFan'){frBossLater(b,w,function(){frBossFan(b,pattern==='inkFan'?3:7,4.2,d,pattern==='inkFan'?.22:.14,c);});}
  else if(pattern==='riceTornado'){frBossHazard({kind:'circle',x:CW/2,y:CH*.55,r:72,color:c,damage:d,pull:.018,delay:55,duration:160});}
  else if(pattern==='eggOrbit'||pattern==='orbitFries'){if(pattern==='eggOrbit')frBossLater(b,w,function(){frBossSummonMinions(b,2,2);});for(let q=0;q<4;q++)frBossLater(b,w+q*28,function(){frBossRadial(b,8,3.7,d,c,q*.38);});}
  else if(pattern==='wokShock'){for(let q=0;q<3;q++)frBossLater(b,q*65,function(){const x=player.x,y=player.y;frBossHazard({kind:'circle',x:x,y:y,r:q===2?90:58,color:c,damage:d,delay:48,duration:20});});}
  else if(pattern==='ringShot'){frBossLater(b,w,function(){frBossRadial(b,10,3,d,c,b.timer*.03);});}
  else if(pattern==='sandTrail'){const a=frBossAim(b);b._frDash={vx:Math.cos(a)*5.5,vy:Math.sin(a)*5.5,left:55,damage:d,trail:true,status:{kind:'poison',duration:3600}};}
  else if(pattern==='lidCross'){frBossCrossLines(b,c,d);}
  else if(pattern==='closingLoops'||pattern==='contractingCircles'){for(let q=0;q<3;q++)frBossLater(b,q*52,function(){frBossHazard({kind:'ring',x:CW/2,y:CH*.55,r:180-q*38,inner:125-q*32,color:c,damage:d,delay:55,duration:30});});}
  else if(pattern==='iceSweep'){for(let q=0;q<8;q++)frBossLater(b,w+q*7,function(){frBossShot(b,.25+q*.18,4.8,d,c,9,{status:{kind:'freeze',duration:2100}});});}
  else if(pattern==='iceColumns'||pattern==='fryColumns'){for(let q=0;q<5;q++){const x=(q+.5)*CW/5;frBossHazard({kind:'rect',x:x,y:CH/2,w:44,h:CH,color:c,damage:d,status:pattern==='iceColumns'?{kind:'freeze',duration:2200}:null,delay:50+q*12,duration:22});}}
  else if(pattern==='avalanche'){for(let q=0;q<4;q++)frBossLater(b,q*28,function(){frBossLineRain(b,8,c,d);});frBossLater(b,w,function(){frBossApplyStatus({kind:'slow',duration:1800});});}
  else if(pattern==='turnTwin'){frBossLater(b,w,function(){const a=frBossAim(b);frBossShot(b,a-.25,4,d,c,9,{turnAt:35});frBossShot(b,a+.25,4,d,c,9,{turnAt:35});});}
  else if(pattern==='snowcone'){for(let q=0;q<6;q++)frBossLater(b,w+q*14,function(){frBossRadial(b,6,3.4,d,c,q*.3,{status:{kind:'freeze',duration:2000}});});}
  else if(pattern==='sideAvalanche'){for(let q=0;q<4;q++)frBossLater(b,q*30,function(){frBossWallWithGap(b,q%2?-1:1,c,d);});}
  else if(pattern==='crossSlash'){frBossLater(b,w,function(){frBossFan(b,2,5.5,d,.55,c,{radius:9});});}
  else if(pattern==='lineSlashes'){for(let q=0;q<3;q++)frBossLater(b,q*60,function(){const a=frBossAim(b,true);frBossWarning(b,'line',45,{angle:a});frBossLater(b,45,function(){frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*CH*1.5,y2:b.y+Math.sin(a)*CH*1.5,w:32,color:c,damage:d,delay:0,duration:24});});});}
  else if(pattern==='noodleCurve'){frBossLater(b,w,function(){frBossFan(b,3,4,d,.2,c,{curve:.01});});}
  else if(pattern==='noodleGrid'){const safe=Math.floor(Math.random()*9);for(let iy=0;iy<3;iy++)for(let ix=0;ix<3;ix++){if(iy*3+ix===safe)continue;frBossHazard({kind:'rect',x:(ix+.5)*CW/3,y:110+(iy+.5)*(CH-150)/3,w:CW/3-12,h:(CH-150)/3-12,color:c,damage:d,delay:70,duration:24});}}
  else if(pattern==='flakeCross'){frBossLater(b,w,function(){frBossRadial(b,4,4.4,d,c,Math.PI/4);});}
  else if(pattern==='groundEruptions'){for(let q=0;q<5;q++)frBossLater(b,q*25,function(){frBossHazard({kind:'circle',x:player.x,y:player.y,r:44+q*4,color:c,damage:d,delay:48,duration:18});});}
  else if(pattern==='shieldRadial'){b.shield=Math.min(b.maxShield,b.shield+Math.floor(b.maxShield*.35));b.shieldBroken=false;updateBossShield();for(let q=0;q<4;q++)frBossLater(b,w+q*22,function(){frBossRadial(b,10,3.2,d,c,q*.25);});}
  else if(pattern==='insideOutside'){frBossHazard({kind:'circle',x:CW/2,y:CH*.55,r:105,color:c,damage:d,delay:60,duration:32});frBossLater(b,120,function(){frBossHazard({kind:'ring',x:CW/2,y:CH*.55,r:230,inner:105,color:c,damage:d,delay:50,duration:32});});}
  else if(pattern==='creamSplit'){frBossLater(b,w,function(){frBossShot(b,frBossAim(b),3.5,d,c,13,{splitAt:34,splitCount:3,splitSpeed:3.6});});}
  else if(pattern==='chickenLegRain'){frBossLater(b,w,function(){frBossSummonMinions(b,2,3);});frBossMeteor(b,8,c,d,true);}
  else if(pattern==='creamSweep'){const fromLeft=Math.random()<.5;frBossHazard({kind:'rect',x:fromLeft?-CW/2:CW*1.5,y:CH/2,w:CW,h:CH,color:c,damage:d,status:{kind:'attackDown',duration:3200},delay:45,duration:150,moveX:fromLeft?CW/150:-CW/150});}
  else if(pattern==='closingWalls'){frBossLater(b,w,function(){frBossWallWithGap(b,-1,c,d);frBossWallWithGap(b,1,c,d);frBossRadial(b,8,3.5,d,c,.2);});}
  else if(pattern==='tentacleLanes'){frBossLater(b,w,function(){frBossSummonMinions(b,2,3);});for(let q=0;q<4;q++){const x=(q+.5)*CW/4;frBossHazard({kind:'rect',x:x,y:CH/2,w:52,h:CH,color:c,damage:d,delay:48+q*15,duration:24});}}
  else if(pattern==='inkCloud'){for(let q=0;q<4;q++)frBossHazard({kind:'circle',x:45+Math.random()*(CW-90),y:140+Math.random()*(CH-210),r:48,color:'#312e81',damage:d,status:{kind:'attackDown',duration:3400},delay:55,duration:125});frBossLater(b,65,function(){frBossFan(b,5,4.8,d,.18,'#f8fafc');});}
  else if(pattern==='centerPull'){frBossHazard({kind:'circle',x:CW/2,y:CH*.55,r:70,color:c,damage:d,pull:.025,delay:45,duration:145});for(let q=0;q<4;q++)frBossLater(b,w+q*26,function(){frBossRadial({x:CW/2,y:CH*.55,color:c},10,3,d,c,q*.2);});}
  else if(pattern==='horizontalCharges'){for(let q=0;q<3;q++)frBossLater(b,q*68,function(){const side=Math.random()<.5?-1:1,y=150+Math.random()*(CH-230);frBossHazard({kind:'line',x:side<0?0:CW,y:y,x2:side<0?CW:0,y2:y,w:44,color:c,damage:d,delay:46,duration:24});});}
  else if(pattern==='bubbleLock'){const x=player.x,y=player.y;for(let q=0;q<3;q++)frBossLater(b,q*38,function(){frBossHazard({kind:'circle',x:x+(Math.random()-.5)*80,y:y+(Math.random()-.5)*80,r:42+q*8,color:c,damage:d,status:{kind:'slow',duration:2500},delay:55,duration:20});});}
  else if(pattern==='waterWalls'){for(let q=0;q<4;q++)frBossLater(b,q*25,function(){frBossWallWithGap(b,q%2?-1:1,c,d);});}
  else if(pattern==='espressoSweep'){const firstGap=Math.floor(Math.random()*5);for(let q=0;q<3;q++)frBossLater(b,q*38,function(){const gap=(firstGap+q*2)%5;for(let i=0;i<5;i++){if(i===gap)continue;frBossHazard({kind:'rect',x:(i+.5)*CW/5,y:CH/2,w:CW/5-8,h:CH,color:'#78350f',damage:d,status:{kind:'slow',duration:1900},delay:52,duration:18});}});}
  else if(pattern==='crownBounce'){frBossLater(b,w,function(){frBossFan(b,3,4.5,d,.32,'#f472b6',{radius:14,bounce:true,splitAt:46,splitCount:5,splitSpeed:3.6},frBossAim(b,true));});}
  else if(pattern==='hornQuake'){const a=frBossAim(b,true);frBossWarning(b,'line',50,{angle:a,color:'#fca5a5'});frBossLater(b,50,function(){b._frDash={vx:Math.cos(a)*9.2,vy:Math.sin(a)*9.2,left:26,damage:d};});frBossLater(b,92,function(){frBossHazard({kind:'ring',x:b.x,y:b.y,r:175,inner:82,color:c,damage:d,delay:42,duration:28});});}
  else if(pattern==='woolPrison'){const cx=player.x,cy=player.y,gap=Math.floor(Math.random()*14);for(let i=0;i<14;i++){if(i===gap||i===(gap+7)%14)continue;const a=Math.PI*2*i/14;frBossHazard({kind:'circle',x:cx+Math.cos(a)*128,y:cy+Math.sin(a)*128,r:24,color:c,damage:d,status:{kind:'slow',duration:2200},delay:54,duration:85});}frBossLater(b,86,function(){frBossRadial({x:cx,y:cy,color:c},10,3.8,d,c,.2);});}
  else if(pattern==='boilingBloodHunt'){for(let q=0;q<3;q++)frBossLater(b,q*58,function(){const a=frBossAim(b,true);frBossWarning(b,'line',38,{angle:a,color:'#fb7185'});frBossLater(b,38,function(){b._frDash={vx:Math.cos(a)*9,vy:Math.sin(a)*9,left:23,damage:d,trail:true,status:{kind:'burn',duration:3200}};});});}
  else if(pattern==='frostfireCorridor'){const leftFirst=Math.random()<.5;frBossHazard({kind:'rect',x:leftFirst?CW*.25:CW*.75,y:CH/2,w:CW/2,h:CH,color:'#38bdf8',damage:d,status:{kind:'freeze',duration:2100},delay:52,duration:38});frBossLater(b,92,function(){frBossHazard({kind:'rect',x:leftFirst?CW*.75:CW*.25,y:CH/2,w:CW/2,h:CH,color:'#ef4444',damage:d,status:{kind:'burn',duration:3000},delay:44,duration:34});});}
  else if(pattern==='bitterVineChase'){for(let q=0;q<6;q++)frBossLater(b,q*25,function(){const x=player.x+(player.vx||0)*14,y=player.y+(player.vy||0)*14;frBossHazard({kind:'circle',x:x,y:y,r:38,color:c,damage:d,status:{kind:'poison',duration:4200},delay:44,duration:42});});}
  else if(pattern==='pumpkinChainBurst'){const cx=player.x,cy=player.y,offset=Math.random()*Math.PI*2;for(let q=0;q<6;q++){const a=offset+Math.PI*2*q/6;frBossHazard({kind:'circle',x:cx+Math.cos(a)*82,y:cy+Math.sin(a)*82,r:q===5?58:40,color:c,damage:d,status:{kind:'burn',duration:3000},delay:44+q*10,duration:14});}}
  else if(pattern==='fryerShockDrop'){const tx=player.x,ty=player.y;frBossHazard({kind:'circle',x:tx,y:ty,r:72,color:c,damage:d,status:{kind:'burn',duration:3000},delay:52,duration:20});frBossLater(b,62,function(){b.x=tx;b.y=Math.min(CH*.55,ty);frBossHazard({kind:'ring',x:tx,y:ty,r:178,inner:78,color:'#fbbf24',damage:d,delay:38,duration:28});});}
  else if(pattern==='sauceRushTrail'){for(let q=0;q<2;q++)frBossLater(b,q*78,function(){const a=frBossAim(b,true);frBossWarning(b,'line',44,{angle:a,color:'#f59e0b'});frBossLater(b,44,function(){b._frDash={vx:Math.cos(a)*9.4,vy:Math.sin(a)*9.4,left:30,damage:d,trail:true,status:{kind:'slow',duration:2200}};});});}
  else if(pattern==='wokFlipBurst'){frBossLater(b,w,function(){frBossFan(b,9,4.7,d,.11,c,null,frBossAim(b,true));});for(let q=0;q<4;q++)frBossLater(b,35+q*28,function(){frBossHazard({kind:'circle',x:player.x,y:player.y,r:44+q*5,color:'#f97316',damage:d,delay:42,duration:16});});}
  else if(pattern==='burrowAmbush'){const tx=player.x+(player.vx||0)*18,ty=player.y+(player.vy||0)*18,a=Math.atan2(ty-b.y,tx-b.x),reach=Math.max(CW,CH)*1.35;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:38,color:c,damage:d,status:{kind:'poison',duration:3600},delay:50,duration:20});frBossLater(b,52,function(){b.x=Math.max(55,Math.min(CW-55,tx));b.y=Math.max(frBossSafeCenterY(b),Math.min(CH*.58,ty));frBossHazard({kind:'circle',x:b.x,y:b.y,r:78,color:c,damage:d,delay:34,minDelay:24,duration:18});});}
  else if(pattern==='frostThornWheel'){const cx=CW/2,cy=CH*.55,reach=Math.max(CW,CH);for(let q=0;q<8;q++){const a=Math.PI*q/8;frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:28,color:'#bae6fd',damage:d,status:{kind:'freeze',duration:2100},delay:42+q*8,duration:12});}}
  else if(pattern==='syrupAvalanche'){for(let q=0;q<4;q++)frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*130,y:player.y+(Math.random()-.5)*105,r:42,color:'#fbbf24',damage:d,status:{kind:'slow',duration:2700},delay:48+q*8,duration:75});for(let q=0;q<4;q++)frBossLater(b,72+q*27,function(){frBossLineRain(b,8,'#e0f2fe',d);});}
  else if(pattern==='swordNet'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH);for(let q=0;q<4;q++){const a=q*Math.PI/4;frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:30,color:c,damage:d,delay:44+q*12,duration:13});}}
  else if(pattern==='noodleBindGrid'){const castGrid=function(safe,extra){for(let iy=0;iy<3;iy++)for(let ix=0;ix<3;ix++){if(iy*3+ix===safe)continue;frBossHazard({kind:'rect',x:(ix+.5)*CW/3,y:110+(iy+.5)*(CH-150)/3,w:CW/3-12,h:(CH-150)/3-12,color:c,damage:d,status:{kind:'slow',duration:2100},delay:52+extra,duration:18});}};const first=Math.floor(Math.random()*9);castGrid(first,0);frBossLater(b,88,function(){castGrid((first+4)%9,0);});}
  else if(pattern==='pastryCollapse'){const cx=player.x,cy=player.y;frBossHazard({kind:'circle',x:cx,y:cy,r:92,color:c,damage:d,delay:54,duration:24});frBossLater(b,82,function(){frBossHazard({kind:'ring',x:cx,y:cy,r:220,inner:95,color:'#f59e0b',damage:d,delay:42,duration:26});});frBossLater(b,132,function(){frBossRadial({x:cx,y:cy,color:c},12,4,d,c,.16);});}
  else if(pattern==='creamBaptism'){for(let q=0;q<4;q++){const width=56+q*44;frBossHazard({kind:'rect',x:width/2,y:CH/2,w:width,h:CH,color:c,damage:d,status:{kind:'attackDown',duration:3000},delay:46+q*14,duration:16});frBossHazard({kind:'rect',x:CW-width/2,y:CH/2,w:width,h:CH,color:c,damage:d,status:{kind:'attackDown',duration:3000},delay:46+q*14,duration:16});}}
  else if(pattern==='eightArmCombo'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH)*1.2;for(let q=0;q<8;q++){const a=q*Math.PI/4;frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:26,color:c,damage:d,delay:38+q*8,duration:11});}}
  else if(pattern==='pressureCannon'){for(let q=0;q<3;q++)frBossLater(b,q*44,function(){const a=frBossAim(b,true),reach=Math.max(CW,CH)*1.55;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:42-q*8,color:'#67e8f9',damage:d,status:q===2?{kind:'slow',duration:2400}:null,delay:48-q*7,minDelay:24,duration:16});});}
  else if(pattern==='hiddenSpark'){frBossWarning(b,'cone',42,{angle:frBossAim(b),spread:.38});frBossLater(b,42,function(){const a=frBossAim(b,true),count=b._frStage11Rage?4:3;frBossFan(b,count,4.1,d,.2,c,{radius:7,status:{kind:'paralyze',duration:1000}},a);});}
  else if(pattern==='thunderMarks'){const count=b._frStage11Rage?5:4;for(let q=0;q<count;q++)frBossLater(b,q*23,function(){frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*72,y:player.y+(Math.random()-.5)*58,r:42,color:'#fde047',damage:d,status:{kind:'paralyze',duration:1000},delay:46,duration:12});});}
  else if(pattern==='cloakDash'){for(let q=0;q<3;q++)frBossLater(b,q*62,function(){const a=frBossAim(b,true);frBossWarning(b,'line',38,{angle:a,color:'#c4b5fd'});frBossLater(b,38,function(){const speed=9*(b._frStage11Rage?1.1:1);b._frDash={vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,left:22,damage:d,status:{kind:'paralyze',duration:1000}};});});}
  else if(pattern==='staticCage'){const gap=Math.floor(Math.random()*12);for(let i=0;i<12;i++){if(i===gap||i===(gap+1)%12)continue;const a=Math.PI*2*i/12;frBossHazard({kind:'circle',x:player.x+Math.cos(a)*132,y:player.y+Math.sin(a)*132,r:23,color:'#a78bfa',damage:d,status:{kind:'paralyze',duration:1000},delay:58,duration:100});}frBossLater(b,82,function(){frBossRadial(b,10,3.5,d,c,.2);});}
  else if(pattern==='fiveLaserCannons'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+150);for(let q=0;q<5;q++)frBossLater(b,q*24,function(){const a=frBossAim(b,true),reach=Math.max(CW,CH)*1.55;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:13,color:'#ddd6fe',damage:d,status:{kind:'paralyze',duration:1000},delay:30,minDelay:24,duration:10});});}
  else if(pattern==='vajraFan'){frBossWarning(b,'cone',44,{angle:frBossAim(b,true),spread:.58});frBossLater(b,44,function(){frBossFan(b,5,5,d,.15,c,{radius:8},frBossAim(b,true));});}
  else if(pattern==='heavenLances'){for(let q=0;q<3;q++)frBossLater(b,q*64,function(){const a=frBossAim(b,true);frBossWarning(b,'line',46,{angle:a,color:'#38bdf8'});frBossLater(b,46,function(){frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*CH*1.5,y2:b.y+Math.sin(a)*CH*1.5,w:38,color:'#7dd3fc',damage:d,status:{kind:'paralyze',duration:1000},delay:0,duration:18});});});}
  else if(pattern==='warDrumRings'){for(let q=0;q<4;q++)frBossLater(b,q*32,function(){frBossRadial(b,12,3.2+q*.28,d,c,q*.23,q===3?{status:{kind:'paralyze',duration:1000}}:null);});}
  else if(pattern==='armorCounter'){b._frArmorCounterUntil=b.timer+105;addText('雷鎧反震',b.x,b.y-104,'#7dd3fc',15);for(let q=0;q<3;q++)frBossLater(b,48+q*26,function(){frBossRadial(b,10,3.7,d,c,q*.3);});}
  else if(pattern==='sixWayLances'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+205);const offset=Math.random()*Math.PI*2;for(let q=0;q<6;q++)frBossLater(b,q*30,function(){const a=offset+Math.PI*2*q/6,sx=CW/2+Math.cos(a)*Math.max(CW,CH),sy=CH/2+Math.sin(a)*Math.max(CW,CH),tx=player.x+(player.vx||0)*12,ty=player.y+(player.vy||0)*12,aim=Math.atan2(ty-sy,tx-sx),reach=Math.max(CW,CH)*1.8;frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(aim)*reach,y2:sy+Math.sin(aim)*reach,w:17,color:'#7dd3fc',damage:d,status:{kind:'paralyze',duration:1000},delay:32,minDelay:24,duration:11});});}
  else if(pattern==='orbitLances'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+185);for(let q=0;q<6;q++)frBossLater(b,q*26,function(){const orbit=Math.PI*2*q/6+b.timer*.04,sx=b.x+Math.cos(orbit)*76,sy=b.y+Math.sin(orbit)*76,aim=Math.atan2(player.y-sy,player.x-sx),reach=Math.max(CW,CH)*1.5;frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(aim)*reach,y2:sy+Math.sin(aim)*reach,w:16,color:'#bae6fd',damage:d,status:{kind:'paralyze',duration:1000},delay:30,minDelay:24,duration:10});});}
  else if(pattern==='lanceRush'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+285);for(let q=0;q<5;q++)frBossLater(b,q*52,function(){const a=frBossAim(b,true);frBossWarning(b,'line',28,{x:b.x,y:b.y,angle:a,color:'#7dd3fc'});frBossLater(b,28,function(){b._frDash={vx:Math.cos(a)*10,vy:Math.sin(a)*10,left:20,damage:d,status:{kind:'paralyze',duration:1000}};});});}
  else if(pattern==='livingLightning'){const a=frBossAim(b,true);frBossWarning(b,'line',34,{angle:a,color:'#fde047'});frBossLater(b,34,function(){for(let q=-1;q<=1;q++)frBossShot(b,a+q*.12,6.2,d,'#fef08a',7,{status:q===0?{kind:'paralyze',duration:1000}:null});});}
  else if(pattern==='ninefoldJudgment'){for(let q=0;q<9;q++)frBossLater(b,q*15,function(){frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*120,y:player.y+(Math.random()-.5)*95,r:q===8?72:36,color:'#facc15',damage:d,status:{kind:'paralyze',duration:1000},delay:40,duration:11});});}
  else if(pattern==='thunderDomain'){frBossHazard({kind:'circle',x:CW/2,y:CH*.56,r:105,color:'#fef08a',damage:d,status:{kind:'paralyze',duration:1000},delay:55,duration:25});frBossLater(b,105,function(){frBossHazard({kind:'ring',x:CW/2,y:CH*.56,r:230,inner:108,color:'#facc15',damage:d,status:{kind:'paralyze',duration:1000},delay:48,duration:28});});frBossLater(b,180,function(){frBossRadial(b,16,4,d,c,.1);});}
  else if(pattern==='finalThunderstorm'){for(let q=0;q<10;q++)frBossLater(b,q*16,function(){frBossHazard({kind:'circle',x:30+Math.random()*(CW-60),y:125+Math.random()*(CH-185),r:q>7?64:38,color:'#facc15',damage:d,status:{kind:'paralyze',duration:1000},delay:42,duration:12});});for(let q=0;q<4;q++)frBossLater(b,45+q*40,function(){frBossRadial(b,14,3.8,d,c,q*.31);});}
  else if(pattern==='crossThunderPillars'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+110);const base=Math.floor(Math.random()*8)*Math.PI/4;for(let q=0;q<2;q++){const a=base+q*(Math.PI/2+Math.PI/4),cx=CW*(.32+.36*Math.random()),cy=CH*(.38+.3*Math.random()),reach=Math.max(CW,CH)*1.5;frBossLater(b,q*36,function(){frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:34,color:'#fef08a',damage:d,status:{kind:'paralyze',duration:1000},delay:32,minDelay:24,duration:22});});}}
  else if(pattern==='delayedThunderOrbs'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+175);for(let q=0;q<3;q++)frBossLater(b,q*46,function(){const tx=player.x+(player.vx||0)*10,ty=player.y+(player.vy||0)*10,a=Math.atan2(ty-b.y,tx-b.x);frBossWarning(b,'line',26,{angle:a,color:'#fef08a'});frBossLater(b,26,function(){frBossShot(b,a,4.5,d,'#fef08a',16,{stopX:tx,stopY:ty,explodeColor:'#facc15',explodeDamage:Math.round(d*1.15),status:{kind:'paralyze',duration:1000}});});});}
}

const FR_BOSS_SKILL_LABELS={
  coffeePools:'咖啡泥沼',cookieRain:'餅乾墜落',creamWalls:'奶霜城牆',jellyClones:'果凍分身',jellyRings:'彈力波紋',jellyRain:'果凍暴雨',
  doubleCharge:'魔牛二連衝',shockRings:'踏地震波',cleaverLanes:'屠刀封路',sheepLanes:'羊群奔襲',woolSpiral:'羊毛螺旋',slowCharge:'遲緩音浪',
  drainTether:'鮮血汲取',chiliRain:'辣椒血雨',bloodDash:'血影連衝',fogAim:'白霧狙擊',iceFlower:'冰花綻放',hotCold:'冷熱交替',
  poisonSweep:'苦毒扇風',seedMines:'連鎖籽雷',vineCage:'藤蔓牢籠',pumpkinRoll:'南瓜滾輪',lockBeam:'鬼火鎖定',pumpkinMeteors:'萬聖墜星',
  bodySlam:'唐揚重壓',oilRain:'熱油雨',tripleDash:'正義三連衝',pathDash:'星鰻突進',conveyor:'壽司輸送帶',reverseSpiral:'逆轉醬火',
  riceTornado:'炒飯龍捲',eggOrbit:'蛋黃護星',wokShock:'鐵鍋三連震',sandTrail:'腸衣潛行',lidCross:'鍋蓋十字震',closingLoops:'腸圈收縮',
  iceSweep:'榴槤冰刃',iceColumns:'寒刺冰柱',avalanche:'冰棒雪崩',syrupPools:'芒果糖漿',snowcone:'雪花旋盤',sideAvalanche:'芒果側雪崩',
  fryColumns:'薯條劍雨',lineSlashes:'一閃三斬',orbitFries:'薯條劍陣',tomatoSpiral:'番茄螺旋',contractingCircles:'麵圈束縛',noodleGrid:'麵條九宮格',
  groundEruptions:'濃湯地湧',shieldRadial:'酥皮護盾',insideOutside:'內外翻煮',chickenLegRain:'燉雞天降',creamSweep:'奶油洪流',closingWalls:'奶油合壁',
  tentacleLanes:'八爪拍擊',inkCloud:'墨雲彈幕',centerPull:'深海漩渦',horizontalCharges:'重甲橫衝',bubbleLock:'泡影鎖定',waterWalls:'水牆鉗殺',
  espressoSweep:'濃縮咖啡掃射',crownBounce:'王冠彈跳',hornQuake:'震角圍獵',woolPrison:'羊毛縮圈',boilingBloodHunt:'沸血追獵',frostfireCorridor:'冰火迴廊',
  bitterVineChase:'苦藤追根',pumpkinChainBurst:'南瓜連爆',fryerShockDrop:'油鍋震落',sauceRushTrail:'蒲燒疾走',wokFlipBurst:'大火翻鍋',burrowAmbush:'地底伏擊',
  frostThornWheel:'寒刺輪轉',syrupAvalanche:'糖漿雪崩',swordNet:'劍網封步',noodleBindGrid:'麵線追縛',pastryCollapse:'酥皮崩鍋',creamBaptism:'奶油洗禮',
  eightArmCombo:'八臂連拍',pressureCannon:'高壓水砲',
  thunderMarks:'雷印追獵',cloakDash:'披風雷閃',staticCage:'靜電牢籠',fiveLaserCannons:'五連雷射砲',heavenLances:'天雷槍陣',warDrumRings:'雷鼓震環',armorCounter:'雷鎧反震',sixWayLances:'六合雷槍',orbitLances:'雷槍輪陣',lanceRush:'雷槍五突',ninefoldJudgment:'九重天罰',thunderDomain:'雷神領域',finalThunderstorm:'終焉雷暴',crossThunderPillars:'八方雷柱',delayedThunderOrbs:'雷光爆彈'
};
const FR_BOSS_NORMAL_LABELS={
  cocoaFan:'可可扇射',jellyBounce:'彈跳果凍',hornFan:'魔角三連',woolSplit:'分裂羊毛',chiliCurve:'辣椒蝠刃',brothTriple:'雪湯三珠',crossCrescent:'苦月交叉',leadBurst:'預判鬼火',chickenShotgun:'唐揚散射',sauceCurve:'蒲燒雙刃',riceFan:'米粒扇射',ringShot:'腸圈彈',iceFan:'榴槤冰片',turnTwin:'芒果折射',crossSlash:'薯條交叉斬',noodleCurve:'麵帶曲射',flakeCross:'酥皮十字',creamSplit:'奶油分裂彈',inkFan:'墨汁三連',clawCrescent:'機爪雙月',hiddenSpark:'隱雷三閃',vajraFan:'金剛雷扇',livingLightning:'閃電追獵'
};
function frThunderApplyPhase(b,phase,refill){
  const root=b._frRootDef||b._frDef,kits=root.phaseKits||[],kit=kits[phase]||kits[0];
  b._frThunderPhase=phase;b._frDef=Object.assign({},root,kit);b.name='小雷神';b.color=kit.color;
  b._frSkillBag=frBossShuffle(kit.skills);b._frNormalLabel=FR_BOSS_NORMAL_LABELS[kit.normal]||'雷擊';
  b._frAttackCd=phase===0?88:phase===1?74:60;b._frAttackCount=0;b._frSkillCastCount=0;b._frBusyUntil=b.timer+45;b._frEvents=[];b._frWarnings=[];b._frDash=null;b._frTether=null;b._frArmorCounterUntil=0;
  if(refill){b.hp=b.maxHp;b.shield=b.maxShield;b.shieldBroken=false;b.shieldResetTimer=10*60;updateBossHp();updateBossShield();}
  frThunderImage('phase'+(phase+1));
  if(b._frFullEncounter&&phase===0){frThunderImage('transition12');frThunderImage('phase2');}
  if(b._frFullEncounter&&phase===1){frThunderImage('transition23');frThunderImage('phase3');}
  const name=document.getElementById('bossName'),fill=document.getElementById('bossFill'),shieldBar=document.getElementById('bossShieldBar');if(name)name.textContent='⚡ 小雷神';
  if(fill)fill.style.background=phase===0?'linear-gradient(90deg,#8b5cf6,#c4b5fd)':phase===1?'linear-gradient(90deg,#0284c7,#7dd3fc)':'linear-gradient(90deg,#eab308,#fef08a)';
  if(shieldBar)shieldBar.style.background=phase===0?'linear-gradient(90deg,#c4b5fd,#8b5cf6)':phase===1?'linear-gradient(90deg,#7dd3fc,#0284c7)':'linear-gradient(90deg,#fef08a,#eab308)';
}
function frThunderStartTransition(b,nextPhase){
  b.hp=0;updateBossHp();b._frEvents=[];b._frWarnings=[];b._frDash=null;b._frTether=null;b._frBusyUntil=Infinity;
  eBullets=[];hazards=hazards.filter(function(h){return h&&h._frThunderField;});
  b._frTransition={from:b._frThunderPhase,to:nextPhase,start:b.timer,duration:150};
  const line=nextPhase===1?b._frRootDef.phase12:b._frRootDef.phase23;
  frBossSpeak(b,line,'#fde047');
}
function frThunderUpdateTransition(b){
  const tr=b._frTransition;if(!tr)return false;
  if(b.timer-tr.start>=tr.duration){b._frTransition=null;frThunderApplyPhase(b,tr.to,true);addText('力量完全恢復',b.x,b.y-105,'#86efac',15,-.35);}
  return true;
}
function frThunderTakeDamage(b,amount,isQa){
  if(b._frTransition||b._defeated)return;
  if(!b._frFullEncounter||b._frThunderPhase>=2){
    const wasDefeated=b._defeated,ratioBefore=b.hp/Math.max(1,b.maxHp);
    frBaseBoss.prototype.takeDamage.call(b,amount,isQa);
    if(!b._frFullEncounter&&!wasDefeated&&b._defeated&&!b._frStage11DefeatSpoken)b._frStage11DefeatSpoken=true;
    if(b._frFullEncounter&&b._frThunderPhase>=2&&!b._frNearDefeatSpoken&&ratioBefore>.2&&b.hp/Math.max(1,b.maxHp)<=.2){b._frNearDefeatSpoken=true;frBossSpeak(b,b._frRootDef.nearDefeat,'#fde047');}
    return;
  }
  let dealt=Math.max(1,Number(amount)||1);
  if(typeof frDamageMultiplier==='function')dealt*=frDamageMultiplier(b);
  const wasAlive=b.hp>0;
  if(b._frArmorCounterUntil>b.timer){dealt*=.62;if(!b._frCounterPulseAt||b.timer-b._frCounterPulseAt>16){b._frCounterPulseAt=b.timer;frBossRadial(b,8,4,Math.max(7,Math.round(8*frBalanceCurve(stage).bossDamage*frBossDamageScale(stage))),b.color,b.timer*.1);}}
  if(b.shield>0&&!b.shieldBroken){
    const shieldDamage=isQa?Math.floor(b.maxShield*.3):Math.max(1,Math.floor(dealt*.5));
    b.shield=Math.max(0,b.shield-shieldDamage);addText('🛡️'+shieldDamage,b.x,b.y-72,'#7dd3fc',13,-.45);
    if(!isQa){const chip=Math.max(1,Math.floor(dealt*.3));b.hp=Math.max(1,b.hp-chip);addText('-'+chip,b.x,b.y-54,'#fde68a',12,-.4);updateBossHp();}
    if(b.shield<=0){b.shieldBroken=true;b.shieldResetTimer=10*60;addText('護盾破裂',b.x,b.y-90,'#f87171',14,-.45);}
    updateBossShield();if(typeof frFormRegisterHit==='function')frFormRegisterHit(b,wasAlive);return;
  }
  b.hp=Math.max(0,b.hp-dealt);addText('-'+Math.round(dealt),b.x,b.y-70,'#fde68a',13,-.45);updateBossHp();
  if(typeof frFormRegisterHit==='function')frFormRegisterHit(b,wasAlive);
  if(b.hp<=0)frThunderStartTransition(b,b._frThunderPhase+1);
}
function frThunderStage11ClosePressure(b){
  if(!b._frStage11Enhanced||b._defeated||b._frTransition)return;
  if(b.timer<(b._frStage11CloseReadyAt||0)){b._frStage11CloseFrames=0;return;}
  const distance=Math.hypot(player.x-b.x,player.y-b.y);
  if(distance>FR_STAGE11_THUNDER.closeRadius){b._frStage11CloseFrames=0;return;}
  b._frStage11CloseFrames=(b._frStage11CloseFrames||0)+1;
  if(b._frStage11CloseFrames<FR_STAGE11_THUNDER.closeHold)return;
  b._frStage11CloseFrames=0;b._frStage11CloseReadyAt=b.timer+FR_STAGE11_THUNDER.closeCooldown;b._frDash=null;
  b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+FR_STAGE11_THUNDER.closeWarn+18);
  const pulseX=b.x,pulseY=b.y,pulseDamage=Math.round(10*frBalanceCurve(stage).bossDamage*frBossDamageScale(stage)*FR_STAGE11_THUNDER.damage);
  frBossWarning(b,'circle',FR_STAGE11_THUNDER.closeWarn,{x:pulseX,y:pulseY,r:FR_STAGE11_THUNDER.closeRadius,color:'#e9d5ff'});
  addText('⚠ 雷衣反衝',b.x,b.y-102,'#e9d5ff',14,-.35);
  frBossLater(b,FR_STAGE11_THUNDER.closeWarn,function(){
    if(b._defeated)return;
    const dx=player.x-pulseX,dy=player.y-pulseY,dist=Math.hypot(dx,dy)||1;
    burst(pulseX,pulseY,'#c4b5fd',22);
    if(dist>FR_STAGE11_THUNDER.closeRadius+10)return;
    hurtPlayer(pulseDamage);
    const push=72;player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+dx/dist*push));player.y=Math.max(player.radius,Math.min(CH-player.radius,player.y+dy/dist*push));
  });
}
const FR_BOSS_HUD_SAFE_GAP=14;
function frBossVisualTopExtent(b){
  return b&&b._frFinal?96:110;
}
function frBossHudBottomY(){
  const hud=document.getElementById('bossHud'),gc=document.getElementById('gc');
  if(!hud||!gc||!hud.getBoundingClientRect||!gc.getBoundingClientRect)return 136;
  const hr=hud.getBoundingClientRect(),gr=gc.getBoundingClientRect();
  const scaleY=CH/Math.max(1,gr.height);
  return Math.max(0,(hr.bottom-gr.top)*scaleY);
}
function frBossSafeCenterY(b){
  const minY=frBossHudBottomY()+FR_BOSS_HUD_SAFE_GAP+frBossVisualTopExtent(b);
  return Math.min(CH*.46,Math.max(155,minY));
}
function frBossEnforceTopSafeZone(b){
  const minY=frBossSafeCenterY(b);
  b.targetY=Math.max(Number(b.targetY)||0,minY);
  if(b.y<minY){
    b.y=minY;
    if(b._frDash&&b._frDash.vy<0)b._frDash=null;
  }
  return minY;
}
function frBossInit(b){
  if(b._frReady)return;
  b._frReady=true;b._frFinal=currentBgIdx===10;
  const pool=FR_BOSS_BY_MAP[currentBgIdx]||FR_BOSS_BY_MAP[0];
  b._frDef=pool[Math.floor(Math.random()*pool.length)];b.name=b._frDef.name;b.color=b._frDef.color;
  b.targetY=frBossSafeCenterY(b);b._frEntered=false;
  b._frEvents=[];b._frWarnings=[];b._frBusyUntil=0;b._frAttackCd=95;b._frAttackCount=0;b._frSkillCastCount=0;b._frMasterSkillUnlocked=false;b._frSignatureReady=false;b._frSkillBag=frBossShuffle(b._frDef.skills);b._frAnimStart=0;b._frAnimUntil=0;b._frDash=null;b._frTether=null;
  b._frSkillLabels=FR_BOSS_SKILL_LABELS;b._frNormalLabel=FR_BOSS_NORMAL_LABELS[b._frDef.normal]||'普通攻擊';
  if(b._frFinal){
    b._frStage11Enhanced=Number(stage)===11;
    b._frFullEncounter=Number(stage)>=FR_BALANCE.progression.maxStage;
    b._frRootDef=b._frDef;frThunderApplyPhase(b,0,false);
    if(b._frStage11Enhanced){
      const firstFormKit=(b._frRootDef.phaseKits&&b._frRootDef.phaseKits[0])||{};
      b._frDef=Object.assign({},b._frRootDef,firstFormKit);
      b._frSkillBag=frBossShuffle((firstFormKit.skills||b._frRootDef.skills||[]).slice());
      b._frNormalLabel=FR_BOSS_NORMAL_LABELS[firstFormKit.normal||b._frRootDef.normal]||'隱雷三閃';
      b._frStage11SkillKitApplied=true;
      b.maxHp=Math.round(b.maxHp*FR_STAGE11_THUNDER.hp);b.hp=b.maxHp;
      b.maxShield=Math.round(b.maxShield*FR_STAGE11_THUNDER.shield);b.shield=b.maxShield;
      b._frAttackCd=Math.floor(88*FR_STAGE11_THUNDER.normalCd);b._frStage11Rage=false;b._frStage11CloseFrames=0;b._frStage11CloseReadyAt=0;
    }
    const shieldTrack=document.getElementById('bossShieldTrack'),shieldLabel=document.getElementById('bossShieldLbl');if(shieldTrack)shieldTrack.style.display='block';if(shieldLabel)shieldLabel.style.display='block';
  }
  b._frEntryLine=b._frFinal&&b._frFullEncounter?(b._frDef.intro22||b._frDef.intro):b._frDef.intro;
  if(window.frBossQaMode){b.maxHp*=10;b.hp=b.maxHp;b.maxShield*=4;b.shield=b.maxShield;}
  const hud=document.getElementById('bossHud'),name=document.getElementById('bossName');if(hud)hud.style.display='block';if(name)name.textContent='👿 '+b.name;
  hazards=[];eBullets=[];updateBossHp();updateBossShield();
}
function frBossUpdateCustom(b){
  b.timer++;
  if(b._frFinal&&frThunderUpdateTransition(b))return;
  if(b._frStage11Enhanced&&!b._frStage11Rage&&b.hp<=b.maxHp*.5){b._frStage11Rage=true;addText('雷幕躁動',b.x,b.y-105,'#c4b5fd',16,-.35);burst(b.x,b.y,'#a78bfa',28);}
  const frFormSlow=typeof frCurrentSlowFactor==='function'?frCurrentSlowFactor(b,performance.now()):(b._frSlowUntil&&performance.now()<b._frSlowUntil?Math.max(.08,Math.min(1,b._frSlowFactor||.45)):1);
  const safeY=frBossSafeCenterY(b);b.targetY=Math.max(b.targetY,safeY);
  if(!b._frEntered){
    if(b.y<safeY){b.y=Math.min(safeY,b.y+2.5);return;}
    b._frEntered=true;
    if(!b._frIntroSpoken&&b._frEntryLine){b._frIntroSpoken=true;frBossSpeak(b,b._frEntryLine,b.color);}
  }
  if(b.frozenTimer>0)b.frozenTimer--;
  if(b.shieldBroken){b.shieldResetTimer--;updateBossShield();if(b.shieldResetTimer<=0){b.shield=b.maxShield;b.shieldBroken=false;addText('🛡️護盾重置！',b.x,b.y-50,'#60a5fa');updateBossShield();}}
  const highStage=Number(stage)>=12&&Number(stage)<=21,hpRatio=b.hp/Math.max(1,b.maxHp),tempo=frBossTempo(stage),warFallen=typeof frBossFallenCount==='function'?frBossFallenCount():0;
  if(warFallen>(b._frWarSpiritShown||0)){b._frWarSpiritShown=warFallen;addText('BOSS 戰意 '+warFallen+' 層',b.x,b.y-112,'#fb7185',15,-.4);burst(b.x,b.y,'#fb7185',18);}
  if(highStage&&b._frDef.masterSkill&&!b._frMasterSkillUnlocked&&hpRatio<=.6){b._frMasterSkillUnlocked=true;b._frSkillBag=frBossShuffle(frBossHighStageSkillPool(b));addText('專屬招式解放',b.x,b.y-104,'#fef08a',14,-.4);}
  if(highStage&&b._frDef.masterSkill&&!b._frSignatureReady&&!b._frSignatureUsed&&hpRatio<=.3){b._frSignatureReady=true;b._frAttackCd=Math.min(b._frAttackCd,20);addText('瀕死猛攻',b.x,b.y-104,'#fb7185',15,-.4);}
  for(let i=b._frEvents.length-1;i>=0;i--){if(b.timer>=b._frEvents[i].at){const ev=b._frEvents.splice(i,1)[0];ev.fn();}}
  b._frWarnings=b._frWarnings.filter(function(w){return b.timer<=w.end;});
  if(b._frDash){b.x+=b._frDash.vx*frFormSlow;b.y+=b._frDash.vy*frFormSlow;b._frDash.left--;if(b._frDash.trail&&b.timer%7===0)frBossHazard({kind:'circle',x:b.x,y:b.y,r:26,color:b.color,damage:Math.max(8,b._frDash.damage*.55),status:b._frDash.status||null,delay:18,duration:55});if(Math.hypot(player.x-b.x,player.y-b.y)<b.r+player.radius&&player.invTimer<=0){hurtPlayer(b._frDash.damage);if(b._frDash.status)frBossApplyStatus(b._frDash.status);}if(b._frDash.left<=0||b.x<45||b.x>CW-45||b.y<safeY||b.y>CH*.62)b._frDash=null;}
  else{
    const moveRage=highStage&&hpRatio<=.3?1.15:1;
    if(b.timer%tempo.moveRetarget===0)b.targetX=70+Math.random()*(CW-140);
    b.x+=(b.targetX-b.x)*tempo.moveRate*moveRage*frFormSlow;b.y+=(b.targetY-b.y)*tempo.moveRate*moveRage*frFormSlow;
  }
  frBossEnforceTopSafeZone(b);
  if(b._frTether){const dist=Math.hypot(player.x-b.x,player.y-b.y);if(b.timer>b._frTether.until||dist>230)b._frTether=null;else if(b.timer-b._frTether.last>42){b._frTether.last=b.timer;if(player.invTimer<=0){hurtPlayer(b._frTether.damage);b.hp=Math.min(b.maxHp,b.hp+b._frTether.damage*1.5);updateBossHp();}}}
  frThunderStage11ClosePressure(b);
  const expertStage=Number(stage)>=11,masterStage=Number(stage)>=16,warSpeed=typeof frBossWarSpeedScale==='function'?frBossWarSpeedScale(stage):1;
  if(expertStage){const castRate=b.timer<b._frBusyUntil?tempo.busyRate:1;b._frAttackCd-=frFormSlow*castRate*warSpeed;}
  if(b.timer<b._frBusyUntil)return;
  const rage=b._frFinal?[1,.86,.7][b._frThunderPhase||0]:(b.hp<b.maxHp*.5?.8:1)*(highStage&&hpRatio<=.3?.88:1);
  if(!expertStage)b._frAttackCd-=frFormSlow;
  if(b._frAttackCd<=0){
    const forceSignature=!!(b._frSignatureReady&&b._frDef.masterSkill);
    const enragedSkill=highStage&&hpRatio<=.3;
    const useSkill=forceSignature||enragedSkill||(masterStage?b._frAttackCount%2===1:b._frAttackCount%3===2);b._frAttackCount++;
    if(useSkill){
      let skill;
      if(b._frSignatureReady&&b._frDef.masterSkill){skill=b._frDef.masterSkill;b._frSignatureReady=false;b._frSignatureUsed=true;}
      else{if(!b._frSkillBag.length)b._frSkillBag=frBossShuffle(frBossHighStageSkillPool(b));skill=b._frSkillBag.shift();}
      frBossCast(b,skill,true);b._frSkillCastCount=(b._frSkillCastCount||0)+1;
      const followUpEvery=highStage&&Number(stage)<=15?1:2;
      if(expertStage&&!b._frFinal&&b._frSkillCastCount%followUpEvery===0)frBossLater(b,42,function(){if(b._defeated)return;addText(masterStage?'菁英追擊':'強化追擊',b.x,b.y-92,'#fef08a',13,-.4);frBossCast(b,b._frDef.normal,false);});
      if(highStage)b.targetX=b.x<CW/2?CW*(.62+Math.random()*.2):CW*(.18+Math.random()*.2);
      b._frAttackCd=Math.floor(tempo.skillCd*rage*(b._frStage11Enhanced?FR_STAGE11_THUNDER.skillCd:1));
    }
    else{frBossCast(b,b._frDef.normal,false);b._frAttackCd=Math.floor(tempo.normalCd*rage*(b._frStage11Enhanced?FR_STAGE11_THUNDER.normalCd:1));}
  }
}
function frBossDrawWarning(b,w){
  const remain=Math.max(0,(w.end-b.timer)/Math.max(1,w.end-w.start)),pulse=.35+.3*Math.sin(b.timer*.55);
  ctx.save();ctx.globalAlpha=.35+pulse*(1-remain);ctx.strokeStyle=w.color||b.color;ctx.fillStyle=(w.color||b.color)+'33';ctx.lineWidth=3;ctx.setLineDash([10,7]);
  if(w.kind==='line'){ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.lineTo(w.x+Math.cos(w.angle)*Math.max(CW,CH)*1.5,w.y+Math.sin(w.angle)*Math.max(CW,CH)*1.5);ctx.stroke();}
  else if(w.kind==='cone'){ctx.beginPath();ctx.moveTo(w.x,w.y);ctx.arc(w.x,w.y,220,w.angle-(w.spread||.5),w.angle+(w.spread||.5));ctx.closePath();ctx.fill();ctx.stroke();}
  else if(w.kind==='circle'){ctx.beginPath();ctx.arc(w.x,w.y,w.r||82,0,Math.PI*2);ctx.fill();ctx.stroke();}
  else if(w.kind==='rect'){ctx.fillRect(w.x-w.w/2,w.y-w.h/2,w.w,w.h);ctx.strokeRect(w.x-w.w/2,w.y-w.h/2,w.w,w.h);}
  ctx.setLineDash([]);ctx.restore();
}
function frBossDrawCustom(b){
  b._frWarnings.forEach(function(w){frBossDrawWarning(b,w);});
  if(b._frTether){ctx.save();ctx.strokeStyle='#f43f5e';ctx.lineWidth=5;ctx.setLineDash([9,5]);ctx.beginPath();ctx.moveTo(b.x,b.y);ctx.lineTo(player.x,player.y);ctx.stroke();ctx.restore();}
  ctx.save();ctx.translate(b.x,b.y);
  if(!b.shieldBroken&&b.shield>0){const sp=b.shield/b.maxShield;ctx.globalAlpha=.12+sp*.12;ctx.strokeStyle='#93c5fd';ctx.lineWidth=4+sp*3;ctx.beginPath();ctx.arc(0,0,b.r+18+Math.sin(Date.now()*.006)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  let img=frBossImage(b._frDef),frame=0,sourceW=512,sourceH=768,drawX=-75,drawY=-110,drawW=150,drawH=225;
  if(b._frFinal){sourceW=384;sourceH=384;drawX=-96;drawY=-96;drawW=192;drawH=192;if(b._frTransition){img=frThunderImage(b._frTransition.from===0?'transition12':'transition23');frame=Math.min(5,Math.floor((b.timer-b._frTransition.start)/Math.max(1,b._frTransition.duration/6)));}else{img=frThunderImage('phase'+((b._frThunderPhase||0)+1));frame=Math.floor(b.timer/7)%4;}}
  else frame=b.timer<b._frAnimUntil?Math.min(3,Math.floor((b.timer-b._frAnimStart)/6)):0;
  if(img&&img.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(img,frame*sourceW,0,sourceW,sourceH,drawX,drawY,drawW,drawH);}
  else{ctx.shadowBlur=14;ctx.shadowColor=b.color;ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

const frBaseBoss=Boss;
Boss=class extends frBaseBoss{
  constructor(stg){super(stg);frBossInit(this);}
  update(){frBossInit(this);frBossUpdateCustom(this);}
  draw(){frBossInit(this);frBossDrawCustom(this);}
  takeDamage(amount,isQa){frBossInit(this);if(this._frFinal)return frThunderTakeDamage(this,amount,isQa);return super.takeDamage(amount,isQa);}
};

const frBossBaseTickArena=tickArena;
tickArena=function(){
  if(currentBgIdx===10){frThunderArenaTick();for(let i=hazards.length-1;i>=0;i--){hazards[i].update();if(hazards[i].dead)hazards.splice(i,1);}return;}
  if(boss&&!boss._defeated&&currentBgIdx<10){for(let i=hazards.length-1;i>=0;i--){hazards[i].update();if(hazards[i].dead)hazards.splice(i,1);}return;}
  frBossBaseTickArena();
};

const frThunderBaseJoystickInput=getJoystickInput;
getJoystickInput=function(){if(frPlayerParalyzed())return {dx:0,dy:0};return frThunderBaseJoystickInput();};
const frThunderBaseAutoFire=autoFire;
autoFire=function(){if(frPlayerParalyzed())return;return frThunderBaseAutoFire();};
const frThunderBaseToggleWeapon=toggleWeapon;
toggleWeapon=function(){if(frPlayerParalyzed())return;return frThunderBaseToggleWeapon();};
const frThunderBaseDodge=doDodge;
doDodge=function(){if(frPlayerParalyzed())return;return frThunderBaseDodge();};
const frThunderBaseSkill1=useSkill1;
useSkill1=function(){if(frPlayerParalyzed())return;return frThunderBaseSkill1();};
const frThunderBaseSkill2=useSkill2;
useSkill2=function(){if(frPlayerParalyzed())return;return frThunderBaseSkill2();};
const frThunderBaseSwitchChar=switchToChar;
switchToChar=function(index){if(frPlayerParalyzed())return;return frThunderBaseSwitchChar(index);};
const frThunderBaseBuildStage=buildStage;
buildStage=function(){window.frParalyzedUntil=0;frThunderArenaTimer=70;const result=frThunderBaseBuildStage.apply(this,arguments);frThunderEnsureChaserOrbs();return result;};

window.frStage11LightningOrbs=function(){return hazards.filter(function(h){return h&&h._frThunderChaser&&!h.dead;});};

window.addEventListener('keydown',function(event){
  let localTest=false;
  try{localTest=SAVE&&SAVE.isSuperAdmin&&/^(127\.0\.0\.1|localhost)$/.test(window.parent.location.hostname);}catch(_){localTest=false;}
  if(!localTest||event.code!=='KeyB'||!gameRunning||bossSpawned)return;
  window.frBossQaMode=true;
  spawnQueue=[];enemies=[];hazards=[];eBullets=[];rivalFightActive=false;rivalEnemies=[];rivalTriggeredThisStage=true;rivalCleared=true;bossIntroTimer=1;mapCameraTargetY=0;
  player.hp=player.maxHp;player.invTimer=45*60;window.frInvincibleUntil=performance.now()+45000;if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;updateHUD();
  addText('BOSS 測試',CW/2,CH*.45,'#fbbf24',18);
});
`;
})();

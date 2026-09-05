(function () {
  const bossCatalog = [
    { map:0, id:'tiramisu-jazz', name:'提拉米蘇爵士', intro:'入場券？就用你的勇氣來付吧。', death:'呵……今晚的爵士曲，該落幕了。', sprite:'boss-tiramisu-jazz.png', color:'#a16207', normal:'cocoaFan', skills:['coffeePools','cookieRain','creamWalls','jazzSyncopation','mochaSpotlight'], masterSkill:'espressoSweep' },
    { map:0, id:'jelly-king', name:'史萊姆果凍王', intro:'在我的甜蜜王國，連腳步都會反彈！', death:'王冠碎了……甜蜜王國也融化了……', sprite:'boss-jelly-king.png', color:'#ec4899', normal:'jellyBounce', skills:['jellyClones','jellyRings','jellyRain','jellyWall','crownSlam'], masterSkill:'crownBounce' },
    { map:1, id:'niu-mowang', name:'牛魔王', intro:'站穩了！本王可不會替你讓路！', death:'好力道……本王認輸！', sprite:'boss-niu-mowang.png', color:'#dc2626', normal:'hornFan', skills:['doubleCharge','shockRings','cleaverLanes','returningCharge','cleaverCollapse'], masterSkill:'hornQuake' },
    { map:1, id:'yang-mowang', name:'羊魔王', intro:'別被柔軟騙了，羊角可不懂手下留情。', death:'原來真正柔中帶剛的……是你。', sprite:'boss-yang-mowang.png', color:'#d8b4fe', normal:'woolSplit', skills:['sheepLanes','woolSpiral','slowCharge','hornCyclone','woolCloudSiege'], masterSkill:'woolPrison' },
    { map:2, id:'mala-vampire', name:'麻辣湯吸血鬼', intro:'讓我嚐嚐，你的熱血夠不夠辣。', death:'這股辣……竟燒盡了我的長夜……', sprite:'boss-mala-vampire.png', color:'#e11d48', normal:'chiliCurve', skills:['drainTether','chiliRain','bloodDash','bloodBatHunt','bloodMoonBroth'], masterSkill:'boilingBloodHunt' },
    { map:2, id:'white-soup-princess', name:'白雪湯雪姬', intro:'一冷一熱，你能撐過幾回？', death:'冰雪融了……這鍋湯，交給你了……', sprite:'boss-white-soup-princess.png', color:'#e0f2fe', normal:'brothTriple', skills:['fogAim','iceFlower','hotCold','frostBrothPaths','frostfireTwins'], masterSkill:'frostfireCorridor' },
    { map:3, id:'bitter-melon-witch', name:'苦瓜巫婆', intro:'吞下這份苦，才有資格談勝利。', death:'苦盡之後……原來真有回甘……', sprite:'boss-bitter-melon-witch.png', color:'#65a30d', normal:'crossCrescent', skills:['poisonSweep','seedMines','vineCage','seedlingPursuit','thousandVines'], masterSkill:'bitterVineChase' },
    { map:3, id:'halloween-pumpkin-king', name:'萬聖南瓜王', intro:'猜猜看，下一顆南瓜會落在哪？', death:'燈火熄滅……萬聖夜結束了……', sprite:'boss-halloween-pumpkin-king.png', color:'#f97316', normal:'leadBurst', skills:['pumpkinRoll','lockBeam','pumpkinMeteors','lanternMemory','pumpkinTrain'], masterSkill:'pumpkinChainBurst' },
    { map:4, id:'karaage-superhero', name:'唐揚雞超人', intro:'正義要趁熱，壞蛋也要炸得酥脆！', death:'正義……今天站在你那邊。', sprite:'boss-karaage-superhero.png', color:'#f59e0b', normal:'chickenShotgun', skills:['bodySlam','oilRain','tripleDash','crispyFlyingKick','oilChainBlast'], masterSkill:'fryerShockDrop' },
    { map:4, id:'eel-dragon', name:'星鰻龍', intro:'踏錯一步，就會被醬香漩渦吞沒。', death:'醬香散了……好一場漂亮的翻身。', sprite:'boss-eel-dragon.png', color:'#92400e', normal:'sauceCurve', skills:['pathDash','conveyor','reverseSpiral','eelShadowSwim','kabayakiGrid'], masterSkill:'sauceRushTrail' },
    { map:5, id:'fried-rice-beast', name:'炒飯獸', intro:'鍋氣已起，你就是今天最後一味！', death:'你的鍋氣……比我更旺……', sprite:'boss-fried-rice-beast.png', color:'#facc15', normal:'riceFan', skills:['riceTornado','eggOrbit','wokShock','tripleWokFlip','wokVolcano'], masterSkill:'wokFlipBurst' },
    { map:5, id:'intestine-sandworm', name:'肥腸沙蟲', intro:'地面在動？不，是我來了。', death:'地面平靜了……但飢餓不會消失……', sprite:'boss-intestine-sandworm.png', color:'#fb7185', normal:'ringShot', skills:['sandTrail','lidCross','closingLoops','undergroundHunt','gutRingDevour'], masterSkill:'burrowAmbush' },
    { map:6, id:'durian-icepop-warrior', name:'榴槤冰棒戰士', intro:'聞到只是警告，凍住才是處刑。', death:'冰殼碎了……氣味仍會留下……', sprite:'boss-durian-icepop-warrior.png', color:'#84cc16', normal:'iceFan', skills:['iceSweep','iceColumns','avalanche','durianIceLances','frostOrbHunt'], masterSkill:'frostThornWheel' },
    { map:6, id:'mango-ice-monster', name:'芒果冰怪', intro:'甜得越迷人，雪崩就越無情。', death:'雪崩停了……甜味也化了……', sprite:'boss-mango-ice-monster.png', color:'#fbbf24', normal:'turnTwin', skills:['syrupPools','snowcone','sideAvalanche','mangoSnowWheel','smoothieCollapse'], masterSkill:'syrupAvalanche' },
    { map:7, id:'fries-swordsman', name:'薯條劍宗', intro:'刀落如雨，接得住便算你有本事。', death:'此刀已鈍……你勝得漂亮。', sprite:'boss-fries-swordsman.png', color:'#f59e0b', normal:'crossSlash', skills:['fryColumns','lineSlashes','orbitFries','friesIaido','thousandFries'], masterSkill:'swordNet' },
    { map:7, id:'pasta-mummy', name:'義大利麵木乃伊', intro:'麵線纏身之時，掙扎只會打成死結。', death:'纏了千年的麵線……終於斷了……', sprite:'boss-pasta-mummy.png', color:'#ef4444', normal:'noodleCurve', skills:['tomatoSpiral','contractingCircles','noodleGrid','noodleBindSweep','tomatoCoffin'], masterSkill:'noodleBindGrid' },
    { map:8, id:'pastry-soup-wizard', name:'酥皮濃湯惡巫師', intro:'酥皮一裂，濃湯將吞沒整座戰場。', death:'酥皮崩裂……我的濃湯也冷了……', sprite:'boss-pastry-soup-wizard.png', color:'#d97706', normal:'flakeCross', skills:['groundEruptions','shieldRadial','insideOutside','pastryLayerBurst','soupGeysers'], masterSkill:'pastryCollapse' },
    { map:8, id:'cream-chicken-pontiff', name:'奶油燉雞邪教宗', intro:'接受奶油的洗禮，沉入濃醇的永恆吧。', death:'洗禮結束……濃醇的神諭已散……', sprite:'boss-cream-chicken-pontiff.png', color:'#fef08a', normal:'creamSplit', skills:['chickenLegRain','creamSweep','closingWalls','holyChickenMarch','creamCrossSeal'], masterSkill:'creamBaptism' },
    { map:9, id:'octopus-warrior', name:'八爪章魚戰士', intro:'八臂皆刃，你能看住幾個方向？', death:'八臂皆敗……你看穿了所有攻勢……', sprite:'boss-octopus-warrior.png', color:'#7c3aed', normal:'inkFan', skills:['tentacleLanes','inkCloud','centerPull','inkEightThrust','deepSeaSlam'], masterSkill:'eightArmCombo' },
    { map:9, id:'heavy-armor-mech', name:'重甲機兵', intro:'裝甲鎖定。所有逃生路線，全部封閉。', death:'裝甲解除……戰鬥系統，停止……', sprite:'boss-heavy-armor-mech.png', color:'#0891b2', normal:'clawCrescent', skills:['horizontalCharges','bubbleLock','waterWalls','missileLock','railClamp'], masterSkill:'pressureCannon' },
    { map:10, id:'little-thunder-god', name:'小雷神', intro:'能走到這裡……很好。接下我這一道雷。', intro22:'你果然回來了。這一次，我不會再保留。', stage11Defeat:'你的力量，我記住了……我們還會再見。', death:'痛快……能在全力一戰後敗給你，我沒有遺憾。', phase12:'真不簡單，盡你的全力吧', phase23:'看得出你很想贏啊？不過，我也是', nearDefeat:'很好……這才是我等待已久的戰鬥！', sprite:'little-thunder-god-phase1-spritesheet.png', color:'#60a5fa', normal:'hiddenSpark', skills:['thunderMarks','cloakDash','staticCage','fiveLaserCannons'], phaseKits:[
      { name:'第一型態・雷幕披風', color:'#a78bfa', normal:'hiddenSpark', skills:['thunderMarks','cloakDash','staticCage','fiveLaserCannons'] },
      { name:'第二型態・雷鎧真身', color:'#38bdf8', normal:'vajraFan', skills:['heavenLances','warDrumRings','armorCounter','sixWayLances','orbitLances','lanceRush','lanceSweep','lanceRainArray','lanceBoundary','tripleLanceThrust'] },
      { name:'第三型態・閃電化身', color:'#facc15', normal:'livingLightning', skills:['ninefoldJudgment','thunderDomain','finalThunderstorm','crossThunderPillars','delayedThunderOrbs','thunderClawSlam','thunderClawHunt','thunderPalmBarrier','palmThunderCannon','thunderSealHeal','thunderInfusion','thunderPalmClap'] }
    ] }
  ];

  window.FOOD_RESEARCH_BOSSES = bossCatalog;
  window.FOOD_RESEARCH_BOSS_PATCH = String.raw`
const FR_BOSS_CATALOG = ${JSON.stringify(bossCatalog)};
const FR_BOSS_BY_MAP = FR_BOSS_CATALOG.reduce(function(out,item){(out[item.map]||(out[item.map]=[])).push(item);return out;},{});
const FR_STAGE11_THUNDER={hp:1.28,shield:1.20,damage:1.12,normalCd:.84,skillCd:.86,closeRadius:90,closeHold:60,closeWarn:40,closeCooldown:330};
const FR_BOSS_IMAGES = {};
const FR_THUNDER_IMAGES={};
const FR_THUNDER_RELIC_IMAGES={};
const FR_THUNDER_SOURCES={
  phase1:'little-thunder-god-phase1-spritesheet-v2.png',
  phase2:'little-thunder-god-phase2-spritesheet.png',
  phase3:'little-thunder-god-phase3-spritesheet.png',
  transition12:'little-thunder-god-transition-1-to-2-spritesheet.png',
  transition23:'little-thunder-god-transition-2-to-3-spritesheet.png'
};
const FR_THUNDER_RELIC_SOURCES={lance:'little-thunder-god-lance.png',shield:'little-thunder-god-shield.png',leftHand:'little-thunder-god-left-hand.png',rightHand:'little-thunder-god-right-hand.png'};
function frLoadBossImage(cache,key,src,version){
  if(cache[key])return cache[key];
  const img=new Image();img.decoding='async';img.src='assets/food-research/bosses/'+src+version;cache[key]=img;return img;
}
function frBossImage(item){return item?frLoadBossImage(FR_BOSS_IMAGES,item.id,item.sprite,'?v=1'):null;}
function frThunderImage(key){return FR_THUNDER_SOURCES[key]?frLoadBossImage(FR_THUNDER_IMAGES,key,FR_THUNDER_SOURCES[key],'?v=3'):null;}
function frThunderRelicImage(key){return FR_THUNDER_RELIC_SOURCES[key]?frLoadBossImage(FR_THUNDER_RELIC_IMAGES,key,FR_THUNDER_RELIC_SOURCES[key],'?v=1'):null;}
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
function frThunderSpawnRelics(b){
  if(!b||!b._frFullEncounter||b._frThunderPhase!==1){if(b)b._frRelics=[];return;}
  b._frRelics=[
    {kind:'lance',hp:3000,maxHp:3000,x:b.x-76,y:b.y-4,r:18,nextAction:b.timer+300,mode:'idle',dead:false},
    {kind:'shield',hp:10000,maxHp:10000,x:b.x+76,y:b.y,r:77.5,nextAction:b.timer+240,activeUntil:0,dead:false}
  ];
  frThunderRelicImage('lance');frThunderRelicImage('shield');
}
function frThunderSpawnHands(b){
  if(!b||!b._frFullEncounter||b._frThunderPhase!==2){if(b)b._frHands=[];return;}
  b._frHands=[
    {kind:'leftHand',hp:8000,maxHp:8000,x:b.x-105,y:b.y+10,r:43,mode:'idle',dead:false,vx:0,vy:0},
    {kind:'rightHand',hp:8000,maxHp:8000,x:b.x+105,y:b.y+10,r:43,mode:'idle',dead:false,vx:0,vy:0}
  ];
  frThunderRelicImage('leftHand');frThunderRelicImage('rightHand');
}
function frThunderHand(b,kind){return b&&Array.isArray(b._frHands)?b._frHands.find(function(hand){return hand.kind===kind&&!hand.dead;}):null;}
function frThunderHandHome(b,hand){return{x:b.x+(hand.kind==='leftHand'?-105:105),y:b.y+10};}
function frThunderInterruptHand(b,hand){if(!hand||['heal','infuse'].indexOf(hand.mode)<0)return;hand.mode='idle';hand.channelEnd=0;addText('引導中斷',hand.x,hand.y-48,'#fef08a',13,-.45);burst(hand.x,hand.y,'#fde047',14);}
function frThunderUpdateHands(b){
  if(!b||b._frThunderPhase!==2||!Array.isArray(b._frHands))return;
  b._frHands.forEach(function(hand){if(hand.dead)return;const home=frThunderHandHome(b,hand);
    hand.r=hand.mode==='barrier'?65:43;
    if(hand.mode==='hunt'){
      if(b.timer<(hand.huntStart||0)){hand.x+=(home.x-hand.x)*.3;hand.y+=(home.y-hand.y)*.3;return;}
      const dx=player.x-hand.x,dy=player.y-hand.y,dist=Math.hypot(dx,dy)||1;hand.vx=(hand.vx||0)*.91+dx/dist*.28;hand.vy=(hand.vy||0)*.91+dy/dist*.28;const speed=Math.hypot(hand.vx,hand.vy)||1,max=3.15;if(speed>max){hand.vx=hand.vx/speed*max;hand.vy=hand.vy/speed*max;}hand.x+=hand.vx;hand.y+=hand.vy;
      if(!hand.caught&&dist<hand.r+player.radius){hand.caught=true;hurtPlayer(Math.round(16*frBalanceCurve(stage).bossDamage*frBossDamageScale(stage)));frBossApplyStatus({kind:'paralyze',duration:650});const push=player.x<CW/2?-95:95;player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+push));burst(player.x,player.y,'#fde047',18);}
      if(b.timer>=hand.actionEnd){hand.mode='idle';hand.vx=0;hand.vy=0;}
    }else if(hand.mode==='barrier'){
      const a=Math.atan2(player.y-b.y,player.x-b.x),tx=b.x+Math.cos(a)*72,ty=b.y+Math.sin(a)*72;hand.x+=(tx-hand.x)*.3;hand.y+=(ty-hand.y)*.3;if(Math.hypot(player.x-hand.x,player.y-hand.y)<hand.r+player.radius){const dx=player.x-hand.x,dy=player.y-hand.y,d=Math.hypot(dx,dy)||1;player.x+=dx/d*8;player.y+=dy/d*8;}if(b.timer>=hand.actionEnd)hand.mode='idle';
    }else if(hand.mode==='heal'){
      hand.x+=(b.x-hand.x)*.2;hand.y+=(b.y+48-hand.y)*.2;if(b.timer>=(hand.nextPulse||0)){hand.nextPulse=b.timer+60;b.shield=Math.min(b.maxShield,b.shield+b.maxShield*.08);b.shieldBroken=false;updateBossShield();addText('護盾恢復',b.x,b.y-92,'#86efac',12,-.4);}if(b.timer>=hand.channelEnd)hand.mode='idle';
    }else if(hand.mode==='infuse'){
      hand.x+=(b.x-hand.x)*.22;hand.y+=(b.y+48-hand.y)*.22;if(b.timer>=hand.channelEnd){hand.mode='idle';b._frHandHasteUntil=b.timer+360;addText('雷力灌注',b.x,b.y-105,'#fde047',15,-.4);burst(b.x,b.y,'#fde047',24);}
    }else if(hand.mode==='clap'){
      const coreX=b._frClapCoreX||b.x,coreY=b._frClapCoreY||b.y+100,fired=b.timer>=(b._frClapFireAt||Infinity),tx=coreX+(hand.kind==='leftHand'?-42:42),ty=coreY+(hand.kind==='leftHand'?-36:36)+(fired?10:0);hand.x+=(tx-hand.x)*.22;hand.y+=(ty-hand.y)*.22;if(b.timer>=hand.actionEnd)hand.mode='idle';
    }else if(hand.mode==='slam'){
      if(b.timer>=hand.actionEnd)hand.mode='idle';
    }else if(hand.mode==='cannon'){
      hand.x+=(home.x-hand.x)*.16;hand.y+=(home.y-hand.y)*.16;if(b.timer>=hand.actionEnd)hand.mode='idle';
    }else{hand.x+=(home.x-hand.x)*.16;hand.y+=(home.y-hand.y)*.16;}
  });
}
function frThunderRelicHome(b,relic){return relic.kind==='lance'?{x:b.x-76,y:b.y-4}:{x:b.x+76,y:b.y};}
function frThunderLance(b){return b&&Array.isArray(b._frRelics)?b._frRelics.find(function(relic){return relic.kind==='lance'&&!relic.dead;}):null;}
function frThunderLanceVisual(b,kind,duration,data){if(!b._frLanceVisuals)b._frLanceVisuals=[];b._frLanceVisuals.push(Object.assign({kind:kind,start:b.timer,end:b.timer+duration},data||{}));}
function frThunderExactWarning(b,kind,frames,data){b._frWarnings.push(Object.assign({kind:kind,start:b.timer,end:b.timer+frames,color:'#fde047',x:b.x,y:b.y},data||{}));}
function frThunderLanceKnockback(sx,sy,angle,width,push){const reach=Math.max(CW,CH)*1.4,dx=Math.cos(angle)*reach,dy=Math.sin(angle)*reach,len2=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((player.x-sx)*dx+(player.y-sy)*dy)/len2)),px=sx+dx*t,py=sy+dy*t;if(Math.hypot(player.x-px,player.y-py)>width/2+player.radius)return;player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+Math.cos(angle)*push));player.y=Math.max(player.radius,Math.min(CH-player.radius,player.y+Math.sin(angle)*push));}
function frThunderUpdateRelics(b){
  if(!b||!b._frFullEncounter||b._frThunderPhase!==1||!Array.isArray(b._frRelics))return;
  b._frRelics.forEach(function(relic){
    if(relic.dead)return;const home=frThunderRelicHome(b,relic);
    if(relic.kind==='lance'){
      if(relic.mode==='pinned'){
        if(relic.dead)return;
        if(b.timer>=relic.pinnedUntil){relic.mode='idle';relic.nextAction=b.timer+300;relic.x=home.x;relic.y=home.y;return;}
        if(b.timer>=(relic.nextPulse||0)){relic.nextPulse=b.timer;relic.nextPulse=b.timer+60;const pd=Math.round(13*frBalanceCurve(stage).bossDamage*frBossDamageScale(stage)),reach=Math.max(CW,CH);frBossHazard({kind:'line',x:relic.x-reach,y:relic.y,x2:relic.x+reach,y2:relic.y,w:20,color:'#fde047',damage:pd,status:{kind:'paralyze',duration:700},delay:0,duration:12});frBossHazard({kind:'line',x:relic.x,y:relic.y-reach,x2:relic.x,y2:relic.y+reach,w:20,color:'#fde047',damage:pd,status:{kind:'paralyze',duration:700},delay:0,duration:12});burst(relic.x,relic.y,'#fde047',12);}return;
      }
      if(relic.skillUntil&&b.timer<relic.skillUntil)return;
      if(relic.skillUntil&&b.timer>=relic.skillUntil){relic.skillUntil=0;relic.mode='idle';relic.x=home.x;relic.y=home.y;relic.nextAction=Math.max(relic.nextAction,b.timer+300);}
      if(relic.mode==='idle'&&b.timer>=relic.nextAction){const aim=Math.atan2(player.y-relic.y,player.x-relic.x),reach=Math.max(CW,CH)*1.35;relic.mode='windup';relic.actionStart=b.timer;relic.fromX=relic.x;relic.fromY=relic.y;relic.aimAngle=aim;relic.targetX=relic.fromX+Math.cos(aim)*reach;relic.targetY=relic.fromY+Math.sin(aim)*reach;relic.hitPlayer=false;relic.nextAction=b.timer+300;}
      if(relic.mode==='idle'){relic.x+=(home.x-relic.x)*.18;relic.y+=(home.y-relic.y)*.18;}
      else{
        const age=b.timer-relic.actionStart;
        if(age<60){relic.x=home.x+Math.sin(age*.8)*3;relic.y=home.y;}
        else if(age<82){const p=(age-60)/22;relic.x=relic.fromX+(relic.targetX-relic.fromX)*p;relic.y=relic.fromY+(relic.targetY-relic.fromY)*p;}
        else if(age<89){relic.x=relic.targetX;relic.y=relic.targetY;}
        else if(age<118){const p=(age-89)/29;relic.x=relic.targetX+(home.x-relic.targetX)*p;relic.y=relic.targetY+(home.y-relic.targetY)*p;}
        else{relic.mode='idle';relic.x=home.x;relic.y=home.y;relic.nextAction=Math.max(relic.nextAction,b.timer+182);}
        if(age>=60&&age<90&&!relic.hitPlayer&&Math.hypot(player.x-relic.x,player.y-relic.y)<player.radius+relic.r){
          relic.hitPlayer=true;const a=Math.atan2(player.y-relic.y,player.x-relic.x);hurtPlayer(Math.round(15*frBalanceCurve(stage).bossDamage*frBossDamageScale(stage)));player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+Math.cos(a)*55));player.y=Math.max(player.radius,Math.min(CH-player.radius,player.y+Math.sin(a)*55));burst(player.x,player.y,'#7dd3fc',16);
        }
      }
    }else{
      if(b.timer>=relic.nextAction){relic.activeUntil=b.timer+60;relic.nextAction=b.timer+240;}
      if(b.timer<relic.activeUntil){const a=Math.atan2(player.y-b.y,player.x-b.x);const tx=b.x+Math.cos(a)*58,ty=b.y+Math.sin(a)*58;relic.x+=(tx-relic.x)*.28;relic.y+=(ty-relic.y)*.28;}
      else{relic.x+=(home.x-relic.x)*.18;relic.y+=(home.y-relic.y)*.18;}
    }
  });
}
function frThunderHitRelic(projectile){
  if(!boss||!boss._frFinal||projectile._frRelicConsumed)return false;
  const targets=boss._frThunderPhase===1&&Array.isArray(boss._frRelics)?boss._frRelics:boss._frThunderPhase===2&&Array.isArray(boss._frHands)?boss._frHands:[];
  for(const relic of targets){
    if(relic.kind==='lance'&&relic.mode==='skill')continue;
    if(relic.dead||Math.hypot(projectile.x-relic.x,projectile.y-relic.y)>=relic.r+(projectile.r||5))continue;
    projectile._frRelicConsumed=true;const activeShield=(relic.kind==='shield'&&boss.timer<relic.activeUntil)||relic.mode==='barrier';
    relic.hp=Math.max(0,relic.hp-Math.max(1,Number(projectile.dmg)||1));burst(relic.x,relic.y,activeShield?'#fef08a':'#7dd3fc',activeShield?12:7);
    if(activeShield){const a=Math.atan2(player.y-relic.y,player.x-relic.x);frBossShot({x:relic.x,y:relic.y,color:'#fef08a'},a,5.2,Math.min(24,Math.max(8,(Number(projectile.dmg)||10)*.18)),'#fef08a',Math.min(8,projectile.r||6));}
    if(relic.hp<=0){relic.dead=true;burst(relic.x,relic.y,'#e0f2fe',28);addText(relic.kind==='lance'?'雷槍擊破':relic.kind==='shield'?'雷盾擊破':relic.kind==='leftHand'?'左雷爪擊破':'右雷掌擊破',relic.x,relic.y-36,'#e0f2fe',14,-.5);}
    projectile.x=-9999;projectile.y=-9999;return true;
  }
  return false;
}
const FR_BOSS_FX_MOBILE=!!((window.matchMedia&&window.matchMedia('(pointer:coarse)').matches)||Math.min(window.innerWidth||9999,window.innerHeight||9999)<=520);
const frBossFx=[];
const FR_BOSS_THEME_IDS=new Set(['tiramisu-jazz','jelly-king','niu-mowang','yang-mowang','mala-vampire','white-soup-princess','bitter-melon-witch','halloween-pumpkin-king','karaage-superhero','eel-dragon','fried-rice-beast','intestine-sandworm','durian-icepop-warrior','mango-ice-monster','fries-swordsman','pasta-mummy','pastry-soup-wizard','cream-chicken-pontiff','octopus-warrior','heavy-armor-mech']);
function frBossFxPush(b,kind,options){
  if(!b)return;
  const cap=FR_BOSS_FX_MOBILE?22:36;
  if(frBossFx.length>=cap)frBossFx.splice(0,frBossFx.length-cap+1);
  frBossFx.push(Object.assign({boss:b,kind:kind,start:b.timer||0,duration:45,color:b.color||'#fef08a',x:b.x,y:b.y,follow:kind!=='summon'},options||{}));
}
function frBossThemeFx(b,pattern,duration){
  const id=b&&b._frDef&&b._frDef.id;if(!FR_BOSS_THEME_IDS.has(id))return;
  frBossFxPush(b,'theme',{duration:duration||64,color:b.color,theme:id,pattern:pattern||'',follow:true});
}
function frBossDrawFx(b){
  for(let i=frBossFx.length-1;i>=0;i--){
    const f=frBossFx[i];
    if(f.boss!==b){frBossFx.splice(i,1);continue;}
    const age=(b.timer||0)-f.start;
    if(age<0)continue;
    if(age>f.duration){frBossFx.splice(i,1);continue;}
    const p=Math.max(0,Math.min(1,age/Math.max(1,f.duration))),fade=Math.sin(Math.PI*p),x=f.follow?b.x:f.x,y=f.follow?b.y:f.y,spin=(b.timer||0)*.08;
    ctx.save();ctx.translate(x,y);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=f.color;ctx.fillStyle=f.color;ctx.shadowColor=f.color;ctx.shadowBlur=FR_BOSS_FX_MOBILE?5:13;
    if(f.kind==='entry'||f.kind==='rage'){
      const radius=(f.kind==='entry'?42:34)+p*(f.kind==='entry'?118:92);ctx.globalAlpha=fade*.72;ctx.lineWidth=f.kind==='entry'?5:7;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
      ctx.globalAlpha=fade*.38;ctx.lineWidth=2;for(let k=0;k<(FR_BOSS_FX_MOBILE?6:10);k++){const a=spin+k*Math.PI*2/(FR_BOSS_FX_MOBILE?6:10),inner=radius*.48,outer=radius*(.82+(k%2)*.18);ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.stroke();}
    }else if(f.kind==='skill'||f.kind==='attack'){
      const radius=(f.kind==='skill'?35:26)+p*(f.kind==='skill'?58:34);ctx.globalAlpha=fade*(f.kind==='skill'?.82:.52);ctx.lineWidth=f.kind==='skill'?5:3;ctx.beginPath();ctx.arc(0,0,radius,spin,spin+Math.PI*1.45);ctx.stroke();ctx.beginPath();ctx.arc(0,0,radius*.72,-spin,-spin+Math.PI*1.2);ctx.stroke();
      const marks=f.kind==='skill'?(FR_BOSS_FX_MOBILE?4:6):3;ctx.lineWidth=2;for(let k=0;k<marks;k++){const a=-spin+k*Math.PI*2/marks;ctx.beginPath();ctx.moveTo(Math.cos(a)*radius*.78,Math.sin(a)*radius*.78);ctx.lineTo(Math.cos(a)*radius*1.18,Math.sin(a)*radius*1.18);ctx.stroke();}
    }else if(f.kind==='summon'){
      const radius=12+p*34;ctx.globalAlpha=fade*.82;ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,0,radius,radius*.38,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=fade*.2;ctx.beginPath();ctx.ellipse(0,0,radius*.76,radius*.25,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=fade*.45;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-radius*.55,0);ctx.lineTo(-radius*.25,-50*(1-p));ctx.moveTo(radius*.55,0);ctx.lineTo(radius*.25,-50*(1-p));ctx.stroke();
    }else if(f.kind==='theme'){
      const id=f.theme,r=38+p*64,count=FR_BOSS_FX_MOBILE?4:6;ctx.globalAlpha=fade*.72;ctx.lineWidth=3;ctx.setLineDash([]);
      if(id==='tiramisu-jazz'){
        ctx.beginPath();ctx.moveTo(-r*.65,-r);ctx.lineTo(-r*.25,r*.7);ctx.lineTo(r*.25,r*.7);ctx.lineTo(r*.65,-r);ctx.stroke();for(let k=0;k<4;k++){const nx=-42+k*28,ny=-8+Math.sin(spin+k)*22;ctx.beginPath();ctx.arc(nx,ny,5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(nx+5,ny);ctx.lineTo(nx+5,ny-18);ctx.stroke();}
      }else if(id==='jelly-king'){
        for(let k=0;k<3;k++){ctx.beginPath();ctx.ellipse(0,12,r*(.45+k*.2),r*(.18+k*.08)*(1+.18*Math.sin(spin+k)),0,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=fade*.3;ctx.beginPath();ctx.arc(0,0,r*.58,0,Math.PI*2);ctx.fill();
      }else if(id==='niu-mowang'){
        ctx.lineWidth=5;ctx.beginPath();ctx.arc(-28,2,r*.55,-Math.PI*.9,-Math.PI*.12);ctx.arc(28,2,r*.55,-Math.PI*.88,-Math.PI*.1);ctx.stroke();for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*20,34);ctx.lineTo(k*31,34+r*.45);ctx.stroke();}
      }else if(id==='yang-mowang'){
        for(let k=0;k<count;k++){const a=spin+k*Math.PI*2/count,cx=Math.cos(a)*r*.58,cy=Math.sin(a)*r*.34;ctx.beginPath();ctx.arc(cx,cy,18+5*Math.sin(spin+k),0,Math.PI*2);ctx.stroke();}
      }else if(id==='mala-vampire'){
        for(let k=0;k<count;k++){const a=spin+k*Math.PI*2/count,cx=Math.cos(a)*r*.72,cy=Math.sin(a)*r*.48;ctx.beginPath();ctx.moveTo(cx-12,cy);ctx.lineTo(cx,cy-9);ctx.lineTo(cx+12,cy);ctx.lineTo(cx,cy+5);ctx.closePath();ctx.stroke();}ctx.beginPath();ctx.arc(0,0,r*.45,0,Math.PI*2);ctx.stroke();
      }else if(id==='white-soup-princess'){
        for(let k=0;k<6;k++){const a=k*Math.PI/3;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}ctx.strokeStyle='#fb7185';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,18+k*13,26+k*8,Math.PI*.12,Math.PI*.88,true);ctx.stroke();}
      }else if(id==='bitter-melon-witch'){
        for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*18,42);ctx.bezierCurveTo(k*30,-5,-k*18,-22,k*14,-r);ctx.stroke();ctx.beginPath();ctx.arc(k*14,-r,6,0,Math.PI*2);ctx.fill();}
      }else if(id==='halloween-pumpkin-king'){
        for(let k=0;k<3;k++){const a=spin+k*Math.PI*2/3,cx=Math.cos(a)*r*.62,cy=Math.sin(a)*r*.36;ctx.beginPath();ctx.arc(cx,cy,18,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(cx-8,cy-3);ctx.lineTo(cx-3,cy+2);ctx.moveTo(cx+8,cy-3);ctx.lineTo(cx+3,cy+2);ctx.stroke();}
      }else if(id==='karaage-superhero'){
        for(let k=0;k<9;k++){const a=k*Math.PI*2/9,inner=25+(k%2)*10;ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}for(let k=0;k<count;k++){ctx.beginPath();ctx.arc(Math.cos(spin+k)*r*.55,Math.sin(spin*1.3+k)*r*.42,4,0,Math.PI*2);ctx.fill();}
      }else if(id==='eel-dragon'){
        ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(-r,-22);ctx.bezierCurveTo(-r*.45,-r*.7,r*.25,r*.55,r,8);ctx.stroke();ctx.globalAlpha=fade*.35;ctx.beginPath();ctx.moveTo(-r,4);ctx.bezierCurveTo(-r*.35,-r*.55,r*.35,r*.7,r,30);ctx.stroke();
      }else if(id==='fried-rice-beast'){
        ctx.lineWidth=6;ctx.beginPath();ctx.arc(0,8,r*.72,.08*Math.PI,.92*Math.PI);ctx.stroke();for(let k=0;k<count;k++){const a=spin+k*Math.PI*2/count;ctx.beginPath();ctx.ellipse(Math.cos(a)*r*.65,-18+Math.sin(a)*r*.45,6,3,a,0,Math.PI*2);ctx.fill();}
      }else if(id==='intestine-sandworm'){
        for(let k=0;k<5;k++){ctx.beginPath();ctx.ellipse((k-2)*25,25+Math.sin(spin+k)*11,18,8,0,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(-r,46);ctx.quadraticCurveTo(0,18,r,46);ctx.stroke();
      }else if(id==='durian-icepop-warrior'){
        for(let k=0;k<12;k++){const a=spin+k*Math.PI/6;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.38,Math.sin(a)*r*.38);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.lineTo(Math.cos(a+.09)*r*.72,Math.sin(a+.09)*r*.72);ctx.stroke();}
      }else if(id==='mango-ice-monster'){
        for(let k=0;k<8;k++){const a=spin+k*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*24,Math.sin(a)*24);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}for(let k=-2;k<=2;k++){ctx.beginPath();ctx.arc(k*22,-r*.65+((spin*18+k*17)%42),5,0,Math.PI*2);ctx.fill();}
      }else if(id==='fries-swordsman'){
        ctx.lineWidth=6;for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(-r,k*18-r*.25);ctx.lineTo(r,k*18+r*.25);ctx.stroke();}ctx.globalAlpha=fade*.3;ctx.fillRect(-r,-4,r*2,8);
      }else if(id==='pasta-mummy'){
        for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(-r,k*16);ctx.bezierCurveTo(-r*.35,k*28+Math.sin(spin)*18,r*.35,k*4-Math.sin(spin)*18,r,k*16);ctx.stroke();}
      }else if(id==='pastry-soup-wizard'){
        for(let k=0;k<4;k++){const rr=r*(.35+k*.16);ctx.beginPath();ctx.rect(-rr,-rr*.48,rr*2,rr*.96);ctx.stroke();}for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(k*18,-r*.65);ctx.lineTo(k*10,0);ctx.stroke();}
      }else if(id==='cream-chicken-pontiff'){
        ctx.lineWidth=5;ctx.beginPath();ctx.ellipse(0,-22,r*.72,r*.24,0,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.lineTo(0,r);ctx.stroke();
      }else if(id==='octopus-warrior'){
        for(let k=0;k<8;k++){const a=spin+k*Math.PI/4,sx=Math.cos(a)*22,sy=Math.sin(a)*16;ctx.beginPath();ctx.moveTo(sx,sy);ctx.bezierCurveTo(Math.cos(a+.25)*r*.5,Math.sin(a+.25)*r*.35,Math.cos(a-.2)*r*.8,Math.sin(a-.2)*r*.58,Math.cos(a)*r,Math.sin(a)*r*.7);ctx.stroke();}
      }else if(id==='heavy-armor-mech'){
        ctx.lineWidth=4;ctx.strokeRect(-r*.62,-r*.62,r*1.24,r*1.24);ctx.beginPath();ctx.arc(0,0,r*.35,0,Math.PI*2);ctx.moveTo(-r,0);ctx.lineTo(-r*.28,0);ctx.moveTo(r*.28,0);ctx.lineTo(r,0);ctx.moveTo(0,-r);ctx.lineTo(0,-r*.28);ctx.moveTo(0,r*.28);ctx.lineTo(0,r);ctx.stroke();
      }
    }
    ctx.restore();
  }
}
function frThunderDrawPowerAura(b){
  if(!b._frFullEncounter||Number(stage)<22||b._defeated)return;
  const phase=b._frThunderPhase||0,colors=['#c4b5fd','#7dd3fc','#fde047'],color=colors[phase],count=FR_BOSS_FX_MOBILE?3:5,pulse=1+Math.sin(b.timer*.12)*.08;
  ctx.save();ctx.translate(b.x,b.y);ctx.globalCompositeOperation='lighter';ctx.strokeStyle=color;ctx.shadowColor=color;ctx.shadowBlur=FR_BOSS_FX_MOBILE?4:11;ctx.globalAlpha=.34+.08*phase;ctx.lineWidth=2.5;
  ctx.beginPath();ctx.arc(0,0,(b.r+22+phase*5)*pulse,b.timer*.03,b.timer*.03+Math.PI*1.55);ctx.stroke();
  for(let k=0;k<count;k++){const a=b.timer*.045+k*Math.PI*2/count,r=b.r+26+phase*6,x=Math.cos(a)*r,y=Math.sin(a)*r*.72;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.sin(b.timer*.2+k)*8,y-11);ctx.lineTo(x+Math.cos(b.timer*.17+k)*13,y-23);ctx.stroke();}
  ctx.restore();
}
function frBossTempo(stageNum){
  const s=Number(stageNum)||1;
  const enhanced=s>=11&&s<=22;
  return {normalCd:enhanced?60:90,skillCd:enhanced?120:150,normalBusy:66,skillBusy:108,busyRate:1,eventScale:1,warningMin:enhanced?60:90,warningMax:enhanced?60:90,moveRetarget:s>=12?46:64,moveRate:s>=12?.033:.027};
}
function frBossHighStageSkillPool(b){
  const pool=(b&&b._frDef&&b._frDef.skills||[]).slice();
  if(b&&b._frDef&&b._frDef.masterSkill&&!b._frFinal)pool.push(b._frDef.masterSkill);
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
function frBossLater(b,frames,fn){const scale=frBossTempo(stage).eventScale;let delay=scale<1?Math.max(8,Math.round(frames*scale)):frames;const pending=b._frPendingWarning;if(pending&&pending.at===b.timer&&pending.raw===frames){delay=Math.max(delay,pending.scaled);b._frPendingWarning=null;}b._frEvents.push({at:b.timer+delay,fn:fn});}
function frBossWarning(b,kind,frames,data){
  const tempo=frBossTempo(stage),raw=tempo.eventScale<1?Math.round(frames*tempo.eventScale):frames,scaled=Math.min(tempo.warningMax||raw,Math.max(tempo.warningMin||0,raw));
  const w=Object.assign({kind:kind,start:b.timer,end:b.timer+scaled,color:b.color,x:b.x,y:b.y},data||{});
  b._frPendingWarning={at:b.timer,raw:frames,scaled:scaled};b._frWarnings.push(w);return w;
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
function frBossSummonHpScale(s){return s>=22?1.8:s>=16?1.65:s>=11?1.5:1.35;}
function frBossSummonRefillDelay(s){return s>=22?165:s>=16?180:s>=11?210:240;}
function frBossMinionsDisabled(b){
  const s=Math.max(1,Number(stage)||1),def=b&&(b._frRootDef||b._frDef);
  return !!(def&&def.id==='little-thunder-god'&&(s===11||s===22));
}
function frBossSummonMinions(b,count,type){
  if(frBossMinionsDisabled(b))return 0;
  const s=Math.max(1,Number(stage)||1),active=enemies.filter(function(e){return e&&e.hp>0&&e._frBossSummoned;}).length,maxActive=s>=16?6:4,amount=Math.max(0,Math.min(count,maxActive-active,18-enemies.length)),hpScale=frBossSummonHpScale(s);
  if(!amount)return 0;
  for(let i=0;i<amount;i++){
    const enemyType=type||1+((s+i+(b._frSummonWave||0))%3),x=Math.max(34,Math.min(CW-34,b.x+(i-(amount-1)/2)*88)),y=Math.max(70,b.y+48+Math.abs(i-(amount-1)/2)*10);
    const e=new Enemy(x,y,enemyType,40,2,stage);e.y=y;e.maxHp=Math.max(1,Math.round((Number(e.maxHp)||Number(e.hp)||40)*hpScale));e.hp=e.maxHp;e._frBossSummoned=true;e._frBossSummonOwner=b;e._frBossSummonHpScale=hpScale;enemies.push(e);
    frBossFxPush(b,'summon',{x:x,y:y,duration:58,color:b.color,follow:false});
  }
  addText('強化增援 ×'+amount,b.x,b.y-82,'#fb7185',13,-.5);frBossFxPush(b,'skill',{duration:50,color:b.color});
  return amount;
}
function frBossMaybeSummon(b){
  if(frBossMinionsDisabled(b)){b._frNextSummon=Infinity;b._frSummonEmptySince=0;return;}
  if(!b._frEntered||b._frTransition||b._defeated||b._frControlLockUntil>b.timer)return;
  const s=Math.max(1,Number(stage)||1),active=enemies.some(function(e){return e&&e.hp>0&&e._frBossSummoned;});
  if(active){b._frSummonEmptySince=0;return;}
  if(!b._frHasSummoned){if(b.timer<(b._frNextSummon||Infinity))return;}
  else{
    if(!b._frSummonEmptySince){b._frSummonEmptySince=b.timer;return;}
    if(b.timer-b._frSummonEmptySince<frBossSummonRefillDelay(s))return;
  }
  const maxCount=s>=16?4:s>=11?3:2,count=2+Math.floor(Math.random()*(maxCount-1));
  if(frBossSummonMinions(b,count)){b._frSummonWave++;b._frHasSummoned=true;b._frSummonEmptySince=0;b._frBusyUntil=Math.max(b._frBusyUntil||0,b.timer+42);}
}
function frBossHurtOnce(h,amount){
  if(player.invTimer<=0){hurtPlayer(amount);h.lastHit=h.age;}
}

class FrBossHazard{
  constructor(options){
    const opt=options||{},tempo=frBossTempo(stage);
    Object.assign(this,{age:0,dead:false,delay:60,duration:90,kind:'circle',x:CW/2,y:CH/2,r:60,w:60,h:60,color:'#ef4444',damage:18,lastHit:-999,slow:0,status:null,minDelay:60},opt);
    if(this.delay>0){
      const scaled=Math.round(this.delay*tempo.eventScale),configuredFloor=Number.isFinite(opt.minDelay)?Math.round(opt.minDelay*tempo.eventScale):(this.minDelay||60);
      this.delay=Math.min(tempo.warningMax||Math.max(configuredFloor,scaled),Math.max(tempo.warningMin||0,configuredFloor,scaled));
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
    if(!active&&this.telegraphKind==='creamSweep')this.drawCreamSweepTelegraph(progress,pulse);
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
  drawCreamSweepTelegraph(progress,pulse){
    const gapY=this.telegraphGapY,gapH=this.telegraphGapH,fromLeft=this.telegraphFromLeft,edgeX=fromLeft?12:CW-12,dir=fromLeft?1:-1;
    ctx.save();
    ctx.fillStyle=this.color;ctx.globalAlpha=.07+.03*pulse;ctx.fillRect(0,0,CW,Math.max(0,gapY-gapH/2));ctx.fillRect(0,gapY+gapH/2,CW,Math.max(0,CH-gapY-gapH/2));
    ctx.globalAlpha=.2+.12*pulse;ctx.fillStyle='#86efac';ctx.fillRect(0,gapY-gapH/2,CW,gapH);
    ctx.globalAlpha=.88;ctx.strokeStyle='#dcfce7';ctx.lineWidth=3;ctx.setLineDash([10,7]);ctx.strokeRect(2,gapY-gapH/2,CW-4,gapH);ctx.setLineDash([]);
    ctx.strokeStyle='#fff7cc';ctx.shadowColor=this.color;ctx.shadowBlur=10;ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(edgeX,0);ctx.lineTo(edgeX,CH*progress);ctx.stroke();
    ctx.shadowBlur=0;ctx.fillStyle='#fff7cc';ctx.globalAlpha=.9;const arrowX=edgeX+dir*18;
    for(let y=90;y<CH;y+=92){if(Math.abs(y-gapY)<gapH*.65)continue;ctx.beginPath();ctx.moveTo(arrowX+dir*13,y);ctx.lineTo(arrowX-dir*5,y-9);ctx.lineTo(arrowX-dir*5,y+9);ctx.closePath();ctx.fill();}
    ctx.restore();
  }
}
class FrThunderTrackingLaser{
  constructor(b,hand,damage){this.b=b;this.hand=hand;this.damage=damage;this.age=0;this.delay=60;this.duration=150;this.dead=false;this.angle=Math.atan2(player.y-hand.y,player.x-hand.x);this.lastHit=-999;}
  update(){this.age++;if(!this.hand||this.hand.dead||this.age>this.delay+this.duration){this.dead=true;return;}const target=Math.atan2(player.y-this.hand.y,player.x-this.hand.x),delta=Math.atan2(Math.sin(target-this.angle),Math.cos(target-this.angle)),turn=this.age<=this.delay?.018:.009;this.angle+=Math.max(-turn,Math.min(turn,delta));if(this.age<=this.delay)return;const reach=Math.max(CW,CH)*1.5,dx=Math.cos(this.angle)*reach,dy=Math.sin(this.angle)*reach,len2=dx*dx+dy*dy,t=Math.max(0,Math.min(1,((player.x-this.hand.x)*dx+(player.y-this.hand.y)*dy)/len2)),px=this.hand.x+dx*t,py=this.hand.y+dy*t;if(Math.hypot(player.x-px,player.y-py)<22+player.radius&&this.age-this.lastHit>28){frBossHurtOnce(this,this.damage);frBossApplyStatus({kind:'paralyze',duration:550});}}
  draw(){if(!this.hand||this.hand.dead)return;const reach=Math.max(CW,CH)*1.5,active=this.age>this.delay,progress=Math.min(1,this.age/this.delay),ex=this.hand.x+Math.cos(this.angle)*reach,ey=this.hand.y+Math.sin(this.angle)*reach;ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=active?'#fff7ae':'#fde047';ctx.shadowColor='#facc15';ctx.shadowBlur=active?(FR_BOSS_FX_MOBILE?8:18):6;ctx.globalAlpha=active?.9:.35+.35*progress;ctx.lineWidth=active?34:5;ctx.setLineDash(active?[]:[12,8]);ctx.beginPath();ctx.moveTo(this.hand.x,this.hand.y);ctx.lineTo(ex,ey);ctx.stroke();if(active){ctx.strokeStyle='#ffffff';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(this.hand.x,this.hand.y);ctx.lineTo(ex,ey);ctx.stroke();}ctx.restore();}
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
const FR_THUNDER_HUNT_PATHS=[
  [0,.15,1,.72],[1,.15,0,.72],[.08,0,.68,1],[.92,0,.32,1],
  [0,.36,1,.36],[0,.56,1,.56],[.25,0,.25,1],[.75,0,.75,1],
  [0,.72,1,.18],[1,.72,0,.18],[0,.9,.82,0],[1,.9,.18,0]
];
class FrThunderHuntLine extends FrBossHazard{
  constructor(path,damage){
    super({kind:'line',x:path[0]*CW,y:path[1]*CH,x2:path[2]*CW,y2:path[3]*CH,w:22,color:'#facc15',damage:damage,status:{kind:'paralyze',duration:900},delay:28,minDelay:24,duration:11});
    this._frThunderHunt=true;
  }
  draw(){
    const active=this.age>this.delay,progress=Math.max(0,Math.min(1,this.age/Math.max(1,this.delay))),dx=this.x2-this.x,dy=this.y2-this.y;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';ctx.strokeStyle=active?'#fde047':'#facc15';ctx.shadowColor='#facc15';ctx.shadowBlur=active?(FR_BOSS_FX_MOBILE?7:18):5;ctx.globalAlpha=active?.78:.3+.28*progress;ctx.lineWidth=active?18:3;ctx.setLineDash(active?[]:[10,8]);ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(active?this.x2:this.x+dx*progress,active?this.y2:this.y+dy*progress);ctx.stroke();ctx.setLineDash([]);
    if(active){ctx.globalAlpha=.96;ctx.strokeStyle='#fff7ae';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x2,this.y2);ctx.stroke();ctx.globalAlpha=.92;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(this.x,this.y);ctx.lineTo(this.x2,this.y2);ctx.stroke();const travel=((this.age-this.delay)/Math.max(1,this.duration));ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(this.x+dx*travel,this.y+dy*travel,6,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
}
function frThunderHuntSequence(b,damage){
  const start=b._frHuntCursor||0;b._frHuntCursor=(start+4)%FR_THUNDER_HUNT_PATHS.length;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+150);
  for(let q=0;q<4;q++)frBossLater(b,q*30,function(){if(b._defeated||b._frTransition)return;hazards.push(new FrThunderHuntLine(FR_THUNDER_HUNT_PATHS[(start+q)%FR_THUNDER_HUNT_PATHS.length],Math.max(8,Math.round(damage*.78))));});
}
function frBossHazard(options){const h=new FrBossHazard(options);hazards.push(h);return h;}
let frThunderArenaTimer=70;
function frThunderChaserEnabled(){
  const s=Number(stage),activeBoss=typeof boss!=='undefined'?boss:null;
  const isolatedLaterPhase=!!(activeBoss&&activeBoss._frDirectPhaseTest&&(activeBoss._frThunderPhase||0)>=1);
  return currentBgIdx===10&&(s===11||s>=22)&&!stageCleared&&!isolatedLaterPhase&&!(activeBoss&&activeBoss._frTransition);
}
class FrThunderChaserOrb{
  constructor(index){
    this._frThunderChaser=true;this.index=index||0;this.age=0;this.dead=false;this.r=23;this.hitCooldown=0;
    this.x=this.index?CW-58:58;this.y=135+this.index*54;
    this.vx=this.index?-1.1:1.1;this.vy=.45;
  }
  update(){
    this.age++;if(this.hitCooldown>0)this.hitCooldown--;
    if(!frThunderChaserEnabled()){this.dead=true;return;}
    const dx=player.x-this.x,dy=player.y-this.y,dist=Math.hypot(dx,dy)||1;
    const other=hazards.find(function(h){return h&&h!==this&&h._frThunderChaser&&!h.dead;},this);
    let ax=dx/dist*.055,ay=dy/dist*.055;
    if(other){const odx=this.x-other.x,ody=this.y-other.y,od=Math.hypot(odx,ody)||1;if(od<82){const repel=(82-od)/82*.11;ax+=odx/od*repel;ay+=ody/od*repel;}}
    this.vx+=ax;this.vy+=ay;
    const maxSpeed=Number(stage)>=22?2.65:2.35,speed=Math.hypot(this.vx,this.vy)||1;
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
    const finalStage=Number(stage)>=22,pulse=.5+.5*Math.sin(this.age*.24+this.index*Math.PI),trail=Math.atan2(this.vy,this.vx),outer=finalStage?'#facc15':'#60a5fa',core=finalStage?'#ca8a04':'#1d4ed8';
    ctx.save();ctx.translate(this.x,this.y);ctx.rotate(trail);
    const grad=ctx.createRadialGradient(0,0,3,0,0,this.r+12);grad.addColorStop(0,'rgba(255,255,255,.98)');grad.addColorStop(.24,'rgba(254,240,138,.98)');grad.addColorStop(.58,finalStage?'rgba(250,204,21,.82)':'rgba(59,130,246,.78)');grad.addColorStop(1,finalStage?'rgba(161,98,7,0)':'rgba(30,64,175,0)');
    ctx.globalAlpha=.28;ctx.fillStyle=outer;ctx.beginPath();ctx.ellipse(-18,0,30+pulse*8,12+pulse*3,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.shadowBlur=FR_BOSS_FX_MOBILE?10:18+pulse*8;ctx.shadowColor=outer;ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=grad;ctx.beginPath();ctx.arc(0,0,this.r+10,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#bfdbfe';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,this.r+2+pulse*3,0,Math.PI*2);ctx.stroke();
    ctx.shadowBlur=8;ctx.strokeStyle='#ffffff';ctx.lineWidth=2.5;ctx.lineCap='round';
    for(let i=0;i<4;i++){const a=this.age*.16+i*Math.PI/2;ctx.beginPath();ctx.moveTo(Math.cos(a)*5,Math.sin(a)*5);ctx.lineTo(Math.cos(a+.32)*(this.r*.58),Math.sin(a+.32)*(this.r*.58));ctx.lineTo(Math.cos(a-.18)*(this.r+7+pulse*4),Math.sin(a-.18)*(this.r+7+pulse*4));ctx.stroke();}
    ctx.restore();
  }
}
function frThunderEnsureChaserOrbs(){
  const active=hazards.filter(function(h){return h&&h._frThunderChaser&&!h.dead;});
  if(!frThunderChaserEnabled()){active.forEach(function(h){h.dead=true;});return;}
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
function frBossSafeCorridor(){return Math.max(108,Math.min(124,CW*.29));}
function frBossWallGap(){return 1+Math.floor(Math.random()*5);}
function frBossWallWithGap(b,side,color,damage,gapStart){
  const rows=9,gap=Number.isFinite(gapStart)?Math.max(0,Math.min(rows-3,gapStart)):frBossWallGap();
  for(let i=0;i<rows;i++){if(i>=gap&&i<=gap+2)continue;const y=75+i*(CH-120)/rows;const src={x:side<0?-20:CW+20,y:y,color:color};frBossShot(src,side<0?0:Math.PI,4.4,damage,color,9,{oy:0});}
  return gap;
}
function frBossCrossLines(b,color,damage){
  frBossHazard({kind:'line',x:0,y:player.y,x2:CW,y2:player.y,w:34,color:color,damage:damage,delay:55,duration:32});
  frBossHazard({kind:'line',x:player.x,y:0,x2:player.x,y2:CH,w:34,color:color,damage:damage,delay:55,duration:32});
}
function frBossMeteor(b,count,color,damage,largeLast,status){
  const side=player.x<CW/2?1:-1,safeX=Math.max(58,Math.min(CW-58,player.x+side*frBossSafeCorridor())),safeY=Math.max(145,Math.min(CH-75,player.y)),placed=[];
  for(let i=0;i<count;i++)frBossLater(b,i*18,function(){
    const radius=largeLast&&i===count-1?88:42;let x=35+Math.random()*(CW-70),y=130+Math.random()*(CH-210),found=false;
    for(let tries=0;tries<18;tries++){
      const tx=35+Math.random()*(CW-70),ty=130+Math.random()*(CH-210),clearEscape=Math.hypot(tx-safeX,ty-safeY)>radius+62,clearDrop=placed.every(function(p){return Math.hypot(tx-p.x,ty-p.y)>Math.min(105,radius+p.r+18);});
      if(clearEscape&&clearDrop){x=tx;y=ty;found=true;break;}
    }
    if(!found){const fallback=[[35,135],[CW-35,135],[35,CH-75],[CW-35,CH-75]].sort(function(a,b){return Math.hypot(b[0]-safeX,b[1]-safeY)-Math.hypot(a[0]-safeX,a[1]-safeY);})[0];x=fallback[0];y=fallback[1];}
    placed.push({x:x,y:y,r:radius});frBossHazard({kind:'circle',x:x,y:y,r:radius,color:color,damage:damage,status:status||null,delay:90,minDelay:90,duration:14});
  });
}
function frBossCast(b,pattern,isSkill){
  const c=b._frFinal&&(b._frThunderPhase||0)===0?'#fde047':b.color,curve=frBalanceCurve(stage),phasePower=b._frFinal?[1,1.15,1.32][b._frThunderPhase||0]:1,stage11Power=b._frStage11Enhanced?FR_STAGE11_THUNDER.damage:1,d=Math.round((isSkill?14:9)*curve.bossDamage*frBossDamageScale(stage)*phasePower*stage11Power),tempo=frBossTempo(stage),w=tempo.warningMin||55;
  const controlPatterns=['creamWalls','cleaverLanes','conveyor','sideAvalanche','closingWalls','waterWalls','jazzSyncopation','thousandFries','noodleGrid','tomatoCoffin','creamSweep','creamBaptism','railClamp','woolPrison'],locksControl=controlPatterns.indexOf(pattern)>=0;
  if(locksControl)b._frControlLockUntil=Math.max(b._frControlLockUntil||0,b.timer+180);
  b._frBusyUntil=b.timer+(isSkill?tempo.skillBusy:tempo.normalBusy);frBossAnimate(b,isSkill?105:72);
  if(locksControl)b._frBusyUntil=Math.max(b._frBusyUntil,b._frControlLockUntil);
  frBossFxPush(b,isSkill?'skill':'attack',{duration:isSkill?54:30,color:c});
  if(isSkill)frBossThemeFx(b,pattern,68);
  if(isSkill)frBossWarning(b,'circle',48,{r:82});
  addText(isSkill?'⚠ '+b._frSkillLabels[pattern]:b._frNormalLabel,b.x,b.y-86,c,isSkill?15:12);
  if(pattern==='cocoaFan'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.58});frBossLater(b,w,function(){frBossFan(b,5,4.6,d,.18,c);});}
  else if(pattern==='coffeePools'){for(let i=0;i<3;i++)frBossLater(b,i*16,function(){frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*100,y:player.y+(Math.random()-.5)*80,r:48,color:'#78350f',damage:d,status:{kind:'slow',duration:2400},delay:48,duration:150});});}
  else if(pattern==='cookieRain'){frBossMeteor(b,7,'#d97706',d,true);}
  else if(pattern==='creamWalls'){const gap=frBossWallGap();frBossWarning(b,'rect',w,{x:CW/2,y:CH/2,w:CW,h:42});frBossLater(b,w,function(){frBossWallWithGap(b,-1,'#fff7ed',d,gap);frBossWallWithGap(b,1,'#fff7ed',d,gap);});}
  else if(pattern==='jellyBounce'){frBossWarning(b,'line',w,{angle:frBossAim(b)});frBossLater(b,w,function(){frBossShot(b,frBossAim(b),4,d,c,11,{bounce:true});});}
  else if(pattern==='jellyClones'){frBossLater(b,w,function(){frBossSummonMinions(b,2,1);});for(let s=-1;s<=1;s++)frBossLater(b,w+s*8,function(){frBossFan({x:b.x+s*70,y:b.y,color:c},3,4,d,.22,c);});}
  else if(pattern==='jellyRings'){for(let q=0;q<3;q++)frBossLater(b,w+q*26,function(){frBossRadial(b,10,3.2,d,c,q*.2);});}
  else if(pattern==='jellyRain'){frBossMeteor(b,9,c,d,true);}
  else if(pattern==='hornFan'){frBossWarning(b,'cone',w,{angle:frBossAim(b),spread:.35});frBossLater(b,w,function(){frBossFan(b,3,5.2,d,.2,c);});}
  else if(pattern==='doubleCharge'){for(let q=0;q<2;q++)frBossLater(b,q*82,function(){const a=frBossAim(b,true);frBossWarning(b,'line',48,{angle:a});frBossLater(b,48,function(){b._frDash={vx:Math.cos(a)*8,vy:Math.sin(a)*8,left:28,damage:d};});});}
  else if(pattern==='shockRings'){for(let q=0;q<3;q++)frBossLater(b,w+q*24,function(){frBossRadial(b,12,3+q*.5,d,c,q*.22);});}
  else if(pattern==='cleaverLanes'){const gap=Math.floor(Math.random()*4);frBossLater(b,w,function(){for(let i=0;i<5;i++){if(i===gap||i===gap+1)continue;frBossHazard({kind:'rect',x:(i+.5)*CW/5,y:CH/2,w:Math.min(CW/7,48),h:CH,color:c,damage:d,delay:90+(i>gap?i-2:i)*12,minDelay:90,duration:24});}});}
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
  else if(pattern==='conveyor'){const gaps=[frBossWallGap(),frBossWallGap(),frBossWallGap()];for(let q=0;q<3;q++)frBossLater(b,w+q*34,function(){frBossWallWithGap(b,q%2?-1:1,c,d,gaps[q]);});}
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
  else if(pattern==='iceColumns'||pattern==='fryColumns'){const gap=Math.floor(Math.random()*4);for(let q=0;q<5;q++){if(q===gap||q===gap+1)continue;const x=(q+.5)*CW/5;frBossHazard({kind:'rect',x:x,y:CH/2,w:40,h:CH,color:c,damage:d,status:pattern==='iceColumns'?{kind:'freeze',duration:2200}:null,delay:90+q*12,minDelay:90,duration:22});}}
  else if(pattern==='avalanche'){for(let q=0;q<4;q++)frBossLater(b,q*28,function(){frBossLineRain(b,8,c,d);});frBossLater(b,w,function(){frBossApplyStatus({kind:'slow',duration:1800});});}
  else if(pattern==='turnTwin'){frBossLater(b,w,function(){const a=frBossAim(b);frBossShot(b,a-.25,4,d,c,9,{turnAt:35});frBossShot(b,a+.25,4,d,c,9,{turnAt:35});});}
  else if(pattern==='snowcone'){for(let q=0;q<6;q++)frBossLater(b,w+q*14,function(){frBossRadial(b,6,3.4,d,c,q*.3,{status:{kind:'freeze',duration:2000}});});}
  else if(pattern==='sideAvalanche'){const gaps=[frBossWallGap(),frBossWallGap(),frBossWallGap(),frBossWallGap()];for(let q=0;q<4;q++)frBossLater(b,q*38,function(){frBossWallWithGap(b,q%2?-1:1,c,d,gaps[q]);});}
  else if(pattern==='crossSlash'){frBossLater(b,w,function(){frBossFan(b,2,5.5,d,.55,c,{radius:9});});}
  else if(pattern==='lineSlashes'){for(let q=0;q<3;q++)frBossLater(b,q*60,function(){const a=frBossAim(b,true);frBossWarning(b,'line',45,{angle:a});frBossLater(b,45,function(){frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*CH*1.5,y2:b.y+Math.sin(a)*CH*1.5,w:32,color:c,damage:d,delay:0,duration:24});});});}
  else if(pattern==='noodleCurve'){frBossLater(b,w,function(){frBossFan(b,3,4,d,.2,c,{curve:.01});});}
  else if(pattern==='noodleGrid'){const safeRow=Math.floor(Math.random()*3),safeCol=Math.floor(Math.random()*2),safeA=safeRow*3+safeCol,safeB=safeA+1;for(let iy=0;iy<3;iy++)for(let ix=0;ix<3;ix++){const cell=iy*3+ix;if(cell===safeA||cell===safeB)continue;frBossHazard({kind:'rect',x:(ix+.5)*CW/3,y:110+(iy+.5)*(CH-150)/3,w:CW/3-16,h:(CH-150)/3-16,color:c,damage:d,delay:90,minDelay:90,duration:24});}}
  else if(pattern==='flakeCross'){frBossLater(b,w,function(){frBossRadial(b,4,4.4,d,c,Math.PI/4);});}
  else if(pattern==='groundEruptions'){for(let q=0;q<5;q++)frBossLater(b,q*25,function(){frBossHazard({kind:'circle',x:player.x,y:player.y,r:44+q*4,color:c,damage:d,delay:48,duration:18});});}
  else if(pattern==='shieldRadial'){b.shield=Math.min(b.maxShield,b.shield+Math.floor(b.maxShield*.35));b.shieldBroken=false;updateBossShield();for(let q=0;q<4;q++)frBossLater(b,w+q*22,function(){frBossRadial(b,10,3.2,d,c,q*.25);});}
  else if(pattern==='insideOutside'){frBossHazard({kind:'circle',x:CW/2,y:CH*.55,r:105,color:c,damage:d,delay:60,duration:32});frBossLater(b,120,function(){frBossHazard({kind:'ring',x:CW/2,y:CH*.55,r:230,inner:105,color:c,damage:d,delay:50,duration:32});});}
  else if(pattern==='creamSplit'){frBossLater(b,w,function(){frBossShot(b,frBossAim(b),3.5,d,c,13,{splitAt:34,splitCount:3,splitSpeed:3.6});});}
  else if(pattern==='chickenLegRain'){frBossLater(b,w,function(){frBossSummonMinions(b,2,3);});frBossMeteor(b,8,c,d,true);}
  else if(pattern==='creamSweep'){
    const fromLeft=Math.random()<.5,sweepW=CW*.58,startX=fromLeft?-sweepW/2:CW+sweepW/2,travel=CW+sweepW,duration=150;
    const gapH=frBossSafeCorridor(),gapY=Math.max(95+gapH/2,Math.min(CH-55-gapH/2,player.y));
    const topH=Math.max(0,gapY-gapH/2),bottomY=gapY+gapH/2,bottomH=Math.max(0,CH-bottomY),moveX=fromLeft?travel/duration:-travel/duration;
    b._frControlLockUntil=Math.max(b._frControlLockUntil||0,b.timer+90+duration+8);b._frBusyUntil=Math.max(b._frBusyUntil||0,b._frControlLockUntil);
    frBossHazard({kind:'rect',x:startX,y:topH/2,w:sweepW,h:topH,color:c,damage:d,status:{kind:'attackDown',duration:3200},delay:90,minDelay:90,duration:duration,moveX:moveX,telegraphKind:'creamSweep',telegraphGapY:gapY,telegraphGapH:gapH,telegraphFromLeft:fromLeft});
    frBossHazard({kind:'rect',x:startX,y:bottomY+bottomH/2,w:sweepW,h:bottomH,color:c,damage:d,status:{kind:'attackDown',duration:3200},delay:90,minDelay:90,duration:duration,moveX:moveX});
  }
  else if(pattern==='closingWalls'){const gap=frBossWallGap();frBossLater(b,w,function(){frBossWallWithGap(b,-1,c,d,gap);frBossWallWithGap(b,1,c,d,gap);frBossRadial(b,8,3.5,d,c,.2);});}
  else if(pattern==='tentacleLanes'){const gap=Math.floor(Math.random()*3);frBossLater(b,w,function(){frBossSummonMinions(b,2,3);});for(let q=0;q<4;q++){if(q===gap||q===gap+1)continue;const x=(q+.5)*CW/4;frBossHazard({kind:'rect',x:x,y:CH/2,w:46,h:CH,color:c,damage:d,delay:90+q*15,minDelay:90,duration:24});}}
  else if(pattern==='inkCloud'){for(let q=0;q<4;q++)frBossHazard({kind:'circle',x:45+Math.random()*(CW-90),y:140+Math.random()*(CH-210),r:48,color:'#312e81',damage:d,status:{kind:'attackDown',duration:3400},delay:55,duration:125});frBossLater(b,65,function(){frBossFan(b,5,4.8,d,.18,'#f8fafc');});}
  else if(pattern==='centerPull'){frBossHazard({kind:'circle',x:CW/2,y:CH*.55,r:70,color:c,damage:d,pull:.025,delay:45,duration:145});for(let q=0;q<4;q++)frBossLater(b,w+q*26,function(){frBossRadial({x:CW/2,y:CH*.55,color:c},10,3,d,c,q*.2);});}
  else if(pattern==='horizontalCharges'){for(let q=0;q<3;q++)frBossLater(b,q*68,function(){const side=Math.random()<.5?-1:1,y=150+Math.random()*(CH-230);frBossHazard({kind:'line',x:side<0?0:CW,y:y,x2:side<0?CW:0,y2:y,w:44,color:c,damage:d,delay:46,duration:24});});}
  else if(pattern==='bubbleLock'){const x=player.x,y=player.y;for(let q=0;q<3;q++)frBossLater(b,q*38,function(){frBossHazard({kind:'circle',x:x+(Math.random()-.5)*80,y:y+(Math.random()-.5)*80,r:42+q*8,color:c,damage:d,status:{kind:'slow',duration:2500},delay:55,duration:20});});}
  else if(pattern==='waterWalls'){const gaps=[frBossWallGap(),frBossWallGap(),frBossWallGap(),frBossWallGap()];for(let q=0;q<4;q++)frBossLater(b,q*34,function(){frBossWallWithGap(b,q%2?-1:1,c,d,gaps[q]);});}
  else if(pattern==='jazzSyncopation'){const first=Math.floor(Math.random()*4);for(let q=0;q<3;q++)frBossLater(b,q*42,function(){const gap=(first+q)%4;for(let i=0;i<5;i++)if(i!==gap&&i!==gap+1)frBossHazard({kind:'rect',x:(i+.5)*CW/5,y:CH/2,w:CW/5-14,h:CH,color:'#92400e',damage:d,status:{kind:'slow',duration:1700},delay:90,minDelay:90,duration:16});});}
  else if(pattern==='mochaSpotlight'){for(let q=0;q<4;q++)frBossLater(b,q*30,function(){const x=player.x+(player.vx||0)*10,y=player.y+(player.vy||0)*10;frBossHazard({kind:'circle',x:x,y:y,r:52,color:'#78350f',damage:d,status:{kind:'slow',duration:1900},delay:56,duration:55});});}
  else if(pattern==='jellyWall'){for(let q=0;q<3;q++)frBossLater(b,q*28,function(){const side=q%2?-1:1,src={x:side<0?-16:CW+16,y:145+q*(CH-250)/3,color:c};frBossShot(src,side<0?.18:Math.PI-.18,4.6,d,c,18,{oy:0,bounce:true,splitAt:70,splitCount:4,splitSpeed:3.1});});}
  else if(pattern==='crownSlam'){for(let q=0;q<3;q++)frBossLater(b,q*48,function(){const x=player.x+(player.vx||0)*12,y=player.y+(player.vy||0)*12;frBossHazard({kind:'circle',x:x,y:y,r:68+q*7,color:c,damage:d,delay:52,duration:18});frBossLater(b,34,function(){if(!b._defeated){b.x=Math.max(60,Math.min(CW-60,x));b.y=Math.max(frBossSafeCenterY(b),Math.min(CH*.52,y));}});});}
  else if(pattern==='returningCharge'){for(let q=0;q<2;q++)frBossLater(b,q*82,function(){const a=frBossAim(b,true);frBossWarning(b,'line',46,{angle:a,color:'#fca5a5'});frBossLater(b,46,function(){b._frDash={vx:Math.cos(a)*9.4,vy:Math.sin(a)*9.4,left:28,damage:d};});});}
  else if(pattern==='cleaverCollapse'){const order=frBossShuffle([0,1,2,3,4]);for(let q=0;q<5;q++)frBossLater(b,q*22,function(){const x=(order[q]+.5)*CW/5;frBossHazard({kind:'line',x:x-80,y:0,x2:x+80,y2:CH,w:34,color:'#ef4444',damage:d,delay:48,duration:15});});}
  else if(pattern==='hornCyclone'){for(let q=0;q<8;q++)frBossLater(b,q*13,function(){const a=q*Math.PI/4+b.timer*.04;frBossShot(b,a,4,d,c,11,{curve:q%2?.018:-.018,status:{kind:'slow',duration:1300}});frBossShot(b,a+Math.PI,4,d,c,11,{curve:q%2?.018:-.018,status:{kind:'slow',duration:1300}});});}
  else if(pattern==='woolCloudSiege'){const x=player.x,y=player.y;for(let q=0;q<3;q++)frBossLater(b,q*42,function(){frBossHazard({kind:'ring',x:x,y:y,r:190-q*36,inner:126-q*29,color:'#e9d5ff',damage:d,status:{kind:'slow',duration:2300},delay:54,duration:34});});}
  else if(pattern==='bloodBatHunt'){for(let q=0;q<6;q++)frBossLater(b,q*16,function(){const a=frBossAim(b,true)+(q-2.5)*.12;frBossShot(b,a,4.8,d,'#fb7185',9,{curve:q%2?.012:-.012,burn:true,status:{kind:'burn',duration:2400}});});}
  else if(pattern==='bloodMoonBroth'){const x=CW/2,y=CH*.53;for(let q=0;q<4;q++)frBossLater(b,q*36,function(){frBossHazard({kind:'ring',x:x,y:y,r:92+q*32,inner:45+q*29,color:'#e11d48',damage:d,status:{kind:'burn',duration:2600},delay:48,duration:22});b.hp=Math.min(b.maxHp,b.hp+Math.max(1,Math.round(b.maxHp*.008)));updateBossHp();});}
  else if(pattern==='frostBrothPaths'){const reach=Math.max(CW,CH)*1.3;for(let q=0;q<2;q++){const a=q?Math.PI*.72:Math.PI*.28;frBossHazard({kind:'line',x:CW/2-Math.cos(a)*reach,y:CH*.5-Math.sin(a)*reach,x2:CW/2+Math.cos(a)*reach,y2:CH*.5+Math.sin(a)*reach,w:48,color:'#7dd3fc',damage:d,status:{kind:'freeze',duration:1800},delay:55+q*8,duration:70});}}
  else if(pattern==='frostfireTwins'){const first=Math.random()<.5;for(let q=0;q<4;q++)frBossLater(b,q*38,function(){const ice=(q%2===0)===first,left=q%2===0;frBossHazard({kind:'rect',x:left?CW*.25:CW*.75,y:CH/2,w:CW/2,h:CH,color:ice?'#38bdf8':'#ef4444',damage:d,status:ice?{kind:'freeze',duration:1800}:{kind:'burn',duration:2600},delay:52,duration:25});});}
  else if(pattern==='seedlingPursuit'){for(let q=0;q<5;q++)frBossLater(b,q*24,function(){const x=player.x+(player.vx||0)*14,y=player.y+(player.vy||0)*14;frBossHazard({kind:'circle',x:x,y:y,r:38+q*2,color:'#84cc16',damage:d,status:{kind:'poison',duration:4200},delay:50,duration:50});});}
  else if(pattern==='thousandVines'){const reach=Math.max(CW,CH)*1.5;for(let q=0;q<3;q++)frBossLater(b,q*30,function(){const side=q%3,sx=side===0?0:side===1?CW:player.x,sy=side===2?0:player.y,tx=player.x+(player.vx||0)*12,ty=player.y+(player.vy||0)*12,a=Math.atan2(ty-sy,tx-sx);frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(a)*reach,y2:sy+Math.sin(a)*reach,w:28,color:c,damage:d,status:{kind:'poison',duration:4200},delay:48,duration:18});});}
  else if(pattern==='lanternMemory'){const cx=player.x,cy=player.y,offset=Math.random()*Math.PI*2;for(let q=0;q<6;q++){const a=offset+q*Math.PI/3,x=cx+Math.cos(a)*92,y=cy+Math.sin(a)*72;frBossLater(b,q*18,function(){frBossHazard({kind:'circle',x:x,y:y,r:34,color:'#fb923c',damage:d,status:{kind:'burn',duration:2400},delay:50,duration:16});});}}
  else if(pattern==='pumpkinTrain'){for(let q=0;q<3;q++)frBossLater(b,q*35,function(){const side=q%2?-1:1,src={x:side<0?-18:CW+18,y:165+q*(CH-300)/3,color:c};frBossShot(src,side<0?0:Math.PI,5,d,c,19,{oy:0,bounce:true,burn:true,status:{kind:'burn',duration:2400}});});}
  else if(pattern==='crispyFlyingKick'){for(let q=0;q<4;q++)frBossLater(b,q*56,function(){const a=frBossAim(b,true);frBossWarning(b,'line',42,{angle:a,color:'#fde68a'});frBossLater(b,42,function(){b._frDash={vx:Math.cos(a)*9.6,vy:Math.sin(a)*9.6,left:23,damage:d,trail:true,status:{kind:'burn',duration:2200}};});});}
  else if(pattern==='oilChainBlast'){const cx=player.x,cy=player.y,offset=Math.random()*Math.PI*2;for(let q=0;q<5;q++){const a=offset+q*Math.PI*2/5;frBossHazard({kind:'circle',x:cx+Math.cos(a)*78,y:cy+Math.sin(a)*68,r:40+q*3,color:'#a16207',damage:d,status:{kind:'burn',duration:3000},delay:48+q*10,duration:65});}}
  else if(pattern==='eelShadowSwim'){for(let pass=0;pass<2;pass++)for(let q=0;q<6;q++)frBossLater(b,pass*75+q*12,function(){const t=q/5,x=pass%2?CW*(1-t):CW*t,y=170+Math.sin(t*Math.PI*2+pass*Math.PI)*110;frBossHazard({kind:'circle',x:x,y:y,r:32,color:'#b45309',damage:d,status:{kind:'slow',duration:1900},delay:44,duration:38});});}
  else if(pattern==='kabayakiGrid'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH)*1.4;for(let q=0;q<4;q++)frBossLater(b,q*28,function(){const a=Math.PI*.2+q*Math.PI*.2;frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:27,color:'#d97706',damage:d,status:{kind:'slow',duration:1800},delay:48,duration:14});});}
  else if(pattern==='tripleWokFlip'){for(let q=0;q<3;q++)frBossLater(b,q*32,function(){frBossFan(b,7,4.8,d,.14,q%2?'#facc15':'#f97316',null,frBossAim(b,true)+(q-1)*.2);});}
  else if(pattern==='wokVolcano'){for(let q=0;q<4;q++)frBossLater(b,q*30,function(){const x=player.x+(player.vx||0)*12,y=player.y+(player.vy||0)*12;frBossHazard({kind:'circle',x:x,y:y,r:q===3?78:46,color:'#f97316',damage:d,status:{kind:'burn',duration:2600},delay:48,duration:18});if(q===3)frBossRadial({x:x,y:y,color:c},12,4,d,c,.12);});}
  else if(pattern==='undergroundHunt'){const tx=player.x+(player.vx||0)*18,ty=player.y+(player.vy||0)*18,a=Math.atan2(ty-b.y,tx-b.x),reach=Math.max(CW,CH)*1.4;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:42,color:c,damage:d,status:{kind:'poison',duration:3600},delay:50,duration:18});frBossLater(b,52,function(){b.x=Math.max(55,Math.min(CW-55,tx));b.y=Math.max(frBossSafeCenterY(b),Math.min(CH*.58,ty));frBossHazard({kind:'circle',x:b.x,y:b.y,r:86,color:c,damage:d,status:{kind:'poison',duration:3600},delay:38,duration:18});});}
  else if(pattern==='gutRingDevour'){const x=player.x,y=player.y;for(let q=0;q<4;q++)frBossLater(b,q*38,function(){frBossHazard({kind:'ring',x:x,y:y,r:205-q*34,inner:145-q*30,color:c,damage:d,status:{kind:'poison',duration:3500},delay:50,duration:24});});}
  else if(pattern==='durianIceLances'){const offset=Math.random()*Math.PI*2,reach=Math.max(CW,CH)*1.7;for(let q=0;q<6;q++)frBossLater(b,q*23,function(){const a=offset+q*Math.PI/3,sx=CW/2+Math.cos(a)*reach*.65,sy=CH/2+Math.sin(a)*reach*.65,aim=Math.atan2(player.y-sy,player.x-sx);frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(aim)*reach,y2:sy+Math.sin(aim)*reach,w:24,color:'#bae6fd',damage:d,status:{kind:'freeze',duration:1800},delay:46,duration:14});});}
  else if(pattern==='frostOrbHunt'){for(let q=0;q<2;q++){const a=frBossAim(b,true)+(q?-.34:.34),shot=frBossShot(b,a,3.2,d,'#7dd3fc',18,{turnAt:28,status:{kind:'slow',duration:2400}});shot.frBossOrb=true;}}
  else if(pattern==='mangoSnowWheel'){for(let q=0;q<5;q++)frBossLater(b,q*19,function(){frBossRadial(b,6,3.7,d,'#fbbf24',q*.34,{status:{kind:'slow',duration:1700}});});}
  else if(pattern==='smoothieCollapse'){for(let q=0;q<5;q++)frBossLater(b,q*28,function(){frBossLineRain(b,8,q%2?'#fde68a':'#bae6fd',d,(q*3+1)%8);});}
  else if(pattern==='friesIaido'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH)*1.4;for(let q=0;q<5;q++)frBossLater(b,q*25,function(){const a=-Math.PI*.34+q*Math.PI*.17;frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:25,color:'#fde047',damage:d,delay:45,duration:12});});}
  else if(pattern==='thousandFries'){for(let q=0;q<4;q++)frBossLater(b,q*38,function(){const gap=Math.floor(Math.random()*6);for(let i=0;i<7;i++)if(i!==gap&&i!==gap+1)frBossHazard({kind:'rect',x:(i+.5)*CW/7,y:CH*.48,w:20,h:CH*.82,color:'#fbbf24',damage:d,delay:90,minDelay:90,duration:22});});}
  else if(pattern==='noodleBindSweep'){for(let q=0;q<4;q++)frBossLater(b,q*30,function(){const left=q%2===0;frBossHazard({kind:'rect',x:left?-CW*.38:CW*1.38,y:CH*.52,w:CW*.72,h:54,color:'#ef4444',damage:d,status:{kind:'slow',duration:2200},delay:48,duration:100,moveX:left?CW/80:-CW/80});});}
  else if(pattern==='tomatoCoffin'){const gap=frBossWallGap();frBossWallWithGap(b,-1,'#dc2626',d,gap);frBossWallWithGap(b,1,'#dc2626',d,gap);frBossLater(b,w,function(){const safeRow=Math.floor(Math.random()*3),safeCol=Math.floor(Math.random()*2),safeA=safeRow*3+safeCol,safeB=safeA+1;for(let iy=0;iy<3;iy++)for(let ix=0;ix<3;ix++){const cell=iy*3+ix;if(cell===safeA||cell===safeB)continue;frBossHazard({kind:'rect',x:(ix+.5)*CW/3,y:120+(iy+.5)*(CH-170)/3,w:CW/3-18,h:(CH-170)/3-18,color:'#ef4444',damage:d,status:{kind:'slow',duration:2200},delay:90,minDelay:90,duration:20});}});}
  else if(pattern==='pastryLayerBurst'){for(let q=0;q<4;q++)frBossLater(b,q*32,function(){frBossHazard({kind:'ring',x:b.x,y:b.y,r:78+q*38,inner:42+q*35,color:'#f59e0b',damage:d,delay:48,duration:19});});}
  else if(pattern==='soupGeysers'){for(let q=0;q<5;q++)frBossLater(b,q*26,function(){const x=player.x+(player.vx||0)*10,y=player.y+(player.vy||0)*10;frBossHazard({kind:'circle',x:x,y:y,r:48,color:'#d97706',damage:d,status:{kind:'slow',duration:1700},delay:48,duration:72});});}
  else if(pattern==='holyChickenMarch'){for(let q=0;q<4;q++)frBossLater(b,q*24,function(){const a=frBossAim(b,true)+(q-1.5)*.35;frBossShot(b,a,4.6,d,'#fef08a',13,{curve:q%2?.014:-.014,turnAt:30,status:{kind:'attackDown',duration:1900}});});}
  else if(pattern==='creamCrossSeal'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH)*1.4;for(let q=0;q<3;q++)frBossLater(b,q*38,function(){const a=q*Math.PI/6;for(let k=0;k<2;k++){const aa=a+k*Math.PI/2;frBossHazard({kind:'line',x:cx-Math.cos(aa)*reach,y:cy-Math.sin(aa)*reach,x2:cx+Math.cos(aa)*reach,y2:cy+Math.sin(aa)*reach,w:32,color:'#fef08a',damage:d,status:{kind:'attackDown',duration:2200},delay:48,duration:15});}});}
  else if(pattern==='inkEightThrust'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH)*1.3,offset=Math.random()*Math.PI*2;for(let q=0;q<8;q++)frBossLater(b,q*16,function(){const a=offset+q*Math.PI/4,sx=cx+Math.cos(a)*reach,sy=cy+Math.sin(a)*reach;frBossHazard({kind:'line',x:sx,y:sy,x2:cx,y2:cy,w:25,color:'#8b5cf6',damage:d,status:{kind:'attackDown',duration:1900},delay:44,duration:13});});}
  else if(pattern==='deepSeaSlam'){for(let q=0;q<4;q++)frBossLater(b,q*32,function(){const left=q%2===0;frBossHazard({kind:'rect',x:left?CW*.18:CW*.82,y:CH*.52,w:CW*.36,h:CH*.78,color:'#4338ca',damage:d,status:{kind:'attackDown',duration:1800},delay:46,duration:22});});}
  else if(pattern==='missileLock'){for(let q=0;q<4;q++)frBossLater(b,q*28,function(){const x=player.x+(player.vx||0)*14,y=player.y+(player.vy||0)*14;frBossHazard({kind:'circle',x:x,y:y,r:48+q*3,color:'#22d3ee',damage:d,delay:48,duration:17});});}
  else if(pattern==='railClamp'){const maxWidth=Math.max(72,(CW-frBossSafeCorridor()-player.radius*2)/2);for(let q=0;q<3;q++)frBossLater(b,q*44,function(){const width=Math.min(maxWidth,CW*(.20+q*.05));frBossHazard({kind:'rect',x:width/2,y:CH*.52,w:width,h:CH*.78,color:'#06b6d4',damage:d,status:{kind:'slow',duration:1800},delay:90,minDelay:90,duration:18});frBossHazard({kind:'rect',x:CW-width/2,y:CH*.52,w:width,h:CH*.78,color:'#06b6d4',damage:d,status:{kind:'slow',duration:1800},delay:90,minDelay:90,duration:18});});frBossLater(b,150,function(){frBossHazard({kind:'line',x:CW/2,y:100,x2:CW/2,y2:CH,w:30,color:'#67e8f9',damage:d,delay:90,minDelay:90,duration:16});});}
  else if(pattern==='espressoSweep'){const firstGap=Math.floor(Math.random()*4);for(let q=0;q<3;q++)frBossLater(b,q*44,function(){const gap=(firstGap+q)%4;for(let i=0;i<5;i++){if(i===gap||i===gap+1)continue;frBossHazard({kind:'rect',x:(i+.5)*CW/5,y:CH/2,w:CW/5-14,h:CH,color:'#78350f',damage:d,status:{kind:'slow',duration:1900},delay:90,minDelay:90,duration:18});}});}
  else if(pattern==='crownBounce'){frBossLater(b,w,function(){frBossFan(b,3,4.5,d,.32,'#f472b6',{radius:14,bounce:true,splitAt:46,splitCount:5,splitSpeed:3.6},frBossAim(b,true));});}
  else if(pattern==='hornQuake'){const a=frBossAim(b,true);frBossWarning(b,'line',50,{angle:a,color:'#fca5a5'});frBossLater(b,50,function(){b._frDash={vx:Math.cos(a)*9.2,vy:Math.sin(a)*9.2,left:26,damage:d};});frBossLater(b,92,function(){frBossHazard({kind:'ring',x:b.x,y:b.y,r:175,inner:82,color:c,damage:d,delay:42,duration:28});});}
  else if(pattern==='woolPrison'){const cx=player.x,cy=player.y,gap=Math.floor(Math.random()*7),open=new Set([gap,(gap+1)%14,(gap+2)%14,(gap+7)%14,(gap+8)%14,(gap+9)%14]);for(let i=0;i<14;i++){if(open.has(i))continue;const a=Math.PI*2*i/14;frBossHazard({kind:'circle',x:cx+Math.cos(a)*128,y:cy+Math.sin(a)*128,r:22,color:c,damage:d,status:{kind:'slow',duration:2200},delay:90,minDelay:90,duration:85});}frBossLater(b,120,function(){frBossRadial({x:cx,y:cy,color:c},10,3.8,d,c,.2);});}
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
  else if(pattern==='noodleBindGrid'){const castGrid=function(row,col){const safeA=row*3+col,safeB=safeA+1;for(let iy=0;iy<3;iy++)for(let ix=0;ix<3;ix++){const cell=iy*3+ix;if(cell===safeA||cell===safeB)continue;frBossHazard({kind:'rect',x:(ix+.5)*CW/3,y:110+(iy+.5)*(CH-150)/3,w:CW/3-16,h:(CH-150)/3-16,color:c,damage:d,status:{kind:'slow',duration:2100},delay:90,minDelay:90,duration:18});}};const firstRow=Math.floor(Math.random()*3),firstCol=Math.floor(Math.random()*2);castGrid(firstRow,firstCol);frBossLater(b,135,function(){castGrid((firstRow+1)%3,firstCol?0:1);});}
  else if(pattern==='pastryCollapse'){const cx=player.x,cy=player.y;frBossHazard({kind:'circle',x:cx,y:cy,r:92,color:c,damage:d,delay:54,duration:24});frBossLater(b,82,function(){frBossHazard({kind:'ring',x:cx,y:cy,r:220,inner:95,color:'#f59e0b',damage:d,delay:42,duration:26});});frBossLater(b,132,function(){frBossRadial({x:cx,y:cy,color:c},12,4,d,c,.16);});}
  else if(pattern==='creamBaptism'){const maxWidth=Math.max(72,(CW-frBossSafeCorridor()-player.radius*2)/2);for(let q=0;q<4;q++){const width=Math.min(maxWidth,54+q*24),delay=90+q*24;frBossHazard({kind:'rect',x:width/2,y:CH/2,w:width,h:CH,color:c,damage:d,status:{kind:'attackDown',duration:3000},delay:delay,minDelay:90,duration:16});frBossHazard({kind:'rect',x:CW-width/2,y:CH/2,w:width,h:CH,color:c,damage:d,status:{kind:'attackDown',duration:3000},delay:delay,minDelay:90,duration:16});}}
  else if(pattern==='eightArmCombo'){const cx=player.x,cy=player.y,reach=Math.max(CW,CH)*1.2;for(let q=0;q<8;q++){const a=q*Math.PI/4;frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:26,color:c,damage:d,delay:38+q*8,duration:11});}}
  else if(pattern==='pressureCannon'){for(let q=0;q<3;q++)frBossLater(b,q*44,function(){const a=frBossAim(b,true),reach=Math.max(CW,CH)*1.55;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:42-q*8,color:'#67e8f9',damage:d,status:q===2?{kind:'slow',duration:2400}:null,delay:48-q*7,minDelay:24,duration:16});});}
  else if(pattern==='hiddenSpark'){frBossWarning(b,'cone',42,{angle:frBossAim(b),spread:.38});frBossLater(b,42,function(){const a=frBossAim(b,true),count=b._frStage11Rage?4:3;frBossFan(b,count,4.1,d,.2,c,{radius:7,status:{kind:'paralyze',duration:1000}},a);});}
  else if(pattern==='thunderMarks'){const count=b._frStage11Rage?5:4;for(let q=0;q<count;q++)frBossLater(b,q*23,function(){frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*72,y:player.y+(Math.random()-.5)*58,r:42,color:'#fde047',damage:d,status:{kind:'paralyze',duration:1000},delay:46,duration:12});});}
  else if(pattern==='cloakDash'){for(let q=0;q<3;q++)frBossLater(b,q*62,function(){const a=frBossAim(b,true);frBossWarning(b,'line',38,{angle:a,color:'#fde047'});frBossLater(b,38,function(){const speed=9*(b._frStage11Rage?1.1:1);b._frDash={vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,left:22,damage:d,status:{kind:'paralyze',duration:1000}};});});}
  else if(pattern==='staticCage'){const gap=Math.floor(Math.random()*12);for(let i=0;i<12;i++){if(i===gap||i===(gap+1)%12)continue;const a=Math.PI*2*i/12;frBossHazard({kind:'circle',x:player.x+Math.cos(a)*132,y:player.y+Math.sin(a)*132,r:23,color:'#fde047',damage:d,status:{kind:'paralyze',duration:1000},delay:58,duration:100});}frBossLater(b,82,function(){frBossRadial(b,10,3.5,d,c,.2);});}
  else if(pattern==='fiveLaserCannons'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+150);for(let q=0;q<5;q++)frBossLater(b,q*24,function(){const a=frBossAim(b,true),reach=Math.max(CW,CH)*1.55;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:13,color:'#fde047',damage:d,status:{kind:'paralyze',duration:1000},delay:30,minDelay:24,duration:10});});}
  else if(pattern==='vajraFan'){frBossWarning(b,'cone',44,{angle:frBossAim(b,true),spread:.58});frBossLater(b,44,function(){frBossFan(b,5,5,d,.15,c,{radius:8},frBossAim(b,true));});}
  else if(pattern==='heavenLances'){for(let q=0;q<3;q++)frBossLater(b,q*64,function(){const a=frBossAim(b,true);frBossWarning(b,'line',46,{angle:a,color:'#38bdf8'});frBossLater(b,46,function(){frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*CH*1.5,y2:b.y+Math.sin(a)*CH*1.5,w:38,color:'#7dd3fc',damage:d,status:{kind:'paralyze',duration:1000},delay:0,duration:18});});});}
  else if(pattern==='warDrumRings'){for(let q=0;q<4;q++)frBossLater(b,q*32,function(){frBossRadial(b,12,3.2+q*.28,d,c,q*.23,q===3?{status:{kind:'paralyze',duration:1000}}:null);});}
  else if(pattern==='armorCounter'){b._frArmorCounterUntil=b.timer+105;addText('雷鎧反震',b.x,b.y-104,'#7dd3fc',15);for(let q=0;q<3;q++)frBossLater(b,48+q*26,function(){frBossRadial(b,10,3.7,d,c,q*.3);});}
  else if(pattern==='sixWayLances'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+205);const offset=Math.random()*Math.PI*2;for(let q=0;q<6;q++)frBossLater(b,q*30,function(){const a=offset+Math.PI*2*q/6,sx=CW/2+Math.cos(a)*Math.max(CW,CH),sy=CH/2+Math.sin(a)*Math.max(CW,CH),tx=player.x+(player.vx||0)*12,ty=player.y+(player.vy||0)*12,aim=Math.atan2(ty-sy,tx-sx),reach=Math.max(CW,CH)*1.8;frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(aim)*reach,y2:sy+Math.sin(aim)*reach,w:17,color:'#7dd3fc',damage:d,status:{kind:'paralyze',duration:1000},delay:32,minDelay:24,duration:11});});}
  else if(pattern==='orbitLances'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+185);for(let q=0;q<6;q++)frBossLater(b,q*26,function(){const orbit=Math.PI*2*q/6+b.timer*.04,sx=b.x+Math.cos(orbit)*76,sy=b.y+Math.sin(orbit)*76,aim=Math.atan2(player.y-sy,player.x-sx),reach=Math.max(CW,CH)*1.5;frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(aim)*reach,y2:sy+Math.sin(aim)*reach,w:16,color:'#bae6fd',damage:d,status:{kind:'paralyze',duration:1000},delay:30,minDelay:24,duration:10});});}
  else if(pattern==='lanceRush'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+285);for(let q=0;q<5;q++)frBossLater(b,q*52,function(){const a=frBossAim(b,true);frBossWarning(b,'line',28,{x:b.x,y:b.y,angle:a,color:'#7dd3fc'});frBossLater(b,28,function(){b._frDash={vx:Math.cos(a)*10,vy:Math.sin(a)*10,left:20,damage:d,status:{kind:'paralyze',duration:1000}};});});}
  else if(pattern==='lanceSweep'){
    const lance=frThunderLance(b);if(!lance)return;const side=b.x<CW/2?CW-38:38,base=Math.PI/2,start=base-Math.PI/3;
    lance.skillUntil=b.timer+108;lance.mode='skill';lance.x=side;lance.y=Math.max(155,b.y);b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+108);frThunderExactWarning(b,'cone',60,{x:b.x,y:b.y,angle:base,spread:Math.PI/3,color:'#fde047'});frThunderLanceVisual(b,'sweep',108,{x:side,y:lance.y,startAngle:start,endAngle:base+Math.PI/3});
    frBossLater(b,60,function(){for(let q=0;q<9;q++)frBossLater(b,q*5,function(){if(lance.dead)return;const a=start+(Math.PI*2/3)*(q/8),reach=Math.max(CW,CH)*1.3;frBossHazard({kind:'line',x:b.x,y:b.y,x2:b.x+Math.cos(a)*reach,y2:b.y+Math.sin(a)*reach,w:28,color:'#fde047',damage:Math.round(d*.72),status:{kind:'paralyze',duration:650},delay:0,duration:8});});});
  }
  else if(pattern==='lanceRainArray'){
    const lance=frThunderLance(b);if(!lance)return;lance.skillUntil=b.timer+245;lance.mode='skill';lance.x=b.x-76;lance.y=112;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+245);
    for(let q=0;q<4;q++)frBossLater(b,q*30,function(){if(lance.dead)return;const sx=q<3?CW*(.2+q*.3):lance.x,sy=105,tx=player.x+(player.vx||0)*10,ty=player.y+(player.vy||0)*10,a=Math.atan2(ty-sy,tx-sx),reach=Math.max(CW,CH)*1.4;frThunderExactWarning(b,'line',60,{x:sx,y:sy,angle:a,color:q===3?'#ffffff':'#7dd3fc'});frThunderLanceVisual(b,'drop',82,{x:sx,y:sy,angle:a,trueLance:q===3});frBossLater(b,60,function(){if(lance.dead)return;const width=q===3?38:24;frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(a)*reach,y2:sy+Math.sin(a)*reach,w:width,color:q===3?'#fde047':'#7dd3fc',damage:q===3?Math.round(d*1.45):Math.round(d*.72),status:{kind:'paralyze',duration:q===3?1000:650},delay:0,duration:12});if(q===3)frThunderLanceKnockback(sx,sy,a,width,85);});});
  }
  else if(pattern==='lanceBoundary'){
    const lance=frThunderLance(b);if(!lance)return;const tx=Math.max(70,Math.min(CW-70,player.x+(player.vx||0)*35)),ty=Math.max(170,Math.min(CH-85,player.y+(player.vy||0)*35));lance.skillUntil=b.timer+300;lance.mode='skill';b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+90);frThunderExactWarning(b,'circle',60,{x:tx,y:ty,r:62,color:'#fde047'});frThunderLanceVisual(b,'pin',60,{x:lance.x,y:lance.y,targetX:tx,targetY:ty});frBossLater(b,60,function(){if(lance.dead)return;lance.mode='pinned';lance.skillUntil=0;lance.x=tx;lance.y=ty;lance.pinnedUntil=b.timer+240;lance.nextPulse=b.timer+20;burst(tx,ty,'#fde047',24);});
  }
  else if(pattern==='tripleLanceThrust'){
    const lance=frThunderLance(b);if(!lance)return;lance.skillUntil=b.timer+250;lance.mode='skill';b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+250);
    for(let q=0;q<3;q++)frBossLater(b,q*72,function(){if(lance.dead)return;const sx=player.x,sy=105,tx=player.x+(player.vx||0)*12,ty=player.y,a=Math.atan2(ty-sy,tx-sx),reach=Math.max(CW,CH)*1.3;frThunderExactWarning(b,'line',48,{x:sx,y:sy,angle:a,color:'#fde047'});frThunderLanceVisual(b,'thrust',70,{x:sx,y:sy,angle:a});frBossLater(b,48,function(){if(lance.dead)return;frBossHazard({kind:'line',x:sx,y:sy,x2:sx+Math.cos(a)*reach,y2:sy+Math.sin(a)*reach,w:34,color:'#fde047',damage:Math.round(d*1.08),status:{kind:'paralyze',duration:800},delay:0,duration:12});});});
  }
  else if(pattern==='livingLightning'){frThunderHuntSequence(b,d);}
  else if(pattern==='ninefoldJudgment'){for(let q=0;q<9;q++)frBossLater(b,q*15,function(){frBossHazard({kind:'circle',x:player.x+(Math.random()-.5)*120,y:player.y+(Math.random()-.5)*95,r:q===8?72:36,color:'#facc15',damage:d,status:{kind:'paralyze',duration:1000},delay:40,duration:11});});}
  else if(pattern==='thunderDomain'){frBossHazard({kind:'circle',x:CW/2,y:CH*.56,r:105,color:'#fef08a',damage:d,status:{kind:'paralyze',duration:1000},delay:55,duration:25});frBossLater(b,105,function(){frBossHazard({kind:'ring',x:CW/2,y:CH*.56,r:230,inner:108,color:'#facc15',damage:d,status:{kind:'paralyze',duration:1000},delay:48,duration:28});});frBossLater(b,180,function(){frBossRadial(b,16,4,d,c,.1);});}
  else if(pattern==='finalThunderstorm'){for(let q=0;q<10;q++)frBossLater(b,q*16,function(){frBossHazard({kind:'circle',x:30+Math.random()*(CW-60),y:125+Math.random()*(CH-185),r:q>7?64:38,color:'#facc15',damage:d,status:{kind:'paralyze',duration:1000},delay:42,duration:12});});for(let q=0;q<4;q++)frBossLater(b,45+q*40,function(){frBossRadial(b,14,3.8,d,c,q*.31);});}
  else if(pattern==='crossThunderPillars'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+110);const base=Math.floor(Math.random()*8)*Math.PI/4;for(let q=0;q<2;q++){const a=base+q*(Math.PI/2+Math.PI/4),cx=CW*(.32+.36*Math.random()),cy=CH*(.38+.3*Math.random()),reach=Math.max(CW,CH)*1.5;frBossLater(b,q*36,function(){frBossHazard({kind:'line',x:cx-Math.cos(a)*reach,y:cy-Math.sin(a)*reach,x2:cx+Math.cos(a)*reach,y2:cy+Math.sin(a)*reach,w:34,color:'#fef08a',damage:d,status:{kind:'paralyze',duration:1000},delay:32,minDelay:24,duration:22});});}}
  else if(pattern==='delayedThunderOrbs'){b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+175);for(let q=0;q<3;q++)frBossLater(b,q*46,function(){const tx=player.x+(player.vx||0)*10,ty=player.y+(player.vy||0)*10,a=Math.atan2(ty-b.y,tx-b.x);frBossWarning(b,'line',26,{angle:a,color:'#fef08a'});frBossLater(b,26,function(){frBossShot(b,a,4.5,d,'#fef08a',16,{stopX:tx,stopY:ty,explodeColor:'#facc15',explodeDamage:Math.round(d*1.15),status:{kind:'paralyze',duration:1000}});});});}
  else if(pattern==='thunderClawSlam'){
    const hand=frThunderHand(b,'leftHand');if(!hand)return;const tx=Math.max(55,Math.min(CW-55,player.x+(player.vx||0)*20)),ty=Math.max(165,Math.min(CH-70,player.y+(player.vy||0)*20));hand.mode='slam';hand.actionEnd=b.timer+92;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+100);frThunderExactWarning(b,'circle',60,{x:tx,y:ty,r:62,color:'#fde047'});frBossLater(b,60,function(){if(hand.dead)return;hand.x=tx;hand.y=ty;frBossHazard({kind:'circle',x:tx,y:ty,r:62,color:'#fde047',damage:Math.round(d*1.15),status:{kind:'paralyze',duration:700},delay:0,duration:14});for(let side=-1;side<=1;side+=2)for(let q=0;q<4;q++)frBossLater(b,q*14,function(){frBossShot({x:tx+side*q*38,y:ty,color:'#fde047'},side<0?Math.PI:0,4.2,Math.round(d*.65),'#fde047',10,{status:{kind:'paralyze',duration:500}});});burst(tx,ty,'#fde047',24);});
  }
  else if(pattern==='thunderClawHunt'){
    const hand=frThunderHand(b,'leftHand');if(!hand)return;const home=frThunderHandHome(b,hand);hand.mode='hunt';hand.x=home.x;hand.y=home.y;hand.huntStart=b.timer+24;hand.actionEnd=hand.huntStart+180;hand.caught=false;hand.vx=0;hand.vy=0;b._frBusyUntil=Math.max(b._frBusyUntil,hand.actionEnd+10);addText('雷爪追獵',hand.x,hand.y-50,'#fde047',14,-.35);
  }
  else if(pattern==='thunderPalmBarrier'){
    const hand=frThunderHand(b,'leftHand');if(!hand)return;hand.mode='barrier';hand.actionEnd=b.timer+120;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+130);addText('雷掌屏障',hand.x,hand.y-50,'#fef08a',14,-.35);
  }
  else if(pattern==='palmThunderCannon'){
    const hand=frThunderHand(b,'rightHand');if(!hand)return;hand.mode='cannon';hand.actionEnd=b.timer+210;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+220);hazards.push(new FrThunderTrackingLaser(b,hand,Math.round(d*.82)));addText('掌心雷砲',hand.x,hand.y-50,'#fde047',14,-.35);
  }
  else if(pattern==='thunderSealHeal'){
    const hand=frThunderHand(b,'rightHand');if(!hand)return;hand.mode='heal';hand.channelEnd=b.timer+240;hand.nextPulse=b.timer+60;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+250);addText('雷印治癒',hand.x,hand.y-50,'#86efac',14,-.35);
  }
  else if(pattern==='thunderInfusion'){
    const hand=frThunderHand(b,'rightHand');if(!hand)return;hand.mode='infuse';hand.channelEnd=b.timer+120;b._frBusyUntil=Math.max(b._frBusyUntil,b.timer+130);addText('雷力灌注',hand.x,hand.y-50,'#fde047',14,-.35);
  }
  else if(pattern==='thunderPalmClap'){
    const left=frThunderHand(b,'leftHand'),right=frThunderHand(b,'rightHand');if(!left||!right)return;const coreX=b.x,coreY=b.y+100,charge=90,beamDuration=105;b._frClapCoreX=coreX;b._frClapCoreY=coreY;b._frClapStart=b.timer;b._frClapFireAt=b.timer+charge;b._frClapEnd=b._frClapFireAt+beamDuration;left.mode='clap';right.mode='clap';left.actionEnd=right.actionEnd=b._frClapEnd;b._frBusyUntil=Math.max(b._frBusyUntil,b._frClapEnd+10);frThunderExactWarning(b,'line',charge,{x:coreX,y:coreY,angle:Math.PI/2,color:'#fde047'});frBossLater(b,charge,function(){if(left.dead||right.dead)return;b.y=Math.max(frBossSafeCenterY(b),b.y-12);frBossHazard({kind:'line',x:coreX,y:coreY,x2:coreX,y2:CH+80,w:58,color:'#fde047',damage:Math.round(d*1.15),status:{kind:'paralyze',duration:850},delay:0,duration:beamDuration});burst(coreX,coreY,'#fde047',30);});
  }
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
  jazzSyncopation:'爵士切分',mochaSpotlight:'摩卡聚光',jellyWall:'果凍彈牆',crownSlam:'王冠重壓',returningCharge:'回馬魔衝',cleaverCollapse:'屠刀崩陣',hornCyclone:'羊角旋風',woolCloudSiege:'棉雲圍場',
  bloodBatHunt:'血蝠追魂',bloodMoonBroth:'赤湯血月',frostBrothPaths:'寒湯冰徑',frostfireTwins:'冰火雙生',seedlingPursuit:'苦籽追芽',thousandVines:'萬藤穿心',lanternMemory:'鬼燈記憶陣',pumpkinTrain:'南瓜列車',
  crispyFlyingKick:'炸衣飛踢',oilChainBlast:'油鍋連爆',eelShadowSwim:'鰻影迴游',kabayakiGrid:'蒲燒電網',tripleWokFlip:'爆炒三翻',wokVolcano:'鍋氣火山',undergroundHunt:'地底獵線',gutRingDevour:'腸環吞噬',
  durianIceLances:'榴槤冰槍',frostOrbHunt:'凍氣追獵',mangoSnowWheel:'芒果雪輪',smoothieCollapse:'冰沙崩塌',friesIaido:'薯刃居合',thousandFries:'千本薯雨',noodleBindSweep:'麵帶縛步',tomatoCoffin:'番茄棺陣',
  pastryLayerBurst:'酥皮爆層',soupGeysers:'濃湯噴泉',holyChickenMarch:'聖雞巡禮',creamCrossSeal:'奶油十字封印',inkEightThrust:'墨影八突',deepSeaSlam:'深海拍岸',missileLock:'飛彈鎖定',railClamp:'磁軌鉗殺',
  espressoSweep:'濃縮咖啡掃射',crownBounce:'王冠彈跳',hornQuake:'震角圍獵',woolPrison:'羊毛縮圈',boilingBloodHunt:'沸血追獵',frostfireCorridor:'冰火迴廊',
  bitterVineChase:'苦藤追根',pumpkinChainBurst:'南瓜連爆',fryerShockDrop:'油鍋震落',sauceRushTrail:'蒲燒疾走',wokFlipBurst:'大火翻鍋',burrowAmbush:'地底伏擊',
  frostThornWheel:'寒刺輪轉',syrupAvalanche:'糖漿雪崩',swordNet:'劍網封步',noodleBindGrid:'麵線追縛',pastryCollapse:'酥皮崩鍋',creamBaptism:'奶油洗禮',
  eightArmCombo:'八臂連拍',pressureCannon:'高壓水砲',
  thunderMarks:'雷印追獵',cloakDash:'披風雷閃',staticCage:'靜電牢籠',fiveLaserCannons:'五連雷射砲',heavenLances:'天雷槍陣',warDrumRings:'雷鼓震環',armorCounter:'雷鎧反震',sixWayLances:'六合雷槍',orbitLances:'雷槍輪陣',lanceRush:'雷槍五突',lanceSweep:'雷槍橫掃',lanceRainArray:'雷槍落陣',lanceBoundary:'雷槍釘界',tripleLanceThrust:'三連突刺',ninefoldJudgment:'九重天罰',thunderDomain:'雷神領域',finalThunderstorm:'終焉雷暴',crossThunderPillars:'八方雷柱',delayedThunderOrbs:'雷光爆彈',thunderClawSlam:'雷爪拍地',thunderClawHunt:'雷爪追獵',thunderPalmBarrier:'雷掌屏障',palmThunderCannon:'掌心雷砲',thunderSealHeal:'雷印治癒',thunderInfusion:'雷力灌注',thunderPalmClap:'雷掌合璧'
};
const FR_BOSS_NORMAL_LABELS={
  cocoaFan:'可可扇射',jellyBounce:'彈跳果凍',hornFan:'魔角三連',woolSplit:'分裂羊毛',chiliCurve:'辣椒蝠刃',brothTriple:'雪湯三珠',crossCrescent:'苦月交叉',leadBurst:'預判鬼火',chickenShotgun:'唐揚散射',sauceCurve:'蒲燒雙刃',riceFan:'米粒扇射',ringShot:'腸圈彈',iceFan:'榴槤冰片',turnTwin:'芒果折射',crossSlash:'薯條交叉斬',noodleCurve:'麵帶曲射',flakeCross:'酥皮十字',creamSplit:'奶油分裂彈',inkFan:'墨汁三連',clawCrescent:'機爪雙月',hiddenSpark:'隱雷三閃',vajraFan:'金剛雷扇',livingLightning:'閃電追獵'
};
function frThunderApplyPhase(b,phase,refill){
  const root=b._frRootDef||b._frDef,kits=root.phaseKits||[],kit=kits[phase]||kits[0];
  b._frThunderPhase=phase;b._frDef=Object.assign({},root,kit);b.name='小雷神';b.color=kit.color;
  b._frSkillBag=frBossShuffle(kit.skills);b._frNormalLabel=FR_BOSS_NORMAL_LABELS[kit.normal]||'雷擊';
  b._frAttackCd=frBossTempo(stage).normalCd;b._frAttackCount=0;b._frSkillCastCount=0;b._frBusyUntil=b.timer+45;b._frEvents=[];b._frWarnings=[];b._frDash=null;b._frTether=null;b._frArmorCounterUntil=0;
  if(refill)frBossFxPush(b,'rage',{duration:82,color:kit.color});
  if(refill){b.hp=b.maxHp;b.shield=b.maxShield;b.shieldBroken=false;b.shieldResetTimer=10*60;updateBossHp();updateBossShield();}
  frThunderImage('phase'+(phase+1));
  if(b._frFullEncounter&&phase===0){frThunderImage('transition12');frThunderImage('phase2');}
  if(b._frFullEncounter&&phase===1){frThunderImage('transition23');frThunderImage('phase3');}
  frThunderSpawnRelics(b);
  frThunderSpawnHands(b);
  const name=document.getElementById('bossName'),fill=document.getElementById('bossFill'),shieldBar=document.getElementById('bossShieldBar');if(name)name.textContent='⚡ 小雷神';
  if(fill)fill.style.background=phase===0?'linear-gradient(90deg,#8b5cf6,#c4b5fd)':phase===1?'linear-gradient(90deg,#0284c7,#7dd3fc)':'linear-gradient(90deg,#eab308,#fef08a)';
  if(shieldBar)shieldBar.style.background=phase===0?'linear-gradient(90deg,#c4b5fd,#8b5cf6)':phase===1?'linear-gradient(90deg,#7dd3fc,#0284c7)':'linear-gradient(90deg,#fef08a,#eab308)';
}
function frThunderStartTransition(b,nextPhase){
  b.hp=0;updateBossHp();b._frEvents=[];b._frWarnings=[];b._frDash=null;b._frTether=null;b._frBusyUntil=Infinity;
  const discardedRelics=nextPhase===2&&Array.isArray(b._frRelics)?b._frRelics.filter(function(r){return r&&!r.dead;}).map(function(r){return{kind:r.kind,x:r.x,y:r.y};}):[];
  b._frRelics=[];
  b._frHands=[];
  eBullets=[];enemies=enemies.filter(function(e){return !e||!e._frBossSummoned;});
  const gathered=nextPhase===1?hazards.filter(function(h){return h&&h._frThunderChaser&&!h.dead;}).slice(0,2).map(function(h,index){return{x:h.x,y:h.y,index:index};}):[];
  hazards=[];
  while(nextPhase===1&&gathered.length<2)gathered.push({x:gathered.length?CW-58:58,y:150+gathered.length*55,index:gathered.length});
  if(nextPhase===1){frThunderRelicImage('lance');frThunderRelicImage('shield');}
  else{frThunderRelicImage('leftHand');frThunderRelicImage('rightHand');}
  b._frTransition={from:b._frThunderPhase,to:nextPhase,start:b.timer,duration:nextPhase===1?240:270,orbs:gathered,discardedRelics:discardedRelics,lineAt:42,lineSpoken:false,relicMorphAt:nextPhase===1?162:174,bossMorphAt:nextPhase===1?198:174};
}
function frThunderUpdateTransition(b){
  const tr=b._frTransition;if(!tr)return false;
  const age=b.timer-tr.start;
  if(!tr.lineSpoken&&age>=tr.lineAt){tr.lineSpoken=true;frBossSpeak(b,tr.to===1?b._frRootDef.phase12:b._frRootDef.phase23,'#fde047');}
  if(b.timer-tr.start>=tr.duration){b._frTransition=null;frThunderApplyPhase(b,tr.to,true);addText('力量完全恢復',b.x,b.y-105,'#86efac',15,-.35);}
  return true;
}
function frThunderStartFinalDeath(b){
  if(b._frFinalDeath)return;
  b.hp=0;b.shield=0;b.shieldBroken=true;updateBossHp();updateBossShield();
  b._frEvents=[];b._frWarnings=[];b._frDash=null;b._frTether=null;b._frBusyUntil=Infinity;eBullets=[];hazards=[];
  b._frFinalDeath={start:b.timer,duration:210,beamAt:126,completed:false};
  frBossSpeak(b,b._frRootDef.death,'#fde047');
}
function frThunderUpdateFinalDeath(b){
  const death=b._frFinalDeath;if(!death)return false;
  const age=b.timer-death.start;
  if(age===death.beamAt){burst(b.x,b.y,'#fde047',32);burst(b.x,b.y,'#ffffff',20);if(Array.isArray(b._frHands))b._frHands.forEach(function(hand){hand.dead=true;});}
  if(age>=death.duration&&!death.completed){
    death.completed=true;b._frFinalDeath=null;b.hp=1;b.shield=0;b.shieldBroken=true;
    frBaseBoss.prototype.takeDamage.call(b,b.maxHp*4,false);
  }
  return true;
}
function frThunderTakeDamage(b,amount,isQa){
  if(b._frTransition||b._frFinalDeath||b._defeated)return;
  if(b._frDirectPhaseTest||!b._frFullEncounter||b._frThunderPhase>=2){
    const wasDefeated=b._defeated,ratioBefore=b.hp/Math.max(1,b.maxHp);
    if(b._frThunderPhase>=2&&b.shield<=0&&b.hp-(Math.max(1,Number(amount)||1)*(typeof atkMult==='number'?atkMult:1))<=0){frThunderStartFinalDeath(b);return;}
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
  frBossWarning(b,'circle',FR_STAGE11_THUNDER.closeWarn,{x:pulseX,y:pulseY,r:FR_STAGE11_THUNDER.closeRadius,color:'#fde047'});
  addText('⚠ 雷衣反衝',b.x,b.y-102,'#fde047',14,-.35);
  frBossLater(b,FR_STAGE11_THUNDER.closeWarn,function(){
    if(b._defeated)return;
    const dx=player.x-pulseX,dy=player.y-pulseY,dist=Math.hypot(dx,dy)||1;
    burst(pulseX,pulseY,'#fde047',22);
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
  const pool=FR_BOSS_BY_MAP[currentBgIdx]||FR_BOSS_BY_MAP[0],requested=SAVE&&SAVE.bossDuel&&SAVE.testBossId?FR_BOSS_CATALOG.find(function(item){return item.id===SAVE.testBossId;}):null;
  b._frDef=requested||pool[Math.floor(Math.random()*pool.length)];b.name=b._frDef.name;b.color=b._frDef.color;
  b.targetY=frBossSafeCenterY(b);b._frEntered=false;
  b._frEvents=[];b._frWarnings=[];b._frBusyUntil=0;b._frAttackCd=frBossTempo(stage).normalCd;b._frAttackCount=0;b._frSkillCastCount=0;b._frMasterSkillUnlocked=!b._frFinal;b._frSignatureReady=false;b._frSkillBag=frBossShuffle(frBossHighStageSkillPool(b));b._frAnimStart=0;b._frAnimUntil=0;b._frDash=null;b._frTether=null;b._frSummonWave=0;b._frHasSummoned=false;b._frSummonEmptySince=0;b._frNextSummon=frBossMinionsDisabled(b)?Infinity:(b.timer||0)+(Number(stage)>=22?300:Number(stage)>=16?360:Number(stage)>=11?420:540);b._frHuntCursor=0;
  frBossFx.length=0;
  b._frSkillLabels=FR_BOSS_SKILL_LABELS;b._frNormalLabel=FR_BOSS_NORMAL_LABELS[b._frDef.normal]||'普通攻擊';
  if(b._frFinal){
    const requestedThunderPhase=SAVE&&SAVE.testMode&&SAVE.bossDuel&&SAVE.testBossId==='little-thunder-god'?Math.max(0,Math.min(2,Math.round(Number(SAVE.testThunderPhase)||0))):0;
    b._frDirectPhaseTest=requestedThunderPhase>0;
    b._frTestThunderPhase=requestedThunderPhase;
    b._frStage11Enhanced=Number(stage)===11&&!b._frDirectPhaseTest;
    b._frFullEncounter=Number(stage)>=FR_BALANCE.progression.maxStage||b._frDirectPhaseTest;
    b._frRootDef=b._frDef;frThunderApplyPhase(b,requestedThunderPhase,false);
    if(b._frStage11Enhanced){
      const firstFormKit=(b._frRootDef.phaseKits&&b._frRootDef.phaseKits[0])||{};
      b._frDef=Object.assign({},b._frRootDef,firstFormKit);
      b._frSkillBag=frBossShuffle((firstFormKit.skills||b._frRootDef.skills||[]).slice());
      b._frNormalLabel=FR_BOSS_NORMAL_LABELS[firstFormKit.normal||b._frRootDef.normal]||'隱雷三閃';
      b._frStage11SkillKitApplied=true;
      b.maxHp=Math.round(b.maxHp*FR_STAGE11_THUNDER.hp);b.hp=b.maxHp;
      b.maxShield=Math.round(b.maxShield*FR_STAGE11_THUNDER.shield);b.shield=b.maxShield;
      b._frAttackCd=frBossTempo(stage).normalCd;b._frStage11Rage=false;b._frStage11CloseFrames=0;b._frStage11CloseReadyAt=0;
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
  if(b._frFinal&&frThunderUpdateFinalDeath(b))return;
  if(b._frFinal&&frThunderUpdateTransition(b))return;
  if(b._frStage11Enhanced&&!b._frStage11Rage&&b.hp<=b.maxHp*.5){b._frStage11Rage=true;addText('雷幕躁動',b.x,b.y-105,'#c4b5fd',16,-.35);burst(b.x,b.y,'#a78bfa',28);frBossFxPush(b,'rage',{duration:72,color:'#a78bfa'});}
  const frFormSlow=typeof frCurrentSlowFactor==='function'?frCurrentSlowFactor(b,performance.now()):(b._frSlowUntil&&performance.now()<b._frSlowUntil?Math.max(.08,Math.min(1,b._frSlowFactor||.45)):1);
  const safeY=frBossSafeCenterY(b);b.targetY=Math.max(b.targetY,safeY);
  if(!b._frEntered){
    if(b.y<safeY){b.y=Math.min(safeY,b.y+2.5);return;}
    b._frEntered=true;
    if(!b._frIntroSpoken&&b._frEntryLine){b._frIntroSpoken=true;frBossSpeak(b,b._frEntryLine,b.color);frBossFxPush(b,'entry',{duration:88,color:b.color});frBossThemeFx(b,'entry',92);}
  }
  if(b.frozenTimer>0)b.frozenTimer--;
  if(b.shieldBroken){b.shieldResetTimer--;updateBossShield();if(b.shieldResetTimer<=0){b.shield=b.maxShield;b.shieldBroken=false;addText('🛡️護盾重置！',b.x,b.y-50,'#60a5fa');updateBossShield();}}
  if(Array.isArray(b._frLanceVisuals))b._frLanceVisuals=b._frLanceVisuals.filter(function(fx){return b.timer<=fx.end;});
  frThunderUpdateRelics(b);
  frThunderUpdateHands(b);
  const highStage=Number(stage)>=12,hpRatio=b.hp/Math.max(1,b.maxHp),tempo=frBossTempo(stage),warFallen=typeof frBossFallenCount==='function'?frBossFallenCount():0;
  if(warFallen>(b._frWarSpiritShown||0)){b._frWarSpiritShown=warFallen;addText('BOSS 戰意 '+warFallen+' 層',b.x,b.y-112,'#fb7185',15,-.4);burst(b.x,b.y,'#fb7185',18);}
  for(let i=b._frEvents.length-1;i>=0;i--){if(b.timer>=b._frEvents[i].at){const ev=b._frEvents.splice(i,1)[0];ev.fn();}}
  b._frWarnings=b._frWarnings.filter(function(w){return b.timer<=w.end;});
  if(b._frDash){b.x+=b._frDash.vx*frFormSlow;b.y+=b._frDash.vy*frFormSlow;b._frDash.left--;if(b._frDash.trail&&b.timer%7===0)frBossHazard({kind:'circle',x:b.x,y:b.y,r:26,color:b.color,damage:Math.max(8,b._frDash.damage*.55),status:b._frDash.status||null,delay:18,duration:55});if(Math.hypot(player.x-b.x,player.y-b.y)<b.r+player.radius&&player.invTimer<=0){hurtPlayer(b._frDash.damage);if(b._frDash.status)frBossApplyStatus(b._frDash.status);}if(b._frDash.left<=0||b.x<45||b.x>CW-45||b.y<safeY||b.y>CH*.62)b._frDash=null;}
  else{
    const moveRage=1;
    if(b.timer%tempo.moveRetarget===0)b.targetX=70+Math.random()*(CW-140);
    b.x+=(b.targetX-b.x)*tempo.moveRate*moveRage*frFormSlow;b.y+=(b.targetY-b.y)*tempo.moveRate*moveRage*frFormSlow;
  }
  frBossEnforceTopSafeZone(b);
  if(b._frTether){const dist=Math.hypot(player.x-b.x,player.y-b.y);if(b.timer>b._frTether.until||dist>230)b._frTether=null;else if(b.timer-b._frTether.last>42){b._frTether.last=b.timer;if(player.invTimer<=0){hurtPlayer(b._frTether.damage);b.hp=Math.min(b.maxHp,b.hp+b._frTether.damage*1.5);updateBossHp();}}}
  frThunderStage11ClosePressure(b);
  frBossMaybeSummon(b);
  const expertStage=true,masterStage=Number(stage)>=12,handHaste=b.timer<(b._frHandHasteUntil||0)?1.25:1,warSpeed=(typeof frBossWarSpeedScale==='function'?frBossWarSpeedScale(stage):1)*handHaste;
  if(expertStage){const castRate=b.timer<b._frBusyUntil?tempo.busyRate:1;b._frAttackCd-=frFormSlow*castRate*warSpeed;}
  if(b.timer<b._frBusyUntil)return;
  const rage=1;
  if(b._frAttackCd<=0){
    const useSkill=Math.random()<(highStage?.62:.56);b._frAttackCount++;
    if(useSkill){
      if(!b._frSkillBag.length)b._frSkillBag=frBossShuffle(frBossHighStageSkillPool(b));let skill=b._frSkillBag.shift();
      if(b._frFinal&&b._frThunderPhase===1&&!frThunderLance(b)&&['lanceSweep','lanceRainArray','lanceBoundary','tripleLanceThrust'].indexOf(skill)>=0)skill='armorCounter';
      if(b._frFinal&&b._frThunderPhase===2){const left=frThunderHand(b,'leftHand'),right=frThunderHand(b,'rightHand');if(!left&&['thunderClawSlam','thunderClawHunt','thunderPalmBarrier'].indexOf(skill)>=0)skill='ninefoldJudgment';if(!right&&['palmThunderCannon','thunderSealHeal','thunderInfusion'].indexOf(skill)>=0)skill='thunderDomain';if((!left||!right)&&skill==='thunderPalmClap')skill='finalThunderstorm';}
      frBossCast(b,skill,true);b._frSkillCastCount=(b._frSkillCastCount||0)+1;
      const followUpEvery=highStage?2:3;
      if(expertStage&&!b._frFinal&&b._frSkillCastCount%followUpEvery===0)frBossLater(b,42,function(){if(b._defeated)return;addText(masterStage?'菁英追擊':'強化追擊',b.x,b.y-92,'#fef08a',13,-.4);frBossCast(b,b._frDef.normal,false);});
      if(highStage)b.targetX=b.x<CW/2?CW*(.62+Math.random()*.2):CW*(.18+Math.random()*.2);
      b._frAttackCd=Math.floor(tempo.skillCd*rage);
    }
    else{frBossCast(b,b._frDef.normal,false);b._frAttackCd=Math.floor(tempo.normalCd*rage);}
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
  frBossDrawFx(b);frThunderDrawPowerAura(b);
  if(b._frFinal&&b._frThunderPhase===2){const support=frThunderHand(b,'rightHand');if(support&&(support.mode==='heal'||support.mode==='infuse')){const supportImg=frThunderRelicImage('rightHand'),pulse=.5+.5*Math.sin(b.timer*.18),size=162;ctx.save();ctx.translate(support.x,support.y);ctx.globalAlpha=.94;ctx.shadowColor=support.mode==='heal'?'#86efac':'#fde047';ctx.shadowBlur=FR_BOSS_FX_MOBILE?9:18+pulse*7;if(supportImg&&supportImg.complete&&supportImg.naturalWidth)ctx.drawImage(supportImg,-size/2,-size/2,size,size);ctx.strokeStyle=support.mode==='heal'?'#bbf7d0':'#fef08a';ctx.lineWidth=4;ctx.globalAlpha=.7;for(let ring=0;ring<2;ring++){ctx.beginPath();ctx.arc(0,0,54+ring*15+pulse*6,0,Math.PI*2);ctx.stroke();}ctx.restore();}}
  ctx.save();ctx.translate(b.x,b.y);
  if(!b.shieldBroken&&b.shield>0){const sp=b.shield/b.maxShield;ctx.globalAlpha=.12+sp*.12;ctx.strokeStyle='#93c5fd';ctx.lineWidth=4+sp*3;ctx.beginPath();ctx.arc(0,0,b.r+18+Math.sin(Date.now()*.006)*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
  let img=frBossImage(b._frDef),frame=0,sourceW=512,sourceH=768,drawX=-75,drawY=-110,drawW=150,drawH=225;
  if(b._frFinal){sourceW=384;sourceH=384;drawX=-96;drawY=-96;drawW=192;drawH=192;if(b._frTransition){const trAge=b.timer-b._frTransition.start,trSpan=Math.max(1,b._frTransition.duration-(b._frTransition.bossMorphAt||0));img=frThunderImage(b._frTransition.from===0?'transition12':'transition23');frame=b._frTransition.from===0&&trAge<(b._frTransition.bossMorphAt||0)?0:Math.min(5,Math.floor(Math.max(0,trAge-(b._frTransition.bossMorphAt||0))/Math.max(1,trSpan/6)));}else{img=frThunderImage('phase'+((b._frThunderPhase||0)+1));frame=Math.floor(b.timer/7)%4;}}
  else frame=b.timer<b._frAnimUntil?Math.min(3,Math.floor((b.timer-b._frAnimStart)/6)):0;
  if(b._frFinalDeath){const deathAge=b.timer-b._frFinalDeath.start;if(deathAge>=b._frFinalDeath.beamAt)ctx.globalAlpha=Math.max(0,1-(deathAge-b._frFinalDeath.beamAt)/48);}
  if(img&&img.complete&&img.naturalWidth){ctx.imageSmoothingEnabled=false;ctx.drawImage(img,frame*sourceW,0,sourceW,sourceH,drawX,drawY,drawW,drawH);}
  else{ctx.shadowBlur=14;ctx.shadowColor=b.color;ctx.fillStyle=b.color;ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.fill();}
  ctx.restore();
  if(b._frFinal&&b._frTransition&&b._frTransition.to===1&&Array.isArray(b._frTransition.orbs)){
    const tr=b._frTransition,age=b.timer-tr.start,collect=Math.min(1,age/42),morph=Math.max(0,Math.min(1,(age-tr.relicMorphAt)/36)),homes=[{x:b.x-76,y:b.y-4},{x:b.x+76,y:b.y}];
    tr.orbs.forEach(function(orb,index){const home=homes[index],x=orb.x+(home.x-orb.x)*collect,y=orb.y+(home.y-orb.y)*collect,pulse=.5+.5*Math.sin(b.timer*.25+index*Math.PI),relicKind=index===0?'lance':'shield',relicImg=frThunderRelicImage(relicKind);ctx.save();ctx.translate(x,y);ctx.globalAlpha=1-morph;ctx.shadowColor='#fde047';ctx.shadowBlur=16+pulse*8;ctx.fillStyle='#facc15';ctx.beginPath();ctx.arc(0,0,20+pulse*3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff7ae';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,25+pulse*4,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=morph;if(relicKind==='lance'){ctx.rotate(morph*Math.PI*2);if(relicImg&&relicImg.complete&&relicImg.naturalWidth)ctx.drawImage(relicImg,-27.5,-120,55,240);}else if(relicImg&&relicImg.complete&&relicImg.naturalWidth)ctx.drawImage(relicImg,-75,-82.5,150,165);ctx.restore();});
  }
  if(b._frFinal&&b._frTransition&&b._frTransition.to===2){
    const tr=b._frTransition,age=b.timer-tr.start,throwP=Math.max(0,Math.min(1,age/42)),shatterP=Math.max(0,Math.min(1,(age-126)/54)),handsP=Math.max(0,Math.min(1,(age-174)/66));
    const lance=(tr.discardedRelics||[]).find(function(r){return r.kind==='lance';}),lanceImg=frThunderRelicImage('lance');
    if(lance&&throwP<1){ctx.save();ctx.translate(lance.x-CW*.55*throwP,lance.y+CH*.18*throwP);ctx.rotate(throwP*Math.PI*3);ctx.globalAlpha=1-throwP*.8;ctx.shadowColor='#fde047';ctx.shadowBlur=12;if(lanceImg&&lanceImg.complete&&lanceImg.naturalWidth)ctx.drawImage(lanceImg,-27.5,-120,55,240);ctx.restore();}
    if(shatterP>0&&shatterP<1){ctx.save();ctx.translate(b.x,b.y);ctx.globalAlpha=Math.sin(shatterP*Math.PI);ctx.fillStyle='#bae6fd';ctx.shadowColor='#fde047';ctx.shadowBlur=8;for(let i=0;i<12;i++){const a=i/12*Math.PI*2+.2,dist=25+shatterP*82,size=4+(i%3)*2;ctx.save();ctx.translate(Math.cos(a)*dist,Math.sin(a)*dist);ctx.rotate(a+shatterP*4);ctx.fillRect(-size,-size/2,size*2,size);ctx.restore();}ctx.restore();}
    if(handsP>0){['leftHand','rightHand'].forEach(function(kind,index){const img=frThunderRelicImage(kind),side=index?1:-1,homeX=b.x+side*78,startX=index?CW+90:-90,x=startX+(homeX-startX)*handsP,y=b.y+8;ctx.save();ctx.translate(x,y);ctx.globalAlpha=handsP*.94;ctx.shadowColor='#fde047';ctx.shadowBlur=10+handsP*14;if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,-54,-54,108,108);ctx.restore();});}
  }
  if(b._frFinalDeath){
    const d=b._frFinalDeath,age=b.timer-d.start;
    if(age>=d.beamAt){const p=Math.max(0,Math.min(1,(age-d.beamAt)/(d.duration-d.beamAt))),pulse=.5+.5*Math.sin(age*.45),beamW=(1-p)*(48+pulse*18)+5;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,1-p);const g=ctx.createLinearGradient(b.x-beamW,0,b.x+beamW,0);g.addColorStop(0,'rgba(250,204,21,0)');g.addColorStop(.35,'rgba(254,240,138,.75)');g.addColorStop(.5,'#ffffff');g.addColorStop(.65,'rgba(254,240,138,.75)');g.addColorStop(1,'rgba(250,204,21,0)');ctx.fillStyle=g;ctx.fillRect(b.x-beamW,0,beamW*2,CH);ctx.strokeStyle='#ffffff';ctx.lineWidth=3;ctx.beginPath();ctx.arc(b.x,b.y,30+p*85,0,Math.PI*2);ctx.stroke();ctx.restore();}
  }
  if(b._frFinal&&Array.isArray(b._frLanceVisuals)&&b._frLanceVisuals.length){
    const lanceImg=frThunderRelicImage('lance');b._frLanceVisuals.forEach(function(fx){const age=b.timer-fx.start,duration=Math.max(1,fx.end-fx.start),p=Math.max(0,Math.min(1,age/duration));let x=fx.x,y=fx.y,angle=Number(fx.angle)||0,alpha=1,scale=1;
      if(fx.kind==='sweep'){const sweepP=Math.max(0,Math.min(1,(age-60)/45));angle=fx.startAngle+(fx.endAngle-fx.startAngle)*sweepP;x=b.x+Math.cos(angle)*122;y=b.y+Math.sin(angle)*122;}
      else if(fx.kind==='drop'){const travel=Math.max(0,Math.min(1,(age-60)/22));x=fx.x+Math.cos(angle)*Math.max(CW,CH)*travel;y=fx.y+Math.sin(angle)*Math.max(CW,CH)*travel;alpha=fx.trueLance?1:.62;scale=fx.trueLance?1:.72;}
      else if(fx.kind==='pin'){const travel=Math.max(0,Math.min(1,(age-48)/12));x=fx.x+(fx.targetX-fx.x)*travel;y=fx.y+(fx.targetY-fx.y)*travel;angle=Math.atan2(fx.targetY-fx.y,fx.targetX-fx.x);}
      else if(fx.kind==='thrust'){const travel=age<48?0:age<58?(age-48)/10:Math.max(0,1-(age-58)/12);x=fx.x+Math.cos(angle)*Math.max(CW,CH)*.72*travel;y=fx.y+Math.sin(angle)*Math.max(CW,CH)*.72*travel;}
      ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/2);ctx.globalAlpha=alpha;ctx.shadowColor='#fde047';ctx.shadowBlur=FR_BOSS_FX_MOBILE?8:16;if(lanceImg&&lanceImg.complete&&lanceImg.naturalWidth)ctx.drawImage(lanceImg,-27.5*scale,-120*scale,55*scale,240*scale);ctx.restore();
    });
  }
  if(b._frFinal&&b._frThunderPhase===1&&Array.isArray(b._frRelics)){
    b._frRelics.forEach(function(relic){
      if(relic.dead)return;const img=frThunderRelicImage(relic.kind),active=relic.kind==='shield'&&b.timer<relic.activeUntil;
      if(relic.kind==='lance'&&relic.skillUntil&&b.timer<relic.skillUntil&&relic.mode!=='pinned')return;
      if(relic.kind==='lance'&&relic.mode==='windup'&&b.timer-relic.actionStart<60){
        const warnAge=b.timer-relic.actionStart,warnAlpha=.35+.35*Math.sin(warnAge*.35);ctx.save();ctx.globalAlpha=warnAlpha;ctx.strokeStyle='#fde047';ctx.lineWidth=5;ctx.setLineDash([14,9]);ctx.lineDashOffset=-warnAge*2;ctx.beginPath();ctx.moveTo(relic.x,relic.y);ctx.lineTo(relic.targetX,relic.targetY);ctx.stroke();ctx.globalAlpha=.9;ctx.fillStyle='#fef08a';ctx.beginPath();ctx.arc(relic.x,relic.y,7+Math.sin(warnAge*.3)*2,0,Math.PI*2);ctx.fill();ctx.restore();
      }
      ctx.save();ctx.translate(relic.x,relic.y);ctx.globalAlpha=.92+.08*Math.sin(b.timer*.16);ctx.shadowColor=relic.kind==='lance'?'#38bdf8':'#fef08a';ctx.shadowBlur=active?18:8;
      if(relic.kind==='lance'){
        const age=relic.mode==='idle'?0:b.timer-relic.actionStart,angle=relic.mode==='pinned'?Math.PI:relic.mode==='idle'?0:age<40?age*.72:(Number(relic.aimAngle)||0)+Math.PI/2;ctx.rotate(angle);
        if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,-27.5,-120,55,240);else{ctx.strokeStyle='#7dd3fc';ctx.lineWidth=10;ctx.beginPath();ctx.moveTo(0,-112);ctx.lineTo(0,112);ctx.stroke();}
      }else{
        const a=active?Math.atan2(player.y-b.y,player.x-b.x)+Math.PI/2:0;ctx.rotate(a);if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,-75,-82.5,150,165);else{ctx.fillStyle='#1d4ed8';ctx.beginPath();ctx.arc(0,0,70,0,Math.PI*2);ctx.fill();}
      }
      ctx.restore();
      const ratio=Math.max(0,relic.hp/relic.maxHp),barW=relic.kind==='lance'?70:90,barY=relic.y-(relic.kind==='lance'?132:94);ctx.fillStyle='rgba(15,23,42,.78)';ctx.fillRect(relic.x-barW/2,barY,barW,5);ctx.fillStyle=ratio>.5?'#38bdf8':ratio>.25?'#fbbf24':'#ef4444';ctx.fillRect(relic.x-barW/2,barY,barW*ratio,5);
    });
  }
  if(b._frFinal&&b._frThunderPhase===2&&Array.isArray(b._frHands)){
    const clapLeft=frThunderHand(b,'leftHand'),clapRight=frThunderHand(b,'rightHand'),clapActive=clapLeft&&clapRight&&clapLeft.mode==='clap'&&clapRight.mode==='clap'&&b.timer<(b._frClapEnd||0);
    if(clapActive){const coreX=b._frClapCoreX,coreY=b._frClapCoreY,charge=Math.max(0,Math.min(1,(b.timer-(b._frClapStart||b.timer))/90)),fired=b.timer>=(b._frClapFireAt||Infinity),pulse=.5+.5*Math.sin(b.timer*.35);ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle='#fde047';ctx.lineWidth=3+pulse*2;ctx.shadowColor='#facc15';ctx.shadowBlur=FR_BOSS_FX_MOBILE?8:18;[clapLeft,clapRight].forEach(function(hand){ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.lineTo(coreX+(Math.random()-.5)*8,coreY+(Math.random()-.5)*8);ctx.stroke();});const radius=12+charge*24+(fired?pulse*7:0);const grad=ctx.createRadialGradient(coreX,coreY,2,coreX,coreY,radius);grad.addColorStop(0,'#ffffff');grad.addColorStop(.35,'#fef08a');grad.addColorStop(1,'rgba(250,204,21,0)');ctx.fillStyle=grad;ctx.beginPath();ctx.arc(coreX,coreY,radius,0,Math.PI*2);ctx.fill();ctx.restore();}
    b._frHands.forEach(function(hand){if(hand.dead)return;const img=frThunderRelicImage(hand.kind),pulse=.5+.5*Math.sin(b.timer*.16+(hand.kind==='leftHand'?0:Math.PI)),barrier=hand.mode==='barrier',channel=hand.mode==='heal'||hand.mode==='infuse',clap=hand.mode==='clap';if(!channel){ctx.save();const shake=barrier?Math.sin(b.timer*.8)*2:0;ctx.translate(hand.x+shake,hand.y);if(hand.kind==='leftHand'&&hand.mode==='slam')ctx.rotate(Math.PI/2);if(barrier)ctx.rotate(Math.atan2(player.y-b.y,player.x-b.x)+Math.PI/2);if(clap){const coreAngle=Math.atan2((b._frClapCoreY||b.y)-hand.y,(b._frClapCoreX||b.x)-hand.x);ctx.rotate(coreAngle+Math.PI/2);}ctx.globalAlpha=.94;ctx.shadowColor='#fde047';ctx.shadowBlur=FR_BOSS_FX_MOBILE?8:14+pulse*6;const size=barrier?162:clap?120:108;if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,-size/2,-size/2,size,size);else{ctx.fillStyle=hand.kind==='leftHand'?'#2563eb':'#facc15';ctx.beginPath();ctx.arc(0,0,size*.38,0,Math.PI*2);ctx.fill();}if(barrier){ctx.strokeStyle='#fef08a';ctx.lineWidth=5;ctx.globalAlpha=.55+pulse*.25;ctx.beginPath();ctx.arc(0,0,72+pulse*5,0,Math.PI*2);ctx.stroke();}ctx.restore();}const ratio=Math.max(0,hand.hp/hand.maxHp),barW=76,barY=hand.y-(barrier?94:channel?92:65);ctx.fillStyle='rgba(15,23,42,.82)';ctx.fillRect(hand.x-barW/2,barY,barW,6);ctx.fillStyle=ratio>.5?'#38bdf8':ratio>.25?'#fbbf24':'#ef4444';ctx.fillRect(hand.x-barW/2,barY,barW*ratio,6);ctx.fillStyle='#f8fafc';ctx.font='bold 9px sans-serif';ctx.textAlign='center';ctx.fillText(hand.kind==='leftHand'?'雷爪':'雷掌',hand.x,barY-4);});
  }
}

const frBaseBoss=Boss;
Boss=class extends frBaseBoss{
  constructor(stg){super(stg);frBossInit(this);}
  update(){frBossInit(this);frBossUpdateCustom(this);}
  draw(){frBossInit(this);frBossDrawCustom(this);}
  takeDamage(amount,isQa){frBossInit(this);if(this._frFinal)return frThunderTakeDamage(this,amount,isQa);const result=super.takeDamage(amount,isQa);this.phase=0;return result;}
};

const frThunderRelicBulletUpdate=Bullet.prototype.update;
Bullet.prototype.update=function(){
  frThunderRelicBulletUpdate.call(this);
  if(typeof bullets!=='undefined'&&bullets.indexOf(this)>=0)frThunderHitRelic(this);
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

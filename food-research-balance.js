(function () {
  const balance = {
    version: 1,
    progression: {
      maxStage: 22,
      cycleLength: 11,
      finalMap: 10,
      activeEnemyCaps: [
        { stage: 1, cap: 6 },
        { stage: 5, cap: 8 },
        { stage: 12, cap: 9 },
        { stage: 18, cap: 10 },
      ],
      curvePoints: [
        { stage: 1, enemyHp: 1.00, enemyDamage: 1.00, enemySpeed: 1.00, bossHp: 1.00, bossDamage: 1.00, waves: 6, min: 2, max: 3 },
        { stage: 4, enemyHp: 1.28, enemyDamage: 1.14, enemySpeed: 1.05, bossHp: 1.40, bossDamage: 1.12, waves: 7, min: 3, max: 4 },
        { stage: 7, enemyHp: 1.65, enemyDamage: 1.30, enemySpeed: 1.10, bossHp: 1.95, bossDamage: 1.28, waves: 8, min: 3, max: 5 },
        { stage: 10, enemyHp: 2.12, enemyDamage: 1.52, enemySpeed: 1.16, bossHp: 2.70, bossDamage: 1.48, waves: 10, min: 4, max: 6 },
        { stage: 11, enemyHp: 2.35, enemyDamage: 1.65, enemySpeed: 1.18, bossHp: 3.20, bossDamage: 1.62, waves: 0, min: 0, max: 0 },
        { stage: 12, enemyHp: 2.55, enemyDamage: 1.72, enemySpeed: 1.19, bossHp: 3.35, bossDamage: 1.68, waves: 8, min: 4, max: 6 },
        { stage: 15, enemyHp: 3.10, enemyDamage: 1.95, enemySpeed: 1.24, bossHp: 4.15, bossDamage: 1.90, waves: 9, min: 5, max: 7 },
        { stage: 18, enemyHp: 3.75, enemyDamage: 2.22, enemySpeed: 1.29, bossHp: 5.10, bossDamage: 2.15, waves: 10, min: 6, max: 8 },
        { stage: 21, enemyHp: 4.50, enemyDamage: 2.55, enemySpeed: 1.34, bossHp: 6.25, bossDamage: 2.45, waves: 12, min: 7, max: 9 },
        { stage: 22, enemyHp: 4.90, enemyDamage: 2.75, enemySpeed: 1.36, bossHp: 7.50, bossDamage: 2.65, waves: 0, min: 0, max: 0 },
      ],
    },
    scoring: {
      enemyByType: { 1: 100, 2: 140, 3: 180 },
      stageStep: 0.08,
      bossBase: 1800,
      bossPerStage: 260,
      stageClearBase: 650,
      stageClearPerStage: 90,
      flawlessBase: 450,
      flawlessPerStage: 35,
      timeBonusMax: 700,
      timeBonusLossPerSecond: 12,
      rivalBase: 650,
      rivalPerStage: 65,
      runClear: 5000,
    },
    economy: {
      foodDraw: 350,
      weaponDraw: 500,
      amuletDraw: 250,
      enemyDropChance: { 1: 0.28, 2: 0.38, 3: 0.48 },
      enemyDropAmount: { 1: [1, 1], 2: [1, 2], 3: [1, 3] },
      bossBase: 65,
      bossPerStage: 7,
      rivalBase: 40,
      rivalPerStage: 4,
    },
    stamina: {
      base: 100,
      perTrainingLevel: 6,
      regenPerSecond: 5,
      regenPerTrainingLevel: 0.10,
      dodgeCost: 22,
      skill1ByRarity: { normal: 20, rare: 22, noble: 24, top: 26 },
      skill2ByRarity: { normal: 48, rare: 52, noble: 56, top: 60 },
    },
    combat: {
      critMultiplier: 1.75,
      critChanceCap: 0.50,
      attackDownMultiplier: 0.72,
      slowMultiplier: 0.62,
    },
    training: {
      attackPerLevel: 0.05,
      defensePerLevel: 0.04,
      hpPerLevel: 12,
      staminaPerLevel: 6,
      critPerLevel: 0.03,
    },
  };

  window.FOOD_RESEARCH_BALANCE = balance;

  const runtimePrelude = String.raw`
const FR_BALANCE=${JSON.stringify(balance)};
const FR_MOBILE_PERF=(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches)||Math.min(window.innerWidth||9999,window.innerHeight||9999)<=520;
const FR_PERF={enemyBulletCap:FR_MOBILE_PERF?90:110,particleCap:FR_MOBILE_PERF?90:120,textCap:FR_MOBILE_PERF?20:25};
function frBalanceCurve(stage){
 const points=FR_BALANCE.progression.curvePoints,s=Math.max(1,Math.min(FR_BALANCE.progression.maxStage,Number(stage)||1));
 let left=points[0],right=points[points.length-1];
 for(let i=1;i<points.length;i++){if(s<=points[i].stage){right=points[i];left=points[i-1];break;}}
 if(left.stage===right.stage)return Object.assign({},left);
 const t=(s-left.stage)/(right.stage-left.stage),out={stage:s};
 Object.keys(left).forEach(function(key){if(key==='stage')return;out[key]=left[key]+(right[key]-left[key])*t;});
 out.waves=Math.round(out.waves);out.min=Math.round(out.min);out.max=Math.round(out.max);return out;
}
function frSeed(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function frSeededRoute(salt){const a=[0,1,2,3,4,5,6,7,8,9];let seed=frSeed(String(SAVE.playerPhone||'guest')+':'+salt);for(let i=a.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);const t=a[i];a[i]=a[j];a[j]=t;}return a;}
const FR_ROUTE_A=frSeededRoute('route-a'),FR_ROUTE_B=frSeededRoute('route-b');
function frMapForStage(stage){const s=Math.max(1,Math.min(FR_BALANCE.progression.maxStage,stage||1));if(s%11===0)return FR_BALANCE.progression.finalMap;return (s<=11?FR_ROUTE_A:FR_ROUTE_B)[(s-1)%11];}
function frEnemyScore(type,stage){return Math.round((FR_BALANCE.scoring.enemyByType[type]||100)*(1+(Math.max(1,stage)-1)*FR_BALANCE.scoring.stageStep));}
function frBossScore(stage){return FR_BALANCE.scoring.bossBase+Math.max(1,stage)*FR_BALANCE.scoring.bossPerStage;}
function frStageClearScore(stage){return FR_BALANCE.scoring.stageClearBase+Math.max(1,stage)*FR_BALANCE.scoring.stageClearPerStage;}
function frRivalScore(stage){return FR_BALANCE.scoring.rivalBase+Math.max(1,stage)*FR_BALANCE.scoring.rivalPerStage;}
function frEnemyCoinChance(type){return FR_BALANCE.economy.enemyDropChance[type]||.25;}
function frEnemyCoinAmount(type){const range=FR_BALANCE.economy.enemyDropAmount[type]||[1,1];return range[0]+Math.floor(Math.random()*(range[1]-range[0]+1));}
function frBossCoinReward(stage){return FR_BALANCE.economy.bossBase+Math.max(1,stage)*FR_BALANCE.economy.bossPerStage;}
function frRivalCoinReward(stage){return FR_BALANCE.economy.rivalBase+Math.max(1,stage)*FR_BALANCE.economy.rivalPerStage;}
`;

  window.FOOD_RESEARCH_APPLY_BALANCE_PATCH = function (body) {
    let out = runtimePrelude + body;
    out = out
      .replace('const atkMult=1+(tr.atk||0)*.1;', 'const atkMult=1+(tr.atk||0)*FR_BALANCE.training.attackPerLevel;')
      .replace('const defMult=1-(tr.def||0)*.08;', 'const defMult=Math.max(.55,1-(tr.def||0)*FR_BALANCE.training.defensePerLevel);')
      .replace('const hpBonus=(tr.hp||0)*20;', 'const hpBonus=(tr.hp||0)*FR_BALANCE.training.hpPerLevel;')
      .replace('const stamBonus=(tr.stam||0)*10;', 'const stamBonus=(tr.stam||0)*FR_BALANCE.training.staminaPerLevel;')
      .replace('const STAM_REGEN=0.0005*(1+(tr.stamRegen||0)*.1);', 'const STAM_REGEN=(FR_BALANCE.stamina.regenPerSecond/1000)*(1+(tr.stamRegen||0)*FR_BALANCE.stamina.regenPerTrainingLevel);')
      .replace('const DODGE_COST=30;', 'const DODGE_COST=FR_BALANCE.stamina.dodgeCost;')
      .replace('let gold=0,score=0,stage=1,gameRunning=false,stageCleared=false;', "let gold=0,score=Number(SAVE.runScore||0),stage=1,gameRunning=false,stageCleared=false;let frBossDefeatedCount=0;const frRunStartedAt=Number(SAVE.runStartedAt||Date.now());const frRunId=String(SAVE.runId||'');")
      .replace('const goldChance=.5;', 'const goldChance=frEnemyCoinChance(this.type);')
      .replace('const earn=1+Math.floor(Math.random()*3);', 'const earn=frEnemyCoinAmount(this.type);')
      .replace('if(particles.length>200)particles.length=200;', 'if(particles.length>FR_PERF.particleCap)particles.splice(0,particles.length-FR_PERF.particleCap);')
      .replace('if(eBullets.length>120)eBullets.length=120;', 'if(eBullets.length>FR_PERF.enemyBulletCap)eBullets.length=FR_PERF.enemyBulletCap;')
      .replace('if(texts.length>25)texts.length=25;', 'if(texts.length>FR_PERF.textCap)texts.splice(0,texts.length-FR_PERF.textCap);')
      .replace("function reportKill(){window.parent.postMessage({type:'FR_QUEST_KILL'},'*');}", "let frPendingQuestKills=0,frQuestKillTimer=0;function frFlushQuestKills(sync){if(frQuestKillTimer){clearTimeout(frQuestKillTimer);frQuestKillTimer=0;}if(!frPendingQuestKills&&!sync)return;const count=frPendingQuestKills;frPendingQuestKills=0;window.parent.postMessage({type:'FR_QUEST_KILL',count:count,flush:!!sync},'*');}function reportKill(){frPendingQuestKills++;if(frPendingQuestKills>=10)frFlushQuestKills(false);else if(!frQuestKillTimer)frQuestKillTimer=setTimeout(function(){frFlushQuestKills(false);},2500);}")
      .replace("function reportBossKill(){window.parent.postMessage({type:'FR_BOSS_KILLED',gold},'*');}", "function reportBossKill(){frFlushQuestKills(true);window.parent.postMessage({type:'FR_BOSS_KILLED',gold},'*');}")
      .replace("addText('+100💰'", "addText('+'+frBossCoinReward(stage)+'💰'")
      .replace('score+=this.scoreVal;gold+=100;updateHUD();reportBossKill();', 'score+=this.scoreVal;gold+=frBossCoinReward(stage);updateHUD();reportBossKill();')
      .replace('gold+=30;updateHUD();', 'const rivalGold=frRivalCoinReward(stage);gold+=rivalGold;score+=frRivalScore(stage);updateHUD();')
      .replace("addText('🎉全數擊敗！+30🪙'", "addText('🎉全數擊敗！+'+frRivalCoinReward(stage)+'🪙'")
      .replace("function goBackToCamp(){window.parent.postMessage({type:'FR_BACK_TO_CAMP',gold},'*');}", "function goBackToCamp(){frFlushQuestKills(true);window.parent.postMessage({type:'FR_BACK_TO_CAMP',gold,score,stage,bossKills:frBossDefeatedCount,durationMs:Math.max(1000,Date.now()-frRunStartedAt),runId:frRunId,completed:!!window.frRunComplete},'*');}")
      .replace('currentBgIdx=Math.floor(Math.random()*BG_THEMES.length);', 'currentBgIdx=frMapForStage(stage);')
      .replace(/currentBgIdx = pickInitialBgIdx\(\);/g, "currentBgIdx = SAVE.startMapIdx!=null ? pickInitialBgIdx() : frMapForStage(stage);")
      .replace('stage=Math.max(1,savedS);', 'stage=SAVE.testMode?Math.max(1,Math.min(FR_BALANCE.progression.maxStage,Number(SAVE.testStage)||FR_BALANCE.progression.maxStage)):Math.max(1,savedS);')
      .replace('stage=Math.max(1,savedStage-1)||1;score=0;', 'stage=SAVE.testMode?Math.max(1,Math.min(FR_BALANCE.progression.maxStage,Number(SAVE.testStage)||FR_BALANCE.progression.maxStage)):(Math.max(1,savedStage-1)||1);score=0;')
      .replace('const spd=player.speed*(currentWeapon===\'melee\'?1.1:1)*(normalFrenzyTimer>0?2:1);', "const statusMove=(window.frSlowUntil&&performance.now()<window.frSlowUntil)?FR_BALANCE.combat.slowMultiplier:1;const formMove=typeof frFormMoveMultiplier==='function'?frFormMoveMultiplier():1;const spd=player.speed*(currentWeapon==='melee'?1.1:1)*(normalFrenzyTimer>0?2:1)*statusMove*formMove;")
      .replace('if(e.hp<=0)enemies.splice(i,1);', 'if(e.hp<=0)enemies.splice(i,1);')
      .replace('if(Math.hypot(player.x-e.x,player.y-e.y)<player.radius+e.r&&player.invTimer<=0)hurtPlayer(10);', 'if(Math.hypot(player.x-e.x,player.y-e.y)<player.radius+e.r&&player.invTimer<=0)hurtPlayer(e.atk||10);')
      .replace('if(Math.hypot(player.x-boss.x,player.y-boss.y)<player.radius+boss.r&&player.invTimer<=0)hurtPlayer(20);', 'if(Math.hypot(player.x-boss.x,player.y-boss.y)<player.radius+boss.r&&player.invTimer<=0)hurtPlayer(Math.round(12*frBalanceCurve(stage).bossDamage));')
      .replace('hurtPlayer(b.dmg);burst(b.x,b.y,b.color,5);', "hurtPlayer(b.dmg);if(b.frStatus&&typeof frBossApplyStatus==='function')frBossApplyStatus(b.frStatus);burst(b.x,b.y,b.color,5);")
      .replace('this.hp-=amt*atkMult;addText(Math.floor(amt*atkMult).toString(),this.x,this.y,\'#78350f\');', "this.hp-=amt;addText(Math.floor(amt).toString(),this.x,this.y,'#78350f');")
      .replace('const shieldDmg=isQa?Math.floor(this.maxShield*.3):Math.floor(amt*atkMult*.5);', 'const shieldDmg=isQa?Math.floor(this.maxShield*.3):Math.floor(amt*.5);')
      .replace('this.hp-=Math.floor(amt*atkMult*.3);addText(Math.floor(amt*atkMult*.3).toString()', 'this.hp-=Math.floor(amt*.3);addText(Math.floor(amt*.3).toString()')
      .replace('this.hp-=amt*atkMult;addText(Math.floor(amt*atkMult).toString(),this.x,this.y,\'#92400e\');', "this.hp-=amt;addText(Math.floor(amt).toString(),this.x,this.y,'#92400e');")
      .replace(/\(pTr\.atk\|\|0\)\*\.1/g, '(pTr.atk||0)*FR_BALANCE.training.attackPerLevel')
      .replace(/\(pTr\.def\|\|0\)\*\.08/g, '(pTr.def||0)*FR_BALANCE.training.defensePerLevel')
      .replace(/\(pTr\.hp\|\|0\)\*20/g, '(pTr.hp||0)*FR_BALANCE.training.hpPerLevel')
      .replace(/\(pTr\.stam\|\|0\)\*10/g, '(pTr.stam||0)*FR_BALANCE.training.staminaPerLevel')
      .replace(/   var spd=1\.5;\n   r\.x\+=dx\/dist\*spd\*0\.6;\n   r\.y=Math\.min\(r\.y,r\.targetY\+15\);\n   if\(dist<160&&r\.atkTimer>=60\)\{[\s\S]*?hurtPlayer\(r\.atk\*0\.7\);\n   \}/,
`   // 衝鋒手：保持中近距離，以可閃避的突進波取代貼身扣血
   var spd=1.5,safeDist=Math.max(1,dist),minGap=190;
   if(dist>minGap+25)r.x+=dx/safeDist*spd*.45;
   else if(dist<minGap-20){r.x-=dx/safeDist*spd*1.25;r.y-=dy/safeDist*spd*.65;}
   else r.x+=Math.sin(r.timer*.08)*1.2;
   r.y+=(r.targetY-r.y)*.08;r.y=Math.min(r.y,CH*.38);
   if(dist<220&&r.atkTimer>=60){
    r.atkTimer=0;addText('⚔️ 突進波',r.x,r.y-30,'#ef4444',15,40);
    var rushA=Math.atan2(player.y-r.y,player.x-r.x);
    for(var rushI=-1;rushI<=1;rushI++)eBullets.push(new Bullet(r.x,r.y,Math.cos(rushA+rushI*.16)*4.8,Math.sin(rushA+rushI*.16)*4.8,r.atk*.72,'#f87171',8));
   }`)
      .replace(/   var rage=1\+\(1-r\.hp\/r\.maxHp\)\*2;\n   var bspd=1\.5\*rage;\n   r\.x\+=dx\/dist\*bspd; r\.y\+=dy\/dist\*bspd;[\s\S]*?for\(var v=0;v<3;v\+\+\)\{var off=\(v-1\)\*0\.3;eBullets\.push\(new Bullet\(r\.x,r\.y,Math\.cos\(a6\+off\)\*5,Math\.sin\(a6\+off\)\*5,r\.atk\*rage\*0\.8,'#ef4444',8\)\);\}\n   \}/,
`   // 狂戰手：低血量仍會加速，但不再黏住玩家造成接觸傷害
   var rage=1+(1-r.hp/r.maxHp)*2;
   var bspd=1.5*rage,bSafe=Math.max(1,dist),holdGap=170;
   if(dist>holdGap+35){r.x+=dx/bSafe*bspd*.5;r.y+=dy/bSafe*bspd*.18;}
   else if(dist<holdGap-25){r.x-=dx/bSafe*bspd*.8;r.y-=dy/bSafe*bspd*.5;}
   else r.x+=Math.sin(r.timer*.11)*1.5;
   r.y+=(r.targetY-r.y)*.055;r.y=Math.min(r.y,CH*.4);
   if(r.atkTimer>=Math.floor(65/rage)){
    r.atkTimer=0;addText('🔥 怒氣斬',r.x,r.y-30,'#ef4444',15,45);
    var a6=Math.atan2(player.y-r.y,player.x-r.x);
    for(var v=0;v<3;v++){var off=(v-1)*.24;eBullets.push(new Bullet(r.x,r.y,Math.cos(a6+off)*4.8,Math.sin(a6+off)*4.8,r.atk*rage*.68,'#ef4444',8));}
   }`);

    out = out.replace(
      "setTimeout(()=>{\n stage++;\n currentBgIdx=frMapForStage(stage);",
      "setTimeout(()=>{\n if(stage>=FR_BALANCE.progression.maxStage){window.frRunComplete=true;score+=FR_BALANCE.scoring.runClear;const stageKey=SAVE.savedStageKey||('fr_stage_'+(SAVE.playerPhone||'guest'));localStorage.setItem(stageKey,'1');addText('全 22 關制霸！ +'+FR_BALANCE.scoring.runClear+' 分',CW/2,CH*.42,'#fbbf24',22,0);updateHUD();setTimeout(goBackToCamp,2200);return;}\n stage++;\n localStorage.setItem(SAVE.savedStageKey||('fr_stage_'+(SAVE.playerPhone||'guest')),String(stage));\n currentBgIdx=frMapForStage(stage);"
    );
    return out;
  };

  window.FOOD_RESEARCH_BALANCE_PATCH = String.raw`
;(function(){
 let frStageStartedAt=performance.now(),frStageHpDamage=0;
 const frBgCache=document.createElement('canvas'),frBgCtx=frBgCache.getContext('2d');
 let frBgCacheKey='';

 function frPrepareStageAssets(){
  const theme=BG_THEMES[currentBgIdx];
  Object.keys(BG_MAP_IMAGES).forEach(function(src){
   if(!theme||src!==theme.map){const img=BG_MAP_IMAGES[src];if(img){img.onload=null;img.onerror=null;if(img.removeAttribute)img.removeAttribute('src');}delete BG_MAP_IMAGES[src];}
  });
  if(typeof frPreloadBossesForMap==='function')frPreloadBossesForMap(currentBgIdx);
  frBgCacheKey='';
 }

 const frBaseDrawBg=drawBg;
 drawBg=function(){
  const theme=BG_THEMES[currentBgIdx],img=getBgMapImage(theme);
  if(!img||!img.complete||!img.naturalWidth||CW<=0||CH<=0){frBaseDrawBg();return;}
  mapCameraY+=(mapCameraTargetY-mapCameraY)*.035;
  if(Math.abs(mapCameraY-mapCameraTargetY)<.002)mapCameraY=mapCameraTargetY;
  const cameraStep=Math.round(mapCameraY*100),key=currentBgIdx+':'+CW+'x'+CH+':'+cameraStep+':'+img.naturalWidth+'x'+img.naturalHeight;
  if(frBgCacheKey!==key){
   frBgCacheKey=key;
   if(frBgCache.width!==CW||frBgCache.height!==CH){frBgCache.width=CW;frBgCache.height=CH;}
   frBgCtx.setTransform(1,0,0,1,0,0);frBgCtx.clearRect(0,0,CW,CH);
   const gradient=frBgCtx.createLinearGradient(0,0,0,CH);gradient.addColorStop(0,theme.g1);gradient.addColorStop(1,theme.g2);frBgCtx.fillStyle=gradient;frBgCtx.fillRect(0,0,CW,CH);
   frBgCtx.imageSmoothingEnabled=false;
   const scale=Math.max(CW/img.naturalWidth,CH/img.naturalHeight),dw=img.naturalWidth*scale,dh=img.naturalHeight*scale,dx=(CW-dw)/2,overflow=Math.max(0,dh-CH),dy=-overflow*(cameraStep/100);
   frBgCtx.drawImage(img,dx,dy,dw,dh);frBgCtx.fillStyle='rgba(255,246,240,.16)';frBgCtx.fillRect(0,0,CW,CH);
  }
  ctx.drawImage(frBgCache,0,0);
 };

 const FrBalancedEnemyBase=Enemy;
 Enemy=class extends FrBalancedEnemyBase{
  constructor(x,y,type,hp,sv,stg){
   super(x,y,type,hp,sv,stg);
   const c=frBalanceCurve(stg||stage),baseHp=type===1?38:type===2?50:62;
   this.maxHp=Math.round(baseHp*c.enemyHp);this.hp=this.maxHp;
   this.atk=Math.round((type===1?8:type===2?11:14)*c.enemyDamage);
   this.vy*=c.enemySpeed/(1+(stg||stage)*.04);
   this.scoreVal=frEnemyScore(type,stg||stage);
  }
 };

 const FrBalancedBossBase=Boss;
 Boss=class extends FrBalancedBossBase{
  constructor(stg){
   super(stg);
   const c=frBalanceCurve(stg||stage);
   this.maxHp=Math.round(1100*c.bossHp);this.hp=this.maxHp;
   this.maxShield=Math.round(this.maxHp*.28);this.shield=this.maxShield;
   this.scoreVal=frBossScore(stg||stage);updateBossHp();updateBossShield();
  }
 };

 const frBalancedBuildStage=buildStage;
 buildStage=function(s,keepPlayerPos){
  frBalancedBuildStage(s,keepPlayerPos);frPrepareStageAssets();frStageStartedAt=performance.now();frStageHpDamage=0;
  window.frSlowUntil=0;window.frAttackDownUntil=0;window.frPoisonUntil=0;window.frBossStatusCooldown={};player.poisoned=false;player.poisonTick=0;player.burnTimer=0;player.frozenTimer=0;
  const c=frBalanceCurve(s);
  if(currentBgIdx===FR_BALANCE.progression.finalMap){spawnQueue=[];stageInitSpawnLen=0;bossIntroTimer=1;mapCameraTargetY=0;return;}
  spawnQueue=[];spawnTimer=0;
  for(let w=0;w<c.waves;w++){
   const count=c.min+Math.floor(Math.random()*(Math.max(c.min,c.max)-c.min+1));
   const frame=150+w*145;
   for(let k=0;k<count;k++)spawnQueue.push({frame:frame+k*19,x:24+Math.random()*Math.max(40,CW-48),type:1+Math.floor(Math.random()*3),wave:w,stg:s});
  }
  stageInitSpawnLen=spawnQueue.length;rivalTriggeredThisStage=false;rivalCleared=false;rivalFightActive=false;rivalEnemies=[];
 };

 function frEnemyActiveCap(s){
  let cap=8;
  FR_BALANCE.progression.activeEnemyCaps.forEach(function(point){if(s>=point.stage)cap=point.cap;});
  if(performance.now()<frAdaptiveSpawnLimitUntil)cap=Math.max(4,cap-2);
  return cap;
 }
 let frSpawnerLastAt=performance.now(),frSlowFrameStreak=0,frAdaptiveSpawnLimitUntil=0;
 const frBalancedTickSpawner=tickSpawner;
 tickSpawner=function(){
  const now=performance.now(),frameMs=now-frSpawnerLastAt;frSpawnerLastAt=now;
  if(frameMs>24&&frameMs<250)frSlowFrameStreak++;else frSlowFrameStreak=Math.max(0,frSlowFrameStreak-2);
  if(frSlowFrameStreak>=45){frAdaptiveSpawnLimitUntil=now+5000;frSlowFrameStreak=0;}
  const rivalCount=typeof rivalEnemies!=='undefined'?rivalEnemies.filter(function(r){return !r.defeated;}).length:0;
  const slots=Math.max(0,frEnemyActiveCap(stage)-enemies.length-rivalCount),nextFrame=spawnTimer+1;
  if(spawnQueue.length&&spawnQueue[0].frame<=nextFrame){
   let allowed=0,changed=false;
   for(let i=0;i<spawnQueue.length&&spawnQueue[i].frame<=nextFrame;i++){
    if(allowed<slots)allowed++;else{spawnQueue[i].frame=nextFrame+2;changed=true;}
   }
   if(changed)spawnQueue.sort(function(a,b){return a.frame-b.frame;});
  }
  frBalancedTickSpawner();
  if(particles.length>FR_PERF.particleCap)particles.splice(0,particles.length-FR_PERF.particleCap);
 };

 const frBalancedHurtPlayer=hurtPlayer;
 hurtPlayer=function(raw){const before=player&&player.hp||0;frBalancedHurtPlayer(raw);if(player&&player.hp<before)frStageHpDamage+=before-player.hp;};

 const frBalancedEnemyDamage=Enemy.prototype.takeDamage;
 Enemy.prototype.takeDamage=function(amount){const debuff=window.frAttackDownUntil&&performance.now()<window.frAttackDownUntil?FR_BALANCE.combat.attackDownMultiplier:1;return frBalancedEnemyDamage.call(this,amount*debuff);};
 const frBalancedBossDamage=Boss.prototype.takeDamage;
 Boss.prototype.takeDamage=function(amount,isQa){
  const wasAlive=!this._defeated&&this.hp>0,debuff=window.frAttackDownUntil&&performance.now()<window.frAttackDownUntil?FR_BALANCE.combat.attackDownMultiplier:1;
  const result=frBalancedBossDamage.call(this,amount*debuff,isQa);
  if(wasAlive&&this._defeated){
   frBossDefeatedCount++;
   const elapsed=Math.max(0,(performance.now()-frStageStartedAt)/1000),clear=frStageClearScore(stage);
   const target=48+stage*2.5,time=Math.max(0,Math.round(FR_BALANCE.scoring.timeBonusMax-Math.max(0,elapsed-target)*FR_BALANCE.scoring.timeBonusLossPerSecond));
   const flawless=frStageHpDamage<=0?FR_BALANCE.scoring.flawlessBase+stage*FR_BALANCE.scoring.flawlessPerStage:0;
   score+=clear+time+flawless;
   addText('關卡分數 +'+(clear+time+flawless),CW/2,CH*.36,'#fde047',18,0);updateHUD();
  }
  return result;
 };

 const frBalancedDrawPlayer=drawPlayer;
 drawPlayer=function(){
  frBalancedDrawPlayer();
  const now=performance.now(),labels=[];
  if(player.frozenTimer>0)labels.push(['冰凍','#7dd3fc']);
  if(window.frSlowUntil&&now<window.frSlowUntil)labels.push(['緩速','#60a5fa']);
  if(window.frAttackDownUntil&&now<window.frAttackDownUntil)labels.push(['攻擊降低','#f59e0b']);
  if(player.burnTimer>0)labels.push(['灼燒','#ef4444']);
  if(player.poisoned)labels.push(['中毒','#84cc16']);
  if(labels.length){ctx.save();ctx.textAlign='center';ctx.font='900 10px sans-serif';labels.forEach(function(item,i){ctx.fillStyle=item[1];ctx.fillText(item[0],player.x,player.y-48-i*12);});ctx.restore();}
 };
 window.addEventListener('pagehide',function(){if(typeof frFlushQuestKills==='function')frFlushQuestKills(true);});
})();
`;
})();

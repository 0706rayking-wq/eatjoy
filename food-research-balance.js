(function () {
  const balance = {
    version: 1,
    progression: {
      maxStage: 22,
      cycleLength: 11,
      finalMap: 10,
      rollback: [
        { min: 22, max: 22, amount: 1 },
        { min: 19, max: 21, amount: 3 },
        { min: 16, max: 18, amount: 2 },
        { min: 9, max: 15, amount: 1 },
      ],
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
      foodDraw: 500,
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
      regenPerSecond: 2.5,
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
      poisonDurationMs: 20000,
    },
    training: {
      attackPerLevel: 0.05,
      defensePerLevel: 0.04,
      hpPerLevel: 12,
      staminaPerLevel: 6,
      critPerLevel: 0.03,
      rangedSpeedPerLevel: 0.015,
      meleeSpeedPerLevel: 0.02,
      critDamagePerLevel: 0.03,
      skillDamagePerLevel: 0.02,
    },
  };

  window.FOOD_RESEARCH_BALANCE = balance;

  const runtimePrelude = String.raw`
const FR_BALANCE=${JSON.stringify(balance)};
const FR_MOBILE_PERF=(window.matchMedia&&window.matchMedia('(pointer: coarse)').matches)||Math.min(window.innerWidth||9999,window.innerHeight||9999)<=520;
const FR_PERF={enemyBulletCap:FR_MOBILE_PERF?90:110,particleCap:FR_MOBILE_PERF?90:120,textCap:FR_MOBILE_PERF?20:25};
const FR_POISON_DURATION_MS=FR_BALANCE.combat.poisonDurationMs;
function frApplyPlayerPoison(){
 player.poisoned=true;player.poisonTick=0;window.frPoisonUntil=performance.now()+FR_POISON_DURATION_MS;
}
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
      .replace("Math.ceil(ch.hp)+' / '+ch.maxHp", "Math.ceil(Math.max(0,ch.hp))+' / '+ch.maxHp")
      .replace('const player={x:0,y:0,radius:22,', 'const player={x:0,y:0,radius:17,')
      .replace("if(pDist < this.r + player.radius && !player.poisoned) { player.poisoned = true; player.poisonTick = 0; addText('☠️中毒', player.x, player.y-30, '#a855f7'); }", "if(pDist < this.r + player.radius && !player.poisoned) { frApplyPlayerPoison(); addText('☠️中毒 20秒', player.x, player.y-30, '#a855f7'); }")
      .replace("if(player.poisoned) {\n if(boss && boss._defeated) { player.poisoned = false; player.poisonTick = 0; }", "if(player.poisoned) {\n if(!window.frPoisonUntil)window.frPoisonUntil=performance.now()+FR_POISON_DURATION_MS;\n if(performance.now()>=window.frPoisonUntil){player.poisoned=false;player.poisonTick=0;window.frPoisonUntil=0;addText('中毒解除',player.x,player.y-30,'#a3e635',13,-.5);}\n if(!player.poisoned){}\n else if(boss && boss._defeated) { player.poisoned = false; player.poisonTick = 0; window.frPoisonUntil=0; }")
      .replace('const shadowW=25+(moving?Math.cos(now/115)*2:Math.cos(now/360)*1.2);', 'const shadowW=21+(moving?Math.cos(now/115)*1.7:Math.cos(now/360));')
      .replace("ctx.fillStyle='rgba(80,90,82,.20)';ctx.beginPath();ctx.ellipse(0,29,shadowW,6.5,0,0,Math.PI*2);ctx.fill();", "ctx.fillStyle='rgba(80,90,82,.20)';ctx.beginPath();ctx.ellipse(0,25,shadowW,5.5,0,0,Math.PI*2);ctx.fill();")
      .replace('ctx.drawImage(heroNormalFloatImg,frame*HERO_FLOAT_FRAME_W,0,HERO_FLOAT_FRAME_W,HERO_FLOAT_FRAME_H,-45,-58,90,90);', 'ctx.drawImage(heroNormalFloatImg,frame*HERO_FLOAT_FRAME_W,0,HERO_FLOAT_FRAME_W,HERO_FLOAT_FRAME_H,-39,-51,78,78);')
      .replace('ctx.drawImage(heroNormalImg,-25,-42,50,58);', 'ctx.drawImage(heroNormalImg,-22,-37,44,51);')
      .replace('const STAM_REGEN=0.0005*(1+(tr.stamRegen||0)*.1);', 'const STAM_REGEN=(FR_BALANCE.stamina.regenPerSecond/1000)*(1+(tr.stamRegen||0)*FR_BALANCE.stamina.regenPerTrainingLevel);')
      .replace('const DODGE_COST=30;', 'const DODGE_COST=FR_BALANCE.stamina.dodgeCost;')
      .replace('let gold=0,score=0,stage=1,gameRunning=false,stageCleared=false;', "let gold=0,score=Number(SAVE.runScore||0),stage=1,gameRunning=false,stageCleared=false;let frBossDefeatedCount=0;const frRunStartedAt=Number(SAVE.runStartedAt||Date.now());const frRunId=String(SAVE.runId||'');")
      .replace('const goldChance=.5;', 'const goldChance=frEnemyCoinChance(this.type);')
      .replace('const earn=1+Math.floor(Math.random()*3);', 'const earn=frEnemyCoinAmount(this.type);')
      .replace('if(particles.length>200)particles.length=200;', 'if(particles.length>FR_PERF.particleCap)particles.splice(0,particles.length-FR_PERF.particleCap);')
      .replace('if(eBullets.length>120)eBullets.length=120;', 'if(eBullets.length>FR_PERF.enemyBulletCap)eBullets.length=FR_PERF.enemyBulletCap;')
      .replace('if(texts.length>25)texts.length=25;', 'if(texts.length>FR_PERF.textCap)texts.splice(0,texts.length-FR_PERF.textCap);')
      .replace('if(!bossSpawned)tickSpawner();tickRivalFight();', "if(!bossSpawned)tickSpawner();if(eBullets.some(function(b){return !b||typeof b.update!=='function';}))eBullets=eBullets.filter(function(b){return b&&typeof b.update==='function';});tickRivalFight();")
      .replace(/for\(let i=eBullets\.length-1;i>=0;i--\)\{const b=eBullets\[i\];b\.update\(\);/, "for(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];if(!b||typeof b.update!=='function'){eBullets.splice(i,1);continue;}b.update();")
      .replace('bullets.forEach(b=>b.draw());eBullets.forEach(b=>b.draw());', "bullets.forEach(b=>b.draw());eBullets.forEach(function(b){if(b&&typeof b.draw==='function')b.draw();});")
      .replace('if(eBullets.length>FR_PERF.enemyBulletCap)eBullets.length=FR_PERF.enemyBulletCap;', 'if(eBullets.length>FR_PERF.enemyBulletCap)eBullets.splice(0,eBullets.length-FR_PERF.enemyBulletCap);')
      .replace("function reportKill(){window.parent.postMessage({type:'FR_QUEST_KILL'},'*');}", "let frPendingQuestKills=0,frQuestKillTimer=0;function frFlushQuestKills(sync){if(frQuestKillTimer){clearTimeout(frQuestKillTimer);frQuestKillTimer=0;}if(!frPendingQuestKills&&!sync)return;const count=frPendingQuestKills;frPendingQuestKills=0;window.parent.postMessage({type:'FR_QUEST_KILL',count:count,flush:!!sync},'*');}function reportKill(){frPendingQuestKills++;if(frPendingQuestKills>=10)frFlushQuestKills(false);else if(!frQuestKillTimer)frQuestKillTimer=setTimeout(function(){frFlushQuestKills(false);},2500);}")
      .replace("function reportBossKill(){window.parent.postMessage({type:'FR_BOSS_KILLED',gold},'*');}", "function reportBossKill(){frFlushQuestKills(true);window.parent.postMessage({type:'FR_BOSS_KILLED',gold},'*');}")
      .replace("addText('+100💰'", "addText('+'+frBossCoinReward(stage)+'💰'")
      .replace('score+=this.scoreVal;gold+=100;updateHUD();reportBossKill();', 'score+=this.scoreVal;gold+=frBossCoinReward(stage);updateHUD();reportBossKill();')
      .replace(/ stageCleared=true;gameRunning=false;\n setTimeout\(\(\)=>\{[\s\S]*?\n \},600\);/, " stageCleared=true;gameRunning=false;\n window.frBeginStageClearTransition({stage:stage,bossName:this.name||'魔王',bossScore:Number(this.scoreVal)||0,bossGold:frBossCoinReward(stage),bossX:Number(this.x)||CW/2,bossY:Number(this.y)||CH*.24,bossColor:this.color||'#fde047',deathLine:(this._frStage11Enhanced&&this._frRootDef&&this._frRootDef.stage11Defeat)||(this._frRootDef&&this._frRootDef.death)||(this._frDef&&this._frDef.death)||'這一戰……是你贏了。'});")
      .replace('gold+=30;updateHUD();', 'const rivalGold=frRivalCoinReward(stage);gold+=rivalGold;score+=frRivalScore(stage);updateHUD();')
      .replace("addText('🎉全數擊敗！+30🪙'", "addText('🎉全數擊敗！+'+frRivalCoinReward(stage)+'🪙'")
      .replace("function goBackToCamp(){window.parent.postMessage({type:'FR_BACK_TO_CAMP',gold},'*');}", "function goBackToCamp(){frFlushQuestKills(true);window.parent.postMessage({type:'FR_BACK_TO_CAMP',gold,score,stage,maxStage:frHistoricalMaxStage,bossKills:frBossDefeatedCount,durationMs:Math.max(1000,Date.now()-frRunStartedAt),runId:frRunId,completed:!!window.frRunComplete,progress:frProgressPayload(),failure:frFailureSummary},'*');}")
      .replace('currentBgIdx=Math.floor(Math.random()*BG_THEMES.length);', 'currentBgIdx=frMapForStage(stage);')
      .replace(/currentBgIdx = pickInitialBgIdx\(\);/g, "currentBgIdx = SAVE.startMapIdx!=null ? pickInitialBgIdx() : frMapForStage(stage);")
      .replace('stage=Math.max(1,savedS);', 'stage=SAVE.testMode?Math.max(1,Math.min(FR_BALANCE.progression.maxStage,Number(SAVE.testStage)||FR_BALANCE.progression.maxStage)):Math.max(1,savedS);')
      .replace('stage=Math.max(1,savedStage-1)||1;score=0;', 'stage=SAVE.testMode?Math.max(1,Math.min(FR_BALANCE.progression.maxStage,Number(SAVE.testStage)||FR_BALANCE.progression.maxStage)):(savedStage>=8?savedStage:(Math.max(1,savedStage-1)||1));score=Number(SAVE.runScore||0);')
      .replace("window.parent.postMessage({type:'FR_PENALTY_RETURN',penalty:pen},'*');", "window.parent.postMessage({type:'FR_PENALTY_RETURN',penalty:pen,score:score,stage:(frFailureSummary&&frFailureSummary.rollbackStage)||stage,maxStage:frHistoricalMaxStage,bossKills:frBossDefeatedCount,progress:frProgressPayload(),failure:frFailureSummary},'*');")
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

    return out;
  };

  window.FOOD_RESEARCH_BALANCE_PATCH = String.raw`
;(function(){
 let frStageStartedAt=performance.now(),frStageHpDamage=0,frStageResultPending=null,frStageTransitionToken=0,frStageScoreAtStart=Number(score)||0;
 const frStageBestScores=Object.assign({},SAVE.stageBestScores||{});
 const frCreditedStages=new Set((SAVE.creditedStages||[]).map(Number).filter(Number.isFinite));
 const frUniqueBossStages=new Set((SAVE.uniqueBossStages||[]).map(Number).filter(Number.isFinite));
 const frScoreLegacyBase=Number.isFinite(Number(SAVE.scoreLegacyBase))?Number(SAVE.scoreLegacyBase):Math.max(0,Number(SAVE.runScore)||0);
 let frHistoricalMaxStage=Math.max(1,Number(SAVE.maxStage)||1),frFinalClearAwarded=!!SAVE.finalClearAwarded,frScoringMigrated=SAVE.scoreRulesVersion==='fr-stage-best-v2',frFailureSummary=null;
 frBossDefeatedCount=frUniqueBossStages.size;
 const frBgCache=document.createElement('canvas'),frBgCtx=frBgCache.getContext('2d');
 let frBgCacheKey='';

 function frFailureRollbackStage(value){
  const failed=Math.max(1,Math.min(FR_BALANCE.progression.maxStage,Math.round(Number(value)||1)));
  if(failed<=8)return failed;
  const rule=(FR_BALANCE.progression.rollback||[]).find(function(item){return failed>=item.min&&failed<=item.max;});
  return Math.max(8,failed-Math.max(0,Number(rule&&rule.amount)||0));
 }
 function frProgressPayload(){
  return {score:Math.max(0,Math.round(Number(score)||0)),stageBestScores:Object.assign({},frStageBestScores),creditedStages:Array.from(frCreditedStages).sort(function(a,b){return a-b;}),uniqueBossStages:Array.from(frUniqueBossStages).sort(function(a,b){return a-b;}),maxStage:Math.max(1,Math.min(22,Math.round(frHistoricalMaxStage||1))),scoreLegacyBase:Math.max(0,Math.round(frScoreLegacyBase)),scoreRulesVersion:'fr-stage-best-v2',finalClearAwarded:!!frFinalClearAwarded};
 }
 function frSyncStageProgress(){if(SAVE.testMode)return;window.parent.postMessage({type:'FR_STAGE_SCORE_UPDATE',progress:frProgressPayload()},'*');}
 function frInitializeScoring(startStage){
  const current=Math.max(1,Math.min(22,Math.round(Number(startStage)||1)));frHistoricalMaxStage=Math.max(frHistoricalMaxStage,current);
  if(frScoringMigrated)return;
  for(let s=1;s<current;s++)frUniqueBossStages.add(s);
  for(let s=11;s<current;s++)frCreditedStages.add(s);
  frBossDefeatedCount=frUniqueBossStages.size;frScoringMigrated=true;frSyncStageProgress();
 }
 function frHandlePartyFailure(){
  const failed=Math.max(1,Math.round(Number(stage)||1)),rollback=SAVE.testMode?failed:frFailureRollbackStage(failed),stageKey=SAVE.savedStageKey||('fr_stage_'+(SAVE.playerPhone||'guest'));
  score=Math.max(0,Math.round(Number(frStageScoreAtStart)||0));
  localStorage.setItem(stageKey,String(rollback));
  frFailureSummary={failedStage:failed,rollbackStage:rollback,rolledBack:rollback<failed};
  frSyncStageProgress();updateHUD();
 }
 function frRenderFailureRollback(){
  const modal=document.getElementById('revModal'),box=modal&&modal.querySelector('.mbox');if(!box||!frFailureSummary)return;
  let note=document.getElementById('frFailureRollbackNote');if(!note){note=document.createElement('div');note.id='frFailureRollbackNote';note.style.cssText='margin:0 0 10px;padding:9px 10px;border:1px solid #f87171;border-radius:9px;background:#450a0a;color:#fecaca;font-size:12px;font-weight:900;line-height:1.55';const title=box.querySelector('h2');if(title&&title.nextSibling)box.insertBefore(note,title.nextSibling);else box.prepend(note);}
  const info=frFailureSummary;note.textContent=info.rolledBack?('挑戰失敗：第 '+info.failedStage+' 關 → 退回第 '+info.rollbackStage+' 關，本關未完成分數不計。'):('挑戰失敗：留在第 '+info.failedStage+' 關，本關未完成分數不計。');
 }
 const frRollbackBaseFinalDeath=beginFinalDeathSequence;
 beginFinalDeathSequence=function(){frHandlePartyFailure();return frRollbackBaseFinalDeath.apply(this,arguments);};
 const frRollbackBaseRevival=showRevivalQuiz;
 showRevivalQuiz=function(){const result=frRollbackBaseRevival.apply(this,arguments);frRenderFailureRollback();return result;};

 function frEnsureStageTransitionUI(){
  let overlay=document.getElementById('frStageTransition');
  if(overlay)return overlay;
  if(!document.getElementById('frStageTransitionStyle')){
   const style=document.createElement('style');style.id='frStageTransitionStyle';
   style.textContent=[
    "#frStageTransition{position:absolute;inset:0;z-index:76;display:none;overflow:hidden;opacity:0;pointer-events:auto;color:#fff;font-family:'Segoe UI Emoji','Segoe UI Symbol','Segoe UI',sans-serif;touch-action:manipulation;contain:strict;isolation:isolate;transform:translateZ(0);transition:opacity .18s ease}",
    "#frStageTransition.fr-visible{opacity:1}",
    "#frStageTransition.fr-leaving{opacity:0}",
    "#frStageTransition .fr-st-shade{position:absolute;inset:0;background:rgba(6,10,20,.82);opacity:0;will-change:opacity;transition:opacity .24s ease}",
    "#frStageTransition.fr-phase-lastwords .fr-st-shade{opacity:.28}",
    "#frStageTransition.fr-phase-result .fr-st-shade,#frStageTransition.fr-phase-final .fr-st-shade{opacity:1}",
    "#gameCanvas.fr-stage-clear-motion{will-change:transform,opacity;animation:frCanvasRelease .5s cubic-bezier(.2,.72,.3,1) both}",
    "#frStageTransition .fr-st-death-frame{display:none}",
    "#frStageTransition .fr-st-death-fx{position:absolute;width:1px;height:1px;left:50%;top:24%;opacity:0;z-index:2}",
    "#frStageTransition.fr-phase-lastwords .fr-st-death-fx{opacity:1}",
    "#frStageTransition .fr-st-death-core{position:absolute;left:-31px;top:-31px;width:62px;height:62px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:40px;color:#fff;background:rgba(255,255,255,.9);box-shadow:0 0 22px var(--boss-color,#fde047);will-change:transform,opacity}",
    "#frStageTransition.fr-phase-lastwords .fr-st-death-core{animation:frBossVanish .65s ease-out forwards}",
    "#frStageTransition.fr-phase-lastwords.fr-special-11 .fr-st-death-core{border-radius:8px;background:transparent;font-size:58px;animation-name:frThunderRetreat;animation-duration:.75s;animation-timing-function:ease-in}",
    "#frStageTransition.fr-phase-lastwords.fr-special-22 .fr-st-death-core{background:#fff;box-shadow:0 0 28px #60a5fa;animation-name:frFinalVanish;animation-duration:.8s;animation-timing-function:ease-out}",
    "#frStageTransition .fr-st-fragment{position:absolute;left:-3px;top:-3px;width:6px;height:6px;background:#fff;transform:translate3d(0,0,0) rotate(0);opacity:1;will-change:transform,opacity}",
    "#frStageTransition.fr-phase-lastwords .fr-st-fragment{animation:frFragment .6s ease-out forwards}",
    "#frStageTransition .fr-st-map-preview{position:absolute;inset:-4% 0 0;background-position:center;background-size:cover;opacity:0;transform:translate3d(0,6%,0) scale(1.015);will-change:transform,opacity;transition:opacity .38s ease,transform .58s cubic-bezier(.2,.75,.25,1)}",
    "#frStageTransition.fr-phase-route .fr-st-map-preview,#frStageTransition.fr-phase-start .fr-st-map-preview{opacity:.46;transform:translate3d(0,0,0) scale(1)}",
    "#frStageTransition .fr-st-band{position:absolute;left:0;right:0;top:50%;z-index:4;padding:20px 12px 17px;text-align:center;background:rgba(8,14,28,.92);border-top:1px solid rgba(250,204,21,.72);border-bottom:1px solid rgba(250,204,21,.72);transform:translate3d(0,calc(-50% + 12px),0);opacity:0;will-change:transform,opacity;transition:transform .28s ease,opacity .24s ease}",
    "#frStageTransition.fr-phase-result .fr-st-band,#frStageTransition.fr-phase-final .fr-st-band{transform:translate3d(0,-50%,0);opacity:1}",
    "#frStageTransition .fr-st-band.fr-st-swap{animation:frStageSwap .3s ease}",
    "#frStageTransition .fr-st-kicker{font-size:11px;font-weight:900;color:#fde047;letter-spacing:0;margin-bottom:5px}",
    "#frStageTransition .fr-st-title{font-size:28px;line-height:1.16;font-weight:900;color:#fff;letter-spacing:0;text-shadow:0 0 18px rgba(250,204,21,.34)}",
    "#frStageTransition .fr-st-boss{font-size:14px;line-height:1.45;font-weight:800;color:#cbd5e1;margin-top:6px}",
    "#frStageTransition .fr-st-rewards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;width:min(100%,406px);margin:13px auto 0;background:rgba(148,163,184,.22);border:1px solid rgba(148,163,184,.2);border-radius:8px;overflow:hidden}",
    "#frStageTransition .fr-st-reward{min-width:0;padding:8px 3px;background:rgba(15,23,42,.94)}",
    "#frStageTransition .fr-st-reward-label{display:block;font-size:9px;font-weight:800;color:#94a3b8;margin-bottom:2px;white-space:nowrap}",
    "#frStageTransition .fr-st-reward-value{display:block;font-size:14px;font-weight:900;color:#fef08a;white-space:nowrap}",
    "#frStageTransition .fr-st-total{margin-top:8px;font-size:11px;font-weight:800;color:#cbd5e1}",
    "#frStageTransition .fr-st-total strong{font-size:15px;color:#fde047;margin-left:5px}",
    "#frStageTransition .fr-st-note{min-height:18px;margin-top:8px;font-size:11px;line-height:1.45;font-weight:800;color:#93c5fd}",
    "#frStageTransition .fr-st-last-words{position:absolute;left:6%;right:6%;bottom:21%;z-index:5;padding:10px 12px;border:1px solid rgba(255,255,255,.22);border-radius:8px;background:rgba(5,10,20,.84);font-size:15px;line-height:1.45;font-weight:900;text-align:center;text-shadow:0 1px 3px #000;opacity:0;transform:translate3d(0,6px,0);transition:opacity .5s ease,transform .5s ease}",
    "#frStageTransition.fr-phase-lastwords .fr-st-last-words{opacity:1;transform:translate3d(0,0,0)}",
    "#frStageTransition.fr-lastwords-fade .fr-st-last-words{opacity:0;transform:translate3d(0,4px,0)}",
    "#frStageTransition .fr-st-next-btn{display:none;width:min(100%,260px);margin:14px auto 0;padding:10px 14px;border:1px solid #facc15;border-radius:8px;background:#ca8a04;color:#fff;font-size:14px;font-weight:900;cursor:pointer;box-shadow:0 3px 0 #713f12}",
    "#frStageTransition.fr-phase-result .fr-st-next-btn,#frStageTransition.fr-phase-final .fr-st-next-btn{display:block}",
    "#frStageTransition .fr-st-next-btn:disabled{opacity:.55;cursor:wait}",
    "#frStageTransition .fr-st-curtain{position:absolute;inset:0;z-index:20;background:#030712;opacity:0;pointer-events:none;will-change:opacity;transition:opacity .35s ease}",
    "#frStageTransition.fr-switching .fr-st-curtain{opacity:1}",
    "#frStageTransition.fr-revealing .fr-st-curtain{opacity:0}",
    "#frStageTransition .fr-st-final-stats,#frStageTransition .fr-st-phases{display:none}",
    "#frStageTransition.fr-phase-final .fr-st-final-stats{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;width:min(100%,390px);margin:14px auto 0;border:1px solid rgba(148,163,184,.22);border-radius:8px;overflow:hidden;background:rgba(148,163,184,.22)}",
    "#frStageTransition .fr-st-final-stat{padding:8px 3px;background:rgba(15,23,42,.94)}",
    "#frStageTransition .fr-st-final-stat small{display:block;font-size:9px;color:#94a3b8;font-weight:800}",
    "#frStageTransition .fr-st-final-stat strong{display:block;margin-top:2px;font-size:15px;color:#fef08a;white-space:nowrap}",
    "#frStageTransition.fr-phase-final .fr-st-phases{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;width:min(100%,390px);margin:9px auto 0}",
    "#frStageTransition .fr-st-phase{padding:6px 2px;border:1px solid rgba(96,165,250,.45);border-radius:8px;background:rgba(30,58,138,.24);font-size:10px;font-weight:900;color:#bfdbfe;white-space:nowrap}",
    "#frStageTransition .fr-st-start{position:absolute;inset:0;z-index:5;display:flex;align-items:center;justify-content:center;font-size:42px;font-weight:900;color:#fff;text-shadow:0 0 18px #fde047,0 0 42px rgba(250,204,21,.8);opacity:0;transform:scale(.84)}",
    "#frStageTransition.fr-phase-start .fr-st-start{animation:frStartCue .5s ease-out forwards}",
    "#frStageTransition .fr-st-skip{position:absolute;z-index:6;left:0;right:0;bottom:28px;text-align:center;font-size:11px;font-weight:800;color:rgba(255,255,255,.64);opacity:0;transition:opacity .2s ease}",
    "#frStageTransition.fr-can-skip .fr-st-skip{opacity:1}",
    "@keyframes frCanvasRelease{0%{transform:translate3d(0,0,0) scale(1);opacity:1}45%{transform:translate3d(0,2px,0) scale(1.006);opacity:.96}100%{transform:translate3d(0,-4px,0) scale(1.012);opacity:.7}}",
    "@keyframes frBossVanish{0%{transform:scale(.75);opacity:.2}30%{transform:scale(1.22);opacity:1}100%{transform:scale(.12);opacity:0}}",
    "@keyframes frThunderRetreat{0%{transform:translateY(0) scale(.8);opacity:.2}35%{transform:translateY(-10px) scale(1.25);opacity:1}100%{transform:translateY(-180px) scale(.3);opacity:0}}",
    "@keyframes frFinalVanish{0%{transform:scale(.65);opacity:.3}35%{transform:scale(1.45);opacity:1}100%{transform:scale(2.4);opacity:0}}",
    "@keyframes frFragment{0%{transform:translate3d(0,0,0) rotate(0);opacity:1}100%{transform:translate3d(var(--dx),var(--dy),0) rotate(var(--rot));opacity:0}}",
    "@keyframes frStageSwap{0%{transform:translate3d(0,-50%,0);opacity:1}48%{transform:translate3d(0,calc(-50% - 10px),0);opacity:0}52%{transform:translate3d(0,calc(-50% + 10px),0);opacity:0}100%{transform:translate3d(0,-50%,0);opacity:1}}",
    "@keyframes frStartCue{0%{opacity:0;transform:scale(.84)}30%{opacity:1;transform:scale(1.08)}75%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.08)}}",
    "@media (prefers-reduced-motion:reduce){#frStageTransition,#frStageTransition *{animation-duration:.01ms!important;transition-duration:.01ms!important}}"
   ].join('\n');
   document.head.appendChild(style);
  }
  overlay=document.createElement('div');overlay.id='frStageTransition';overlay.setAttribute('role','status');overlay.setAttribute('aria-live','polite');
   overlay.innerHTML='<canvas class="fr-st-death-frame"></canvas><div class="fr-st-shade"></div><div class="fr-st-death-fx"><div class="fr-st-death-core">✦</div><div class="fr-st-fragments"></div></div><div class="fr-st-band"><div class="fr-st-kicker"></div><div class="fr-st-title"></div><div class="fr-st-boss"></div><div class="fr-st-rewards"><div class="fr-st-reward"><span class="fr-st-reward-label">金幣</span><span class="fr-st-reward-value fr-st-gold">+0</span></div><div class="fr-st-reward"><span class="fr-st-reward-label">關卡分數</span><span class="fr-st-reward-value fr-st-base-score">+0</span></div><div class="fr-st-reward"><span class="fr-st-reward-label">速通</span><span class="fr-st-reward-value fr-st-time">+0</span></div><div class="fr-st-reward"><span class="fr-st-reward-label">無傷</span><span class="fr-st-reward-value fr-st-flawless">未達成</span></div></div><div class="fr-st-total">排行榜增加<strong class="fr-st-score">+0</strong></div><div class="fr-st-final-stats"><div class="fr-st-final-stat"><small>遠征總分</small><strong class="fr-st-final-score">0</strong></div><div class="fr-st-final-stat"><small>帶回金幣</small><strong class="fr-st-final-gold">0</strong></div><div class="fr-st-final-stat"><small>通關時間</small><strong class="fr-st-final-time">0:00</strong></div></div><div class="fr-st-phases"><div class="fr-st-phase">披風形態 ✓</div><div class="fr-st-phase">雷鎧真身 ✓</div><div class="fr-st-phase">閃電化身 ✓</div></div><div class="fr-st-note"></div><button type="button" class="fr-st-next-btn">下一關</button></div><div class="fr-st-last-words"></div><div class="fr-st-curtain"></div>';
  document.getElementById('gc').appendChild(overlay);return overlay;
 }

 function frTransitionText(selector,value){const overlay=document.getElementById('frStageTransition'),node=overlay&&overlay.querySelector(selector);if(node)node.textContent=value;}
 function frAnimateTransitionBand(){const overlay=document.getElementById('frStageTransition'),band=overlay&&overlay.querySelector('.fr-st-band');if(!band)return;band.classList.remove('fr-st-swap');void band.offsetWidth;band.classList.add('fr-st-swap');}
 function frFormatTransitionTime(ms){const sec=Math.max(0,Math.floor((Number(ms)||0)/1000)),m=Math.floor(sec/60),s=String(sec%60).padStart(2,'0');return m+':'+s;}
 function frSpecialSeenKey(stageNum){return 'fr_transition_seen_'+stageNum+'_'+String(SAVE.playerPhone||'guest');}
 function frUpdateStageTransitionResult(result){
  if(!result)return;frStageResultPending=Object.assign({},frStageResultPending||{},result);
  const base=(Number(result.bossScore)||0)+(Number(result.clearScore)||0),time=Number(result.timeScore)||0,flawless=Number(result.flawlessScore)||0,total=Number(result.totalStageScore)||base+time+flawless;
  frTransitionText('.fr-st-gold','+'+Math.max(0,Math.round(result.bossGold||0)).toLocaleString());
  frTransitionText('.fr-st-base-score','+'+Math.max(0,Math.round(base)).toLocaleString());
  frTransitionText('.fr-st-time','+'+Math.max(0,Math.round(time)).toLocaleString());
  frTransitionText('.fr-st-flawless',flawless>0?'+'+Math.round(flawless).toLocaleString():'未達成');
  frTransitionText('.fr-st-score','+'+Math.max(0,Math.round(total)).toLocaleString());
 }

 function frStopClearedStageThreats(){
  if(Array.isArray(eBullets))eBullets.length=0;if(Array.isArray(bullets))bullets.length=0;if(Array.isArray(enemies))enemies.length=0;if(Array.isArray(hazards))hazards.length=0;
  if(typeof rivalFightActive!=='undefined')rivalFightActive=false;if(Array.isArray(rivalEnemies))rivalEnemies.length=0;
  if(player){player.invTimer=Math.max(player.invTimer||0,180);player.vx=0;player.vy=0;}
 }
 function frPrepareDeathFx(overlay,info,stageNum){
  const source=document.getElementById('gameCanvas'),fx=overlay.querySelector('.fr-st-death-fx'),core=overlay.querySelector('.fr-st-death-core'),fragments=overlay.querySelector('.fr-st-fragments');
  if(source){source.classList.remove('fr-stage-clear-motion');requestAnimationFrame(function(){if(document.documentElement.getAttribute('data-fr-stage-transition')==='active')source.classList.add('fr-stage-clear-motion');});}
  const x=Math.max(0,Math.min(CW,Number(info&&info.bossX)||CW/2)),y=Math.max(0,Math.min(CH,Number(info&&info.bossY)||CH*.24)),color=String(info&&info.bossColor||'#fde047');
  fx.style.left=(x/Math.max(1,CW)*100)+'%';fx.style.top=(y/Math.max(1,CH)*100)+'%';fx.style.setProperty('--boss-color',color);core.textContent=stageNum===11||stageNum===22?'⚡':'✦';
  fragments.innerHTML='';const batch=document.createDocumentFragment();for(let i=0;i<8;i++){const p=document.createElement('i'),a=Math.PI*2*i/8,dist=40+(i%3)*14;p.className='fr-st-fragment';p.style.setProperty('--dx',(Math.cos(a)*dist).toFixed(1)+'px');p.style.setProperty('--dy',(Math.sin(a)*dist).toFixed(1)+'px');p.style.setProperty('--rot',(90+i*61)+'deg');p.style.animationDelay=(i%2*.02)+'s';batch.appendChild(p);}fragments.appendChild(batch);
 }

 function frBeginStageClearTransition(info){
  const clearedStage=Math.max(1,Number(info&&info.stage)||stage),token=++frStageTransitionToken,finalStage=clearedStage>=FR_BALANCE.progression.maxStage,special11=clearedStage===11;
  const overlay=frEnsureStageTransitionUI(),rewards=overlay.querySelector('.fr-st-rewards'),totalRow=overlay.querySelector('.fr-st-total'),band=overlay.querySelector('.fr-st-band'),button=overlay.querySelector('.fr-st-next-btn');
  const nextStage=clearedStage+1,nextMap=finalStage?null:frMapForStage(nextStage),nextTheme=finalStage?null:BG_THEMES[nextMap];
  let assetsReady=finalStage,finished=false;
  const later=function(ms,fn){setTimeout(function(){if(token===frStageTransitionToken)fn();},ms);};
  frStopClearedStageThreats();frPrepareDeathFx(overlay,info,clearedStage);
  frStageResultPending={stage:clearedStage,bossName:info&&info.bossName||'魔王',bossGold:Number(info&&info.bossGold)||0,bossScore:Number(info&&info.bossScore)||0,clearScore:0,timeScore:0,flawlessScore:0,totalStageScore:Number(info&&info.bossScore)||0};
  document.documentElement.setAttribute('data-fr-stage-transition','active');
  band.style.display='';button.disabled=true;button.textContent=finalStage?'返回營地':'地圖載入中...';
  overlay.style.display='block';overlay.className=(special11?'fr-special-11 ':'')+(finalStage?'fr-special-22 ':'');overlay.setAttribute('data-phase','lastwords');overlay.setAttribute('data-stage',String(clearedStage));
  frTransitionText('.fr-st-last-words',(info&&info.bossName||'魔王')+'：「'+(info&&info.deathLine||'這一戰……是你贏了。')+'」');
  requestAnimationFrame(function(){if(token!==frStageTransitionToken)return;overlay.classList.add('fr-visible','fr-phase-lastwords');});

  function showResult(){
   if(token!==frStageTransitionToken)return;overlay.classList.remove('fr-phase-lastwords','fr-lastwords-fade');overlay.classList.add(finalStage?'fr-phase-final':'fr-phase-result');overlay.setAttribute('data-phase',finalStage?'final':'result');
   if(finalStage){
    rewards.style.display='none';totalRow.style.display='none';frTransitionText('.fr-st-kicker','遠征完成');frTransitionText('.fr-st-title','全 22 關制霸');frTransitionText('.fr-st-boss',(info&&info.bossName||'小雷神')+' · 三階段完全擊破');
    frTransitionText('.fr-st-final-score',Math.round(score).toLocaleString());frTransitionText('.fr-st-final-gold',Math.round(gold).toLocaleString());frTransitionText('.fr-st-final-time',frFormatTransitionTime(Date.now()-frRunStartedAt));frTransitionText('.fr-st-note','雷霆平息，準備返回營地');button.textContent='返回營地';button.disabled=false;
   }else{
    rewards.style.display='grid';totalRow.style.display='block';frTransitionText('.fr-st-kicker',special11?'雷光退去':'BOSS 擊破');frTransitionText('.fr-st-title','第 '+clearedStage+' 關突破');frTransitionText('.fr-st-boss',frStageResultPending.bossName);frUpdateStageTransitionResult(frStageResultPending);
    const scoreNote=frStageResultPending.scoreNote?(' · '+frStageResultPending.scoreNote):'';frTransitionText('.fr-st-note','下一關：'+(nextTheme?nextTheme.name:'未知區域')+(nextTheme&&nextTheme.text?' · '+nextTheme.text:'')+scoreNote);button.textContent=assetsReady?'下一關':'地圖載入中...';button.disabled=!assetsReady;
   }
  }
  function finishRegular(){
   if(finished||!assetsReady||token!==frStageTransitionToken)return;finished=true;button.disabled=true;overlay.classList.add('fr-switching');
   later(360,function(){
    stage=nextStage;localStorage.setItem(SAVE.savedStageKey||('fr_stage_'+(SAVE.playerPhone||'guest')),String(stage));buildStage(stage,true);player.invTimer=Math.max(player.invTimer||0,60);stageCleared=false;updateHUD();
    const gameCanvas=document.getElementById('gameCanvas');if(gameCanvas)gameCanvas.classList.remove('fr-stage-clear-motion');band.style.display='none';overlay.classList.remove('fr-switching','fr-phase-result');overlay.classList.add('fr-revealing');
    later(380,function(){overlay.style.display='none';overlay.className='';band.style.display='';document.documentElement.setAttribute('data-fr-stage-transition','ready');if(!window._gamePaused){gameRunning=true;last=performance.now();if(_rafId)cancelAnimationFrame(_rafId);_rafId=requestAnimationFrame(loop);}});
   });
  }
  function finishFinal(){if(finished)return;finished=true;button.disabled=true;overlay.classList.add('fr-switching');later(360,goBackToCamp);}

  later(2000,function(){overlay.classList.add('fr-lastwords-fade');});later(2550,showResult);
  if(finalStage){
   window.frRunComplete=true;if(!frFinalClearAwarded){score+=FR_BALANCE.scoring.runClear;frFinalClearAwarded=true;}frHistoricalMaxStage=22;const stageKey=SAVE.savedStageKey||('fr_stage_'+(SAVE.playerPhone||'guest'));localStorage.setItem(stageKey,'1');frSyncStageProgress();updateHUD();
  }else{
   currentBgIdx=nextMap;preloadBgTheme(currentBgIdx,function(){assetsReady=true;if(overlay.getAttribute('data-phase')==='result'){button.textContent='下一關';button.disabled=false;}});
  }
  button.onclick=finalStage?finishFinal:finishRegular;
 }
 window.frBeginStageClearTransition=frBeginStageClearTransition;
 window.frStageTransitionVersion='2026-09-01-dialogue-result-5';
 frEnsureStageTransitionUI();
 document.documentElement.setAttribute('data-fr-stage-transition','ready');

 function frPrepareStageAssets(){
  const theme=BG_THEMES[currentBgIdx],nextStage=Math.min(FR_BALANCE.progression.maxStage,Math.max(1,Number(stage)||1)+1),nextIdx=frMapForStage(nextStage),nextTheme=BG_THEMES[nextIdx],keepMaps={};
  if(theme&&theme.map)keepMaps[theme.map]=1;if(nextTheme&&nextTheme.map)keepMaps[nextTheme.map]=1;
  Object.keys(BG_MAP_IMAGES).forEach(function(src){
   if(!keepMaps[src]){const img=BG_MAP_IMAGES[src];if(img){img.onload=null;img.onerror=null;if(img.removeAttribute)img.removeAttribute('src');}delete BG_MAP_IMAGES[src];}
  });
  if(typeof frPreloadBossesForMap==='function')frPreloadBossesForMap(currentBgIdx);
  if(nextTheme&&nextTheme.map&&nextIdx!==currentBgIdx){const warmNextMap=function(){preloadBgTheme(nextIdx,function(){});};if(window.requestIdleCallback)requestIdleCallback(warmNextMap,{timeout:1200});else setTimeout(warmNextMap,350);}
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
   const stageNum=Math.max(1,Math.round(Number(stg||stage)||1)),c=frBalanceCurve(stageNum);
   const lateBossHp=stageNum>=19&&stageNum<=21?1.55:stageNum>=16&&stageNum<=18?1.40:stageNum>=12&&stageNum<=15?1.25:1;
   this.maxHp=Math.round(1100*c.bossHp*lateBossHp);this.hp=this.maxHp;
   this.maxShield=Math.round(this.maxHp*.28);this.shield=this.maxShield;
   this.scoreVal=frBossScore(stg||stage);updateBossHp();updateBossShield();
  }
 };

 const frBalancedBuildStage=buildStage;
 buildStage=function(s,keepPlayerPos){
  frBalancedBuildStage(s,keepPlayerPos);frPrepareStageAssets();frStageStartedAt=performance.now();frStageHpDamage=0;frFailureSummary=null;frInitializeScoring(s);frStageScoreAtStart=Math.max(0,Number(score)||0);
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
   const elapsed=Math.max(0,(performance.now()-frStageStartedAt)/1000),clear=frStageClearScore(stage);
   const target=48+stage*2.5,time=Math.max(0,Math.round(FR_BALANCE.scoring.timeBonusMax-Math.max(0,elapsed-target)*FR_BALANCE.scoring.timeBonusLossPerSecond));
   const flawless=frStageHpDamage<=0?FR_BALANCE.scoring.flawlessBase+stage*FR_BALANCE.scoring.flawlessPerStage:0;
   score+=clear+time+flawless;
   const stageNum=Math.max(1,Math.round(Number(stage)||1)),rawStageScore=Math.max(0,Math.round(score-frStageScoreAtStart)),hadCredit=frCreditedStages.has(stageNum),hasRecordedBest=Object.prototype.hasOwnProperty.call(frStageBestScores,String(stageNum)),oldBest=Math.max(0,Number(frStageBestScores[stageNum])||0);
   let awarded=rawStageScore,scoreNote='首次通關完整計分';
   if(hadCredit){
    if(!hasRecordedBest){awarded=0;scoreNote='既有通關已計分';}
    else{awarded=Math.max(0,rawStageScore-oldBest);scoreNote=awarded>0?('刷新本關最佳，只增加 '+awarded.toLocaleString()+' 分'):'未超越本關最佳，不重複計分';}
   }
   score=frStageScoreAtStart+awarded;
   if(!hasRecordedBest||rawStageScore>oldBest)frStageBestScores[stageNum]=rawStageScore;
   frCreditedStages.add(stageNum);frHistoricalMaxStage=Math.max(frHistoricalMaxStage,Math.min(22,stageNum+1));
   if(!frUniqueBossStages.has(stageNum)){frUniqueBossStages.add(stageNum);frBossDefeatedCount=frUniqueBossStages.size;}
   frUpdateStageTransitionResult({stage:stageNum,bossName:this.name||'魔王',bossGold:frBossCoinReward(stageNum),bossScore:Number(this.scoreVal)||0,clearScore:clear,timeScore:time,flawlessScore:flawless,totalStageScore:awarded,rawStageScore:rawStageScore,previousBest:oldBest,scoreNote:scoreNote});
   addText(awarded>0?('排行榜 +'+awarded):'本關已計分',CW/2,CH*.36,awarded>0?'#fde047':'#93c5fd',18,0);frSyncStageProgress();updateHUD();
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

(function () {
  const catalog = [
    { id:'a01', name:'猛火御守', emoji:'🔥', desc:'攻擊力 +8%', effects:{ attack:0.08 } },
    { id:'a02', name:'鐵壁御守', emoji:'🛡️', desc:'受到的傷害 -8%', effects:{ defense:0.08 } },
    { id:'a03', name:'長生御守', emoji:'❤️', desc:'最大 HP +30', effects:{ maxHp:30 } },
    { id:'a04', name:'氣海御守', emoji:'⚡', desc:'最大氣力 +18', effects:{ maxStamina:18 } },
    { id:'a05', name:'息吹御守', emoji:'🌬️', desc:'氣力回復速度 +20%', effects:{ staminaRegen:0.20 } },
    { id:'a06', name:'鷹眼御守', emoji:'🎯', desc:'暴擊率 +6%', effects:{ crit:0.06 } },
    { id:'a07', name:'武神御守', emoji:'⚔️', desc:'近戰武器傷害 +15%', effects:{ meleeDamage:0.15 } },
    { id:'a08', name:'替身御守', emoji:'🪆', desc:'每次遠征抵擋 1 次致命攻擊，保留 1 HP', effects:{ lethalGuard:1 } },
    { id:'a09', name:'招財御守', emoji:'🪙', desc:'擊敗敵人有 10% 機率額外獲得 1 金幣', effects:{ extraCoinChance:0.10 } },
    { id:'a10', name:'逆境御守', emoji:'🩸', desc:'HP 越低攻擊越高，最高 +25%', effects:{ lowHpAttack:0.25 } },
    { id:'a11', name:'甘露御守', emoji:'💧', desc:'每 3 秒回復最大 HP 的 2%', effects:{ hpRegenPct:0.02 } },
    { id:'a12', name:'迅擊御守', emoji:'💨', desc:'攻擊速度 +8%', effects:{ attackSpeed:0.08 } },
    { id:'a13', name:'風行御守', emoji:'🍃', desc:'移動速度 +8%', effects:{ moveSpeed:0.08 } },
    { id:'a14', name:'羈絆御守', emoji:'🤝', desc:'每有 1 名夥伴陣亡，攻擊力 +12%，最多 +24%', effects:{ fallenAttack:0.12 } },
    { id:'a15', name:'吸生御守', emoji:'🩹', desc:'物理攻擊命中回復 1 HP，0.6 秒內最多觸發 1 次', effects:{ lifeSteal:1 } },
    { id:'a16', name:'破障御守', emoji:'🔨', desc:'對護盾造成的傷害 +25%', effects:{ shieldDamage:0.25 } },
    { id:'a17', name:'星芒御守', emoji:'✨', desc:'暴擊率 +5%，暴擊傷害 +15%', effects:{ crit:0.05, critDamage:0.15 } },
    { id:'a18', name:'殘影御守', emoji:'👣', desc:'迴避無敵時間 +20%', effects:{ dodgeDuration:0.20 } },
    { id:'a19', name:'鎮魂御守', emoji:'🔔', desc:'攻擊有 6% 機率使敵人暈眩 0.8 秒', effects:{ stunChance:0.06 } },
    { id:'a20', name:'影分身御守', emoji:'👥', desc:'召喚小分身，每 0.9 秒複製 25% 火力', effects:{ cloneFire:0.25 } },
    { id:'a21', name:'清淨御守', emoji:'🪷', desc:'受到的灼燒與中毒傷害 -50%', effects:{ statusResist:0.50 } },
    { id:'a22', name:'狂風御守', emoji:'🌪️', desc:'擊敗敵人後攻擊速度 +15%，持續 3 秒', effects:{ killHaste:0.15 } },
    { id:'a23', name:'穿雲御守', emoji:'🏹', desc:'每第 6 發子彈獲得 1 次貫穿', effects:{ sixthPierce:6 } },
    { id:'a24', name:'連擊御守', emoji:'🔗', desc:'連續命中每層傷害 +2%，最多 10 層，1.5 秒未命中重置', effects:{ comboDamage:0.02 } },
    { id:'a25', name:'處刑御守', emoji:'🗡️', desc:'對 HP 低於 30% 的敵人傷害 +15%', effects:{ executeDamage:0.15 } },
    { id:'a26', name:'巨刃御守', emoji:'🥢', desc:'近戰攻擊範圍 +15%', effects:{ meleeRange:0.15 } },
    { id:'a27', name:'彈心御守', emoji:'🔵', desc:'遠程子彈尺寸 +15%', effects:{ projectileSize:0.15 } },
    { id:'a28', name:'爆破御守', emoji:'💥', desc:'擊敗敵人有 10% 機率爆破，對周圍造成 30 傷害', effects:{ deathExplosion:0.10, explosionDamage:30 } },
    { id:'a29', name:'磁引御守', emoji:'🧲', desc:'金幣吸附範圍 +60%', effects:{ coinMagnet:0.60 } },
    { id:'a30', name:'金剛御守', emoji:'💎', desc:'每 15 秒生成 18 點防護罩', effects:{ autoShield:18 } },
  ];

  const effectKeys = [...new Set(catalog.flatMap(item => Object.keys(item.effects)))];
  const byName = Object.fromEntries(catalog.map(item => [item.name, item]));
  const descriptions = Object.fromEntries(catalog.map(item => [item.name, item.desc]));

  function calc(names) {
    const bonus = Object.fromEntries(effectKeys.map(key => [key, 0]));
    (Array.isArray(names) ? names : []).forEach(name => {
      const item = byName[name];
      if (!item) return;
      Object.entries(item.effects).forEach(([key, value]) => { bonus[key] = (bonus[key] || 0) + value; });
    });
    return bonus;
  }

  window.FOOD_RESEARCH_AMULETS = catalog;
  window.FOOD_RESEARCH_AMULET_MAP = byName;
  window.FOOD_RESEARCH_AMULET_DESCRIPTIONS = descriptions;
  window.FOOD_RESEARCH_CALC_AMULETS = calc;
  window.FOOD_RESEARCH_AMULET_SCHEMA_VERSION = 2;

  window.FOOD_RESEARCH_APPLY_AMULET_PATCH = function (body) {
    return body
      .replace('const maxStamina=100+stamBonus;', 'let maxStamina=100+stamBonus;')
      .replace('player.burnTimer--; if(player.burnTimer % 60 === 0) hurtPlayer(10);', "player.burnTimer--; if(player.burnTimer % 60 === 0) hurtPlayer(10*(1-(frActiveAmuletBonus().statusResist||0)));")
      .replace('player.hp-=3;if(charSlots[activeChar])', "player.hp-=Math.max(1,Math.ceil(3*(1-(frActiveAmuletBonus().statusResist||0))));if(charSlots[activeChar])");
  };

  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(catalog))));
  window.FOOD_RESEARCH_AMULET_PATCH = String.raw`
;(function(){
 const FR_AMULETS=JSON.parse(decodeURIComponent(escape(atob('${encoded}'))));
 const FR_AMULET_MAP=Object.fromEntries(FR_AMULETS.map(function(item){return [item.name,item];}));
 const FR_EFFECT_KEYS=[...new Set(FR_AMULETS.flatMap(function(item){return Object.keys(item.effects||{});}))];
 function frCalcAmulets(names){
  const b=Object.fromEntries(FR_EFFECT_KEYS.map(function(key){return [key,0];}));
  (Array.isArray(names)?names:[]).forEach(function(name){const item=FR_AMULET_MAP[name];if(!item)return;Object.entries(item.effects||{}).forEach(function(entry){b[entry[0]]=(b[entry[0]]||0)+entry[1];});});
  return b;
 }
 function frActiveAmuletBonus(){
  if(charSlots&&charSlots[activeChar]&&charSlots[activeChar].amuletBonus)return charSlots[activeChar].amuletBonus;
  return frCalcAmulets(((SAVE.equip||{}).amulets||[]).filter(Boolean));
 }
 window.frActiveAmuletBonus=frActiveAmuletBonus;
 const frState={shots:0,combo:0,lastHit:0,lastHeal:0,killHasteUntil:0,fallen:0,lastClone:0,lastRegen:0,lastShield:0};

 const frInitCharSlots=initCharSlots;
 initCharSlots=function(){
  frInitCharSlots();
  charSlots.forEach(function(ch,index){
   const names=index===0?(((SAVE.equip||{}).amulets||[]).filter(Boolean)):((((ch.equip||{}).amulets)||[]).filter(Boolean));
   const b=frCalcAmulets(names);ch.amuletBonus=b;
   if(b.maxHp){ch.maxHp+=b.maxHp;ch.hp+=b.maxHp;}
   ch.atkMult=(ch.atkMult||1)*(1+(b.attack||0));
  });
  const ch=charSlots[activeChar];
  if(ch){player.maxHp=ch.maxHp;player.hp=ch.hp;window._curAtkMult=ch.atkMult||1;window._curDefMult=ch.defMult||1;maxStamina=100+((ch.training||tr).stam||0)*10+(ch.amuletBonus.maxStamina||0);stamina=maxStamina;frState.lastRegen=performance.now();frState.lastShield=performance.now();}
  updateHUD();
 };

 const frSetForm=setForm;
 setForm=function(fid){frSetForm(fid);const b=frActiveAmuletBonus();player.speed*=1+(b.moveSpeed||0);};
 const frSwitchToChar=switchToChar;
 switchToChar=function(slotIdx){frSwitchToChar(slotIdx);const ch=charSlots[activeChar];if(!ch)return;const b=frActiveAmuletBonus();player.speed*=1+(b.moveSpeed||0);maxStamina=100+((ch.training||tr).stam||0)*10+(b.maxStamina||0);stamina=Math.min(stamina,maxStamina);updateHUD();};

 const frHurtPlayer=hurtPlayer;
 hurtPlayer=function(raw){const b=frActiveAmuletBonus();return frHurtPlayer(raw*(1-(b.defense||0)));};
 const frPlayerDied=playerDied;
 playerDied=function(){
  const ch=charSlots&&charSlots[activeChar];const b=frActiveAmuletBonus();
  if(ch&&b.lethalGuard&&!ch._frLethalUsed){ch._frLethalUsed=true;player.hp=1;ch.hp=1;player.invTimer=120;player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,12);addText('替身！保留 1 HP',player.x,player.y-35,'#d8b4fe',16,-.5);burst(player.x,player.y,'#d8b4fe',18);updateHUD();return;}
  const aliveBefore=(charSlots||[]).filter(function(item){return item&&item.alive;}).length;
  frPlayerDied();
  const aliveAfter=(charSlots||[]).filter(function(item){return item&&item.alive;}).length;
  if(aliveAfter<aliveBefore){frState.fallen=Math.min(2,frState.fallen+1);const next=charSlots[activeChar];if(next&&next.alive){const nextBonus=frActiveAmuletBonus();player.speed*=1+(nextBonus.moveSpeed||0);maxStamina=FR_BALANCE.stamina.base+((next.training||tr).stam||0)*FR_BALANCE.stamina.perTrainingLevel+(nextBonus.maxStamina||0);stamina=Math.min(stamina,maxStamina);window._curAtkMult=next.atkMult||1;window._curDefMult=next.defMult||1;updateHUD();}}
 };

 function frDamageMultiplier(target){
  const b=frActiveAmuletBonus();let mult=1;
  if(currentWeapon==='melee')mult*=1+(b.meleeDamage||0);
  if(b.lowHpAttack&&player.maxHp>0)mult*=1+b.lowHpAttack*(1-Math.max(0,player.hp)/player.maxHp);
  if(b.fallenAttack)mult*=1+b.fallenAttack*Math.min(2,frState.fallen);
  const now=performance.now();if(now-frState.lastHit>1500)frState.combo=0;
  if(b.comboDamage)mult*=1+b.comboDamage*Math.min(10,frState.combo);
  if(target&&target.maxHp&&target.hp/target.maxHp<=.3)mult*=1+(b.executeDamage||0);
  const critChance=Math.min(FR_BALANCE.combat.critChanceCap,(b.crit||0)+((((charSlots[activeChar]||{}).training||tr).crit||0)*FR_BALANCE.training.critPerLevel));
  if(Math.random()<critChance){mult*=FR_BALANCE.combat.critMultiplier+(b.critDamage||0);addText('暴擊 '+Math.round((FR_BALANCE.combat.critMultiplier+(b.critDamage||0))*100)+'%',target.x,target.y-22,'#fbbf24',14,-.6);}
  return mult;
 }
 function frAfterHit(target,wasAlive){
  const b=frActiveAmuletBonus(),now=performance.now();frState.combo=now-frState.lastHit<=1500?Math.min(10,frState.combo+1):1;frState.lastHit=now;
  if(b.stunChance&&Math.random()<b.stunChance){target.frozenTimer=Math.max(target.frozenTimer||0,48);addText('暈眩',target.x,target.y-18,'#facc15',12,-.5);}
  if(b.lifeSteal&&now-frState.lastHeal>=600&&player.hp>0&&player.hp<player.maxHp){frState.lastHeal=now;player.hp=Math.min(player.maxHp,player.hp+b.lifeSteal);if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;addText('+1 HP',player.x,player.y-22,'#4ade80',11,-.45);}
  if(wasAlive&&target.hp<=0){
   if(b.extraCoinChance&&Math.random()<b.extraCoinChance){gold+=1;addText('+1 額外金幣',target.x,target.y-30,'#fde047',11,-.5);updateHUD();}
   if(b.killHaste)frState.killHasteUntil=now+3000;
   if(b.deathExplosion&&Math.random()<b.deathExplosion){const blast=b.explosionDamage||30;burst(target.x,target.y,'#fb923c',22);enemies.forEach(function(enemy){if(enemy!==target&&enemy.hp>0&&Math.hypot(enemy.x-target.x,enemy.y-target.y)<=90)enemy.takeDamage(blast);});if(boss&&!boss._defeated&&Math.hypot(boss.x-target.x,boss.y-target.y)<=90)boss.takeDamage(blast);}
  }
 }
 const frEnemyTakeDamage=Enemy.prototype.takeDamage;
 Enemy.prototype.takeDamage=function(amt){const wasAlive=this.hp>0;frEnemyTakeDamage.call(this,amt*frDamageMultiplier(this));frAfterHit(this,wasAlive);};
 const frBossTakeDamage=Boss.prototype.takeDamage;
 Boss.prototype.takeDamage=function(amt,isQa){const b=frActiveAmuletBonus();const wasAlive=this.hp>0&&!this._defeated;let value=amt*frDamageMultiplier(this);if(this.shield>0&&!this.shieldBroken)value*=1+(b.shieldDamage||0);frBossTakeDamage.call(this,value,isQa);frAfterHit(this,wasAlive);};

 const frAutoFire=autoFire;
 autoFire=function(){const before=player.weaponCd;frAutoFire();if(player.weaponCd>before){const b=frActiveAmuletBonus();const haste=(b.attackSpeed||0)+(performance.now()<frState.killHasteUntil?(b.killHaste||0):0);player.weaponCd=Math.max(1,Math.round(player.weaponCd/(1+haste)));}};
 const frFire=fire;
 fire=function(x,y,vx,vy,color,dmg,r,pierce,homing){const b=frActiveAmuletBonus();frState.shots++;const forcePierce=b.sixthPierce&&frState.shots%b.sixthPierce===0;return frFire(x,y,vx,vy,color,dmg,r*(1+(b.projectileSize||0)),pierce||forcePierce,homing);};
 if(typeof makeShot==='function'){
  const frMakeShot=makeShot;
  makeShot=function(def,angle,dmgScale,sizeScale,speedScale){const b=frActiveAmuletBonus();frState.shots++;const shot=frMakeShot(def,angle,dmgScale,(sizeScale||1)*(1+(b.projectileSize||0)),speedScale);if(b.sixthPierce&&frState.shots%b.sixthPierce===0)shot.pierce=true;return shot;};
 }
 const frMeleeCanHit=meleeCanHit;
 meleeCanHit=function(target,extra){const b=frActiveAmuletBonus();return frMeleeCanHit(target,(extra||0)+128*(b.meleeRange||0));};
 const frMeleeCanReflect=meleeCanReflect;
 meleeCanReflect=function(bullet){const b=frActiveAmuletBonus();if(!b.meleeRange)return frMeleeCanReflect(bullet);const dx=bullet.x-player.x,dy=bullet.y-player.y;return Math.hypot(dx,dy)<150*(1+b.meleeRange)+(bullet.r||0)&&dy<58;};
 if(typeof meleeTargetHit==='function'){
  const frMeleeTargetHit=meleeTargetHit;
  meleeTargetHit=function(def,target,extra){const b=frActiveAmuletBonus();if(!b.meleeRange)return frMeleeTargetHit(def,target,extra);const boosted=Object.assign({},def,{range:(def.range||128)*(1+b.meleeRange)});return frMeleeTargetHit(boosted,target,extra);};
 }
 const frDoDodge=doDodge;
 doDodge=function(){frDoDodge();const b=frActiveAmuletBonus();if(player.dodging&&b.dodgeDuration)player.invTimer=Math.max(player.invTimer,Math.round(60*(1+b.dodgeDuration)));};
 if(typeof dodge==='function'){const frDodge=dodge;dodge=function(){frDodge();const b=frActiveAmuletBonus();if(b.dodgeDuration)player.invTimer=Math.max(player.invTimer,Math.round(60*(1+b.dodgeDuration)));};}

 const frCoinUpdate=Coin.prototype.update;
 Coin.prototype.update=function(){frCoinUpdate.call(this);const b=frActiveAmuletBonus();if(!b.coinMagnet)return;const dx=player.x-this.x,dy=player.y-this.y,d=Math.hypot(dx,dy);if(d<180*(1+b.coinMagnet)){this.vx+=dx*.008;this.vy+=dy*.008;}};
 const frDrawPlayer=drawPlayer;
 drawPlayer=function(){
  const b=frActiveAmuletBonus();
  if(b.cloneFire){ctx.save();ctx.globalAlpha=.42;ctx.fillStyle='#c4b5fd';ctx.shadowBlur=12;ctx.shadowColor='#8b5cf6';ctx.beginPath();ctx.arc(player.x-38,player.y+12,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='14px Segoe UI Emoji, sans-serif';ctx.textAlign='center';ctx.fillText(currentForm.emoji||'✨',player.x-38,player.y+17);ctx.restore();}
  frDrawPlayer();
 };
 setInterval(function(){
  if(!gameRunning||!player||player.hp<=0)return;
  const b=frActiveAmuletBonus(),now=performance.now();
  const ch=charSlots[activeChar],training=(ch&&ch.training)||tr;
  if(b.staminaRegen)stamina=Math.min(maxStamina,stamina+FR_BALANCE.stamina.regenPerSecond*.05*(1+(training.stamRegen||0)*FR_BALANCE.stamina.regenPerTrainingLevel)*b.staminaRegen);
  if(b.hpRegenPct&&now-frState.lastRegen>=3000){frState.lastRegen=now;const heal=Math.max(1,Math.ceil(player.maxHp*b.hpRegenPct));player.hp=Math.min(player.maxHp,player.hp+heal);if(ch)ch.hp=player.hp;addText('+'+heal+' HP',player.x,player.y-24,'#4ade80',11,-.45);updateHUD();}
  if(b.autoShield&&now-frState.lastShield>=15000){frState.lastShield=now;player.shieldActive=true;player.shieldHp=Math.max(player.shieldHp||0,b.autoShield);addText('金剛護盾',player.x,player.y-28,'#67e8f9',12,-.5);burst(player.x,player.y,'#67e8f9',12);}
  if(b.cloneFire&&now-frState.lastClone>=900&&!qaActive){frState.lastClone=now;const target=findClosest(player.x-38,player.y+12,500);if(target){const a=Math.atan2(target.y-(player.y+12),target.x-(player.x-38));fire(player.x-38,player.y+12,Math.cos(a)*9,Math.sin(a)*9,'#a78bfa',(currentForm.bulletDmg||12)*b.cloneFire,4,true,false);}}
 },50);
})();
`;
})();

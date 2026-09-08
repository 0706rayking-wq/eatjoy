(function(){
 window.FOOD_RESEARCH_AWAKENING_PATCH=String.raw`
(()=>{
 const AW_NAMES={atk:'風靈降世',def:'金剛護符',hp:'菌癒恩賜',stam:'元氣疾行',stamRegen:'迴氣返流',crit:'虛空噬痕',rangedSpeed:'遠獵財運',meleeSpeed:'斷空劍意',critDamage:'雙極會心',skillPower:'奧義殘響'};
 const aw={drops:[],spirits:[],rifts:[],slashes:[],blasts:[],moveUntil:0,shieldCharges:0,repeat:false,frame:0};
 const riftGlow=document.createElement('canvas');riftGlow.width=riftGlow.height=160;
 const riftGlowCtx=riftGlow.getContext('2d'),riftGradient=riftGlowCtx.createRadialGradient(80,80,4,80,80,76);
 riftGradient.addColorStop(0,'rgba(15,23,42,.95)');riftGradient.addColorStop(.5,'rgba(88,28,135,.72)');riftGradient.addColorStop(1,'rgba(167,139,250,0)');
 riftGlowCtx.fillStyle=riftGradient;riftGlowCtx.fillRect(0,0,160,160);
 function training(){const ch=typeof charSlots!=='undefined'&&charSlots[activeChar];return ch&&ch.training?ch.training:(typeof tr!=='undefined'?tr:{});}
 function awake(key){return Number(training()[key]||0)>=10;}
 function cue(name,x,y,color){if(typeof addText==='function')addText(name,x,y-28,color||'#fde68a',12,-.38);}
 function targets(){const list=(typeof enemies!=='undefined'?enemies.filter(e=>e&&e.hp>0):[]);if(typeof boss!=='undefined'&&boss&&!boss._defeated&&boss.hp>0)list.push(boss);return list;}
 function nearest(x,y){return targets().sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];}
 function drop(kind,x,y){aw.drops.push({kind,x:Math.max(24,Math.min(CW-24,x)),y:Math.max(45,y),vy:1.7,until:performance.now()+14000,born:performance.now()});}
 function onKill(e){if(e._frAwRewarded)return;e._frAwRewarded=true;const x=e.x||CW/2,y=e.y||CH*.35;
  if(awake('atk')&&!aw.spirits.length&&Math.random()<.01){aw.spirits.push({x,y,hp:70,maxHp:70,next:0,until:performance.now()+10000,phase:Math.random()*6});cue(AW_NAMES.atk,x,y,'#86efac');}
  if(awake('def')&&Math.random()<.01)drop('shield',x,y);
  if(awake('hp')&&Math.random()<.01)drop('mushroom',x,y);
  if(awake('stam')&&Math.random()<.01)drop('pill',x,y);
  if(awake('rangedSpeed')&&Math.random()<.01)drop('gold',x,y);
  if(awake('crit')&&Math.random()<.01){aw.rifts.push({x,y,r:70,pullR:180,until:performance.now()+2000,next:0,phase:Math.random()*6});cue(AW_NAMES.crit,x,y,'#c4b5fd');}
 }
 if(typeof Enemy!=='undefined'){const base=Enemy.prototype.takeDamage;Enemy.prototype.takeDamage=function(v){const alive=this.hp>0,r=base.apply(this,arguments);if(alive&&this.hp<=0)onKill(this);return r;};}
 const baseDodge=doDodge;doDodge=function(){const was=player.dodging,r=baseDodge.apply(this,arguments);if(!was&&player.dodging&&awake('stamRegen')&&Math.random()<.01){stamina=Math.min(maxStamina,stamina+30);cue(AW_NAMES.stamRegen,player.x,player.y,'#67e8f9');updateHUD();}return r;};
 const baseHurt=hurtPlayer;hurtPlayer=function(v){if(aw.shieldCharges>0&&v>0){aw.shieldCharges--;cue('金剛護符・減傷',player.x,player.y,'#93c5fd');return baseHurt.call(this,v*.1);}return baseHurt.apply(this,arguments);};
 const baseMove=frFormMoveMultiplier;frFormMoveMultiplier=function(){return baseMove.apply(this,arguments)*(performance.now()<aw.moveUntil?1.25:1);};
 function spawnGraySlash(angle){const length=Math.max(CW,CH)*1.15,x1=player.x,y1=player.y,x2=x1+Math.cos(angle)*length,y2=y1+Math.sin(angle)*length;if(typeof frSlashFx==='function'&&typeof frBoltFx==='function'){frSlashFx(x1,y1,'#9ca3af',length,angle,620,0,18);frBoltFx(x1,y1,x2,y2,'#e5e7eb',460,0,6);}else aw.slashes.push({x1,y1,x2,y2,until:performance.now()+620});targets().forEach(t=>{const dx=x2-x1,dy=y2-y1,len2=dx*dx+dy*dy,q=Math.max(0,Math.min(1,((t.x-x1)*dx+(t.y-y1)*dy)/len2)),d=Math.hypot(t.x-(x1+dx*q),t.y-(y1+dy*q));if(d<=28+(t.r||18))t.takeDamage(100);});cue(AW_NAMES.meleeSpeed,player.x,player.y,'#d1d5db');}
 window.frAwakenReflectedBullet=function(b){if(awake('meleeSpeed')&&Math.random()<.01)spawnGraySlash(Math.atan2(b.vy||-1,b.vx||0));};
 window.frAwakenMeleeTrueStrike=function(t){if(awake('meleeSpeed')&&Math.random()<.01)spawnGraySlash(Math.atan2(t.y-player.y,t.x-player.x));return false;};
 window.frAwakenMeleeWave=function(def){if(!awake('critDamage')||Math.random()>=.01)return;const w=44,x=player.x;for(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];if(b.y<=player.y&&Math.abs(b.x-x)<=w+(b.r||5))eBullets.splice(i,1);}aw.blasts.push({kind:'wave',x,y:player.y,until:performance.now()+550});cue('會心劍氣',x,player.y,'#e0f2fe');};
 function markRanged(b){if(b&&currentWeapon==='ranged'&&awake('critDamage')&&Math.random()<.01)b.frAwBlast=true;return b;}
 if(typeof makeShot==='function'){const bm=makeShot;makeShot=function(){return markRanged(bm.apply(this,arguments));};}
 window.frAwakenRangedBulletHit=function(b,t){t.takeDamage(b.dmg);if(!b.frAwBlast||b.frAwBlasted)return;b.frAwBlasted=true;aw.blasts.push({kind:'blast',x:b.x,y:b.y,until:performance.now()+420});targets().forEach(e=>{if(Math.hypot(e.x-b.x,e.y-b.y)<=50+(e.r||18))e.takeDamage(50);});cue('會心爆破',b.x,b.y,'#fca5a5');};
 function wrapSkill(level,name){const base=window[name];window[name]=function(){const before=level===1?sk1Cd:sk2Cd,isRepeat=aw.repeat,r=base.apply(this,arguments),after=level===1?sk1Cd:sk2Cd;if(!isRepeat&&after>before&&awake('skillPower')&&Math.random()<.01){aw.repeat=true;setTimeout(()=>{if(gameRunning){window.frAwakeningRepeatCast=level;window[name]();}aw.repeat=false;},160);}return r;};}
 wrapSkill(1,'useSkill1');wrapSkill(2,'useSkill2');
 function updateAw(now){
  aw.frame=(aw.frame+1)%3;const pullFrame=aw.frame===0;
  for(let i=aw.drops.length-1;i>=0;i--){const p=aw.drops[i];p.y=Math.min(CH-28,p.y+p.vy);p.x+=Math.max(-.65,Math.min(.65,(player.x-p.x)*.008));if(now>p.until){aw.drops.splice(i,1);continue;}if(Math.hypot(p.x-player.x,p.y-player.y)<34){if(p.kind==='shield')aw.shieldCharges=1;else if(p.kind==='mushroom'){player.hp=Math.min(player.maxHp,player.hp+30);if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;}else if(p.kind==='pill')aw.moveUntil=now+10000;else if(p.kind==='gold')gold+=15;cue({shield:AW_NAMES.def,mushroom:AW_NAMES.hp,pill:AW_NAMES.stam,gold:AW_NAMES.rangedSpeed}[p.kind],player.x,player.y,'#fde68a');aw.drops.splice(i,1);updateHUD();}}
  for(let i=aw.spirits.length-1;i>=0;i--){const s=aw.spirits[i];if(now>=s.until||s.hp<=0){aw.spirits.splice(i,1);continue;}for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(Math.hypot(b.x-s.x,b.y-s.y)<20+(b.r||5)){s.hp-=Math.max(1,(b.dmg||5)*.5);eBullets.splice(j,1);break;}}const t=nearest(s.x,s.y);if(t){const d=Math.hypot(t.x-s.x,t.y-s.y)||1;if(!s.passUntil||now>=s.passUntil){const a=Math.atan2(t.y-s.y,t.x-s.x);s.vx=Math.cos(a)*3.4;s.vy=Math.sin(a)*3.4;}s.x+=s.vx||0;s.y+=s.vy||0;if(now>=s.next&&d<(t.r||18)+24){s.next=now+700;s.passUntil=now+280;const mult=(window._curAtkMult||atkMult)*(typeof frFormDamageMultiplier==='function'?frFormDamageMultiplier():1)*(typeof frSkillPowerMultiplier==='function'?frSkillPowerMultiplier():1);t.takeDamage(30*mult);if(typeof frV2Push==='function')frV2Push(t,s.x,s.y,80);else if(t!==boss){const a=Math.atan2(t.y-s.y,t.x-s.x);t.x+=Math.cos(a)*80;t.y+=Math.sin(a)*80;}burst(t.x,t.y,'#86efac',8);}}else{s.x+=(player.x+55-s.x)*.04;s.y+=(player.y-45-s.y)*.04;}}
  for(let i=aw.rifts.length-1;i>=0;i--){const f=aw.rifts[i];if(now>=f.until){aw.rifts.splice(i,1);continue;}targets().forEach(t=>{const d=Math.hypot(t.x-f.x,t.y-f.y)||1;if(pullFrame&&d<=f.pullR+(t.r||18)){const pull=(t===boss ? .052 : .155);t.x+=(f.x-t.x)*pull;t.y+=(f.y-t.y)*pull;}if(d<=f.r+(t.r||18)&&now>=f.next)t.takeDamage(15);});if(now>=f.next)f.next=now+1000;}
  aw.slashes=aw.slashes.filter(f=>now<f.until);
  aw.blasts=aw.blasts.filter(f=>now<f.until);
 }
 function drawAw(now){ctx.save();
  aw.drops.forEach(p=>{ctx.save();ctx.translate(p.x,p.y);ctx.shadowBlur=12;ctx.shadowColor=p.kind==='shield'?'#60a5fa':p.kind==='mushroom'?'#86efac':p.kind==='pill'?'#fde047':'#fbbf24';ctx.fillStyle=p.kind==='shield'?'#93c5fd':p.kind==='mushroom'?'#f0fdf4':p.kind==='pill'?'#fef08a':'#fbbf24';if(p.kind==='shield'){ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(13,-8);ctx.lineTo(10,10);ctx.lineTo(0,18);ctx.lineTo(-10,10);ctx.lineTo(-13,-8);ctx.closePath();ctx.fill();}else if(p.kind==='mushroom'){ctx.fillRect(-4,0,8,13);ctx.beginPath();ctx.arc(0,0,14,Math.PI,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.arc(0,0,p.kind==='gold'?11:13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#92400e';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(p.kind==='gold'?'15':'⚡',0,4);}ctx.restore();});
  aw.spirits.forEach(s=>{ctx.save();ctx.translate(s.x,s.y);const pulse=1+.12*Math.sin(now/90+s.phase);ctx.globalAlpha=.88;ctx.shadowColor='#86efac';ctx.shadowBlur=16;ctx.fillStyle='#bbf7d0';ctx.beginPath();ctx.arc(0,0,16*pulse,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f0fdf4';ctx.lineWidth=3;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,21+k*5,now/260+k,now/260+k+2.2);ctx.stroke();}ctx.fillStyle='rgba(15,23,42,.75)';ctx.fillRect(-18,-29,36,4);ctx.fillStyle='#4ade80';ctx.fillRect(-18,-29,36*s.hp/s.maxHp,4);ctx.restore();});
  aw.rifts.forEach(f=>{const left=Math.max(0,(f.until-now)/2000),pulse=1+.08*Math.sin(now/70+f.phase),size=f.r*2*pulse;ctx.save();ctx.globalAlpha=.65+.25*left;ctx.drawImage(riftGlow,f.x-size/2,f.y-size/2,size,size);ctx.strokeStyle='#c4b5fd';ctx.lineWidth=3;ctx.setLineDash([8,7]);ctx.lineDashOffset=-now/35;ctx.beginPath();ctx.arc(f.x,f.y,f.r*.78,0,Math.PI*2);ctx.stroke();ctx.restore();});
  aw.slashes.forEach(f=>{const left=Math.max(0,(f.until-now)/620);ctx.save();ctx.globalAlpha=left;ctx.strokeStyle='#d1d5db';ctx.shadowColor='#f3f4f6';ctx.shadowBlur=12;ctx.lineWidth=18;ctx.beginPath();ctx.moveTo(f.x1,f.y1);ctx.lineTo(f.x2,f.y2);ctx.stroke();ctx.globalAlpha=left*.9;ctx.strokeStyle='#4b5563';ctx.lineWidth=5;ctx.stroke();ctx.restore();});
  aw.blasts.forEach(f=>{const left=(f.until-now)/(f.kind==='wave'?550:420);ctx.globalAlpha=Math.max(0,left);ctx.strokeStyle=f.kind==='wave'?'#e0f2fe':'#fb7185';ctx.lineWidth=f.kind==='wave'?26:8;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=14;ctx.beginPath();if(f.kind==='wave'){ctx.moveTo(f.x,f.y);ctx.lineTo(f.x,0);}else ctx.arc(f.x,f.y,50*(1-left*.5),0,Math.PI*2);ctx.stroke();});ctx.restore();
 }
 const baseLoop=loop;loop=function(ts){const r=baseLoop(ts);if(gameRunning){updateAw(ts);drawAw(ts);}return r;};
 const baseBuild=buildStage;buildStage=function(){aw.drops=[];aw.spirits=[];aw.rifts=[];aw.slashes=[];aw.blasts=[];aw.moveUntil=0;aw.shieldCharges=0;aw.frame=0;return baseBuild.apply(this,arguments);};
 window.FR_TRAINING_AWAKENING_NAMES=AW_NAMES;
})();
`;
})();

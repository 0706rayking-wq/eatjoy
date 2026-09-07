(function(){
 window.FOOD_RESEARCH_AWAKENING_PATCH=String.raw`
(()=>{
 const AW_NAMES={atk:'烈羽召來',def:'金剛護符',hp:'菌癒恩賜',stam:'元氣疾行',stamRegen:'迴氣返流',crit:'彈反極意',rangedSpeed:'遠獵財運',meleeSpeed:'破甲真意',critDamage:'雙極會心',skillPower:'奧義殘響'};
 const aw={drops:[],birds:[],blasts:[],moveUntil:0,shieldCharges:0,repeat:false};
 const birdImg=new Image();birdImg.src='assets/food-research/effects/training-awakening-firebird-sheet.png';
 function training(){const ch=typeof charSlots!=='undefined'&&charSlots[activeChar];return ch&&ch.training?ch.training:(typeof tr!=='undefined'?tr:{});}
 function awake(key){return Number(training()[key]||0)>=10;}
 function cue(name,x,y,color){if(typeof addText==='function')addText(name,x,y-28,color||'#fde68a',12,-.38);}
 function targets(){const list=(typeof enemies!=='undefined'?enemies.filter(e=>e&&e.hp>0):[]);if(typeof boss!=='undefined'&&boss&&!boss._defeated&&boss.hp>0)list.push(boss);return list;}
 function nearest(x,y){return targets().sort((a,b)=>Math.hypot(a.x-x,a.y-y)-Math.hypot(b.x-x,b.y-y))[0];}
 function drop(kind,x,y){aw.drops.push({kind,x:Math.max(24,Math.min(CW-24,x)),y:Math.max(45,y),vy:1.7,until:performance.now()+14000,born:performance.now()});}
 function onKill(e){if(e._frAwRewarded)return;e._frAwRewarded=true;const x=e.x||CW/2,y=e.y||CH*.35;
  if(awake('atk')&&Math.random()<.01){aw.birds.push({x,y,hp:150,maxHp:150,next:0,frameSeed:Math.random()*4});cue(AW_NAMES.atk,x,y,'#fb923c');}
  if(awake('def')&&Math.random()<.01)drop('shield',x,y);
  if(awake('hp')&&Math.random()<.01)drop('mushroom',x,y);
  if(awake('stam')&&Math.random()<.01)drop('pill',x,y);
  if(awake('rangedSpeed')&&Math.random()<.01)drop('gold',x,y);
 }
 if(typeof Enemy!=='undefined'){const base=Enemy.prototype.takeDamage;Enemy.prototype.takeDamage=function(v){const alive=this.hp>0,r=base.apply(this,arguments);if(alive&&this.hp<=0)onKill(this);return r;};}
 const baseDodge=doDodge;doDodge=function(){const was=player.dodging,r=baseDodge.apply(this,arguments);if(!was&&player.dodging&&awake('stamRegen')&&Math.random()<.01){stamina=Math.min(maxStamina,stamina+30);cue(AW_NAMES.stamRegen,player.x,player.y,'#67e8f9');updateHUD();}return r;};
 const baseHurt=hurtPlayer;hurtPlayer=function(v){if(aw.shieldCharges>0&&v>0){aw.shieldCharges--;cue('金剛護符・減傷',player.x,player.y,'#93c5fd');return baseHurt.call(this,v*.1);}return baseHurt.apply(this,arguments);};
 const baseMove=frFormMoveMultiplier;frFormMoveMultiplier=function(){return baseMove.apply(this,arguments)*(performance.now()<aw.moveUntil?1.25:1);};
 window.frAwakenReflectedBullet=function(b){if(awake('crit')&&Math.random()<.01){b.dmg*=2;b.frAwDoubleReflect=true;cue(AW_NAMES.crit,player.x,player.y,'#fef08a');}};
 window.frAwakenMeleeTrueStrike=function(t,dmg){if(!awake('meleeSpeed')||Math.random()>=.01)return false;const shieldKeys=['shieldHp','shield','armor'];const saved={};shieldKeys.forEach(k=>{if(typeof t[k]==='number'){saved[k]=t[k];t[k]=0;}});t.takeDamage(dmg);Object.keys(saved).forEach(k=>{if(t.hp>0)t[k]=saved[k];});cue(AW_NAMES.meleeSpeed,t.x,t.y,'#ffffff');return true;};
 window.frAwakenMeleeWave=function(def){if(!awake('critDamage')||Math.random()>=.01)return;const w=44,x=player.x;for(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];if(b.y<=player.y&&Math.abs(b.x-x)<=w+(b.r||5))eBullets.splice(i,1);}aw.blasts.push({kind:'wave',x,y:player.y,until:performance.now()+550});cue('會心劍氣',x,player.y,'#e0f2fe');};
 function markRanged(b){if(b&&currentWeapon==='ranged'&&awake('critDamage')&&Math.random()<.01)b.frAwBlast=true;return b;}
 if(typeof makeShot==='function'){const bm=makeShot;makeShot=function(){return markRanged(bm.apply(this,arguments));};}
 const baseBulletUpdate=Bullet.prototype.update;Bullet.prototype.update=function(){const r=baseBulletUpdate.apply(this,arguments);if(this.frAwBlast&&!this.frAwBlasted){const t=targets().find(e=>Math.hypot(e.x-this.x,e.y-this.y)<(e.r||18)+(this.r||5)+6);if(t){this.frAwBlasted=true;aw.blasts.push({kind:'blast',x:this.x,y:this.y,until:performance.now()+420});targets().forEach(e=>{if(Math.hypot(e.x-this.x,e.y-this.y)<=50+(e.r||18))e.takeDamage(50);});cue('會心爆破',this.x,this.y,'#fca5a5');}}return r;};
 function wrapSkill(level,name){const base=window[name];window[name]=function(){const before=level===1?sk1Cd:sk2Cd,isRepeat=aw.repeat,r=base.apply(this,arguments),after=level===1?sk1Cd:sk2Cd;if(!isRepeat&&after>before&&awake('skillPower')&&Math.random()<.01){aw.repeat=true;setTimeout(()=>{if(gameRunning){window.frAwakeningRepeatCast=level;window[name]();}aw.repeat=false;},160);}return r;};}
 wrapSkill(1,'useSkill1');wrapSkill(2,'useSkill2');
 function updateAw(now){
  for(let i=aw.drops.length-1;i>=0;i--){const p=aw.drops[i];p.y=Math.min(CH-28,p.y+p.vy);p.x+=Math.max(-.65,Math.min(.65,(player.x-p.x)*.008));if(now>p.until){aw.drops.splice(i,1);continue;}if(Math.hypot(p.x-player.x,p.y-player.y)<34){if(p.kind==='shield')aw.shieldCharges=1;else if(p.kind==='mushroom'){player.hp=Math.min(player.maxHp,player.hp+30);if(charSlots[activeChar])charSlots[activeChar].hp=player.hp;}else if(p.kind==='pill')aw.moveUntil=now+10000;else if(p.kind==='gold')gold+=10;cue({shield:AW_NAMES.def,mushroom:AW_NAMES.hp,pill:AW_NAMES.stam,gold:AW_NAMES.rangedSpeed}[p.kind],player.x,player.y,'#fde68a');aw.drops.splice(i,1);updateHUD();}}
  for(let i=aw.birds.length-1;i>=0;i--){const s=aw.birds[i];for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(Math.hypot(b.x-s.x,b.y-s.y)<28+(b.r||5)){s.hp-=Math.max(1,b.dmg||10);eBullets.splice(j,1);break;}}if(s.hp<=0){aw.birds.splice(i,1);continue;}const t=nearest(s.x,s.y);if(t){const d=Math.hypot(t.x-s.x,t.y-s.y)||1,keep=72;if(d>keep){s.x+=(t.x-s.x)/d*Math.min(3.2,(d-keep)*.08);s.y+=(t.y-s.y)/d*Math.min(3.2,(d-keep)*.08);}if(now>=s.next){s.next=now+700;const a=Math.atan2(t.y-s.y,t.x-s.x),b=new Bullet(s.x,s.y,Math.cos(a)*8,Math.sin(a)*8,12*(window._curAtkMult||atkMult),'#fb923c',6,true,false,true);b.burn=true;bullets.push(b);}}else{s.x+=(player.x+60-s.x)*.04;s.y+=(player.y-45-s.y)*.04;}}
  aw.blasts=aw.blasts.filter(f=>now<f.until);
 }
 function drawAw(now){ctx.save();
  aw.drops.forEach(p=>{ctx.save();ctx.translate(p.x,p.y);ctx.shadowBlur=12;ctx.shadowColor=p.kind==='shield'?'#60a5fa':p.kind==='mushroom'?'#86efac':p.kind==='pill'?'#fde047':'#fbbf24';ctx.fillStyle=p.kind==='shield'?'#93c5fd':p.kind==='mushroom'?'#f0fdf4':p.kind==='pill'?'#fef08a':'#fbbf24';if(p.kind==='shield'){ctx.beginPath();ctx.moveTo(0,-15);ctx.lineTo(13,-8);ctx.lineTo(10,10);ctx.lineTo(0,18);ctx.lineTo(-10,10);ctx.lineTo(-13,-8);ctx.closePath();ctx.fill();}else if(p.kind==='mushroom'){ctx.fillRect(-4,0,8,13);ctx.beginPath();ctx.arc(0,0,14,Math.PI,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.arc(0,0,p.kind==='gold'?11:13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#92400e';ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillText(p.kind==='gold'?'10':'⚡',0,4);}ctx.restore();});
  aw.birds.forEach(s=>{ctx.save();ctx.translate(s.x,s.y);const frame=Math.floor(now/130+s.frameSeed)%4;if(birdImg.complete&&birdImg.naturalWidth)ctx.drawImage(birdImg,frame*birdImg.naturalWidth/4,0,birdImg.naturalWidth/4,birdImg.naturalHeight,-31,-40,62,80);ctx.fillStyle='rgba(15,23,42,.75)';ctx.fillRect(-25,-45,50,4);ctx.fillStyle='#fb923c';ctx.fillRect(-25,-45,50*s.hp/s.maxHp,4);ctx.restore();});
  aw.blasts.forEach(f=>{const left=(f.until-now)/(f.kind==='wave'?550:420);ctx.globalAlpha=Math.max(0,left);ctx.strokeStyle=f.kind==='wave'?'#e0f2fe':'#fb7185';ctx.lineWidth=f.kind==='wave'?26:8;ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=14;ctx.beginPath();if(f.kind==='wave'){ctx.moveTo(f.x,f.y);ctx.lineTo(f.x,0);}else ctx.arc(f.x,f.y,50*(1-left*.5),0,Math.PI*2);ctx.stroke();});ctx.restore();
 }
 const baseLoop=loop;loop=function(ts){const r=baseLoop(ts);if(gameRunning){updateAw(ts);drawAw(ts);}return r;};
 const baseBuild=buildStage;buildStage=function(){aw.drops=[];aw.birds=[];aw.blasts=[];aw.moveUntil=0;aw.shieldCharges=0;return baseBuild.apply(this,arguments);};
 window.FR_TRAINING_AWAKENING_NAMES=AW_NAMES;
})();
`;
})();

(function(){
 'use strict';
 function swap(source,before,after,label){if(source.indexOf(before)<0){console.warn('[FR timing] target missing:',label);return source;}return source.replace(before,after);}
 window.FOOD_RESEARCH_APPLY_TIMING_PATCH=function(source){
  let out=source;
  out=swap(out,'last=ts;const dt=Math.min(Math.max(rawDt,0),16.7);','last=ts;const dt=Math.min(Math.max(rawDt,8.35),33.4);window.FR_FRAME_SCALE=Math.max(.5,Math.min(2,dt/(1000/60)));if(window.frPerfFrame)window.frPerfFrame(rawDt,ts);','delta');
  out=swap(out,'stars.forEach(s=>{s.y+=s.spd;if(s.y>CH){s.y=0;s.x=Math.random()*CW;}});','stars.forEach(s=>{s.y+=s.spd*window.FR_FRAME_SCALE;if(s.y>CH){s.y=0;s.x=Math.random()*CW;}});','stars');
  out=swap(out,'this.age++;\n if(this.homing){','this.age+=window.FR_FRAME_SCALE;\n if(this.homing){','bullet age');
  out=swap(out,' this.x+=this.vx;this.y+=this.vy;\n}\ndraw(){ctx.save();ctx.fillStyle=this.color;',' this.x+=this.vx*window.FR_FRAME_SCALE;this.y+=this.vy*window.FR_FRAME_SCALE;\n}\ndraw(){ctx.save();ctx.fillStyle=this.color;','bullet move');
  out=swap(out,' this.timer++;const sm=this.frozenTimer>0?.4:1;if(this.frozenTimer>0)this.frozenTimer--;',' this.timer+=window.FR_FRAME_SCALE;const sm=this.frozenTimer>0?.4:1;if(this.frozenTimer>0)this.frozenTimer=Math.max(0,this.frozenTimer-window.FR_FRAME_SCALE);','enemy timer');
  out=out.replace(/this\.x\+=this\.vx\*sm;this\.y\+=this\.vy\*sm;/g,'this.x+=this.vx*sm*window.FR_FRAME_SCALE;this.y+=this.vy*sm*window.FR_FRAME_SCALE;').replace(/this\.y\+=this\.vy\*sm;/g,'this.y+=this.vy*sm*window.FR_FRAME_SCALE;');
  out=swap(out,'spawnTimer++;\nwhile(spawnQueue.length','spawnTimer+=window.FR_FRAME_SCALE;\nwhile(spawnQueue.length','spawner');
  out=swap(out,' _dlgTimer--;',' _dlgTimer-=window.FR_FRAME_SCALE;','dialog');
  out=swap(out,'player.x += player.vx || 0; player.y += player.vy || 0;\nif(player.vx) player.vx *= 0.85; if(player.vy) player.vy *= 0.85;','player.x += (player.vx || 0)*window.FR_FRAME_SCALE; player.y += (player.vy || 0)*window.FR_FRAME_SCALE;\nif(player.vx) player.vx *= Math.pow(0.85,window.FR_FRAME_SCALE); if(player.vy) player.vy *= Math.pow(0.85,window.FR_FRAME_SCALE);','player impulse');
  out=swap(out," player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+ji.dx*spd));\n player.y=Math.max(player.radius,Math.min(CH-player.radius,player.y+ji.dy*spd));"," player.x=Math.max(player.radius,Math.min(CW-player.radius,player.x+ji.dx*spd*window.FR_FRAME_SCALE));\n player.y=Math.max(player.radius,Math.min(CH-player.radius,player.y+ji.dy*spd*window.FR_FRAME_SCALE));",'player move');
  out=swap(out,'if(player.invTimer>0)player.invTimer--;','if(player.invTimer>0)player.invTimer=Math.max(0,player.invTimer-window.FR_FRAME_SCALE);','invincibility');
  out=swap(out,'if(player.weaponCd>0){player.weaponCd--;return;}','if(player.weaponCd>0){player.weaponCd=Math.max(0,player.weaponCd-window.FR_FRAME_SCALE);return;}','autofire');
  out=swap(out,'if(player.weaponCd>0)player.weaponCd--; else if(!qaActive)autoFire();','if(player.weaponCd>0)player.weaponCd=Math.max(0,player.weaponCd-window.FR_FRAME_SCALE); else if(!qaActive)autoFire();','weapon cooldown');
  out=swap(out,'const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life-=p.decay;','const p=particles[i];p.x+=p.vx*window.FR_FRAME_SCALE;p.y+=p.vy*window.FR_FRAME_SCALE;p.vy+=.1*window.FR_FRAME_SCALE;p.life-=p.decay*window.FR_FRAME_SCALE;','particles');
  out=swap(out,'const t=texts[i];t.y+=t.vy*0.5;t.life-=.011;','const t=texts[i];t.y+=t.vy*0.5*window.FR_FRAME_SCALE;t.life-=.011*window.FR_FRAME_SCALE;','texts');
  out=swap(out,"function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:2+Math.random()*3,color,life:1,decay:.03+Math.random()*.03});}}","function burst(x,y,color,n){const q=window.FR_PERF_QUALITY||'high',scale=!FR_MOBILE_PERF?1:(q==='low'?.42:q==='medium'?.68:1),count=Math.max(1,Math.ceil(n*scale));for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:2+Math.random()*3,color,life:1,decay:.03+Math.random()*.03});}}",'adaptive particles');
  out=swap(out,"draw(){ctx.save();ctx.fillStyle=this.color;ctx.shadowBlur=8;ctx.shadowColor=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}","draw(){ctx.save();ctx.fillStyle=this.color;if(!FR_MOBILE_PERF){ctx.shadowBlur=8;ctx.shadowColor=this.color;}ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}",'mobile bullet glow');
  out=swap(out,'let last=0;\nfunction loop(ts){',`let last=0;
const FR_COLLISION_CELL=96;let frCollisionGrid=new Map();
function frCollisionKey(x,y){return Math.floor(x/FR_COLLISION_CELL)+','+Math.floor(y/FR_COLLISION_CELL);}
function frBuildCollisionGrid(){frCollisionGrid.clear();for(let i=0;i<enemies.length;i++){const e=enemies[i];if(!e||e.hp<=0||!Number.isFinite(e.x)||!Number.isFinite(e.y))continue;const key=frCollisionKey(e.x,e.y),bucket=frCollisionGrid.get(key);if(bucket)bucket.push(e);else frCollisionGrid.set(key,[e]);}}
function frCollisionCandidates(b){if(!b||!Number.isFinite(b.x)||!Number.isFinite(b.y))return [];const reach=(b.r||8)+48,cx=Math.floor(b.x/FR_COLLISION_CELL),cy=Math.floor(b.y/FR_COLLISION_CELL),span=Math.max(1,Math.ceil(reach/FR_COLLISION_CELL)),out=[];for(let y=cy-span;y<=cy+span;y++)for(let x=cx-span;x<=cx+span;x++){const bucket=frCollisionGrid.get(x+','+y);if(bucket)for(let i=0;i<bucket.length;i++)out.push(bucket[i]);}return out;}
function loop(ts){`,'collision grid helpers');
  out=swap(out,'for(let i=bullets.length-1;i>=0;i--){\n const b=bullets[i];b.update();let rm=false;','frBuildCollisionGrid();\nfor(let i=bullets.length-1;i>=0;i--){\n const b=bullets[i];if(!b||typeof b.update!==\'function\'||typeof b.dead!==\'function\'){bullets[i]=null;continue;}b.update();let rm=false;','build collision grid');
  out=swap(out,' for(const e of enemies){if(b.hitTargets.has(e))continue;',' for(const e of frCollisionCandidates(b)){if(b.hitTargets.has(e))continue;','spatial projectile collision');
  out=swap(out,"if(b.dead())rm=true;if(rm)bullets.splice(i,1);\n}\nfor(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];if(!b||typeof b.update!=='function'){eBullets.splice(i,1);continue;}frScaleEnemyNormalBullet(b);b.update();if(!qaActive&&Math.hypot(b.x-player.x,b.y-player.y)<b.r+player.radius&&player.invTimer<=0){hurtPlayer(b.dmg);if(b.frStatus&&typeof frBossApplyStatus==='function')frBossApplyStatus(b.frStatus);burst(b.x,b.y,b.color,5);eBullets.splice(i,1);continue;}if(b.dead())eBullets.splice(i,1);}",`if(b.dead())rm=true;if(rm)bullets[i]=null;
}
let frWrite=0;for(let i=0;i<bullets.length;i++)if(bullets[i])bullets[frWrite++]=bullets[i];bullets.length=frWrite;
for(let i=eBullets.length-1;i>=0;i--){const b=eBullets[i];if(!b||typeof b.update!=='function'||typeof b.dead!=='function'||!Number.isFinite(b.x)||!Number.isFinite(b.y)){eBullets[i]=null;continue;}frScaleEnemyNormalBullet(b);b.update();let remove=false;if(!qaActive&&Math.hypot(b.x-player.x,b.y-player.y)<b.r+player.radius&&player.invTimer<=0){hurtPlayer(b.dmg);if(b.frStatus&&typeof frBossApplyStatus==='function')frBossApplyStatus(b.frStatus);burst(b.x,b.y,b.color,5);remove=true;}else if(b.dead())remove=true;if(remove)eBullets[i]=null;}
frWrite=0;for(let i=0;i<eBullets.length;i++)if(eBullets[i])eBullets[frWrite++]=eBullets[i];eBullets.length=frWrite;`,'batched projectile cleanup');
  out=swap(out,'for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx*window.FR_FRAME_SCALE;p.y+=p.vy*window.FR_FRAME_SCALE;p.vy+=.1*window.FR_FRAME_SCALE;p.life-=p.decay*window.FR_FRAME_SCALE;if(p.life<=0)particles.splice(i,1);}\nfor(let i=texts.length-1;i>=0;i--){const t=texts[i];t.y+=t.vy*0.5*window.FR_FRAME_SCALE;t.life-=.011*window.FR_FRAME_SCALE;if(t.life<=0)texts.splice(i,1);}',`frWrite=0;for(let i=0;i<particles.length;i++){const p=particles[i];p.x+=p.vx*window.FR_FRAME_SCALE;p.y+=p.vy*window.FR_FRAME_SCALE;p.vy+=.1*window.FR_FRAME_SCALE;p.life-=p.decay*window.FR_FRAME_SCALE;if(p.life>0)particles[frWrite++]=p;}particles.length=frWrite;
frWrite=0;for(let i=0;i<texts.length;i++){const t=texts[i];t.y+=t.vy*0.5*window.FR_FRAME_SCALE;t.life-=.011*window.FR_FRAME_SCALE;if(t.life>0)texts[frWrite++]=t;}texts.length=frWrite;`,'batched transient cleanup');
  return out;
 };
 window.FOOD_RESEARCH_TIMING_PATCH=String.raw`
window.FR_FRAME_SCALE=1;window.FR_PERF_QUALITY='high';window.FR_EFFECT_SCALE=1;
(function(){
 let sampleStart=performance.now(),sampleFrames=0,quality='high',lowVotes=0,highVotes=0,lastHudSignature='';
 window.frPerfFrame=function(rawDt,now){
  if(!FR_MOBILE_PERF)return;sampleFrames++;if(now-sampleStart<1000)return;
  const fps=sampleFrames*1000/Math.max(1,now-sampleStart);sampleFrames=0;sampleStart=now;
  if(fps<37){lowVotes++;highVotes=0;}else if(fps>52){highVotes++;lowVotes=0;}else{lowVotes=0;highVotes=0;}
  if(lowVotes>=2){quality=quality==='high'?'medium':'low';lowVotes=0;}else if(highVotes>=4){quality=quality==='low'?'medium':'high';highVotes=0;}
  window.FR_PERF_QUALITY=quality;window.FR_EFFECT_SCALE=quality==='low'?.42:quality==='medium'?.68:1;
  if(typeof FR_PERF==='object'){FR_PERF.particleCap=quality==='low'?45:quality==='medium'?65:90;FR_PERF.textCap=quality==='low'?12:quality==='medium'?16:20;}
 };
 const baseHud=updateHUD;updateHUD=function(force){
  const slots=Array.isArray(charSlots)?charSlots.map(function(ch){return ch?[Math.ceil(ch.hp||0),ch.alive!==false?1:0,ch.formId||''].join(':'):'-';}).join('|'):'';
  const sig=[Math.ceil(player.hp||0),Math.ceil(player.maxHp||0),Math.floor(stamina||0),Math.ceil(maxStamina||0),gold||0,score||0,stage||0,activeChar||0,currentWeapon||'',currentForm&&currentForm.id||'',Math.ceil(switchCd||0),slots,player.shieldActive?Math.ceil(player.shieldHp||0):0].join(';');
  if(force!==true&&sig===lastHudSignature)return;lastHudSignature=sig;return baseHud.apply(this,arguments);
 };
 document.addEventListener('visibilitychange',function(){if(!document.hidden){window.FR_FRAME_SCALE=1;sampleStart=performance.now();sampleFrames=0;}});
})();`;
})();

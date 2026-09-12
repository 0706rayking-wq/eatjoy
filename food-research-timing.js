(function(){
 'use strict';
 function swap(source,before,after,label){if(source.indexOf(before)<0){console.warn('[FR timing] target missing:',label);return source;}return source.replace(before,after);}
 window.FOOD_RESEARCH_APPLY_TIMING_PATCH=function(source){
  let out=source;
  out=swap(out,'last=ts;const dt=Math.min(Math.max(rawDt,0),16.7);','last=ts;const dt=Math.min(Math.max(rawDt,8.35),33.4);window.FR_FRAME_SCALE=Math.max(.5,Math.min(2,dt/(1000/60)));','delta');
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
  out=swap(out,"function burst(x,y,color,n){for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:2+Math.random()*3,color,life:1,decay:.03+Math.random()*.03});}}","function burst(x,y,color,n){const scale=FR_MOBILE_PERF?.68:1,count=Math.max(1,Math.ceil(n*scale));for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=1+Math.random()*3.5;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,r:2+Math.random()*3,color,life:1,decay:.03+Math.random()*.03});}}",'mobile particles');
  out=swap(out,"draw(){ctx.save();ctx.fillStyle=this.color;ctx.shadowBlur=8;ctx.shadowColor=this.color;ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}","draw(){ctx.save();ctx.fillStyle=this.color;if(!FR_MOBILE_PERF){ctx.shadowBlur=8;ctx.shadowColor=this.color;}ctx.beginPath();ctx.arc(this.x,this.y,this.r,0,Math.PI*2);ctx.fill();ctx.restore();}",'mobile bullet glow');
  return out;
 };
 window.FOOD_RESEARCH_TIMING_PATCH=String.raw`window.FR_FRAME_SCALE=1;window.FR_PERF_QUALITY=FR_MOBILE_PERF?'medium':'high';window.FR_EFFECT_SCALE=FR_MOBILE_PERF?.68:1;document.addEventListener('visibilitychange',function(){if(!document.hidden)window.FR_FRAME_SCALE=1;});`;
})();

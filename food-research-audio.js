(function () {
  window.FOOD_RESEARCH_AUDIO_PATCH = String.raw`
;(function(){
 const FR_AUDIO_KEY='fr_audio_muted';
 let frAudioCtx=null,frMaster=null,frNoiseBuffer=null;
 let frMuted=localStorage.getItem(FR_AUDIO_KEY)==='1';
 const frLastSound={};

 function frEnsureAudio(){
  if(!frAudioCtx){
   const AudioCtor=window.AudioContext||window.webkitAudioContext;
   if(!AudioCtor)return null;
   frAudioCtx=new AudioCtor();
   frMaster=frAudioCtx.createGain();
   frMaster.gain.value=frMuted?0:.19;
   frMaster.connect(frAudioCtx.destination);
  }
  if(frAudioCtx.state==='suspended')frAudioCtx.resume().catch(function(){});
  return frAudioCtx;
 }
 function frSetMuted(value){
  frMuted=!!value;localStorage.setItem(FR_AUDIO_KEY,frMuted?'1':'0');
  if(frMaster){const t=frAudioCtx.currentTime;frMaster.gain.cancelScheduledValues(t);frMaster.gain.setTargetAtTime(frMuted?0:.19,t,.025);}
  const btn=document.getElementById('frAudioToggle');
  if(btn){
   btn.textContent=String.fromCodePoint(frMuted?0x1f507:0x1f50a);
   const label=frMuted?String.fromCharCode(0x958b,0x555f,0x97f3,0x6548):String.fromCharCode(0x95dc,0x9589,0x97f3,0x6548);
   btn.setAttribute('aria-label',label);btn.title=label;
  }
 }
 function frTone(freq,duration,type,volume,slide,delay){
  const ac=frEnsureAudio();if(!ac||frMuted)return;
  const start=ac.currentTime+(delay||0),osc=ac.createOscillator(),gain=ac.createGain();
  osc.type=type||'square';osc.frequency.setValueAtTime(Math.max(30,freq),start);
  if(slide)osc.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),start+duration);
  gain.gain.setValueAtTime(.0001,start);gain.gain.exponentialRampToValueAtTime(Math.max(.0002,volume||.08),start+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain);gain.connect(frMaster);osc.start(start);osc.stop(start+duration+.02);
 }
 function frNoise(duration,volume,highpass,delay){
  const ac=frEnsureAudio();if(!ac||frMuted)return;
  if(!frNoiseBuffer){
   frNoiseBuffer=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);
   const data=frNoiseBuffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }
  const start=ac.currentTime+(delay||0),source=ac.createBufferSource(),filter=ac.createBiquadFilter(),gain=ac.createGain();
  source.buffer=frNoiseBuffer;filter.type='highpass';filter.frequency.value=highpass||900;
  gain.gain.setValueAtTime(volume||.04,start);gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  source.connect(filter);filter.connect(gain);gain.connect(frMaster);source.start(start);source.stop(start+duration+.02);
 }
  function frSfx(name,force){
   const now=performance.now(),limits={shot:95,melee:150,parry:70,hit:65,coin:85,bossCast:320,ui:100};
  if(!force&&now-(frLastSound[name]||0)<(limits[name]||35))return;
  frLastSound[name]=now;if(frMuted)return;frEnsureAudio();
  if(name==='ui')frTone(520,.055,'sine',.025,90);
  else if(name==='start'){frTone(220,.12,'triangle',.06,220);frTone(440,.16,'triangle',.055,220,.10);}
  else if(name==='shot'){frTone(720,.045,'square',.024,-280);frNoise(.028,.012,1900);}
   else if(name==='melee'){frNoise(.11,.055,500);frTone(240,.10,'sawtooth',.038,-150);}
   else if(name==='parry'){frTone(980,.055,'square',.045,420);frTone(1460,.075,'sine',.035,-260,.025);frNoise(.035,.018,2400);}
  else if(name==='hit'){frTone(170,.045,'square',.022,-65);}
  else if(name==='hurt'){frNoise(.12,.07,250);frTone(145,.18,'sawtooth',.065,-70);if(navigator.vibrate)navigator.vibrate(24);}
  else if(name==='shield'){frTone(620,.13,'sine',.055,460);frTone(880,.16,'sine',.035,-180,.04);}
  else if(name==='dodge'){frNoise(.13,.045,1500);frTone(300,.12,'sine',.035,520);if(navigator.vibrate)navigator.vibrate(12);}
  else if(name==='skill1'){frTone(330,.10,'triangle',.055,330);frTone(660,.18,'sine',.05,260,.07);}
  else if(name==='skill2'){frTone(110,.28,'sawtooth',.075,440);frTone(440,.35,'triangle',.065,440,.08);frNoise(.24,.04,550,.08);if(navigator.vibrate)navigator.vibrate([20,25,35]);}
  else if(name==='coin'){frTone(880,.07,'sine',.04,350);frTone(1320,.09,'sine',.035,220,.055);}
  else if(name==='enemyDown'){frTone(260,.08,'square',.04,-150);frNoise(.08,.035,650);}
  else if(name==='bossIntro'){frTone(82,.42,'sawtooth',.075,55);frTone(123,.48,'square',.045,-30,.08);if(navigator.vibrate)navigator.vibrate([30,45,30]);}
  else if(name==='bossCast'){frTone(190,.22,'sawtooth',.055,430);frTone(380,.20,'triangle',.04,-160,.08);}
  else if(name==='bossDown'){frTone(190,.16,'square',.065,-100);frNoise(.28,.075,260,.05);frTone(392,.20,'triangle',.06,392,.18);frTone(784,.28,'sine',.055,180,.34);if(navigator.vibrate)navigator.vibrate([40,35,60]);}
  else if(name==='stage'){frTone(392,.12,'triangle',.045,100);frTone(523,.13,'triangle',.05,120,.10);frTone(659,.20,'sine',.055,140,.20);}
  else if(name==='correct'){frTone(660,.10,'sine',.05,110);frTone(880,.16,'sine',.05,180,.08);}
  else if(name==='wrong'){frTone(230,.12,'square',.055,-60);frTone(150,.18,'sawtooth',.045,-45,.09);}
  else if(name==='death'){frTone(330,.18,'triangle',.055,-150);frTone(190,.35,'sawtooth',.06,-100,.12);}
  else if(name==='revive'){frTone(294,.13,'sine',.04,100);frTone(440,.17,'sine',.045,140,.12);frTone(659,.25,'sine',.05,160,.25);}
  else if(name==='switch'){frTone(410,.07,'triangle',.032,180);}
 }
 window.frSfx=frSfx;window.frSetMuted=frSetMuted;

 const style=document.createElement('style');
 style.textContent='#frAudioToggle{position:absolute;top:88px;right:8px;z-index:160;width:36px;height:36px;padding:0;overflow:hidden;white-space:nowrap;line-height:1;border-radius:50%;border:1px solid rgba(217,119,6,.55);background:rgba(253,248,240,.9);color:#78350f;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,.16);touch-action:manipulation}#frAudioToggle:active{transform:scale(.92)}';
 document.head.appendChild(style);
 const audioButton=document.createElement('button');audioButton.id='frAudioToggle';audioButton.type='button';
 audioButton.onclick=function(e){e.preventDefault();e.stopPropagation();frEnsureAudio();frSetMuted(!frMuted);if(!frMuted)frSfx('ui',true);};
 document.getElementById('gc').appendChild(audioButton);frSetMuted(frMuted);
 document.addEventListener('pointerdown',frEnsureAudio,{once:true,passive:true});

 const frAudioStartGame=startGame;startGame=function(){frEnsureAudio();frSfx('start',true);return frAudioStartGame.apply(this,arguments);};
 const frAudioAutoFire=autoFire;autoFire=function(){const before=player.weaponCd;const result=frAudioAutoFire.apply(this,arguments);if(before<=0&&player.weaponCd>0)frSfx(currentWeapon==='melee'?'melee':'shot');return result;};
 const frAudioSkill1=useSkill1;useSkill1=function(){const before=stamina;const result=frAudioSkill1.apply(this,arguments);if(stamina<before)frSfx('skill1',true);return result;};
 const frAudioSkill2=useSkill2;useSkill2=function(){const before=stamina;const result=frAudioSkill2.apply(this,arguments);if(stamina<before)frSfx('skill2',true);return result;};
 const frAudioDodge=doDodge;doDodge=function(){const before=!!player.dodging;const result=frAudioDodge.apply(this,arguments);if(!before&&player.dodging)frSfx('dodge',true);return result;};
 const frAudioHurt=hurtPlayer;hurtPlayer=function(){const hp=player.hp,shield=!!player.shieldActive;const result=frAudioHurt.apply(this,arguments);if(shield&&player.hp===hp)frSfx('shield');else if(player.hp<hp)frSfx('hurt',true);return result;};
 const frAudioPlayerDied=playerDied;playerDied=function(){frSfx('death',true);return frAudioPlayerDied.apply(this,arguments);};
 const frAudioRevival=showRevivalQuiz;showRevivalQuiz=function(){const result=frAudioRevival.apply(this,arguments);frSfx('revive',true);return result;};
 const frAudioBuildStage=buildStage;buildStage=function(){const result=frAudioBuildStage.apply(this,arguments);frSfx('stage');return result;};
 const frAudioSwitch=switchToChar;switchToChar=function(){const before=activeChar;const result=frAudioSwitch.apply(this,arguments);if(activeChar!==before)frSfx('switch');return result;};

 const FrAudioEnemyTake=Enemy.prototype.takeDamage;
 Enemy.prototype.takeDamage=function(){const hp=this.hp,result=FrAudioEnemyTake.apply(this,arguments);if(hp>0&&this.hp<=0)frSfx('enemyDown');else if(this.hp<hp)frSfx('hit');return result;};
 const FrAudioBossTake=Boss.prototype.takeDamage;
 Boss.prototype.takeDamage=function(){const alive=!this._defeated&&this.hp>0,result=FrAudioBossTake.apply(this,arguments);if(alive&&this._defeated)frSfx('bossDown',true);else if(this.hp>0)frSfx('hit');return result;};
 const FrAudioBossBase=Boss;
 Boss=class extends FrAudioBossBase{constructor(){super(...arguments);setTimeout(function(){frSfx('bossIntro',true);},80);}};
 if(typeof frBossCast==='function'){const frAudioBossCast=frBossCast;frBossCast=function(b,pattern,isSkill){if(isSkill)frSfx('bossCast',true);return frAudioBossCast.apply(this,arguments);};}

 let frAudioGold=gold;
 const frAudioHud=updateHUD;updateHUD=function(){const before=frAudioGold,result=frAudioHud.apply(this,arguments);if(gold>before)frSfx('coin');frAudioGold=gold;return result;};
 document.addEventListener('click',function(e){
  const option=e.target&&e.target.closest?e.target.closest('#revOpts .qopt'):null;
  if(option)setTimeout(function(){frSfx(option.classList.contains('correct')?'correct':'wrong',true);},0);
  else if(e.target&&e.target.closest&&e.target.closest('.mbtn,#wpnToggle,.cSwBtn'))frSfx('ui');
 },true);
})();
`;
})();

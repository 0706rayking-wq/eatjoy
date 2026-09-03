(function () {
  const specs = {
    normal:{passive:'原味體質：全隊最大 HP +10，可疊加',skill1:'舔傷口',skill1Cost:20,skill1Cooldown:3,skill1Desc:'立即回復目前角色 10 HP。',skill2:'亢奮',skill2Cost:48,skill2Cooldown:14,skill2Desc:'全隊移動速度與攻擊速度提升 35%，持續 6 秒。'},
    onion_guard:{passive:'洋蔥薄膜：每 12 秒獲得 1 層防護罩',skill1:'洋蔥震波',skill1Cost:26,skill1Cooldown:6,skill1Desc:'清除 165 範圍內的一般子彈，造成 20 傷害並擊退敵人。',skill2:'三層洋蔥盾',skill2Cost:55,skill2Cooldown:17,skill2Desc:'在前方展開三層半圓盾，每層抵擋 1 次攻擊，最多持續 8 秒。'},
    popcorn:{passive:'膨爆彈殼：全隊遠程子彈尺寸與命中範圍 +25%',skill1:'爆米花雨',skill1Cost:24,skill1Cooldown:7,skill1Desc:'在前方依序落下 5 顆爆米花，每顆造成 14 範圍傷害。',skill2:'連發爆米砲',skill2Cost:60,skill2Cooldown:20,skill2Desc:'每 0.5 秒發射 1 枚追蹤砲彈，共 20 枚；直擊 12 傷害並造成 8 爆破傷害。'},
    healing_mushroom:{passive:'菌絲回春：每 5 秒回復目前角色 3 HP',skill1:'採菇補給',skill1Cost:24,skill1Cooldown:7,skill1Desc:'在附近生成 3 朵蘑菇，每朵回復 10 HP，存在 7 秒。',skill2:'療癒菌林',skill2Cost:60,skill2Cooldown:18,skill2Desc:'回復 35 HP、獲得 45 護盾，並對周遭敵人造成 30 傷害。'},
    garlic_knight:{passive:'殉戰蒜香：倒下時使存活夥伴攻擊 +25%',skill1:'聖蒜淨化',skill1Cost:32,skill1Cooldown:9,skill1Desc:'解除全部異常狀態，並獲得 1.2 秒無敵。',skill2:'濃郁蒜味',skill2Cost:70,skill2Cooldown:20,skill2Desc:'展開 2.5 秒立場，反彈一般子彈並彈開小型敵人。'},
    chili_sprite:{passive:'辛辣直覺：全隊爆擊率 +8%',skill1:'辣椒池',skill1Cost:24,skill1Cooldown:7,skill1Desc:'在敵人路徑生成辣椒池 5 秒，每 0.5 秒造成 9 灼燒傷害。',skill2:'麻辣風暴',skill2Cost:64,skill2Cooldown:18,skill2Desc:'生成追蹤敵群的龍捲風 5 秒，每 0.5 秒造成 13 傷害並彈開小型敵人。'},
    lotus_archer:{passive:'多孔箭道：全隊遠程攻擊額外貫穿 1 次',skill1:'多孔導流',skill1Cost:32,skill1Cooldown:10,skill1Desc:'透明化 2.5 秒，使一般子彈無效；其他攻擊仍然有效。',skill2:'十發貫穿箭',skill2Cost:60,skill2Cooldown:19,skill2Desc:'每 0.5 秒由畫面下方向上射出 1 發貫穿箭，共 10 發，每發 20 傷害。'},
    potato_armor:{passive:'厚皮裝甲：碰撞與近身傷害 -35%',skill1:'澱粉彈牆',skill1Cost:30,skill1Cooldown:8,skill1Desc:'獲得 35 護盾，並清除 130 範圍內的一般子彈。',skill2:'澱粉分裂',skill2Cost:58,skill2Cooldown:20,skill2Desc:'召喚 10 秒分身，擁有本體 45% HP 與 50% 攻擊力。'},
    lemon_battery:{passive:'連鎖充能：攻擊有 20% 機率觸發連鎖電流',skill1:'環繞電球',skill1Cost:22,skill1Cooldown:6.5,skill1Desc:'生成 2 顆環繞電球，最多 4 顆；碰敵造成 20 傷害並擊退。',skill2:'電磁巨砲',skill2Cost:60,skill2Cooldown:22,skill2Desc:'充能 0.9 秒後，發射畫面 1/4 寬的巨砲 1.6 秒，每 0.2 秒造成 12 傷害。'},
    cheese_mage:{passive:'黏稠咒法：一般敵人移速 -12%，首領 -6%',skill1:'熔岩起司',skill1Cost:28,skill1Cooldown:12,skill1Desc:'8 秒內攻擊附加灼燒，持續 2 秒、每秒 5 傷害。',skill2:'起司誘餌',skill2Cost:65,skill2Cooldown:22,skill2Desc:'召喚 120 HP 起司吸引火力，消失或被擊破時造成 50 範圍傷害。'},
    honey_priest:{passive:'蜜糖餘韻：每 4 秒治療 2 HP，溢補轉為護盾',skill1:'甜蜜祝福',skill1Cost:28,skill1Cooldown:8,skill1Desc:'回復 12 HP，移動與攻擊速度提升 20%，持續 4 秒。',skill2:'蜜語結界',skill2Cost:65,skill2Cooldown:22,skill2Desc:'設置 8 秒治療結界，並召喚 3 隻小蜜蜂作戰 12 秒。'},
    coffee_pilot:{passive:'提神：持續移動 3 秒後移速最高 +25%',skill1:'濃縮超頻',skill1Cost:30,skill1Cooldown:10,skill1Desc:'攻擊速度 +45%、移動速度 +25%，持續 5 秒。',skill2:'子彈時間',skill2Cost:75,skill2Cooldown:24,skill2Desc:'清除一般子彈並使敵人減速 4 秒，自身同時進入超頻。'},
    octopus_samurai:{passive:'再生：3 秒未受傷後，每秒回復 2 HP',skill1:'噴灑墨汁',skill1Cost:24,skill1Cooldown:8,skill1Desc:'在上半場投下 2 灘墨汁 5 秒，使接觸敵人短暫停止攻擊。',skill2:'八爪章魚',skill2Cost:70,skill2Cooldown:24,skill2Desc:'長出 8 支觸手環繞 10 秒，傷害敵人並反彈一般子彈。'},
    salmon_ronin:{passive:'浪人步：閃避後攻擊與移速 +15%',skill1:'斷浪',skill1Cost:32,skill1Cooldown:9,skill1Desc:'揮出半畫面寬圓弧斬，造成 28 傷害、清除軌跡子彈並擊退敵人。',skill2:'逆流四閃',skill2Cost:65,skill2Cooldown:21,skill2Desc:'依序放出 4 道藍色直線刀光，每秒 1 道，每擊 38 傷害。'},
    beef_berserker:{passive:'背水狂戰：血量越低，攻擊與攻速越高',skill1:'怒吼',skill1Cost:28,skill1Cooldown:10,skill1Desc:'使前方大扇形敵人防禦降低 25% 持續 6 秒；首領降低 12%。',skill2:'巨兵斬',skill2Cost:60,skill2Cooldown:20,skill2Desc:'近戰距離提升至 3 倍、寬度提升至 1.8 倍，持續 5 秒。'},
    puffer_alchemist:{passive:'劇毒調和：攻擊有機率使敵人中毒並降低攻擊',skill1:'毒沼',skill1Cost:30,skill1Cooldown:11,skill1Desc:'在角色上方生成 180 x 180 毒沼 7 秒，每秒造成 7 傷害。',skill2:'荊棘路',skill2Cost:70,skill2Cooldown:24,skill2Desc:'向畫面頂端生成荊棘路，困住一般敵人並附加 10 秒劇毒。'},
    black_garlic_void:{passive:'虛空穿刺：全隊忽略 20% 防禦並額外貫穿',skill1:'虛空黑洞',skill1Cost:50,skill1Cooldown:14,skill1Desc:'在畫面中心生成黑洞 1.5 秒，吸聚敵人與子彈後造成 25 傷害。',skill2:'雙鬼召來',skill2Cost:70,skill2Cooldown:22,skill2Desc:'召喚 2 隻幽體鬼影作戰 10 秒，每 0.7 秒造成 12 傷害。'},
    lobster_general:{passive:'龍蝦甲胄：受到傷害 -10%，反彈子彈傷害 +40%',skill1:'甲殼吸收',skill1Cost:28,skill1Cooldown:9,skill1Desc:'2.5 秒內吸收最多 6 發一般子彈，每發轉化為 6 護盾。',skill2:'雙側砲台',skill2Cost:65,skill2Cooldown:22,skill2Desc:'在左右架設 80 HP 砲台 10 秒，持續發射追蹤砲彈。'},
    truffle_thunder:{passive:'雷鏈麻痺：攻擊有 10% 機率連鎖並麻痺',skill1:'雷環護身',skill1Cost:30,skill1Cooldown:13,skill1Desc:'環繞電流 10 秒，每 0.5 秒造成 10 傷害並彈開敵人。',skill2:'雷域推進',skill2Cost:70,skill2Cooldown:23,skill2Desc:'生成緩慢向上推進的雷電立場 6 秒，每 0.5 秒造成 16 傷害。'},
    dragonfruit_emperor:{passive:'灼燒光環：185 範圍持續灼燒，攻擊灼燒敵人 +20%',skill1:'雙翼龍焰',skill1Cost:38,skill1Cooldown:14,skill1Desc:'向上方左右噴出火焰 4.5 秒，每 0.5 秒造成 12 傷害並灼燒。',skill2:'龍隕雙星',skill2Cost:75,skill2Cooldown:25,skill2Desc:'間隔 2 秒砸下 2 顆巨大隕石，中心 90、外圍 45 傷害。'},
    peach_divine:{passive:'仙桃庇佑：後排夥伴回復至半血，首次死亡復活',skill1:'仙人模式',skill1Cost:45,skill1Cooldown:14,skill1Desc:'強化 6 秒，每 0.5 秒發射 1 道貫穿仙氣，共 12 道，每道 18 傷害。',skill2:'蟠桃回天',skill2Cost:100,skill2Cooldown:16,skill2Desc:'完全回復 HP、解除異常、清除一般子彈，並無敵 5 秒。'},
    cocoa_popsicle_wargod:{passive:'雪花鏢：每 5 秒發射 2 枚減速雪花鏢',skill1:'冰霜劍氣',skill1Cost:35,skill1Cooldown:10,skill1Desc:'間隔 1 秒揮出 2 道畫面 3/4 寬劍氣，每道 20 傷害並凍結敵人。',skill2:'冰刺牆',skill2Cost:70,skill2Cooldown:22,skill2Desc:'生成 120 HP 冰刺牆 10 秒，阻擋一般子彈並傷害接觸敵人。'}
  };

  Object.keys(specs).forEach(function (id) {
    const form = window.FOOD_RESEARCH_FORM_MAP && window.FOOD_RESEARCH_FORM_MAP[id];
    if (form) Object.assign(form, specs[id]);
  });

  window.FOOD_RESEARCH_SKILL_SPECS_V2 = specs;
  window.FOOD_RESEARCH_SKILLS_V2_PATCH = String.raw`
;(function(){
 const FR_V2_SPEC=${JSON.stringify(specs)};
 const frV2={fields:[],summons:[],pickups:[],orbs:[],lastPassive:{},lastDamageAt:performance.now(),garlicBuffUntil:0,honeyBuffUntil:0,coffeeBuffUntil:0,normalBuffUntil:0,salmonBuffUntil:0,salmonReadyAt:0,beefGiantUntil:0,cheeseBurnUntil:0,lotusPhaseUntil:0,lobsterAbsorbUntil:0,lobsterAbsorbed:0,peachRevived:false,lastTick:0};

 Object.keys(FR_V2_SPEC).forEach(function(id){
  const spec=FR_V2_SPEC[id],form=FR_FORM_MAP[id]||FOOD_FORMS[id];if(!form)return;
  form.passive=spec.passive;form.skill1=spec.skill1;form.skill2=spec.skill2;form.skill1Desc=spec.skill1Desc;form.skill2Desc=spec.skill2Desc;form.skill1Cost=spec.skill1Cost;form.skill2Cost=spec.skill2Cost;form.skill1Cooldown=spec.skill1Cooldown;form.skill2Cooldown=spec.skill2Cooldown;
  const battle=FOOD_FORMS[id];if(battle){battle.passive=spec.passive;battle.sk1Name=spec.skill1;battle.sk2Name=spec.skill2;battle.sk1Cd=spec.skill1Cooldown*1000;battle.sk2Cd=spec.skill2Cooldown*1000;}
 });

 function frV2Now(){return performance.now();}
 function frV2Has(id){return !!(charSlots&&charSlots.some(function(ch){return ch&&ch.formId===id;}));}
 function frV2ActiveSpec(){return FR_V2_SPEC[currentForm&&currentForm.id||'normal']||FR_V2_SPEC.normal;}
 function frV2Alive(target){return !!(target&&target.hp>0&&!target._defeated&&!target.defeated);}
 function frV2Targets(){const list=[];frForEachEnemy(function(t){if(frV2Alive(t))list.push(t);});return list;}
 function frV2Boss(target){return target===boss;}
 function frV2Distance(a,b){return Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0));}
 function frV2Nearest(x,y){let best=null,dist=Infinity;frV2Targets().forEach(function(t){const d=Math.hypot(t.x-x,t.y-y);if(d<dist){dist=d;best=t;}});return best;}
 function frV2Ready(key,ms,now){now=now||frV2Now();if(!frV2.lastPassive[key]||now-frV2.lastPassive[key]>=ms){frV2.lastPassive[key]=now;return true;}return false;}
 function frV2SkillDamage(target,amount,context){if(!frV2Alive(target))return;const prior=window.frV2DamageContext;window.frV2DamageContext=context||'skill';frApplyDamage(target,amount*(window._curAtkMult||atkMult)*frFormDamageMultiplier()*frSkillPowerMultiplier());window.frV2DamageContext=prior;}
 function frV2Area(x,y,r,amount,context,after){frV2Targets().forEach(function(t){if(Math.hypot(t.x-x,t.y-y)<=r+(t.r||18)){frV2SkillDamage(t,amount,context);if(after)after(t);}});}
 function frV2Heal(amount){return frHeal(amount);}
 function frV2Shield(amount,cap){player.shieldActive=true;player.shieldHp=Math.min(cap||999,Math.max(0,player.shieldHp||0)+amount);updateHUD();}
 function frV2Push(target,x,y,amount){if(frV2Boss(target))amount*=.25;const dx=target.x-x,dy=target.y-y,d=Math.hypot(dx,dy)||1;target.x+=dx/d*amount;target.y+=dy/d*amount;}
 function frV2Slow(target,ms,factor){frApplySingleSlow(target,ms,frV2Boss(target)?1-(1-factor)*.5:factor);}
 function frV2Burn(target,ms,dps){target._frV2BurnUntil=Math.max(target._frV2BurnUntil||0,frV2Now()+ms);target._frV2BurnDps=Math.max(target._frV2BurnDps||0,dps||5);}
 function frV2Poison(target,ms,dps){target._frV2PoisonUntil=Math.max(target._frV2PoisonUntil||0,frV2Now()+ms);target._frV2PoisonDps=Math.max(target._frV2PoisonDps||0,dps||4);target._frV2AttackDownUntil=target._frV2PoisonUntil;}
 function frV2Reflect(b,color,mult){const shot=new Bullet(b.x,b.y,-b.vx*1.25,-b.vy*1.25,Math.max(10,b.dmg||10)*(mult||1),color||'#ffffff',(b.r||5)+1,true,false,false);shot.frV2Reflected=true;bullets.push(shot);}
 function frV2Field(kind,data){const field=Object.assign({kind:kind,start:frV2Now(),until:frV2Now()+1000,nextTick:0,hits:new Map()},data||{});frV2.fields.push(field);return field;}
 function frV2Pickup(kind,x,y,until){frV2.pickups.push({kind:kind,x:x,y:y,until:until});}
 function frV2Summon(kind,data){const summon=Object.assign({kind:kind,x:player.x,y:player.y,hp:1,maxHp:1,until:frV2Now()+1000,nextAttack:0},data||{});frV2.summons.push(summon);return summon;}
 function frV2Burst(x,y,color,count){burst(x,y,color,count||12);frRingFx(x,y,color,50,480,4);}
 function frV2InFront(target,length,halfWidth){const dy=player.y-target.y;return dy>=-20&&dy<=length+(target.r||0)&&Math.abs(target.x-player.x)<=halfWidth+(target.r||0);}

 function frV2SetCooldown(level,seconds){const ms=seconds*1000,slot=charSlots&&charSlots[activeChar],end=frV2Now()+ms;if(level===1){sk1Cd=ms;if(slot)slot._frV2Cd1End=end;}else{sk2Cd=ms;if(slot)slot._frV2Cd2End=end;}}
 function frV2Begin(level){const spec=frV2ActiveSpec(),cost=level===1?spec.skill1Cost:spec.skill2Cost,cd=level===1?sk1Cd:sk2Cd;if(!gameRunning||stamina<cost||cd>0)return null;stamina=Math.max(0,stamina-cost);frV2SetCooldown(level,level===1?spec.skill1Cooldown:spec.skill2Cooldown);const name=level===1?spec.skill1:spec.skill2,c=currentForm.bulletColor||'#fbbf24';addText(name,player.x,player.y-38,c,16);frPlayCast(level,currentForm.id,c,name);updateHUD();return{id:currentForm.id,c:c,spec:spec};}

 function frV2ExplodePopcorn(x,y){frV2Area(x,y,55,14,'skill');frV2Burst(x,y,'#fde68a',16);frGroundFx(x,y,'#fde68a',55,500);}
 function frV2SpawnMeteor(delay){const target=frV2Nearest(CW/2,CH*.25),x=target?target.x:60+Math.random()*(CW-120),y=target?Math.min(CH*.55,target.y):120+Math.random()*CH*.3,launch=frV2Now()+delay,impact=launch+1050;frV2Field('meteor',{x:x,y:y,fromX:Math.max(30,Math.min(CW-30,x+(Math.random()<.5?-1:1)*CW*.34)),fromY:-130,r:Math.max(62,CW/6),launch:launch,activate:impact,until:impact+850});}
 function frV2StartPopcornRain(index){const x=45+Math.random()*(CW-90),y=85+Math.random()*CH*.42,launch=frV2Now()+index*260;frV2Field('popcornDrop',{x:x,y:y,fromY:-45,activate:launch+620,until:launch+900,launch:launch,r:55});}
 function frV2Aura(style,color,duration,data){return frV2Field('aura',Object.assign({style:style,color:color,x:player.x,y:player.y,follow:true,until:frV2Now()+duration},data||{}));}
 function frV2StartBeam(x,color,damage,width,duration){frV2Field('beam',{x:x,y:player.y,width:width,damage:damage,color:color,activate:frV2Now()+900,until:frV2Now()+900+duration,nextTick:0});frBoltFx(x,player.y,x,0,color,duration+900,0,Math.max(8,width*.15));}
 function frV2SalmonFlash(index){const xs=[CW*.2,CW*.4,CW*.6,CW*.8],x=xs[index%4];frSlashFx(x,CH*.82,'#60a5fa',CH*.82,-Math.PI/2,650,0,16);frV2Targets().forEach(function(t){if(Math.abs(t.x-x)<=34+(t.r||18))frV2SkillDamage(t,38,'skill');});}

 function frV2SuppressLegacy(now){
  window.frPassiveTimes=window.frPassiveTimes||{};
  ['onion_guard','healing_mushroom','honey_priest','lobster_general','chili_sprite:aura','puffer_alchemist:aura','dragonfruit_emperor:aura','cheese_mage:slow','cocoa_popsicle_wargod:snowflake'].forEach(function(k){window.frPassiveTimes[k]=now+3600000;});
 }
 function frV2ApplySharedPassives(now){
  frV2SuppressLegacy(now);
  if(frV2Has('onion_guard')&&frV2Ready('onion',12000,now)){frV2Shield(18,54);addText('洋蔥薄膜',player.x,player.y-30,'#a7f3d0',12);frRingFx(player.x,player.y,'#a7f3d0',64,650,7);}
  if(frV2Has('healing_mushroom')&&frV2Ready('mushroom',5000,now)){frV2Heal(3);frMoteFx(player.x,player.y,9,'#86efac','heal',36,2,650);}
  if(frV2Has('honey_priest')&&frV2Ready('honey',4000,now)){const before=player.hp;frV2Heal(2);if(before>=player.maxHp)frV2Shield(2,20);frMoteFx(player.x,player.y,8,'#fde047','heal',32,1.8,620);}
  if(frV2Has('cheese_mage')&&frV2Ready('cheeseSlow',500,now))frV2Targets().forEach(function(t){frV2Slow(t,650,frV2Boss(t)?.94:.88);});
  if(frV2Has('cocoa_popsicle_wargod')&&frV2Ready('cocoa',5000,now))frCocoaLaunchSnowflakes();
  if(frV2Has('dragonfruit_emperor')&&frV2Ready('dragonAura',500,now)){frV2Area(player.x,player.y,185,7,'dot',function(t){frV2Burn(t,2200,7);});}
  if(frV2Has('octopus_samurai')&&now-frV2.lastDamageAt>=3000&&frV2Ready('octoRegen',1000,now)){frV2Heal(2);frMoteFx(player.x,player.y,5,'#c084fc','bubble',26,1.3,540);}
  if(frV2Has('peach_divine')&&frV2Ready('peachBench',1000,now)){charSlots.forEach(function(ch,i){if(i!==activeChar&&ch&&ch.alive&&ch.hp<ch.maxHp*.5)ch.hp=Math.min(ch.maxHp*.5,ch.hp+1);});updateHUD();}
 }

 const frV2OldDamageMult=frFormDamageMultiplier;
 frFormDamageMultiplier=function(){
  let m=1,now=frV2Now();
  if(frV2Has('black_garlic_void'))m*=1.2;
  if(now<frV2.garlicBuffUntil)m*=1.25;
  if(now<frV2.salmonBuffUntil)m*=1.15;
  if(frV2Has('beef_berserker')){const hp=player.maxHp?player.hp/player.maxHp:1;if(hp<.6)m*=1+Math.min(.35,(.6-hp)*.875);}
  return m;
 };
 frFormAttackSpeedMultiplier=function(){
  let m=1,now=frV2Now();
  if(now<frV2.salmonBuffUntil)m*=1.15;
  if(now<frV2.honeyBuffUntil)m*=1.2;
  if(now<frV2.coffeeBuffUntil)m*=1.45;
  if(now<frV2.normalBuffUntil)m*=1.35;
  if(frV2Has('beef_berserker')){const hp=player.maxHp?player.hp/player.maxHp:1;if(hp<.6)m*=1+Math.min(.25,(.6-hp)*.625);}
  return m;
 };
 frFormMoveMultiplier=function(){
  let m=1,now=frV2Now();
  if(now<frV2.salmonBuffUntil)m*=1.15;
  if(now<frV2.honeyBuffUntil)m*=1.2;
  if(now<frV2.coffeeBuffUntil)m*=1.25;
  if(now<frV2.normalBuffUntil)m*=1.35;
  if(frV2Has('coffee_pilot')&&frV2.coffeeMovingSince&&now-frV2.coffeeMovingSince>=3000)m*=1.25;
  return m;
 };

 const frV2BaseFire=fire;
 fire=function(){const before=bullets.length,r=frV2BaseFire.apply(this,arguments);for(let i=before;i<bullets.length;i++){const b=bullets[i];if(frV2Has('popcorn'))b.r*=1.25;if(frV2Has('lotus_archer')||frV2Has('black_garlic_void'))b.pierce=true;}return r;};
 if(typeof makeShot==='function'){const frV2BaseMakeShot=makeShot;makeShot=function(){const b=frV2BaseMakeShot.apply(this,arguments);if(b){if(frV2Has('popcorn'))b.r*=1.25;if(frV2Has('lotus_archer')||frV2Has('black_garlic_void'))b.pierce=true;}return b;};}
 const frV2BaseBulletDraw=Bullet.prototype.draw;
 Bullet.prototype.draw=function(){
  if(this.frV2Pop){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(this.age*.08);ctx.fillStyle='#fff7d6';ctx.strokeStyle='#f59e0b';ctx.lineWidth=2;ctx.shadowColor='#fbbf24';ctx.shadowBlur=10;ctx.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5,rr=(k%2?7:13)+(this.r||8)*.25,px=Math.cos(a)*rr,py=Math.sin(a)*rr;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();return;}
  if(this.frV2Arrow||this.frV2Qi){ctx.save();ctx.translate(this.x,this.y);ctx.rotate(Math.atan2(this.vy,this.vx)+Math.PI/2);ctx.strokeStyle=this.frV2Qi?'#fdf2f8':'#dcfce7';ctx.fillStyle=this.color;ctx.lineWidth=this.frV2Qi?7:4;ctx.shadowColor=this.color;ctx.shadowBlur=14;ctx.beginPath();ctx.moveTo(0,18);ctx.lineTo(0,-24);ctx.stroke();ctx.beginPath();ctx.moveTo(0,-31);ctx.lineTo(-7,-18);ctx.lineTo(7,-18);ctx.closePath();ctx.fill();if(this.frV2Arrow){ctx.beginPath();ctx.moveTo(0,12);ctx.lineTo(-8,20);ctx.moveTo(0,12);ctx.lineTo(8,20);ctx.stroke();}ctx.restore();return;}
  return frV2BaseBulletDraw.call(this);
 };

 function frV2HitEffects(target,amount){
  const now=frV2Now(),ctxType=window.frV2DamageContext;
  if(target._frV2DefenseDownUntil>now)amount*=target._frV2DefenseDownBoss?1.12:1.25;
  if(frV2Has('dragonfruit_emperor')&&target._frV2BurnUntil>now)amount*=1.2;
  if(ctxType!=='dot'&&frV2Has('chili_sprite')&&Math.random()<.08){amount*=1.75;addText('爆擊',target.x,target.y-22,'#fb7185',12);}
  return amount;
 }
 function frV2AfterHit(target,amount){
  if(window.frV2DamageContext==='dot'||!frV2Alive(target))return;
  if(frV2.cheeseBurnUntil>frV2Now())frV2Burn(target,2000,5);
  const pop=bullets.find(function(b){return b.frV2Pop&&!b.frV2Popped&&frV2Distance(b,target)<(b.r||8)+(target.r||18)+6;});
  if(pop){pop.frV2Popped=true;const prior=window.frV2DamageContext;window.frV2DamageContext='dot';frV2Area(target.x,target.y,55,8,'dot');window.frV2DamageContext=prior;frV2Burst(target.x,target.y,'#fde68a',10);}
  if(frV2Has('lemon_battery')&&Math.random()<.20){const other=frV2Targets().filter(function(t){return t!==target;}).sort(function(a,b){return frV2Distance(a,target)-frV2Distance(b,target);})[0];if(other&&frV2Distance(other,target)<180){const prior=window.frV2DamageContext;window.frV2DamageContext='dot';frApplyDamage(other,Math.max(4,amount*.6));window.frV2DamageContext=prior;frBoltFx(target.x,target.y,other.x,other.y,'#fde047',260,0,4);}}
  const melee=currentWeapon==='melee';
  if(frV2Has('puffer_alchemist')&&Math.random()<(melee?.03:.01))frV2Poison(target,5000,4);
  if(frV2Has('truffle_thunder')&&Math.random()<.10&&frV2Now()>(target._frV2ChainReady||0)){
   target._frV2ChainReady=frV2Now()+2000;frV2Slow(target,900,.25);frBoltFx(player.x,player.y,target.x,target.y,'#fde047',300,0,4);
   const other=frV2Targets().filter(function(t){return t!==target;}).sort(function(a,b){return frV2Distance(a,target)-frV2Distance(b,target);})[0];
   if(other&&frV2Distance(other,target)<170){const prior=window.frV2DamageContext;window.frV2DamageContext='dot';frApplyDamage(other,8);window.frV2DamageContext=prior;frV2Slow(other,700,.45);}
  }
 }
 function frV2WrapTakeDamage(proto){if(!proto||proto._frV2Wrapped)return;proto._frV2Wrapped=true;const base=proto.takeDamage;proto.takeDamage=function(amount){const adjusted=frV2HitEffects(this,amount);const result=base.call(this,adjusted);frV2AfterHit(this,adjusted);return result;};}
 if(typeof Enemy!=='undefined')frV2WrapTakeDamage(Enemy.prototype);
 if(typeof Boss!=='undefined')frV2WrapTakeDamage(Boss.prototype);
 function frV2WrapEnemyUpdate(proto){if(!proto||proto._frV2UpdateWrapped)return;proto._frV2UpdateWrapped=true;const base=proto.update;proto.update=function(){if(this._frV2AttackDownUntil>frV2Now()){this._frV2AttackSkip=(this._frV2AttackSkip||0)+1;if(this._frV2AttackSkip%4===0)return;}return base.apply(this,arguments);};}
 if(typeof Enemy!=='undefined')frV2WrapEnemyUpdate(Enemy.prototype);
 if(typeof Boss!=='undefined')frV2WrapEnemyUpdate(Boss.prototype);

 const frV2BaseHurt=hurtPlayer;
 hurtPlayer=function(raw){
  if(frV2Now()<frV2.lotusPhaseUntil&&eBullets.some(function(b){return frV2Distance(b,player)<player.radius+(b.r||5)+12;}))return;
  let dmg=raw;if(frV2Has('lobster_general'))dmg*=.9;
  const potatoGuard=frV2Has('potato_armor')&&frV2Targets().some(function(t){return frV2Distance(t,player)<player.radius+(t.r||18)+24;});if(potatoGuard){dmg*=.65;if(frV2Ready('potatoGuardFx',350)){addText('厚皮減傷',player.x,player.y-30,'#d6d3d1',11);frRingFx(player.x,player.y,'#d6d3d1',48,380,5);}}
  const hp=player.hp,shield=player.shieldHp||0,r=frV2BaseHurt(dmg);if(player.hp<hp||(player.shieldHp||0)<shield)frV2.lastDamageAt=frV2Now();return r;
 };
 const frV2BaseDodge=doDodge;
 doDodge=function(){const was=player.dodging,r=frV2BaseDodge.apply(this,arguments);if(!was&&player.dodging&&frV2Has('salmon_ronin')&&frV2Now()>=frV2.salmonReadyAt){frV2.salmonBuffUntil=frV2Now()+5000;frV2.salmonReadyAt=frV2Now()+8000;addText('浪人步',player.x,player.y-34,'#60a5fa',12);}return r;};

 function frV2UpdateFields(now){
  for(let i=frV2.fields.length-1;i>=0;i--){const f=frV2.fields[i];
   if(now>=f.until){if(f.kind==='cheese'&&!f.exploded){frV2Area(f.x,f.y,140,50,'skill');frV2Burst(f.x,f.y,'#facc15',22);}else if(f.kind==='blackhole'&&!f.exploded){f.exploded=true;for(let j=eBullets.length-1;j>=0;j--)if(frV2Distance(eBullets[j],f)<115)eBullets.splice(j,1);frV2Area(f.x,f.y,115,25,'skill');frV2Burst(f.x,f.y,'#a855f7',24);}frV2.fields.splice(i,1);continue;}
   if(f.kind==='chili'&&now>=f.nextTick){f.nextTick=now+500;frV2Area(f.x,f.y,f.r,9,'dot',function(t){frV2Burn(t,2200,9);});}
   else if(f.kind==='tornado'&&now>=f.nextTick){const t=frV2Nearest(f.x,f.y);if(t){f.x+=(t.x-f.x)*.1;f.y+=(t.y-f.y)*.1;}f.nextTick=now+500;frV2Area(f.x,f.y,60,13,'skill',function(e){frV2Push(e,f.x,f.y,28);});}
   else if(f.kind==='garlic'){for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(frV2Distance(b,player)<130+(b.r||5)){frV2Reflect(b,'#e9d5ff',1);eBullets.splice(j,1);}}frV2Targets().forEach(function(t){if(frV2Distance(t,player)<125)frV2Push(t,player.x,player.y,3);});}
   else if(f.kind==='onion'){for(let j=eBullets.length-1;j>=0&&f.layers>0;j--){const b=eBullets[j],d=frV2Distance(b,player);if(b.y<player.y&&d<170&&d>75){eBullets.splice(j,1);f.layers--;frV2Burst(b.x,b.y,'#a7f3d0',10);}}if(f.layers<=0)f.until=0;}
   else if(f.kind==='beam'&&now>=f.activate&&now>=f.nextTick){f.nextTick=now+200;frV2Targets().forEach(function(t){if(Math.abs(t.x-f.x)<=f.width/2+(t.r||18)&&t.y<=player.y)frV2SkillDamage(t,f.damage,'skill');});}
   else if(f.kind==='ink'){frV2Targets().forEach(function(t){if(Math.hypot(t.x-f.x,t.y-f.y)<f.r+(t.r||18)&&now>(f.hits.get(t)||0)){f.hits.set(t,now+1500);t._frV2SilencedUntil=now+850;if('atkTimer'in t)t.atkTimer=Math.min(t.atkTimer||0,-40);if('shootTimer'in t)t.shootTimer=Math.min(t.shootTimer||0,-40);}});}
   else if(f.kind==='tentacle'&&now>=f.nextTick){f.nextTick=now+500;frV2Area(player.x,player.y,205,14,'skill');for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(frV2Distance(b,player)<210){frV2Reflect(b,'#c084fc',1);eBullets.splice(j,1);break;}}}
   else if(f.kind==='poison'&&now>=f.nextTick){f.nextTick=now+1000;frV2Targets().forEach(function(t){if(Math.abs(t.x-f.x)<f.w/2+(t.r||18)&&Math.abs(t.y-f.y)<f.h/2+(t.r||18)){frV2SkillDamage(t,7,'dot');frV2Poison(t,5000,4);}});}
   else if(f.kind==='thorn'&&now>=f.nextTick){f.nextTick=now+1000;frV2Targets().forEach(function(t){if(Math.abs(t.x-f.x)<f.w/2+(t.r||18)&&t.y<f.bottom){frV2Poison(t,10000,5);frV2Slow(t,frV2Boss(t)?1200:3000,frV2Boss(t)?.55:.05);}});}
   else if(f.kind==='blackhole'){frV2Targets().forEach(function(t){t.x+=(f.x-t.x)*.055;t.y+=(f.y-t.y)*.055;});eBullets.forEach(function(b){b.x+=(f.x-b.x)*.08;b.y+=(f.y-b.y)*.08;});}
   else if(f.kind==='truffleRing'&&now>=f.nextTick){f.nextTick=now+500;frV2Area(player.x,player.y,80,10,'skill',function(t){frV2Push(t,player.x,player.y,18);});}
   else if(f.kind==='truffleDomain'&&now>=f.nextTick){f.y-=1.2;f.nextTick=now+500;frV2Area(f.x,f.y,60,16,'skill');}
   else if(f.kind==='dragonLane'&&now>=f.activate&&now>=f.nextTick){f.nextTick=now+500;frV2Targets().forEach(function(t){if(t.y<player.y&&Math.abs(t.x-f.x)<f.w/2+(t.r||18)){frV2SkillDamage(t,12,'dot');frV2Burn(t,2500,12);}});}
   else if(f.kind==='popcornDrop'&&now>=f.activate&&!f.exploded){f.exploded=true;frV2ExplodePopcorn(f.x,f.y);}
   else if(f.kind==='meteor'&&now>=f.activate&&!f.exploded){f.exploded=true;f.explodedAt=now;frV2Area(f.x,f.y,f.r,45,'skill');frV2Area(f.x,f.y,f.r*.45,45,'skill');frV2Burst(f.x,f.y,'#fb923c',35);frShakeFx(12,520);frFlashFx('#f97316',320,.26);}
   else if(f.kind==='honey'&&now>=f.nextTick){f.nextTick=now+1000;if(frV2Distance(f,player)<f.r)frV2Heal(3);}
   else if(f.kind==='icewall'){for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(Math.abs(b.x-f.x)<f.w/2&&Math.abs(b.y-f.y)<f.h/2){f.hp-=Math.max(1,b.dmg||5);eBullets.splice(j,1);}}if(now>=f.nextTick){f.nextTick=now+600;frV2Targets().forEach(function(t){if(Math.abs(t.x-f.x)<f.w/2+(t.r||18)&&Math.abs(t.y-f.y)<f.h/2+(t.r||18)){frV2SkillDamage(t,frV2Boss(t)?12:25,'skill');frV2Slow(t,700,.2);}});}if(f.hp<=0)f.until=0;}
   else if(f.kind==='cheese'){frV2Targets().forEach(function(t){const pull=frV2Boss(t)?.006:.025;t.x+=(f.x-t.x)*pull;t.y+=(f.y-t.y)*pull;});for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(frV2Distance(b,f)<32+(b.r||5)){f.hp-=Math.max(1,b.dmg||5);eBullets.splice(j,1);}}if(f.hp<=0)f.until=0;}
   if(f.follow){f.x=player.x;f.y=player.y;}
  }
 }

 function frV2UpdateSummons(now){
  for(let i=frV2.summons.length-1;i>=0;i--){const s=frV2.summons[i];if(now>=s.until||s.hp<=0){frV2.summons.splice(i,1);continue;}const t=frV2Nearest(s.x,s.y);
   if(s.kind==='bee'||s.kind==='ghost'||s.kind==='clone'){if(t){const d=frV2Distance(s,t)||1,want=s.kind==='ghost'?62:38;s.x+=(t.x-s.x)/d*(d>want?2.1:-1);s.y+=(t.y-s.y)/d*(d>want?2.1:-1);if(now>=s.nextAttack&&d<150){s.nextAttack=now+(s.kind==='clone'?650:700);frV2SkillDamage(t,s.damage,'summon');}}}
   else if(s.kind==='turret'&&t&&now>=s.nextAttack){s.nextAttack=now+650;const a=Math.atan2(t.y-s.y,t.x-s.x);const b=new Bullet(s.x,s.y,Math.cos(a)*7,Math.sin(a)*7,10*(window._curAtkMult||atkMult),'#fb923c',6,true,true,false);bullets.push(b);}
   for(let j=eBullets.length-1;j>=0;j--){const b=eBullets[j];if(frV2Distance(b,s)<16+(b.r||5)){if(!(s.kind==='ghost'&&now-s.start<1000))s.hp-=Math.max(1,b.dmg||5);eBullets.splice(j,1);break;}}
  }
 }
 function frV2UpdateStatus(now){
  frV2Targets().forEach(function(t){if(t._frV2BurnUntil>now&&frV2Ready('burn'+(t._frId||(t._frId=Math.random())),1000,now))frV2SkillDamage(t,t._frV2BurnDps||5,'dot');if(t._frV2PoisonUntil>now&&frV2Ready('poison'+(t._frId||(t._frId=Math.random())),1000,now))frV2SkillDamage(t,t._frV2PoisonDps||4,'dot');});
  const joyX=typeof jdx==='number'?jdx:0,joyY=typeof jdy==='number'?jdy:0,moving=Math.hypot(player.vx||0,player.vy||0)>.15||Math.hypot(joyX,joyY)>.15;if(moving){frV2.coffeeMovingSince=frV2.coffeeMovingSince||now;frV2.coffeeStoppedAt=0;}else if(!frV2.coffeeStoppedAt)frV2.coffeeStoppedAt=now;else if(now-frV2.coffeeStoppedAt>800)frV2.coffeeMovingSince=0;
 }

 function frV2Draw(){
  const now=frV2Now();ctx.save();ctx.lineWidth=3;frV2.fields.forEach(function(f){const warn=f.activate&&now<f.activate;
   if(f.kind==='chili'||f.kind==='poison'||f.kind==='honey'){ctx.globalAlpha=.3;ctx.fillStyle=f.kind==='chili'?'#ef4444':f.kind==='poison'?'#65a30d':'#facc15';if(f.r){ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();}else ctx.fillRect(f.x-f.w/2,f.y-f.h/2,f.w,f.h);}
   else if(f.kind==='tornado'){ctx.strokeStyle='#fb7185';for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(f.x,f.y,22+k*13,now/160+k,now/160+4);ctx.stroke();}}
   else if(f.kind==='garlic'||f.kind==='truffleRing'){const r=f.kind==='garlic'?130:80;ctx.strokeStyle=f.kind==='garlic'?'#e9d5ff':'#fde047';ctx.shadowColor=ctx.strokeStyle;ctx.shadowBlur=12;ctx.beginPath();ctx.arc(player.x,player.y,r,0,Math.PI*2);ctx.stroke();if(f.kind==='truffleRing')for(let k=0;k<6;k++){const a=now/150+k*Math.PI/3,x=player.x+Math.cos(a)*r,y=player.y+Math.sin(a)*r;ctx.beginPath();ctx.moveTo(x-7,y-8);ctx.lineTo(x+5,y);ctx.lineTo(x-5,y+8);ctx.stroke();}}
   else if(f.kind==='tentacle'){ctx.strokeStyle='#c084fc';ctx.lineCap='round';ctx.shadowColor='#7e22ce';ctx.shadowBlur=10;for(let k=0;k<8;k++){const a=k*Math.PI/4+Math.sin(now/240+k)*.12,len=155+Math.sin(now/170+k)*22,x2=player.x+Math.cos(a)*len,y2=player.y+Math.sin(a)*len;ctx.lineWidth=15;ctx.globalAlpha=.72;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.quadraticCurveTo(player.x+Math.cos(a+.42)*len*.6,player.y+Math.sin(a+.42)*len*.6,x2,y2);ctx.stroke();ctx.lineWidth=4;ctx.globalAlpha=.9;ctx.strokeStyle='#e9d5ff';ctx.stroke();ctx.strokeStyle='#c084fc';}}
   else if(f.kind==='onion'){ctx.strokeStyle='#a7f3d0';for(let k=0;k<f.layers;k++){ctx.beginPath();ctx.arc(player.x,player.y,100+k*25,Math.PI,Math.PI*2);ctx.stroke();}}
   else if(f.kind==='beam'){const pulse=.72+Math.sin(now/55)*.18;ctx.globalAlpha=warn?.2:.34;ctx.fillStyle='#facc15';ctx.fillRect(f.x-f.width/2,0,f.width,player.y);ctx.globalAlpha=warn?.25:.92;ctx.fillStyle='#fff7ae';ctx.shadowColor='#fde047';ctx.shadowBlur=20;ctx.fillRect(f.x-f.width*.22,0,f.width*.44,player.y);ctx.globalAlpha=.75*pulse;ctx.fillStyle='#ffffff';ctx.fillRect(f.x-3,0,6,player.y);}
   else if(f.kind==='dragonLane'){const active=now>=f.activate,phase=now/95,top=18,bottom=player.y-20;ctx.save();ctx.globalAlpha=active?.78:.22;ctx.shadowColor='#ef4444';ctx.shadowBlur=active?18:0;for(let layer=0;layer<3;layer++){const width=f.w*(1-layer*.23);ctx.strokeStyle=layer===0?'#dc2626':layer===1?'#f97316':'#fde047';ctx.lineWidth=width;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(f.x,bottom);for(let y=bottom;y>top;y-=24){const sway=Math.sin(phase+y*.055+layer)*10*(1-y/bottom);ctx.lineTo(f.x+sway,y);}ctx.stroke();}ctx.globalAlpha=active?.95:.35;ctx.fillStyle='#fff7ae';for(let k=0;k<8;k++){const y=bottom-((now/3+k*71)%(bottom-top)),x=f.x+Math.sin(phase+k)*f.w*.36;ctx.beginPath();ctx.arc(x,y,2+(k%3),0,Math.PI*2);ctx.fill();}ctx.restore();}
   else if(f.kind==='ink'){ctx.globalAlpha=.35;ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();}
   else if(f.kind==='thorn'){ctx.globalAlpha=.32;ctx.fillStyle='#84cc16';ctx.fillRect(f.x-f.w/2,0,f.w,f.bottom);}
   else if(f.kind==='blackhole'){ctx.fillStyle='#111827';ctx.beginPath();ctx.arc(f.x,f.y,48,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a855f7';ctx.stroke();}
   else if(f.kind==='truffleDomain'){ctx.globalAlpha=.24;ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(f.x,f.y,60,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.9;ctx.strokeStyle='#fff7ae';for(let k=0;k<4;k++){const a=now/180+k*Math.PI/2;ctx.beginPath();ctx.arc(f.x+Math.cos(a)*38,f.y+Math.sin(a)*38,8,0,Math.PI*2);ctx.stroke();}}
   else if(f.kind==='popcornDrop'){const t=Math.max(0,Math.min(1,(now-f.launch)/(f.activate-f.launch))),cy=f.fromY+(f.y-f.fromY)*t*t;ctx.globalAlpha=f.exploded?Math.max(0,(f.until-now)/280):1;ctx.fillStyle='#fff7d6';ctx.strokeStyle='#f59e0b';ctx.lineWidth=3;ctx.shadowColor='#fbbf24';ctx.shadowBlur=12;ctx.beginPath();for(let k=0;k<10;k++){const a=k*Math.PI/5,rr=12+(k%2)*7;const px=f.x+Math.cos(a)*rr,py=cy+Math.sin(a)*rr;if(k===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.fill();ctx.stroke();if(!f.exploded){ctx.globalAlpha=.2+.18*Math.sin(now/70);ctx.fillStyle='#fde68a';ctx.beginPath();ctx.ellipse(f.x,f.y,f.r,f.r*.38,0,0,Math.PI*2);ctx.fill();}}
   else if(f.kind==='meteor'){const t=Math.max(0,Math.min(1,(now-f.launch)/(f.activate-f.launch))),mx=f.fromX+(f.x-f.fromX)*t,my=f.fromY+(f.y-f.fromY)*t;if(!f.exploded){ctx.globalAlpha=.2+.12*Math.sin(now/70);ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fde047';ctx.setLineDash([10,7]);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.58;ctx.strokeStyle='#f97316';ctx.lineWidth=Math.max(36,f.r*.9);ctx.beginPath();ctx.moveTo(f.fromX,f.fromY);ctx.lineTo(mx,my);ctx.stroke();ctx.globalAlpha=1;const rg=ctx.createRadialGradient(mx-f.r*.28,my-f.r*.28,5,mx,my,f.r);rg.addColorStop(0,'#ffffff');rg.addColorStop(.22,'#fde047');rg.addColorStop(.58,'#f97316');rg.addColorStop(1,'#7f1d1d');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(mx,my,f.r,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fecaca';ctx.lineWidth=5;ctx.stroke();}else{const e=Math.max(0,Math.min(1,(now-(f.explodedAt||f.activate))/720));ctx.globalAlpha=1-e*.82;const rg=ctx.createRadialGradient(f.x,f.y,4,f.x,f.y,f.r*(.5+e));rg.addColorStop(0,'#ffffff');rg.addColorStop(.25,'#fde047');rg.addColorStop(.62,'#f97316');rg.addColorStop(1,'rgba(127,29,29,0)');ctx.fillStyle=rg;ctx.beginPath();ctx.arc(f.x,f.y,f.r*(.55+e*.75),0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=8*(1-e*.6);ctx.stroke();for(let k=0;k<10;k++){const a=k*Math.PI/5,len=f.r*(.7+e*1.25);ctx.beginPath();ctx.moveTo(f.x+Math.cos(a)*f.r*.25,f.y+Math.sin(a)*f.r*.25);ctx.lineTo(f.x+Math.cos(a)*len,f.y+Math.sin(a)*len);ctx.stroke();}}}
   else if(f.kind==='icewall'){const left=f.x-f.w/2,right=f.x+f.w/2,bottom=f.y+f.h/2,top=f.y-f.h/2,step=f.w/9;ctx.globalAlpha=.82;ctx.fillStyle='#a5f3fc';ctx.strokeStyle='#e0f2fe';ctx.lineWidth=4;ctx.shadowColor='#38bdf8';ctx.shadowBlur=18;ctx.beginPath();ctx.moveTo(left,bottom);ctx.lineTo(left,top+14);for(let k=0;k<9;k++){const x=left+k*step;ctx.lineTo(x+step*.28,top+6);ctx.lineTo(x+step*.5,top-22-(k%3)*9);ctx.lineTo(x+step*.75,top+7);}ctx.lineTo(right,bottom);ctx.closePath();ctx.fill();ctx.stroke();ctx.globalAlpha=.72;ctx.strokeStyle='#ffffff';ctx.lineWidth=2;for(let k=1;k<9;k++){const x=left+k*step;ctx.beginPath();ctx.moveTo(x,bottom-3);ctx.lineTo(x-step*.12,top+8);ctx.stroke();}}
   else if(f.kind==='cheese'){ctx.fillStyle='#facc15';ctx.strokeStyle='#fef08a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(f.x-34,f.y+25);ctx.lineTo(f.x+35,f.y+25);ctx.lineTo(f.x+19,f.y-29);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#ca8a04';[[f.x-13,f.y+6,6],[f.x+13,f.y+11,5],[f.x+5,f.y-10,4]].forEach(function(h){ctx.beginPath();ctx.arc(h[0],h[1],h[2],0,Math.PI*2);ctx.fill();});}
   else if(f.kind==='aura'){const age=now-f.start,pulse=1+Math.sin(now/90)*.08,r=(f.r||62)*pulse;ctx.globalAlpha=.28;ctx.fillStyle=f.color;ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.85;ctx.strokeStyle=f.color;ctx.lineWidth=f.style==='giant'?9:4;ctx.setLineDash(f.style==='phase'?[8,8]:[]);ctx.beginPath();ctx.arc(f.x,f.y,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(f.style==='frenzy'||f.style==='coffee'){ctx.lineWidth=6;for(let k=0;k<4;k++){const y=f.y+35-((age*.25+k*30)%120);ctx.beginPath();ctx.moveTo(f.x-34+k*22,y);ctx.lineTo(f.x-24+k*22,y-28);ctx.stroke();}}}
   else if(f.kind==='roar'){const t=Math.min(1,(now-f.start)/220),a=-Math.PI/2,spread=.52,len=f.length*t;ctx.globalAlpha=.18*(1-t)+.2;ctx.fillStyle='#ef4444';ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.arc(f.x,f.y,len,a-spread,a+spread);ctx.closePath();ctx.fill();ctx.globalAlpha=1-t;ctx.strokeStyle='#fecaca';ctx.lineWidth=7;ctx.stroke();}
  });
  if(frV2Has('dragonfruit_emperor')){ctx.save();ctx.globalAlpha=.22+.06*Math.sin(now/120);ctx.strokeStyle='#fb923c';ctx.lineWidth=5;ctx.setLineDash([14,9]);ctx.lineDashOffset=-now/35;ctx.beginPath();ctx.arc(player.x,player.y,185,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);for(let k=0;k<7;k++){const a=now/500+k*Math.PI*2/7;ctx.fillStyle=k%2?'#fde047':'#ef4444';ctx.beginPath();ctx.arc(player.x+Math.cos(a)*185,player.y+Math.sin(a)*185,3+k%3,0,Math.PI*2);ctx.fill();}ctx.restore();}
  if(frV2Has('cheese_mage')){ctx.save();ctx.strokeStyle='#facc15';ctx.lineWidth=2;ctx.globalAlpha=.28;frV2Targets().slice(0,8).forEach(function(t){ctx.beginPath();ctx.ellipse(t.x,t.y+(t.r||18),Math.max(12,t.r||18),6,0,0,Math.PI*2);ctx.stroke();});ctx.restore();}
  if(frV2Has('beef_berserker')&&player.maxHp&&player.hp/player.maxHp<.6){ctx.save();ctx.globalAlpha=.2+(1-player.hp/player.maxHp)*.28;ctx.fillStyle='#ef4444';ctx.beginPath();ctx.arc(player.x,player.y,48+Math.sin(now/85)*5,0,Math.PI*2);ctx.fill();ctx.restore();}
  if(now<frV2.garlicBuffUntil||now<frV2.salmonBuffUntil){ctx.save();ctx.globalAlpha=.48;ctx.strokeStyle=now<frV2.garlicBuffUntil?'#e9d5ff':'#60a5fa';ctx.lineWidth=4;ctx.setLineDash([7,6]);ctx.lineDashOffset=-now/28;ctx.beginPath();ctx.arc(player.x,player.y,54,0,Math.PI*2);ctx.stroke();ctx.restore();}
  if(frV2Has('coffee_pilot')&&frV2.coffeeMovingSince&&now-frV2.coffeeMovingSince>=3000){ctx.save();ctx.globalAlpha=.42;ctx.strokeStyle='#fef3c7';ctx.lineWidth=4;for(let k=0;k<3;k++){const y=player.y+35+k*15;ctx.beginPath();ctx.moveTo(player.x-25,y);ctx.lineTo(player.x-8,y-18);ctx.stroke();}ctx.restore();}
  frV2Targets().slice(0,10).forEach(function(t){const poisoned=t._frV2PoisonUntil>now,burning=t._frV2BurnUntil>now;if(!poisoned&&!burning)return;ctx.save();ctx.globalAlpha=.36+.12*Math.sin(now/90);ctx.strokeStyle=poisoned?'#a3e635':'#fb923c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(t.x,t.y,Math.max(15,(t.r||18)+7),0,Math.PI*2);ctx.stroke();ctx.restore();});
  frV2.pickups.forEach(function(p){ctx.fillStyle='#86efac';ctx.font='24px sans-serif';ctx.fillText('🍄',p.x-12,p.y+8);});
  frV2.orbs.forEach(function(o){ctx.fillStyle='#fde047';ctx.beginPath();ctx.arc(o.x,o.y,10,0,Math.PI*2);ctx.fill();});
  frV2.summons.forEach(function(s){ctx.save();ctx.translate(s.x,s.y);if(s.kind==='clone'){const img=frImg(s.formId||currentForm.id,'battle');ctx.globalAlpha=.78;if(img&&img.complete&&img.naturalWidth)ctx.drawImage(img,-22,-22,44,44);else{ctx.fillStyle='#d8b4fe';ctx.beginPath();ctx.arc(0,0,18,0,Math.PI*2);ctx.fill();}}else if(s.kind==='turret'){ctx.fillStyle='#9a3412';ctx.strokeStyle='#fed7aa';ctx.lineWidth=3;ctx.fillRect(-15,-5,30,19);ctx.strokeRect(-15,-5,30,19);ctx.fillStyle='#475569';ctx.fillRect(-4,-25,8,25);ctx.beginPath();ctx.arc(0,-25,8,0,Math.PI*2);ctx.fill();}else{ctx.font='22px sans-serif';ctx.textAlign='center';ctx.fillText(s.kind==='bee'?'🐝':'👻',0,7);}ctx.fillStyle='#22c55e';ctx.fillRect(-15,-30,30*Math.max(0,s.hp/s.maxHp),3);ctx.restore();});ctx.restore();
 }

 function frV2Tick(now){
  if(!gameRunning)return;frV2ApplySharedPassives(now);frV2UpdateStatus(now);frV2UpdateFields(now);frV2UpdateSummons(now);
  if(now<frV2.lobsterAbsorbUntil&&frV2.lobsterAbsorbed<6){for(let i=eBullets.length-1;i>=0&&frV2.lobsterAbsorbed<6;i--){const b=eBullets[i];if(frV2Distance(b,player)<95+(b.r||5)){eBullets.splice(i,1);frV2.lobsterAbsorbed++;frV2Shield(6,72);frV2Burst(b.x,b.y,'#fb923c',8);}}}
  for(let i=frV2.pickups.length-1;i>=0;i--){const p=frV2.pickups[i];if(now>p.until)frV2.pickups.splice(i,1);else if(frV2Distance(p,player)<34){frV2Heal(10);frV2.pickups.splice(i,1);}}
  for(let i=frV2.orbs.length-1;i>=0;i--){const o=frV2.orbs[i];if(now>o.until){frV2.orbs.splice(i,1);continue;}o.angle+=.035;o.x=player.x+Math.cos(o.angle)*62;o.y=player.y+Math.sin(o.angle)*62;const t=frV2Targets().find(function(e){return frV2Distance(e,o)<(e.r||18)+12;});if(t){frV2SkillDamage(t,20,'skill');frV2Push(t,player.x,player.y,35);frV2.orbs.splice(i,1);}}
 }

 useSkill1=function(){const cast=frV2Begin(1);if(!cast)return;const id=cast.id,c=cast.c,now=frV2Now();
  if(id==='normal')frV2Heal(10);
  else if(id==='onion_guard'){frClearBullets(165);frV2Area(player.x,player.y,165,20,'skill',function(t){frV2Push(t,player.x,player.y,55);});}
  else if(id==='popcorn'){for(let i=0;i<5;i++)frV2StartPopcornRain(i);}
  else if(id==='healing_mushroom'){for(let i=0;i<3;i++)frV2Pickup('mushroom',Math.max(30,Math.min(CW-30,player.x+(i-1)*70)),Math.max(80,player.y-70-Math.abs(i-1)*25),now+7000);}
  else if(id==='garlic_knight'){frCleanse();player.invTimer=Math.max(player.invTimer,72);frV2Aura('phase','#e9d5ff',1200,{r:72});}
  else if(id==='chili_sprite')frV2Field('chili',{x:CW/2,y:CH*.3,r:72,until:now+5000});
  else if(id==='lotus_archer'){frV2.lotusPhaseUntil=now+2500;player.alpha=.42;frV2Aura('phase','#a7f3d0',2500,{r:68});setTimeout(function(){player.alpha=1;},2500);}
  else if(id==='potato_armor'){frV2Shield(35,70);frClearBullets(130);}
  else if(id==='lemon_battery'){for(let i=0;i<2&&frV2.orbs.length<4;i++)frV2.orbs.push({angle:(Math.PI*2/4)*frV2.orbs.length,x:player.x,y:player.y,until:now+10000});}
  else if(id==='cheese_mage'){frV2.cheeseBurnUntil=now+8000;frV2Aura('cheeseFire','#facc15',8000,{r:58});}
  else if(id==='honey_priest'){frV2Heal(12);frV2.honeyBuffUntil=now+4000;frV2Aura('honey','#fde047',4000,{r:62});}
  else if(id==='coffee_pilot'){frV2.coffeeBuffUntil=now+5000;frV2Aura('coffee','#f59e0b',5000,{r:60});}
  else if(id==='octopus_samurai'){frV2Field('ink',{x:CW*.32,y:CH*.28,r:66,until:now+5000});frV2Field('ink',{x:CW*.68,y:CH*.35,r:66,until:now+5000});}
  else if(id==='salmon_ronin'){frSlashFx(player.x,player.y,'#60a5fa',CW*.5,-Math.PI/2,600,0,28);frV2Targets().forEach(function(t){if(frV2InFront(t,CH,CW*.25)){frV2SkillDamage(t,28,'skill');frV2Push(t,player.x,player.y,80);}});for(let i=eBullets.length-1;i>=0;i--){if(frV2InFront(eBullets[i],CH,CW*.28))eBullets.splice(i,1);}}
  else if(id==='beef_berserker'){frV2Field('roar',{x:player.x,y:player.y,length:CH*.5,until:now+650});frV2Targets().forEach(function(t){if(frV2InFront(t,CH*.5,CW*.25)){t._frV2DefenseDownUntil=now+6000;t._frV2DefenseDownBoss=frV2Boss(t);}});}
  else if(id==='puffer_alchemist')frV2Field('poison',{x:player.x,y:Math.max(100,player.y-150),w:180,h:180,until:now+7000});
  else if(id==='black_garlic_void')frV2Field('blackhole',{x:CW/2,y:CH*.38,until:now+1500});
  else if(id==='lobster_general'){frV2.lobsterAbsorbUntil=now+2500;frV2.lobsterAbsorbed=0;frV2Aura('shell','#fb923c',2500,{r:92});}
  else if(id==='truffle_thunder')frV2Field('truffleRing',{until:now+10000});
  else if(id==='dragonfruit_emperor'){frV2Field('dragonLane',{x:player.x-48,w:78,activate:now+280,until:now+4780});frV2Field('dragonLane',{x:player.x+48,w:78,activate:now+280,until:now+4780});}
  else if(id==='peach_divine'){for(let i=0;i<12;i++)setTimeout(function(){if(!gameRunning)return;const b=new Bullet(player.x,player.y,0,-13,18*(window._curAtkMult||atkMult),'#f9a8d4',10,true,false,false);b.frV2Qi=true;bullets.push(b);},i*500);}
  else if(id==='cocoa_popsicle_wargod'){[0,1000].forEach(function(d){setTimeout(function(){if(!gameRunning)return;frCocoaLaunchArc(d?1:-1);frV2Targets().forEach(function(t){if(frV2InFront(t,CH,CW*.375)){frV2SkillDamage(t,20,'skill');frV2Slow(t,frV2Boss(t)?500:2000,.05);}});},d);});}
  updateHUD();
 };

 useSkill2=function(){const cast=frV2Begin(2);if(!cast)return;const id=cast.id,now=frV2Now();
  if(id==='normal'){frV2.normalBuffUntil=now+6000;normalFrenzyTimer=0;frV2Aura('frenzy','#fb7185',6000,{r:66});}
  else if(id==='onion_guard')frV2Field('onion',{layers:3,until:now+8000});
  else if(id==='popcorn'){for(let i=0;i<20;i++)setTimeout(function(){if(!gameRunning)return;const t=frV2Nearest(player.x,player.y),a=t?Math.atan2(t.y-player.y,t.x-player.x):-Math.PI/2,b=new Bullet(player.x,player.y,Math.cos(a)*7,Math.sin(a)*7,12*(window._curAtkMult||atkMult),'#fde68a',9,true,true,false);b.frV2Pop=true;bullets.push(b);},i*500);}
  else if(id==='healing_mushroom'){frV2Heal(35);frV2Shield(45,90);frV2Area(player.x,player.y,165,30,'skill');}
  else if(id==='garlic_knight')frV2Field('garlic',{until:now+2500});
  else if(id==='chili_sprite')frV2Field('tornado',{x:player.x,y:player.y-80,until:now+5000});
  else if(id==='lotus_archer'){for(let i=0;i<10;i++)setTimeout(function(){if(!gameRunning)return;const b=new Bullet(25+Math.random()*(CW-50),CH-15,0,-14,20*(window._curAtkMult||atkMult),'#a7f3d0',9,true,false,false);b.frV2Arrow=true;bullets.push(b);},i*500);}
  else if(id==='potato_armor')frV2Summon('clone',{formId:id,hp:player.maxHp*.45,maxHp:player.maxHp*.45,damage:currentForm.bulletDmg*.5,until:now+10000,start:now});
  else if(id==='lemon_battery')frV2StartBeam(player.x,'#fde047',12,CW*.25,1600);
  else if(id==='cheese_mage')frV2Field('cheese',{x:CW/2,y:CH*.38,hp:120,maxHp:120,until:now+10000});
  else if(id==='honey_priest'){frV2Field('honey',{x:player.x,y:player.y-45,r:78,until:now+8000});for(let i=0;i<3;i++)frV2Summon('bee',{x:player.x+(i-1)*28,y:player.y-35,hp:35,maxHp:35,damage:8,until:now+12000,start:now});}
  else if(id==='coffee_pilot'){eBullets.length=0;frSlowAll(4000,.12);frV2.coffeeBuffUntil=now+4000;frV2Aura('coffee','#fef3c7',4000,{r:105});}
  else if(id==='octopus_samurai')frV2Field('tentacle',{until:now+10000});
  else if(id==='salmon_ronin')for(let i=0;i<4;i++)setTimeout(function(){if(gameRunning)frV2SalmonFlash(i);},i*1000);
  else if(id==='beef_berserker'){frV2.beefGiantUntil=now+5000;frV2Aura('giant','#ef4444',5000,{r:105});}
  else if(id==='puffer_alchemist')frV2Field('thorn',{x:player.x,w:CW/3,bottom:player.y,until:now+10000});
  else if(id==='black_garlic_void'){for(let i=0;i<2;i++)frV2Summon('ghost',{x:player.x+(i?35:-35),y:player.y-25,hp:55,maxHp:55,damage:12,until:now+10000,start:now});}
  else if(id==='lobster_general'){frV2Summon('turret',{x:Math.max(25,player.x-90),y:player.y-50,hp:80,maxHp:80,until:now+10000,start:now});frV2Summon('turret',{x:Math.min(CW-25,player.x+90),y:player.y-50,hp:80,maxHp:80,until:now+10000,start:now});}
  else if(id==='truffle_thunder')frV2Field('truffleDomain',{x:player.x,y:player.y-50,until:now+6000});
  else if(id==='dragonfruit_emperor'){frV2SpawnMeteor(0);frV2SpawnMeteor(2000);}
  else if(id==='peach_divine'){frV2Heal(player.maxHp);frCleanse();frClearBullets(Infinity);player.invTimer=Math.max(player.invTimer,300);frV2Aura('divine','#f9a8d4',5000,{r:118});}
  else if(id==='cocoa_popsicle_wargod')frV2Field('icewall',{x:player.x,y:Math.max(85,player.y-105),w:220,h:50,hp:120,maxHp:120,until:now+10000});
  updateHUD();
 };

 const frV2BaseSwitch=switchToChar;
 switchToChar=function(slot){const old=activeChar,r=frV2BaseSwitch.apply(this,arguments);if(activeChar!==old&&charSlots[activeChar]){const now=frV2Now(),ch=charSlots[activeChar];sk1Cd=Math.max(0,(ch._frV2Cd1End||0)-now);sk2Cd=Math.max(0,(ch._frV2Cd2End||0)-now);updateHUD();}return r;};
 const frV2BasePlayerDied=playerDied;
 playerDied=function(){const id=currentForm&&currentForm.id,now=frV2Now();if(id==='peach_divine'&&!frV2.peachRevived){frV2.peachRevived=true;window.frPeachRevived=true;player.hp=Math.max(1,Math.round(player.maxHp*.3));if(charSlots[activeChar]){charSlots[activeChar].hp=player.hp;charSlots[activeChar].alive=true;}player.invTimer=120;frV2Burst(player.x,player.y,'#f9a8d4',28);addText('仙桃庇佑',player.x,player.y-40,'#f9a8d4',16);updateHUD();return;}if(id==='garlic_knight')frV2.garlicBuffUntil=now+15000;const r=frV2BasePlayerDied.apply(this,arguments),ch=charSlots[activeChar];if(ch&&ch.alive){sk1Cd=Math.max(0,(ch._frV2Cd1End||0)-frV2Now());sk2Cd=Math.max(0,(ch._frV2Cd2End||0)-frV2Now());}return r;};
 const frV2BaseBuildStage=buildStage;
 buildStage=function(){const r=frV2BaseBuildStage.apply(this,arguments);frV2.fields=[];frV2.summons=[];frV2.pickups=[];frV2.orbs=[];frV2.peachRevived=false;frV2.lastDamageAt=frV2Now();frV2.lastPassive={};frV2SuppressLegacy(frV2Now());return r;};
 const frV2BaseInitCharSlots=initCharSlots;
 initCharSlots=function(){
  const r=frV2BaseInitCharSlots.apply(this,arguments),normalCount=charSlots.filter(function(ch){return ch&&ch.formId==='normal';}).length,bonus=normalCount*10;
  charSlots.forEach(function(ch){if(!ch)return;if(ch.formId==='normal'){ch.maxHp=Math.max(1,ch.maxHp-10);ch.hp=Math.max(1,ch.hp-10);}ch.maxHp+=bonus;ch.hp=Math.min(ch.maxHp,ch.hp+bonus);});
  if(charSlots[activeChar]){player.maxHp=charSlots[activeChar].maxHp;player.hp=charSlots[activeChar].hp;}updateHUD();return r;
 };
 const frV2BaseMeleeCanHit=meleeCanHit,frV2BaseMeleeCanReflect=meleeCanReflect;
 meleeCanHit=function(t,extra){if(frV2Now()<frV2.beefGiantUntil){const dx=t.x-player.x,dy=t.y-player.y;return Math.hypot(dx,dy)<384+(t.r||0)+(extra||0)&&dy<150&&Math.abs(dx)<230;}return frV2BaseMeleeCanHit.apply(this,arguments);};
 meleeCanReflect=function(b){if(frV2Now()<frV2.beefGiantUntil){const dx=b.x-player.x,dy=b.y-player.y;return Math.hypot(dx,dy)<420+(b.r||0)&&dy<170&&Math.abs(dx)<240;}return frV2BaseMeleeCanReflect.apply(this,arguments);};
 if(typeof meleeTargetHit==='function'){const frV2BaseMeleeTargetHit=meleeTargetHit;meleeTargetHit=function(def,t,extra){if(frV2Now()<frV2.beefGiantUntil){const dx=t.x-player.x,dy=t.y-player.y;return Math.hypot(dx,dy)<Math.max(260,(def.range||100)*3)+(t.r||0)+(extra||0)&&dy<180&&Math.abs(dx)<Math.max(180,(def.range||100)*1.8);}return frV2BaseMeleeTargetHit.apply(this,arguments);};}
 const frV2BaseStartSwipe=startSwipe;startSwipe=function(){const r=frV2BaseStartSwipe.apply(this,arguments);if(frV2Now()<frV2.beefGiantUntil)swipeAnim.r=384;return r;};
 const frV2BaseAutoFire=autoFire;
 autoFire=function(){const before=bullets.length,r=frV2BaseAutoFire.apply(this,arguments);if(frV2Has('lobster_general'))for(let i=before;i<bullets.length;i++)if(bullets[i].frV2Reflected||bullets[i].frPattern==='reflect')bullets[i].dmg*=1.4;if(frV2.cheeseBurnUntil>frV2Now())for(let i=before;i<bullets.length;i++)bullets[i].burn=true;return r;};
 const frV2BaseLoop=loop;
 loop=function(ts){const r=frV2BaseLoop(ts);if(gameRunning){frV2Tick(ts);frV2Draw();}return r;};
 frV2SuppressLegacy(frV2Now());
})();
`;
})();

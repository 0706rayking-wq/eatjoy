/* Littlebite handoff is additive. Direct Eatjoy login and kitchen data stay unchanged. */
(() => {
 'use strict';
 const endpoint='https://asia-east1-littlebite-manager.cloudfunctions.net/kitchenBridge';
 const key='eatjoy.littlebite.session.v1',params=new URLSearchParams(location.hash.slice(1));
 const code=params.get('littlebite-code');let session=sessionStorage.getItem(key)||'',stopped=false,inflight=null,listener=null;
 if(code){session='';sessionStorage.removeItem(key);}
 const registration=params.get('littlebite-register')==='1',active=!registration&&(!!code||!!session);
 if(registration){session='';sessionStorage.removeItem(key);}
 if(code||registration)history.replaceState(null,'',location.pathname+location.search);
 if(active||registration){sessionStorage.removeItem('k_active_user');sessionStorage.removeItem('k_super_admin');}
 function overlay(message,error=false){let el=document.getElementById('kitchen-bridge-gate');if(!el){el=document.createElement('section');el.id='kitchen-bridge-gate';el.style.cssText='position:fixed;inset:0;z-index:999999;background:#0f172a;color:#f8fafc;display:grid;place-content:center;padding:24px;text-align:center;gap:16px;font:16px/1.6 sans-serif';document.body.append(el);}el.replaceChildren();const p=document.createElement('p');p.setAttribute('role',error?'alert':'status');p.textContent=message;el.append(p);if(error){const a=document.createElement('a');a.href='https://littlebite-manager.web.app/company';a.textContent='返回小食怪重新進入';a.style.cssText='padding:12px 20px;background:#fff;color:#0f172a;border-radius:12px';el.append(a);}return el;}
 async function request(body){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(25000)});const data=await r.json();if(!r.ok)throw Error(data.error||'無法完成登入，請返回小食怪重試');return data;}
 function stop(){stopped=true;session='';sessionStorage.removeItem(key);if(listener){window.removeEventListener('focus',listener);document.removeEventListener('visibilitychange',listener);}}
 function attach({success,failure}){
  if(!active||stopped)return()=>{};
  let disposed=false;
  const verify=()=>{if(stopped||disposed||document.hidden)return; if(inflight)return inflight;
   overlay('正在確認小食怪與廚務帳號權限…');
   inflight=request(session?{action:'validate',session}:{action:'consume',code}).then(r=>{if(stopped||disposed)return;session=r.session;sessionStorage.setItem(key,session);success(r.account);document.getElementById('kitchen-bridge-gate')?.remove();}).catch(e=>{if(stopped||disposed)return;stop();sessionStorage.removeItem('k_active_user');sessionStorage.removeItem('k_super_admin');failure();overlay(e.message,true);}).finally(()=>{inflight=null;});return inflight;
  };
  listener=verify;window.addEventListener('focus',verify);document.addEventListener('visibilitychange',verify);verify();
  return()=>{disposed=true;window.removeEventListener('focus',verify);document.removeEventListener('visibilitychange',verify);};
 }
 window.EatjoyAccountBridge={active,registration,attach,stop,refresh:()=>listener?.()};
 if(active)document.addEventListener('DOMContentLoaded',()=>overlay('正在載入廚務系統…'),{once:true});
})();

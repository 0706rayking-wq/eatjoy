const assert=require('node:assert/strict');
const handler=require('../api/schedule-intent');
const originalFetch=global.fetch,originalNow=Date.now;
const response=()=>({setHeader(){},status(s){this.code=s;return this;},json(x){this.body=x;return this;}});
(async()=>{try{
Date.now=()=>Date.parse('2026-11-13T12:00:00+08:00');
let commits=0,gets=0,write;
global.fetch=async(url,opts)=>{
 if(url.includes('/users/'))return {ok:true,json:async()=>({fields:{status:{stringValue:'approved'},name:{stringValue:'測試'},branch:{arrayValue:{values:[{stringValue:'台南中華'}]}}}})};
 if(url.endsWith(':commit')){commits++;write=JSON.parse(opts.body).writes[0];if(commits===1)return {ok:false,status:400,json:async()=>({error:{status:'FAILED_PRECONDITION'}})};return {ok:true,json:async()=>({})};}
 gets++;assert.ok(url.includes('%25'));return {ok:false,status:404,json:async()=>({})};
};
const req={method:'POST',headers:{authorization:'Bearer test'},body:{phone:'0912345678',branch:'台南中華',date:'2026-12-05',kind:'off'}};
let res=response();await handler(req,res);assert.equal(res.code,200);assert.equal(commits,2);assert.equal(gets,2);assert.ok(write.update.name.includes('%E5'));assert.equal(write.currentDocument.exists,false);
res=response();await handler({...req,body:{...req.body,branch:'其他店'}},res);assert.equal(res.code,403);
Date.now=()=>Date.parse('2026-11-21T00:00:00+08:00');res=response();await handler(req,res);assert.equal(res.code,400);assert.match(res.body.error,/截止/);
res=response();await handler({...req,headers:{}},res);assert.equal(res.code,401);
console.log('API branch isolation, conflict retry, encoded path, deadline, auth checks passed');
}finally{global.fetch=originalFetch;Date.now=originalNow;}})().catch(e=>{console.error(e);process.exitCode=1;});

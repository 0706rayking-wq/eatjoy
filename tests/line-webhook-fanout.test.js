const assert=require('node:assert/strict'),crypto=require('node:crypto'),{Readable}=require('node:stream');
const handler=require('../api/line-webhook'),G=require('../lib/hr-relay-release-gate')._test;
const {sourceBundleDigest}=require('../lib/hr-relay-source-binding');
const image=(id,timestamp,index)=>({type:'message',source:{type:'group',groupId:'HR_GROUP'},timestamp,message:{type:'image',id,imageSet:{id:'same-set',index,total:2}}});
(async()=>{
 const events=[image('1001',1791901267082,2),image('1002',1791901266921,1)],text={type:'message',source:{type:'group',groupId:'HR_GROUP'},message:{type:'text',text:'normal'}};
 assert.deepEqual(handler._test.splitHumanResourcesEvents(events),[[events[0]],[events[1]]]);
 assert.deepEqual(handler._test.splitHumanResourcesEvents([text,text]),[[text,text]]);
 const fixtures={LINE_CHANNEL_SECRET:'fixture-secret',LINE_HR_GROUP_ID:'HR_GROUP',N8N_RELAY_URL:G.RELAY_URL,N8N_RELAY_SECRET:'fixture-relay-secret',
  ATTENDANCE_ARCHIVE_URL:G.GAS_URL,ATTENDANCE_ARCHIVE_SECRET:'fixture-archive-secret',
  VERCEL:'1',VERCEL_ENV:'preview',VERCEL_PROJECT_ID:'prj_OfflineProject123',VERCEL_DEPLOYMENT_ID:'dpl_OfflineDeployment123',
  VERCEL_URL:'eatjoy-offlinebuild-team.vercel.app',VERCEL_BRANCH_URL:G.BRANCH_URL,VERCEL_GIT_COMMIT_SHA:'a'.repeat(40),
  VERCEL_GIT_PROVIDER:'github',VERCEL_GIT_REPO_OWNER:'0706rayking-wq',VERCEL_GIT_REPO_SLUG:'eatjoy',VERCEL_GIT_COMMIT_REF:'agent/line-hr-webhook-relay'};
 const envBefore={...process.env},fetchBefore=global.fetch;Object.assign(process.env,fixtures);
 try{
  const payload={destination:'fixture-bot',events:[...events,{...events[0],source:{type:'group',groupId:'OTHER_GROUP'}}]};
  const body=Buffer.from(JSON.stringify(payload)),calls=[];let open=true;
  global.fetch=async(url,options)=>{
   const data=JSON.parse(options.body);calls.push({url,payload:data});
   if(url===G.GAS_URL){
    assert.deepEqual(Object.keys(data).sort(),['action','challenge','secret']);
    const now=Date.now(),reply={schema:1,protocol:G.PROTOCOL,status:open?'ready':'closed',challenge:data.challenge,
     checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+15000).toISOString(),
     releaseEvidence:open?{releaseDigest:'1'.repeat(64),pinsDigest:'2'.repeat(64),cutoverSnapshotDigest:'3'.repeat(64),
      parentWorkflowId:G.WORKFLOW,parentDefinitionDigest:'4'.repeat(64),scheduleChildWorkflowId:G.CHILD_WORKFLOW,
      scheduleChildDefinitionDigest:'5'.repeat(64),cloudIdentity:G.cloudIdentity(process.env),
      relayUrl:G.RELAY_URL,ingressEvidenceDigest:'6'.repeat(64)}:null};
    assert.equal(reply.releaseEvidence?.cloudIdentity.sourceBundleDigest||sourceBundleDigest,sourceBundleDigest);
    return {ok:true,status:200,redirected:false,text:async()=>JSON.stringify(reply)};
   }
   assert.equal(url,G.RELAY_URL);assert.equal(options.redirect,'manual');
   return {ok:true,status:200,redirected:false};
  };
  async function send(signature=crypto.createHmac('sha256',fixtures.LINE_CHANNEL_SECRET).update(body).digest('base64')){
   const request=Readable.from([body]);request.method='POST';request.headers={'x-line-signature':signature};let reply;
   const response={setHeader(){},status(code){this.code=code;return this},json(value){reply={code:this.code,...value};return this}};
   await handler(request,response);return reply;
  }
  const reply=await send();assert.equal(reply.code,200);assert.equal(reply.forwardedEvents,2);
  assert.equal(calls.length,3);assert.equal(calls[0].url,G.GAS_URL);
  for(let i=0;i<2;i++){assert.equal(calls[i+1].url,G.RELAY_URL);assert.deepEqual(calls[i+1].payload.events,[events[i]]);assert.equal(calls[i+1].payload.destination,'fixture-bot');}
  open=false;calls.length=0;assert.equal((await send()).code,503);assert.equal(calls.length,1);assert.equal(calls[0].url,G.GAS_URL);
  calls.length=0;assert.equal((await send('invalid')).code,401);assert.equal(calls.length,0);
  console.log('PASS signed two-photo webhook: verified release, independent requests, original timestamps/IDs/image-set, other-group exclusion, closed gate and HMAC; zero real network');
 }finally{
  global.fetch=fetchBefore;
  for(const k of Object.keys(fixtures)){if(envBefore[k]===undefined)delete process.env[k];else process.env[k]=envBefore[k];}
 }
})().catch(e=>{console.error(e);process.exitCode=1;});

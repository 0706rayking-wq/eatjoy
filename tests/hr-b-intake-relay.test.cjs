const test=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto'),{Readable}=require('node:stream');
const handler=require('../api/line-webhook');
test('signed Taipei photos persist before ACK, never invoke n8n, and reject uncertain storage',async()=>{
 const before={...process.env},oldFetch=global.fetch;
 Object.assign(process.env,{LINE_CHANNEL_SECRET:'fixture',LINE_HR_GROUP_ID:'Cf47f4ae2865992470b5dc0a7c3ff3170',ATTENDANCE_ARCHIVE_URL:'https://script.google.com/macros/s/AKfycbxs5WXdS1jXmXnCna3wxxMPHCD9lOsnpCLwWWALxzwiLRv2UNpthDL-5efknoZD5eQA/exec',ATTENDANCE_ARCHIVE_SECRET:'fixture-archive'});
 const event={type:'message',source:{type:'group',groupId:process.env.LINE_HR_GROUP_ID},message:{type:'image',id:'123'},timestamp:Date.now(),webhookEventId:'fixture-event'};
 let calls=0,fail=false;
 global.fetch=async(url,options)=>{calls++;assert.equal(url,process.env.ATTENDANCE_ARCHIVE_URL);const p=JSON.parse(options.body);assert.deepEqual(p.event,event);assert.equal(p.action,'hr_b_intake_hold_v1');const sourceKey='hr-local-v1:'+crypto.createHash('sha256').update(JSON.stringify({groupId:event.source.groupId,messageId:event.message.id})).digest('hex');return {status:200,ok:true,redirected:false,text:async()=>JSON.stringify(fail?{status:'error'}:{schema:1,protocol:p.protocol,challenge:p.challenge,status:'captured-held',sourceKey,state:'capture-only-ready',businessEnabled:false})};};
 async function send(events,valid=true){const body=Buffer.from(JSON.stringify({events})),req=Readable.from([body]);req.method='POST';req.headers={'x-line-signature':valid?crypto.createHmac('sha256','fixture').update(body).digest('base64'):'wrong'};let result;await handler(req,{setHeader(){},status(code){this.code=code;return this;},json(value){result={code:this.code,...value};}});return result;}
 try{let r=await send([event]);assert.equal(r.code,200);assert.equal(r.capturedImages,1);assert.equal(r.forwardedEvents,0);assert.equal(calls,1);fail=true;r=await send([event]);assert.equal(r.code,500);assert.equal(calls,2);await send([event],false);assert.equal(calls,2);await send([{...event,source:{type:'group',groupId:'other'}}]);assert.equal(calls,2);}finally{global.fetch=oldFetch;for(const k of Object.keys(process.env))if(!(k in before))delete process.env[k];Object.assign(process.env,before);}
});


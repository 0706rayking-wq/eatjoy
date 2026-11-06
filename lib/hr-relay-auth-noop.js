'use strict';
const crypto=require('node:crypto');
const {readCloudIdentity}=require('./hr-relay-release-gate');
const ACTION='verify_hr_relay_noop_v1';
const PROTOCOL='hr-legacy-relay-noop-v1';
const WORKFLOW='71jv8TYYNxIPFFHN';
const URL='https://rayking0706.app.n8n.cloud/webhook/line-hr-relay-draft';
const COUNTERS=['images','sourceReservations','queue','line','nueip','browser'];
const MAX_BYTES=16384, TIMEOUT_MS=10000;
function exact(v,keys) {
  if(!v||typeof v!=='object'||Array.isArray(v)||JSON.stringify(Object.keys(v).sort())!==JSON.stringify(keys.slice().sort()))throw Error('NOOP_SHAPE');
}
function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}
function digest(v){return crypto.createHash('sha256').update(canonical(v)).digest('hex');}
function validateReply(reply,challenge) {
  exact(reply,['schema','protocol','workflowId','challenge','counters']);
  exact(reply.counters,COUNTERS);
  if(reply.schema!==1||reply.protocol!==PROTOCOL||reply.workflowId!==WORKFLOW||reply.challenge!==challenge||
    COUNTERS.some(k=>reply.counters[k]!==0))throw Error('NOOP_ACK_REJECTED');
  return reply;
}
async function readReply(response) {
  if(!response||response.status!==200||response.ok!==true||response.redirected||
      !/^application\/json(?:;|$)/i.test(response.headers?.get?.('content-type')||''))throw Error('NOOP_HTTP_REJECTED');
  const reader=response.body?.getReader();if(!reader)throw Error('NOOP_BODY_REJECTED');
  let bytes=0;const chunks=[];
  try{while(true){const part=await reader.read();if(part.done)break;
    bytes+=part.value.byteLength;if(bytes>MAX_BYTES)throw Error('NOOP_BODY_TOO_LARGE');
    chunks.push(Buffer.from(part.value));
  }}finally{await reader.cancel();}
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({status:'error'});
  const expected=String(process.env.HR_AUTOMATION_SECRET||process.env.N8N_RELAY_SECRET||'').trim();
  const actual=String(req.headers.authorization||'').replace(/^Bearer\s+/i,'');
  const a=Buffer.from(actual),b=Buffer.from(expected);
  if(!expected||a.length!==b.length||!crypto.timingSafeEqual(a,b))return res.status(401).json({status:'error'});
  try{exact(req.body,['action']);if(req.body.action!==ACTION)throw Error('NOOP_ACTION');}
  catch(_){return res.status(409).json({status:'error',code:'hr_noop_exact_request_required'});}
  let identity;
  try{identity=readCloudIdentity(process.env);
    if(process.env.N8N_RELAY_URL!==URL||!process.env.N8N_RELAY_SECRET)throw Error('NOOP_CONFIG');}
  catch(_){return res.status(503).json({status:'error',code:'hr_noop_not_configured'});}
  const startedAt=Date.now(),challenge=crypto.randomBytes(32).toString('hex');
  const request={schema:1,protocol:PROTOCOL,workflowId:WORKFLOW,challenge,events:[]};
  try{
    const response=await fetch(URL,{
      method:'POST',redirect:'manual',credentials:'omit',referrerPolicy:'no-referrer',
      signal:AbortSignal.timeout(TIMEOUT_MS),
      headers:{Authorization:'Bearer '+process.env.N8N_RELAY_SECRET,'Content-Type':'application/json','X-EatJoy-Relay-Version':'2'},
      body:JSON.stringify(request)
    });
    const reply=validateReply(await readReply(response),challenge),now=Date.now();
    if(now<startedAt||now-startedAt>TIMEOUT_MS)throw Error('NOOP_EXPIRED');
    // Evidence only. This endpoint cannot release ingress, write GAS properties,
    // change source/effect ledgers, or accept caller-supplied URLs/events.
    return res.status(200).json({
      schema:1,protocol:'hr-legacy-relay-auth-proof-v1',status:'verified',
      workflowId:WORKFLOW,challenge,checkedAt:new Date(now).toISOString(),
      cloudIdentity:identity,relayUrl:URL,
      requestDigest:digest(request),responseDigest:digest(reply),counters:reply.counters
    });
  }catch(_){
    // Unknown outcomes require owner-journal reconciliation, never blind retry.
    return res.status(502).json({status:'error',code:'hr_noop_unconfirmed_no_retry'});
  }
}
module.exports=handler;
module.exports._test={ACTION,PROTOCOL,WORKFLOW,URL,COUNTERS,validateReply,digest};

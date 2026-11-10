'use strict';
const crypto=require('node:crypto');
const {postHrGas}=require('./hr-gas-transport');
const GROUP='Cf47f4ae2865992470b5dc0a7c3ff3170';
const GAS='https://script.google.com/macros/s/AKfycbxs5WXdS1jXmXnCna3wxxMPHCD9lOsnpCLwWWALxzwiLRv2UNpthDL-5efknoZD5eQA/exec';
const PROTOCOL='hr-b-intake-hold-v1';
function isCaptureImage(event){return event?.type==='message'&&event.source?.type==='group'&&event.source.groupId===GROUP&&event.message?.type==='image';}
async function captureImage(event,environment=process.env,fetchImpl=globalThis.fetch){
 if(!isCaptureImage(event)||environment.LINE_HR_GROUP_ID!==GROUP||environment.ATTENDANCE_ARCHIVE_URL!==GAS||!environment.ATTENDANCE_ARCHIVE_SECRET)throw Error('INTAKE_CONFIGURATION');
 const challenge=crypto.randomBytes(32).toString('hex');
 const reply=await postHrGas(GAS,{action:'hr_b_intake_hold_v1',protocol:PROTOCOL,challenge,secret:environment.ATTENDANCE_ARCHIVE_SECRET,event},fetchImpl);
 const sourceKey='hr-local-v1:'+crypto.createHash('sha256').update(JSON.stringify({groupId:event.source.groupId,messageId:event.message.id})).digest('hex');
 if(reply?.schema!==1||reply.protocol!==PROTOCOL||reply.challenge!==challenge||reply.status!=='captured-held'||reply.sourceKey!==sourceKey||reply.businessEnabled!==false||typeof reply.state!=='string')throw Error('INTAKE_RECEIPT_UNCONFIRMED');
 return reply;
}
module.exports={isCaptureImage,captureImage};


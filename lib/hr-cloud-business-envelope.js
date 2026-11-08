'use strict';
const crypto = require('node:crypto');
const ACTION = 'legacy_hr_business_v1';
const BUSINESS_ACTIONS = ['archive_photo','archive_result','aggregate_line'];
function plain(value) { return value && typeof value === 'object' && !Array.isArray(value); }
function exact(value, keys) {
  if (!plain(value) || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(keys.slice().sort())) {
    throw new Error('HR_BUSINESS_ENVELOPE_REQUIRED');
  }
}
function hash(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) && value !== '0'.repeat(64); }
function validateEnvelope(input) {
  exact(input, ['action','sourceAuthorization','businessPayload']);
  if (input.action !== ACTION) throw new Error('HR_BUSINESS_ENVELOPE_REQUIRED');
  const auth = input.sourceAuthorization, payload = input.businessPayload;
  exact(auth, ['schema','source','sourceAdmissionReceiptHash','sourceParentExecutionId','pinsDigest','cutoverSnapshotDigest','compare']);
  exact(auth.source, ['groupId','messageId','timestamp']);
  if (auth.schema !== 1 || !/^C[0-9a-f]{32}$/i.test(auth.source.groupId || '')
    || !/^\d{1,40}$/.test(auth.source.messageId || '') || typeof auth.source.messageId !== 'string'
    || !Number.isSafeInteger(auth.source.timestamp) || auth.source.timestamp <= 0
    || !Number.isFinite(new Date(auth.source.timestamp).valueOf())
    || typeof auth.sourceParentExecutionId !== 'string' || !/^\d+$/.test(auth.sourceParentExecutionId)
    || !hash(auth.sourceAdmissionReceiptHash) || !hash(auth.pinsDigest) || !hash(auth.cutoverSnapshotDigest)) {
    throw new Error('HR_SOURCE_AUTHORIZATION_INVALID');
  }
  if (!plain(payload) || !BUSINESS_ACTIONS.includes(payload.action)
    || typeof payload.messageId !== 'string' || payload.messageId !== auth.source.messageId) {
    throw new Error('HR_BUSINESS_SOURCE_CONFLICT');
  }
  // Only fields the old adapter recognized may appear. The original values
  // remain unchanged; trusted projection/date checks are performed by GAS.
  const allowed = ['action','messageId','schedule','result','groupId','date','sheetType','lineMessages','archiveText'];
  if (Object.keys(payload).some(key => !allowed.includes(key))) throw new Error('HR_BUSINESS_FIELDS_REJECTED');
  if (payload.groupId !== undefined && payload.groupId !== auth.source.groupId) throw new Error('HR_BUSINESS_SOURCE_CONFLICT');
  if (payload.action === 'archive_photo') {
    if (auth.compare !== null || !plain(payload.schedule) || payload.schedule.is_attendance_sheet !== true) {
      throw new Error('HR_ARCHIVE_INPUT_INVALID');
    }
  } else {
    exact(auth.compare, ['jobId','payloadHash','resultHash']);
    if (typeof auth.compare.jobId !== 'string' || !/^hr-legacy-v1:[a-f0-9]{64}$/.test(auth.compare.jobId)
      || !hash(auth.compare.payloadHash) || !hash(auth.compare.resultHash)) {
      throw new Error('HR_COMPARE_AUTHORIZATION_INVALID');
    }
    if (payload.action === 'archive_result' && !plain(payload.result)) throw new Error('HR_COMPARISON_RESULT_REQUIRED');
    if (payload.action === 'aggregate_line' && (payload.groupId !== auth.source.groupId
      || typeof payload.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date)
      || !Array.isArray(payload.lineMessages) || payload.lineMessages.some(value => typeof value !== 'string'))) {
      throw new Error('HR_AGGREGATE_INPUT_INVALID');
    }
  }
  return input;
}
function canonical(value) {
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  if (value && typeof value === 'object') return '{' + Object.keys(value).sort().map(key => JSON.stringify(key)+':'+canonical(value[key])).join(',') + '}';
  if (value === undefined || (typeof value === 'number' && !Number.isFinite(value))) throw new Error('HR_NON_JSON_VALUE');
  return JSON.stringify(value);
}
function digest(value) { return crypto.createHash('sha256').update(canonical(value)).digest('hex'); }
function requestPayloadHash(input) {
  return digest({action:ACTION,sourceAuthorization:input.sourceAuthorization,businessPayload:input.businessPayload});
}
function sourceKey(input) {
  const source=input.sourceAuthorization.source;
  return 'hr-local-v1:' + digest({groupId:source.groupId,messageId:source.messageId});
}
function validateReply(reply,input) {
  validateEnvelope(input);
  exact(reply,['schema','protocol','status','action','sourceKey','sourceAdmissionReceiptHash','pinsDigest','cutoverSnapshotDigest','requestPayloadHash','effectReceiptHash','businessResult']);
  const auth=input.sourceAuthorization,action=input.businessPayload.action;
  if (reply.schema!==1 || reply.protocol!=='hr-legacy-archive-gate-v1' || !['completed','held'].includes(reply.status)
    || reply.action!==action || reply.sourceKey!==sourceKey(input)
    || reply.sourceAdmissionReceiptHash!==auth.sourceAdmissionReceiptHash
    || reply.pinsDigest!==auth.pinsDigest || reply.cutoverSnapshotDigest!==auth.cutoverSnapshotDigest
    || reply.requestPayloadHash!==requestPayloadHash(input) || !hash(reply.effectReceiptHash)) {
    throw new Error('HR_GAS_GATE_RESPONSE_CONFLICT');
  }
  if (reply.status==='held') {
    if(reply.businessResult!==null) throw new Error('HR_GAS_HELD_RESULT_FORBIDDEN');
    return {status:'held'};
  }
  const allowed={archive_photo:['saved','expired'],archive_result:['recorded'],aggregate_line:['accepted','held']};
  if(!plain(reply.businessResult) || !allowed[action].includes(reply.businessResult.status)) {
    throw new Error('HR_GAS_BUSINESS_RESULT_INVALID');
  }
  if(action==='aggregate_line' && reply.businessResult.status==='accepted') {
    const receipt=reply.businessResult;
    exact(receipt,['status','count','requestId','deliveryVerified']);
    if(receipt.count!==1 || typeof receipt.requestId!=='string'
      || !/^[A-Za-z0-9-]{1,128}$/.test(receipt.requestId) || receipt.deliveryVerified!==false) {
      throw new Error('HR_LINE_ACCEPTANCE_RECEIPT_INVALID');
    }
  }
  return reply.businessResult;
}
module.exports = {ACTION,BUSINESS_ACTIONS,validateEnvelope,validateReply,requestPayloadHash,sourceKey};

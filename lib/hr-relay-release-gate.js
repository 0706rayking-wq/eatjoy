'use strict';
const crypto = require('node:crypto');
const {postHrGas} = require('./hr-gas-transport');
const {sourceBundleDigest} = require('./hr-relay-source-binding');
const ACTION = 'legacy_hr_release_probe_v1';
const PROTOCOL = 'hr-legacy-relay-release-v1';
const WORKFLOW = '71jv8TYYNxIPFFHN';
const RELAY_URL = 'https://rayking0706.app.n8n.cloud/webhook/line-hr-relay-draft';
const BRANCH_URL = 'eatjoy-git-agent-line-hr-webhook-relay-0706rayking-wqs-projects.vercel.app';
const CHILD_WORKFLOW = 'bDGTILrLjJihwF1k';
const GAS_URL = 'https://script.google.com/macros/s/AKfycbxs5WXdS1jXmXnCna3wxxMPHCD9lOsnpCLwWWALxzwiLRv2UNpthDL-5efknoZD5eQA/exec';
const MAX_PROBE_MS = 10000;
const TTL_MS = 15000;
const CLOCK_SKEW_MS = 5000;
function exact(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value) ||
      JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(keys.slice().sort())) throw Error('RELEASE_SHAPE');
}
function hash(value) { return typeof value === 'string' && /^[a-f0-9]{64}$/.test(value) && value !== '0'.repeat(64); }
function domain(value) { return typeof value === 'string' && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.vercel\.app$/.test(value); }
function cloudIdentity(environment) {
  // Only documented non-secret platform variables, never Host or forwarded headers.
  if (environment.VERCEL !== '1' || !['preview','production'].includes(environment.VERCEL_ENV) ||
      environment.VERCEL_GIT_PROVIDER !== 'github' ||
      environment.VERCEL_GIT_REPO_OWNER !== '0706rayking-wq' || environment.VERCEL_GIT_REPO_SLUG !== 'eatjoy' ||
      environment.VERCEL_GIT_COMMIT_REF !== 'agent/line-hr-webhook-relay' ||
      !/^prj_[A-Za-z0-9]+$/.test(environment.VERCEL_PROJECT_ID || '') ||
      !/^dpl_[A-Za-z0-9]+$/.test(environment.VERCEL_DEPLOYMENT_ID || '') ||
      !/^[a-f0-9]{40}$/.test(environment.VERCEL_GIT_COMMIT_SHA || '') ||
      !domain(environment.VERCEL_URL) || environment.VERCEL_BRANCH_URL !== BRANCH_URL ||
      environment.VERCEL_URL === BRANCH_URL || !hash(sourceBundleDigest)) throw Error('RELEASE_RUNTIME_IDENTITY');
  return {
    projectId:environment.VERCEL_PROJECT_ID, deploymentId:environment.VERCEL_DEPLOYMENT_ID,
    deploymentUrl:environment.VERCEL_URL, branchUrl:environment.VERCEL_BRANCH_URL,
    commitSha:environment.VERCEL_GIT_COMMIT_SHA, sourceBundleDigest
  };
}
function iso(value) {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
}
function validateReply(reply, challenge, identity, startedAt, now) {
  exact(reply,['schema','protocol','status','challenge','checkedAt','expiresAt','releaseEvidence']);
  if (reply.schema !== 1 || reply.protocol !== PROTOCOL || !['ready','closed'].includes(reply.status) ||
      !hash(challenge) || reply.challenge !== challenge || !iso(reply.checkedAt) || !iso(reply.expiresAt) ||
      !Number.isSafeInteger(startedAt) || !Number.isSafeInteger(now) || now < startedAt ||
      now-startedAt > MAX_PROBE_MS) throw Error('RELEASE_REPLY');
  const checkedAt=Date.parse(reply.checkedAt), expiresAt=Date.parse(reply.expiresAt);
  if (expiresAt-checkedAt !== TTL_MS || checkedAt < startedAt-CLOCK_SKEW_MS ||
      checkedAt > now+CLOCK_SKEW_MS || expiresAt <= now) throw Error('RELEASE_EXPIRED');
  if (reply.status === 'closed') {
    if (reply.releaseEvidence !== null) throw Error('RELEASE_CLOSED_EVIDENCE');
    throw Error('RELEASE_CLOSED');
  }
  const evidence=reply.releaseEvidence;
  exact(evidence,['releaseDigest','pinsDigest','cutoverSnapshotDigest','parentWorkflowId',
    'parentDefinitionDigest','scheduleChildWorkflowId','scheduleChildDefinitionDigest',
    'cloudIdentity','relayUrl','ingressEvidenceDigest']);
  for (const field of ['releaseDigest','pinsDigest','cutoverSnapshotDigest',
    'parentDefinitionDigest','scheduleChildDefinitionDigest','ingressEvidenceDigest']) {
    if (!hash(evidence[field])) throw Error('RELEASE_EVIDENCE_HASH');
  }
  if (evidence.parentWorkflowId !== WORKFLOW || evidence.scheduleChildWorkflowId !== CHILD_WORKFLOW ||
      evidence.relayUrl !== RELAY_URL) throw Error('RELEASE_WORKFLOW');
  const keys=['projectId','deploymentId','deploymentUrl','branchUrl','commitSha','sourceBundleDigest'];
  exact(evidence.cloudIdentity,keys);
  exact(identity,keys);
  if (keys.some(key=>evidence.cloudIdentity[key] !== identity[key])) throw Error('RELEASE_CLOUD_IDENTITY');
  return evidence;
}
async function assertHrRelayRelease(environment = process.env, fetchImpl = globalThis.fetch) {
  try {
    const identity = cloudIdentity(environment);
    const url = environment.ATTENDANCE_ARCHIVE_URL;
    const secret = environment.ATTENDANCE_ARCHIVE_SECRET;
    if (environment.N8N_RELAY_URL !== RELAY_URL || !environment.N8N_RELAY_SECRET ||
        typeof secret !== 'string' || !secret ||
        url !== GAS_URL) throw Error('RELEASE_CONFIGURATION');
    const challenge = crypto.randomBytes(32).toString('hex');
    const startedAt = Date.now();
    const signal = AbortSignal.timeout(MAX_PROBE_MS);
    const reply = await postHrGas(url,{action:ACTION,secret,challenge},
      (target, options) => fetchImpl(target,{...options,signal}));
    validateReply(reply, challenge, identity, startedAt, Date.now());
    const expiresAt=Date.parse(reply.expiresAt);
    return Object.freeze({assertCurrent() {
      const now=Date.now();
      if (now < startedAt || now >= expiresAt-CLOCK_SKEW_MS) throw closedError();
    }});
  } catch (_) {
    // No credential, probe response or release evidence reaches LINE/logging.
    // No retry, active-result cache or side-effect fallback exists.
    throw closedError();
  }
}
function closedError() {
  const error = new Error('HR shared ingress is paused until release is verified');
  error.statusCode=503;error.code='HR_RELAY_RELEASE_CLOSED';return error;
}
module.exports = {assertHrRelayRelease,readCloudIdentity:cloudIdentity};
module.exports._test = {ACTION,PROTOCOL,WORKFLOW,CHILD_WORKFLOW,GAS_URL,RELAY_URL,BRANCH_URL,TTL_MS,MAX_PROBE_MS,cloudIdentity,validateReply};

// Validates the bounded live Claude Code -> Codex -> Claude Code handoff evidence. Pure read; no board or model calls.
import {readFileSync,readdirSync,statSync,existsSync} from 'node:fs';
import assert from 'node:assert/strict';
const repository='serhii-baksheiev/agent-stack-lab';
function assertNoCredentialFields(v,p){if(!v||typeof v!=='object')return;for(const [k,x]of Object.entries(v)){assert(!/^(temp_clone_token|access_token|refresh_token|client_secret|authorization)$/i.test(k)||!x,`Credential field in live evidence ${p}:${k}`);assertNoCredentialFields(x,p+':'+k);}}
export function validateLiveEvidence(dir){
 const stats={commands:0,apiCalls:0,passed:0,failed:0,status:'missing'};
 if(!existsSync(dir+'/result.json'))return stats;
 const result=JSON.parse(readFileSync(dir+'/result.json','utf8'));stats.status=result.status;
 function inspect(v,p){if(!v||typeof v!=='object')return;
  if(Array.isArray(v.command)&&Object.hasOwn(v,'exitCode')){stats.commands++;assert(Number.isInteger(v.exitCode)&&!v.error,'Incomplete live command '+p);}
  if(v.method&&v.endpoint&&v.responseHeaders){stats.apiCalls++;assert(Number.isInteger(v.status));assert(v.endpoint.split('?')[0]===`repos/${repository}`||v.endpoint.startsWith(`repos/${repository}/`),'Non-laboratory endpoint '+p);}
  for(const [k,x]of Object.entries(v))inspect(x,p+':'+k);}
 function walk(p){for(const n of readdirSync(p)){const f=p+'/'+n;if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.json')){const data=JSON.parse(readFileSync(f,'utf8'));assertNoCredentialFields(data,f);inspect(data,f);}}}
 walk(dir);
 assert.equal(result.repository,repository);
 for(const c of result.checks){assert(typeof c.name==='string'&&typeof c.passed==='boolean');if(c.passed)stats.passed++;else stats.failed++;}
 if(result.status==='unverified')return stats;
 assert(result.closed&&result.closed.allClosed===true&&result.closed.verified.length>=2&&result.closed.verified.every(x=>x.closed===true),'Live issue/PR not verified closed');
 assert(result.ci&&result.ci.conclusion==='success'&&result.ci.hosted===true,'Hosted CI conclusion on live PR is not success');
 assert(result.issue?.number&&result.pr?.number&&result.models?.claude&&result.models?.codex);
 return stats;
}

import {readFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='spikes/d-team-orchestration',read=p=>JSON.parse(readFileSync(base+'/'+p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let commands=0,snapshots=0,apiCalls=0;
function inspect(v,p){if(!v||typeof v!=='object')return;
 if(Array.isArray(v.command)&&Object.hasOwn(v,'exitCode')){commands++;assert(Number.isInteger(v.exitCode)&&!v.error,'Incomplete command '+p);if(v.exitCode!==0)assert(v.exitCode===1&&p.includes('conflict-before-merge')&&v.stdout.includes('CONFLICT'),'Unclassified nonzero '+p);}
 if(v.method&&v.endpoint&&v.responseHeaders){apiCalls++;assert(Number.isInteger(v.status)&&Number.isInteger(v.exitCode));assert(v.endpoint.split('?')[0]==='repos/serhii-baksheiev/agent-stack-lab'||v.endpoint.startsWith('repos/serhii-baksheiev/agent-stack-lab/'));if(v.status>=400)assert(v.status===400&&v.label.startsWith('issue-claim-')||v.status===422&&/lease-claim-|stale-owner-update/.test(v.label),'Unclassified API error '+p);else assert.equal(v.exitCode,0);}
 if(v.files&&v.gitStatus&&typeof v.gitStatus==='object'){snapshots++;assert.equal(v.gitStatus.exitCode,0);assert.equal(v.gitDiff.exitCode,0);assert.equal(v.count,Object.keys(v.files).length);assert.equal(v.bytes,Object.values(v.files).reduce((n,x)=>n+x.size,0));}
 for(const [k,x]of Object.entries(v))inspect(x,p+':'+k);
}
function walk(p){for(const n of readdirSync(p)){const f=p+'/'+n;if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.json'))inspect(JSON.parse(readFileSync(f,'utf8')),f);}}
for(const dir of ['board','orchestrators'])walk(base+'/evidence/'+dir);
const privacy=read('evidence/diagnostics/privacy-repair.json');assert.equal(read('evidence/board/result.json').scriptSha256,privacy.originalBoardCollectorSha256);assert.equal(privacy.repairedBoardCollectorSha256,hash('scripts/spike-d-board.mjs'));assert.equal(privacy.helperSha256,hash('scripts/safe-repo-metadata.mjs'));assert.equal(privacy.regression.exitCode,0);
assert.equal(read('evidence/orchestrators/result.json').scriptSha256,hash('scripts/spike-d-orchestrators.mjs'));
assert.deepEqual(read('evidence/orchestrators/result.json').symphonyTests,{executed:10,failures:0,excluded:42});
const pg=read('evidence/orchestrators/automation-query-probe.json');assert(pg.postgresqlRuntimeTested&&pg.secondTransactionSkippedLockedRow&&pg.rollbackReleasedClaim&&pg.sqliteTwoSessionsBothSeeSameEligibleRow);
assert(read('evidence/board/cleanup.json').allClosed);assert.equal(read('evidence/board/cleanup.json').verified.length,6);
const ledger=read('scenario-ledger.json'),result=read('result.json'),m=read('measurements.json');assert.equal(new Set(ledger.map(x=>x.scenario)).size,ledger.length);
for(const [key,status]of [['scenariosPassed','passed'],['scenariosFailed','failed'],['scenariosUnverified','unverified']])assert.equal(result[key],ledger.filter(x=>x.status===status).length);
assert.equal(m.commands,commands);assert.equal(m.snapshots,snapshots);assert.equal(m.apiCalls,apiCalls);assert(commands>30&&apiCalls>35&&snapshots===6);
console.log(`PASS D: ${commands} complete commands, ${apiCalls} classified API requests, ${snapshots} snapshots; collector hashes and closed synthetic board artifacts verified.`);

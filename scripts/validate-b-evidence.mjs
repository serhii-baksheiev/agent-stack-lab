import {readFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='spikes/b-spec-workflows',read=p=>JSON.parse(readFileSync(base+'/'+p,'utf8').replace(/^\uFEFF/,'')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let commands=0,snapshots=0;
function inspect(v,p){if(!v||typeof v!=='object')return;
 if(Object.hasOwn(v,'exitCode')){assert(Number.isInteger(v.exitCode),'Incomplete command '+p);assert(!v.error,'Command error '+p);commands++;if(v.exitCode!==0){const output=(v.stdout||'')+(v.stderr||'');assert.equal(v.exitCode,1);assert(/Refusing to overwrite|Unknown option '--help'/.test(output)||p.includes('duplicate-new')&&output.includes('already exists')||p.includes('manual-red-green')&&p.includes('-red.json')&&output.includes('Not implemented'),'Unclassified nonzero '+p);}}
 if(v.files&&v.gitStatus&&typeof v.gitStatus==='object'){assert.equal(v.gitStatus.exitCode,0);assert.equal(v.gitDiff.exitCode,0);assert.equal(v.count,Object.keys(v.files).length);assert.equal(v.bytes,Object.values(v.files).reduce((a,x)=>a+x.size,0));snapshots++;}
 for(const [k,x]of Object.entries(v))inspect(x,p+':'+k);
}
function walk(p){for(const name of readdirSync(p)){const f=p+'/'+name;if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.json'))inspect(JSON.parse(readFileSync(f,'utf8').replace(/^\uFEFF/,'')),f);}}
walk(base+'/evidence');
for(const r of read('evidence/acceptance/results.json')){assert.equal(hash(r.entry),r.sourceSha256);assert.equal(r.checks.length,9);assert(r.checks.every(x=>x.passed));}
for(const [candidate,p]of [['spec-kit','result.json'],['bmad','provenance.json'],['openspec','provenance.json'],['superpowers','provenance.json']])assert.equal(hash('scripts/spike-b-'+candidate+'.mjs'),read('evidence/'+candidate+'/'+p).scriptSha256,'Collector differs from canonical run '+candidate);
assert.equal(read('evidence/superpowers/results.json').length,4);assert.equal(read('evidence/bmad/lifecycle-results.json').length,2);assert.equal(read('evidence/openspec/lifecycle-results.json').length,2);
const board=read('evidence/board-export/result.json');assert.equal(board.repeatCreated,1);assert.equal(board.repeatDedupPassed,false);assert.equal(board.allCreatedIssuesClosed,true);assert.deepEqual(board.closedIssueNumbers,[5,6,7,8]);
assert.equal(read('evidence/openspec/scope-incident.json').exactRollbackVerified,false);
const ledger=read('scenario-ledger.json'),result=read('result.json');assert.equal(new Set(ledger.map(x=>x.scenario)).size,ledger.length);
for(const [key,status]of [['scenariosPassed','passed'],['scenariosFailed','failed'],['scenariosUnverified','unverified']])assert.equal(result[key],ledger.filter(x=>x.status===status).length);
assert(commands>400&&snapshots>170,'Incomplete evidence collection');console.log(`PASS B: ${commands} complete commands, ${snapshots} valid snapshots; pinned collector/code hashes; negative lifecycle and board outcomes preserved.`);

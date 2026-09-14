import {readFileSync,readdirSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='spikes/e-memory',read=p=>JSON.parse(readFileSync(base+'/'+p,'utf8')),hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let commands=0,snapshots=0;
function inspect(v,p){if(!v||typeof v!=='object')return;
 if(Array.isArray(v.command)&&Object.hasOwn(v,'exitCode')){assert(Number.isInteger(v.exitCode),'Incomplete command '+p);assert(!v.error,'Command process error '+p);commands++;if(v.exitCode!==0){assert.equal(v.exitCode,1,'Unexpected exit '+p);const output=(v.stdout||'')+(v.stderr||'');assert(/Refusing to overwrite|already exists|No MCP server|not found|does not exist|Unknown option '--help'/i.test(output),'Unclassified nonzero '+p);}}
 if(v.files&&v.gitStatus&&typeof v.gitStatus==='object'){assert.equal(v.gitStatus.exitCode,0);assert.equal(v.gitDiff.exitCode,0);assert.equal(v.count,Object.keys(v.files).length);assert.equal(v.bytes,Object.values(v.files).reduce((a,x)=>a+x.size,0));snapshots++;}
 for(const [k,x]of Object.entries(v))inspect(x,p+':'+k);
}
function walk(p){for(const name of readdirSync(p)){if(name==='windows-local')continue;const f=p+'/'+name;if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.json'))inspect(JSON.parse(readFileSync(f,'utf8')),f);}}
for(const dir of ['basic-setup','basic','basic-concurrency','basic-upgrade','reference','native-wiring'])walk(base+'/evidence/'+dir);
for(const [script,p]of [['prepare-basic','basic-setup/provenance.json'],['basic','basic/result.json'],['basic-concurrency','basic-concurrency/result.json'],['basic-upgrade','basic-upgrade/result.json'],['reference-memory','reference/provenance.json'],['native-wiring','native-wiring/provenance.json']])assert.equal(hash('scripts/spike-e-'+script+'.mjs'),read('evidence/'+p).scriptSha256,'Collector differs '+script);
const stress=read('evidence/basic-concurrency/result.json');assert.equal(stress.rounds.length,8);assert.equal(stress.probeSha256,hash('scripts/lab-mcp-probe.mjs'));
assert.equal(stress.totalLostAcknowledgedMarkers,stress.rounds.reduce((n,r)=>n+r.lostAcknowledgedMarkers.length,0));
assert.equal(read('evidence/native-wiring/result.json').length,4);
assert(read('evidence/basic-setup/provenance.json').sha256Verified);
assert(read('evidence/basic-upgrade/provenance.json').packages.every(x=>x.sha256Verified));
const ledger=read('scenario-ledger.json'),result=read('result.json');assert.equal(new Set(ledger.map(x=>x.scenario)).size,ledger.length);assert(ledger.every(x=>['passed','failed','unverified'].includes(x.status)));
for(const [key,status]of [['scenariosPassed','passed'],['scenariosFailed','failed'],['scenariosUnverified','unverified']])assert.equal(result[key],ledger.filter(x=>x.status===status).length);
const measurements=read('measurements.json');assert.equal(measurements.commands,commands);assert.equal(measurements.snapshots,snapshots);assert(commands>150&&snapshots>30);
console.log(`PASS E: ${commands} complete canonical commands, ${snapshots} snapshots, collector hashes and scenario ledger; negative memory outcomes preserved.`);

// Independent review guard: a completed collector is distinct from a passing candidate property.
import {readdirSync,readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
const base='spikes/f-native-projection';
const read=p=>JSON.parse(readFileSync(base+'/'+p,'utf8').replace(/^\uFEFF/,''));
let commands=0,snapshots=0;
function inspect(v,p) {
 if(!v||typeof v!=='object')return;
 if(Object.hasOwn(v,'exitCode')) {
  assert(Number.isInteger(v.exitCode),`Incomplete command ${p}`);
  assert(!v.error,`Collector error ${p}: ${JSON.stringify(v.error)}`);
  commands++;
  if(v.exitCode!==0) {
   const diagnostic=p.includes('/windows-diagnostics/')&&/EPERM/.test(v.stderr||'');
   const characterized=/Refusing to overwrite|Unknown option '--help'|not configured as a Git marketplace/.test(v.stderr||'');
   assert(v.exitCode===1&&(diagnostic||characterized),`Uncharacterized nonzero command ${p}`);
  }
 }
 if(v.files&&v.gitStatus&&typeof v.gitStatus==='object') {
  assert.equal(v.gitStatus.exitCode,0,`Snapshot git status ${p}`);
  assert.equal(v.gitDiff?.exitCode,0,`Snapshot git diff ${p}`);snapshots++;
 }
 if(v.files&&v.gitStatusCommand) {
  assert.equal(v.gitStatusCommand.exitCode,0,`Import snapshot git status ${p}`);snapshots++;
 }
 for(const [k,value]of Object.entries(v))inspect(value,p+':'+k);
}
function walk(p) {for(const name of readdirSync(p)){const f=p+'/'+name;if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.json'))inspect(JSON.parse(readFileSync(f,'utf8').replace(/^\uFEFF/,'')),f);}}
walk(base+'/evidence');
assert(commands>200&&snapshots>100,'Incomplete evidence tree');
const rows=read('evidence/native/results.json');assert.equal(rows.length,4);
for(const provider of ['claude','codex'])for(const order of ['rig-first','native-first']) {
 const matches=rows.filter(r=>r.provider===provider&&r.order===order);assert.equal(matches.length,1);
 const r=matches[0],label=provider+'-'+order;
 for(const key of ['secondExit','nativeRepeat','dryExit','upgradeExit','pluginUpdate','uninstall','survivingRig'])assert.equal(r[key],0,label+':'+key);
 for(const [stage,version]of [['inventory','1.0.0'],['afterUpdate','1.0.1']]) {
  const v=r[stage];assert.equal(v.installed,true);assert.equal(v.probeExit,0);assert.equal(v.probe.version,version);assert.equal(v.probe.squared,49);
 }
 assert.equal(r.functionalUpgrade,true);assert.equal(r.finalInventory.installed,false);
 if(provider==='codex') {
  const loader=read('evidence/native/'+label+'/loader.json');assert.equal(loader.status,'completed');assert.deepEqual(loader.errors,[]);
  assert(loader.skills.data.some(d=>d.skills.some(s=>s.pluginId==='lab-neutral@personal'&&s.enabled)),'Native plugin skill not loaded');
  assert(loader.hooks.data.some(d=>d.hooks.some(h=>h.pluginId==='lab-neutral@personal'&&h.trustStatus==='untrusted')),'Expected explicit untrusted hook metadata');
 }
}
for(const order of ['standalone','rig-first','import-first']) {
 const r=read('evidence/import/'+order+'/result.json');assert.equal(r.status,'completed');assert.deepEqual(r.errors,[]);assert.equal(r.authenticationUsed,false);
 assert(r.firstImport.itemTypeResults.some(x=>x.successes.length),'No imported items');
 for(const stage of ['firstImport','repeatImport'])for(const x of r[stage].itemTypeResults)assert.deepEqual(x.failures,[]);
}
const ledger=read('scenario-ledger.json'),result=read('result.json');
assert(new Set(ledger.map(x=>x.scenario)).size===ledger.length,'Duplicate scenarios');
assert(ledger.every(x=>['passed','failed','unverified'].includes(x.status)));
for(const [field,status]of [['scenariosPassed','passed'],['scenariosFailed','failed'],['scenariosUnverified','unverified']])assert.equal(result[field],ledger.filter(x=>x.status===status).length,field);
console.log(`PASS F: ${commands} complete commands, ${snapshots} valid snapshots; four functional native updates/removals; three completed imports; ledger counts agree.`);

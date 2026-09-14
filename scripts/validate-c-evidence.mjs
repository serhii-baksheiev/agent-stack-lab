// Independent review guard: collector completion does not establish live Figma access.
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const base='spikes/c-figma';
const read=p=>JSON.parse(readFileSync(base+'/'+p,'utf8').replace(/^\uFEFF/,''));
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
let commands=0,snapshots=0;
function inspect(v,p){
 if(!v||typeof v!=='object')return;
 if(Object.hasOwn(v,'exitCode')){
  assert(Number.isInteger(v.exitCode),`Incomplete command ${p}`);
  assert(!v.error,`Collector error ${p}: ${v.error}`);commands++;
  if(v.exitCode!==0)assert(v.exitCode===1&&/Refusing to overwrite/.test(v.stderr||''),`Uncharacterized nonzero command ${p}`);
 }
 if(v.files&&v.gitStatus&&typeof v.gitStatus==='object'){
  assert.equal(v.gitStatus.exitCode,0,`Snapshot status ${p}`);
  assert.equal(v.gitDiff?.exitCode,0,`Snapshot diff ${p}`);
  assert.equal(v.count,Object.keys(v.files).length,`Snapshot count ${p}`);snapshots++;
 }
 for(const [key,value]of Object.entries(v))inspect(value,p+':'+key);
}
function walk(p){for(const name of readdirSync(p)){const file=p+'/'+name;if(statSync(file).isDirectory())walk(file);else if(file.endsWith('.json'))inspect(JSON.parse(readFileSync(file,'utf8').replace(/^\uFEFF/,'')),file);}}
walk(base+'/evidence');
const rows=read('evidence/integrations/results.json');assert.equal(rows.length,4);
for(const provider of ['claude','codex'])for(const order of ['rig-first','plugin-first']){
 const matches=rows.filter(r=>r.provider===provider&&r.order===order);assert.equal(matches.length,1);
 const r=matches[0],label=provider+'-'+order;
 for(const key of ['secondExit','repeatNative','dryExit','rigUpgrade','pluginUpgrade','uninstall','survivingRig'])assert.equal(r[key],0,label+':'+key);
 assert.equal(r.repeatRig,1,label+': repeat init refuses installed anchors');
 for(const key of ['dryReadOnly','editsPreserved','deletedStaysRemoved','bundleUpdated','rigPreserved','settingsEditSurvives'])assert.equal(r[key],true,label+':'+key);
 assert.equal(r.initial.installed,true);assert.equal(r.initial.version,'2.2.108');
 assert.equal(r.updated.installed,true);assert.equal(r.updated.version,'2.2.111');
 assert.equal(r.updated.mcpUrl,'https://mcp.figma.com/mcp');assert.equal(r.final.installed,false);
 assert.notEqual(r.initial.manifestSha,r.updated.manifestSha,'Updated manifest bytes must differ');
}
for(const [version,commit]of [['2.2.108','f74a51c9aaec87a2e65c9121753b63fb42203d96'],['2.2.111','d638a5e055e8d95e0394a94350860398cf424b74']]){
 const source=read('evidence/integrations/source-'+version+'.json');assert.equal(source.commit,commit);assert.equal(source.manifest.version,version);assert(Object.keys(source.files).length>0);
}
const connection=read('evidence/integrations/connection.json');assert.equal(connection.credentialsUsed,false);assert.equal(connection.designDataRequested,false);
const visual=read('evidence/offline/result.json');assert.equal(visual.status,'passed');assert.equal(visual.playwrightVersion,'1.63.0');assert.equal(visual.tests.length,13);assert(visual.tests.every(t=>t.passed));assert.deepEqual(visual.networkRequests,[]);
assert.match(visual.provenance,/no Figma retrieval or two-provider session/);
for(const viewport of ['desktop','mobile'])for(const kind of ['implementation','reference']){
 const screenshot=visual.screenshots[viewport][kind];assert.equal(screenshot.sha256,hash(base+'/evidence/offline/'+screenshot.file),'Screenshot hash '+viewport+' '+kind);
}
for(const [file,digest]of Object.entries(visual.fixtureHashes))assert.equal(hash('fixtures/c-figma/'+file),digest,'Fixture differs from tested bytes: '+file);
const ledger=read('scenario-ledger.json'),result=read('result.json');
assert(new Set(ledger.map(x=>x.scenario)).size===ledger.length,'Duplicate scenarios');
assert(ledger.every(x=>['passed','failed','unverified'].includes(x.status)));
for(const [field,status]of [['scenariosPassed','passed'],['scenariosFailed','failed'],['scenariosUnverified','unverified']])assert.equal(result[field],ledger.filter(x=>x.status===status).length,field);
assert(commands>200&&snapshots>80,'Incomplete lifecycle evidence');
console.log(`PASS C: ${commands} complete commands, ${snapshots} valid snapshots; four pinned bundle updates/removals; 13 offline browser checks; fixture/screenshot hashes and ledger agree. Live Figma retrieval remains separate.`);

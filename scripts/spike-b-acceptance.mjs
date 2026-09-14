// Independent feature contract, shared across four separately authored workflow trials.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {root,json,sha} from './lab-evidence.mjs';
const candidates=process.argv.slice(2);if(!candidates.length)candidates.push('spec-kit','bmad','openspec','superpowers');
const results=[];
for(const candidate of candidates){
 assert(['spec-kit','bmad','openspec','superpowers'].includes(candidate));
 const entry=path.join(root,'fixtures/b-workflow',candidate,'src/subscriptions.mjs');
 assert(existsSync(entry),'Missing candidate implementation '+candidate);
 const {subscribe}=await import(pathToFileURL(entry));const checks=[];
 const test=(name,fn)=>{try{fn();checks.push({name,passed:true});}catch(error){checks.push({name,passed:false,error:error.message});}};
 test('normalization and deterministic first record',()=>{assert.deepEqual(subscribe([],'  SYNTHETIC@EXAMPLE.TEST  '),{state:[{id:'sub-1',email:'synthetic@example.test'}],subscription:{id:'sub-1',email:'synthetic@example.test'},created:true});});
 test('duplicate does not create another record',()=>{const state=Object.freeze([Object.freeze({id:'sub-1',email:'synthetic@example.test'})]);const r=subscribe(state,'SYNTHETIC@example.test');assert.equal(r.created,false);assert.deepEqual(r.state,state);assert.equal(r.subscription,state[0]);});
 test('distinct record preserves frozen input',()=>{const state=Object.freeze([Object.freeze({id:'sub-1',email:'a@example.test'})]);const before=JSON.stringify(state);const r=subscribe(state,'b@example.test');assert.equal(JSON.stringify(state),before);assert.deepEqual(r.subscription,{id:'sub-2',email:'b@example.test'});assert.equal(r.created,true);assert.equal(r.state.length,2);assert.notEqual(r.state,state);});
 test('invalid types fail without mutation',()=>{for(const email of [null,undefined,42,{},[],true]){const state=Object.freeze([]);assert.throws(()=>subscribe(state,email),TypeError);assert.deepEqual(state,[]);}});
 test('invalid syntax fails without mutation',()=>{for(const email of ['', '  ', 'missing', 'a@b', '@example.test', 'a@@example.test','a b@example.test','a@example. test'])assert.throws(()=>subscribe(Object.freeze([]),email),TypeError);});
 test('normalized length limit is enforced',()=>{const accepted='a'.repeat(249)+'@b.co';assert.equal(accepted.length,254);assert.equal(subscribe([],' '+accepted+' ').created,true);assert.throws(()=>subscribe([], 'a'+accepted),TypeError);});
 test('independent inputs do not share hidden state',()=>{assert.deepEqual(subscribe([],'a@example.test'),subscribe([],'a@example.test'));assert.equal(subscribe([],'b@example.test').subscription.id,'sub-1');});
 test('several duplicates and distinct records remain deterministic',()=>{let state=[];for(const email of ['A@b.co','a@B.co','c@d.co',' C@D.CO ','e@f.co'])state=subscribe(state,email).state;assert.deepEqual(state,[{id:'sub-1',email:'a@b.co'},{id:'sub-2',email:'c@d.co'},{id:'sub-3',email:'e@f.co'}]);});
 test('new process resumes serialized state without duplicate',()=>{const state=subscribe([],'a@example.test').state;const code='const {subscribe}=await import(process.argv[1]);console.log(JSON.stringify(subscribe(JSON.parse(process.argv[2]),process.argv[3])))';const child=spawnSync(process.execPath,['--input-type=module','-e',code,pathToFileURL(entry).href,JSON.stringify(state),' A@EXAMPLE.TEST '],{encoding:'utf8',timeout:15000,windowsHide:true});assert(!child.error,child.error?.message);assert.equal(child.status,0,child.stderr);const result=JSON.parse(child.stdout);assert.equal(result.created,false);assert.deepEqual(result.state,state);});
 const record={candidate,entry:path.relative(root,entry).replaceAll('\\','/'),sourceSha256:sha(readFileSync(entry)),checks,passed:checks.every(x=>x.passed),coverage:'Behavioral B-R1 through B-R5; B-R6 artifact completeness and absence of hidden I/O/time/randomness also require source/artifact review.',execution:'Direct Node contract checks against manual-load Codex candidate output; no claim of native Claude execution.'};results.push(record);json('spikes/b-spec-workflows/evidence/acceptance/'+candidate+'.json',record);
}
json('spikes/b-spec-workflows/evidence/acceptance/results.json',results);console.log(JSON.stringify(results.map(r=>({candidate:r.candidate,passed:r.passed,checks:r.checks.length}))));assert(results.every(r=>r.passed),'Candidate contract failure; inspect per-candidate results');

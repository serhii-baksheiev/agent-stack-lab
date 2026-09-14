import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {validateLiveEvidence} from './validate-d-live.mjs';
function fixture(overrides={}){
 const dir=mkdtempSync(path.join(tmpdir(),'d-live-'));mkdirSync(dir+'/api',{recursive:true});
 const result={status:'observed',repository:'serhii-baksheiev/agent-stack-lab',checks:[{name:'a',passed:true},{name:'b',passed:false,detail:'x'}],issue:{number:1},pr:{number:2},ci:{conclusion:'success',hosted:true},closed:{allClosed:true,verified:[{kind:'issue',closed:true},{kind:'pr',closed:true}]},models:{claude:'2.1.270',codex:'codex-cli 0.154.0'},...overrides};
 writeFileSync(dir+'/result.json',JSON.stringify(result));
 writeFileSync(dir+'/api/0-privacy.json',JSON.stringify({label:'privacy',method:'GET',endpoint:'repos/serhii-baksheiev/agent-stack-lab?lab_probe=1',responseHeaders:'HTTP/2.0 200 OK',status:200,exitCode:0,data:{id:1,full_name:'serhii-baksheiev/agent-stack-lab',private:true}}));
 writeFileSync(dir+'/claude-implement.json',JSON.stringify({command:['claude','-p','x'],exitCode:0,stdout:'{}',stderr:''}));
 return dir;
}
const good=validateLiveEvidence(fixture());
assert.deepEqual({commands:good.commands,apiCalls:good.apiCalls,passed:good.passed,failed:good.failed},{commands:1,apiCalls:1,passed:1,failed:1});
assert.throws(()=>validateLiveEvidence(fixture({closed:{allClosed:false,verified:[]}})),/closed/);
assert.throws(()=>validateLiveEvidence(fixture({ci:{conclusion:'failure',hosted:true}})),/ci/i);
assert.throws(()=>validateLiveEvidence(fixture({checks:[{name:'a',passed:true,detail:{temp_clone_token:'SYNTHETIC'}}]})),/credential/i);
const unverified=validateLiveEvidence(fixture({status:'unverified',checks:[],ci:null,closed:null,issue:null,pr:null}));
assert.equal(unverified.status,'unverified');
console.log('PASS D live-handoff validator: counts, closure, hosted CI conclusion and credential-field rejection.');

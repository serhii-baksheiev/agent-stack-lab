import {readdirSync,readFileSync,statSync} from 'node:fs';
import assert from 'node:assert/strict';
const dir='spikes/a-spec-kit-manifest/evidence';let commands=0,snapshots=0;
function command(c,p) {assert(Number.isInteger(c.exitCode),`Incomplete command ${p}`);assert(!c.error,`Collector error ${p}: ${c.error}`);commands++;}
function walk(p) {for(const name of readdirSync(p)){const f=p+'/'+name;if(statSync(f).isDirectory())walk(f);else if(f.endsWith('.json')) {const v=JSON.parse(readFileSync(f,'utf8').replace(/^\uFEFF/,''));if(Array.isArray(v.command))command(v,f);if(v.files&&v.gitStatus){command(v.gitStatus,f+':gitStatus');command(v.gitDiff,f+':gitDiff');assert.equal(v.gitStatus.exitCode,0,`git status failed: ${f}`);assert.equal(v.gitDiff.exitCode,0,`git diff failed: ${f}`);snapshots++;}}}}
walk(dir);assert(commands>100);assert(snapshots>30);console.log(`PASS: ${commands} complete commands, ${snapshots} snapshots with successful git status/diff. Nonzero upstream exits remain explicit scenario findings.`);
const ledger=JSON.parse(readFileSync('spikes/a-spec-kit-manifest/scenario-ledger.json')),result=JSON.parse(readFileSync('spikes/a-spec-kit-manifest/result.json'));
for(const [field,status] of [['scenariosPassed','passed'],['scenariosFailed','failed'],['scenariosUnverified','unverified']])assert.equal(result[field],ledger.filter(x=>x.status===status).length,`Result/ledger mismatch: ${field}`);

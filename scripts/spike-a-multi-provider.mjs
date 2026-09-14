import {mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,run,json,snapshot} from './lab-evidence.mjs';
const out=path.join(root,'spikes/a-spec-kit-manifest/evidence/multi-provider');
const spec=path.join(root,'.lab-runs/spec-kit-env/bin/specify');
const cwd=path.join(root,'.lab-runs/a-multi-provider');assert(!existsSync(cwd));mkdirSync(cwd,{recursive:true});
assert.equal(run('git',['init'],cwd).exitCode,0);assert.equal(run('git',['-c','user.name=Lab Fixture','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd).exitCode,0);
for(const [name,args] of [['init',['init','--here','--force','--non-interactive','--ignore-agent-tools','--integration','claude','--script','py']],['codex-install',['integration','install','codex']],['claude-upgrade',['integration','upgrade','claude']],['claude-uninstall',['integration','uninstall','claude']]]) {
 assert.equal(run(spec,args,cwd,out+'/'+name+'.json').exitCode,0);snapshot(cwd,out+'/'+name+'-snapshot.json');
}
const status=run(spec,['integration','status','--json'],cwd,out+'/status.json'),state=JSON.parse(status.stdout);
json(out+'/result.json',{path:'integration upgrade instead of repeat init',statusExit:status.exitCode,installedIntegrations:state.installed_integrations,codexRemainsRegistered:state.installed_integrations.includes('codex')});
assert.equal(status.exitCode,0);assert(state.installed_integrations.includes('codex'));

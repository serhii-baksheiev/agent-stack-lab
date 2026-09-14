import {mkdirSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,run,json,snapshot} from './lab-evidence.mjs';
const out=path.join(root,'spikes/a-spec-kit-manifest/evidence/offline');
// Run inside an OS network namespace with no external interfaces, not merely a warm cache.
const net=run('ip',['route'],root,out+'/network-routes.json');assert.equal(net.exitCode,0);assert.equal(net.stdout.trim(),'','requires isolated network namespace');
const specify=path.join(root,'.lab-runs/spec-kit-env/bin/specify');
const installs=[];
for(const slot of ['one','two']) {
 const cwd=path.join(root,'.lab-runs/a-offline-'+slot+'/synthetic');assert(!existsSync(cwd));mkdirSync(cwd,{recursive:true});
 run('git',['init'],cwd);
 assert.equal(run('git',['-c','user.name=Lab Fixture','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd).exitCode,0);
 const rig=run('npx',['--offline','--yes','create-agent-rig@0.9.0','init'],cwd,out+'/'+slot+'-rig.json');assert.equal(rig.exitCode,0);
 const spec=run(specify,['init','--here','--force','--non-interactive','--ignore-agent-tools','--integration','claude','--script','py'],cwd,out+'/'+slot+'-spec.json');assert.equal(spec.exitCode,0);
 installs.push(snapshot(cwd,out+'/'+slot+'-snapshot.json'));
}
const changed=[...new Set([...Object.keys(installs[0].files),...Object.keys(installs[1].files)])].filter(p=>installs[0].files[p]?.sha256!==installs[1].files[p]?.sha256);
json(out+'/result.json',{networkIsolation:'Linux unshare -n; empty route table',rigSource:'npm cache populated by verified 0.9.0 baseline',specSource:'installed 1.0.6 bundled templates',fileCounts:installs.map(x=>x.count),differentFiles:changed,byteIdentical:changed.length===0});
console.log(JSON.stringify({differentFiles:changed}));

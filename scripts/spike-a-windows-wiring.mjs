import {mkdirSync,readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,run,json,sha} from './lab-evidence.mjs';
const out=path.join(root,'spikes/a-spec-kit-manifest/evidence/windows-wiring');
assert.equal(process.platform,'win32');
const spec=path.join(root,'.lab-runs/spec-kit-env/Scripts/specify.exe');
const help=run(spec,['init','--help'],root,out+'/help.json');assert.equal(help.exitCode,0);
const results=[];
for(const order of ['rig-first','spec-first']) {
 const cwd=path.join(root,'.lab-runs/a-windows-'+order);assert(!existsSync(cwd));mkdirSync(cwd,{recursive:true});assert.equal(run('git',['init'],cwd).exitCode,0);
 const rig=()=>run('npx',['--yes','create-agent-rig@0.9.0','init'],cwd,out+'/'+order+'-rig.json');
 const specify=()=>run(spec,['init','--here','--force','--non-interactive','--ignore-agent-tools','--integration','claude','--script','py'],cwd,out+'/'+order+'-spec.json');
 assert.equal((order==='rig-first'?rig():specify()).exitCode,0);
 const settings=path.join(cwd,'.claude/settings.json');const before=existsSync(settings)?readFileSync(settings):null;
 assert.equal((order==='rig-first'?specify():rig()).exitCode,0);
 const after=readFileSync(settings),manifest=JSON.parse(readFileSync(path.join(cwd,'.claude/.rig-manifest.json')));
 results.push({order,beforeBytes:before?.length??null,afterBytes:after.length,beforeSha:before?sha(before):null,afterSha:sha(after),rigManifestSha:manifest.files['.claude/settings.json'],rigOwnsExactBytes:sha(after)===manifest.files['.claude/settings.json'],contentEqualAfterLFNormalization:before?before.toString().replaceAll('\r\n','\n')===after.toString().replaceAll('\r\n','\n'):null});
}
json(out+'/results.json',results);console.log(JSON.stringify(results,null,2));

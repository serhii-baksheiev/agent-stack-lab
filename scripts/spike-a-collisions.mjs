// Bounded synthetic collision/removal experiment, not a reusable package manager.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdirSync,existsSync,readFileSync,writeFileSync,lstatSync,unlinkSync,realpathSync} from 'node:fs';
import path from 'node:path';
import {root,json,run,snapshot,sha} from './lab-evidence.mjs';
const out=path.join(root,'spikes/a-spec-kit-manifest/evidence/collisions');
const archive=path.join(root,'.lab-runs/registry-090/create-agent-rig-0.9.0.tgz');
const unpack=path.join(root,'.lab-runs/a-collision-package');
assert(existsSync(archive),'Run verified baseline acquisition first');
const expectedIntegrity='sha512-yqWpUwdpVKR7unoQy9Bh5UF3+ArCxXSxWaKS3YIuMsiIY+E2u91HeaaCdi8D9bv+Dp5+NSl+5L6uJRd91oHLQQ==';
assert.equal('sha512-'+createHash('sha512').update(readFileSync(archive)).digest('base64'),expectedIntegrity,'Published baseline integrity mismatch');
json(out+'/archive-integrity.json',{expectedIntegrity,verified:true,checkedAt:new Date().toISOString()});
if(!existsSync(path.join(unpack,'package/package.json'))) {
  mkdirSync(unpack,{recursive:true});
  assert.equal(run('tar',['-xzf',archive,'-C',unpack],root,out+'/extract.json').exitCode,0);
}
const pkg=JSON.parse(readFileSync(path.join(unpack,'package/package.json')));
assert.equal(pkg.name,'create-agent-rig');assert.equal(pkg.version,'0.9.0');
const cli=path.join(unpack,'package',pkg.bin['create-agent-rig']);
const specify=path.join(root,'.lab-runs/spec-kit-env',process.platform==='win32'?'Scripts/specify.exe':'bin/specify');
for(const args of [['--version'],['--help'],['init','--help'],['upgrade','--help']]) {
  const r=run(process.execPath,[cli,...args],root,out+'/rig-'+args.join('-').replaceAll('--','')+'.json');
  if(args.length===1){assert.equal(r.exitCode,0);if(args[0]==='--version')assert.equal(r.stdout.trim(),'0.9.0');}
  else assert((r.stdout+r.stderr).includes('Also: create-agent-rig '+args[0]),'Subcommand help must document actual usage even when unsupported');
}
const help=run(specify,['init','--help'],root,out+'/spec-help.json');assert.equal(help.exitCode,0);
for(const flag of ['--here','--force','--non-interactive','--ignore-agent-tools','--integration','--script']) assert(help.stdout.includes(flag));
assert.equal(run(specify,['integration','status','--help'],root,out+'/spec-status-help.json').exitCode,0);
const initArgs=['init','--here','--force','--non-interactive','--ignore-agent-tools','--integration','claude','--script','py'];
function fresh(name) {const cwd=path.join(root,'.lab-runs/a-collision-'+name);assert(!existsSync(cwd),'Fresh run required: '+cwd);mkdirSync(cwd,{recursive:true});assert.equal(run('git',['init'],cwd).exitCode,0);assert.equal(run('git',['-c','user.name=Lab Fixture','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd).exitCode,0);return cwd;}
function write(cwd,p,text) {const target=path.join(cwd,p);mkdirSync(path.dirname(target),{recursive:true});writeFileSync(target,text);}
const seeds={
  'AGENTS.md':'# Synthetic existing agents\nPreserve marker agents.\n',
  'CLAUDE.md':'# Synthetic existing Claude\nPreserve marker claude.\n',
  '.claude/skills/check-premises/SKILL.md':'---\nname: check-premises\ndescription: Synthetic collision\n---\nPreserve Rig skill marker.\n',
  '.claude/skills/speckit-specify/SKILL.md':'---\nname: speckit-specify\ndescription: Synthetic collision\n---\nPreserve Spec Kit skill marker.\n',
  '.claude/commands/speckit.specify.md':'# Synthetic legacy command\nPreserve command marker.\n',
  '.claude/hooks/guard-bash.mjs':'// Synthetic user hook; inert.\n',
  '.claude/settings.json':JSON.stringify({labMarker:'preserve-settings',hooks:{PreToolUse:[{matcher:'Bash',hooks:[{type:'command',command:'node .claude/hooks/guard-bash.mjs'}]}]}},null,2)+'\n',
  '.codex/hooks.json':JSON.stringify({labMarker:'preserve-codex-settings',hooks:{}},null,2)+'\n'
};
const results=[];
const individualOnly=process.argv.includes('--individual-only');
for(const tool of individualOnly?[]:['rig','spec-kit']) {
  const cwd=fresh(tool),dir=out+'/'+tool;
  for(const [p,t] of Object.entries(seeds))write(cwd,p,t);
  const before=snapshot(cwd,dir+'/before.json');
  const install=run(tool==='rig'?process.execPath:specify,tool==='rig'?[cli,'init']:initArgs,cwd,dir+'/install.json');
  const after=snapshot(cwd,dir+'/after.json');
  const rows=Object.keys(seeds).map(p=>({file:p,preserved:before.files[p].sha256===after.files[p]?.sha256,exists:!!after.files[p],before:before.files[p].sha256,after:after.files[p]?.sha256}));
  // These observations can legitimately fail preservation; do not turn findings into flaky CI.
  results.push({scenario:'preexisting-collisions',tool,exitCode:install.exitCode,rows});
}
for(const tool of ['rig','spec-kit']) {
  for(const [index,[p,t]] of Object.entries(Object.entries(seeds))) {
    const cwd=fresh(tool+'-individual-'+index),dir=out+'/'+tool+'-individual-'+index;
    write(cwd,p,t);
    const before=snapshot(cwd,dir+'/before.json');
    const install=run(tool==='rig'?process.execPath:specify,tool==='rig'?[cli,'init']:initArgs,cwd,dir+'/install.json');
    const after=snapshot(cwd,dir+'/after.json');
    results.push({scenario:'individual-preexisting-collision',tool,file:p,exitCode:install.exitCode,preserved:before.files[p].sha256===after.files[p]?.sha256,exists:!!after.files[p],before:before.files[p].sha256,after:after.files[p]?.sha256});
    json(out+'/individual-results.json',results.filter(r=>r.scenario==='individual-preexisting-collision'));
  }
}
if(!individualOnly) {
// Actual pristine manifest-backed uninstall of Rig while Spec Kit remains installed.
const cwd=fresh('uninstall'),dir=out+'/uninstall';
assert.equal(run(process.execPath,[cli,'init'],cwd,dir+'/rig-install.json').exitCode,0);
assert.equal(run(specify,initArgs,cwd,dir+'/spec-install.json').exitCode,0);
const before=snapshot(cwd,dir+'/before.json');
const manifest=JSON.parse(readFileSync(path.join(cwd,'.claude/.rig-manifest.json')));
function confined(p) {
  assert(!path.isAbsolute(p));const target=path.resolve(cwd,p),rel=path.relative(realpathSync(cwd),target);
  assert(rel && !rel.startsWith('..') && !path.isAbsolute(rel),'Path escaped fixture');
  let current=cwd;for(const part of rel.split(path.sep)){current=path.join(current,part);if(existsSync(current))assert(!lstatSync(current).isSymbolicLink(),'Symlink rejected');}
  return target;
}
function plan() {
  const remove=[],preserve=[],blocked=[];
  for(const [p,h] of Object.entries(manifest.files)){const target=confined(p);if(!existsSync(target))continue;assert(lstatSync(target).isFile());(sha(readFileSync(target))===h?remove:preserve).push(p);}
  for(const p of ['AGENTS.md','CLAUDE.md','.claude/settings.json','.codex/hooks.json','.codex/config.toml'])if(preserve.includes(p))blocked.push(p);
  return {remove,preserve,blocked};
}
// Prove the whole operation fails closed before deleting any file on modified wiring.
const settings=confined('.claude/settings.json'),original=readFileSync(settings);
writeFileSync(settings,original.toString()+'\n');
const rejected=plan();assert(rejected.blocked.includes('.claude/settings.json'));
json(dir+'/modified-wiring-rejection.json',{...rejected,executed:false});writeFileSync(settings,original);
const removal=plan();json(dir+'/plan.json',removal);assert.equal(removal.blocked.length,0);
for(const p of removal.remove)unlinkSync(confined(p));
// Remove only the manifest identifying this now removed fixture install.
unlinkSync(confined('.claude/.rig-manifest.json'));
const after=snapshot(cwd,dir+'/after.json');
const specOwned=Object.keys(before.files).filter(p=>!(p in manifest.files)&&p!=='.claude/.rig-manifest.json');
assert(specOwned.length>0);assert(specOwned.every(p=>before.files[p].sha256===after.files[p]?.sha256));
const status=run(specify,['integration','status','--json'],cwd,dir+'/surviving-spec-status.json');assert.equal(status.exitCode,0);
const python=path.join(root,'.lab-runs/spec-kit-env',process.platform==='win32'?'Scripts/python.exe':'bin/python');
const featureScript=path.join(cwd,'.specify/scripts/python/create_new_feature.py');
const featureHelp=run(python,[featureScript,'--help'],cwd,dir+'/survivor-feature-help.json');assert.equal(featureHelp.exitCode,0);assert(featureHelp.stdout.includes('--json'));
const feature=run(python,[featureScript,'--json','Synthetic survivor feature'],cwd,dir+'/survivor-feature.json');assert.equal(feature.exitCode,0);assert(JSON.parse(feature.stdout).SPEC_FILE);
snapshot(cwd,dir+'/after-survivor-feature.json');
results.push({scenario:'bounded-rig-uninstall',native:false,removed:removal.remove.length,specFilesPreserved:specOwned.length,specCliStatusExit:status.exitCode,modifiedWiringRejected:true,limitation:'CLI status and owned bytes verified; no paid harness execution. Empty directories retained.'});
}
json(out+(individualOnly?'/individual-results.json':'/results.json'),results);console.log(JSON.stringify(results,null,2));

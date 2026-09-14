import { mkdirSync, readFileSync, writeFileSync, appendFileSync, unlinkSync, existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,json,run,snapshot,sha} from './lab-evidence.mjs';
const out=path.join(root,'spikes/a-spec-kit-manifest/evidence/integration');
const specify=path.join(root,'.lab-runs/spec-kit-env',process.platform==='win32'?'Scripts/specify.exe':'bin/specify');
mkdirSync(out,{recursive:true});
const cliHelp=run(specify,['--help'],root,out+'/specify-help.json');
assert.equal(cliHelp.exitCode,0,'Spec Kit must be installed at the pinned commit first');
const initHelp=run(specify,['init','--help'],root,out+'/specify-init-help.json');
for(const flag of ['--here','--force','--integration','--non-interactive','--ignore-agent-tools']) assert(initHelp.stdout.includes(flag),`unsupported ${flag}`);
for(const sub of ['install','upgrade','uninstall','status']) run(specify,['integration',sub,'--help'],root,out+`/specify-${sub}-help.json`);
run(specify,['version','--features','--json'],root,out+'/specify-version.json');
const results=[];
for(const order of ['rig-first','spec-first']) {
  const cwd=path.join(root,'.lab-runs/a-'+order); assert(!existsSync(cwd),'fresh scenario required'); mkdirSync(cwd,{recursive:true});
  const evidence=out+'/'+order; let n=0;
  const snap=name=>snapshot(cwd,evidence+`/${String(n++).padStart(2,'0')}-${name}.json`);
  const cmd=(name,exe,args)=>{const r=run(exe,args,cwd,evidence+`/${String(n++).padStart(2,'0')}-${name}-command.json`); snap(name); return r;};
  const rig=(name,args)=>cmd(name,'npx',['--yes','create-agent-rig@0.9.0',...args]);
  const spec=(name,args)=>cmd(name,specify,args);
  const init=()=>spec('spec-init',['init','--here','--force','--non-interactive','--ignore-agent-tools','--integration','claude','--script','py']);
  run('git',['init'],cwd); run('git',['-c','user.name=Lab Fixture','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd);
  const first=order==='rig-first'?rig('rig-init',['init']):init(); assert.equal(first.exitCode,0);
  const firstFiles=snap('first-component').files;
  const second=order==='rig-first'?init():rig('rig-init',['init']); assert.equal(second.exitCode,0);
  const combined=snap('both-components');
  const rigManifest=JSON.parse(readFileSync(path.join(cwd,'.claude/.rig-manifest.json')));
  const ownership={};
  for(const [p,f] of Object.entries(combined.files)) ownership[p]={sha256:f.sha256,owner:p in rigManifest.files || p==='.claude/.rig-manifest.json'?'rig':'spec-kit',firstComponentOwned:p in firstFiles,changedBySecond:p in firstFiles && f.sha256!==firstFiles[p].sha256};
  json(evidence+'/ownership.json',ownership);
  assert.equal(spec('codex-install',['integration','install','codex']).exitCode,0);
  const dual=snap('dual-provider');
  for(const [p,f] of Object.entries(dual.files)) if(!(p in ownership)) ownership[p]={sha256:f.sha256,owner:'spec-kit',createdBy:'codex-integration'};
  json(evidence+'/ownership.json',ownership);
  const rigRepeat=rig('rig-repeat-init',['init']);
  assert.equal(rigRepeat.exitCode,1);assert.equal(init().exitCode,0);
  const beforeDry=snap('before-dry'); const dry=rig('rig-dry',['upgrade','--dry-run']); const afterDry=snap('after-dry');
  const dryReadOnly=JSON.stringify(beforeDry.files)===JSON.stringify(afterDry.files);
  run('git',['add','.'],cwd);run('git',['-c','user.name=Lab Fixture','-c','user.email=lab@example.invalid','commit','-m','both installed'],cwd);
  const edits=['AGENTS.md','CLAUDE.md','.claude/settings.json'];
  for(const p of edits) { if(p.endsWith('.json')) {const v=JSON.parse(readFileSync(path.join(cwd,p)));v.labSyntheticOverride=true;writeFileSync(path.join(cwd,p),JSON.stringify(v,null,2)+'\n');} else appendFileSync(path.join(cwd,p),'\nSynthetic user override: preserve this line.\n'); }
  const deleted='.claude/rules/autonomy.md';unlinkSync(path.join(cwd,deleted));
  const specSkill=Object.keys(combined.files).find(p=>p.startsWith('.claude/skills/speckit-')&&p.endsWith('/SKILL.md'));assert(specSkill);
  appendFileSync(path.join(cwd,specSkill),'\nSynthetic Spec Kit customization.\n');
  const edited=snap('user-edits-and-delete');
  const up=rig('rig-upgrade-edited',['upgrade','--yes']);
  const specUp=spec('spec-upgrade-edited',['integration','upgrade','claude']);
  const updated=snap('after-upgrades');
  const editsPreserved=[...edits,specSkill].every(p=>updated.files[p]?.sha256===edited.files[p].sha256);
  const deletedStaysRemoved=!existsSync(path.join(cwd,deleted));
  // Restore only the synthetic edit to let independent missing-file behavior run.
  const skillText=readFileSync(path.join(cwd,specSkill),'utf8').replace('\nSynthetic Spec Kit customization.\n','');writeFileSync(path.join(cwd,specSkill),skillText);
  const specDeleted=Object.keys(combined.files).find(p=>p.startsWith('.claude/skills/speckit-')&&p.endsWith('/SKILL.md')&&p!==specSkill);assert(specDeleted);unlinkSync(path.join(cwd,specDeleted));snap('spec-delete');
  assert.equal(spec('spec-upgrade-missing',['integration','upgrade','claude']).exitCode,0);
  const specDeletedStaysRemoved=!existsSync(path.join(cwd,specDeleted));
  appendFileSync(path.join(cwd,specSkill),'\nSynthetic Spec Kit customization.\n');
  const beforeRemove=snap('before-spec-uninstall');
  const remove=spec('spec-uninstall-claude',['integration','uninstall','claude']);
  const afterRemove=snap('after-spec-uninstall');
  const rigSurvives=Object.keys(rigManifest.files).filter(p=>beforeRemove.files[p]).every(p=>beforeRemove.files[p].sha256===afterRemove.files[p]?.sha256);
  assert.equal(spec('surviving-codex-status',['integration','status','--json']).exitCode,0);
  assert.equal(rig('surviving-rig-dry',['upgrade','--dry-run']).exitCode,0);
  const finalFiles=snap('final-ownership').files;
  json(evidence+'/final-ownership.json',Object.fromEntries(Object.entries(finalFiles).map(([p,f])=>[p,{...f,owner:p in rigManifest.files || p==='.claude/.rig-manifest.json'?'rig':p==='.specify/memory/constitution.md'?'project':'spec-kit',note:p===specSkill?'user-edited former Spec Kit skill retained after uninstall':undefined}])));
  // Minimal co-ownership prototype: no second manifest for Spec Kit internals.
  // Rig removal must fail closed if shared wiring was edited; deleting hooks then would strand references.
  const wiring=['.claude/settings.json','.codex/hooks.json'];
  const unsafeWiring=wiring.filter(p=>existsSync(path.join(cwd,p)) && sha(readFileSync(path.join(cwd,p)))!==rigManifest.files[p]);
  const removalPlan={kind:'lab-adapter-prototype-not-native-uninstall',blocked:unsafeWiring.length>0,unsafeWiring,remove:[],preserve:[]};
  for(const [p,hash] of Object.entries(rigManifest.files)) {const target=path.resolve(cwd,p);assert(target.startsWith(realpathSync(cwd)+path.sep)); if(!existsSync(target))continue;(sha(readFileSync(target))===hash?removalPlan.remove:removalPlan.preserve).push(p);}
  json(evidence+'/rig-uninstall-plan.json',removalPlan);
  results.push({order,firstExit:first.exitCode,secondExit:second.exitCode,rigRepeatInitExit:rigRepeat.exitCode,rigDryExit:dry.exitCode,dryReadOnly,rigUpgradeExit:up.exitCode,specEditedUpgradeExit:specUp.exitCode,editsPreserved,deletedStaysRemoved,specDeletedStaysRemoved,specUninstallExit:remove.exitCode,rigSurvivesSpecUninstall:rigSurvives,editedSpecSkillSurvives:existsSync(path.join(cwd,specSkill)),rigUninstallBlockedOnModifiedWiring:removalPlan.blocked,naturalSecondComponentOverwrites:Object.entries(ownership).filter(([p,v])=>v.changedBySecond).map(([p])=>p)});
}
json(out+'/results.json',results); console.log(JSON.stringify(results,null,2));
assert(results.every(r=>r.rigDryExit===0&&r.rigUpgradeExit===0&&r.specEditedUpgradeExit===1&&r.specUninstallExit===0&&r.dryReadOnly&&r.editsPreserved&&r.deletedStaysRemoved&&r.rigSurvivesSpecUninstall));

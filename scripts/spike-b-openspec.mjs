// Run from repository root. Installs only verified tarballs under ignored .lab-runs.
import {mkdirSync,existsSync,writeFileSync,readFileSync,cpSync,appendFileSync,unlinkSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {root,run,json,snapshot,sha} from './lab-evidence.mjs';
const out=path.join(root,'spikes/b-spec-workflows/evidence/openspec');
const base=path.join(root,`.lab-runs/b-openspec-${Date.now()}`);
mkdirSync(base,{recursive:true});
const home=path.join(base,'home');mkdirSync(home,{recursive:true});
const env={HOME:home,USERPROFILE:home,CODEX_HOME:path.join(home,'.codex'),CLAUDE_CONFIG_DIR:path.join(home,'.claude'),XDG_CONFIG_HOME:path.join(home,'.config'),XDG_CACHE_HOME:path.join(home,'.cache'),XDG_DATA_HOME:path.join(home,'.local/share'),APPDATA:path.join(home,'AppData/Roaming'),LOCALAPPDATA:path.join(home,'AppData/Local'),GIT_CONFIG_GLOBAL:path.join(home,'gitconfig'),GIT_CONFIG_NOSYSTEM:'1',OPENSPEC_TELEMETRY:'0',OPENSPEC_NO_UPDATE_CHECK:'1',CI:'1',npm_config_cache:path.join(base,'npm-cache'),npm_config_userconfig:path.join(home,'npmrc')};
writeFileSync(env.GIT_CONFIG_GLOBAL,'');writeFileSync(env.npm_config_userconfig,'');
for(const key of Object.keys(process.env))if(/TOKEN|SECRET|PASSWORD|API_KEY|AUTH|^CODEX_|^CLAUDE_|^ANTHROPIC_|^OPENAI_/i.test(key)&&!(key in env))env[key]='';
async function fetchJSON(url){const r=await fetch(url);assert(r.ok,`${url}: ${r.status}`);return r.json();}
const provenances=[];
async function install(name,version,label){
 const registry=await fetchJSON('https://registry.npmjs.org/'+encodeURIComponent(name));const p=registry.versions[version];assert(p);
 const bytes=Buffer.from(await(await fetch(p.dist.tarball)).arrayBuffer());assert.equal('sha512-'+createHash('sha512').update(bytes).digest('base64'),p.dist.integrity);
 const dir=path.join(base,label);mkdirSync(dir,{recursive:true});writeFileSync(path.join(dir,'package.json'),JSON.stringify({name:'synthetic-'+label,version:'0.0.0',private:true}));writeFileSync(path.join(dir,'package.tgz'),bytes);
 const prefix=run('npm',['--prefix',dir,'prefix'],dir,out+'/'+label+'-prefix.json',env);assert.equal(prefix.exitCode,0);assert.equal(path.resolve(prefix.stdout.trim().replaceAll('<LAB>',root)),dir,'npm prefix must stay inside isolated package');
 assert.equal(run('npm',['install','--prefix',dir,'--ignore-scripts','--no-audit','--no-fund','--save-exact',path.join(dir,'package.tgz')],dir,out+'/'+label+'-install.json',env).exitCode,0);
 json(out+'/'+label+'-lock.json',JSON.parse(readFileSync(path.join(dir,'package-lock.json'))));
 provenances.push({name,version,license:p.license,gitHead:p.gitHead??null,repository:p.repository,released:registry.time[version],latest:registry['dist-tags'].latest,dist:p.dist,integrityVerified:true,checkedAt:new Date().toISOString()});
 const pkg=path.join(dir,'node_modules',name);const meta=JSON.parse(readFileSync(path.join(pkg,'package.json')));return {cli:path.join(pkg,typeof meta.bin==='string'?meta.bin:Object.values(meta.bin)[0]),pkg};
}
const workflowOnly=process.argv.includes('--workflow-only');
const openspec=workflowOnly?{cli:path.join(root,'.lab-runs/b-openspec-package/node_modules/@fission-ai/openspec/bin/openspec.js')}:await install('@fission-ai/openspec','1.13.0','openspec');
const rig=workflowOnly?null:await install('create-agent-rig','0.9.0','rig');
const old=workflowOnly?null:await install('@fission-ai/openspec','1.12.0','openspec-previous');
if(!workflowOnly){
for(const [label,tool] of [['current',openspec],['previous',old]])assert.equal(run(process.execPath,[tool.cli,'--version'],base,out+'/'+label+'-version.json',env).exitCode,0);
const oldInitHelp=run(process.execPath,[old.cli,'init','--help'],base,out+'/previous-init-help.json',env);assert.equal(oldInitHelp.exitCode,0);for(const flag of ['--tools','--profile','--no-animation'])assert(oldInitHelp.stdout.includes(flag),'unsupported previous CLI flag '+flag);
try{json(out+'/upstream-release.json',await fetchJSON('https://api.github.com/repos/Fission-AI/OpenSpec/releases/tags/v1.13.0'));json(out+'/upstream-commit.json',await fetchJSON('https://api.github.com/repos/Fission-AI/OpenSpec/commits/v1.13.0'));}catch(e){json(out+'/upstream-lookup-error.json',{error:e.message});}
json(out+'/provenance.json',{packages:provenances,node:process.version,platform:process.platform,scriptSha256:sha(readFileSync(import.meta.filename)),runDirectory:path.relative(root,base)});
for(const args of [['--help'],['init','--help'],['update','--help'],['config','set','--help'],['new','change','--help'],['instructions','--help'],['archive','--help'],['status','--help'],['validate','--help']])assert.equal(run(process.execPath,[openspec.cli,...args],base,out+'/help-'+args.filter(x=>!x.startsWith('-')).join('-')+'.json',env).exitCode,0);
const rigHelp=run(process.execPath,[rig.cli,'--help'],base,out+'/rig-help.json',env);assert.equal(rigHelp.exitCode,0);
for(const args of [['upgrade','--help'],['init','--help']])assert.equal(run(process.execPath,[rig.cli,...args],base,out+'/rig-'+args[0]+'-help.json',env).exitCode,1); // 0.9.0 only supports general help.
}
const rows=[];
for(const order of (workflowOnly?[]:['rig-first','openspec-first'])){
 const cwd=path.join(base,order),ev=out+'/'+order;mkdirSync(cwd,{recursive:true});
 assert.equal(run('git',['init','-q'],cwd,undefined,env).exitCode,0);assert.equal(run('git',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd,undefined,env).exitCode,0);
 let seq=0;const snap=label=>snapshot(cwd,ev+`/${String(seq++).padStart(2,'0')}-${label}.json`,env);
 const call=(label,cli,args)=>{const result=run(process.execPath,[cli,...args],cwd,ev+`/${String(seq++).padStart(2,'0')}-${label}-command.json`,env);assert.equal(result.error,undefined,label);snap(label);return result;};
 const spec=(label,args)=>call(label,openspec.cli,args),rigRun=(label,args)=>call(label,rig.cli,args);
 const init=()=>spec('openspec-init',['init','--tools','claude,codex','--profile','core','--no-animation']);
 assert.equal((order==='rig-first'?rigRun('rig-init',['init']):init()).exitCode,0);const first=snap('first');
 assert.equal((order==='rig-first'?init():rigRun('rig-init',['init'])).exitCode,0);const both=snap('both');
 const manifest=JSON.parse(readFileSync(path.join(cwd,'.claude/.rig-manifest.json')));
 json(ev+'/ownership.json',Object.fromEntries(Object.entries(both.files).map(([p,f])=>[p,{...f,rigClaims:p in manifest.files,changedBySecond:!!first.files[p]&&first.files[p].sha256!==f.sha256}])));
 const row={order,changedBySecond:Object.keys(first.files).filter(p=>first.files[p].sha256!==both.files[p]?.sha256)};
 row.rigRepeat=rigRun('rig-repeat',['init']).exitCode;const preRepeat=snap('before-repeat');row.openspecRepeat=init().exitCode;row.openspecRepeatIdentical=JSON.stringify(preRepeat.files)===JSON.stringify(snap('after-repeat').files);
 const dryBefore=snap('before-dry');row.rigDry=rigRun('rig-dry',['upgrade','--dry-run']).exitCode;row.rigDryReadOnly=JSON.stringify(dryBefore.files)===JSON.stringify(snap('after-dry').files);
 for(const p of ['AGENTS.md','CLAUDE.md'])appendFileSync(path.join(cwd,p),'\nSynthetic user override.\n');
 const settings=path.join(cwd,'.claude/settings.json');const settingsValue=JSON.parse(readFileSync(settings));settingsValue.labSyntheticOverride=true;writeFileSync(settings,JSON.stringify(settingsValue,null,2)+'\n');
 const deleted='.claude/rules/autonomy.md';unlinkSync(path.join(cwd,deleted));
 const skill=Object.keys(both.files).find(p=>p.startsWith('.claude/skills/openspec-')&&p.endsWith('/SKILL.md'));assert(skill);appendFileSync(path.join(cwd,skill),'\nSynthetic skill customization.\n');
 const specDeleted=Object.keys(both.files).find(p=>p.startsWith('.claude/skills/openspec-')&&p.endsWith('/SKILL.md')&&p!==skill);assert(specDeleted);unlinkSync(path.join(cwd,specDeleted));const edited=snap('edited');
 row.rigUpgrade=rigRun('rig-upgrade',['upgrade','--yes']).exitCode;const afterRig=snap('after-rig');row.rigEditsPreserved=['AGENTS.md','CLAUDE.md','.claude/settings.json',skill].every(p=>edited.files[p].sha256===afterRig.files[p]?.sha256);row.rigDeletedStaysRemoved=!existsSync(path.join(cwd,deleted));
 row.openspecUpdate=spec('openspec-update',['update','--force']).exitCode;const afterSpec=snap('after-openspec');row.openspecSkillEditPreserved=edited.files[skill].sha256===afterSpec.files[skill]?.sha256;row.openspecMissingSkillRestored=existsSync(path.join(cwd,specDeleted));row.rigSurvivesUpdate=Object.keys(manifest.files).filter(p=>afterRig.files[p]).every(p=>afterRig.files[p].sha256===afterSpec.files[p]?.sha256);
 // No uninstall exists in actual help. Test documented delivery reconciliation, not pretend uninstall.
 row.deliveryConfig=spec('commands-delivery',['config','set','delivery','commands']).exitCode;
 row.deliveryReconcile=spec('delivery-update',['update','--force']).exitCode;const reconciled=snap('after-delivery');row.claudeSkillRemoved=!existsSync(path.join(cwd,skill));row.rigSurvivesReconcile=Object.keys(manifest.files).filter(p=>afterSpec.files[p]).every(p=>afterSpec.files[p].sha256===reconciled.files[p]?.sha256);
 row.survivorRig=rigRun('survivor-rig',['upgrade','--dry-run']).exitCode;row.survivorSpec=spec('survivor-spec',['list','--json']).exitCode;
 spec('restore-delivery',['config','set','delivery','both']);rows.push(row);json(out+'/lifecycle-results.json',rows);
}
// Genuine published-version instruction-file migration, separate from same-version refresh.
const upgradeDir=path.join(base,'release-upgrade');mkdirSync(upgradeDir,{recursive:true});
if(!workflowOnly){
run('git',['init','-q'],upgradeDir,undefined,env);run('git',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],upgradeDir,undefined,env);
for(const [label,cli,args] of [['previous-init',old.cli,['init','--tools','claude,codex','--profile','core','--no-animation']],['current-update',openspec.cli,['update','--force']]]){assert.equal(run(process.execPath,[cli,...args],upgradeDir,out+'/'+label+'.json',env).exitCode,0);snapshot(upgradeDir,out+'/'+label+'-snapshot.json',env);}
}
// Replay authored artifacts through upstream lifecycle; CLI does not author feature prose or code.
const cwd=path.join(base,'workflow'),ev=out+'/workflow';mkdirSync(cwd,{recursive:true});
run('git',['init','-q'],cwd,undefined,env);run('git',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd,undefined,env);
const cli=(label,args)=>{const r=run(process.execPath,[openspec.cli,...args],cwd,ev+'/'+label+'.json',env);assert.equal(r.error,undefined,label);return r;};
assert.equal(cli('version',['--version']).exitCode,0);
assert.equal(cli('init',['init','--tools','claude,codex','--profile','core','--no-animation']).exitCode,0);
cpSync(path.join(root,'fixtures/b-workflow/openspec/openspec/config.yaml'),path.join(cwd,'openspec/config.yaml'));
for(const name of ['openspec-propose','openspec-apply-change']){const p=path.join(cwd,'.agents/skills',name,'SKILL.md');json(ev+'/'+name+'-skill.json',{path:path.relative(root,p),sha256:sha(readFileSync(p)),text:readFileSync(p,'utf8')});}
assert.equal(cli('context',['context','--json']).exitCode,0);
assert.equal(cli('new',['new','change','local-subscriptions','--json']).exitCode,0);
const duplicate=cli('duplicate-new',['new','change','local-subscriptions','--json']);assert.notEqual(duplicate.exitCode,0);
assert.equal(cli('initial-status',['status','--change','local-subscriptions','--json']).exitCode,0);
const fixture=path.join(root,'fixtures/b-workflow/openspec'),change='openspec/changes/local-subscriptions';
for(const [artifact,file] of [['proposal','proposal.md'],['specs','specs/local-subscriptions/spec.md'],['design','design.md'],['tasks','tasks.md']]){
 assert.equal(cli('instructions-'+artifact,['instructions',artifact,'--change','local-subscriptions','--json']).exitCode,0);
 const dest=path.join(cwd,change,file);mkdirSync(path.dirname(dest),{recursive:true});writeFileSync(dest,readFileSync(path.join(fixture,change,file),'utf8').replaceAll('- [x]','- [ ]'));
 assert.equal(cli('status-after-'+artifact,['status','--change','local-subscriptions','--json']).exitCode,0);
}
const firstApply=cli('apply-before',['instructions','apply','--change','local-subscriptions','--json']);assert.equal(firstApply.exitCode,0);
for(const p of ['src','test','traceability.md','review.md'])cpSync(path.join(fixture,p),path.join(cwd,p),{recursive:true});
const testResult=run(process.execPath,['--test','test/subscriptions.test.mjs'],cwd,ev+'/node-tests.json',env);assert.equal(testResult.exitCode,0);
cpSync(path.join(fixture,change,'tasks.md'),path.join(cwd,change,'tasks.md'));
const before=snapshot(cwd,ev+'/before-repeat.json',env),first=cli('tasks-instructions-first',['instructions','tasks','--change','local-subscriptions','--json']),second=cli('tasks-instructions-restart',['instructions','tasks','--change','local-subscriptions','--json']);
const apply=cli('apply-complete',['instructions','apply','--change','local-subscriptions','--json']);assert.equal(apply.exitCode,0);
const after=snapshot(cwd,ev+'/after-repeat.json',env);
assert.equal(cli('strict-validation',['validate','local-subscriptions','--strict','--json','--no-interactive']).exitCode,0);
assert.equal(cli('final-status',['status','--change','local-subscriptions','--json']).exitCode,0);
const completed=JSON.parse(apply.stdout);json(ev+'/restart-results.json',{duplicateNewExit:duplicate.exitCode,instructionsByteIdentical:first.stdout===second.stdout,filesUnchanged:JSON.stringify(before.files)===JSON.stringify(after.files),applyState:completed.state,progress:completed.progress,nativeClaudeRun:false,artifactAuthor:'manual-load Codex',boardExport:'No board/issues export command in actual root help; JSON task instructions are data for a separate adapter, not an external board write.'});
assert.equal(cli('archive',['archive','local-subscriptions','--yes','--json']).exitCode,0);
assert.equal(cli('validate-archived',['validate','--all','--strict','--json','--no-interactive']).exitCode,0);
json(out+(workflowOnly?'/workflow-only-complete.json':'/complete.json'),{completed:true,workflowOnly,lifecycle:rows,workflowTestsPassed:true});
console.log(JSON.stringify({completed:true,out:path.relative(root,out)},null,2));

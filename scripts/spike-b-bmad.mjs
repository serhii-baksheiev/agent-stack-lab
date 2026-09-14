// Synthetic lifecycle only. Run from lab root: node scripts/spike-b-bmad.mjs
import { mkdirSync, readFileSync, writeFileSync, existsSync, appendFileSync, unlinkSync, cpSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
import { root, json, run, snapshot, sha } from './lab-evidence.mjs';
const out=path.join(root,'spikes/b-spec-workflows/evidence/bmad');
const base=path.join(root,'.lab-runs/b-bmad-lifecycle-'+Date.now());
const pkgdir=path.join(base,'packages'); mkdirSync(pkgdir,{recursive:true});
const isolatedHome=path.join(base,'home');mkdirSync(isolatedHome,{recursive:true});
const env={HOME:isolatedHome,USERPROFILE:isolatedHome,XDG_CONFIG_HOME:path.join(isolatedHome,'config'),XDG_CACHE_HOME:path.join(isolatedHome,'cache'),CLAUDE_CONFIG_DIR:path.join(isolatedHome,'claude'),CODEX_HOME:path.join(isolatedHome,'codex'),GIT_CONFIG_GLOBAL:path.join(isolatedHome,'gitconfig'),GIT_CONFIG_NOSYSTEM:'1',npm_config_userconfig:path.join(isolatedHome,'npmrc'),npm_config_cache:path.join(base,'npm-cache'),UV_CACHE_DIR:path.join(base,'uv-cache'),UV_TOOL_DIR:path.join(base,'uv-tools'),UV_PYTHON_INSTALL_DIR:path.join(base,'uv-python')};
for(const k of ['XDG_CONFIG_HOME','XDG_CACHE_HOME','CLAUDE_CONFIG_DIR','CODEX_HOME'])mkdirSync(env[k],{recursive:true});
for(const k of ['GIT_CONFIG_GLOBAL','npm_config_userconfig'])writeFileSync(env[k],'');
for(const k of Object.keys(process.env))if(/TOKEN|SECRET|PASSWORD|API_KEY|AUTH/i.test(k))env[k]='';
const command=(name,exe,args,cwd=pkgdir)=>run(exe,args,cwd,path.join(out,name+'.json'),env);
writeFileSync(path.join(pkgdir,'package.json'),JSON.stringify({name:'synthetic-bmad-lifecycle',version:'0.0.0',private:true}));
const prefix=command('npm-prefix','npm',['prefix','--prefix',pkgdir]);assert.equal(prefix.exitCode,0);assert.equal(path.resolve(prefix.stdout.trim().replaceAll('<LAB>',root)),pkgdir);
const registry=await(await fetch('https://registry.npmjs.org/bmad-method')).json();
const bm=registry.versions['6.12.0']; assert.equal(bm.gitHead,'05bfbd46d00766ec88eb9b42e76be2c575d64d7b');
const rig=await(await fetch('https://registry.npmjs.org/create-agent-rig/0.9.0')).json();
for(const [name,meta] of [['bmad',bm],['rig',rig]]) {
 const bytes=Buffer.from(await(await fetch(meta.dist.tarball)).arrayBuffer());
 assert.equal('sha512-'+createHash('sha512').update(bytes).digest('base64'),meta.dist.integrity);
 writeFileSync(path.join(pkgdir,name+'.tgz'),bytes);
}
assert.equal(command('dependencies','npm',['install','--prefix',pkgdir,'--ignore-scripts','--no-audit','--no-fund','--save-exact','./bmad.tgz','./rig.tgz']).exitCode,0);
json(out+'/dependency-lock.json',JSON.parse(readFileSync(path.join(pkgdir,'package-lock.json'))));
const bcli=path.join(pkgdir,'node_modules/bmad-method/tools/installer/bmad-cli.js');
const rp=JSON.parse(readFileSync(path.join(pkgdir,'node_modules/create-agent-rig/package.json')));
const rcli=path.join(pkgdir,'node_modules/create-agent-rig',typeof rp.bin==='string'?rp.bin:Object.values(rp.bin)[0]);
const activity=await fetch('https://api.github.com/repos/bmad-code-org/BMAD-METHOD/commits/'+bm.gitHead,{headers:{'User-Agent':'agent-stack-lab'}});
const upstream=activity.ok?await activity.json():{unverified:true,httpStatus:activity.status};
json(out+'/provenance.json',{checkedAt:new Date().toISOString(),version:bm.version,license:bm.license,commit:bm.gitHead,dist:bm.dist,latest:registry['dist-tags'].latest,publishedAt:registry.time[bm.version],upstream:{sha:upstream.sha,date:upstream.commit?.committer?.date,url:upstream.html_url,error:upstream.unverified},rig:{version:rig.version,license:rig.license,dist:rig.dist},platform:process.platform,node:process.version,scriptSha256:sha(readFileSync(import.meta.filename))});
for(const [name,args] of [['help',['--help']],['install-help',['install','--help']],['uninstall-help',['uninstall','--help']],['status-help',['status','--help']],['tools',['install','--list-tools']]]) assert.equal(command(name,'node',[bcli,...args]).exitCode,0);
assert.equal(command('rig-help','node',[rcli,'--help']).exitCode,0);
// Published 0.9.0 does not implement upgrade-specific help; preserve its real exit 1.
assert.equal(command('rig-upgrade-help','node',[rcli,'upgrade','--help']).exitCode,1);
const eq=(a,b)=>JSON.stringify(a.files)===JSON.stringify(b.files);
const changed=(a,b)=>Object.keys(a.files).filter(p=>a.files[p].sha256!==b.files[p]?.sha256);
const results=[];
for(const order of ['rig-first','bmad-first']) {
 const cwd=path.join(base,order);mkdirSync(cwd,{recursive:true});
 let n=0;const snap=name=>snapshot(cwd,path.join(out,order,`${n++}-${name}.json`),env);
 const cmd=(name,cli,args)=>command(`${order}/${n++}-${name}`,'node',[cli,...args],cwd);
 const install=(name,action)=>cmd(name,bcli,['install','--directory',cwd,'--modules','bmm','--tools','claude-code,codex','--user-name','SyntheticLab','--yes',...(action?['--action',action]:[])]);
 run('git',['init','--quiet'],cwd,undefined,env);writeFileSync(path.join(cwd,'README.md'),'Synthetic BMAD lifecycle fixture.\n');
 run('git',['add','.'],cwd,undefined,env);run('git',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','--quiet','-m','Synthetic seed'],cwd,undefined,env);
 const firstCommand=order==='rig-first'?cmd('rig-init',rcli,['init']):install('bmad-init');assert.equal(firstCommand.exitCode,0);const first=snap('first');
 const secondCommand=order==='rig-first'?install('bmad-init'):cmd('rig-init',rcli,['init']);assert.equal(secondCommand.exitCode,0);const second=snap('second');
 const rigManifest=JSON.parse(readFileSync(path.join(cwd,'.claude/.rig-manifest.json')));
 json(out+`/${order}/ownership.json`,Object.fromEntries(Object.entries(second.files).map(([p,f])=>[p,{...f,rigClaims:p in rigManifest.files,bmadNamespace:p.startsWith('_bmad/')||/^(\.claude|\.agents)\/skills\/bmad-/.test(p),createdBySecond:!(p in first.files),changedBySecond:p in first.files&&first.files[p].sha256!==f.sha256}])));
 // Replay native deterministic checks against copied authored artifacts; this is
 // never presented as native model generation of the prose or implementation.
 const authored=path.join(root,'fixtures/b-workflow/bmad');
 for(const p of ['_bmad-output','src','tests'])cpSync(path.join(authored,p),path.join(cwd,p),{recursive:true});
 const uvVersion=command(`${order}/uv-version`,'uv',['--version'],cwd);
 const render=command(`${order}/render-build`,'uv',['run','--no-cache',path.join(cwd,'_bmad/scripts/render_skill.py'),'--project-root',cwd,'--skill',path.join(cwd,'.claude/skills/bmad-build')],cwd);
 const lint=command(`${order}/lint-spine`,'uv',['run',path.join(cwd,'.claude/skills/bmad-architecture/scripts/lint_spine.py'),'--workspace',path.join(cwd,'_bmad-output/specs/spec-subscriptions')],cwd);
 const tests=command(`${order}/authored-tests`,'node',['--test',path.join(cwd,'tests/subscriptions.test.mjs')],cwd);
 json(out+`/${order}/workflow-replay.json`,{authorship:'Copied Codex-authored fixtures; native deterministic renderer/linter and Node tests only. No native model generation.',uvVersionExit:uvVersion.exitCode,rendererExit:render.exitCode,spineLintExit:lint.exitCode,testsExit:tests.exitCode});
 assert.equal(render.exitCode,0,'BMAD build renderer failed');assert.equal(lint.exitCode,0,'BMAD spine linter failed');assert.equal(tests.exitCode,0,'Authored domain tests failed');
 const beforeRepeat=snap('authored-workflow-baseline');
 const status=cmd('bmad-status',bcli,['status']);
 const repeat=install('bmad-repeat','update');const afterRepeat=snap('repeat');
 const repeat2=install('bmad-repeat-2','update');const afterRepeat2=snap('repeat-2');
 const rigRepeat=cmd('rig-repeat',rcli,['init']);const preDry=snap('pre-dry');
 const dry=cmd('rig-dry',rcli,['upgrade','--dry-run']);const postDry=snap('post-dry');
 const shared=['AGENTS.md','CLAUDE.md','.claude/settings.json'];
 for(const p of shared) if(existsSync(path.join(cwd,p))) {if(p.endsWith('.json')) {const x=JSON.parse(readFileSync(path.join(cwd,p)));x.syntheticBmadProbe=true;writeFileSync(path.join(cwd,p),JSON.stringify(x,null,2)+'\n');}else appendFileSync(path.join(cwd,p),'\nSynthetic user lifecycle edit.\n');}
 const bmSkill=Object.keys(second.files).find(p=>p.startsWith('.claude/skills/bmad-')&&p.endsWith('/SKILL.md'));
 if(bmSkill) appendFileSync(path.join(cwd,bmSkill),'\nSynthetic generated skill edit.\n');
 const deletion=Object.keys(first.files).find(p=>p.startsWith('.claude/')&&p.endsWith('.md')&&!p.includes('bmad')) || Object.keys(second.files).find(p=>p.startsWith('.claude/')&&p.endsWith('.md')&&!p.includes('bmad'));
 if(deletion) unlinkSync(path.join(cwd,deletion));
 mkdirSync(path.join(cwd,'_bmad-output'),{recursive:true});writeFileSync(path.join(cwd,'_bmad-output/synthetic-user-artifact.md'),'Preserve this synthetic authored artifact.\n');
 const edited=snap('edited');const upgrade=cmd('rig-upgrade',rcli,['upgrade','--yes']);const afterRig=snap('after-rig');
 const update=install('bmad-update','update');const afterUpdate=snap('after-update');
 const uninstall=cmd('bmad-uninstall',bcli,['uninstall','--directory',cwd,'--yes']);const afterUninstall=snap('after-uninstall');
 const survive=cmd('rig-survival',rcli,['upgrade','--dry-run']);
 json(out+`/${order}/rig-uninstall-survival.json`,{rigClaimedFilesChangedByBmadUninstall:Object.keys(rigManifest.files).filter(p=>afterUpdate.files[p]&&afterUpdate.files[p].sha256!==afterUninstall.files[p]?.sha256),rigDryRunExit:survive.exitCode,authoredFilesChanged:Object.keys(afterUpdate.files).filter(p=>p.startsWith('_bmad-output/')&&afterUpdate.files[p].sha256!==afterUninstall.files[p]?.sha256)});
 results.push({order,secondChangedExisting:changed(first,second),bmadStatusExit:status.exitCode,bmadRepeatExit:repeat.exitCode,bmadRepeat2Exit:repeat2.exitCode,repeatChanged:changed(beforeRepeat,afterRepeat),stableRepeatChanged:changed(afterRepeat,afterRepeat2),rigRepeatExit:rigRepeat.exitCode,rigDryExit:dry.exitCode,rigDryReadOnly:eq(preDry,postDry),rigUpgradeExit:upgrade.exitCode,rigSharedEditsPreserved:shared.filter(p=>edited.files[p]).map(p=>({path:p,preserved:edited.files[p].sha256===afterRig.files[p]?.sha256})),deletedPath:deletion,rigDeletionPreserved:deletion?!afterRig.files[deletion]:null,bmadUpdateExit:update.exitCode,bmadGeneratedEditPreserved:bmSkill?edited.files[bmSkill]?.sha256===afterUpdate.files[bmSkill]?.sha256:null,bmadUninstallExit:uninstall.exitCode,bmadUninstallChanged:changed(afterUpdate,afterUninstall),artifactPreserved:afterUpdate.files['_bmad-output/synthetic-user-artifact.md']?.sha256===afterUninstall.files['_bmad-output/synthetic-user-artifact.md']?.sha256,rigSurvivalExit:survive.exitCode,governance:{files:second.count,bytes:second.bytes},unverified:['cross-version BMAD release upgrade','native Claude model session','board export','artifact validation CLI (not advertised)']});
}
json(out+'/lifecycle-results.json',results);console.log(JSON.stringify(results,null,2));

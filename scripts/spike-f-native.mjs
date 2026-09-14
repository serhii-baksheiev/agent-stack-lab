// Real native package lifecycle; every profile and source is synthetic and isolated.
import {mkdirSync,readFileSync,writeFileSync,cpSync,existsSync,appendFileSync,unlinkSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {root,run,json,snapshot,sha} from './lab-evidence.mjs';
const out=path.join(root,'spikes/f-native-projection/evidence/native');
const tools=path.join(root,'.lab-runs/f-tools');
const codex=path.join(tools,'node_modules/@openai/codex/bin/codex.js');
const claudePackage=path.join(tools,'node_modules/@anthropic-ai/claude-code');
const claudeMeta=JSON.parse(readFileSync(path.join(claudePackage,'package.json')));
const claude=path.join(claudePackage,claudeMeta.bin.claude);
mkdirSync(out,{recursive:true});
json(out+'/dependency-lock.json',JSON.parse(readFileSync(path.join(tools,'package-lock.json'))));
const provenance=[];
for(const [name,version] of [['@openai/codex','0.154.0'],['@anthropic-ai/claude-code','2.1.270'],['create-agent-rig','0.9.0']]) {
 const registry=await(await fetch('https://registry.npmjs.org/'+encodeURIComponent(name))).json();const pkg=registry.versions[version];
 const bytes=Buffer.from(await(await fetch(pkg.dist.tarball)).arrayBuffer());assert.equal('sha512-'+createHash('sha512').update(bytes).digest('base64'),pkg.dist.integrity);
 provenance.push({name,version,license:pkg.license,dist:pkg.dist,released:registry.time[version],checkedAt:new Date().toISOString()});
 if(name==='create-agent-rig'){writeFileSync(path.join(tools,'rig.tgz'),bytes);assert.equal(run('tar',['-xzf',path.join(tools,'rig.tgz'),'-C',tools],root).exitCode,0);}
}
json(out+'/provenance.json',{packages:provenance,node:process.version,platform:process.platform,scenarioSha:run('git',['rev-parse','HEAD'],root).stdout.trim(),scriptSha256:sha(readFileSync(import.meta.filename))});
const rigPkg=JSON.parse(readFileSync(path.join(tools,'package/package.json')));
const rig=path.join(tools,'package',typeof rigPkg.bin==='string'?rigPkg.bin:Object.values(rigPkg.bin)[0]);
const results=[];
for(const provider of ['claude','codex'])for(const order of ['rig-first','native-first']) {
 const base=path.join(root,`.lab-runs/f-native-${provider}-${order}`);assert(!existsSync(base),'fresh fixture required');
 const cwd=path.join(base,'repo'),home=path.join(base,'home'),source=path.join(base,'marketplace'),ev=out+'/'+provider+'-'+order;
 mkdirSync(cwd,{recursive:true});mkdirSync(home,{recursive:true});cpSync(path.join(root,'fixtures/f-native/marketplace'),source,{recursive:true});
 const env={HOME:home,USERPROFILE:home,CODEX_HOME:path.join(home,'.codex'),CLAUDE_CONFIG_DIR:path.join(home,'.claude'),XDG_CONFIG_HOME:path.join(home,'.config'),XDG_DATA_HOME:path.join(home,'.local/share'),XDG_CACHE_HOME:path.join(home,'.cache'),APPDATA:path.join(home,'AppData/Roaming'),LOCALAPPDATA:path.join(home,'AppData/Local'),GIT_CONFIG_GLOBAL:path.join(home,'gitconfig'),GIT_CONFIG_NOSYSTEM:'1',DISABLE_AUTOUPDATER:'1',DISABLE_TELEMETRY:'1'};
 for(const key of Object.keys(process.env))if(/TOKEN|SECRET|PASSWORD|API_KEY|AUTH|^CODEX_|^CLAUDE_|^ANTHROPIC_|^OPENAI_/i.test(key)&&!(key in env))env[key]='';
 mkdirSync(env.CODEX_HOME,{recursive:true});mkdirSync(env.CLAUDE_CONFIG_DIR,{recursive:true});writeFileSync(env.GIT_CONFIG_GLOBAL,'');let n=0;
 const snap=name=>{const s=snapshot(cwd,ev+`/${String(n++).padStart(2,'0')}-${name}.json`,env);assert.equal(s.gitStatus.exitCode,0);assert.equal(s.gitDiff.exitCode,0);return s;};
 const cmd=(name,exe,args)=>{const r=run(exe,args,cwd,ev+`/${String(n++).padStart(2,'0')}-${name}-command.json`,env);assert.equal(r.error,undefined,`collector failure ${name}`);assert(Number.isInteger(r.exitCode));snap(name);return r;};
 const native=(name,args)=>provider==='codex'?cmd(name,process.execPath,[codex,...args]):cmd(name,claude,args);
 const rigRun=(name,args)=>cmd(name,process.execPath,[rig,...args]);
 assert.equal(run('git',['init','-q'],cwd,undefined,env).exitCode,0);assert.equal(run('git',['-c','user.name=Synthetic Lab','-c','user.email=lab@example.invalid','commit','--allow-empty','-m','synthetic'],cwd,undefined,env).exitCode,0);
 assert.equal(native('version',['--version']).exitCode,0);
 for(const args of [['plugin','--help'],['plugin',provider==='codex'?'add':'install','--help'],['plugin','marketplace','--help']])native('help',args);
 const add=()=>{const market=native('marketplace-add',['plugin','marketplace','add',source,...(provider==='claude'?['--scope','project']:['--json'])]);if(market.exitCode!==0)return market;return install();};
 let codexInstalledPath;
 const install=()=>{const r=native('plugin-install',['plugin',provider==='codex'?'add':'install','lab-neutral@personal',...(provider==='claude'?['--scope','project']:[]),'--json']);if(provider==='codex'&&r.exitCode===0)codexInstalledPath=JSON.parse(r.stdout).installedPath;return r;};
 assert.equal((order==='rig-first'?rigRun('rig-init',['init']):add()).exitCode,0);
 const first=snap('first');const secondCommand=order==='rig-first'?add():rigRun('rig-init',['init']);const combined=snap('combined');
 const row={provider,order,secondExit:secondCommand.exitCode,changedBySecond:Object.keys(first.files).filter(p=>first.files[p].sha256!==combined.files[p]?.sha256)};
 if(secondCommand.exitCode!==0){results.push(row);continue;}
 const manifest=JSON.parse(readFileSync(path.join(cwd,'.claude/.rig-manifest.json')));
 json(ev+'/ownership.json',Object.fromEntries(Object.entries(combined.files).map(([p,f])=>[p,{...f,rigClaims:p in manifest.files,nativeWiring:p==='.claude/settings.json',rigHashMatches:manifest.files[p]===f.sha256}])));
 row.rigRepeat=rigRun('rig-repeat',['init']).exitCode;row.nativeRepeat=install().exitCode;
 const before=snap('before-dry');row.dryExit=rigRun('rig-dry',['upgrade','--dry-run']).exitCode;row.dryReadOnly=JSON.stringify(before.files)===JSON.stringify(snap('after-dry').files);
 function inventory(stage){const r=native(stage,['plugin','list','--json']);if(r.exitCode!==0)return {exit:r.exitCode};const value=JSON.parse(r.stdout);const items=Array.isArray(value)?value:value.installed;assert(Array.isArray(items),'inventory schema');const found=items.find(p=>(p.id||p.pluginId)==='lab-neutral@personal'||p.name==='lab-neutral');if(!found)return {exit:0,installed:false};const installed=(found.installPath||found.installedPath||codexInstalledPath)?.replaceAll('<LAB>',root);assert(installed&&path.resolve(installed).startsWith(base+path.sep),'cache stays inside fixture');const probePath=path.join(installed,'scripts/probe.mjs');const skillPath=path.join(installed,'skills/lab-proof/SKILL.md');const execution=run(process.execPath,[probePath,'7'],cwd,ev+'/'+stage+'-probe.json',env);return {exit:0,installed:true,version:found.version,probeExit:execution.exitCode,probe:execution.exitCode===0?JSON.parse(execution.stdout):null,probeSha:existsSync(probePath)?sha(readFileSync(probePath)):null,skillSha:existsSync(skillPath)?sha(readFileSync(skillPath)):null};}
 row.inventory=inventory('inventory');
 if(provider==='claude')row.details=native('details',['plugin','details','lab-neutral@personal']).exitCode;
 else row.inspect=cmd('native-loader',process.execPath,[path.join(root,'scripts/spike-f-import.mjs'),'--inspect',cwd,env.CODEX_HOME,path.join(base,'inspection.json')]).exitCode;
 if(provider==='codex'&&existsSync(path.join(base,'inspection.json'))){const loader=JSON.parse(readFileSync(path.join(base,'inspection.json')));json(ev+'/loader.json',loader);row.loaderStatus=loader.status;row.loaderErrors=loader.errors;}
 for(const p of ['AGENTS.md','CLAUDE.md'])appendFileSync(path.join(cwd,p),'\nSYNTHETIC_USER_KEEP\n');
 const settings=path.join(cwd,'.claude/settings.json');const s=JSON.parse(readFileSync(settings));s.labSyntheticOverride=true;writeFileSync(settings,JSON.stringify(s,null,2)+'\n');
 const deleted='.claude/rules/autonomy.md';unlinkSync(path.join(cwd,deleted));const edited=snap('edited');
 row.upgradeExit=rigRun('rig-upgrade',['upgrade','--yes']).exitCode;
 const updated=snap('after-rig-upgrade');row.rigEditsPreserved=['AGENTS.md','CLAUDE.md','.claude/settings.json'].every(p=>edited.files[p].sha256===updated.files[p]?.sha256);row.deletedStaysRemoved=!existsSync(path.join(cwd,deleted));
 // A genuine synthetic upstream release, not an app-cache refresh masquerading as a release.
 const plugin=path.join(source,'plugins/lab-neutral');for(const p of ['.claude-plugin/plugin.json','.codex-plugin/plugin.json']){const v=JSON.parse(readFileSync(path.join(plugin,p)));v.version='1.0.1';writeFileSync(path.join(plugin,p),JSON.stringify(v,null,2)+'\n');}
 const probe=path.join(plugin,'scripts/probe.mjs');writeFileSync(probe,readFileSync(probe,'utf8').replaceAll('1.0.0','1.0.1'));
 row.marketplaceRefresh=native('marketplace-refresh',['plugin','marketplace',provider==='codex'?'upgrade':'update','personal',...(provider==='codex'?['--json']:[])]).exitCode;
 row.pluginUpdate=provider==='codex'?install().exitCode:native('plugin-update',['plugin','update','lab-neutral@personal','--scope','project','--json']).exitCode;
 row.afterUpdate=inventory('inventory-after-update');row.functionalUpgrade=row.afterUpdate.probe?.version==='1.0.1'&&row.afterUpdate.probe?.squared===49;
 const beforeRemove=snap('before-remove');row.uninstall=native('uninstall',['plugin',provider==='codex'?'remove':'uninstall','lab-neutral@personal',...(provider==='claude'?['--scope','project']:[]),'--json']).exitCode;
 const afterRemove=snap('after-remove');row.rigPayloadPreserved=Object.keys(manifest.files).filter(p=>p!=='.claude/settings.json'&&beforeRemove.files[p]).every(p=>beforeRemove.files[p].sha256===afterRemove.files[p]?.sha256);
 row.userSettingsSurvive=JSON.parse(readFileSync(settings)).labSyntheticOverride===true;row.survivingRig=rigRun('surviving-rig',['upgrade','--dry-run']).exitCode;
 row.finalInventory=inventory('final-inventory');
 row.rigRemovalPreflightWouldBlock=['.claude/settings.json','.codex/hooks.json'].some(p=>existsSync(path.join(cwd,p))&&sha(readFileSync(path.join(cwd,p)))!==manifest.files[p]);
 results.push(row);json(out+'/results.json',results);
}
json(out+'/results.json',results);console.log(JSON.stringify(results,null,2));

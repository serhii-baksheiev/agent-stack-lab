import {readFileSync,readdirSync,statSync} from 'node:fs';
import {json} from './lab-evidence.mjs';
const base='spikes/b-spec-workflows',read=p=>JSON.parse(readFileSync(base+'/evidence/'+p,'utf8'));
const ledger=[],add=(scenario,value,evidence,note)=>ledger.push({scenario,status:value==null?'unverified':value?'passed':'failed',evidence,note});
for(const r of read('acceptance/results.json'))for(const t of r.checks)add(r.candidate+': '+t.name,t.passed,'acceptance/results.json');
const sk=read('spec-kit/result.json');for(const k of ['resumeReadOnly','existingPlanSkipped'])add('Spec Kit '+k,sk[k],'spec-kit/result.json');
for(const r of read('superpowers/results.json')){const ref='superpowers/'+r.provider+'-'+r.order;
 for(const k of ['secondExit','repeatNative','dryExit','rigUpgrade','pluginUpgrade','uninstall','survivingRig'])add(ref+' '+k,r[k]===0,ref);
 for(const k of ['dryReadOnly','editsPreserved','deletedStaysRemoved','bundleUpdated','rigPreserved','settingsEditSurvives'])add(ref+' '+k,r[k],ref);
 add(ref+' native registration removed',!r.final.installed,ref);
}
for(const r of read('bmad/lifecycle-results.json')){const ref='bmad/'+r.order;
 for(const k of ['bmadStatusExit','bmadRepeatExit','bmadRepeat2Exit','rigDryExit','rigUpgradeExit','bmadUpdateExit','bmadUninstallExit','rigSurvivalExit'])add(ref+' '+k,r[k]===0,ref);
 for(const k of ['rigDryReadOnly','rigDeletionPreserved','bmadGeneratedEditPreserved','artifactPreserved'])add(ref+' '+k,r[k],ref);
 add(ref+' settled update byte-idempotent',r.stableRepeatChanged.length===0,ref,'Config/manifest bytes change on each update.');
 add(ref+' Rig shared edits preserved',r.rigSharedEditsPreserved.every(x=>x.preserved),ref);
 const replay=read(ref+'/workflow-replay.json');for(const k of ['rendererExit','spineLintExit','testsExit'])add(ref+' '+k,replay[k]===0,ref+'/workflow-replay.json');
 const survivor=read(ref+'/rig-uninstall-survival.json');add(ref+' Rig files survive native uninstall',survivor.rigClaimedFilesChangedByBmadUninstall.length===0,ref+'/rig-uninstall-survival.json');
}
for(const r of read('openspec/lifecycle-results.json')){const ref='openspec/'+r.order;
 for(const k of ['openspecRepeat','rigDry','rigUpgrade','openspecUpdate','deliveryConfig','deliveryReconcile','survivorRig','survivorSpec'])add(ref+' '+k,r[k]===0,ref);
 for(const k of ['openspecRepeatIdentical','rigDryReadOnly','rigEditsPreserved','rigDeletedStaysRemoved','openspecSkillEditPreserved','rigSurvivesUpdate','claudeSkillRemoved','rigSurvivesReconcile'])add(ref+' '+k,r[k],ref);
 add(ref+' generated deletion stays removed',!r.openspecMissingSkillRestored,ref,'Generated delivery files are reconstructed by update.');
}
const os=read('openspec/workflow/restart-results.json');for(const k of ['instructionsByteIdentical','filesUnchanged'])add('OpenSpec '+k,os[k],'openspec/workflow/restart-results.json');
add('OpenSpec persistent completed tasks',os.applyState==='all_done'&&os.progress.complete===os.progress.total,'openspec/workflow/restart-results.json');
for(const p of ['openspec/current-update.json','openspec/workflow/strict-validation.json','openspec/workflow/archive.json','openspec/workflow/validate-archived.json'])add(p,read(p).exitCode===0,p);
const board=read('board-export/result.json');add('GitHub export creates three synthetic tasks',board.firstCreated===3,'board-export/result.json');add('Immediate GitHub export avoids duplicate',board.repeatCreated===0,'board-export/result.json');add('Closed task replay avoids duplicate',board.closedRepeatCreated===0,'board-export/result.json');add('All synthetic issues closed',board.allCreatedIssuesClosed,'board-export/result.json');add('Task IDs scoped to feature',!board.otherFeatureSameIdsWouldBeSkipped,'board-export/result.json');
for(const name of ['Native Claude model workflow for all candidates','Native Codex automatic skill dispatch','Comparative discovery quality on underspecified real feature','Real human approval interaction','Jira export','BMAD cross-version release upgrade','OpenSpec deterministic complete uninstall','BMAD generated deletion lifecycle','Rig removal with each B component surviving','Cold offline B dependency bootstrap','Live Figma context inside B workflow','Automatic semantic regeneration idempotence','Superpowers incremental value over Spec Kit in native execution','Exact rollback of outside-lab npm scope incident'])add(name,null,'report.md');
json(base+'/scenario-ledger.json',ledger);json(base+'/result.json',{spike:'B',verdict:'ADAPT',confidence:'medium',candidate:'Spec Kit canonical workflow; optional native Superpowers execution skills; BMAD/OpenSpec alternatives, no workflow engine',version:'Spec Kit1.0.6; BMAD6.12.0; OpenSpec1.13.0; Superpowers6.3.0',rigBaseline:'0.9.0',scenariosPassed:ledger.filter(x=>x.status==='passed').length,scenariosFailed:ledger.filter(x=>x.status==='failed').length,scenariosUnverified:ledger.filter(x=>x.status==='unverified').length,estimatedIntegrationDays:2,estimatedAnnualMaintenanceDays:2,qualification:'Workflow prose manually authored; native lifecycle measured. Optional layers are not a proven quality improvement.'});
const measurements=[];function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(dir+'/'+x.name):[dir+'/'+x.name]);}
for(const candidate of ['spec-kit','bmad','openspec','superpowers']){const dir='fixtures/b-workflow/'+candidate,all=files(dir),governance=all.filter(p=>!p.includes('/src/')&&!p.includes('/tests/')&&!p.includes('/test/'));measurements.push({candidate,authoredFiles:all.length,authoredBytes:all.reduce((s,p)=>s+statSync(p).size,0),governanceFiles:governance.length,governanceBytes:governance.reduce((s,p)=>s+statSync(p).size,0),interpretation:'Manual trial output, not generated CLI output; layout/depth choices affect size.'});}
json(base+'/measurements.json',measurements);console.log(JSON.stringify(ledger.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{})));
const dimensions=['userUtility','maturity','maintainability','upstreamActivity','claudeCompatibility','codexCompatibility','reproducibility','upgradeUninstall','absenceOfFileConflicts','teamwork','boardIntegration','security','offlineLocalFirst','integrationCost','annualMaintenanceCost','lowVendorLockIn','licenseSuitability'];
const candidates=[
 ['Spec Kit 1.0.6',[8,8,8,9,7,7,8,6,7,0,3,7,7,8,8,9,10],'A native lifecycle + B helpers/36 shared tests + failed board replay; model quality and teamwork unverified.'],
 ['BMAD 6.12.0',[6,7,6,8,7,7,6,5,6,0,0,6,7,6,6,9,10],'Native dual installation/removal and spine renderer/linter; generated edits overwritten, repeat drift; cross-version upgrade unverified.'],
 ['OpenSpec 1.13.0',[7,8,8,9,7,7,8,4,6,0,0,6,7,7,7,9,10],'Native strict validation/archive/restart and cross-version update; generated edits/deletions overwritten; complete uninstall absent.'],
 ['Superpowers 6.3.0',[6,7,8,8,8,8,8,8,7,0,0,7,7,8,8,9,10],'Actual native dual-provider cache update/removal; manual TDD trial. Incremental semantic quality and native teamwork unverified.']
];
json(base+'/scores.json',{checkedAt:'2026-09-14',scale:'0 worst, 10 best; high cost/lock-in scores mean lower cost/lock-in. Unverified dimensions score 0 only to satisfy numeric matrix; do not aggregate as measured inferiority.',basis:'Engineering judgments in this small synthetic workflow/lifecycle scope, not benchmark measurements.',candidates:candidates.map(([candidate,scores,rationale])=>({candidate,confidence:'medium',dimensions:Object.fromEntries(dimensions.map((d,i)=>[d,{score:scores[i],status:scores[i]===0?'unverified':'engineering-judgment',evidence:rationale}]))}))});

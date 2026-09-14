import {readFileSync, existsSync} from 'node:fs';
import {json} from './lab-evidence.mjs';
const base='spikes/f-native-projection', evidence=process.argv[2] || base+'/evidence';
const read=p=>JSON.parse(readFileSync(evidence+'/'+p,'utf8').replace(/^\uFEFF/,''));
const ledger=[];
const add=(scenario,value,ref,note)=>ledger.push({scenario,status:value===undefined||value===null?'unverified':value?'passed':'failed',evidence:ref,note});
for(const r of read('ruler/results.json')) {
 const ref='ruler/'+r.order, label='Ruler '+r.order+': ';
 add(label+'both components install',!r.blocked,ref);
 if(r.blocked){add(label+'Rig refusal preserves bytes',r.filesUnchangedByRefusal,ref);continue;}
 for(const [key,title] of Object.entries({immediateRepeatIdentical:'immediate repeat is byte-idempotent',stableRepeatIdentical:'settled repeat is byte-idempotent',rigDryReadOnly:'Rig dry-run read-only',rigPreservesUserEdits:'Rig retains overrides',rigDeletedStaysRemoved:'Rig retains deletion',rulerDryReadOnly:'Ruler dry-run read-only',sourceUpdatePropagated:'canonical update propagates',generatedEditPreserved:'generated skill edit retained',projectedDeletePreserved:'projected deletion retained'}))add(label+title,r[key],ref);
 add(label+'second component retains foreign-owned files',r.secondOverwrites?.length===0,ref);
 add(label+'shared context edits retained',r.rulerPreservesSharedEdits?.every(x=>x.preserved),ref);
 add(label+'revert retains Rig-owned files',r.rulerRevertExit===0&&r.rigFilesChangedByRevert?.length===0,ref);
 add(label+'revert removes projected agents',r.rulerRevertExit===0&&r.remainingProjectedAgents?.length===0,ref);
}
const release=read('ruler/release-upgrade/result.json');
add('Ruler real 0.3.43 to 0.3.44 upgrade executes',release.upgradeExit===0,'ruler/release-upgrade/result.json');
for(const key of ['userOverridePreserved','deletedStaysRemoved','canonicalSourcePreserved'])add('Ruler release upgrade: '+key,release[key],'ruler/release-upgrade/result.json');
for(const order of ['rig-first','import-first']) {
 const ref='import/'+order+'/result.json',r=read(ref),o=r.observations;
 add('Codex import '+order+': RPC migration completes',r.status==='completed'&&r.errors.length===0,ref);
 for(const key of ['repeatIdempotent','userEditPreserved','deletedStaysRemoved','sourceUpdated'])add('Codex import '+order+': '+key,o[key],ref,key==='sourceUpdated'?'Migration replay is evaluated as an updater here; no source propagation is a failed updater property.':undefined);
 if(order==='import-first'){add('Codex import-first: Rig installs alongside imported anchors',o.rigInitAfterImportExit===0,ref);add('Codex import-first: refusal preserves bytes',o.rigRefusalReadOnly,ref);}
 else for(const key of ['rigDryRunReadOnly','rigPreservesEditedAgents','rigDeletedStaysRemoved','importedSkillsSurviveRigUpgrade'])add('Codex rig-first: '+key,o[key],ref);
 add('Codex import '+order+': deterministic native migration undo',null,ref,o.uninstall);
}
const native=existsSync(evidence+'/native/results.json')?read('native/results.json'):[];
for(const provider of ['claude','codex'])for(const order of ['rig-first','native-first']){
 const r=native.find(x=>x.provider===provider&&x.order===order),ref='native/'+provider+'-'+order,label='Native '+provider+' '+order+': ';
 if(!r){add(label+'complete lifecycle',null,ref,'Missing completed native scenario; partial command logs are not a pass.');continue;}
 add(label+'both components install',r.secondExit===0,ref);
 if(r.secondExit!==0)continue;
 add(label+'installed synthetic skill executable works',r.inventory?.installed&&r.inventory?.probeExit===0&&r.inventory?.probe?.squared===49,ref,'Direct package script execution, not model-selected skill dispatch.');
 add(label+'marketplace refresh accepts local source',r.marketplaceRefresh===0,ref,'Codex Git-only refresh rejects local source; plugin add is tested separately as successful update route.');
 for(const key of ['dryReadOnly','rigEditsPreserved','deletedStaysRemoved','functionalUpgrade','rigPayloadPreserved','userSettingsSurvive'])add(label+key,r[key],ref,key==='functionalUpgrade'?'Requires executing version 1.0.1; a zero update exit alone is insufficient.':undefined);
 add(label+'native uninstall removes inventory entry',r.uninstall===0&&r.finalInventory?.installed===false,ref);
 add(label+'remaining Rig dry-run executes',r.survivingRig===0,ref);
}
for(const [name,note] of [['Native hook execution and model/effort dispatch','Loader metadata and script execution do not establish model dispatch or hook enforcement.'],['Desktop configuration sync as upgrade mechanism','Documented surface, not executed in this CLI lab.'],['Native package cache user-edit and deletion policy','No claim that disposable caches preserve user edits.'],['Rig uninstall while native package remains functional','Rig 0.9.0 has no native uninstall; no generic remover is claimed here.'],['Cold offline native toolchain bootstrap','Local source operation is not a network-isolated install of all dependencies.'],['Windows full native lifecycle','Hosted Linux is primary lane.']])add(name,null,'report.md',note);
json(base+'/scenario-ledger.json',ledger);
json(base+'/result.json',{spike:'F',verdict:'ADAPT',confidence:'medium',candidate:'Native plugins with bounded Rig lifecycle compatibility; Codex import for migration',version:'Claude Code 2.1.270 / Codex 0.154.0 / Ruler 0.3.44',rigBaseline:'0.9.0',qualification:'conditional; per-provider upgrade and wiring gates apply',scenariosPassed:ledger.filter(x=>x.status==='passed').length,scenariosFailed:ledger.filter(x=>x.status==='failed').length,scenariosUnverified:ledger.filter(x=>x.status==='unverified').length,estimatedIntegrationDays:5,estimatedAnnualMaintenanceDays:6,estimateRangeDays:[4,7],annualEstimateRangeDays:[4,8],ledger:'scenario-ledger.json'});
console.log(JSON.stringify({evidence,...JSON.parse(readFileSync(base+'/result.json','utf8'))},null,2));

import {readFileSync} from 'node:fs';
import {json} from './lab-evidence.mjs';
const base='spikes/c-figma';const read=p=>JSON.parse(readFileSync(base+'/evidence/'+p,'utf8'));
const ledger=[];const add=(scenario,value,evidence,note)=>ledger.push({scenario,status:value==null?'unverified':value?'passed':'failed',evidence,note});
for(const r of read('integrations/results.json')){
 const ref='integrations/'+r.provider+'-'+r.order,label=r.provider+' '+r.order+': ';
 add(label+'both components install',r.secondExit===0,ref);
 add(label+'pinned old bundle installed',r.initial.version==='2.2.108',ref);
 add(label+'repeat native install completes',r.repeatNative===0,ref);
 for(const key of ['dryReadOnly','editsPreserved','deletedStaysRemoved','bundleUpdated','rigPreserved','settingsEditSurvives'])add(label+key,r[key],ref);
 add(label+'native uninstall removes registration',r.uninstall===0&&!r.final.installed,ref);
 add(label+'surviving Rig dry-run succeeds',r.survivingRig===0,ref);
}
const offline=read('offline/result.json');for(const t of offline.tests)add('Synthetic offline: '+t.name,t.passed,'offline/result.json',t.requirement);
const connection=read('integrations/connection.json');add('Unauthenticated endpoint classified as needs-auth',connection.status===401||connection.status===403,'integrations/connection.json','This is a blocked live connection, not successful Figma retrieval.');
for(const name of ['Live Figma design context retrieval','Live Figma screenshot retrieval','Live Figma tokens/components/assets retrieval','Actual Claude session to Codex session handoff','Native Rig removal with Figma plugin surviving','Remote server implementation version pin','Figma bundle redistribution license clearance','Cold offline remote MCP operation'])add(name,null,'report.md');
json(base+'/scenario-ledger.json',ledger);json(base+'/result.json',{spike:'C',verdict:'ADAPT',confidence:'medium',candidate:'Optional official Figma native plugin/MCP installation and connection diagnosis',version:'client bundle 2.2.111 @ d638a5e055e8d95e0394a94350860398cf424b74; hosted backend unpinned',rigBaseline:'0.9.0',qualification:'installation/upgrade/removal proven; live design access and redistribution license unresolved',scenariosPassed:ledger.filter(x=>x.status==='passed').length,scenariosFailed:ledger.filter(x=>x.status==='failed').length,scenariosUnverified:ledger.filter(x=>x.status==='unverified').length,estimatedIntegrationDays:1,estimatedAnnualMaintenanceDays:1});console.log(JSON.stringify(ledger.reduce((a,x)=>(a[x.status]=(a[x.status]||0)+1,a),{})));

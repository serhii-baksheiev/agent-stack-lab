// Bounded two-process stress of Basic Memory; synthetic notes only, no inference.
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,run,json,sha} from './lab-evidence.mjs';
import {McpProbe,mcpText} from './lab-mcp-probe.mjs';
const base=path.join(root,'.lab-runs/e-basic-concurrency-'+Date.now()),out='spikes/e-memory/evidence/basic-concurrency',home=path.join(base,'home'),config=path.join(base,'config'),notes=path.join(base,'alpha');
for(const p of [base,home,notes])mkdirSync(p,{recursive:true});
const cli=path.join(root,'.lab-runs/e-basic-tools/venv',process.platform==='win32'?'Scripts/bm.exe':'bin/bm');assert(existsSync(cli));
const env={HOME:home,USERPROFILE:home,BASIC_MEMORY_CONFIG_DIR:config,BASIC_MEMORY_HOME:path.join(base,'default'),BASIC_MEMORY_AUTO_UPDATE:'false',BASIC_MEMORY_FORCE_LOCAL:'true',BASIC_MEMORY_SEMANTIC_SEARCH_ENABLED:'false',BASIC_MEMORY_LOGFIRE_SEND_TO_LOGFIRE:'false',BASIC_MEMORY_LOG_LEVEL:'ERROR',PYTHONUTF8:'1',PYTHONIOENCODING:'utf-8',HF_HUB_OFFLINE:'1',XDG_CONFIG_HOME:path.join(home,'.config'),XDG_CACHE_HOME:path.join(home,'.cache'),APPDATA:path.join(home,'AppData/Roaming'),LOCALAPPDATA:path.join(home,'AppData/Local')};
for(const k of Object.keys(process.env))if(/TOKEN|SECRET|PASSWORD|API_KEY|AUTH|^BASIC_MEMORY_|^ANTHROPIC_|^OPENAI_/i.test(k)&&!(k in env))env[k]='';
const version=run(cli,['--version'],base,out+'/version.json',env);assert.equal(version.exitCode,0);assert(version.stdout.includes('0.23.2'));
assert.equal(run(cli,['project','add','--help'],base,out+'/project-help.json',env).exitCode,0);
assert.equal(run(cli,['project','add','alpha',notes,'--local'],base,out+'/project-add.json',env).exitCode,0);
const clients=[0,1].map(i=>new McpProbe(cli,['mcp','--project','alpha'],base,env,out+`/writer-${i}-protocol.json`));
const payload=r=>{if(r?.structuredContent)return r.structuredContent.result??r.structuredContent;try{return JSON.parse(mcpText(r));}catch{return {};}};
let seq=0;const call=async(c,name,args)=>{const start=Date.now(),r=await c.tool(name,args);json(out+`/calls/${seq++}-${name}.json`,{name,args,response:r,durationMs:Date.now()-start});return r;};
const successful=(r,kind)=>{const p=payload(r);return !r.isError&&!p.error&&typeof p.file_path==='string'&&typeof p.permalink==='string'&&(kind==='append'?p.operation==='append':['created','updated'].includes(p.action));};
const resolveNote=relative=>{const file=path.resolve(notes,relative);assert(file.startsWith(notes+path.sep),'Native note path escapes synthetic project');return file;};
// Markdown is an asynchronously materialized projection in 0.23.2. Absence or
// lag here is recorded separately from the MCP-visible logical state.
const pollProjection=async(file,markers)=>{const start=Date.now();let content=null,polls=0;do{polls++;try{content=readFileSync(file,'utf8');}catch(e){if(e.code!=='ENOENT')throw e;content=null;}if(content!==null&&markers.every(m=>content.includes(m)))return {converged:true,elapsedMs:Date.now()-start,polls,sha256:sha(Buffer.from(content)),markers:markers.filter(m=>content.includes(m))};if(Date.now()-start>=15000)break;await new Promise(resolve=>setTimeout(resolve,250));}while(true);return {converged:false,elapsedMs:Date.now()-start,polls,exists:content!==null,sha256:content===null?null:sha(Buffer.from(content)),markers:markers.filter(m=>content?.includes(m))};};
const readState=async(client,identifier)=>{const r=await call(client,'read_note',{project:'alpha',identifier});assert(!r.isError&&!payload(r).error,'Verification read failed');return mcpText(r);};
const result={version:'0.23.2',scriptSha256:sha(readFileSync(import.meta.filename)),probeSha256:sha(readFileSync(path.join(root,'scripts/lab-mcp-probe.mjs'))),platform:process.platform,node:process.version,runDirectory:path.relative(root,base),rounds:[],method:'8 rounds; two reused independent MCP processes. Each round seeds one approximately 14KB note, sends two append requests together, checks MCP-visible state immediately after both acknowledgements and through both readers after a bounded 15-second Markdown projection poll; seed and distinct-note projection polls have the same bound. No write serialization or backend modification.',scope:'Observation of this schedule/fixture only; passing rounds do not establish race freedom. lostAcknowledgedMarkers means absent through both MCP readers at the bounded final observation, not proven permanent loss. Projection timeouts are separate.'};
try{
 const handshakes=await Promise.all(clients.map(c=>c.start()));json(out+'/handshakes.json',handshakes);
 const schema=await clients[0].request('tools/list');json(out+'/tools.json',schema);for(const n of ['write_note','edit_note','read_note'])assert(schema.result.tools.some(x=>x.name===n));
 for(let round=0;round<8;round++){
  const seed=await call(clients[0],'write_note',{project:'alpha',title:`Concurrent round ${round}`,directory:'same-note',content:'SYNTHETIC BASE\n'+'Synthetic baseline padding.\n'.repeat(512),output_format:'json'});assert(successful(seed,'write'),'Cannot seed concurrent probe');
  const meta=payload(seed),identifier=meta.permalink||meta.file_path,file=resolveNote(meta.file_path);
  const seedRead=await readState(clients[0],identifier);assert(seedRead.includes('SYNTHETIC BASE')&&seedRead.includes('Synthetic baseline padding.'),'Seed acknowledgement lacks corresponding MCP content');
  const seedProjection=await pollProjection(file,['SYNTHETIC BASE\nSynthetic baseline padding.']);
  const markers=['A','B'].map(writer=>`SYNTHETIC_ROUND_${round}_WRITER_${writer}_END`),startedAt=new Date().toISOString();
  const writes=await Promise.all(clients.map((c,i)=>call(c,'edit_note',{project:'alpha',identifier,operation:'append',content:'\n'+markers[i]+'\n',output_format:'json'})));
  const returned=await readState(clients[0],identifier),acknowledged=markers.filter((m,i)=>successful(writes[i],'append')),retrieved=markers.filter(m=>returned.includes(m));
  const finalProjection=await pollProjection(file,acknowledged);
  const finalReads=await Promise.all(clients.map(c=>readState(c,identifier))),finalRetrieved=finalReads.map(text=>markers.filter(m=>text.includes(m)));
  const controls=await Promise.all(clients.map((c,i)=>call(c,'write_note',{project:'alpha',title:`Distinct round ${round} writer ${i}`,directory:'distinct',content:`SYNTHETIC_DISTINCT_${round}_${i}_END`,output_format:'json'})));
  const controlRows=await Promise.all(controls.map(async(r,i)=>{const p=payload(r),ok=successful(r,'write'),marker=`SYNTHETIC_DISTINCT_${round}_${i}_END`;let readable=false,projection=null;if(ok){readable=(await readState(clients[1-i],p.permalink||p.file_path)).includes(marker);projection=await pollProjection(resolveNote(p.file_path),[marker]);}return {writer:i,acknowledged:ok,readable,projection};}));
  result.rounds.push({round,startedAt,seedBytes:Buffer.byteLength('SYNTHETIC BASE\n'+'Synthetic baseline padding.\n'.repeat(512)),filePath:meta.file_path,seedProjection,finalProjection,markers,acknowledged,retrieved,finalRetrieved,immediatelyMissingAcknowledgedMarkers:acknowledged.filter(m=>!retrieved.includes(m)),lostAcknowledgedMarkers:acknowledged.filter(m=>finalRetrieved.every(found=>!found.includes(m))),readersDisagree:markers.some(m=>finalRetrieved[0].includes(m)!==finalRetrieved[1].includes(m)),writeErrors:writes.map((r,i)=>successful(r,'append')?null:{writer:i,isError:!!r.isError,payload:payload(r)}).filter(Boolean),distinctControls:controlRows});
  json(out+'/result.json',result);
 }
 result.totalAcknowledgedAppends=result.rounds.reduce((n,r)=>n+r.acknowledged.length,0);result.totalLostAcknowledgedMarkers=result.rounds.reduce((n,r)=>n+r.lostAcknowledgedMarkers.length,0);result.roundsWithLoss=result.rounds.filter(r=>r.lostAcknowledgedMarkers.length).length;result.allDistinctControlsPass=result.rounds.every(r=>r.distinctControls.every(x=>x.acknowledged&&x.readable));result.projectionTimeouts=result.rounds.reduce((n,r)=>n+Number(!r.seedProjection.converged)+Number(!r.finalProjection.converged)+r.distinctControls.filter(x=>x.projection&&!x.projection.converged).length,0);result.roundsWithReaderDisagreement=result.rounds.filter(r=>r.readersDisagree).length;
}finally{await Promise.all(clients.map(c=>c.close()));json(out+'/result.json',result);}
assert.equal(result.rounds.length,8);console.log(JSON.stringify({rounds:result.rounds.length,acknowledged:result.totalAcknowledgedAppends,lost:result.totalLostAcknowledgedMarkers,distinctPass:result.allDistinctControlsPass}));

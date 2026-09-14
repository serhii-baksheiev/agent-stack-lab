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
const result={version:'0.23.2',scriptSha256:sha(readFileSync(import.meta.filename)),probeSha256:sha(readFileSync(path.join(root,'scripts/lab-mcp-probe.mjs'))),platform:process.platform,node:process.version,runDirectory:path.relative(root,base),rounds:[],method:'8 rounds; two reused independent MCP processes. Each round seeds one approximately 14KB note, sends two append requests together, verifies acknowledged markers through both disk and MCP read; separate concurrent-note creation controls follow. No synthetic delays or backend modification.',scope:'Observation of this schedule/fixture only; passing rounds do not establish race freedom.'};
try{
 const handshakes=await Promise.all(clients.map(c=>c.start()));json(out+'/handshakes.json',handshakes);
 const schema=await clients[0].request('tools/list');json(out+'/tools.json',schema);for(const n of ['write_note','edit_note','read_note'])assert(schema.result.tools.some(x=>x.name===n));
 for(let round=0;round<8;round++){
  const seed=await call(clients[0],'write_note',{project:'alpha',title:`Concurrent round ${round}`,directory:'same-note',content:'SYNTHETIC BASE\n'+'Synthetic baseline padding.\n'.repeat(512),output_format:'json'});assert(successful(seed,'write'),'Cannot seed concurrent probe');
  const meta=payload(seed),identifier=meta.permalink||meta.file_path,file=resolveNote(meta.file_path),seedBytes=readFileSync(file);assert(seedBytes.toString('utf8').includes('SYNTHETIC BASE\nSynthetic baseline padding.'),'Seed acknowledgement lacks corresponding disk content');const before=sha(seedBytes);
  const markers=['A','B'].map(writer=>`SYNTHETIC_ROUND_${round}_WRITER_${writer}_END`),startedAt=new Date().toISOString();
  const writes=await Promise.all(clients.map((c,i)=>call(c,'edit_note',{project:'alpha',identifier,operation:'append',content:'\n'+markers[i]+'\n',output_format:'json'})));
  const read=await call(clients[0],'read_note',{project:'alpha',identifier});assert(!read.isError,'Verification read failed');
  const disk=readFileSync(file,'utf8'),returned=mcpText(read),acknowledged=markers.filter((m,i)=>successful(writes[i],'append')),persisted=markers.filter(m=>disk.includes(m)),retrieved=markers.filter(m=>returned.includes(m));
  const controls=await Promise.all(clients.map((c,i)=>call(c,'write_note',{project:'alpha',title:`Distinct round ${round} writer ${i}`,directory:'distinct',content:`SYNTHETIC_DISTINCT_${round}_${i}_END`,output_format:'json'})));
  const controlRows=[];for(let i=0;i<controls.length;i++){const p=payload(controls[i]),ok=successful(controls[i],'write'),marker=`SYNTHETIC_DISTINCT_${round}_${i}_END`;let stored=false,readable=false;if(ok){stored=readFileSync(resolveNote(p.file_path),'utf8').includes(marker);const r=await call(clients[1-i],'read_note',{project:'alpha',identifier:p.permalink||p.file_path});readable=!r.isError&&mcpText(r).includes(marker);}controlRows.push({writer:i,acknowledged:ok,stored,readable});}
  result.rounds.push({round,startedAt,seedBytes:Buffer.byteLength('SYNTHETIC BASE\n'+'Synthetic baseline padding.\n'.repeat(512)),filePath:meta.file_path,beforeSha256:before,afterSha256:sha(readFileSync(file)),markers,acknowledged,persisted,retrieved,lostAcknowledgedMarkers:acknowledged.filter(m=>!persisted.includes(m)),mcpDiskAgree:markers.every(m=>disk.includes(m)===returned.includes(m)),writeErrors:writes.map((r,i)=>successful(r,'append')?null:{writer:i,isError:!!r.isError,payload:payload(r)}).filter(Boolean),distinctControls:controlRows});
  json(out+'/result.json',result);
 }
 result.totalAcknowledgedAppends=result.rounds.reduce((n,r)=>n+r.acknowledged.length,0);result.totalLostAcknowledgedMarkers=result.rounds.reduce((n,r)=>n+r.lostAcknowledgedMarkers.length,0);result.roundsWithLoss=result.rounds.filter(r=>r.lostAcknowledgedMarkers.length).length;result.allDistinctControlsPass=result.rounds.every(r=>r.distinctControls.every(x=>x.acknowledged&&x.stored&&x.readable));result.allReadsAgreeWithDisk=result.rounds.every(r=>r.mcpDiskAgree);
}finally{await Promise.all(clients.map(c=>c.close()));json(out+'/result.json',result);}
assert.equal(result.rounds.length,8);console.log(JSON.stringify({rounds:result.rounds.length,acknowledged:result.totalAcknowledgedAppends,lost:result.totalLostAcknowledgedMarkers,distinctPass:result.allDistinctControlsPass}));

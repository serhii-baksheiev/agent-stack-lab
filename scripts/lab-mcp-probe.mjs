// Test-only JSON-RPC stdio probe. No provider SDK or product runtime.
import {spawn} from 'node:child_process';
import {json} from './lab-evidence.mjs';
export class McpProbe {
 constructor(command,args,cwd,env,log){this.log=log;this.events=[];this.pending=new Map();this.id=0;this.stderr='';this.buffer='';this.child=spawn(command,args,{cwd,env:{...process.env,...env},stdio:['pipe','pipe','pipe'],windowsHide:true});this.started=Date.now();
 this.child.stderr.on('data',b=>{this.stderr+=b.toString();});
 this.child.stdout.on('data',b=>{this.buffer+=b.toString();let at;while((at=this.buffer.indexOf('\n'))>=0){const line=this.buffer.slice(0,at);this.buffer=this.buffer.slice(at+1);if(!line.trim())continue;let m;try{m=JSON.parse(line);}catch{this.events.push({nonJsonStdout:line});continue;}this.events.push({received:m});if(this.pending.has(m.id)){const p=this.pending.get(m.id);clearTimeout(p.timer);this.pending.delete(m.id);p.resolve(m);}}});
 this.child.on('error',e=>this.fail(e));this.child.on('exit',(code,signal)=>{this.exit={code,signal};this.fail(new Error('MCP process exited '+code+' '+signal));});
 }
 fail(error){for(const p of this.pending.values()){clearTimeout(p.timer);p.reject(error);}this.pending.clear();}
 request(method,params={}){const m={jsonrpc:'2.0',id:++this.id,method,params};this.events.push({sent:m});return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{this.pending.delete(m.id);reject(new Error('MCP timeout '+method));},90000);this.pending.set(m.id,{resolve,reject,timer});this.child.stdin.write(JSON.stringify(m)+'\n');});}
 notify(method,params={}){const m={jsonrpc:'2.0',method,params};this.events.push({sent:m});this.child.stdin.write(JSON.stringify(m)+'\n');}
 async start(){const r=await this.request('initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'synthetic-lab-probe',version:'1.0.0'}});if(r.error)throw Error(JSON.stringify(r.error));this.notify('notifications/initialized');return r.result;}
 async tool(name,args){const r=await this.request('tools/call',{name,arguments:args});return r.error?{isError:true,error:r.error}:r.result;}
 save(){json(this.log,{command:this.child.spawnargs,durationMs:Date.now()-this.started,events:this.events,stderr:this.stderr,processExit:this.exit??null});}
 async close(){this.save();this.child.stdin.end();if(this.exit===undefined)await Promise.race([new Promise(resolve=>this.child.once('exit',resolve)),new Promise(resolve=>setTimeout(()=>{if(this.exit===undefined)this.child.kill();resolve();},1500))]);this.save();}
}
export function mcpText(result){return (result?.content||[]).filter(x=>x.type==='text').map(x=>x.text).join('\n');}

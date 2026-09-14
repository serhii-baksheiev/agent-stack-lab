import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
export const root = process.cwd();
export const sha = b => createHash('sha256').update(b).digest('hex');
export function json(file, data) { mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, JSON.stringify(data, null, 2)+'\n'); }
export function run(command, args, cwd, log) {
  const start = Date.now();
  // Callers supply only fixed laboratory arguments. Never pass credentials here.
  const r = spawnSync(command, args, { cwd, encoding:'utf8', shell: process.platform === 'win32' && /^(npm|npx)$/.test(command), timeout:180000, env:{...process.env, NO_COLOR:'1', GIT_TERMINAL_PROMPT:'0'} });
  const clean = s => (s || '').split(root).join('<LAB>').replace(/\x1b\[[0-9;]*m/g, '');
  const result = {command:[command,...args], cwd:path.relative(root,cwd).replaceAll('\\','/'), startedAt:new Date(start).toISOString(), durationMs:Date.now()-start, exitCode:r.status, error:r.error?.message, stdout:clean(r.stdout), stderr:clean(r.stderr)};
  if(log) json(log,result);
  return result;
}
export function snapshot(cwd, output) {
  const files = {};
  function walk(dir) { for(const n of readdirSync(dir)) { if(['.git','node_modules','.venv','__pycache__'].includes(n)) continue; const p=path.join(dir,n),s=statSync(p); if(s.isDirectory()) walk(p); else {const b=readFileSync(p); files[path.relative(cwd,p).replaceAll('\\','/')]={size:b.length,sha256:sha(b)};} } }
  walk(cwd);
  const data={files, count:Object.keys(files).length,bytes:Object.values(files).reduce((n,f)=>n+f.size,0),status:run('git',['status','--short','--untracked-files=all'],cwd).stdout,diff:run('git',['diff','--no-ext-diff','HEAD'],cwd).stdout};
  json(output,data); return data;
}

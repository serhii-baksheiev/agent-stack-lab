// Source/CLI/unit evidence only; never starts a model or contacts a task board.
import {mkdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {root,run,json,sha} from './lab-evidence.mjs';
const base=path.join(root,'.lab-runs/d-orchestrators-'+Date.now()),out='spikes/d-team-orchestration/evidence/orchestrators',home=path.join(base,'home');
if(process.env.LAB_POSTGRES_URL)assert.equal(process.env.LAB_POSTGRES_URL,'postgresql+psycopg2://synthetic_lab:synthetic_lab_only@localhost:5432/synthetic_orchestration','Only the disposable workflow PostgreSQL service is allowed');
for(const p of [base,home,path.join(base,'tmp')])mkdirSync(p,{recursive:true});
writeFileSync(path.join(base,'package.json'),JSON.stringify({private:true,name:'synthetic-d-orchestrators'}));
const env={HOME:home,USERPROFILE:home,XDG_CONFIG_HOME:path.join(home,'.config'),XDG_CACHE_HOME:path.join(home,'.cache'),APPDATA:path.join(home,'AppData/Roaming'),LOCALAPPDATA:path.join(home,'AppData/Local'),CODEX_HOME:path.join(home,'codex'),CLAUDE_CONFIG_DIR:path.join(home,'claude'),GIT_CONFIG_GLOBAL:path.join(home,'gitconfig'),GIT_CONFIG_NOSYSTEM:'1',TMPDIR:path.join(base,'tmp'),TMP:path.join(base,'tmp'),TEMP:path.join(base,'tmp'),MIX_HOME:path.join(base,'mix'),HEX_HOME:path.join(base,'hex'),MIX_ENV:'test',UV_CACHE_DIR:path.join(base,'uv-cache'),UV_TOOL_DIR:path.join(base,'uv-tools'),UV_PYTHON_INSTALL_DIR:path.join(base,'python'),npm_config_cache:path.join(base,'npm-cache')};
writeFileSync(env.GIT_CONFIG_GLOBAL,'');for(const k of Object.keys(process.env))if(/TOKEN|SECRET|PASSWORD|API_KEY|AUTH|^OPENAI_|^ANTHROPIC_|^SYMPHONY_|^OH_|^AUTOMATION_/i.test(k)&&!(k in env))env[k]='';
env.MIX_HOME=path.join(root,'.lab-runs/d-orchestrator-cache/mix');env.HEX_HOME=path.join(root,'.lab-runs/d-orchestrator-cache/hex');
let seq=0;function cmd(label,exe,args,cwd=base){const r=run(exe,args,cwd,out+`/commands/${seq++}-${label}.json`,env);assert.equal(r.exitCode,0,`${label}: ${r.stderr} ${r.error||''}`);return r;}
const pins={symphony:{repo:'openai/symphony',tag:'v0.0.2',commit:'653f8b3cc476db03420479ba6f95b2ed7281c401'},canvas:{repo:'OpenHands/OpenHands',tag:'v1.18.0',commit:'9120ff6cbbe23640f0e475661e5a9c9729cdbf1f'},automation:{repo:'OpenHands/automation',tag:'1.11.1',commit:'bc625068a9028849c32760e4fc9f66ec12b70872'},codex:{repo:'openai/codex',tag:'rust-v0.154.0',commit:'6b9826e3aa83b1a5947db50f4332cb9c65f1b340'}};
const evidence={checkedAt:new Date().toISOString(),scenarioSha:run('git',['rev-parse','HEAD'],root).stdout.trim(),scriptSha256:sha(readFileSync(import.meta.filename)),platform:process.platform,node:process.version,runDirectory:path.relative(root,base),pins,sources:[],checks:[],unverified:['Native model team execution/recall','Distributed external issue/PR fencing by a ready orchestrator','PostgreSQL runtime contention/crash recovery','Cross-version data upgrade and package uninstall survival']};
async function fetchBytes(url){const r=await fetch(url,{headers:{'User-Agent':'synthetic-agent-stack-lab'}});assert(r.ok,`${r.status} ${url}`);return Buffer.from(await r.arrayBuffer());}
async function source(name,file){const p=pins[name],url=`https://raw.githubusercontent.com/${p.repo}/${p.commit}/${file}`,b=await fetchBytes(url),dest=path.join(base,name,file);mkdirSync(path.dirname(dest),{recursive:true});writeFileSync(dest,b);evidence.sources.push({candidate:name,file,url,sha256:sha(b),bytes:b.length});return dest;}
for(const [name,p]of Object.entries(pins)){const metadata=JSON.parse(await fetchBytes(`https://api.github.com/repos/${p.repo}`)),release=JSON.parse(await fetchBytes(`https://api.github.com/repos/${p.repo}/releases/latest`)),tag=JSON.parse(await fetchBytes(`https://api.github.com/repos/${p.repo}/commits/${p.tag}`));assert.equal(tag.sha,p.commit);json(out+`/${name}-metadata.json`,{repository:{url:metadata.html_url,license:metadata.license,pushedAt:metadata.pushed_at,defaultBranch:metadata.default_branch},latestRelease:{tag:release.tag_name,publishedAt:release.published_at},pinnedCommit:tag.sha,pinnedCommitDate:tag.commit.committer.date});await source(name,'LICENSE');}
const files={symphony:['SPEC.md','elixir/mix.exs','elixir/mix.lock','elixir/lib/symphony_elixir/orchestrator.ex','elixir/lib/symphony_elixir/agent_runtime_supervisor.ex','elixir/test/symphony_elixir/core_test.exs'],canvas:['package.json','config/defaults.json','bin/agent-canvas.mjs','scripts/dev-with-automation.mjs'],automation:['pyproject.toml','openhands/automation/scheduler.py','openhands/automation/dispatcher.py','openhands/automation/watchdog.py','openhands/automation/utils/run.py','tests/test_scheduler.py','tests/test_dispatcher.py'],codex:['codex-rs/core/src/agent/control.rs','codex-rs/core/src/agent/control/residency.rs','codex-rs/core/src/tools/handlers/multi_agents_v2/followup_task.rs']};
for(const [name,paths]of Object.entries(files))for(const p of paths)await source(name,p);
// These are unmodified pinned upstream CLI files; dependencies/backend are not installed.
for(const flag of ['--help','--version','--info'])cmd('canvas-'+flag.slice(2),process.execPath,[path.join(base,'canvas/bin/agent-canvas.mjs'),flag]);
evidence.checks.push({name:'Canvas pinned source CLI help/version/info',passed:true,qualification:'No backend launch or package-install claim; native upstream entrypoint uses only Node builtins on these paths.'});
const pythonSource=String.raw`import ast, asyncio, json, sys, os
from datetime import datetime
from sqlalchemy import create_engine, select, Integer, Boolean, DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from sqlalchemy.dialects import postgresql
class Base(DeclarativeBase): pass
class Automation(Base):
    __tablename__='synthetic_automations'
    id: Mapped[int]=mapped_column(Integer,primary_key=True)
    enabled: Mapped[bool]=mapped_column(Boolean)
    deleted_at: Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
    last_polled_at: Mapped[datetime|None]=mapped_column(DateTime,nullable=True)
tree=ast.parse(open(sys.argv[1],encoding='utf8').read())
fn=next(n for n in tree.body if isinstance(n,ast.AsyncFunctionDef) and n.name=='_fetch_enabled_automations')
module=ast.Module(body=[ast.ImportFrom(module='__future__',names=[ast.alias(name='annotations')],level=0),fn],type_ignores=[])
ast.fix_missing_locations(module)
sqlite=True
namespace={'Automation':Automation,'select':select,'using_sqlite':lambda:sqlite}
exec(compile(module,sys.argv[1],'exec'),namespace)
engine=create_engine('sqlite:///'+sys.argv[2]);Base.metadata.create_all(engine)
with Session(engine) as session:
    session.add(Automation(id=1,enabled=True));session.commit()
class Adapter:
    def __init__(self,s):self.s=s;self.sql=None
    async def execute(self,q):
        self.sql=str(q.compile(dialect=postgresql.dialect()))
        return self.s.execute(q)
async def main():
    global sqlite
    observed={}
    with Session(engine) as a, Session(engine) as b:
        x,y=Adapter(a),Adapter(b)
        ra=await namespace['_fetch_enabled_automations'](x,10,datetime(2026,1,1))
        rb=await namespace['_fetch_enabled_automations'](y,10,datetime(2026,1,1))
        idsA=[r.id for r in ra];idsB=[r.id for r in rb]
        assert idsA==idsB==[1]
        assert 'FOR UPDATE' not in x.sql
        sqlite=False
        await namespace['_fetch_enabled_automations'](x,10,datetime(2026,1,1))
        assert 'FOR UPDATE SKIP LOCKED' in x.sql
        observed={'nativeFunction':'_fetch_enabled_automations','functionUnmodifiedAst':True,'syntheticOrmModel':True,'sqliteTwoSessionsBothSeeSameEligibleRow':True,'postgresqlCompiledSql':x.sql,'postgresqlRuntimeTested':False,'qualification':'Native fetch function only, not full scheduler/dispatcher. Synthetic ORM model and database. No external issue/worktree/PR fencing claim.'}
    if os.environ.get('LAB_POSTGRES_URL'):
        pg=create_engine(os.environ['LAB_POSTGRES_URL'])
        Base.metadata.create_all(pg)
        with Session(pg) as seed:
            seed.add(Automation(id=1,enabled=True));seed.commit()
        with Session(pg) as a, Session(pg) as b:
            x,y=Adapter(a),Adapter(b)
            first=await namespace['_fetch_enabled_automations'](x,10,datetime(2026,1,1))
            second=await namespace['_fetch_enabled_automations'](y,10,datetime(2026,1,1))
            assert [r.id for r in first]==[1] and second==[]
            a.rollback()
            released=await namespace['_fetch_enabled_automations'](y,10,datetime(2026,1,1))
            assert [r.id for r in released]==[1]
            observed.update(postgresqlRuntimeTested=True,secondTransactionSkippedLockedRow=True,rollbackReleasedClaim=True)
        with pg.connect() as c: observed['postgresqlVersion']=c.exec_driver_sql('SELECT version()').scalar()
        # Synthetic service database is ephemeral; do not delete any external data.
    print(json.dumps(observed))
asyncio.run(main())
`;
writeFileSync(path.join(base,'probe.py'),pythonSource);
const uv=process.platform==='win32'&&existsSync(path.join(root,'.lab-runs/e-bootstrap/venv/Scripts/uv.exe'))?path.join(root,'.lab-runs/e-bootstrap/venv/Scripts/uv.exe'):'uv',venv=path.join(base,'venv'),python=path.join(venv,process.platform==='win32'?'Scripts/python.exe':'bin/python');
cmd('uv-version',uv,['--version']);cmd('venv',uv,['venv',venv]);cmd('sqlalchemy-install',uv,['pip','install','--python',python,'SQLAlchemy==2.0.43',...(process.env.LAB_POSTGRES_URL?['psycopg2-binary==2.9.10']:[])]);cmd('freeze',uv,['pip','freeze','--python',python]);
const probe=cmd('native-scheduler-fetch',python,[path.join(base,'probe.py'),path.join(base,'automation/openhands/automation/scheduler.py'),path.join(base,'synthetic.db')]);json(out+'/automation-query-probe.json',JSON.parse(probe.stdout));
if(JSON.parse(probe.stdout).postgresqlRuntimeTested){evidence.checks.push({name:'Native PostgreSQL fetch skips locked row and rollback releases it',passed:true,qualification:'Two real database sessions; unmodified fetch function with synthetic ORM/table only.'});evidence.unverified=evidence.unverified.filter(x=>x!=='PostgreSQL runtime contention/crash recovery');evidence.unverified.push('Full PostgreSQL scheduler/dispatcher crash recovery');}
evidence.checks.push({name:'Native scheduler SQLite selection and PostgreSQL query construction',passed:true,qualification:'Unmodified AST function, synthetic ORM table; full backend and PostgreSQL runtime not exercised.'});
json(out+'/result.json',evidence);
if(process.argv.includes('--symphony-tests')){
 const archive=path.join(base,'symphony.tar.gz'),bytes=await fetchBytes(`https://codeload.github.com/openai/symphony/tar.gz/${pins.symphony.commit}`);writeFileSync(archive,bytes);evidence.symphonyArchiveSha256=sha(bytes);
 const checkout=path.join(base,'symphony-tests');mkdirSync(checkout);cmd('extract-symphony','tar',['-xzf',archive,'--strip-components=1','-C',checkout]);const cwd=path.join(checkout,'elixir');
 cmd('elixir-version','elixir',['--version'],cwd);cmd('mix-hex','mix',['local.hex','--force'],cwd);cmd('mix-rebar','mix',['local.rebar','--force'],cwd);cmd('mix-deps','mix',['deps.get'],cwd);
 const tests='test/symphony_elixir/core_test.exs';const test=cmd('upstream-reconciliation-tests','mix',['test',...[351,474,803,897,928,956,1022,1062,1102,1141].map(n=>tests+':'+n),'--seed','0'],cwd);
 evidence.checks.push({name:'Symphony upstream restart/reconciliation/retry subset',passed:!test.stdout.includes('0 tests'),qualification:'Memory tracker and synthetic worker hooks, no model/board calls; one runtime supervisor, not competing controllers.'});assert(evidence.checks.at(-1).passed);
 evidence.mixLockSha256=sha(readFileSync(path.join(cwd,'mix.lock')));
}else evidence.unverified.push('Symphony runtime unit subset (requires --symphony-tests and Elixir1.19/OTP28)');
json(out+'/result.json',evidence);console.log(JSON.stringify({checks:evidence.checks,unverified:evidence.unverified}));

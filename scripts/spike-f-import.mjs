// Synthetic, no-model native import probe. No profile or session migration.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve, join, relative } from 'node:path';
import { createHash } from 'node:crypto';

const root = resolve(import.meta.dirname, '..');
const inspect = process.argv[2] === '--inspect';
const rigOrder = process.argv[2] === '--rig-order' ? process.argv[3] : null;
if (rigOrder && !['rig-first', 'import-first'].includes(rigOrder)) throw new Error('Invalid Rig order');
function fixturePath(value) {
  if (!value) throw new Error('Missing fixture path');
  const path = resolve(value);
  const rel = relative(join(root, '.lab-runs'), path).replaceAll('\\', '/');
  if (!/^f-[^/]+\/.+/.test(rel) || rel.includes('..')) throw new Error('Paths must stay under .lab-runs/f-*/');
  return path;
}
const evidence = join(root, 'spikes/f-native-projection/evidence/import', rigOrder ?? 'standalone');
const run = join(root, '.lab-runs', `f-import-${Date.now()}`);
const fixture = inspect ? fixturePath(process.argv[3]) : join(run, 'repo');
const childHome = join(run, 'home');
const codexHome = inspect ? fixturePath(process.argv[4]) : join(childHome, '.codex');
const inspectOutput = inspect ? fixturePath(process.argv[5]) : null;
const entry = join(root, '.lab-runs/f-tools/node_modules/@openai/codex/bin/codex.js');
mkdirSync(evidence, { recursive: true });
mkdirSync(fixture, { recursive: true });
mkdirSync(join(childHome, '.codex'), { recursive: true });
const env = Object.fromEntries(Object.entries(process.env).filter(([key]) =>
  !/(TOKEN|SECRET|PASSWORD|API_KEY|AUTH|CODEX|CLAUDE|ANTHROPIC|OPENAI)/i.test(key)));
// Child-only homes prevent fallback discovery from touching the operator profile.
Object.assign(env, { HOME: childHome, USERPROFILE: childHome,
  APPDATA: join(childHome, 'AppData/Roaming'), LOCALAPPDATA: join(childHome, 'AppData/Local'),
  CODEX_HOME: codexHome, CLAUDE_CONFIG_DIR: join(childHome, '.claude'),
  XDG_CONFIG_HOME: join(childHome, '.config'), XDG_DATA_HOME: join(childHome, '.local/share'),
  XDG_CACHE_HOME: join(childHome, '.cache'), GIT_CONFIG_NOSYSTEM: '1', GIT_CONFIG_GLOBAL: join(run, 'empty-gitconfig') });
writeFileSync(env.GIT_CONFIG_GLOBAL, '');
const result = { schemaVersion: 1, codexVersion: '0.154.0', startedAt: new Date().toISOString(),
  scenario: 'synthetic Claude project import, repeat, user edit and deletion',
  authenticationUsed: false, status: 'running', observations: {}, errors: [] };
result.rigOrder = rigOrder;
const transcript = [];
const snapshots = [];
function write(path, body) { mkdirSync(resolve(path, '..'), { recursive: true }); writeFileSync(path, body); }
function rig(stage, args) {
  const packageRoot = join(root, '.lab-runs/f-ruler-package/package');
  const pkg = JSON.parse(readFileSync(join(packageRoot, 'package.json')));
  if (pkg.name !== 'create-agent-rig' || pkg.version !== '0.9.0') throw new Error('Wrong baseline package');
  const cli = join(packageRoot, typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin)[0]);
  const command = spawnSync(process.execPath, [cli, ...args], { cwd: fixture, env, encoding: 'utf8', timeout: 60000, maxBuffer: 16 * 1024 * 1024 });
  result[stage] = { args, exitCode: command.status, error: command.error?.message ?? null, stdout: command.stdout, stderr: command.stderr };
  snapshot(stage);
  if (command.error || command.status === null) throw new Error(`Rig command collector failed: ${stage}`);
  return command.status;
}
function snapshot(stage) {
  const files = [];
  function walk(dir) { for (const ent of readdirSync(dir, { withFileTypes: true })) {
    if (ent.name === '.git') continue;
    const path = join(dir, ent.name);
    if (ent.isDirectory()) walk(path);
    else if (ent.isFile()) { const data = readFileSync(path); const filePath = relative(fixture, path).replaceAll('\\', '/');
      files.push({ path: filePath, bytes: data.length,
      sha256: createHash('sha256').update(data).digest('hex'), text: /^(AGENTS.md|CLAUDE.md|\.agents\/skills\/(lab-import|source-command-lab-command)\/SKILL.md)$/.test(filePath) ? data.toString('utf8') : '' }); }
  } }
  walk(fixture);
  const git = spawnSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], { cwd: fixture, env, encoding: 'utf8', timeout: 15000 });
  const gitStatusCommand = { exitCode: git.status, error: git.error?.message ?? null, stdout: git.stdout, stderr: git.stderr };
  snapshots.push({ stage, files: files.sort((a,b) => a.path.localeCompare(b.path)), gitStatus: git.stdout, gitStatusCommand });
  if (git.error || git.status !== 0) throw new Error(`snapshot git status failed: ${stage}: ${git.error?.message ?? git.stderr}`);
  return files;
}
let child;
const pending = new Map();
let seq = 0;
function request(method, params) {
  const id = ++seq;
  return new Promise((resolvePromise, reject) => {
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`request timeout: ${method}`)); }, 45000);
    pending.set(id, { resolve: resolvePromise, reject, timer });
    child.stdin.write(`${JSON.stringify({ id, method, params })}\n`);
  });
}
async function skillsList() {
  // Windows Known Folder lookup can ignore child HOME/USERPROFILE overrides.
  // Do not enumerate OS-profile skills; Linux hosted runs provide loader evidence.
  if (process.platform === 'win32') return { data: [], unverified: 'Windows OS-profile discovery bypasses child home isolation; skills/list deliberately not called' };
  return request('skills/list', { cwds: [fixture], forceReload: true });
}
async function completed(importId) {
  const deadline = Date.now() + 45000;
  while (Date.now() < deadline) {
    const notice = transcript.find(x => x.method === 'externalAgentConfig/import/completed' && x.params?.importId === importId);
    if (notice) return notice.params;
    await new Promise(r => setTimeout(r, 40));
  }
  throw new Error('import completion timeout');
}
try {
  if (!existsSync(entry)) throw new Error(`BLOCKED: pinned Codex package missing; install @openai/codex@0.154.0 under .lab-runs/f-tools`);
  const version = spawnSync(process.execPath, [entry, '--version'], { env, cwd: fixture, encoding: 'utf8', timeout: 15000 });
  result.versionOutput = version.stdout?.trim();
  if (version.status !== 0 || !/\b0\.154\.0\b/.test(result.versionOutput)) throw new Error('BLOCKED: pinned CLI version mismatch');
  let before;
  if (!inspect) {
  const git = spawnSync('git', ['init', '-q'], { env, cwd: fixture, encoding: 'utf8' });
  if (git.status !== 0) throw new Error('git init failed');
  if (rigOrder === 'rig-first' && rig('rigInitialInstall', ['init']) !== 0) throw new Error('Rig initial installation failed');
  write(join(fixture, 'CLAUDE.md'), (existsSync(join(fixture, 'CLAUDE.md')) ? readFileSync(join(fixture, 'CLAUDE.md'), 'utf8') : '') + '\n# Synthetic project\nUse fixture-only data. Import marker: source-v1.\n');
  write(join(fixture, '.claude/skills/lab-import/SKILL.md'), '---\nname: lab-import\ndescription: Synthetic import validation skill\n---\nReturn the synthetic fixture marker.\n');
  write(join(fixture, '.claude/commands/lab-command.md'), 'Report synthetic fixture status.\n');
  write(join(fixture, '.claude/agents/lab-reviewer.md'), '---\nname: lab-reviewer\ndescription: Review synthetic fixtures\nmodel: sonnet\n---\nReview fixture changes without modifying files.\n');
  const settingsFile = join(fixture, '.claude/settings.json');
  const settings = existsSync(settingsFile) ? JSON.parse(readFileSync(settingsFile, 'utf8')) : {};
  settings.hooks ??= {};
  settings.hooks.PreToolUse ??= [];
  settings.hooks.PreToolUse.push({ matcher: 'Bash', hooks: [{ type: 'command', command: 'echo synthetic-hook' }] });
  write(settingsFile, JSON.stringify(settings, null, 2));
  before = snapshot('before-import');
  }
  child = spawn(process.execPath, [entry, 'app-server'], { env, cwd: fixture, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  let buffer = '';
  let stderr = '';
  child.stderr.on('data', data => { stderr += data.toString(); });
  child.stdout.on('data', data => {
    buffer += data.toString();
    while (buffer.includes('\n')) {
      const index = buffer.indexOf('\n'); const line = buffer.slice(0,index); buffer = buffer.slice(index+1);
      if (!line.trim()) continue;
      try { const message = JSON.parse(line); transcript.push(message);
        if (pending.has(message.id)) { const waiter = pending.get(message.id); pending.delete(message.id); clearTimeout(waiter.timer);
          if (message.error) waiter.reject(new Error(JSON.stringify(message.error))); else waiter.resolve(message.result); }
      } catch (error) { result.errors.push(`protocol parse: ${error.message}`); }
    }
  });
  child.on('error', error => { for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(error); } pending.clear(); });
  child.on('exit', code => { for (const waiter of pending.values()) { clearTimeout(waiter.timer); waiter.reject(new Error(`app-server exited ${code}`)); } pending.clear(); });
  result.initialize = await request('initialize', { clientInfo: { name: 'agent-stack-lab', version: '0.1.0' }, capabilities: { experimentalApi: true } });
  child.stdin.write(`${JSON.stringify({ method: 'initialized' })}\n`);
  if (inspect) {
    result.skills = await skillsList();
    result.hooks = await request('hooks/list', { cwds: [fixture] });
  } else {
  const detect = () => request('externalAgentConfig/detect', { includeHome: false, cwds: [fixture], maxSessions: 0, migrationSource: 'claude' });
  const allowed = new Set(['AGENTS_MD', 'SKILLS', 'COMMANDS', 'SUBAGENTS', 'HOOKS', 'CONFIG']);
  result.detect = await detect();
  const items = result.detect.items.filter(item => item.cwd === fixture && allowed.has(item.itemType));
  result.selectedItems = items;
  if (!items.length) throw new Error('BLOCKED: native detection returned no eligible project-scoped synthetic items');
  async function importItems(stage, selected = items) {
    const response = await request('externalAgentConfig/import', { migrationItems: selected, migrationSource: 'claude', source: 'agent-stack-lab' });
    result[stage] = await completed(response.importId);
    return snapshot(stage);
  }
  const first = await importItems('firstImport');
  if (rigOrder === 'import-first') {
    const priorRig = snapshot('before-rig-init');
    result.observations.rigInitAfterImportExit = rig('rigInitialInstall', ['init']);
    result.observations.rigRefusalReadOnly = JSON.stringify(priorRig) === JSON.stringify(snapshot('after-rig-init'));
  }
  const second = await importItems('repeatImport');
  result.observations.repeatIdempotent = JSON.stringify(first) === JSON.stringify(second);
  result.skills = await skillsList();
  result.hooks = await request('hooks/list', { cwds: [fixture] });
  const prior = new Set(before.map(f => f.path));
  const generated = first.filter(f => !prior.has(f.path));
  result.observations.generatedFiles = generated.map(f => f.path);
  const edited = first.find(f => f.path === 'AGENTS.md') ?? generated.find(f => f.path.endsWith('.md'));
  const deleted = generated.find(f => f.path !== edited?.path && f.path.endsWith('SKILL.md'));
  if (edited) write(join(fixture, edited.path), `${readFileSync(join(fixture, edited.path), 'utf8')}\nUSER_EDIT_KEEP_ME\n`);
  if (deleted) unlinkSync(join(fixture, deleted.path));
  snapshot('user-edit-and-delete');
  write(join(fixture, 'CLAUDE.md'), '# Synthetic project\nUse fixture-only data. Import marker: source-v2.\n');
  await importItems('reimportAfterEdit');
  result.detectAfterEdits = await detect();
  const refreshed = result.detectAfterEdits.items.filter(item => item.cwd === fixture && allowed.has(item.itemType));
  result.observations.freshDetectEligibleItems = refreshed.map(item => item.itemType);
  const third = refreshed.length ? await importItems('freshDetectionReimport', refreshed) : snapshot('fresh-detect-no-items');
  result.observations.editedFile = edited?.path ?? null;
  result.observations.deletedFile = deleted?.path ?? null;
  result.observations.userEditPreserved = edited ? third.some(f => f.path === edited.path && f.text.includes('USER_EDIT_KEEP_ME')) : null;
  result.observations.deletedStaysRemoved = deleted ? !third.some(f => f.path === deleted.path) : null;
  result.observations.sourceUpdated = third.some(f => !f.path.startsWith('.claude/') && f.path !== 'CLAUDE.md' && f.text.includes('source-v2'));
  if (rigOrder === 'rig-first') {
    rig('rigRepeatInit', ['init']);
    const dryBefore = snapshot('before-rig-dry');
    rig('rigDryRun', ['upgrade', '--dry-run']);
    result.observations.rigDryRunReadOnly = JSON.stringify(dryBefore) === JSON.stringify(snapshot('after-rig-dry'));
    const managedDeletion = join(fixture, '.claude/rules/autonomy.md');
    if (!existsSync(managedDeletion)) throw new Error('Expected Rig-managed deletion fixture missing');
    unlinkSync(managedDeletion);
    const userBefore = snapshot('before-rig-upgrade');
    rig('rigUpgrade', ['upgrade', '--yes']);
    const userAfter = snapshot('after-rig-upgrade');
    result.observations.rigPreservesEditedAgents = userAfter.find(f => f.path === 'AGENTS.md')?.sha256 === userBefore.find(f => f.path === 'AGENTS.md')?.sha256;
    result.observations.rigDeletedStaysRemoved = !existsSync(managedDeletion);
    result.observations.importedSkillsSurviveRigUpgrade = generated.filter(f => f.path.startsWith('.agents/') && f.path !== deleted?.path).every(f => userAfter.some(x => x.path === f.path && x.sha256 === f.sha256));
  }
  result.observations.uninstall = 'unverified: neither migration undo nor Rig native uninstall is exposed; no deletion simulated';
  }
  result.status = 'completed';
  result.stderr = stderr;
} catch (error) {
  result.status = /BLOCKED:|authentication required|not authenticated|unauthorized|not logged in|sign in required/i.test(error.message) ? 'blocked' : 'error';
  result.errors.push(error.message);
} finally {
  if (child) { child.stdin.end(); child.kill(); }
  for (const waiter of pending.values()) clearTimeout(waiter.timer);
  result.finishedAt = new Date().toISOString();
  // Replace per-run machine paths with stable synthetic labels before tracking.
  const clean = value => JSON.stringify(value, null, 2).split(JSON.stringify(run).slice(1,-1)).join('<RUN>').split(run).join('<RUN>').split(JSON.stringify(root).slice(1,-1)).join('<LAB>').split(root).join('<LAB>');
  if (inspect) { mkdirSync(resolve(inspectOutput, '..'), { recursive: true }); writeFileSync(inspectOutput, clean(result) + '\n'); }
  else {
    writeFileSync(join(evidence, 'result.json'), clean(result) + '\n');
    writeFileSync(join(evidence, 'snapshots.json'), clean(snapshots) + '\n');
    writeFileSync(join(evidence, 'protocol.json'), clean(transcript) + '\n');
  }
  console.log(JSON.stringify({ status: result.status, observations: result.observations, errors: result.errors }));
  if (result.status === 'error') process.exitCode = 1;
}

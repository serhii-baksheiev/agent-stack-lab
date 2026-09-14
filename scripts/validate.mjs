import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';

for (const p of ['README.md', 'docs/charter.md', 'docs/evaluation-rubric.md', 'docs/current-rig-value.md', 'docs/final-recommendation.md', 'docs/migration-plan.md', 'docs/maintenance-estimate.md']) assert(existsSync(p), `Missing ${p}`);
const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' }).split('\0').filter(Boolean);
for (const p of tracked) {
  assert(!/^(\.claude|\.agents|\.codex|\.rig)\//.test(p), `Root agent payload tracked: ${p}`);
  assert(!['CLAUDE.md', 'PLAN.md'].includes(p), `Root Rig payload tracked: ${p}`);
  assert(!/(^|\/)(node_modules|\.lab-runs|\.venv|__pycache__)(\/|$)/.test(p), `Runtime payload tracked: ${p}`);
  assert(!/\.(tgz|zip|db|sqlite|sqlite3)$/.test(p), `Archive/database tracked: ${p}`);
  assert(!/(^|\/)\.env($|\.)/.test(p) || p.endsWith('.env.example'), `Environment file tracked: ${p}`);
  if (p.endsWith('.json')) JSON.parse(readFileSync(p, 'utf8').replace(/^\uFEFF/, ''));
}
console.log(`PASS: required documents, JSON syntax, tracked-path boundaries (${tracked.length} files). This is not a secret scanner or spike behavior test.`);
if (existsSync('spikes/a-spec-kit-manifest/result.json')) await import('./validate-a-evidence.mjs');
if (existsSync('spikes/f-native-projection/result.json')) await import('./validate-f-evidence.mjs');
if (existsSync('spikes/c-figma/result.json')) await import('./validate-c-evidence.mjs');
if (existsSync('spikes/b-spec-workflows/result.json')) await import('./validate-b-evidence.mjs');

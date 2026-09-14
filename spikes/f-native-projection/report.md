# Spike F: Native plugins, import and Ruler projection

## Hypothesis

One shared source can supply Claude and Codex using native distribution, leaving Rig responsible for bounded ownership, compatibility and lifecycle checks. Timebox: one developer-day, started 2026-09-14 after Spike A. Missing authorization, unsupported native APIs or resource failures stop the affected scenario. See [plan](plan.md).

## Candidates and pinned versions

* Claude Code `2.1.270`, exact npm distribution and integrity recorded in native provenance. Vendor license is `SEE LICENSE IN README.md`; this is not an open-source MIT dependency. [Official plugin reference](https://code.claude.com/docs/en/plugins-reference) and [marketplace reference](https://code.claude.com/docs/en/plugin-marketplaces).
* Codex `0.154.0`, Apache-2.0, exact npm distribution plus platform dependency lock recorded. [Official plugin authoring](https://developers.openai.com/plugins/build/plugins), [CLI](https://learn.chatgpt.com/docs/developer-commands?surface=cli), and [import](https://learn.chatgpt.com/docs/import). Actual generated app-server schema and executed RPCs take precedence over assumptions about interactive-only import.
* Ruler `0.3.44`, commit `658d1bc168e3496015aa5c262361cce818fabcf9`, MIT, npm release 2026-06-30; checked 2026-09-14. [Pinned official source](https://github.com/intellectronica/ruler/tree/658d1bc168e3496015aa5c262361cce818fabcf9). Separate real release upgrade starts at `0.3.43`.
* Agent Skills are the shared Markdown asset convention exercised by the synthetic plugin and native import. They are not a separate installer, lockfile or lifecycle service.

The synthetic shared plugin has source versions `1.0.0` and `1.0.1`, MIT, two native manifests and one skill/script source. These are lab releases, not claims about an upstream product release. Exact distribution timestamps, integrity, dependency resolutions and scenario SHA are in provenance, rather than mutable `latest` references.

Official GitHub API verification on 2026-09-14 resolves Codex tag `rust-v0.154.0` through annotated tag object `36eab01061df3cde5f95ec20a526777b430091ba` to commit `6b9826e3aa83b1a5947db50f4332cb9c65f1b340`; [release](https://github.com/openai/codex/releases/tag/rust-v0.154.0) published 2026-09-09, repository last push 2026-09-14. Claude tag `v2.1.270` resolves to public repository commit `2b40e76d3f03b9070e2431e0bd05b4f3ace77982`; [release](https://github.com/anthropics/claude-code/releases/tag/v2.1.270) published 2026-09-12, last push 2026-09-14. That public Claude repository tag is release/support provenance, not a reproducible source-build claim for its proprietary binary.

## Test environment

Hosted Ubuntu with Node 24; exact runtime in evidence. Every CLI receives an isolated synthetic configuration home and fresh git repository under ignored `.lab-runs/f-*`. No model credentials are used. The lab tests native CLI operations, app-server configuration import and loader metadata without paid inference. This limits conclusions about model-driven behavior.

## Rig baseline

Published immutable `create-agent-rig@0.9.0`, verified tarball integrity before execution. [Spike A baseline](../a-spec-kit-manifest/evidence/rig-baseline/) records manifest, payload hashes, complete diff and provenance. F independently installs the same package in each applicable order; it does not transplant a production checkout. Rig has no native uninstall command. Repeat init refuses existing anchors; `upgrade --dry-run` and `upgrade --yes` are actual supported forms.

## Scenarios

Ruler is exercised Rig-first and Ruler-first, including canonical rules, skills and opt-in subagents, repeat apply, dry-run, user edits, deleted projections, source update, revert and surviving Rig checks. Ruler-first generates `CLAUDE.md`; subsequent Rig bootstrap refuses without changing files. This safely rejects a collision but fails seamless composition.

Ruler-first refusal is not replaced by a fabricated successful install. In Rig-first, enabling directory projection deletes/replaces foreign Rig skills and agents. A settled second apply becomes byte-idempotent; the immediate first repeat differs. Reapply loses generated skill edits, root context edits and deliberate projected-file deletions. Revert changes Rig-owned context files and leaves projected agents. The separate `0.3.43 → 0.3.44` run executes successfully, but retains neither the tested generated override nor deletion. Canonical source survives. These are distinct from a same-version source update.

Codex's actual experimental app-server `externalAgentConfig/detect` and `/import` work noninteractively with `includeHome:false` and synthetic project paths. Both integration orders are tested. It imports skills, slash commands, subagents and eligible configuration; the import-first fixture also creates `AGENTS.md` and hooks. Rig-first leaves existing destinations under their current ownership. Replay is idempotent and preserves the tested edit/deletion, but changed source is not propagated: completed migration items are no longer eligible. Import is a migration aid, not the required updater. Import-first then Rig refuses the existing context anchor safely.

Native plugin experiments use both providers and both installation orders. The lifecycle captures install inventory, repeated installation, Rig dry-run and upgrade with overrides/deletion, a synthetic upstream version update, native uninstall, and the surviving Rig dry-run. A functional update requires the installed script to return version `1.0.1`; a successful CLI exit or changed catalogue is insufficient. The generated ledger records all completed outcomes. Directly executing a script from the installed package proves artifact usability, not model-selected skill invocation.

Final hosted run [34830163055](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34830163055) completes all four native cases. Both providers execute the installed `1.0.0` and then `1.0.1` probe with `7 → 49`, preserve tested Rig overrides/deletion, and remove the native inventory entry without damaging retained Rig payload. Codex loader lists `lab-neutral:lab-proof` with its plugin ID. Codex marketplace refresh exits 1 because this command supports Git sources, while the synthetic source is local; repeating native `plugin add` successfully installs the changed version. This is a documented route distinction verified by execution, not a blanket all-commands-success claim.

## Measurements

[result.json](result.json) and [scenario-ledger.json](scenario-ledger.json) are generated from canonical evidence by `node scripts/summarize-f.mjs`. Counts describe tested candidate properties; a green collector does not turn a failed safety or upgrade requirement into a pass. [scores.json](scores.json) covers all 17 dimensions with uncertainty. No weighted average overrides the ownership failures.

Final ledger: 65 passed, 15 failed, 8 unverified. Failures include unsupported Codex local marketplace refresh, destructive Ruler composition, and import evaluated as an updater. Native functional plugin updates pass in all four cases.

The common fixture avoids duplicating skill and script content: two native metadata files point to the same source tree. Ruler's real generator demonstrates Claude Markdown and Codex TOML agent projection, but model and effort execution are not established by generated syntax. Native metadata loading likewise does not prove hook execution or routing correctness.

## File ownership

| Surface | Owner and lifecycle |
| --- | --- |
| Shared fixture skill, hook script and arithmetic probe | Synthetic upstream package; one canonical source |
| Native marketplace and plugin manifests | Respective official format, not a Rig registry DSL |
| Native plugin cache and installation registration | Native CLI; disposable installation state, not user-edit storage |
| Project `.claude/settings.json` | Shared wiring: native enabled-plugin entries and Rig settings; requires explicit ownership reconciliation |
| Rig context anchors, rules, hooks, agents and scripts | Rig manifest until user modification/handover |
| Imported `.agents/skills`, `.codex/agents`, hooks/config and `AGENTS.md` | Migrated project artifacts; native import supplies no demonstrated ongoing update/undo ownership |
| `.ruler` canonical assets/configuration | User/project source |
| Ruler target skills/agents directories and generated root context | Ruler projections; tested replacement conflicts with existing owners |

Per-path native and Ruler ownership inventories, hashes and operation snapshots are in evidence. Sharing a directory prefix is safe only when a tool preserves other owners' descendants. Ruler's enabled directory replacement violates that condition.

## Conflicts

Rig refuses pre-existing root anchors in the reverse Ruler/import orders. Native Claude registration can change Rig-owned settings, requiring a distinct wiring verdict. An installer cannot treat successful native plugin registration as proof that Rig still owns exact settings bytes. User overrides belong in project configuration/source, not in a native package cache.

Ruler projection can work under exclusive ownership, but enabling it over existing Rig skills/agents is rejected. Disabling destructive projection narrows its value to rule distribution and leaves native hooks/lifecycle/routing separate. A universal projector is not justified by these results.

## Security findings

Canonical hosted experiments use only synthetic source and configuration state. Child profiles are confined to lab fixtures; provider credential variables are cleared. An excluded local Windows loader probe discovered public installed skill metadata through OS-profile resolution despite child HOME overrides. No authentication, memory or chat import was requested, and that metadata was not included in canonical evidence. The script now skips Windows skills enumeration; see evidence/windows-diagnostics/notes.json. Package identity is verified against npm integrity. Native hooks remain executable code that requires native trust policy; listing them or validating JSON does not certify their enforcement. No real home configuration, authentication state, memory database or production source is committed.

Raw app-server evidence is limited to configuration import/loader calls with no home discovery or chat import. The package toolchain remains capable of executing upstream code; pinning establishes identity, not a complete upstream security audit. Ruler's observed replacement of foreign directories is a data-preservation defect for this composition.

## Maintenance cost

No production projector, provider SDK or registry is built: **zero product implementation lines** in this spike. Scripts under `scripts/spike-f-*.mjs` and this summarizer are disposable evidence collectors, not a proposed runtime. Shared fixture source is test input. This accounting must not disguise test harness size as a small production adapter.

Engineering estimate for qualifying native install/update/remove plus ownership-aware wiring/doctor: 4–7 developer-days, midpoint 5; 4–8 days/year, midpoint 6, for two pinned harnesses. These are estimates, not measured labor, and overlap Spike A's lifecycle wrapper work. They exclude live-model routing, a general projection language, orchestration and memory. Production code size remains unmeasured because no safe general wiring adapter is implemented here; claiming a fixed small LOC count would be speculative.

## What failed

Ruler's overlapping projection does not preserve foreign skills/agents, generated edits or deliberate deletions. Revert is not deterministic restoration of the pre-Ruler Rig state. Reverse bootstrap collides with root context anchors. Codex import does not propagate changed source on replay and does not demonstrate a native undo. All four final native functional updates pass. Codex local-source marketplace refresh is unsupported and recorded separately from the successful plugin-add update route.

Earlier hosted collectors stopped on fixture setup/schema mistakes: missing isolated Codex home and assuming plugin list exposed its cache path. The corrected collector creates that directory and uses `plugin add`'s actual `installedPath` response. These were classified harness defects, not repeated unexplained flaky candidate failures. The final completed evidence supersedes partial runs.

## What remains unverified

Live model-selected skills; actual hook enforcement; Claude/Codex model/effort equivalence; desktop configuration sync as an upgrade service; native plugin cache edit/deletion guarantees; a cold offline native dependency bootstrap; complete Windows native lifecycle; Rig removal while a native package remains operational. Any recommended product profile must qualify these relevant gaps before asserting support. Generated import agents and native loader listings are narrower evidence.

## Verdict: ADAPT

Choose a **hybrid of native plugin distribution and bounded Rig lifecycle/compatibility checks**, conditionally within the tested surfaces. Reject Ruler's enabled overlapping skill/agent projection for the existing Rig installation. Use Codex native import for an explicit migration step, not recurring synchronization. Agent Skills can supply shared source content; provider-specific hooks, permissions and routing stay native.

This supports a thin manager direction, not an immediately production-qualified replacement package. Each provider's functional update and wiring outcome remains a release gate. A failed native update must be fixed or excluded from an advertised supported profile before adoption.

## Consequences for Rig

Delegate package storage, discovery and native registration upstream. Keep only verified gaps: composition ordering/preflight, exact ownership and user handover, explicit wiring verdict, deletion policy where still applicable, version compatibility checks and repo doctor. Do not duplicate native caches, imports, model routing or plugin catalogues. The A/F decision gate is maintained separately in `decisions/go-stop-after-a-f.md`.

## Reproduction commands

Run the checked-in `.github/workflows/spike-f.yml` on hosted Ubuntu, or reproduce from the lab root in a fresh Linux checkout:

```bash
mkdir -p .lab-runs/f-tools
cp fixtures/f-native/toolchain.json .lab-runs/f-tools/package.json
cp fixtures/f-native/package-lock.json .lab-runs/f-tools/package-lock.json
npm ci --prefix .lab-runs/f-tools --no-audit --no-fund
node scripts/spike-f-ruler.mjs
node scripts/spike-f-ruler-upgrade.mjs
node scripts/spike-f-import.mjs
node scripts/spike-f-import.mjs --rig-order rig-first
node scripts/spike-f-import.mjs --rig-order import-first
node scripts/spike-f-native.mjs
node scripts/summarize-f.mjs
```

The committed lock supplies the native dependency closure. Optional workflow dispatch can select an existing Linux self-hosted runner label such as `lab-linux`; it needs Node 24/npm, git, tar and network access and runs the same scripts. This lane is not a required PR check. Never point these scripts at production or an existing user profile.

## Artifact links

[Ruler evidence](evidence/ruler/), [import evidence](evidence/import/), [native evidence](evidence/native/), [scenario ledger](scenario-ledger.json), [scores](scores.json), [shared fixture](../../fixtures/f-native/), [plan](plan.md). Independent review is a separate record supplied before merge.

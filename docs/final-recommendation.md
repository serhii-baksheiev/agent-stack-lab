# Final recommendation: Lean Rig on top of native Claude Code and Codex

**Decision:** assemble the universal Claude Code + Codex stack from native plugins, skills, hooks, agents, GitHub/Jira as task authority and Git as code authority, and keep from Rig only the part the six spikes proved valuable: a manifest-backed, conflict-aware installer and integration doctor (**Lean Rig**). Do not build a scheduler, queue, workflow DSL, provider SDK, Memory engine, AMQ/AMAQ, exactly-once board abstraction or central control plane. **Fallback:** no Rig at all, native plugins plus a small bootstrap script. The full 0.9.0 scope is not recommended.

Status: synthesis of spikes A → F → C → B → E → D at the SHAs listed below. This is an architecture recommendation for the owner's decision, not a production change; no production repository, Jira ticket or published package was modified. Counts quoted from spike ledgers mix primitive, source and synthetic observations and must not be read as product quality scores.

| Spike | Branch head (exact) | Verdict / confidence | Ledger passed / failed / unverified | Estimate (integration / annual days) |
|---|---|---|---|---|
| A Spec Kit × Rig manifest | `8df0a5cfc45169870883faa72ae133bc55667fe9` | ADAPT / medium | 42 / 7 / 5 | 3 (2–4) / 3 (2–4) |
| F native projection | `0d6c655be9306e87f83a2c01030e066108b88c2e` | ADAPT / medium | 65 / 15 / 8 | 5 (4–7) / 6 (4–8) |
| C Figma MCP | `628bdeeb6109ff063fd14c7af00748f4064bb170` | ADAPT / medium | 58 / 0 / 8 | 1 / 1 |
| B spec workflows | `8f3dd6d7ed1b0571c09833a10672413b931d1a6a` | ADAPT / medium | 166 / 10 / 14 | 2 / 2 (+1–2 per optional BMAD/OpenSpec) |
| E memory | `899a3dfe0c6bf37df13289146669c2a96866b15e` | ADAPT / medium | 153 / 16 / 14 | 3 / 3 |
| D team orchestration | `4bdca5e30ad8deea72ca1afb3c4539cad4f4fe2e`, merged into master by PR #11 as `2419a8a494d37bde00ce52439ddf0272ff8f51b1` | ADAPT / medium | 23 / 2 / 11 | 3 (2–3) / 3 (2–3); optional claim adapter +5–8 / +3–5 |

Rig baseline everywhere: `create-agent-rig@0.9.0` (npm integrity pinned in `spikes/a-spec-kit-manifest/evidence/rig-baseline/provenance.json`). Security status of this laboratory is recorded in [security incidents](security-incidents.md) and [history cleanup](history-cleanup/README.md): current refs clean, old PR/cache reachability remains, token invalidation unverified. That incident does not change the architecture conclusion but blocks calling the lab "fully clean".

## 1. What the evidence proved and what it did not

**Proven about Rig 0.9.0** (A, re-verified in F/C/B/E): `init` writes 83 payload files plus a per-file SHA-256 manifest; it refuses to clobber an existing `CLAUDE.md`/`AGENTS.md`; `upgrade --dry-run` is read-only; user edits are retained and user deletions stay deleted through `upgrade` in every provider and install order tested; modified wiring (`.claude/settings.json`) is handed over with an explicit verdict instead of being overwritten. Native plugin install/update/uninstall for Claude Code and Codex coexisted with Rig in every order (F, C, B, E).

**Not proven about Rig 0.9.0:** no cross-release Rig upgrade was ever executed (only same-version replays, which the rubric classifies as idempotence, not migration); none of the shipped hooks/guards was executed; the payload `doctor.mjs` was never run and 0.9.0 has no `doctor` CLI command; `setup --memory-root` / `memory doctor|load` were never run and depend on a private `claude-config` checkout; the shipped queue (`.claude/queue.json`, `scripts/queue/{jira,github-issues,plan-md,…}.mjs`), revalidation, journal and run-state scripts were never invoked; there is no `uninstall` (A's removal is a lab adapter); Windows CRLF rewriting by Spec Kit invalidated Rig's settings hash. Rig's own Claude→Codex projection (`sync-codex-adapter`) was not judged by F's criteria that rejected Ruler.

**Proven about ready-made components:** Spec Kit 1.0.6 native lifecycle including a real 1.0.5→1.0.6 upgrade (A/B); Superpowers 6.3.0 native plugin lifecycle in all four provider × order combinations (B); Figma MCP client bundle 2.2.108→2.2.111 lifecycle for both harnesses, live retrieval blocked at 401 (C); Codex native import of Claude configuration as a one-shot migration (F); Basic Memory 0.23.2 project isolation, restart, backup/restore, offline read and 12/16 same-note concurrent appends (E); GitHub Issues, `blocked_by` links, worktrees, `merge-tree` conflict detection and non-forced Git ref fast-forward as a cooperative claim primitive (D); OpenHands Automation `FOR UPDATE SKIP LOCKED` on PostgreSQL 17.11 and ten unmodified Symphony tests (D); one scripted live Claude Code → Codex → Claude Code handoff over a lab Issue/PR with hosted CI green (D).

**Negative results that shape the design:** Spec Kit, OpenSpec and Ruler restore user-deleted managed files, and Ruler overwrote 24 Rig-owned paths (A, B, F); BMAD/OpenSpec overwrite edited generated skills (B); the reference MCP memory server lost 39 of 96 acknowledged writes and deletes its default data on uninstall (E); GitHub Issue `If-Match` PATCH returns 400, so an Issue field is not a lock (D); B's board exporter duplicated an issue on immediate replay and used non-feature-scoped task IDs; the OpenSpec discovery install escaped the lab into the user's npm prefix (B).

**Unverified across the program:** autonomous (unscripted) multi-model teamwork, independent-account review, native compaction recovery, Jira transition/CAS, hard publication fencing, exactly-once task export, cross-release Rig upgrade, Rig hooks/doctor/queue execution, custom Memory behaviour and migration, cold offline bootstrap, redistribution licences for the Figma bundle and Basic Memory (AGPL).

## 2. Architectural boundary

### 2.1 What remains from Rig (Lean Rig)

| Capability | Keep? | Evidence basis |
|---|---|---|
| Manifest-backed install with per-file hashes | Keep | A `evidence/rig-baseline/`; re-verified F/C/B/E |
| Conflict-aware upgrade (refuse/hand over modified wiring, dry-run read-only) | Keep, add cross-release test before 1.0 | A/F/C/B/E same-version replays; cross-release unverified |
| Preservation of user edits and deletions | Keep as the core contract | Every spike; contrast Spec Kit/OpenSpec/Ruler failures |
| Repository doctor (versions, paths, registrations, auth scope presence, wiring drift) | Keep as a new thin command | Diagnostic need shown by F (settings ownership), E (handshake reports library version), D (auth/scope checks); 0.9.0 doctor never executed, so this is a rebuild within proven scope |
| Portable security guards | Keep only guards that pass an execution fixture; ship none unverified | No spike executed a 0.9.0 hook; F: listing hooks does not certify enforcement |
| Versioned subsystem/plugin registration (record handle, version, digest, owned paths) | Keep as a receipt, not a registry format | F/C/B/E native registrations survived Rig upgrade; 0.9.0 `subsystems.json` never exercised |
| Uninstall | Add, conservative and ownership-bounded | A lab adapter removed 83 files and preserved 36 foreign files on pristine Ubuntu, refused on modified wiring; 0.9.0 has none |

### 2.2 What is taken ready-made

- **Native Claude Code / Codex plugins, skills, hooks, agents** via each harness's own catalog and registration commands (F, C, B). Shared skill source, provider-specific metadata; no projection DSL.
- **Native subagents/teams** inside one harness session (Claude Agent Teams, Codex subagents) as documented; not verified as cross-harness controllers (D).
- **GitHub (and later Jira) as task authority**; real dependency links, not labels (D). Jira remains unverified and must be qualified separately.
- **Git branches, worktrees and PRs as code-state authority**; `merge-tree` before merge (D).
- **Spec Kit 1.0.6** as canonical specification workflow through its own commands and manifest (A, B); **Superpowers 6.3.0** optional; **BMAD 6.12.0 / OpenSpec 1.13.0** alternatives only, not distributed profiles until deletion/overwrite behaviour is accepted (B); **Figma official MCP bundle** optional and conditional on OAuth and licence (C).
- **Memory:** native harness memory by default; **Basic Memory 0.23.2** optional local MCP with explicit project paths, structured-error checks and quiescent backups, after an AGPL decision (E). Reference graph server rejected for shared writes.
- **Ready orchestrators:** Symphony and OpenHands are capability candidates only. D proved their coordination primitives in source/unit scope, not install/update/uninstall, Rig overlap or external issue/PR fencing. Adopt one operationally only if its service model is wanted; never re-implement it inside Rig.

### 2.3 What is not built

Own universal scheduler; own queue; general workflow DSL; provider SDK; new Memory engine; AMQ/AMAQ; an exactly-once abstraction over Jira/GitHub; a central control plane. The charter already excluded these; A/F rejected the projection DSL and registry format, B rejected a workflow engine, E rejected a custom Memory engine, D rejected a Rig scheduler and showed that GitHub cannot supply CAS on Issues.

### 2.4 Team work

Native team/subagent capabilities inside one harness; Issue/PR/handoff records between Claude and Codex; one authoritative board; blocker links, not labels; feature-scoped stable task IDs (`repo:feature:task`, B's collision finding); one owner per task; separate branch/worktree per task; external PR reconciliation through the board and PR state; a claim adapter only as an optional capability after the D gates (server-clock lease, fencing, replay) pass. The live D handoff shows the mechanics work when a script sequences them; autonomous selection by two models remains unverified.

### 2.5 Memory

E compared custom Memory (untestable: no implementation, schema or data available; all dimensions unverified), Basic Memory (proven bounded behaviour, AGPL), the reference graph server (rejected) and native memory (documented, default by simplicity). Custom Memory is **not retained on sunk cost**: if the owner keeps it, it becomes a separate subsystem/package with its own tests, registered through the receipt contract, and installation must not require access to the private `claude-config` repository (0.9.0's `setup --memory-root` targets a `claude-config` checkout according to the published 0.9.0 README; Spike E never had that checkout, so the seam is unverified; see [E report](../spikes/e-memory/report.md)).

## 3. Options compared

Scores are engineering judgments on the evidence named; "no evidence" means exactly that.

| Dimension | A. Full Rig 0.9.0 scope as is | B. Lean Rig (package manager + integration doctor) | C. No Rig: native plugins + small bootstrap |
|---|---|---|---|
| User value | Ownership safety proven; hooks, queue, doctor, revalidation, Memory pass-through unproven (A–E) | Same proven ownership safety, plus a doctor that is actually executed; smaller surface | Upstream functionality intact; user owns pins, deletion semantics, wiring drift (A, F) |
| Integration cost | Highest: two harnesses × hooks/queue/scripts to keep alive; no spike estimate | Bounded: A 2–4, F 4–7 (overlapping), C 1, B 2, E 3, D 2–3; core 12–20 days as a non-additive range | Lowest: bootstrap script and docs, 3–6 days (inference, no spike measured) |
| Annual maintenance | Unestimated; every payload script tracks two harness release trains | 10–16 days/year core (see [estimate](maintenance-estimate.md)) | 4–8 days/year for pins/docs plus user-side manual recovery (inference) |
| Vendor lock-in | Rig-specific queue/journal formats add lock-in to Rig itself | Low: manifests are JSON, payload is Markdown/JSON; receipt is a thin superset of native manifests | Lowest to Rig; highest to each harness's own conventions (F scores: Claude plugins 5, Codex 7) |
| Claude/Codex portability | Rig projects Claude→Codex; not judged by F's criteria | Shared skill source, native registration per harness (F, C, B) | Same, done by hand per repository |
| Teamwork | Shipped queue/board scripts never run | Thin task/handoff skill, board links, worktrees (D, incl. live handoff) | Same primitives without an installer; per-repo setup by the lead |
| Memory | Custom Memory via private `claude-config`, unverified | Native default; optional Basic as separate subsystem (E) | Native default; Basic by hand |
| Board support | `queue/jira.mjs`, `queue/github-issues.mjs` unexecuted | GitHub primitives proven; Jira unverified; claim adapter optional (D, B) | Same, unmanaged |
| Upgrade/uninstall safety | Same-version safe; no uninstall; cross-release unverified | Same-version safe; add cross-release test and bounded uninstall (A adapter) | Native uninstall per plugin proven (F/C/B); nothing removes cross-tool wiring drift |
| Security risk | Unexecuted guards give false assurance; larger payload | Guards shipped only after execution fixtures; smaller payload | Depends on each user's manual discipline; no guard layer |
| Evidence | A–E lifecycle rows; brief §2 | All spikes; D live handoff | A "Spec Kit standalone sufficient for a user accepting its deletion policy"; F/C/B native lifecycles |

**Primary choice: B, Lean Rig.** It keeps everything the lab proved valuable and drops everything the lab could not exercise. **Fallback: C, No Rig**, for teams that accept Spec Kit's deletion policy and manual wiring reconciliation; it is not a merged compromise with A. Option A is rejected because its extra surface has no execution evidence and contradicts the charter's "Rig is not a scheduler".

## 4. Version path

- **0.9.1** (fix-only): document the real 0.9.0 command surface (no `doctor`, no `uninstall`); fix `init --help`/`upgrade --help` exit codes (A); normalise line endings before hashing so Spec Kit's CRLF rewrite does not invalidate settings ownership on Windows (A); publish the safe-metadata allowlist practice for any collector that touches GitHub; no behaviour change to payload.
- **0.9.2** (last full-scope release): mark queue, journal, run-state, revalidation, skeletons and Memory pass-through **deprecated** in output and docs; add a receipt for native registrations (handle, version, digest, owned paths) as read-only diagnostics; add cross-release upgrade fixture 0.9.0→0.9.2 in the lab.
- **0.10.0** (architectural turn, breaking): Lean Rig. Remove queue/journal/run-state/revalidation/skeletons from the payload through the reviewed ownership migration in the [migration plan](migration-plan.md); add `doctor` and conservative `uninstall`; ship only guards with execution fixtures; Memory becomes an external subsystem installed through the receipt, never requiring `claude-config` access; Spec Kit, Superpowers, Figma and Basic Memory are installed through native commands and recorded, not copied.
- **1.0.0** (contract freeze) only when: cross-release upgrade preserves edits/deletions on Linux and Windows; uninstall passes ownership fixtures with each native package surviving; doctor has reproducible exit statuses; guards have execution fixtures; cold pinned bootstrap reproduces an install; licence decisions for optional components are recorded. Distributed autonomous team mode and any claim adapter stay outside the 1.0 guarantee until the D gates pass.
- **Superseded / outside boundary:** AMQ/AMAQ, custom scheduler and queue, workflow DSL and universal projector (`rig.yml`, `rig.lock`), provider SDK, universal board abstraction, custom Memory engine inside Rig Core, design framework in Rig, application skeletons (already deprecated by 0.9.0's changelog), `--force` init text.

## 5. Owner-only decisions

Custom Memory retention as a separate package versus retirement; AGPL decision for Basic Memory; Figma bundle licence; whether to ask GitHub Support for PR-cache erasure and token invalidation confirmation; any production repository or Jira change. None of these were taken here.

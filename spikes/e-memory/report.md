> History cleanup: SHA references below use cleaned identities. Pre-cleanup workflow links and measurements are historical evidence, **not exact-head evidence** of the rewritten tree. See [provenance and reference index](../../docs/history-cleanup/README.md).

# Spike E: local and shared memory

## Hypothesis

A ready local MCP memory can replace a bespoke engine while retaining explicit project identity, access from both harnesses, restart and recovery. Timebox: 2–3 developer-days. Stop a candidate at missing verified distribution, inaccessible credentials or failed critical storage guarantees; retain negative evidence. No private custom Memory implementation or real notes were used.

## Candidates and pinned versions

Checked 2026-09-14. Basic Memory **0.23.2**, source `c0bd87c6d5a4a58034b1d6c8c5018e443b0bd048`, AGPL-3.0-or-later, released August 25; upgrade from verified 0.23.1. PyPI wheel URL/digest, verified bytes, dependency freeze and source/license metadata are in `evidence/basic-setup` and `basic-upgrade/provenance.json`. Current upstream activity was September 14. [Official repository](https://github.com/basicmachines-co/basic-memory), [0.23 changes](https://docs.basicmemory.com/whats-new/v0-23).

Official MCP reference graph server **2026.8.31**, gitHead `a40bc270fb5ece62673f8a1196f57116d885c5eb`, verified npm SHA512. Its three-file distribution omits the referenced LICENSE. Pinned upstream license describes an Apache-2.0 transition, retained MIT contributions and CC-BY documentation; do not label the package simply MIT. See `evidence/reference` for registry/source/activity and licensing evidence. [Official source](https://github.com/modelcontextprotocol/servers/tree/a40bc270fb5ece62673f8a1196f57116d885c5eb/src/memory).

Native Claude Code **2.1.270** and Codex **0.154.0** reuse F's verified distribution lock. Current native memory features were checked against official documentation and isolated CLI metadata, without model extraction/recall. Claude memory is documented as machine-local, shared across repository worktrees, enabled by default; Codex memory is local under CODEX_HOME, disabled by default and generated in background. [Claude memory](https://code.claude.com/docs/en/memory), [Codex memories](https://learn.chatgpt.com/docs/customization/memories?surface=app). These are documented capabilities, not a measured equivalence to a shared transactional store.

The existing custom Memory is represented only by the requested public contract/scenarios. No implementation, proprietary schema or real migration data was available; no custom-engine superiority is inferred.

## Test environment

Canonical Ubuntu GitHub-hosted Node 24, Python 3.12, uv 0.12.5; exact versions, scenario SHA and collector hashes accompany evidence. Windows discovery and reference concurrency observations are separate diagnostics. Every installation, Git worktree, HOME, CODEX_HOME, Claude configuration and data store is inside a fresh ignored `.lab-runs` directory. Semantic embeddings, model downloads, auto-update and telemetry were disabled for Basic Memory. Python dependencies are frozen after actual installation, but a complete hash-locked cold bootstrap was not established.

## Rig baseline

Published create-agent-rig **0.9.0** is verified against A's npm integrity and installed in four fresh repositories: Claude/Codex × Rig-first/MCP-first. Native MCP registration uses the exact isolated Basic executable, explicit config/data directories and `mcp --project alpha`. Snapshots record ownership before/after registration, repeat, dry-run, user edits, deletion, upgrade and native removal. Baseline provenance and full manifest/hash/diff inventories remain in [A](../a-spec-kit-manifest/report.md).

## Scenarios

The machine-readable [scenario ledger](scenario-ledger.json) is authoritative for individual outcomes. Actual stdio MCP calls test alpha/beta separation, intentionally wrong project and absolute-path requests, traversal rejection, two independent clients and Git worktrees, restart, literal retrieval, concurrent distinct-note writes, same-note appends, native deletion, Markdown export/import, corruption, explicit backup restoration and a Linux network-namespace offline read. These are protocol clients, not simulated successful native model recall.

Basic project identity is explicit configuration shared by the worktrees, not automatic derivation from Git remote. Constrained alpha access is tested separately from unconstrained access to both configured projects. Operational scoping does not protect against a hostile process with access to the same OS account/files. Importing Markdown into a renamed project retains old permalink metadata: short lookup fails while native file identity plus an import-only marker proves the imported copy is readable.

Basic package upgrade 0.23.1 → 0.23.2 preserves a seeded note. Package uninstall removes the executable, preserves the tested Markdown bytes, and reinstall can read retained state. Dependencies remain in the dedicated environment. Native registration removal separately preserves Rig files and memory data. No full byte-exact SQLite/index migration claim is made.

Two-process stress distinguishes MCP acknowledgement, immediate read, final reads through both clients and bounded Markdown projection convergence. It does not serialize writes or patch the backend. Missing final markers mean bounded observed absence through both readers, not proof of permanent loss. Per-round results and projection timings are in `evidence/basic-concurrency/result.json`.

Reference graph tests use actual nine-tool MCP CRUD/search, repeated entity creation, restart, explicit separate/shared paths, replay export/import, corrupt-file errors, restore, deletion, uninstall and two-process writes. Its package-local default shares data across working directories and is deleted with the package; explicit external paths avoid that uninstall hazard. Reference exact Rig order matrix and cross-version migration remain unverified; it is not recommended for the shared role.

## Measurements

Canonical run [34839170081](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34839170081), commit `bc7112c4c0d54bfa8596d052f7017ae1d521310a`: **153 passed / 16 failed / 14 unverified**, 221 complete command records and 34 validated snapshots. See [result.json](result.json), [measurements.json](measurements.json) and raw results. Basic's tiny literal alpha corpus and the reference server's four substring queries are not semantic retrieval or model-token benchmarks. Record response bytes rather than invented context-token savings.

Basic stress accepted **12 of 16 appends** across eight rounds. Four requests returned structured `error` values about repeated content changes during indexing, despite outer `isError: false`; clients must inspect structured errors. All 12 acknowledged markers remained visible, both readers agreed, all 16 distinct-note controls passed and no projection check timed out. This supports explicit error handling, not blind retry or guaranteed concurrent success; retry idempotency was not established. The reference hosted trial acknowledged **96 writes and lost 39** (9/10/10/10 over four rounds), without reported write errors. Raw names and responses support this count. Its source performs read-modify-replace without a transaction lock across independent processes.

Basic 0.23 uses database-first accepted mutations and asynchronous Markdown materialization. An acknowledgement can have `checksum: null` before the Markdown file exists. Full-state backup therefore requires quiescence plus SQLite/configuration and materialized Markdown; copying current Markdown alone is not a complete durability guarantee. The test corrupts only its own synthetic database, classifies the error, restores a quiescent backup and proves readable content, not exact index recovery or power-loss durability. [Official release architecture](https://docs.basicmemory.com/whats-new/v0-23).

## File ownership

See [ownership.md](ownership.md). Rig owns its existing manifest/payload; native harness owns MCP registration; the isolated environment owns Python/npm packages; the user owns notes, graph data, SQLite and project configuration. Neither uninstall nor Rig update should delete user data implicitly. Runtime databases, notes and installed packages are not committed; evidence contains only synthetic responses, configuration and inventories/hashes.

## Conflicts

Claude registration owns project `.mcp.json`; Codex registration owns isolated CODEX_HOME/config.toml. Both installation orders preserve native config through Rig upgrade and preserve edited Rig anchors/settings and user-deleted Rig files. Duplicate Claude add rejects an existing entry without config change; Codex repeated add succeeds without config change. Removing registration leaves the underlying store usable. No automatic native-memory synchronization or shared transcript capture was installed. Native memory and explicit MCP notes can coexist, but conflicting recalled facts remain an unmeasured semantic issue.

## Security findings

Both stores retain a supplied synthetic note canary verbatim. Neither is a secret store or proven credential detector. Basic's native `basic_memory_diagnostics` provides the package version; MCP initialize instead advertises FastMCP's version. Diagnostic output contains neither the synthetic config canary nor its sensitive key. Pinned source removes the whole key; the collector incorrectly expected a retained key. The raw failed predicate is preserved, output non-exposure is observed, and exact loaded-canary redaction remains unverified because input bytes were not separately captured. Reference initialize similarly reports its protocol implementation version rather than the npm release. Use ready diagnostics and package hashes, not a new universal handshake protocol. No real credentials, transcripts or personal memory were read. See [security.md](security.md) for scope and licensing qualifications.

## Maintenance cost

Estimate **3 integration developer-days / 3 annual maintenance days** for optional Basic registration, package pin verification, project-path diagnostics and documented backup/removal; overlaps F's generic lifecycle work and is not additive in full. Native memory remains harness-owned. No product memory engine, retrieval framework or memory synchronization code was built. Lab collectors are disposable evidence code. AGPL redistribution/integration terms require an owner/legal decision before distribution; the lab neither distributes a bundle nor asks for that decision prematurely.

## What failed

Reference independent writers lose acknowledged updates, package-local default storage is unsafe for uninstall/project separation, and neither store redacts note canaries. Basic returned four explicit concurrent indexing errors. Short imported permalinks do not automatically rebind to a renamed project. A prior run's constrained all-project search duplicated an alpha record (`evidence/diagnostics/third-constrained-all-project-search.json`); the final run's separate isolation and dedup checks both pass, so no deterministic duplicate claim is made. Initial collectors assumed slug filenames and immediate Markdown persistence; preserved diagnostics classify these as lab assumptions, not upstream corruption. A preparation-only run was cancelled after independent review found weak negative-path predicates, before accepting its results. No repeated unexplained flaky run was used as evidence.

## What remains unverified

Native model extraction/recall or cross-harness automatic capture; semantic retrieval; real custom Memory behavior/migration; hostile same-account authorization; power-loss durability; complete offline hash-locked bootstrap; automatic recovery; full exact-index restoration; reference cross-version migration and full Rig overlap matrix. Optional Basic use remains subject to the measured concurrency limitations and licensing decision. No false successful authorization or model inference is claimed.

## Verdict: ADAPT

Keep native harness memory and checked-in project knowledge as the lowest-complexity default policy, without claiming measured native recall superiority. Offer Basic Memory only as an explicit optional shared local MCP after its storage/project/backup limits are accepted. Reject the reference graph server for shared concurrent-write authority. No evidence justifies retaining or building a bespoke memory engine. Rig should install/pin/register and diagnose an optional store, not own its data model, extraction or task state.

## Consequences for Rig

Memory data stays outside package caches. Explicit project identity and data paths are part of registration review; doctor should invoke existing native diagnostics and check package version/paths/connection. Updates/removal preserve user data; destructive data erasure is a separate action. Do not copy memories into Rig payload or treat memory as task authority. Optional same-note concurrency suitability must follow this trial's actual results, not generic SQLite/Markdown marketing claims.

## Reproduction commands

From lab root, use the same isolated bootstrap and pinned native CLI installation as `.github/workflows/spike-e.yml`, then run `node scripts/spike-e-prepare-basic.mjs`, `node scripts/spike-e-basic.mjs`, `node scripts/spike-e-basic-concurrency.mjs`, `node scripts/spike-e-basic-upgrade.mjs`, `node scripts/spike-e-reference-memory.mjs`, `node scripts/spike-e-native-wiring.mjs`, and `node scripts/summarize-e.mjs`. Optional workflow_dispatch accepts an existing Linux self-hosted label; it is not a mandatory PR runner. Local Windows skips only the Linux network-namespace proof.

## Artifact links

[Raw evidence](evidence/), [reference/native source notes](notes-reference.md), [scenario ledger](scenario-ledger.json), [measurements](measurements.json), [scores](scores.json), [independent review](review.md). Canonical hosted run and exact collector SHA are recorded in measurements; previous failed/Windows runs are diagnostics, excluded from canonical counts.

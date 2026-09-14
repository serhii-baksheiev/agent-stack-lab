> History cleanup: SHA references below use cleaned identities. Pre-cleanup workflow links and measurements are historical evidence, **not exact-head evidence** of the rewritten tree. See [provenance and reference index](../../docs/history-cleanup/README.md).

# Spike D: team work and task ownership

## Hypothesis

Native agents plus an external board can provide explainable team work without a Rig orchestration framework. Timebox 3–5 developer-days. Stop at missing authorization, a critical ownership failure or evidence that a ready backend already owns the problem. Test optimistic board claims before proposing a queue. No AMQ/AMAQ was installed or implemented.

## Candidates and pinned versions

Checked 2026-09-14. Native Claude Code 2.1.270 and Codex 0.154.0 reuse F's verified pins; Codex source `6b9826e3aa83b1a5947db50f4332cb9c65f1b340`, Apache-2.0, Claude vendor terms. Current native teams/subagents documentation is distinguished from model execution.

Symphony v0.0.2 `653f8b3cc476db03420479ba6f95b2ed7281c401`, Apache-2.0, release July24 with September upstream activity. OpenHands Agent Canvas v1.18.0 `9120ff6cbbe23640f0e475661e5a9c9729cdbf1f`, MIT, and its pinned Automation1.11.1 `bc625068a9028849c32760e4fc9f66ec12b70872`, MIT. Source hashes, license source URLs and hashes, release/activity responses, dependency pins and executable probes are in `evidence/orchestrators`. The current OpenHands launcher is not assumed to be the old Python monolith. [Symphony](https://github.com/openai/symphony), [OpenHands](https://github.com/OpenHands/OpenHands), [Automation](https://github.com/OpenHands/automation).

GitHub REST API version **2026-03-10** is the real laboratory board. SaaS implementation cannot be pinned as a local package; API version and request/response evidence are pinned. Jira was not mutated: authorization is limited to this lab, not Jira RP or another production board. Jira transition/lease semantics remain unverified.

## Test environment

Actual board experiment on Windows Node24.18.0, source commit `9c408cf9e10bf16927933bf4f925dcf33c0ffcbe`; Git/gh version and command evidence identify the execution. Two independent gh subprocesses share one authorized account. Isolated synthetic Git repository and three linked worktrees under `.lab-runs` publish only fixture branches. Ready source/unit probes use isolated runtimes and synthetic tracker/database fixtures, not paid model or board traffic.

## Rig baseline

No new Rig installation is needed to prove a remote board's atomicity. Native harness distribution/lifecycle already used the exact published Rig0.9.0 in F; memory MCP coexistence used it again in E. These remote task/PR operations create no root Rig payload. Symphony/OpenHands are not recommended as installed Rig components: full install/update/uninstall and both overlap orders remain unqualified. They are ready capability candidates, not silently approved default dependencies.

## Scenarios

| Required scenario | Observed evidence and limit |
|---|---|
| Idea/spec → tasks | Synthetic D-R1/R2/R3 feature manually decomposed to three actual Issues12–14; no generated native planning claim |
| Publish tasks | Actual private GitHub API201 responses with stable feature-scoped identities |
| Two agents choose work | Two API actors race a preselected task; autonomous next-task selection by two models unverified |
| Avoid double claim | Issue If-Match PATCH rejects both with400; native Git fast-forward ref admits one200 and rejects sibling422 |
| Real blocker links | Actual blocked_by link13→12; open/closed state read from API, not labels; scheduler enforcement unverified |
| Branch/worktree isolation | Three actual linked worktrees and remote branches, separate commits |
| Two PRs edit common file | PR15/16 change the same counter function line |
| Detect before merge | Native git merge-tree exits1 and reports conflict; neither experimental PR merged |
| Owner crash | No renewal after claim process ends, then actual TTL expiry; not a killed model runtime |
| Expired claim release | Append successor lease commit with epoch2; no ref deletion race; client-clock limitation |
| External PR | PR17 arrives while A/B work remains open and is read by API |
| Reviewer rework | Actual COMMENT review and corrective commit; same lab account, not independent-account REQUEST_CHANGES |
| Claude → Codex | Synthetic provider-shaped handoff only; actual model continuation unverified |
| Restart/compaction | Fresh Node process reconstructs issue/commit/ref/next action from handoff; native compaction unverified |
| Duplicate event | Current canonical claim event is recognized by read/equality check; no full duplicate delivery executor, historical replay or exactly-once issue export proof |

The board collector records **15 positive checks and one negative board-CAS check**. These are primitive/component observations; the table deliberately does not present all fifteen end-to-end native-agent scenarios as passed. All Issues12–14 and PRs15–17 are closed and directly verified in `evidence/board/cleanup.json`.

## Measurements

Overall ledger: **20 passed / 1 failed / 12 unverified**; 58 complete command records, 44 classified real GitHub API requests and six snapshots. Canonical ready-source run [34841316242](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34841316242) uses commit `a1e37399383468b1ca80477d739146ca648568c6`. Counts combine bounded primitive/source checks, not an end-to-end production readiness score.

The issue response supplies an ETag, but both actual unsafe conditional PATCH requests return400 with an explicit unsupported-condition error. This is stronger evidence than assuming assignment updates are an atomic lock. [GitHub conditional-request contract](https://docs.github.com/en/rest/using-the-rest-api/best-practices-for-using-the-rest-api).

Two sibling lease commits race one Git ref with force:false: outcomes200/422. After wall-clock expiry, a successor commit advances it; the old owner's sibling update returns422. A cooperative caller can check the current tip before publishing, but that check is not atomic with arbitrary side effects. This proves a useful existing Git primitive, not a production lease implementation. [Git reference contract](https://docs.github.com/en/rest/git/refs).

Fresh-process counter acceptance covers exact output, invalid negative/non-integer inputs and deterministic restart behavior after review correction. Source/unit orchestrator results and counts are summarized in [measurements.json](measurements.json) and their raw artifacts; do not equate test fixtures with a deployed multi-controller service.

Ten selected unmodified Symphony upstream tests pass with zero failures (42 excluded), covering its supervised restart/reconciliation/retry behavior using a memory tracker. Claims remain local GenServer state; this does not prove two independent services share a durable lease. Native Claude Teams document file-locked local claims and dependencies, while Codex supplies in-session delegation; neither documented feature is erased by the cross-controller gap. See [source notes](notes-orchestrators.md).

The unmodified OpenHands Automation fetch function, extracted by AST and supplied a synthetic ORM table, is executed against SQLite and PostgreSQL17.11. SQLite's two sessions select the same row; PostgreSQL's first transaction locks it, the second skips it, and rollback makes it selectable again. This is ready transactional coordination worth reusing; full scheduler/dispatcher, external board mapping and PR fencing remain unverified. Agent Canvas's pinned native source `--help/--version/--info` runs without launching the backend. Actual GitHub Agent HQ access/model execution is untested; its documented multi-provider surface is separate from Codex local subagents.

## File ownership

See [ownership.md](ownership.md). Board Issues/links own tasks/blockers; Git commits/PRs own code. Native task lists remain in-session. A persisted handoff explains state but does not override the board. Memory is not consulted for task ownership. Rig owns future installation/doctor only. The lab-only Git claim ref is explicit cooperative metadata outside the issue field, not a hidden scheduler or universal task database.

## Conflicts

Issue body/assignee updates are insufficient for the tested optimistic claim. A Git reference can serialize a cooperative claim lineage, but privileged force pushes and direct merges bypass it. Independent PR changes conflict even when task ownership is disjoint; native Git detects this before merge. No installer file collision is inferred from an orchestration source test. Full ready-orchestrator Rig overlap/lifecycle remains unverified.

## Security findings

**Release/closure blocker:** GitGuardian found an API-supplied temporary clone credential in a full repository metadata response; independent scan also found it in already merged B evidence. Current files and collectors are repaired and tested, but published history/cache cleanup and token invalidation are unresolved. See [security incidents](../../docs/security-incidents.md). Primitive experiment results do not erase this violation of the no-credentials requirement.

Exact private-repository guard precedes board writes; tokens remain inside gh authentication. All task/code data is synthetic and all experiment PRs are closed. Same-account COMMENT review and process actors are explicitly disclosed. Clock skew, crash during side effects, stale-worker direct publication and historical replay are not solved by the prototype. See [security.md](security.md).

## Maintenance cost

Estimate **2–3 integration days / 2–3 annual maintenance days** for a thin GitHub task/handoff skill plus version/permission doctor, overlapping generic native distribution. A production cooperative lease adapter would add **5–8 development days / 3–5 annual days** for idempotency, expiry, restart/fencing and API failure testing; that is a conditional proposal, not code delivered here. Hard authorization-bound publication and another board adapter require separate measured work. Ready orchestrator service operations are not charged as zero or hidden inside Rig.

## What failed

GitHub issue conditional mutation is explicitly unsupported. In-session state alone does not establish durable cross-controller claim ownership. A current-event equality check does not establish exactly-once external event delivery. Synthetic Git ref fencing does not atomically fence unrelated side effects. An initial collector guard rejected its own cache-busting privacy GET before any external mutation; the guard now checks the endpoint path separately from query parameters. The first hosted upstream command passed10 tests, but a collector substring check incorrectly treated `10 tests` as `0 tests`; raw output is retained and the counter parser corrected before canonical acceptance.

## What remains unverified

Actual native model teams and Claude→Codex continuation; native compaction; two autonomous next-task selectors; Jira/other board transition CAS; full distributed lease protocol and server-clock policy; hard publication fencing; event replay after later lease epochs; exactly-once task export; complete production Symphony/OpenHands install/update/uninstall and Rig overlap. No credentials or paid inference were fabricated to conceal these limits.

## Verdict: ADAPT

Use native execution agents, real board links, Git worktrees/PRs and a thin task/handoff skill. Keep Rig as installer/doctor. Do not make fully autonomous cross-harness multi-controller dispatch a guaranteed1.0 feature on this evidence. A single accountable lead can coordinate work through existing tools; its operational safety still depends on explicit ownership and review, not a fictional issue lock.

The measured conditional-update gap can justify a **small optional claim adapter** if distributed autonomy is required. Reuse an existing transactional primitive or an already deployed qualified orchestrator; do not build a general queue/framework. The lab Git ref proof is not promoted to a production guarantee. Ready orchestrator source/runtime findings constrain this decision and are described in the associated notes; their generic job claims must not be conflated with external issue/PR fencing.

## Consequences for Rig

No central scheduler, provider SDK, task-state memory or universal workflow DSL. Install/document the board skill and native capabilities. Doctor checks available commands/auth scope and links without owning credentials. Keep task identity feature-scoped; consume actual dependencies and PR state. Offer autonomous distributed mode only after the chosen ready backend or small adapter passes the unresolved crash/replay/publication gates.

## Reproduction commands

`node scripts/spike-d-board.mjs` performs authorized writes only in this private lab, creates a fresh synthetic run and closes its issues/PRs in finally. Do not run it against production. `node scripts/spike-d-orchestrators.mjs --symphony-tests` uses exact public source with local synthetic runtimes; `.github/workflows/spike-d.yml` provisions the same hosted dependencies without board writes. Optional existing Linux self-hosted lane is workflow_dispatch only. Native model/session tests require separately available credentials and are not silently run.

## Artifact links

[Board evidence](evidence/board/), [official board contracts](evidence/board-sources.json), [orchestrator evidence](evidence/orchestrators/), [orchestrator source notes](notes-orchestrators.md), [scenario ledger](scenario-ledger.json), [scores](scores.json), [review](review.md), [result](result.json).

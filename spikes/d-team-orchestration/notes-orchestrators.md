# Ready orchestration source review

Checked 2026-09-14. These are official documentation, pinned code, native source CLI and bounded unit/query probes. No paid model session, native task claim, real Agent HQ session, private Jira data or production configuration was accessed. The lab collector is not a product scheduler.

## Pins and provenance

| Surface | Pinned revision | License and activity |
|---|---|---|
| Symphony 0.0.2 | `653f8b3cc476db03420479ba6f95b2ed7281c401` | Apache-2.0; release July 24, latest repository push September 9 |
| OpenHands Agent Canvas 1.18.0 | `9120ff6cbbe23640f0e475661e5a9c9729cdbf1f` | MIT; release September 11, repository active September 14 |
| OpenHands Automation 1.11.1 | `bc625068a9028849c32760e4fc9f66ec12b70872` | MIT; release September 9, repository active September 14 |
| Codex 0.154.0 | `6b9826e3aa83b1a5947db50f4332cb9c65f1b340` | Apache-2.0 source; release September 9, repository active September 14 |
| Claude Code 2.1.270 | F/E verified native distribution | Proprietary native CLI; current team behavior comes from official docs, not an open implementation audit |

`evidence/orchestrators/*-metadata.json` records actual tag resolution and upstream activity. The collector hashes fetched code/license bytes and the Symphony archive; Python dependency freeze and Mix lock hash accompany execution. GitHub source commits are immutable inputs, but this is not a fully offline hash-locked bootstrap or a package redistribution approval. Canvas's pinned defaults also select agent-server 1.46.0; that runtime was not installed or audited end to end.

## Native teams and Agent HQ

Claude Agent Teams are experimental and disabled by default. The documented task list supports dependencies and file-locked claims; teammates can select unassigned, unblocked tasks. One fixed lead owns one team per session. Local tasks persist, but resuming does not restore in-process teammates; completion status can lag and require correction. Team configuration is runtime-owned and removed at session end. These controls do not establish independent cross-harness controllers or external PR fencing. No native task tool was invoked in this no-inference trial. [Official Claude team documentation](https://code.claude.com/docs/en/agent-teams).

Current Codex subagents are enabled by default and support delegated threads, messaging, waiting and closing. Delegation follows an explicit request or applicable project/skill instruction. The pinned `AgentControl` holds a weak thread-manager handle and shared in-process registries/residency state; this is session orchestration, not an external issue lease protocol. Parallel writes still need coordination. No compiled Rust unit suite or model execution was performed. [Official subagent docs](https://learn.chatgpt.com/docs/agent-configuration/subagents), [pinned control implementation](https://github.com/openai/codex/blob/6b9826e3aa83b1a5947db50f4332cb9c65f1b340/codex-rs/core/src/agent/control.rs).

Agent HQ is GitHub's multi-provider agent surface, separate from local Codex subagents. Current GitHub policy docs permit Claude/Codex partner agents on all paid Copilot plans, subject to repository and account/organization enablement. This supersedes narrower February launch eligibility. Actual access, execution and handoff were not tested; do not infer a subscription blocker or successful provider switch. [Current official policy documentation](https://docs.github.com/en/copilot/how-tos/manage-your-account/manage-policies#enabling-or-disabling-third-party-coding-agents-in-your-repositories).

## Symphony ownership and reconciliation

Symphony's Elixir GenServer initializes `running`, `blocked`, retries and a `claimed` MapSet in memory. Dispatch checks those local structures before spawning. Active issue state, assignment and label changes trigger reconciliation; retry timers carry attempt identity so stale messages can be ignored. The runtime supervisor uses `one_for_all`, stopping workers when the orchestrator restarts. That prevents overlap within its supervised runtime; it does not turn two independent service instances into a distributed lease holder. Reconstructing work from tracker/workspaces after restart differs from preserving a durable claim epoch. [Pinned orchestrator](https://github.com/openai/symphony/blob/653f8b3cc476db03420479ba6f95b2ed7281c401/elixir/lib/symphony_elixir/orchestrator.ex), [runtime supervisor](https://github.com/openai/symphony/blob/653f8b3cc476db03420479ba6f95b2ed7281c401/elixir/lib/symphony_elixir/agent_runtime_supervisor.ex).

The hosted collector selects ten unmodified upstream tests for restart overlap, empty reconciliation, reassignment, blocked/retry release, normal/abnormal exit and stale retry messages. They use a memory tracker and synthetic hooks, not a live board/model. Canonical hosted run 34841316242 executes ten tests with zero failures and 42 excluded. The first hosted run also passed the upstream tests but exposed a lab substring-counting error; its output is preserved separately. Local Windows did not run Elixir. [Upstream test source](https://github.com/openai/symphony/blob/653f8b3cc476db03420479ba6f95b2ed7281c401/elixir/test/symphony_elixir/core_test.exs).

Deployment owns a workflow file, Elixir runtime/dependencies, workspace root, hooks and logs. The release is Codex-backed; a portable specification is not a tested Claude runtime adapter. Workspace hooks can have side effects, so their ownership matters. Cross-version update, uninstall cleanup, independent-controller collision and live tracker crash recovery remain unverified.

## OpenHands actual backend boundary

The current OpenHands repository is Agent Canvas, a Node UI and backend launcher, not the older Python monolith. Its source `--help`, `--version` and `--info` paths run with Node builtins only. The collector executes those unmodified paths from pinned source without installing or launching the stack. The full launcher can install agent-server and automation through uvx; that was not invoked. [Pinned launcher](https://github.com/OpenHands/OpenHands/blob/9120ff6cbbe23640f0e475661e5a9c9729cdbf1f/bin/agent-canvas.mjs), [stack defaults](https://github.com/OpenHands/OpenHands/blob/9120ff6cbbe23640f0e475661e5a9c9729cdbf1f/config/defaults.json).

Automation's scheduler and dispatcher use PostgreSQL `FOR UPDATE SKIP LOCKED` for selecting jobs, with scheduling/claim-state changes committed transactionally. SQLite explicitly assumes one process and omits row locking. The watchdog checks execution status after deadlines and conditionally updates running records. These are real ready job coordination mechanisms; saying OpenHands has no durable claims would be wrong. They coordinate automation runs, not exclusive ownership of arbitrary external issues, worktrees or merges. [Scheduler](https://github.com/OpenHands/automation/blob/bc625068a9028849c32760e4fc9f66ec12b70872/openhands/automation/scheduler.py), [dispatcher](https://github.com/OpenHands/automation/blob/bc625068a9028849c32760e4fc9f66ec12b70872/openhands/automation/dispatcher.py), [watchdog](https://github.com/OpenHands/automation/blob/bc625068a9028849c32760e4fc9f66ec12b70872/openhands/automation/watchdog.py).

The query probe extracts the unmodified native `_fetch_enabled_automations` AST, uses a synthetic ORM table and real SQLAlchemy sessions, and distinguishes that scope from full-backend testing. Locally, two SQLite transactions both selected the same eligible row; the PostgreSQL branch compiled the expected locking SQL. Hosted PostgreSQL additionally tests first-owner locking, a second transaction skipping the row, and rollback releasing it; canonical PostgreSQL 17.11 results pass: the second transaction skips the locked row and rollback releases it. This tests a query boundary, not complete scheduler execution, model correctness or crash recovery.

The default stack owns separate conversations, automation database, configuration and backend processes. Uninstalling its launcher is not demonstrated to remove or migrate backend state. PostgreSQL versus local SQLite changes the operational requirement. Agent Canvas can target different backends and ACP agents, but actual Claude/Codex switching, subscription access and all provider/state migration paths remain unverified. [Official backend documentation](https://docs.openhands.dev/openhands/usage/agent-canvas/backends).

## Consequence for Rig

Native agents and the existing board remain a reasonable default without a Rig scheduler. Symphony is a ready single-controller issue runner; OpenHands offers a more substantial automation service with real PostgreSQL coordination. Adopt either only when its operational model is desired, rather than reconstructing its scheduler inside Rig. A cooperative Git-reference claim demonstration does not supersede native job locking and must not be advertised as hard fencing against privileged external writes. No ready surface tested here proves universal cross-controller issue/PR ownership.

Reproduce with `node scripts/spike-d-orchestrators.mjs --symphony-tests` in the isolated hosted workflow. Without that flag, only source/CLI and query checks run; the PostgreSQL branch requires the explicitly guarded ephemeral lab service URL. Full package install/update/removal and model sessions remain unverified.

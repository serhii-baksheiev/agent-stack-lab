# Maintenance estimate

Developer-day ranges for the [recommendation](final-recommendation.md). Sources are the spike `result.json` estimates (engineering judgments, never measured labour); rows marked *(inference)* have no spike figure and are this synthesis's own estimate. Ranges are deliberately wide; the main uncertainty is stated at the end. Nothing here is a commitment.

## Spike figures (do not sum)

| Spike | Integration days | Annual days | Scope of the figure |
|---|---|---|---|
| A | 3 (2–4) | 3 (2–4) | Spec Kit composition, ownership adapter; no workflow engine |
| F | 5 (4–7) | 6 (4–8) | Native install/update/remove + wiring doctor for two harnesses; overlaps A |
| C | 1 | 1 | Optional Figma install + connection diagnostic |
| B | 2 | 2 | Workflow docs/compatibility; +1–2 / +1–2 per optional BMAD or OpenSpec |
| E | 3 | 3 | Optional Basic Memory registration/diagnostics; overlaps F |
| D | 3 (2–3) | 3 (2–3) | Thin GitHub task/handoff skill + auth/version doctor; optional claim adapter +5–8 / +3–5 |

The reports state that A/F/B share lifecycle work and C/E/D reuse registration/doctor code, so the naive sums (17 integration, 18 annual) overstate the core.

## Estimates by work item

| Item | Developer-days | Basis |
|---|---|---|
| One-time migration of existing 0.9.0 installations (inventory tooling, snapshot/rollback, cross-release fixture, docs) | 4–8 | *(inference)*; A's removal adapter and same-version replays are the only executed analogues |
| 0.9.1 fix-only release | 1–3 | *(inference)*; A negative rows (help exit codes, CRLF hashing); docs |
| 0.9.2 deprecation release (notices, receipt diagnostics, cross-release fixture) | 3–6 | *(inference)* built on F receipt needs |
| 0.10.x architectural turn (payload reduction, doctor, uninstall, guard fixtures, Memory externalised) | 12–20 | Non-additive combination of A 2–4, F 4–7, D 2–3 plus uninstall/doctor rebuild *(inference for the rebuild share)* |
| 1.0.0 contract freeze (schema freeze, Linux+Windows lanes, cold bootstrap, licence records) | 5–10 | *(inference)*; cold bootstrap unverified in all spikes |
| Annual maintenance, Lean Rig core | 10–16 per year | *(inference)*: F 4–8 + A 2–4 + D 2–3 plus C 1 / B 2 / E 3 registration and pin upkeep (naive 14–21), de-duplicated for shared lifecycle/doctor code; two harness release trains |
| Annual maintenance, full 0.9.0 scope | 20–35 per year | *(inference)*: adds queue/journal/revalidation/Memory pass-through scripts for two harnesses with no fixtures today; lower bound assumes they are left untested, upper bound assumes fixtures are written |
| Adaptation cost when Claude Code or Codex change (per significant release) | 1–3 per harness per release | *(inference)* from F: registration APIs, settings ownership and import behaviour changed between versions; Codex marketplace refresh rejects local sources |
| Optional team/board integration (thin skill, doctor) | 2–3 initial, 2–3 per year | D result.json |
| Optional claim adapter (only if distributed autonomy is required) | 5–8 initial, 3–5 per year | D conditional proposal; gates unresolved |
| Optional Memory integration (Basic) | 3 initial, 3 per year | E; AGPL decision excluded |
| Optional Figma integration | 1 initial, 1 per year | C; OAuth/licence decisions excluded |
| Optional BMAD or OpenSpec profile | 1–2 initial, 1–2 per year each | B |
| Ready orchestrator (Symphony/OpenHands) operations | not estimated | D: deployment/ops unqualified; do not hide inside Rig |

## Assumptions

- One maintainer familiar with both harnesses; GitHub-hosted CI; Windows checks limited to path/process/wiring lanes.
- Native packages are maintained upstream; Rig only pins, installs, records and diagnoses.
- No workflow engine, scheduler, queue, Memory engine, provider SDK or projection DSL is added; adding any of them invalidates every row.
- Subscription, model inference and service hosting costs are excluded.
- Figures are ranges of developer-days, not calendar time or agent runtime.

## Main source of uncertainty

The largest unknown is the Rig source itself: no spike audited the private production repository, no cross-release upgrade was executed, and none of the 0.9.0 hooks, doctor, queue or Memory pass-through ran. The 0.10.0 and full-scope rows therefore carry the widest ranges. The second unknown is harness churn: Claude Code and Codex changed registration and import behaviour within the lab's own version window (F), so per-release adaptation may recur more often than assumed.

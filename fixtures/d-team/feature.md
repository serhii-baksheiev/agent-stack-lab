# Synthetic counter formatting

Requirement D-R1: render a non-negative count as `Count: N`.
Requirement D-R2: reject negative and non-integer input.
Requirement D-R3: preserve exact output across a fresh process.

Tasks: D-T1 implementation; D-T2 validation blocked by D-T1; D-T3 documentation.
Acceptance: pure deterministic Node function; no network or persisted user data.
The board owns task state. Git branches/PRs own code state. A handoff records issue,
commit, worktree, requirement/test mapping and next action; it is not a task queue.

# Tasks: Local subscriptions

## Phase 1 — US1: valid unique subscription

- [x] T001 [US1] Write red contract checks, implement normalization/deduplication/immutable append in src/subscriptions.mjs, verify tests/subscriptions.test.mjs. Covers B-R1–B-R4.

## Phase 2 — US2: restart

- [x] T002 [US2] Verify JSON round-trip and independent fresh-process acceptance after T001. Covers B-R5.

## Phase 3 — acceptance

- [x] T003 Review requirement/task/code/test mapping and run independent acceptance after T001/T002. Covers B-R6.

Dependencies: T002 depends on T001; T003 depends on T001 and T002. No parallel
implementation is justified for one small shared function. Checkboxes are
updated only after recorded checks; exported board tasks remain board authority.

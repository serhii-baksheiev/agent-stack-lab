# Local subscriptions Implementation Plan

For agentic workers: execute this isolated laboratory plan task by task. The
upstream executing-plans and TDD skills were read manually. Additional subagent
threads are unavailable; an existing independent lab reviewer will review output.

**Goal:** Deliver the fixed duplicate-safe local function.

**Architecture:** One pure ES module; caller owns state and serialization. Linear
duplicate lookup is enough for the synthetic scale.

**Tech Stack:** Node 24, JavaScript ES modules, built-in node:test/assert, no dependencies.

**Spec:** ../specs/2026-09-14-local-subscriptions-design.md

## Global Constraints

B-R1–B-R6 from the shared brief; normalized length at most 254; IDs `sub-N`;
TypeError for invalid email; no input mutation, I/O or hidden state.

## Task SP-1: validated immutable transition

Files: create src/subscriptions.mjs and tests/subscriptions.test.mjs.

- [x] Write tests covering normalization, invalid values, frozen input, new ID and duplicate reuse.
- [x] Run tests with the explicit not-implemented stub; verify behavior failure.
- [x] Implement the minimal transition without dependencies.
- [x] Run the candidate tests and shared independent acceptance.

## Task SP-2: restart and review

Depends on SP-1; B-R5/B-R6.

- [x] Verify serialized state in a fresh process.
- [x] Review requirement/task/code/test mapping and scope.
- [x] Update completion only from recorded verification.

Traceability: B-R1/B-R2/B-R3/B-R4 → SP-1 → src/subscriptions.mjs → candidate tests
and independent normalization/duplicate/immutability/determinism checks.
B-R5 → SP-2 → the same pure API → independent restart subprocess check.
B-R6 → SP-2 → this spec/plan and trial notes → independent artifact review.

Continuation: read both linked documents, inspect the latest test evidence and
resume unchecked steps. No private transcript or native task list is authority.

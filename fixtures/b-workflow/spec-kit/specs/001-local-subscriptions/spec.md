# Feature Specification: Local subscriptions

**Feature Branch**: `001-local-subscriptions`
**Created**: 2026-09-14
**Status**: Implemented laboratory trial; independent acceptance/review required
**Input**: Shared synthetic feature brief, B-R1–B-R6.

## User Scenarios & Testing

### US1 — Subscribe once (P1)

Given caller-owned state, a valid address creates one normalized subscription.
A repeat of the same address with different case/outer whitespace returns the
original record. This is the smallest independently useful behavior.

Acceptance: empty state + ` SYNTHETIC@EXAMPLE.TEST ` gives `sub-1`; repeating the
normalized address keeps one record. Invalid input throws TypeError without
mutation. A different address creates `sub-2` and keeps the existing record.

### US2 — Continue after restart (P2)

Given JSON-serialized returned state, a fresh process can repeat US1 without
adding a duplicate. Independent test: import the module in a new Node process,
load caller state and submit the prior address.

### Edge Cases

Non-string inputs, empty strings, inner whitespace, multiple `@` signs, no dot
in the domain, a normalized address of 254 versus 255 characters, frozen state.
Malformed pre-existing state is outside this lab's contract, not silently fixed.

## Requirements

| Requirement | Behavior | Task | Code | Acceptance |
| --- | --- | --- | --- | --- |
| B-R1 | Normalize and validate the explicit lab rule | T001 | src/subscriptions.mjs | invalid/normalization/length checks |
| B-R2 | Existing address returns its record without insertion | T001 | src/subscriptions.mjs | duplicate contract check |
| B-R3 | New deterministic ID, immutable input | T001 | src/subscriptions.mjs | frozen-state/distinct check |
| B-R4 | Pure deterministic transition, separate addresses | T001 | src/subscriptions.mjs | independent-input/several-record checks |
| B-R5 | JSON state resumes in fresh process | T002 | src/subscriptions.mjs | restart subprocess check |
| B-R6 | Brief through acceptance traceability | T003 | feature documents | independent artifact review |

## Success Criteria

All shared acceptance checks pass. No extra record is created on replay. No
input object changes. The feature can be understood and resumed from these
files without a private chat transcript.

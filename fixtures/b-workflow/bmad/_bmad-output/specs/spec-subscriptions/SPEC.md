---
id: SPEC-subscriptions
companions: [ARCHITECTURE-SPINE.md, acceptance-contract.md]
sources: [../../../../feature-brief.md]
---
# Duplicate-safe local subscriptions

## Why
The synthetic subscription-card caller must recognize repeated submissions across normalization and a JSON restart.

## Capabilities
- **CAP-1**
  - **intent:** Caller can reject invalid addresses without changing saved data.
  - **success:** B-R1 invalid inputs throw TypeError; valid values normalize exactly as the acceptance contract defines.
- **CAP-2**
  - **intent:** Caller can reuse an existing subscription.
  - **success:** B-R2 duplicate input returns the same record and ID with created false and no addition.
- **CAP-3**
  - **intent:** Caller can save separate subscriptions without altering prior state.
  - **success:** B-R3 and B-R4 creation returns the normalized record, length-derived ID and created true; two distinct addresses remain separate and repeated evaluation is deterministic.
- **CAP-4**
  - **intent:** Caller can continue using serialized subscriptions after restart.
  - **success:** B-R5 JSON roundtrip and fresh module import retain duplicate identity.
- **CAP-5**
  - **intent:** Lab reviewer can assess the delivered change against its requirements.
  - **success:** B-R6 maps every shared requirement to task, code and test with review evidence.

## Constraints
Input is caller-owned state; no mutation, packages, external effects, hidden global state, time or randomness. The exact interface and validation contract in the companion bind all capabilities.

## Non-goals
Real users, email delivery, backend, UI implementation, general email-standards compliance, corrupt-state repair, and a workflow engine.

## Success signal
A caller submits the same normalized address before and after JSON restart and retains one subscription with one ID; all shared domain tests pass.

# Independent review

Reviewers: separate Codex agents `/root/a_review` and `/root/a_final_review`, 2026-09-14.

First review required corrections: prerequisite/survivor exit checks, surfaced git failures, complete ownership inventories, Windows CRLF finding, scoped survivor wording and distinction between inspected and executed security guards. These were implemented before the final successful Linux run.

The final reviewer gave conditional APPROVE, requiring a complete artifact-quality check, accurate Codex score wording and final run links. All three conditions are fulfilled. `node scripts/validate-a-evidence.mjs` verifies 292 complete commands (no timeout/collector error), 97 snapshots with successful git status/diff, and ledger/result count agreement. Thus preservation observations cannot be accepted from an incomplete installer process. This guard runs in ordinary lab CI without reinstalling tools.

The review discovered real evidence gaps rather than merely endorsing a README comparison. Tightened checks exposed and classified the baseline ENOBUFS collector failure and Spec Kit's repeat-init registration loss. These are preserved in the report, with failed compatibility scenarios retained in the ledger.

Source and tests remained inside the private lab. The initial bootstrap was separately reviewed and merged in PR #1. A merge requires green PR CI; no production changes are authorized by this review.

# Evaluation rubric

Score each dimension 0–10, where 10 is best for the user (including lowest integration/annual maintenance cost and lock-in). Use `null` for unmeasured dimensions, never invent scores. Record evidence, confidence and rationale per score. A high average cannot compensate for a failed safety or ownership requirement.

Dimensions: user utility; maturity; maintainability; upstream activity; Claude compatibility; Codex compatibility; reproducibility; upgrade/uninstall; absence of file conflicts; teamwork; board integration; security; offline/local-first; integration cost; annual maintenance cost; low vendor lock-in; license suitability.

Verdicts: ADOPT = use upstream unchanged within tested scope; ADAPT = use with a bounded integration delta; REJECT = fails a required criterion in tested scope; BUILD = demonstrated gap justifies new code. Separate verdict from qualification status: validated, conditional, blocked, not-tested. A candidate cannot be recommended as qualified unless its official source, exact version/commit, license, activity, install/update/removal, owned files and owned state are recorded.

Evidence levels: observed real upstream command; adapter prototype; synthetic contract test; documented claim; blocked/not tested. Logs must identify command, cwd relative to the lab, exit code, timestamp and duration. Snapshot operations include relative paths, sizes, SHA-256 hashes, git status and diff. Preserve failures and skipped cases. Same-version replay tests idempotence, not migration across releases. A baseline dry-run must not mutate files.

Each spike starts with a falsifiable hypothesis, timebox and stop conditions, includes executable behavior tests and an independent review. Record raw observations before conclusions. Do not treat mocked native agents, mocked boards or hand-authored generated output as live upstream success.

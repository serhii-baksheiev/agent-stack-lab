# Spike A plan

Hypothesis: Rig can compose Spec Kit without copying its implementation and while preserving manifest ownership, edits, deletions and deterministic removal.

Timebox: at most two developer-days. Started 2026-09-14; report actual elapsed time separately. Stop only the affected scenario on missing credentials, unverifiable package integrity, unsupported CLI operation or resource exhaustion. Continue independent local/hosted work. No production repository changes.

Pins: create-agent-rig 0.9.0, verified npm SHA-512; Spec Kit v1.0.6, commit 96c9bd657bfd5de0d651a6165084932b7304ac99, MIT, released 2026-09-10. Official repository last push observed 2026-09-12. Source: https://github.com/github/spec-kit/releases/tag/v1.0.6.

Run independent Rig-first and Spec-Kit-first repositories, then repeat init, dry-run, edit/delete, same-version upgrade, uninstall and survivor checks. Separate same-version replay from cross-release upgrade. Inventory Claude/Codex paths and all shared files; introduce synthetic collisions when no natural collision exists. Core and optional agent-context extension are separate ownership surfaces.

Qualification requires observed upstream operations. A test helper's removal is an adapter prototype, never an upstream uninstall claim. Live harness execution is distinct from file validation. Offline claims require network denial, not just a warm cache.

Environment event: Windows Python query failed with OS error 1450 (insufficient system resources); approximately 0.7 GiB RAM free and 109 Node processes observed. No unrelated processes stopped. Baseline runner owned by this task stopped; hosted Ubuntu fallback prepared. Python venv subsequently created after memory availability improved.

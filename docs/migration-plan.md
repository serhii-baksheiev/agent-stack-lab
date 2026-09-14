# Migration plan: from Rig 0.9.0 to Lean Rig

Reversible, wave-based plan for existing `create-agent-rig@0.9.0` installations. Every wave has a rollback; no wave is applied from this laboratory. Evidence references are to the spike reports; where a step rests on inference rather than a spike observation it is marked *(inference)*.

## Ground rules

- **Ownership inventory first.** Before any wave, the installed manifest (`.claude/.rig-manifest.json`, per-file SHA-256) is compared with the working tree to classify every managed path as pristine, modified, deleted or foreign. Modified and deleted paths are never touched by an automated step (A, F, C, B, E all rely on this contract).
- **Backup.** A byte snapshot of `.claude/`, `.codex/`, `.agents/`, `.rig/`, `CLAUDE.md`, `AGENTS.md`, `PLAN.md` and the manifest is written outside the repository before a wave runs. Rollback of any wave is "restore the snapshot for owned pristine paths only; leave user files".
- **Native packages are managed natively.** Spec Kit, Superpowers, Figma bundle, Basic Memory are installed, updated and removed with their own or the harness's commands (A, B, C, E). Rig records a receipt; it does not copy their files.
- **Line endings.** Hash after normalising line endings so a Windows CRLF rewrite is reported as wiring drift, not as a user modification (A negative row).

## Waves

| Wave | Scope | Leave unchanged | Deprecate | Remove | Move to optional layer | Replace with native/ready | Rollback | Preconditions |
|---|---|---|---|---|---|---|---|---|
| 0 Inventory (0.9.1) | Diagnostics only | Everything | Nothing | Nothing | Nothing | Nothing | None needed (read-only) | `upgrade --dry-run` read-only confirmed (A) |
| 1 Deprecation notices (0.9.2) | Output/docs | Payload bytes | queue, journal, run-state, revalidation, skeletons, Memory pass-through, `--force` | Nothing | Nothing | Nothing | Reinstall 0.9.1 | Cross-release fixture 0.9.0→0.9.2 preserves edits/deletions |
| 2 Receipt and doctor (0.10.0-alpha) | Add `doctor`, native registration receipt | User files, all guards | — | Nothing yet | — | Doctor reads native handles (Claude plugin list, Codex marketplace state, MCP registrations) | Delete receipt file; 0.9.2 continues to work | Doctor has reproducible exit statuses in the lab |
| 3 Payload reduction (0.10.0) | Remove pristine copies of deprecated scripts and `.claude/queue.json` | Modified or deleted copies (user decision), rules, skills, agents | — | Pristine queue/journal/run-state/revalidation/skeleton files, `PLAN.md` if pristine | Memory subsystem to its own package; claim adapter, Symphony/OpenHands to optional | Task state → board Issues/links; code state → Git/PRs (D) | Restore removed pristine files from snapshot | Ownership inventory clean; A-style removal fixture passes on Linux and Windows |
| 4 Guards (0.10.x) | Ship only guards with execution fixtures | Existing guard files the user modified | Unverified guards | Guards that fail or lack fixtures (pristine copies only) | — | Native hook mechanisms per harness | Restore guard files from snapshot | Each shipped guard has denied/allowed fixture output in CI |
| 5 Uninstall (0.10.x) | Add conservative `uninstall` | Foreign files, edited files, specs, tasks, notes | — | Owned pristine files and Rig registrations only | — | Native uninstall for each plugin (F/C/B proven) | Reinstall from pinned version | A adapter behaviour reproduced: preserve foreign files, refuse on modified wiring |
| 6 Contract freeze (1.0.0) | Freeze receipt/manifest schema | — | — | 0.9.x payload support | — | — | Stay on last 0.10.x | All 1.0 gates in the [recommendation](final-recommendation.md) |

## Migrating an existing 0.9.0 installation

1. Run wave 0 diagnostics; export the ownership inventory and snapshot.
2. Upgrade to 0.9.2; confirm the cross-release fixture result on the user's platform (Linux and Windows lanes).
3. Install native components through their own commands (Spec Kit, optional Superpowers/Figma/Basic Memory); record receipts. Order matters only for `.claude/settings.json`: install native plugins after Rig or reconcile the settings edit explicitly (F, B, C).
4. Upgrade to 0.10.0; the payload reduction removes only pristine deprecated files and reports every modified or deleted one for the user's decision.
5. If custom Memory is retained, install it as its own package and register it through the receipt; no `claude-config` checkout is required for Rig itself.
6. Run `doctor`; keep the snapshot until the next release cycle.

## Preserving user edits and deletions

Byte-level before/after snapshots are the acceptance test for every wave (all spikes' `ownership.json`). A modified managed file is handed over, never overwritten (A). A deleted managed file is never restored (A/F/C/B/E). Foreign files (Spec Kit, BMAD output, notes) are outside Rig's write set (A removal adapter preserved 36 Spec Kit files). Wiring files shared with native tools (`.claude/settings.json`, `.codex/hooks.json`) get a separate verdict and are reconciled manually when both sides changed them (A, F).

## End of support for the old payload

0.9.x payload support ends at 1.0.0. Between 0.10.0 and 1.0.0 the removed scripts remain available as pristine copies in the 0.9.2 tarball for rollback; nothing in this plan deletes user-modified copies.

## Conditions before any production rollout

- Owner decision on this recommendation and on Memory/licence questions.
- Cross-release upgrade, uninstall, doctor and guard fixtures green on GitHub-hosted Linux and Windows lanes.
- Cold pinned bootstrap reproduces an installation (unverified in all spikes).
- Security: the laboratory credential incident is reconciled to the owner's satisfaction; production collectors use the allowlist projection from day one.
- No production repository or Jira project is touched from this laboratory; rollout happens from the Rig repository through its own release process.

## Rollback summary

Every wave is reversible by reinstalling the previous pinned version and restoring the pristine snapshot; user files are never part of a rollback. Waves 3 and 5 are the only ones that delete files, and both delete pristine owned files only *(inference: behaviour specified here, executed only as A's lab adapter)*.

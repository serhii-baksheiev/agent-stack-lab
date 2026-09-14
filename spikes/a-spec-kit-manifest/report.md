# Spike A: Spec Kit × Rig manifest

## Hypothesis

Rig can compose Spec Kit without copying its implementation while preserving file ownership, user edits, deliberate deletions and safe removal. Maximum budget: two developer-days; investigation began 2026-09-14. Resource failures stop the affected OS lane, not independent hosted experiments. See [plan](plan.md).

## Candidates and pinned versions

* Published `create-agent-rig@0.9.0`; registry tarball and verified SHA-512 are in baseline provenance. No production checkout was used.
* GitHub Spec Kit `1.0.6`, commit `96c9bd657bfd5de0d651a6165084932b7304ac99`, MIT. [Official release](https://github.com/github/spec-kit/releases/tag/v1.0.6), published 2026-09-10. Repository API showed activity on 2026-09-12; checked 2026-09-14.
* Cross-release starting point: Spec Kit `1.0.5`, commit `a4e25ce6b96dc8e85f84206c6a54353fa9c5260b`.

Spec Kit installed from the exact official Git commit into a disposable Python environment. Dependency resolutions are captured separately. This is an experimental installation record, not a fully hash-locked Python dependency distribution.

## Test environment

GitHub-hosted Ubuntu, Node 24 and Python 3.11; exact runtime versions and scenario SHA in evidence. Local Windows 11, Node 24.18.0, npm 11.3.0, Python 3.11.9. Windows hit OS error 1450 and subsequent multi-minute git subprocess stalls; interrupted Windows scenarios are not Ubuntu passes. No unrelated process was terminated.

## Rig baseline

Actual CLI `--version` returns 0.9.0. Both `init --help` and `upgrade --help` exit 1 with unknown-option errors and print the general usage. We used the documented general-help forms `init`, `upgrade --dry-run`, `upgrade --yes`, and `--version --json`.

Hosted final measurement: 83 payload files plus one manifest; 1,111,187 bytes; init 542 ms after npm preparation (initial run: 585 ms). Timing is an observation, not a performance benchmark. Windows baseline init took 1,917 ms with the same size. The registry tarball contains 270 entries and is distinct from the installed process-layer payload. Manifest, hashes, git status, complete intent-to-add diff, handshake and command logs are recorded under [baseline evidence](evidence/rig-baseline/).

## Scenarios

Independent Rig-first and Spec-Kit-first git repositories exercise first install, snapshot, second install, snapshot, Codex integration install, repeat init, read-only Rig dry-run, commit, edits to both context anchors and settings, Rig file deletion, upgrades, Spec Kit skill modification/deletion, Spec Kit Claude integration uninstall, and survivor status.

Rig repeat init refuses an existing installation. Spec Kit edited-skill upgrade refuses without `--force`. Both retain the tested user edits. Rig retains a deleted rule; Spec Kit restores a deleted managed skill. No natural second-component file overwrite was observed in either order. The initial combined Claude installation owns 120 files: Rig 84 including manifest, Spec Kit 36.

After installing Claude and Codex, repeating force-init for Claude and then uninstalling Claude leaves `integration status --json` at exit 1 with `integration-state-missing`, despite earlier Codex installation. This is counted as a failed multi-provider lifecycle scenario, not hidden by successful byte-retention checks. A separate fresh experiment checks the intended `integration upgrade` route instead of repeat init. Stack lifecycle must call the native upgrade operation, not reuse bootstrap as an updater.

Actual `1.0.5 → 1.0.6` integration upgrade updates command skills and metadata while retaining a synthetic constitution customization. Same-version replay elsewhere is explicitly not counted as a cross-release migration.

Offline install runs twice in a Linux network namespace with no routes, using the verified npm cache and installed Spec Kit's bundled assets. Both succeed and produce 120 files. Three Spec Kit metadata files differ in bytes; full byte reproducibility fails. Do not infer an uncached air-gapped bootstrap from this warm-cache test.

## Measurements

Final counts are generated from [scenario-ledger.json](scenario-ledger.json), with failures measured against the stated ownership/reproducibility requirements. Green CI means successful evidence collection and expected assertions, not that every candidate meets every requirement. [Scores](scores.json) use all 17 rubric dimensions; unmeasured board/team dimensions remain null until later spikes.

42 passed, 7 failed, 5 unverified. Evidence-quality validation covers 292 completed commands and 97 git snapshots. The native multi-provider upgrade alternative passes; the repeat-init route fails. Windows newline-only repair restores exact Rig ownership in the observed fixture. [Independent review](review.md) records required corrections and their resolution.

## File ownership

| Surface | Owner in tested core composition |
| --- | --- |
| `CLAUDE.md`, `AGENTS.md`, Rig rules/agents/hooks/scripts, settings and `.codex/hooks.json` | Rig |
| `.claude/skills/speckit-*`, `.agents/skills/speckit-*` | Spec Kit integration manifests |
| `.specify/scripts`, templates, workflows and shared manifest | Spec Kit shared infrastructure |
| Constitution and future `specs/` contents | User/project; not disposable package content |
| Python environment, installed CLI/dependencies | Python installer in ignored fixture |
| Edited shared wiring | User; removal must fail closed until ownership is resolved |

Per-file owners and hashes are in each integration scenario's `ownership.json` and `final-ownership.json`, including Codex additions and retained user edits. Sharing `.claude/` as a directory is not shared ownership of every file beneath it. The lab prototype does not duplicate Spec Kit's internal manifest in a new package-manager schema.

## Conflicts

Separate wiring verdict observed in Rig's upgrade output: modified settings are handed over for manual merge. Spec Kit core does not install competing root context anchors or Rig-named hooks. Synthetic exact-path collision tests distinguish a whole-install refusal from per-path preservation. The optional agent-context extension is outside the core-composition result and needs its own qualification before adoption.

On Ubuntu, Rig preserves all eight individually seeded paths, refusing existing context anchors. Spec Kit force-init overwrites a preexisting `speckit-specify/SKILL.md` but preserves the other seven seeded paths. See [collision matrix](conflict-matrix.md). This is an explicit `--force` bootstrap behavior, not a claim that its manifest-aware upgrade destroys edits.

Windows has a distinct observed wiring issue: after Rig then Spec Kit, existing settings become CRLF instead of LF, leaving identical text after line-ending normalization but invalidating Rig's recorded hash. The conservative uninstall prototype correctly refuses. A targeted Windows lane verifies both orders and a bounded repair that restores prior foreign-owned bytes only when line endings are the sole difference. This is separate from the workstation resource blocker. A probable source is Spec Kit's native event-config writer using `Path.write_text` without a newline override; source inspection supports this inference, but the observation is the hash/byte mismatch itself.

## Security findings

Privacy was verified before inspection; all fixtures are synthetic. The downloaded baseline SHA-512 equals npm registry integrity. This establishes artifact identity relative to registry metadata, not a separate audit of the npm signing key. Native CLI and package code execute only in isolated lab repositories. No actual credentials, runtime memory or production source enter evidence.

The bounded Rig removal prototype contains inspected escaped-path and symlink-component guards; those are not exhaustively adversarially tested. A modified-wiring refusal is executed. A settings-file edit must prevent hook deletion, otherwise retained settings could reference missing executables. On pristine Ubuntu composition, the adapter removes 83 Rig files and its manifest, preserves 36 Spec Kit files, verifies integration status and executes the upstream feature-creation script. This is narrower than live Claude/Codex workflow execution. Full upstream path handling and hook security are not certified.

## Maintenance cost

Provisional engineering estimate: 2–4 developer-days for a bounded composition adapter; 2–4 days/year for integration regression checks and upstream change triage. Assumes delegation of Spec Kit templates, workflows and manifests to upstream, and excludes a new workflow engine. This estimate is judgment, not measured labor. A complete product estimate belongs to the final synthesis.

## What failed

Spec Kit does not meet Rig's `deleted stays removed` property for the tested skill. Full metadata byte identity fails. Repeated Rig init and edited Spec Kit upgrade deliberately refuse. Windows execution suffered external resource failures. Rig has no native uninstall command in the inspected CLI; any Rig removal here is an explicitly labelled lab adapter.

Independent review found missing CLI-exit assertions and discarded git errors in the first harness revision. After tightening checks, run 34826660793 exposed `spawnSync git ENOBUFS`: baseline diff exceeded Node's default buffer (1,049,710 captured characters). The collector now allows 16 MiB and records command errors/exits; earlier incomplete baseline diffs are superseded by the final run. This is a harness defect, not a Rig failure.

Run 34826867077 then exposed the nonzero post-uninstall Codex status, previously ignored. The experiment now explicitly characterizes that pinned upstream behavior and the ledger records it as failed compatibility. Expected observed failures are not silently relabelled as successful candidate properties.

## What remains unverified

Full Claude/Codex model execution, generated-feature quality, all optional Spec Kit presets/extensions, uncached offline bootstrap, complete CLI-environment uninstall, dependency-hash locking, and all supported Windows lifecycle paths. Core integration uninstall leaves shared `.specify` project infrastructure; it is not a full deletion of user specifications or the Python environment.

## Verdict: ADAPT

Medium confidence for the tested lifecycle scope; conditional for stack adoption. Spec Kit is a viable specification component. Use its native integrations and lifecycle; do not copy its implementation. Preserve an explicit Windows wiring compatibility gate. A replacement for the entire Rig product is not established by Spike A.

## Consequences for Rig

The possible remaining value is narrow: reproducible component selection, cross-component ownership checks, user-deletion policy, wiring diagnostics and conservative removal. Spec Kit already implements substantial manifest/upgrade/uninstall behavior; rebuilding that is unjustified. Pure Spec Kit is sufficient for a user who wants its specification skills and accepts its deletion policy. Rig currently adds 84 installed files and its own governance; the benefit of that extra payload must be justified separately in F/B/D.

Do not force-init a multi-provider project during routine updates. Prefer upstream avoiding no-op shared-settings rewrites; the demonstrated newline-only repair is a bounded fallback, not permission to build a general JSON merge engine. Recommend a documented combination conditionally, not a new package format inferred ahead of F.

## Reproduction commands

Use fresh disposable repositories under `.lab-runs`; scripts refuse to reuse scenario directories. On Ubuntu, run the commands in [.github/workflows/spike-a.yml](../../.github/workflows/spike-a.yml): baseline capture, install the two pinned Spec Kit environments, `node scripts/spike-a.mjs`, `node scripts/spike-a-release-upgrade.mjs`, `node scripts/spike-a-collisions.mjs`, then the namespace-isolated offline script. Routine structural check: `node scripts/validate.mjs`.

The full experiment dispatcher requires a Linux runner with Git, Node, Python, `ip`, and permission to use `sudo unshare -n`/`runuser`; an existing self-hosted label may be supplied. It is optional and is not a mandatory PR lane. Windows uses the separate short wiring workflow, not the Linux namespace script. Python package downloads are cached. No macOS lane is justified by A.

## Artifact links

* [Initial baseline run](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34824781587)
* [Final Linux evidence with reviewed assertions](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34827200035)
* [Windows wiring and bounded repair](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34826867100)
* [Both-order lifecycle run](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34825136777)
* [Offline and release-upgrade run](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34825424310)
* [Official Spec Kit lifecycle documentation](https://github.github.com/spec-kit/reference/integrations.html)
* [Pinned upstream manifest implementation](https://github.com/github/spec-kit/blob/96c9bd657bfd5de0d651a6165084932b7304ac99/src/specify_cli/integrations/manifest.py)

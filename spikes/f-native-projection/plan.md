# Spike F plan

Hypothesis: native packages or Ruler can distribute one shared source to Claude and Codex while leaving project overrides intact, with Rig limited to lifecycle/doctor duties.

Started 2026-09-14 after A merged as PR #2. Timebox: one developer-day. Stop an affected operation on missing auth, unsupported API or OS resource failure; continue isolated hosted tests. Do not turn interactive import into a claimed updater. No installation in lab root and no mutation of real user harness configuration.

Pins under evaluation: Codex CLI 0.154.0 (Apache-2.0), Claude Code 2.1.270 (vendor license referenced by npm README), Ruler 0.3.44 (MIT). All versions verified against actual CLI/npm on 2026-09-14. Fixture plugin versions 1.0.0 and 1.0.1 are synthetic source artifacts, not published packages.

Test both Rig-first and native/Ruler-first orders; provider-neutral skill source; actual install, repeat, updates, user overrides and deletion, drift, uninstall and remaining-component checks. Native CLI lifecycle and schema/loader validation are distinct from live model dispatch. Hook trust and provider model/effort semantics must remain native, not hidden in a new universal DSL.

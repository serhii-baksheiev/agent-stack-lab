> History cleanup: SHA references below use cleaned identities. Pre-cleanup workflow links and measurements are historical evidence, **not exact-head evidence** of the rewritten tree. See [provenance and reference index](../../docs/history-cleanup/README.md).

# Spike B evidence review

Reviewed hosted run `34834437236` and imported evidence on 2026-09-14. Reviewer is the BMAD lab agent: independent of OpenSpec, Spec Kit, Superpowers, the shared acceptance runner and aggregate report author. BMAD lifecycle inspection is author verification; root independently reviewed its implementation/spec/spine and configured semantic lenses. No native Claude inference review is claimed.

## Verdict

Evidence supports bounded installation coexistence and the four manually authored feature implementations. It does not support an unconditional “all workflows are idempotent and preserve edits” claim, nor a successful native board exporter. No blocking implementation defect found. Preserve the negative outcomes and coverage qualifications below when selecting layers.

## Verification

- All four collector SHA256 values match the currently reviewed source files. All four acceptance `sourceSha256` values match their current implementations; each has nine passing behavioral checks. The runner explicitly separates B-R1–B-R5 behavior from B-R6/source review and now asserts duplicate object identity.
- Checked 178 imported file snapshots: every stored file count and byte sum matches the embedded file map. This verifies internal snapshot accounting; it does not independently reconstruct every remote file from hashes.
- Read lifecycle summaries, provenance, failed CLI logs, native replay records, ownership maps, before/after snapshots and collector code. Expected failures are retained rather than converted to success.

## Candidate findings

**BMAD 6.12.0.** Both installation orders change no existing files at the second installation. Native status, build renderer, spine linter, author tests, same-version update and uninstall succeed. Rig dry-run is read-only; shared user edits and a deleted Rig file survive Rig upgrade. BMAD overwrites an edited generated skill on update. Both first and second repeated updates change exactly four files: `_bmad/_config/files-manifest.csv`, `_bmad/_config/manifest.yaml`, `_bmad/bmm/config.yaml`, `_bmad/core/config.yaml`. This is not byte-idempotent; the stored snapshot union confirms no extra changed paths. Uninstall removes BMAD-owned files, changes no remaining Rig-claimed files and preserves all `_bmad-output` artifacts. A cross-version BMAD release upgrade remains unverified. Skill/template manual execution deviations are candidly recorded in notes and do not invalidate the narrower CLI results.

**OpenSpec 1.13.0.** Both installation orders preserve prior files. Repeat init is byte-identical. Update overwrites an edited generated skill and restores a deleted generated skill, while preserving Rig-owned files. Commands-only delivery reconciliation removes the Claude skill and leaves Rig functional; this is not a full uninstall. Actual 1.12.0 init followed by 1.13.0 update succeeds and changes 14 instruction paths. Artifact validation/status and restart instruction replay succeed; duplicate `new change` exits 1 because the change already exists, while read-only instruction replay stays byte-identical and reports four completed tasks. This verifies structural workflow state, not an independent assessment of implementation correctness.

**Superpowers 6.2.0 → 6.3.0.** All four provider/order combinations install, update and uninstall successfully. Native inventory observes the expected version and changed manifest hash. Claude installation after Rig changes `.claude/settings.json`; that shared wiring mutation is material ownership evidence, not an unexplained overwrite to omit. Rig user edits and deletion survive upgrades; native removal leaves Rig files and the synthetic settings marker intact. This is a local synthetic marketplace transport using pinned upstream bundles and actual provider plugin commands; it does not demonstrate public-marketplace auto-discovery or native model selection.

**Spec Kit 1.0.6.** B proves actual scaffolding, prerequisite checks, plan setup, skipped existing plan and read-only resume. Both-order Rig lifecycle is explicitly reused from A at the same exact pin, not re-run in B. Reused A results include edited upgrade exit 1, regenerated deleted Spec Kit skill, and surviving-provider status exit 1 after uninstall. They must not be summarized as unqualified preservation or surviving integration success. Rig survives the tested removal; modified Spec Kit skill preservation does not imply an installed surviving provider.

Across these candidates Rig repeat `init` exits 1 with a refusal to overwrite existing `CLAUDE.md`; use upgrade for the measured update path. Published Rig 0.9.0 subcommand help also exits 1; general help succeeds. These expected exits are not harness failures. Initial red tests are deliberate failing stubs, not unresolved final test failures.

## Governance accounting

Measured combined project snapshots: BMAD 534 files / 4,341,348 bytes in Rig-first; OpenSpec 106 / 1,325,032; Superpowers Claude Rig-first 84 / 1,111,396. Spec Kit reports 47 / 434,233 for its native scaffold. These scopes differ: combined snapshots include Rig, Spec Kit's number is its scaffold, and Superpowers project snapshots exclude the installed plugin cache. Compare them only with these labels; they are not comparable total installed package footprints or actual prompt-token costs.

## Board export

The real lab exporter follows Spec Kit task-ID matching semantics through `gh`; it is manually implemented transport, not an automatic native exporter. First export creates three issues, immediate replay creates one duplicate for T003, and closed replay creates none. Evidence therefore records `repeatDedupPassed:false`. Immediate issue listing omitted a newly created issue; a consistency/cache cause is plausible but not established. IDs are not feature-scoped, so a second feature reusing T001 could be incorrectly skipped. All four created issues, 5–8, are recorded closed. This surface needs a durable identity/reconciliation adapter before adoption; real blocker links are deferred to D and production Jira remains untouched/unverified.

No recommendation should infer automated prose generation, real stakeholder approval, semantic workflow idempotency, native board deduplication, or token-cost superiority from the green hosted job alone.

## Aggregate report approval

Bounded independent review of `report.md`, `result.json`, `scenario-ledger.json`, `scores.json`, `measurements.json` and the validator completed after aggregation. The report preserves the negative lifecycle/board outcomes, A reuse limitations, differing footprint scopes, manual authorship/activation deviations and the outside-lab npm incident with unverified exact rollback. OpenSpec reconciliation is explicitly not complete uninstall; BMAD cross-version upgrade and incremental Superpowers quality stay unverified. Selection and numeric scores are labeled engineering judgments, and unverified zeros are not aggregated as measured inferiority.

Ran `node scripts/validate-b-evidence.mjs`: PASS, 585 complete command records and 178 valid snapshots. Result totals match the ledger: 166 passed, 10 failed, 14 unverified. No unsupported quality or uninstall claim found in the reviewed aggregate. Approved as a bounded Spike B evidence report, including its stated limitations; this is not authorization to expand implementation scope or a claim of universal candidate success.

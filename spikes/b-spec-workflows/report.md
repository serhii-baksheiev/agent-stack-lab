> History cleanup: SHA references below use cleaned identities. Pre-cleanup workflow links and measurements are historical evidence, **not exact-head evidence** of the rewritten tree. See [provenance and reference index](../../docs/history-cleanup/README.md).

# Spike B: complete spec-driven workflows

## Hypothesis

Existing workflows can cover idea, brief, architecture, design context, spec,
tasks, implementation, review and acceptance without a Rig workflow engine.
The 3–4 developer-day ceiling and stop conditions are in [plan.md](plan.md).
One deliberately small synthetic feature bounds the claim: this is artifact and
lifecycle compatibility evidence, not a comparative model-quality benchmark.

## Candidates and pinned versions

Checked 2026-09-14 against official packages/source. All four upstream projects
are MIT; the native Claude binary has its separate vendor terms.

| Candidate | Exact current source | Activity | Installation/update/removal tested |
|---|---|---|---|
| [GitHub Spec Kit](https://github.com/github/spec-kit) 1.0.6 | `96c9bd657bfd5de0d651a6165084932b7304ac99` | Release Sep 10 | Pinned Python install; integration lifecycle and 1.0.5→1.0.6 reuse A evidence; fresh B dual integration |
| [BMAD](https://github.com/bmad-code-org/BMAD-METHOD) 6.12.0 | `05bfbd46d00766ec88eb9b42e76be2c575d64d7b` | Package/commit Sep 4 | Verified npm tarball; same-version update; real native uninstall |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) 1.13.0 | `9d4e5974e5c0d9a09b9c6c1e1eb0975e80ec4461` | Release/tag Sep 9 | Verified npm tarballs; 1.12.0→1.13.0; delivery reconciliation, **no complete uninstall** |
| [Superpowers](https://github.com/obra/superpowers) 6.3.0 | `b36e0829c6d0140e93cfef2ca599b1b07d4a7797` | Release Aug 12; repository push Sep 12 | Exact Git source; native plugin 6.2.0→6.3.0; native uninstall in both providers |

Previous Superpowers source is `3dcbd5c4b48e02263fbf4a3c01e3fe4f81d584d9`.
Package integrity, source inventories, native cache manifest hashes and release
metadata are in evidence. OpenSpec tag identity is not an attestation linking
source to built npm bytes. Pinning dependencies is only as complete as the
recorded installation lock; cold offline reconstruction is not established.

## Test environment

Canonical Ubuntu GitHub-hosted run
[34834437236](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34834437236),
scenario commit `87758096577df6878847c9e58979863d72452ca2`, Node 24, Python 3.11,
uv 0.12.5, Claude Code 2.1.270, Codex 0.154.0. Native CLI versions and locks are
recorded in package evidence. All model-auth variables are blanked in child
profiles. No paid model calls. Windows was used for manually loaded trials and
GitHub API export. A Windows Spec Kit helper initially failed emitting Unicode
through cp1252 stdout; the collector now explicitly selects UTF-8 and Ubuntu
completed. No repeated flaky Windows experiment was needed.

## Rig baseline

Published immutable create-agent-rig 0.9.0 tarballs were independently SHA-512
verified by B collectors. Both orders with BMAD, OpenSpec and each native
Superpowers provider are fresh Git repositories under ignored `.lab-runs`.
Spec Kit both-order lifecycle reuses **the same 1.0.6 pin** from
[Spike A](../a-spec-kit-manifest/report.md), including full baseline manifest,
hashes, diff and offline replay. General Rig `--help` succeeds; `init --help`
and `upgrade --help` are unsupported exit 1. Repeated Rig init safely refuses
existing anchors; actual supported upgrade flags are used.

A reuse is qualified: modified Spec Kit integration upgrade can exit 1, deleted
Spec Kit skills are reconstructed, and status after an integration uninstall can
exit 1. Preserved customized bytes do not prove an installed surviving provider.
The surviving Rig and native integration state must be assessed separately.

## Scenarios

All candidates implement [the same B-R1–B-R6 feature](../../fixtures/b-workflow/feature-brief.md):
a pure normalized-email subscription transition, immutable caller state,
duplicate identity preservation and restart from JSON. Four implementations
pass nine independent behavioral checks each, including a new Node process.
Local Spec Kit/Superpowers red-then-green logs prove tests failed against a
not-implemented stub before code was written. These are laboratory agent tests,
not upstream test suites. B-R6 is covered by artifact review, not by pretending
the domain test runner can judge prose.

| Stage | Spec Kit | BMAD | OpenSpec | Superpowers |
|---|---|---|---|---|
| Discovery/brief | Lab brief + constitution | Native brief conventions + memlog | Proposal | Brainstorming/design conventions |
| Architecture | Plan/research/contract | SPEC kernel + architecture spine | Design decisions | Design document |
| Design context | C synthetic context copied into feature | Shared synthetic brief reference | Shared context reference | Shared context reference |
| Spec/decomposition | Spec + T001–T003 | CAP IDs + oneshot acceptance companion | Delta requirements + 4 native tasks | Two explicit implementation tasks |
| Implementation | Codex manual load + tests | Codex subagent manual load + tests | Codex subagent manual load + tests | Codex manual load + TDD |
| Native deterministic checks | setup_plan/setup_tasks/prerequisite helpers | render_skill + lint_spine | strict validate/status/apply/archive | Plugin inventory/update/removal; no semantic validator claimed |
| Restart | Fresh helpers preserve authored files | Memlog audit is a manual decision | Fresh instructions identical; completed tasks persist | Durable checked plan; no native session restart claim |
| Review/acceptance | Peer review + shared tests | Root review + shared tests | Peer review + shared tests | Peer review + shared tests |

**Authorship boundary:** native CLIs generate scaffolding and deterministic
metadata. Agents wrote the filled prose and code after reading packaged
instructions/templates. BMAD resolver replay partly followed drafting; OpenSpec
drafting preceded final skill compliance review. Those are disclosed manual
adaptations, not full native workflow conformance. No native Claude inference,
automatic skill selection, or measured Claude-versus-Codex quality is claimed.
The fully specified brief makes comparative discovery quality unmeasurable.

Superpowers requires human approval; OpenSpec propose requires a later user
request before implementation. Standing user authorization permits this lab's
manual implementation trials. It is **not** evidence of a real approval click or
strict native prompt compliance. These gates must remain explicit in product
documentation; Rig must not silently invent approvals.

GitHub export manually follows Spec Kit taskstoissues using the available gh
transport. First export created issues #5/#6/#7. Immediate list-then-create replay
did not see #7 and created duplicate #8. Recorded list response proves the
omission; consistency/cache causation remains an inference. Later closed-state
replay created zero. All four were closed and individually verified through the
API. Task-ID-only matching would also conflate T001 in a second feature. This is
not a robust board adapter. No Jira production project was accessed. Real
blocker links and concurrent claims are deferred to D.

## Measurements

[scenario-ledger.json](scenario-ledger.json) records **166 passed, 10 failed,
14 unverified** assertions; green CI means successful observation, not universal
candidate success. Counts include nine common checks per candidate and individual
lifecycle properties, not 166 independent end-to-end deployments.

| Candidate | Tracked authored governance files/bytes | Installed repository payload |
|---|---|---|
| Spec Kit | 9 / 7,741 | Pure dual-integration B scaffold 47 files / 434,233 bytes |
| BMAD | 8 / 13,626 | Rig+BMAD+seed 534 files / about 4.34 MB |
| OpenSpec | 8 / 8,983 | Rig+OpenSpec 106 files / 1,325,032 bytes |
| Superpowers | 2 / 3,824 | 14 skills in native cache; no copied repository skill payload |

Authored sizes depend on manual depth/layout choices; installed sizes include
different scopes and are not directly comparable quality scores. See
[measurements.json](measurements.json), native source inventories, and snapshot
counts. The tiny feature does not prove that BMAD's additional governance earns
its cost on a larger project. No own production workflow code was built.

## File ownership

| Owner | Files/state | Upgrade/removal boundary |
|---|---|---|
| Rig 0.9.0 | Manifest-owned anchors/rules/agents/skills/settings | Retain modified files and deleted files; separate wiring verdict |
| Spec Kit | `.specify`, provider `speckit-*` skills; native integration state | A establishes conservative native integration lifecycle; force-init is hazardous |
| BMAD | `_bmad`, `.claude/skills/bmad-*`, `.agents/skills/bmad-*` | Native uninstall preserves `_bmad-output` and Rig; generated skill edit overwritten on update |
| OpenSpec | `openspec` state and `openspec-*` delivery skills/commands | Delivery reconciliation removes generated skills; no full uninstall contract |
| Superpowers/native harness | Versioned plugin cache; marketplace/registration; Claude project settings | Native update/remove; registration does not transfer ownership of user project artifacts |
| User/project | Specs, code, tests, design context, acceptance artifacts | Keep independently of tool installation; task board is external authority |

Exact paths/hashes and mutation ownership are in per-order `ownership.json`.
The selected baseline must not make Rig a second writer of native-owned skills.

## Conflicts

BMAD and OpenSpec second installs changed no existing Rig bytes in Ubuntu in
either order. BMAD generated skill edits were overwritten; both repeated updates
changed four config/manifest paths. OpenSpec repeat init was byte-idempotent,
but update overwrote an edited skill and recreated a deleted skill. Its documented
delivery reconciliation preserved Rig, which is useful but not full uninstall.

Superpowers via Claude changed shared settings when installed after Rig; Codex
used its isolated native cache. Both provider/order combinations preserved the
synthetic settings edit and Rig deletion through update/remove. F's wiring
qualification still applies: preserving foreign settings does not imply that all
Rig guards are wired. No evidence here authorizes blind shared-file replacement.

## Security findings

Post-spike finding during D: the full repository metadata response in board-export evidence had persisted an API-supplied temporary clone credential. The current file and collector are now projected to safe proof fields, but B's published history/cache cleanup remains unresolved. See [security incidents](../../docs/security-incidents.md). Prior successful checks did not establish credential-free history.

All feature data are synthetic; native subprocess profiles are isolated and no
tokens, parent manifest contents, caches, payload checkouts or node_modules are
tracked. GitHub requests use existing authenticated gh, with no credential output.

**Actual scope incident:** an early OpenSpec discovery install had no local
package.json and npm ascended to the existing user-home prefix outside the lab,
adding 80 packages. Targeted removal removed 80, but there is no before-image
of that manifest/lockfile, so exact restoration is **unverified**. Parent formatting
or resolution changes may remain. This violates the intended lab-only write
boundary; it is not hidden by subsequent successful runs. No production repository
was edited. Details: [scope-incident.json](evidence/openspec/scope-incident.json).
All corrected npm collectors create a private package.json, assert an absolute
lab prefix and isolate cache/config. Do not perform speculative further cleanup.

## Maintenance cost

Bounded workflow documentation/compatibility integration: approximately 2
developer-days and 2 days/year, **overlapping** A/F lifecycle work. Optional BMAD
or OpenSpec onboarding each adds an estimated 1–2 integration and 1–2 annual
days; that cost is not justified for the default stack by this small feature.
Superpowers optional native packaging adds little beyond F but requires prompt
compatibility review. These are engineering estimates, not measured labor.
Do not sum overlapping per-spike figures into a final budget.

## What failed

Ten scored failures: BMAD generated-edit preservation and byte-idempotent update
in both orders (4); OpenSpec generated-edit and deletion preservation in both
orders (4); immediate GitHub dedup and cross-feature task identity (2). Expected
Rig init refusal and duplicate OpenSpec change refusal are protections, not
defects. The local Windows encoding failure and npm scope incident are separate
collector/environment findings, preserved in diagnostics.

## What remains unverified

Native model execution/dispatch and comparative discovery quality; real human
approval; live Figma context; Jira export; BMAD cross-version upgrade and deleted
generated skill behavior; OpenSpec complete uninstall; deleting Rig while each
B component survives; cold offline bootstrap; automated semantic regeneration;
incremental Superpowers quality over Spec Kit; exact outside-lab rollback.
These exclusions prevent declaring every candidate fully qualified under the
rubric. BMAD/OpenSpec are optional alternatives requiring additional qualification.

## Verdict: ADAPT

Retain Spec Kit as the canonical specification workflow from A, with native
harness execution and project-owned artifacts. Existing tools cover the stages
without a new Rig engine. Superpowers is an optional execution-skill package,
qualified for native installation/update/removal, **not** a mandatory second
workflow: this trial does not demonstrate incremental quality. BMAD and OpenSpec
are credible alternatives with different governance, not layers to stack on top.

## Consequences for Rig

Own only pins, install diagnosis, ownership/conflict handling and documented
choices. Do not own requirement DSL, workflow state machine, approval simulation
or task queue. Board export needs feature-scoped identity and a stronger
write/read/dedup contract; D must test the board itself before any adapter proposal.

## Reproduction commands

Use the pinned setup in [.github/workflows/spike-b.yml](../../.github/workflows/spike-b.yml).
From lab root with fresh ignored fixtures:

```text
node scripts/spike-b-spec-kit.mjs
node scripts/spike-b-bmad.mjs
node scripts/spike-b-openspec.mjs
node scripts/spike-b-superpowers.mjs
node scripts/spike-b-acceptance.mjs
node scripts/summarize-b.mjs
node scripts/validate-b-evidence.mjs
```

`node scripts/spike-b-board-export.mjs` performs authorized writes only to this
private lab; it is intentionally absent from read-only CI. `--resume-observed`
finishes known issue cleanup from recorded observations without rerunning first
export. Do not run it as an ordinary smoke test. Existing ignored fixed-name
native fixtures must be archived to a verified lab-contained path before replay.
The optional workflow_dispatch runner label supports an existing Linux
self-hosted runner with the same scripts; its availability is not a PR gate.

## Artifact links

[result](result.json), [ledger](scenario-ledger.json), [scores](scores.json),
[measurements](measurements.json), [review](review.md), [BMAD notes](notes-bmad.md),
[OpenSpec notes](notes-openspec.md), [evidence](evidence/),
[private PR #9](https://github.com/serhii-baksheiev/agent-stack-lab/pull/9).
Facts are the saved command/API/hash results; selection and cost are engineering
inferences; unverified native/model/board claims are explicitly listed above.

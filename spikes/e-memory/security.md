# Memory security review

All E mutations use contained fresh lab directories and synthetic notes. MCP clients use isolated profiles with auth variables cleared; no production repository, personal memory, native transcript capture or model inference was accessed. The deliberate corruption operation verifies its own database header and closes child processes before replacing only that isolated database. It restores from its own backup. Process cleanup targets only spawned children.

Explicit path/project binding is operational isolation, not access control against the same OS user. Basic constrained requests and path traversal are tested; reference wrong-path access demonstrates the danger of configuration mistakes. Both stores return synthetic note canaries unchanged. Basic diagnostics exposes neither the synthetic config canary nor its key. Source drops sensitive keys entirely; the collector's retained-key predicate was incorrect. Exact loaded-canary input was not separately captured, so redaction ingestion remains unverified and arbitrary note redaction is not inferred.

Basic AGPL terms and reference missing packaged LICENSE prevent an unconditional redistribution recommendation; no redistribution or license decision was performed. Semantic models/auto-updates/telemetry are disabled in the trial. Python dependency versions were captured, not completely hash-locked offline. Hosted network-isolated Basic retrieval proves warm local operation only.

Package removal preserves Basic's tested note bytes and later readable state; it does not prove exact database/index retention. Full-state backup includes quiescent SQLite/config and projected Markdown. Native registration removal deliberately retains user data. Reference package-local default data is deleted by npm package removal and is unacceptable for retained shared memory.

The separate B out-of-lab npm-prefix incident remains disclosed in B's scope-incident evidence; E does not erase or reclassify it. E installers explicitly isolate package roots. No production repository changes are known.

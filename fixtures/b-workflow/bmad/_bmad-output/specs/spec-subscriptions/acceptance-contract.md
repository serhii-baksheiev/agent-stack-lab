# Acceptance contract and decomposition

The exported `subscribe(state, email)` accepts an array of `{id,email}` records, initially empty. Success returns `{state, subscription, created}`. This table is a spec-authored companion derived from shared B requirements; tasks are a manual lab decomposition, not native `stories.yaml` (headless bmad-spec explicitly forbids story breakdown).

| Requirement | Given / When / Then | Task | Code | Test |
| --- | --- | --- | --- | --- |
| B-R1 | Given any state, when input is not a string or trimmed lowercase input fails `^[^\s@]+@[^\s@]+\.[^\s@]+$` or exceeds 254 characters, then throw TypeError and leave state unchanged; otherwise use that normalized value. | T1 implement normalization and validation | subscribe validation block | validation and boundary |
| B-R2 | Given an existing email, when equivalent input is submitted, then return that subscription and unchanged ID with created false, adding nothing. | T2 implement duplicate lookup | subscribe existing branch | duplicate identity |
| B-R3 | Given valid new input, when subscribed, then return a new record whose ID is `sub-N`, N=state.length+1, with created true; never mutate input arrays or records. | T3 implement immutable append | subscribe new-record branch | immutable creation |
| B-R4 | Given two distinct inputs or repeated identical evaluations, when subscribed, then emails stay separate and results are deterministic without time, random values, I/O or hidden state. | T3 pure computation | subscribe | distinct and deterministic |
| B-R5 | Given JSON-restored state and a fresh module import, when an existing email is submitted, then do not duplicate it. | T4 fresh-import roundtrip test | subscribe existing branch | restart |
| B-R6 | Given this delivery, when reviewed, then brief, spine, spec, tasks, traceability and review/acceptance evidence are available. | T5 deliver artifact package and independent review | this fixture | root shared artifact acceptance |

Tasks T1–T3 change `src/subscriptions.mjs`; T4 adds `tests/subscriptions.test.mjs`; T5 owns `_bmad-output/` documents. Implementation tasks execute T1 before T2 before T3, then T4 and review.

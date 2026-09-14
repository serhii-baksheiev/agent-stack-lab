# Synthetic feature: duplicate-safe local subscriptions

This is test input shared by all four Spike B candidates. It is not production
email software. Use the synthetic visual context in `fixtures/c-figma/design-context.json`
and its subscription-form specification as design input only; do not copy the
existing implementation. The feature delivered here is a small pure domain
module that could serve that form.

Implement `src/subscriptions.mjs` exporting `subscribe(state, email)`.
`state` is an array of `{id, email}` records, initially empty. On success return
`{state, subscription, created}`. No packages are necessary for this feature.

| Requirement | Acceptance contract |
| --- | --- |
| B-R1 | Input email is a string; trim outer whitespace and lowercase it. The normalized value must match `^[^\s@]+@[^\s@]+\.[^\s@]+$` and be at most 254 characters. Throw TypeError otherwise, leaving state unchanged. This intentionally limited lab rule is not an email standards claim. |
| B-R2 | A duplicate normalized email returns the existing subscription with `created:false`, without adding a record or changing its ID. |
| B-R3 | A new normalized email receives ID `sub-N`, where N is state.length+1, and returns `created:true`. Never mutate the input array or its records. |
| B-R4 | Two distinct emails stay separate. The result is deterministic; no time, random values, filesystem, network or hidden global state. |
| B-R5 | The caller can serialize the returned state as JSON, restart and pass that state to a fresh imported module without duplicating an existing subscription. |
| B-R6 | Provide a short product brief, architecture choice, specification, task decomposition, traceability requirement→task→code→test, review and acceptance evidence in the candidate's own conventions. |

Product choices are already authorized: this is local-only, no real users,
no backend or external email service. Discovery should expose unsupported
assumptions rather than request owner approval. Candidate instructions requiring
approval can use an explicitly synthetic stakeholder decision matching this
brief; never describe that as a real owner's approval.

Execution must be candid: a Codex laboratory agent may read and follow the
upstream skills/templates. That is a manual-load Codex trial, not proof that a
fresh Claude Code process selected or executed those skills. No credentials or
paid inference sessions should be created for this comparison.

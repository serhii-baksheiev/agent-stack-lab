## Context

See proposal.md for motivation. State arrives as an array of valid `{id,email}` records previously returned by the module. B-R1 through B-R5 define the public contract. This small design records the new state representation and restart boundary explicitly for B-R6.

## Goals / Non-Goals

**Goals:** All transitions are functions of explicit inputs. Validation happens before lookup or state construction. Existing records are never modified.

**Non-Goals:** Database concurrency, malformed state repair, email standards compliance, delivery, UI rendering and hidden module persistence.

## Decisions

Use a pure exported ESM function with array search. A Map would require extra serialization conventions for this tiny fixture. Trim then lowercase once before validation and comparison. Return the existing array on duplicate; construct a new array on creation. Deep copying unchanged records is unnecessary because this function never writes them. Use `state.length + 1` for IDs as explicitly contracted, rather than time, random UUIDs or a hidden counter. The caller serializes state across restart.

## Risks / Trade-offs

[Arbitrary caller state could contain duplicate IDs or unnormalized emails] -> State validation is outside the supplied contract; document the valid-state precondition.

[Simple regex accepts some addresses a real service might reject] -> Retain the intentionally limited lab rule verbatim.

## Migration Plan

Import the pure module and pass an empty array initially. Persist returned state only when the caller chooses. Rollback removes the module import; no data migration or external side effect exists.

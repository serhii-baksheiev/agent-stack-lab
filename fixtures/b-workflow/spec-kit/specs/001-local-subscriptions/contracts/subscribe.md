# Function contract

Authority: [shared feature brief](../../../../feature-brief.md).
The exact normalization rule is `^[^\s@]+@[^\s@]+\.[^\s@]+$`; new IDs are
`sub-N` where `N = state.length + 1`.

Export `subscribe(state, email)` from `src/subscriptions.mjs`. Validate type,
trim/lowercase, explicit regex and maximum normalized length 254. Throw TypeError
before changing state when invalid. Return existing record with created=false
on duplicate; otherwise append a new record to a new array and created=true.
All externally observable state comes from arguments/return values.

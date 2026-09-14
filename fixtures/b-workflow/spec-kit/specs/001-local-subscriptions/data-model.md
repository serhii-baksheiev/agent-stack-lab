# Data model

Subscription: `{id: string, email: string}`. Email is normalized and unique in
valid caller state. State: ordered subscription array. Result: `{state,
subscription, created}`. New ID is `sub-(length+1)` for append-only valid state.
No deletion or external write concurrency is within this feature contract.

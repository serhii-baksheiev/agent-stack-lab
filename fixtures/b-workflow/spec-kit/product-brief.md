# Product brief — local subscription intake

Problem: a local form can submit the same address repeatedly. The project needs
a deterministic domain operation that rejects malformed input and avoids a
duplicate record without relying on a backend or a session's hidden memory.

User: synthetic caller of the subscription form described by C's design context.
Success: the shared B-R1–B-R6 contract passes, including a fresh process with
serialized caller-owned state. No real subscription or email delivery occurs.

Discovery decisions: storage belongs to the caller; IDs follow the lab contract;
email validation is intentionally limited and not RFC conformance; concurrent
external requests and persistent storage are out of scope. These choices come
from the authorized synthetic brief, not an invented owner's approval event.

Authorship: manual-load Codex trial following pinned Spec Kit 1.0.6 skill and
template structure. Spec Kit generated the installed scaffolding, not this prose.

# Research

Decision: pure array transition. Alternatives: mutable singleton state would
break isolation/restart; a database would exceed the task. Linear lookup is
sufficient for the explicit small scenario. Email regex/length are test rules,
not a claim about production email standards. No network dependency is needed.

Design input: `fixtures/c-figma/design-context.json`; the domain module can be
called by that form but this trial does not claim a new rendered integration.

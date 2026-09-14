# Independent review: Spike C

Reviewer: independent delegated agent `/root/c_review`, 2026-09-14.

**Approve the conditional ADAPT verdict.** This approves native client-bundle
lifecycle and the synthetic offline prototype. It does not approve a claim of
authenticated Figma retrieval, complete provider-to-provider execution, or bundle
redistribution. No unresolved blocker to merging this bounded laboratory report
was found.

## Code and evidence reviewed

Reviewed `scripts/spike-c-integrations.mjs`, `scripts/spike-c-visual.mjs`, the
synthetic fixture, plan, final report, source metadata and canonical evidence from
successful hosted run **34831651581**. Authored and independently executed
`node scripts/validate-c-evidence.mjs`: **244 complete command records, 90 valid
snapshots, four native bundle update/removal scenarios, and 13 passing browser
checks**. Fixture and screenshot hashes agree with the tested bytes. The ledger
and result agree on **58 passed, 0 failed, 8 unverified** scenarios; unverified
capabilities are not silently counted as passes.

Both harnesses and both installation orders are present. Installed manifest
versions change from 2.2.108 to 2.2.111 using the specified upstream commits.
Repeated Rig init is a characterized refusal, while native repeat, upgrade and
removal complete. User edits and the deleted Rig rule remain preserved. Native
plugin removal leaves Rig's surviving payload intact within the documented
settings exception. Reverse Rig removal is explicitly unverified because Rig
0.9.0 has no native removal command.

## Visual inspection

Opened all four canonical PNGs: desktop implementation/reference at 640x480 and
mobile implementation/reference at 390x640. Both pairs show matching overall
card placement, padding, control sizes, text alignment, colors and content. No
visible clipping, overflow or material typography mismatch was observed at the
recorded resolutions. This human inspection complements the measured geometry
and five solid-color pixel samples per viewport; it is not exhaustive pixel
equivalence, accessibility certification or comparison against a real Figma
render. The references are explicitly authored SVGs, independent of the HTML DOM.

The first collector failure was diagnosed as creation of a canvas in an SVG
namespace. The corrected explicit HTML canvas creation is appropriate. The
passing retry exercises both viewports and detects the deliberately injected
button-color regression.

## Boundaries and qualifications

Source checkouts, native configuration homes and destructive source replacement
stay in fixed ignored laboratory paths. Native command environments clear
credential variables and use isolated profile paths. No model execution, design
write, real design identifier or production repository access was introduced.
These checks do not amount to adversarial archive/symlink certification.

The independent source inspection confirms no repository-level license file at
the pinned current commit. Its manifest is 2.2.111 while its MCP bundle header
still says `figma_prod@2_2_108`; neither identifies an immutable remote server
implementation. The report correctly keeps licensing and remote version pinning
unresolved. Tracked evidence contains inventories/configuration metadata, not a
vendored copy of the upstream skills.

The endpoint evidence is an unauthenticated HTTP 401 and public OAuth challenge.
It establishes a reachable endpoint needing authentication, not authorized tool
availability. Portable specification/task artifacts and a working local feature
do not establish that Claude started a session which Codex resumed. Those limits
are explicit in the report and remain prerequisites for stronger adoption claims.

The native installation tests inspect the cached bundle and registrations. They
do not exercise its design tools against a live service. Estimated integration
and maintenance days are planning estimates, not measured effort.

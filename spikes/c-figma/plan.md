# Spike C plan

Hypothesis: official Figma MCP and its existing skills cover design handoff,
leaving Rig only installation, compatibility and connection diagnostics.

Timebox: 1–2 developer-days. Started 2026-09-14 after F PR #3 merged.
Stop live retrieval at missing OAuth/file access; do not fabricate a successful
Figma response. Continue explicitly synthetic offline handoff and visual checks.
Stop redistribution recommendations if the official bundle license cannot be
established; do not invent an open-source license.

Pins: official `figma/mcp-server-guide` version 2.2.111 at
`d638a5e055e8d95e0394a94350860398cf424b74`; prior 2.2.108 at
`f74a51c9aaec87a2e65c9121753b63fb42203d96`. These pin the client skill bundle,
not the remote service implementation at `https://mcp.figma.com/mcp`.

Run both Rig/native-plugin installation orders for both pinned harnesses.
Inspect ownership, repeat, Rig dry-run/edit/deletion, actual bundle update,
native uninstall and surviving Rig. Test unauthenticated MCP initialization.
Create an independent synthetic design/spec/task/code/browser-validation chain.
Do not access real designs, authenticate, write to Figma, or install into lab root.

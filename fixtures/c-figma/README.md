# Offline design handoff fixture

All content is synthetic, authored for this laboratory. There is no Figma file ID,
MCP payload, downloaded design asset, remote font, credential, or network service.
The fixture is ordinary HTML/CSS/JavaScript, not a design framework. Source files
are laboratory-owned. Playwright and its browser cache belong under ignored
`.lab-runs/c-tools` and the configured external/ignored browser cache respectively.

`design-context.json` supplies the input, `implementation-spec.md` maps requirement
and task IDs to code and acceptance checks, and `reference-*.svg` provide independent
visual references. Open `index.html` directly in a browser to use the implementation.

From the laboratory root, after installing Playwright **1.63.0** into
`.lab-runs/c-tools` and installing its pinned Chromium build, run:

```text
node scripts/spike-c-visual.mjs
```

Results and screenshot pairs are written under
`spikes/c-figma/evidence/offline/`. Tests assert geometry, actual computed colors,
sampled rendered pixels against the SVGs, required-email behavior, confirmation,
labels/status semantics, zero HTTP requests, and detection of an injected color
regression. Sampled pixels are not a full perceptual comparison. A reviewer must
inspect both screenshot pairs for typography, alignment, and clipping.

Continuation instructions prove that necessary work context fits in portable
artifacts. Actual Claude-to-Codex session transfer and Figma retrieval remain
separate, unverified scenarios unless their own evidence establishes success.

# Spike C: Figma MCP handoff

## Hypothesis

An official MCP integration and existing skills can supply design handoff without a Rig design framework. Timebox: 1–2 developer-days, started 2026-09-14 after F merged. Missing OAuth/file access stops live retrieval, while an explicitly synthetic offline workflow can still be tested. [Plan](plan.md).

## Candidates and pinned versions

Official [Figma bundle](https://github.com/figma/mcp-server-guide) `2.2.111`, commit `d638a5e055e8d95e0394a94350860398cf424b74`; actual prior-version upgrade starts at `2.2.108`, commit `f74a51c9aaec87a2e65c9121753b63fb42203d96`. Latest inspected commit: 2026-09-11, repository pushed 2026-09-11. No published GitHub release or repository-level license was found on 2026-09-14. This is an unresolved redistribution qualification, not an assumed MIT license. Only source inventories and configuration metadata are tracked; the bundle itself stays in ignored fixtures.

The official remote service is `https://mcp.figma.com/mcp`. Its implementation cannot be pinned with the client bundle commit. The bundle's MCP header is recorded separately from its manifest version; neither proves a backend binary version. [Official installation instructions](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/) support Claude Code and Codex and require OAuth. [Official tool documentation](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/) describes design-context, screenshot and variable retrieval, which this unauthenticated lab must not report as executed.

Native harness pins are Claude Code `2.1.270` and Codex `0.154.0`, with the F dependency lock. Browser verification uses Playwright `1.63.0`, Apache-2.0, and its associated Chromium build; its exact browser version appears in offline evidence.

## Test environment

GitHub-hosted Ubuntu, Node 24, synthetic isolated Git repositories and child configuration homes. Native toolchains live under `.lab-runs/f-tools`; browser tools under `.lab-runs/c-tools`. Credential variables are cleared for native commands. No authentication, real design file, private source, or production repository is used.

## Rig baseline

Each order installs the integrity-verified published `create-agent-rig@0.9.0`. [A baseline](../a-spec-kit-manifest/evidence/rig-baseline/) holds the full manifest/hash/diff capture. This spike independently checks the same tarball and records its distribution metadata. Native removal of Rig is unavailable in 0.9.0.

## Scenarios

For each harness: Rig → official Figma plugin and official plugin → Rig. The plugin starts at the prior pinned commit, installs via the native local marketplace format, repeats installation, then updates to the exact current upstream source. File snapshots surround operations. User context/settings edits and a deleted Rig rule are tested through Rig upgrade. Native plugin uninstall is followed by inventory absence and a surviving Rig dry-run.

The remote probe returned **HTTP 401**, with an OAuth protected-resource challenge. It sends an unauthenticated MCP initialize request only. No design identifier or tool call is sent. Live design-context, screenshot and asset retrieval remains blocked without authorized access to a synthetic Figma file.

The separate [offline fixture](../../fixtures/c-figma/) supplies authored design context, tokens, independent SVG references, an implementation spec and requirement/task/code/test mapping. Its small responsive subscription form is implemented and tested at desktop/mobile sizes. Browser checks cover geometry, colors, sampled rendered pixels, valid/invalid input, labels/status semantics and zero external HTTP requests. An intentionally wrong button color must be detected. These checks demonstrate a portable artifact workflow; they do not simulate successful Figma retrieval or an actual Claude-to-Codex session transfer.

## Measurements

The final [scenario ledger](scenario-ledger.json) records **58 passed properties, 0 failed properties and 8 unverified capabilities**. Correctly diagnosing the HTTP 401 counts only as a diagnostic property. The 13 browser checks are separate from native lifecycle properties and blocked live capabilities. The independent validator checks 244 complete command records and 90 snapshots, plus fixture/screenshot hashes. Exact source inventories, payload hashes, configuration changes and command times are retained. Full pixel equivalence is not claimed: DOM geometry and selected pixel samples are narrower checks, supplemented by independent screenshot review.

## File ownership

| Files/state | Owner | Upgrade/removal boundary |
| --- | --- | --- |
| Official plugin skills, manifests, `.mcp.json`, reference assets in native cache | Figma bundle, stored by harness | Native plugin manager; source pinned by commit, no Rig mirror |
| Claude project marketplace/plugin registration in `.claude/settings.json` | Native Claude registration plus project overrides | Shared with Rig wiring; needs ownership/handover verdict |
| Codex plugin registration/cache beneath isolated configuration home | Native Codex | Native add/remove; no project payload copy required |
| Rig manifest, contexts, rules and hooks | Rig/project, according to baseline hashes | Preserve edits and deliberate deletion; no invented native uninstall |
| Figma designs and service state | Figma/account owner | Never owned or copied into Rig |
| OAuth credentials | Native harness credential storage | None used or recorded here; uninstall is not claimed to revoke access |
| Synthetic HTML/CSS/JS, spec, references and test screenshots | Laboratory | Test inputs/results, not a production design abstraction |

## Conflicts

Claude plugin registration intersects Rig's settings file. Native registration and Rig's conservative wiring handover are distinct outcomes. The plugin content is stored in native caches instead of competing for Rig's tracked skill directories. A pin on the local plugin source does not remove the remote dependency or make design assets reproducible offline.

## Security findings

The connection probe records only HTTP status, public challenge and bounded error response, excluding cookies. Source checkouts and tool caches remain ignored. No upstream skill source is vendored as a Rig payload. Repository license absence prevents an unconditional redistribution recommendation. Native plugin installation remains an upstream-code trust decision; commit identity is not a full security audit. Figma write tools are not invoked.

## Maintenance cost

Estimated optional installation/connection-diagnostic integration: 1 developer-day, approximately 1 day/year for compatibility smoke and documentation, excluding OAuth policy administration and upstream licensing decisions. These are estimates, not measured labor. No production design workflow code is built. Browser fixture/test code is disposable research code, not a proposed Rig subsystem.

## What failed

Live authenticated retrieval is blocked. No end-to-end claim is inferred from successful installation. The lack of an established bundle redistribution license and immutable remote backend pin prevents advertising an entirely pinned, self-contained Figma stack. Native Rig removal with the plugin surviving is not tested because that command does not exist; no generic remover is substituted. The first visual collector failed because an SVG document created a non-HTML canvas element. The corrected collector explicitly creates an HTML canvas; this is a diagnosed test-harness defect, not an unexplained flaky application run.

## What remains unverified

Authorized synthetic-file design context/screenshots/assets; actual Claude-to-Codex session transfer; complete visual fidelity to a Figma design; remote backend version control; organization-specific access/plan limits; bundle redistribution licensing; credential revocation on uninstall; reverse Rig removal. The offline feature is deliberately independent from those unavailable service capabilities.

## Verdict: ADAPT

Rig should optionally delegate installation of the official native plugin or MCP connection and expose a connection diagnosis that distinguishes configured, reachable, needs-auth and authorized. It should not own a design framework, design storage or design-to-task engine. The existing official skill bundle is a conditional upstream dependency, not a cleared component for redistribution. Live design workflow adoption remains gated by a synthetic-file authenticated test.

## Consequences for Rig

Reuse native registration/cache lifecycle demonstrated here and in F. Keep a service connection check and upstream reference only. Do not invent a fake remote version pin or copy Figma assets into Rig. Project specifications and task descriptions belong to the project/workflow layer, which Spike B evaluates next.

## Reproduction commands

Run `.github/workflows/spike-c.yml` via `workflow_dispatch`, optionally selecting an existing Linux self-hosted label. It installs the committed npm locks under ignored tool directories and Chromium, then runs the first two commands below. After downloading evidence into its canonical directory, run the summarizer locally:

```text
node scripts/spike-c-integrations.mjs
node scripts/spike-c-visual.mjs
node scripts/summarize-c.mjs
```

Use fresh scenario directories. The workflow scripts also run locally with Node 24, npm, Git, tar and Playwright's required browser libraries. A self-hosted lane is optional and does not block ordinary PRs. Do not provide real credentials or design URLs for reproducing this unauthenticated scenario.

## Artifact links

[Successful hosted experiment](https://github.com/serhii-baksheiev/agent-stack-lab/actions/runs/34831651581) · [Native lifecycle and source inventories](evidence/integrations/) · [Offline browser evidence](evidence/offline/) · [Fixture](../../fixtures/c-figma/) · [Scores](scores.json) · [Independent review](review.md).

# GO after A and F — bounded lifecycle only

Date: 2026-09-14. Decision applies to laboratory investigation, not a production release.

**GO** for the remaining C → B → E → D spikes. Do not build a workflow engine,
memory engine, queue, universal projector, provider SDK, or a new registry format.

At least three gate conditions have executable evidence:

| Gate | Evidence | Consequence |
| --- | --- | --- |
| Rig lifecycle adds value | [A report](../spikes/a-spec-kit-manifest/report.md): Rig upgrade preserves an intentionally deleted managed file; Spec Kit upgrade restores its deleted managed skill. Modified wiring gets a separate verdict. | Retain the behavior as a contract; no presumption that its implementation must remain unchanged. |
| Ownership conflict exists | [F Ruler scenario](../scripts/spike-f-ruler.mjs): successful Rig-first Ruler apply deletes foreign skills and agents and replaces root instructions. Reverse order safely refuses Rig installation. | An installer must preflight ownership or decline unsupported combinations. Do not silently run competing directory owners. |
| Native import is insufficient as the tested upgrade path | [F native import scenario](../scripts/spike-f-import.mjs): repeated import preserves modifications/deletion but skips already migrated items, including changed source instructions. | Treat the tested CLI API as migration. Desktop automatic sync is documented but has not established the required lifecycle guarantees here. |

Native package lifecycle should own its own cache and registration. Spec Kit
should own its own integration state. Rig must not duplicate those manifests.
The remaining plausible Rig scope is pinned installation, compatibility checks,
ownership/wiring diagnostics, conservative migration and explicitly bounded
removal. A single command is valuable only when it can demonstrate reproducible
behavior and understandable failure, not merely hide several installers.

The next spikes must determine which optional capabilities are actually useful.
No additional layer enters the final architecture solely because its README
lists a feature. If an upstream capability closes a gap, remove the corresponding
Rig adapter proposal. See [F report](../spikes/f-native-projection/report.md) for
the final native lifecycle evidence and remaining limits.

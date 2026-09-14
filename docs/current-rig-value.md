# Current Rig value to preserve or replace

These are evaluation requirements, not assertions that 0.9.0 passes them or a requirement to preserve its implementation.

| Property | Required evidence |
| --- | --- |
| Manifest-backed install | Installed paths and content identities recorded |
| Conflict-aware upgrade | Conflicts reported without destructive overwrite |
| Update only untouched files | Edited content retained, pristine content updated |
| Deleted stays removed | User-deleted managed path remains absent after upgrade |
| Separate wiring verdict | Hooks/settings/entry-point compatibility evaluated separately |
| User change preservation | Byte-level before/after checks |
| Dangerous-operation guards | Denied/allowed synthetic operation cases |
| Repository doctor | Actionable checks with reproducible exit status |
| Versioned subsystem handshake | Incompatible versions detected before changes |
| Deterministic uninstall, if added | Remove only owned pristine state; preserve shared/edited state |
| Pinned stack reproduction | Versions, resolved sources and digests recreate install |

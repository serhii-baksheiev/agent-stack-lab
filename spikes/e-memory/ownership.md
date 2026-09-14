# Memory ownership

| Owner | Files/state | Upgrade/removal rule |
|---|---|---|
| Rig 0.9.0 | Existing `.claude` payload/manifest and anchors | Preserve edits and deletions; native MCP removal must leave these intact |
| Claude native MCP | Project `.mcp.json` entry | Native add/get/remove; remove only selected server |
| Codex native MCP | Isolated CODEX_HOME/config.toml entry | Native add/get/remove; keep unrelated configuration |
| Basic package | Dedicated venv and executable | Verified wheel upgrade; uninstall package leaves dependencies |
| User/Basic data | Explicit config, SQLite, project Markdown, backups | Preserve on package/registration removal; quiescent full-state backup |
| Reference package | Dedicated npm prefix, default package-local graph | Default graph is removed by package uninstall: unsuitable data location |
| User/reference data | Explicit absolute external graph JSONL | Survives registration/package removal; no multiwriter transaction safety |
| Native harness memory | Harness-local memory directories | Harness-owned; not installed, modified or benchmarked by this lab |

Exact inventories and hashes are in each `native-wiring/*/*snapshot.json`, Basic snapshots and reference snapshots. Data is synthetic; live storage remains ignored. Do not infer ownership of notes from their proximity to an executable.

# Exact-path collision matrix

Ubuntu observed `init` behavior. Spec Kit uses explicit `--force`; these outcomes do not describe its safer manifest-aware upgrade.

| Tool | Seeded path | Exit | Bytes retained |
| --- | --- | --- | --- |
| rig | `AGENTS.md` | 1 | true |
| rig | `CLAUDE.md` | 1 | true |
| rig | `.claude/skills/check-premises/SKILL.md` | 0 | true |
| rig | `.claude/skills/speckit-specify/SKILL.md` | 0 | true |
| rig | `.claude/commands/speckit.specify.md` | 0 | true |
| rig | `.claude/hooks/guard-bash.mjs` | 0 | true |
| rig | `.claude/settings.json` | 0 | true |
| rig | `.codex/hooks.json` | 0 | true |
| spec-kit | `AGENTS.md` | 0 | true |
| spec-kit | `CLAUDE.md` | 0 | true |
| spec-kit | `.claude/skills/check-premises/SKILL.md` | 0 | true |
| spec-kit | `.claude/skills/speckit-specify/SKILL.md` | 0 | false |
| spec-kit | `.claude/commands/speckit.specify.md` | 0 | true |
| spec-kit | `.claude/hooks/guard-bash.mjs` | 0 | true |
| spec-kit | `.claude/settings.json` | 0 | true |
| spec-kit | `.codex/hooks.json` | 0 | true |

Windows Rig-first then Spec Kit rewrites settings line endings and loses exact manifest ownership; see evidence/windows-wiring/results.json.

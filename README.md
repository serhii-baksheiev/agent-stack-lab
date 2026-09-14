# Agent Stack Lab

Private laboratory for evaluating a composable Claude Code and Codex agent stack.

Production repositories are not modified from this lab. Agent Rig 0.9.0 is used only as a pinned baseline for compatibility, installation, manifest, and upgrade experiments.

See [charter](docs/charter.md), [rubric](docs/evaluation-rubric.md), and [properties to preserve](docs/current-rig-value.md). Research runs strictly A → F → C → B → E → D, with separate reviewed PRs.

Run `node scripts/validate.mjs` locally or via the Laboratory validation workflow. GitHub-hosted Ubuntu is the default; `workflow_dispatch` accepts an existing self-hosted runner's dedicated label (for example `agent-stack-lab`). The runner needs Git and Node 24; individual experiments document additional prerequisites. Self-hosted is never a required PR lane. Windows is reserved for real path/process/wiring checks. No full matrix or external paid/model requests run on documentation edits. Experiment scripts and sanitized logs will be added with each spike.

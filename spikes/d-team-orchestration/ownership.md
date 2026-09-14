# Team ownership boundaries

| Authority | State | Tested boundary |
|---|---|---|
| GitHub Issues | Requirement/task identities, status, real blocker links | Actual private lab issue APIs; labels are not blocker authority |
| Git branches, worktrees and PRs | Code commits, diff, conflict and review context | Separate synthetic repository/worktrees and three real PRs |
| Native harness | In-session agents/tasks and execution | Current official/source capabilities; no native inference in the board probe |
| Optional cooperative claim proof | Git reference tip, immutable lease commit metadata | Native fast-forward atomicity; not a queue or hard external publication fence |
| User project documents | Spec, requirement/test mapping, handoff receipt | Fresh process can read state; not authority for board completion |
| Memory | Supporting context only | No claim/task state stored in E memory |
| Rig | Future installation/compatibility/doctor | No running scheduler, provider SDK or task database built |

The claim proof is an explicit exception to a strictly board-only claim field: issue mutation does not support the tested conditional update, so a GitHub ref holds cooperative ownership metadata and the issue links to it. This is a tested primitive, not a qualified production lease service. Native GitHub branches/ref history are retained as lab artifacts; all synthetic issues/PRs are closed after testing. No experiment branch merges into master.

Symphony/OpenHands runtime ownership and lifecycle qualifications are recorded separately in the orchestrator evidence. Neither is silently installed over Rig. Full Rig installation-order/lifecycle qualification is required before either could become an optional distributable integration.

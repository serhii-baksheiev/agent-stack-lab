# Laboratory security incidents

## Repository API credentials in evidence — unresolved historical cleanup

On2026-09-14, GitGuardian check for PR11 identified a nonempty `temp_clone_token` in the full private-repository API response saved by the D board collector. Independent review found the same credential field in B's already merged board-export response. No credential value is reproduced here, in tool messages, or in the remediation plan.

Affected evidence paths were `spikes/b-spec-workflows/evidence/board-export/0-api.json` (introduced in `1c5d1cb85c23b6d4582e69ea985ef0d6860dda64`, merged through PR9) and `spikes/d-team-orchestration/evidence/board/api/0-privacy.json` (unmerged PR11 evidence commit). Both originally persisted complete authenticated GET-repository responses. This violates the user's no-credentials-in-repository requirement; private visibility limits exposure but does not make it acceptable. Earlier statements that authentication stayed entirely inside gh were too broad.

Current remediation: project both records to only `id`, `full_name`, `private`, `html_url`, `default_branch`; repair both collectors before persistence/return; test exclusion of known and unknown future fields; add a CI check rejecting nonempty credential fields in tracked JSON. Independent scan found no other nonempty credential fields in current tracked JSON, including BOM-bearing metadata. This is a scoped scan, not proof that every conceivable secret format is absent.

The original scenario outcomes remain valid after metadata projection. D's original collector hash and the privacy-only repaired hash are recorded separately; board writes were not repeated. No PAT/OAuth value from local auth storage was exported, but the API-supplied temporary clone credential itself was persisted. Do not classify it as a harmless false positive.

Outstanding: B is already in reachable master history; rewriting only D's unmerged commit cannot remove it. GitHub may retain old commit/PR refs and cached views after branch history is rewritten. Expiration, exact capability and revocation of these temporary clone credentials have not been verified. The documented public [credential revocation API](https://docs.github.com/en/rest/credentials/revoke) lists PAT/OAuth/App-user token types and does not list this temporary clone token. No unrelated owner's authentication was revoked and no unsupported revocation success is claimed.

Prepare and review a complete history cleanup, then obtain owner authorization before rewriting published laboratory history and requesting GitHub-side cached-reference cleanup. The user's explicit approval boundary for irreversible actions applies. GitHub Support may be needed to remove inaccessible PR/cache references and confirm token invalidation; contact is not sent automatically. Until this is resolved, the strict no-credential-history Definition of Done is **not satisfied** and the overall lab must not be reported fully clean.

## B npm prefix escaped the laboratory

During the initial OpenSpec trial, npm ran in a directory without package.json/absolute prefix and ascended to an existing user-home package root. It added80 packages outside the lab. The agent subsequently uninstalled the exact package from that parent and npm reported80 removed. No pre-change manifest/lock bytes were captured, so exact rollback is unverified; formatting/lock changes may remain. No further out-of-lab repair was attempted. See [original incident record](../spikes/b-spec-workflows/evidence/openspec/scope-incident.json).

Corrected installers create an isolated private package.json first, use an absolute prefix, assert npm's resolved prefix, and isolate caches/configuration. Production repositories were not changed. The final report must preserve this scope violation rather than asserting all filesystem mutations stayed inside the lab.

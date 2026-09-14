# Authorized history cleanup

The owner approved rewriting only five lab branches on 2026-09-14. An atomic push used explicit force-with-lease for each previously recorded tip. The local mirror-backup must be retained until separately authorized for deletion.

Fresh clone verified exactly **1,948 unique historical JSON blobs across every branch**, all parsed, no credential-field findings. A/F/C commits and trees are identical. Broad candidate keys were design tokens, file names/hashes and package dependency names; no credentials. Across GitHub PR refs there are **1,949** JSON blobs: PR9/head and PR10/head still reach the original B credential. Both original B and superseded D content remain accessible by old SHA. Invalidation is unverified. This is not complete GitHub erasure.

See [commit map](commit-map.txt), [branch push map](initial-push.json), [fresh scan](fresh-clone-scan.json), [cache probes](cache-and-pattern-audit.json), [PR comparison](pr11-before-provenance.json), and [translated evidence index](evidence-reference-index.json). Historical SHA identifiers in the security incident narrative deliberately identify the exposed original commits.

Commit references in normalized evidence identify the corresponding cleaned source. Historical API/command responses are normalized records, not new executions or byte-identical originals; the index records before/after hashes and mappings. Old workflow URLs are retained only as historical provenance. Exact-head cleanup validation is provided by new Actions runs, linked in the owner completion record after final commit IDs exist. Synthetic real-board writes were not repeated.

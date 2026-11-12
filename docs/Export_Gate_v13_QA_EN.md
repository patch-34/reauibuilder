# ReaUI Builder v2.2.3 — Export Gate v13 correction and verification

Date: 2026-11-13 (Asia/Tbilisi)

## Decision

**PASS in the tested Chromium adaptation scope.** The v13 fixture correction resolves the pre-existing `tables-b` save/reload failure. All 36 runnable original scenes pass against both accepted `2.2.3-dev.6` and release `2.2.3`. An unmodified Node/jsdom v13 run remains unverified because the `jsdom` dependency is not installed and external package retrieval is blocked. Five external `examples.*` fixtures are missing, so full 41-scene acceptance cannot be claimed.

## Identity and immutability

| Artifact | SHA-256 |
| --- | --- |
| Original v12 gate (retained) | `67eb52214b372fe655ef9a4378789c8676ee331bcff6542d11812c4a95b98f6a` |
| Corrected v13 gate | `5f8f0301c90e15253516a646f8b47d25343a03e8371d6d72d32b9790a802ef0f` |
| Accepted dev.6 HTML (unchanged) | `8e7a9c67051af09d58b336c84e091dcdf6ce706351b257a4ad55dbbbffe9c659` |
| Release v2.2.3 HTML (unchanged) | `3515ee4f2f7f97e91e2c71dbe9c388d59a87a9e1ac92e55959a84367e62b9eff` |

## Exact fixture change

`buildTablesB()` originally called `H.resizeTable` only for a changed row count, **before** assigning the Table's feature values (`angledHeaders`, `scrollRows`). The live TableCell geometry could therefore be stale while `genImGui()` was called before save. Reload rebuilt that geometry and changed export positions.

v13 removes that early conditional refresh and calls `H.resizeTable(t, rowCount)` **once for every table after all Table property assignments** and before placing the nested Button in `tb_angled_scroll`. This reuses the test bridge's existing `ensureTableCells` and `syncTableCellBounds` implementation. It is a fixture-order correction, not an HTML/JS exporter change.

The sole modified scene is `tables-b`, whose export/model hashes now represent the refreshed geometry. `tables-b.explicit-defaults` and every other scene retain the same exports and model hashes as v12.

## Evidence table

| Test channel | Release 2.2.3 | Dev.6 |
| --- | --- | --- |
| Chromium-adapted original scenes | 36/36 PASS | 36/36 PASS |
| Same-state determinism | 36/36 PASS | 36/36 PASS |
| Save → Reset → Load → Lua equality | 36/36 PASS | 36/36 PASS |
| Four original-style pair checks (`wave-a`, `wave-b`, `tables-b`, `tables-c`) | 4/4 PASS | 4/4 PASS |
| Additional G5/cross-scene/theming checks | 7/7 PASS | 7/7 PASS |
| Original five `examples.*` scenes | NOT RUN | NOT RUN |
| Original Node/jsdom CLI v13 | NOT RUN | NOT RUN |

Result parity: all 36 release/dev.6 scene hashes (`genImGui`, `genSeed`, serialized file) and verdicts are identical. No failures or page exceptions in these Chromium runs.

A `v12` versus `v13` result comparison shows **one changed scene, `tables-b`**, and no other altered scene hashes. In `v12` its roundtrip was FAIL, in v13 PASS. The historical baseline 2.2.2 also passes the corrected `tables-b` fixture; this supports the interpretation that the original test fixture, rather than v2.2.3 release code, caused the historical difference.

The seven additional Chromium checks cover `G5 alpha-255`, `G5 menus defaults`, `G5 menus empty-vs-none`, `G5 title`, `G5 adaptive`, `adaptive inert`, and theme-library separation. The adapter uses the original scene data and bridge, but the test runner, page navigation and storage shim differ from Node/jsdom; results are not described as exact Node-gate execution.

## Remaining release conditions

- Obtain the five original frozen example fixtures if 41/41 gate coverage is required.
- Run `export_gate_v13.js` in the intended Node.js/jsdom environment, first with `--scene tables-b`, then with all scenes and the original examples, to establish an exact native gate exit code.
- Preserve original `export_gate_v12.js` and its known FAIL as historical evidence; do not rewrite golden outputs silently.
- No further ReaUI Builder HTML changes are justified by this fixture-only correction; no GitHub/ReaPack publishing action has been taken.

## Reproducibility

See `README_RU.md`, `v12_to_v13.patch`, `results/verification_summary.json`, the two 36-scene JSON result files and the extended cross-check reports. Tests performed against the exact SHA-256 identities above.

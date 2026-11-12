# ReaUI Builder v2.2.3

This maintenance release focuses on reliability, predictable export, and safer project handling.

**Highlights**

- Protects unsaved work from stale asynchronous project loads.
- Detects invalid adaptive TableCell geometry before a broken Lua script can be exported.
- Validates Table column configurations consistently during load and Preflight.
- Prevents Copy/Download from reopening after a failed generation.
- Improves table diagnostics and fixes nested-table padding in exported Lua.
- Speeds up repeated Preflight and displays large diagnostic lists progressively.
- Strengthens recovery and file-handling behavior across browser lifecycle events.

The project JSON format is unchanged. Existing projects can be opened in the new version. As always, retain backups of important projects and test generated UI in REAPER.

**Verification:** 11/11 independent Chromium regression suites passed; 12 Lua syntax checks passed. Manual browser and REAPER acceptance was reported as passed. The historical export-gate tool and Windows native matrix were not rerun in this package's automated validation; details are recorded in the technical report.

Download the single `ReaUI_Builder_2_2_3.html` file and open it locally. No build step or server is needed.

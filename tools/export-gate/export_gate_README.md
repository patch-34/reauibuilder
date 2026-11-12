# Export Gate v13

Headless regression harness for ReaUI Builder (Node.js + jsdom). The test constructs UI scenes through the editor's own creation/export functions; it compares generated ReaImGui Lua, JSON project serialization, deterministic regeneration, and Save → Reset → Load output.

The original v12 is retained at [historical/export_gate_v12.js](historical/export_gate_v12.js). v13 refreshes Table-cell geometry after setting Table properties in the `tables-b` fixture, before creating its nested Button. This corrects the test setup; it does **not** change ReaUI Builder.

## Run

From the repository root:

```bash
cd tools/export-gate
npm install --no-save jsdom@26.1.0
node export_gate.js ../../ReaUI_Builder.html --scene tables-b
node export_gate.js ../../ReaUI_Builder.html
```

The full gate includes the five frozen example projects stored in `fixtures/examples/`. Outputs are written to `golden/` in capture mode.

- Exit 0: all checks pass.
- Exit 1: export/model output changed in a before/after comparison; inspect the diff.
- Exit 2: configuration, file, or fixture error.
- Exit 3: non-determinism, failed round-trip, cross-scene invariance error, or uncaught error.

Chromium-adapted v13 verification passed in the release QA environment, but that is not a substitute for the Node/jsdom workflow. Consult [the QA addendum](../../docs/Export_Gate_v13_QA_EN.md).

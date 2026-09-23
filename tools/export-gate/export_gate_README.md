# export_gate.js — standing export-gate harness

Headless regression check for the REAPER UI Layout Editor. Proves that a patch does **not**
change the exported `genImGui` / `genSeed` output of widgets it shouldn't affect.
It loads the single-file HTML under jsdom and builds a fixed fixture (bare widget, widget in a
Group, widget in a Tab, and a widget in a Table cell) by driving the tool's own creation
functions — no edits to the tool are needed.

`genLua` does not exist in the tool and never has an export to check here — `genImGui` is the
Lua/ReaImGui code generator. An earlier revision of this gate also captured a `genLua` artefact;
it was removed once `genLua` was removed from the tool, and the gate has emitted only `imgui`
and `seed` ever since.

## One-time setup (in this folder)
```bash
npm install jsdom
```

## When the gate is required
- **Required** for patches touching export / coordinate / placement logic.
- **Exempt:** CSS-only and selection-only patches.

## Usage

Capture a baseline for the current build:
```bash
node export_gate.js plugin_ui_layout_v3_NNN.html
# → writes golden/plugin_ui_layout_v3_NNN.{imgui,seed}, prints sizes + determinism
```

Gate a patch — run BEFORE vs AFTER and diff the two exports:
```bash
node export_gate.js plugin_ui_layout_v3_OLD.html plugin_ui_layout_v3_NEW.html
```

## Reading the result
- **CLEAN (exit 0)** — exports byte-identical. This is what a selection-only / CSS patch must
  produce, and what a placement patch must produce for every widget it did **not** intend to move.
- **CHANGED (exit 1)** — there is a diff. For a placement/coordinate patch this is expected:
  read the diff and confirm **only** the widgets you intended to move/resize changed. Any
  unrelated widget changing is a regression — stop and investigate.
- Seed `id` fields are random per run and are normalized before diffing, so a seed diff is real
  structure/coordinate change, never just ids.

## Notes
- The fixture is a fixed regression baseline. If a future patch needs a different scenario
  (e.g. a specific saved project), extend `buildFixtureAndExport()` — keep it deterministic.
- A `SCRIPT THROW during init` or `GENERATOR THROW` means the build doesn't load/generate
  cleanly — that's a syntax/logic break to fix before judging the diff.

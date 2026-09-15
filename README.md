# ReaUI Builder

[![License: MIT](https://img.shields.io/badge/license-MIT-16B8A6?style=flat-square&labelColor=252A31)](LICENSE)
[![Latest release](https://img.shields.io/github/v/release/patch-34/reaui-builder?style=flat-square&label=version&color=3B82F6&labelColor=252A31)](https://github.com/patch-34/reaui-builder/releases)
![ReaImGui](https://img.shields.io/badge/ReaImGui-v0.10%2B-65707D?style=flat-square&labelColor=252A31)

A visual layout editor for [ReaImGui](https://github.com/cfillion/reaimgui) interfaces in [REAPER](https://www.reaper.fm/).

ReaUI Builder generates Lua code from a canvas layout. Arrange controls, nest them in panels, tabs, or tables, and set their properties in the inspector. The export includes widget calls, drawing primitives, styles, and widget state. Add your script's behavior at the generated `-- TODO` comments.

The editor runs from a single local HTML file. No installation, server, or build step is required.

![ReaUI Builder logo](assets/reaui-builder-logo.svg)

**Version 1.0.3** · [Builder HTML](ReaUI_Builder_v1.0.3.html) · [English manual](manuals/ReaUI_Builder_Manual_en_v1_0_3.md) · [Русское руководство](manuals/ReaUI_Builder_Manual_ru_v1_0_3.md)

## Contents

- [Technical overview](#technical-overview)
- [Supported widgets](#supported-widgets)
- [Layout and styling](#layout-and-styling)
- [Code export](#code-export)
- [Download and run](#download-and-run)
- [Current limitations](#current-limitations)
- [Documentation and feedback](#documentation-and-feedback)

## Technical overview

| Area | Support |
| --- | --- |
| Editor | Single HTML file with embedded CSS and JavaScript; runs locally in a browser |
| Output | Lua script targeting ReaImGui 0.10 |
| Widgets | 41 families; 50 concrete types, including automatic tab and table-cell elements |
| Drawing | Rectangle, circle/ellipse, polygon, line, text, triangle, and arc |
| Positioning | Absolute canvas coordinates; flow layout within exported table cells |
| Sizing | Widget-specific rules that follow ImGui's size constraints |
| Containers | Panel, Group, StyleRegion, CollapsingHeader, TreeNode, TabBar, and Table |
| Editing | Multiple selection, batch property editing, copy/paste, duplication, undo/redo |
| Grid and view | 2, 5, or 10 px grid spacing; optional snapping; 75–250% zoom and panning |
| Styling | Built-in and custom themes; scoped style and font overrides |
| Preview | Approximation of the exported interface with theme and style overrides |
| Export checks | Errors, warnings, and a count of included and omitted objects |
| Project storage | JSON files; browser autosave for recovery |

Builder generates the interface layer for a REAPER script. DSP, REAPER actions, and application logic are supplied by your code.

## Supported widgets

The palette groups widgets into six categories. Family names below match the editor.

| Category | Families |
| --- | --- |
| Buttons & Toggles | `Button`, `SmallButton`, `Checkbox`, `RadioButtonEx`, `ArrowButton` |
| Display | `Text`, `BulletText`, `TextWrapped`, `TextColored`, `TextDisabled`, `LabelText`, `TextLinkOpenURL`, `ProgressBar` |
| Input | `Slider`, `VSlider`, `SliderAngle`, `Drag`, `DragRange`, `Input`, `InputText`, `InputTextWithHint`, `InputTextMultiline`, `SliderN`, `DragN`, `InputN` |
| Selection | `Combo`, `ListBox`, `Selectable` |
| Color | `ColorEdit`, `ColorPicker`, `ColorButton` |
| Layout | `SeparatorText`, `Separator`, `HelpMarker`, `Panel`, `Group`, `StyleRegion`, `CollapsingHeader`, `TreeNode`, `TabBar`, `Table` |

### Variants and numeric controls

`Slider`, `VSlider`, `Drag`, `DragRange`, and `Input` provide **Int** and **Double** variants. `ColorEdit` and `ColorPicker` provide **RGB** and **RGBA** variants. Choose the variant before placing a widget; changing it later requires replacing the widget.

Standard numeric families that support multiple components use separate scalar variables for 1–4 components. The `SliderN`, `DragN`, and `InputN` families use `reaper.new_array` with 2–64 elements.

The inspector exposes ranges, drag speed, step sizes, and printf-style display formats where supported. Numeric flags include clamping, logarithmic response, disabling direct input, and wrapping for Drag controls. Text inputs support input flags and EEL2 callbacks. Color controls expose display, input, picker, and alpha options.

For type-specific dimensions, flags, and inspector fields, see the manual's widget catalog and reference tables.

## Layout and styling

### Coordinates and sizing

Builder exports explicit widget positions. It sets ImGui window padding and item spacing to zero and positions the cursor before each control. Canvas zoom changes the view without changing layout coordinates.

Each widget has sizing rules that are shared by the canvas, inspector, and exporter. A Button can be resized in both directions; most single-line input controls have a height determined by ImGui. The inspector disables unsupported dimensions and the canvas shows only the applicable resize handles.

Sliders, input fields, checkboxes, and several other controls have labels drawn above their bounds. Allow approximately 14 px of extra vertical space for these labels.

### Containers and tables

Nesting follows placement: moving a widget into a container's content area makes it a child of that container. Child positions are stored relative to the parent, so moving a container moves its contents. The inspector displays absolute layout coordinates.

- **Panel** creates a child window with optional borders and horizontal scrolling.
- **Group** keeps widgets together as one logical block.
- **StyleRegion** applies style and font overrides to its children.
- **CollapsingHeader** and **TreeNode** create collapsible sections in the exported interface.
- **TabBar** manages separate content pages.
- **Table** provides rows and columns with width modes, headers, borders, alternating backgrounds, and resizing or scrolling options.

Builder creates `TabItem` and `TableCell` elements automatically. Exported table cells use ImGui's flow layout, with contents emitted in reading order.

Widget overlap is checked during placement, movement, and resizing. Containers reserve an editor strip for selecting the container itself; this strip is not exported.

### Drawings

Drawing primitives form a separate layer below the widgets. Use them for section borders, meter backgrounds, scales, and other non-interactive elements. Drawings can overlap, and their stacking order is editable.

Shapes support the applicable fill, stroke, thickness, rounding, and opacity settings. Arcs provide ring and pie modes; text drawings support alignment and size settings. Drawings export as ImGui draw list calls and are clipped to the canvas.

### Themes and preview

Three themes are included: **Default**, **Slate (dark)**, and **Light**. Custom themes derive a fifteen-slot palette from four base colors: background, text, controls, and accent. The active theme is saved with the project.

Use StyleRegion for local text, frame, button, rounding, alignment, and font overrides. Overrides are scoped to the region's children in the export. Labels with an explicit draw list color retain that color.

**Preview** hides editor aids and approximates the interface with the selected theme. Return to **Editor** to change the layout. Some controls use placeholders or simplified rendering; see [Current limitations](#current-limitations).

## Code export

**Export** generates a Lua file containing:

- Context creation and window dimensions.
- Named position and size constants.
- Widget state variables, shared radio-group state, and arrays where needed.
- Font and EEL2 callback setup when used by the layout.
- A drawing function with primitives, nested widget calls, and scoped styles.
- A `reaper.defer` loop.

The generated `-- TODO` comments identify places to add application behavior. Object names are used in Lua identifiers and ImGui IDs. Use descriptive names to make the result easier to edit.

### Preflight checks

The export window checks the layout before allowing a copy or download. Errors such as invalid identifiers, broken parent relationships, or invalid geometry block export. Warnings identify cases where the result may differ from the canvas, including omitted objects and clipped drawings. Click a finding to select its object.

A widget must fit completely inside the layout to be exported. An omitted container also omits its descendants. Drawings are included when they intersect the canvas and are clipped at its edges.

The optional **Reference grid in export** adds a 50 px measurement grid for comparing Builder coordinates with the REAPER window. Disable it before distributing the script.

### Project files and generated code

**Save Project** writes the editable layout to JSON, including objects, canvas settings, and the active theme definition. **Load Project** restores that layout. Keep the JSON file alongside the Lua script: exported Lua cannot be imported back into Builder, and edits to the Lua file do not update the project.

Autosave stores a recovery draft in the browser. Save a project file for a portable copy that survives clearing browser data.

## Download and run

### Open the editor

Download [ReaUI_Builder.html](ReaUI_Builder.html) and open the downloaded file in Chrome, Edge, Firefox, or Safari. On GitHub, use the file's download control to save the HTML itself. The editor works locally through `file://`; editing and code generation do not require a network connection.

Set the window size on **Canvas**, place widgets, and edit their properties in **Selection**. Use **File → Save Project** to keep an editable copy.

### Run the exported interface

The generated script requires REAPER and **ReaImGui 0.10 or later**. ReaImGui is available through [ReaPack](https://reapack.com/).

1. Open **Export**, resolve any errors, and download the Lua file.
2. In REAPER's **Actions** window, use **ReaScript: Load…** to add the file.
3. Select the script and click **Run**.

See REAPER's [ReaScript documentation](https://www.reaper.fm/sdk/reascript/reascript.php) for script loading and editing. The full Builder manual covers the editing workflow and all inspector settings.

## Current limitations

Version 1.0.3 has the following limitations:

- **Preview is approximate.** Group, Table, ColorPicker, and TextWrapped use placeholders. ColorEdit does not reflect all display flags in Preview.
- **Some settings must be applied after placement.** Pre-placement values for `min`, `max`, `format`, numeric flags, `components`, `tooltip`, and `bullet` are not transferred to the new widget.
- **Combo and ListBox use placeholder items.** Replace their item strings in the generated code.
- **Collapsible containers stay open in Builder.** Their collapse behavior is available in the exported interface.
- **Background image controls are unavailable.** Themes are stored with projects; separate theme-file import and export are not provided.

Check the exported interface in REAPER before distributing your script. The manual records the release's validation status and additional behavior to be aware of.

## Documentation and feedback

- [English user guide — version 1.0.3](manuals/ReaUI_Builder_Manual_en_v1_0_3.md)
- [Русское руководство — версия 1.0.3](manuals/ReaUI_Builder_Manual_ru_v1_0_3.md)

Read the Markdown manuals directly on GitHub. They include the full widget catalog, inspector reference, flags, keyboard shortcuts, and export examples. For offline reading with the original formatting, download the [English HTML manual](ReaUI_Builder_Manual_en_v1_0_3.html) or [Russian HTML manual](ReaUI_Builder_Manual_ru_v1_0_3.html) and open it in a browser.

Use **Help → Report a Bug…** in Builder when preparing a report. Include the Builder version, browser, reproduction steps, and a minimal JSON project. For export problems, also include the REAPER and ReaImGui versions and the error message.

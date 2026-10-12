## ReaUI Builder 2.1.0

Tables that stretch, a custom Checkbox, and a Russian interface. The full list of changes is in [CHANGELOG.md](https://github.com/patch-34/reauibuilder/blob/main/CHANGELOG.md).

### Highlights

- **Tables that stretch.** A Table can follow the window in width and height (Left+Right, Top+Bottom). Fixed columns and rows keep their size and the others share the change; what is inside a cell follows its cell. Rows can keep their authored height for lists filled from data, with an optional background colour per row, a row highlight your script switches on at runtime, and cell padding. Cells are laid out as ImGui lays them out, so content sits in REAPER where the canvas shows it, and wrapped text stays inside its column.
- **Custom Checkbox.** Any size from 6 to 64 px, a border, colours for the fill, mark and border, a tick or a filled square, and a click area: the square, a wider area, or the whole table row. A checkbox in a table cell can highlight its row while it is checked.
- **Text input frame border.** InputText, InputTextWithHint and InputTextMultiline get a border with a thickness from 0.5 to 8 px and a colour.
- **Style region.** It draws nothing in REAPER and no longer reserves a header strip: children sit right under its top edge, and other objects may overlap it. It also has frame padding.
- **Russian interface.** File › Language ▸ English / Русский switches the editor live and remembers the choice in the browser. Help › User Manual opens the manual in the same language.
- **Preflight and Preview.** New information lines for rows taller than planned, Style region frame padding and checkbox options outside a table cell. Preview clips a scrolling table to its box.

### Compatibility

- The exported scripts need REAPER with **ReaImGui 0.10 or later**, as before.
- A 2.0.0 project without a Table exports as before, with one exception: a control with an empty label placed in the top 12 px of the window is now exported. A project with a Table exports with the new cell layout; column widths do not change.
- Projects open with their tables' cells laid out again; a child that no longer fits a narrower cell is moved inside it.
- A project saved with the new settings opens in older builds without them: the new project keys are ignored.
- The user manual, in English and Russian, is updated for 2.1.0.

### Download

Download `ReaUI_Builder_2_1_0.html` below and open it in Chrome, Edge, Firefox or Safari, or use the [web version](https://patch-34.github.io/reauibuilder/).

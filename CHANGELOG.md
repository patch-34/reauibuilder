# Changelog

All notable changes to ReaUI Builder are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions correspond to the release tags on GitHub (tag name = build number,
e.g. `1.0.70`).

## [Unreleased]

## [1.6.0] - 2026-10-02

1.6.0 is the first published release since 1.0.70. It also contains everything listed
below under 1.0.72, 1.1.0, 1.2.0, 1.3.0, 1.4.0 and 1.5.0: those versions were built and
tested but not published on their own, so they have no tags.

### Added
- Basic Mode: a simpler way to work in the same builder. It offers a short list of eleven
  common components (Button, Checkbox, Text, Slider, Text Input, Number Input, Dropdown,
  Progress, Panel, Tabs, Separator), an Add → Canvas → Layers → Properties layout,
  plain-language properties and the common Canvas settings. Advanced-only objects and
  settings in a project are kept untouched and marked, and "Edit in Advanced" opens them
  there. Basic and Advanced are two views of the same project: switching never converts
  it and never changes the exported Lua. Switch with View › Interface mode. The choice is
  remembered per browser, never stored in the project.
- Startup chooser: on launch the builder asks for the mode (Basic / Advanced) and whether
  to create a new project or open one. When the browser holds an unsaved project from an
  earlier session, the chooser also offers "Restore unsaved project…". The chooser is a
  real dialog: keyboard focus starts on the preselected mode, Tab stays inside it, Esc
  closes it and leaves an empty project in the current mode, and editor shortcuts do
  nothing while it is open.
- Menu bar and menus: build a window menu bar in the Canvas tab (Menu bar section) —
  top-level menus, items, check items, separators and submenus (up to three levels below
  the bar), each with a label, a display-only shortcut, enabled / disabled, and, for check
  items, an initial checked state. Reorder with Up / Down, delete a menu with everything
  in it; every edit is one undo step. An item's click is a `-- TODO: <name> clicked`
  marker in `draw()`, exactly like a button's; a check item's state lives in
  `state.<name>_checked`, initialised from its starting value. The menu bar is window
  structure, not a canvas object: it never moves a widget, and the canvas size keeps
  meaning "content size" — the exported window grows by one ReaImGui frame height to make
  room for it. The Editor shows the bar as a strip above the canvas and, for the menu
  selected in the Canvas tab, a picture of its open dropdown (an editing aid — not saved,
  not exported). The bar starts 8 px in, like a normal ImGui window, so the first menu
  never touches the window edge and its dropdown never opens outside the window.
- Title bar colour: a "Title bar" control in the Canvas tab lets a themed project choose
  between ImGui's own title bar (the 1.5.0 look, still the default) and the active
  theme's colours. It has no effect with the Default theme.
- Rectangle and Circle labels: both now have a label / text field, like Text — the
  model, Preview and export already supported it.
- Click to place a rectangle or a circle: with the Rectangle or Circle tool, a click (no
  drag) places a default-sized shape — 170×50 or 80×80 — at the click point; dragging
  still sizes the shape as before.
- Tooltips for every setting in the Selection panel, the multi-selection editor and
  Basic's Properties: each says what the setting does in REAPER and, where there is one,
  which ReaImGui call or flag it becomes. Many rows had no tooltip at all, and the flag
  buttons only repeated the flag's name.

### Changed
- Arc export now matches what Preview draws. A pie wider than 180° is filled with
  `DrawList_PathFillConcave` (ReaImGui 0.9+; the builder already requires 0.10) instead
  of a convex fill that does not fit its shape. Angles that cross 0°, negative angles and
  full turns follow Preview's clockwise sweep (e.g. 300° → 60° is the 120° wedge,
  0° → −90° is 270°). A full turn (pie or ring) is drawn as a plain circle
  (`DrawList_AddCircleFilled` / `DrawList_AddCircle`) with no radial seam, in REAPER and
  in Preview. An arc whose start and end angles are equal draws nothing in either; it
  stays selectable in the Editor. Arcs up to 180° with ordinary angles export exactly as
  before. Saved angles are never rewritten.
- A click on a tab's label on the canvas now selects that tab, so it can be renamed or
  deleted right there. Dragging from the label still moves the whole tab bar, and a click
  elsewhere on the tab bar still selects the tab bar.
- New widgets are born exportable: the palette and the canvas context menu's Insert place
  a new widget fully inside the export frame. Before, a widget created at the very edge
  (e.g. a Checkbox at the top) could land just outside it — Preflight flagged it and the
  export left it out until the widget was next moved.
- Tidier Selection panel: the colour and text-field flag buttons sit in two columns
  instead of a ragged wrap; a StyleRegion's text, frame, button colour and
  rounding settings share lines two by two; a TabBar's button label sits under the
  tab-button choice and is greyed while that is None, so choosing Leading / Trailing no
  longer moves the rows below.
- The canvas is centred in the window on New, on Load and at 100 % zoom, instead of
  pinned to the top-left corner (both modes).
- The grid Step control is greyed out only when Snap and the grid are both off. Step sets
  the snapping step and the spacing of the visible grid, so it stays available while
  either is on (both modes).
- The ListBox items in the exported script are written with `\0` escapes instead of
  invisible NUL characters, so the script survives copy-paste and version control; the
  list in REAPER is unchanged. Text from a hand-edited project that holds other control
  characters is written as Lua escapes too.
- Otherwise nothing for existing projects: a project with no menu bar, no pie wider than
  180° or wrapping angles, and the title-bar option left off exports and saves exactly as
  in 1.5.0, themed or not.

### Fixed
- Deleting a tab that holds widgets with "Keep inner widgets" moved them into the tab bar
  itself, which left a project that could not be reopened and an Undo that failed on
  every press. The widgets now move into the tab that stays open, at the same place.
  Deleting the open tab also switches the tab bar to another tab instead of leaving none
  selected.
- A menu could disappear on Undo or on reopening the project when a new rectangle, circle
  or other drawn shape took the same internal name as a menu entry. New shapes and tabs
  now skip names the menu bar uses, a renamed shape or tab never takes a menu entry's
  name, and a menu entry cannot be renamed to a name already in use.
- The arrow keys could push a widget out of its group, panel, tab or table cell; the next
  Save → Open or Undo then moved it back. A nudge that would leave the parent is now
  refused, like the same edit in the Selection panel, and a tab can no longer be nudged
  off its tab bar.
- In Preview the arrow keys still moved the selection made in the Editor. Preview is
  view-only again, and the arrow keys do nothing while the startup chooser is open.
- A project with a very deeply nested menu (thousands of levels, hand-made) no longer
  crashes the loader; the depth and 200-entry limits apply as documented.
- Copying or Alt-dragging a single table cell no longer creates a second cell in the same
  row and column (which made the project fail to load). A cell can now be copied only
  together with its table; copying a whole table, or a widget inside a cell, works as
  before.
- A table cell can no longer be moved, nudged or resized on its own (which made it look
  as if it had vanished). Its position and size come from its table, and X / Y / W / H
  are read-only for a cell. Moving or resizing the table, or a container around it, still
  moves the cells.
- A refused Alt-drag copy no longer turns into a normal move of the selection.
- Copying a RadioButtonEx whose value is already 2147483647 no longer produces a value
  outside ReaImGui's range (which made the saved project fail to load); copies take the
  next free value in their group.
- An auto-naming counter with an extreme value in an old or hand-edited project could
  freeze the builder on the next new object; counters are now kept in a safe range.
- Placing a widget over a tab bar no longer drops it into a container or table cell of a
  tab that is not showing; only the visible tab is a target.
- The TabBar's "tab button" control (None / Leading / Trailing) was cut off in the
  Selection panel; it now takes the full row.
- With the Selection panel hidden, the Canvas / Elements / Info panel now fills the right
  column on every tab.
- Clicking a widget in a palette folder no longer opens a collapsed top panel, nor
  switches it to another tab when the Info tab is hidden.

### Notes
- Menu entry names share a name space with widget names (both end up as Lua identifiers)
  and may use letters of any script, digits and underscores, but cannot start with a
  digit or contain spaces or `#`; the export maps the name to a safe, unique Lua
  identifier the same way widget names already are. Creating, pasting or duplicating a
  widget now skips any name a menu entry already uses.
- Opening a project whose menu entry shares a name with a shape or another entry no
  longer drops that entry: its name gets a suffix (`mb_file` → `mb_file_2`), its label
  and contents stay, and the load message lists every rename. Code outside the builder
  that used the old generated name is not updated for you.
- A menu bar whose labels run past the canvas width is flagged in Preflight ("menus past
  the right edge are cut off in REAPER"); export stays enabled.
- Opening a menu, hovering and the check mark toggling are ImGui's own and need no code;
  only what an item *does* is a TODO you fill in. Right-click context menus and popups
  are a separate, later decision — this release covers the window's own menu bar only.

## [1.5.0] - not published separately

### Added
- Angled table headers: per-column ∠ toggle in the Table inspector (disabled without a
  header row), exported as `TableColumnFlags_AngledHeader()` on that column's
  `TableSetupColumn` plus a `TableAngledHeadersRow` call. With any angled column the
  header freeze covers both header rows (the angled row and the label row), so a frozen
  header keeps both in place while the body scrolls. The toggles are kept while the
  header row is off — turning it off and back on, with an undo or a Save / Open in
  between, does not lose them — and they export only while the header row is on.
- Scroll rows: a "scroll rows" field (0–500, disabled without ScrollY, value kept) on a
  Table adds N uniform extra rows at runtime, past the authored ones, in a `for` loop with
  a `-- TODO: … fill with your data` marker. The Editor shows a "+N rows" badge on the
  table; Preview draws a scrollbar lane over the table's full height, header rows
  included (where ReaImGui draws it), with a thumb sized authored / (authored + N) rows.

### Changed
- A ScrollY table with a header row, and any table with angled headers, now sizes its
  body rows in REAPER at runtime from ReaImGui's own metrics (a helper function the export
  adds once, before `draw()`), instead of row heights baked in at export time. The baked
  rows did not leave room for ReaImGui's real header height, so in 1.4.0 a ScrollY table
  with a header row scrolled by 1–3 px; it no longer does. Every other table (no header +
  ScrollY, no angled headers) keeps its 1.4.0 export byte-for-byte.

### Notes
- Table Preview stays schematic (hatched); the angled labels and the scroll lane are
  drawn over that placeholder, not a live table simulation.
- The builder does not narrow a table's columns to make room for the scroll lane —
  ReaImGui's own stretch columns absorb it at runtime, as they always have.
- A project with angled headers saved on one platform opens with its stored cell layout;
  the Editor's predicted band height may differ from it by a px or two until an angled
  column or label is next edited, at which point the cells re-flow to match (the same
  rule already used for auto column widths).
- Projects that use none of the new options export and save exactly as in 1.4.0.

## [1.4.0] - not published separately

### Added
- InvisibleButton: a clickable area that draws nothing
  (`if reaper.ImGui_InvisibleButton(...) then -- TODO: <name> pressed end`). Width and
  height are its own; it has no label. The Editor shows it as a dashed box with its type
  name, Preview shows nothing — as REAPER does. A tooltip works as on any button.
- Tab bar button: a TabBar can end or start its strip with a button (inspector "tab
  button": None / Leading / Trailing, label "+" by default), exported as `TabItemButton`
  with `TabItemFlags_Leading` / `_Trailing` and a `-- TODO: <name> tab button pressed`
  marker.
- Disabled StyleRegion: "disabled (BeginDisabled)" wraps the region's children in
  `BeginDisabled` / `EndDisabled` — they are drawn dimmed and ignore input. Preview dims
  them the same way; the Editor marks the region with a ⊘ badge.
- Frozen table header: "freeze header row" on a Table with a header row and ScrollY emits
  `TableSetupScrollFreeze(ctx, 0, 1)`, so the header stays while the rows scroll.

### Notes
- Projects that use none of the new widgets or options export and save exactly as in
  1.3.0.
- All four need nothing newer than the ReaImGui 0.10 the export already requires.

## [1.3.0] - not published separately

### Added
- Preflight now reports, as an info item, rect/circle labels that are predicted to need
  more lines than fit and so will be cut with "…" in REAPER; the cut may fall on a
  different word than Preview's, since REAPER lays the text out itself. Informational
  only — it does not disable export.

### Changed
- Rect/circle labels and Text primitives are laid out by ReaImGui at runtime, not baked
  into the exported script: line breaks may move by a word compared with 1.2.0, a Text
  primitive now wraps inside its box (and may run below it — the box is a layout hint,
  not a clip), and a rect/circle label that needs more lines than fit ends its last
  visible line in "…".
- Preview and Editor text (primitive labels, Text, widget text) uses a proportional font
  at ReaImGui's own size instead of a fixed-size monospace/11px approximation. On macOS
  it is measured the way ReaImGui itself measures its system font, so Preview's line
  breaks match REAPER far more closely than the plain browser-font approximation did.
- SmallButton / RadioButtonEx auto widths, and label-width footprint checks, are
  measured at ReaImGui's runtime size. They are (re)measured on creation and when a label
  is edited; existing projects keep their stored widths until a label is next edited, so
  opening an older project does not resize its controls.

### Fixed
- Preview no longer draws a hierarchy-line tick, or a "To nodes" line, from a TreeNode
  whose own tree-lines setting is "None" — ReaImGui draws neither, so Preview now matches
  it. This was a display-only bug (not present in the exported script).

### Notes
- Projects with no wrapped rect/circle label and no Text primitive export unchanged.
- The exported script itself is unaffected by any macOS-only text-measurement change:
  layout happens in REAPER at runtime in every case; only the Editor/Preview
  approximation changed.

## [1.2.0] - not published separately

### Added
- TextLink: a text link that returns a click to your code
  (`if reaper.ImGui_TextLink(...) then -- TODO: <name> clicked end`). Unlike
  TextLinkOpenURL it opens nothing itself.
- CheckboxFlags: a checkbox that toggles one bit (0–30) of an integer shared by its flag
  group. All checkboxes of a group write one variable, `state.flagGroups.<group>_val`.
  A new, pasted or duplicated CheckboxFlags takes the lowest bit still free in its group;
  Export check warns when two checkboxes in one group share a bit.
- Plot (PlotLines / PlotHistogram): a line or bar graph with its own width and height.
  Inspector: values (1–64 numbers, comma-separated), overlay text, scale min / max (empty
  = automatic, from the data). The export declares `state.<name>_values` as a
  `reaper.new_array` with a `-- TODO: fill … with your data` marker; without your own
  values a fixed sample series is shown.
- TreeNode lines: None / Full / To nodes in the inspector, drawn on the canvas and in
  Preview and exported as `TreeNodeFlags_DrawLinesFull` / `DrawLinesToNodes`.
- Selectable Highlight: a checkbox in the inspector; the row is drawn as hovered
  (`SelectableFlags_Highlight`).

### Changed
- Exports under a colour theme push three more colours (PlotLines, PlotLinesHovered,
  TreeLines), so the theme's closing `PopStyleColor` count grows by 3. TreeLines equals
  the theme's Border colour. The Default theme still pushes nothing.
- The palette button for TextLinkOpenURL is now labelled "TextLinkOpenURL" (it read
  "TextLink"), and the inspector and element list name the type TextLinkOpenURL.

### Notes
- Projects that use none of the new widgets or options export and save exactly as in
  1.1.0.
- TextLink, TreeNode lines and Selectable Highlight need ReaImGui 0.10 or newer — the
  same as TextLinkOpenURL and every colour-theme export already did in 1.1.0.

## [1.1.0] - not published separately

### Added
- Theme alpha: a custom theme can make frames, buttons, headers, check marks and slider
  grabs translucent. The theme editor has a Header opacity control; the other channels
  take alpha from a theme file.
- Accent headers in the built-in themes: CollapsingHeader, TreeNode and Selectable
  headers in Slate and Light are a translucent band in the theme's accent colour, so what
  lies under a header shows through, as with Dear ImGui's own default style.
- Theme files: export a custom theme to `<id>.reaui-theme.json` (theme panel → Edit… →
  Export…) and import one (theme panel → Import). Export writes what the editor shows,
  without saving it. Import never overwrites a theme you have: an identical theme is
  recognised, a clashing id or name gets a suffix, and anything the file carries that the
  builder cannot use is listed and skipped. Importing does not change the active theme.

### Changed
- Slate and Light headers look different: an accent-coloured, translucent band instead
  of a solid grey one. Projects using Slate or Light export different colours for Header,
  HeaderHovered, HeaderActive, TableHeaderBg, TitleBgActive and the selected/hovered tab
  (TabSelected, TabHovered, TabDimmedSelected). Nothing else in those exports changes.
- Theme panel: the small edit and delete icons on the theme chips are gone. The panel
  has three buttons — + New, Import, Edit… — and Edit… opens the theme editor for the
  active custom theme, where Delete and Export… now live. Built-in themes are read-only;
  use + New to start from one.

### Fixed
- Opening a project no longer overwrites a theme in your library that has the same id.
  The project's theme is used for that session only (dashed outline in the theme panel);
  your library keeps its own.

### Notes
- Project files that carry theme alpha open in older builds with opaque headers.
- A custom theme made before 1.1.0 keeps its look until it is re-saved in the theme
  editor.

## [1.0.72] - not published separately

### Fixed
- Creating a widget with colour flags the project loader rejects (for example
  `NoInputs` on a ColorPicker) produced a project that could not be reopened.
  Creation now uses the loader's own colour-flag check and refuses such a widget.
- Creating a locked-size widget (ArrowButton, Text, SeparatorText, SmallButton, …)
  with a size override kept that size until the first Save → Open, where the loader
  reset it and moved the widget. Creation now applies the loader's locked-size rule
  straight away.
- Neither case was reachable from the palette or the inspector.

### Notes
- As published, 1.0.70 starts new projects at 550×400 (pre-release builds used
  400×250), so a new project's window size and export header differ from those builds.
- Version 1.0.71 was never released.

## [1.0.70] - 2026-09-24

First public release.

### Added
- Visual layout editor for ReaImGui (REAPER DAW): draw a plugin window on a
  canvas, then export it as a runnable ReaImGui Lua script.
- Single HTML file, no build step, no dependencies — runs offline straight
  from disk (`file://`).
- User manual, in Russian and English.

### Fixed
- Flash of the uninitialized UI shell on first page load (unopened widget
  drawer, empty canvas, default theme briefly visible before the real state
  applies) — most noticeable on the hosted version, not on the offline file.
- Minor layout shift shortly after page load caused by a webfont loading
  strategy — replaced with a setting that prevents fonts from swapping in
  after the fact.

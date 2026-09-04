# ReaUI Builder — User Guide, Version 1.0.3

[Русская версия](ReaUI_Builder_Manual_ru_v1_0_3.md) · [HTML version (download and open locally)](ReaUI_Builder_Manual_en_v1_0_3.html)

<details>
<summary>Contents</summary>

- [ReaUI Builder](#manual-reaui-builder)
    - [01. Overview](#manual-01-overview)
        - [Absolute positioning](#manual-absolute-positioning)
        - [Widget contracts](#manual-widget-contracts)
    - [02. Quick start](#manual-02-quick-start)
    - [03. Workspace](#manual-03-workspace)
        - [3.1 · Top toolbar and menus](#manual-3-1-top-toolbar-and-menus)
        - [3.2 · Widget panel](#manual-3-2-widget-panel)
        - [3.3 · Left palette](#manual-3-3-left-palette)
        - [3.4 · Canvas area](#manual-3-4-canvas-area)
        - [3.5 · Right sidebar](#manual-3-5-right-sidebar)
        - [3.6 · Status bar](#manual-3-6-status-bar)
    - [04. Core concepts](#manual-04-core-concepts)
        - [4.1 · Widgets and drawings](#manual-4-1-widgets-and-drawings)
        - [4.2 · Families and variants](#manual-4-2-families-and-variants)
        - [4.3 · Coordinates and snapping](#manual-4-3-coordinates-and-snapping)
        - [4.4 · Sizing contracts](#manual-4-4-sizing-contracts)
        - [4.5 · Labels](#manual-4-5-labels)
        - [4.6 · Containers and nesting](#manual-4-6-containers-and-nesting)
        - [4.7 · Overlap prevention](#manual-4-7-overlap-prevention)
        - [4.8 · Object names](#manual-4-8-object-names)
    - [05. Working with objects](#manual-05-working-with-objects)
        - [5.1 · Placing widgets](#manual-5-1-placing-widgets)
        - [5.2 · Selecting objects](#manual-5-2-selecting-objects)
        - [5.3 · Moving and resizing](#manual-5-3-moving-and-resizing)
        - [5.4 · Copying, duplicating, and deleting](#manual-5-4-copying-duplicating-and-deleting)
        - [5.5 · Undo history](#manual-5-5-undo-history)
        - [5.6 · Batch editing](#manual-5-6-batch-editing)
    - [06. Widget catalog](#manual-06-widget-catalog)
        - [Catalog notes](#manual-catalog-notes)
    - [07. Containers](#manual-07-containers)
        - [7.1 · Panel](#manual-7-1-panel)
        - [7.2 · Group](#manual-7-2-group)
        - [7.3 · StyleRegion](#manual-7-3-styleregion)
        - [7.4 · CollapsingHeader and TreeNode](#manual-7-4-collapsingheader-and-treenode)
        - [7.5 · TabBar](#manual-7-5-tabbar)
        - [7.6 · Table](#manual-7-6-table)
    - [08. Inspector reference](#manual-08-inspector-reference)
    - [09. Flags](#manual-09-flags)
        - [Numeric flags](#manual-numeric-flags)
        - [Text input flags](#manual-text-input-flags)
        - [Color flags](#manual-color-flags)
    - [10. Drawing primitives](#manual-10-drawing-primitives)
        - [Fill, stroke, and linked colors](#manual-fill-stroke-and-linked-colors)
    - [11. Canvas and project settings](#manual-11-canvas-and-project-settings)
        - [Window title](#manual-window-title)
        - [Size](#manual-size)
        - [Background](#manual-background)
        - [Color picker](#manual-color-picker)
        - [Grid](#manual-grid)
        - [Audit grid](#manual-audit-grid)
        - [Zoom and pan](#manual-zoom-and-pan)
    - [12. Themes](#manual-12-themes)
        - [Custom themes](#manual-custom-themes)
    - [13. Preview mode](#manual-13-preview-mode)
    - [14. Exporting](#manual-14-exporting)
        - [Export preflight](#manual-export-preflight)
        - [Generated file structure](#manual-generated-file-structure)
        - [Positioning in code](#manual-positioning-in-code)
        - [What is included](#manual-what-is-included)
    - [15. Saving and loading](#manual-15-saving-and-loading)
        - [Autosave and recovery](#manual-autosave-and-recovery)
    - [16. Keyboard and mouse reference](#manual-16-keyboard-and-mouse-reference)
    - [17. Release limitations](#manual-17-release-limitations)
        - [Not implemented](#manual-not-implemented)
        - [Behavior to be aware of](#manual-behavior-to-be-aware-of)
    - [Appendix A · Widget contracts](#manual-appendix-a-widget-contracts)
    - [Appendix B · Inspector matrix](#manual-appendix-b-inspector-matrix)
    - [Appendix C · Generated file structure](#manual-appendix-c-generated-file-structure)

</details>

<a name="manual-reaui-builder"></a>

# ReaUI Builder

A visual layout editor for ReaImGui interfaces.

Design a window on the canvas and export ReaImGui Lua code for its widgets, drawings, and styles. Builder uses logical layout coordinates; zoom changes the view without changing the exported coordinates. Preview approximates the appearance of the running interface.

This guide covers version **1.0.3**.

---

<a name="manual-01-overview"></a>

## 01. Overview

ReaUI Builder runs from a local HTML file. No installation, server, or build process is required. Styles, icons, widget contracts, and code generation logic are included in the file. The editor uses locally available fonts.

Use Builder to design the **interface layout** for your script. Set widget positions, sizes, labels, and basic properties, then export the window structure as Lua code.

Builder does not generate DSP, project logic, or event handling. In the exported code, `-- TODO` comments mark where to add your own logic for interactive widgets.

- **Output:** Lua code for ReaImGui 0.10
- **Widgets:** 48 placeable types in 41 families, plus the automatically managed TabItem and TableCell types
- **Drawing primitives:** 7 — rectangle, circle, polygon, line, text, triangle, and arc
- **Project format:** versioned JSON

Builder is based on two principles.

<a name="manual-absolute-positioning"></a>

### Absolute positioning

ImGui normally lays out widgets in sequence. Builder uses absolute positioning: it sets `WindowPadding` and `ItemSpacing` to zero and explicitly positions the cursor before each widget.

This keeps element coordinates consistent between the canvas and REAPER.

<a name="manual-widget-contracts"></a>

### Widget contracts

Each widget type has a **contract**: a set of rules that defines its default size, resizing constraints, how its width is applied, and where its label appears.

The canvas, inspector, and code generator share the contract definitions, with additional rules for specific types. A Checkbox has fixed dimensions; a Slider has fixed height and an external label; ColorPicker height is derived. The sections below explain differences between the editing box and exported sizing.

---

<a name="manual-02-quick-start"></a>

## 02. Quick start

Open the HTML file in a modern browser. Builder runs locally through `file://`; editing layouts and generating code do not require a network connection. To run the exported Lua script, use REAPER with ReaImGui 0.10 installed.

1. Open the **Canvas** tab in the right sidebar and set the window size. The default is **600 × 400 px**.
2. Choose a widget from a category in the top toolbar: **Buttons & Toggles, Display, Input, Selection, Color,** or **Layout**. The **Group, Style, Table, Header, Tree,** and **Tabs** containers are also available as permanent shortcuts in the left palette.
3. Click the canvas to place the widget. Its top-left corner is positioned at the click location, adjusted for grid snapping.
4. Use the **Selection** inspector to set the widget's label, value range, flags, position, and size.
5. Click **Export**, resolve any errors in the preflight panel, and click **download .lua**. Alternatively, use **copy** and save the code in a `.lua` file. Load the file through REAPER’s Actions window and run it.

> **Workspace at startup.** The tool palette is on the left. The canvas, window layout, and rulers occupy the center. On the right are the **Canvas / Elements / Info** tabs and the **Selection** inspector. The status bar runs along the bottom.

> **Tip: Save your project.** Builder automatically stores a recovery draft in browser storage and may offer to restore it the next time you open the file. Treat this as a fallback. Before closing the tab, choose **File → Save Project** and keep the resulting JSON file with your script.

---

<a name="manual-03-workspace"></a>

## 03. Workspace

In **Editor** mode, a gray name tag appears above each widget.

**Panel, TabBar,** and **Table** containers also display a header strip. Click this strip to select the container itself instead of an element inside it.

> **Layout in Editor mode.** Name tags and container strips help you edit the layout structure. They are editor aids and are not included in the exported interface.

<a name="manual-3-1-top-toolbar-and-menus"></a>

### 3.1 · Top toolbar and menus

The top toolbar contains four menus, global commands, and widget categories.

| Menu | Commands |
| --- | --- |
| **File** | New Project · Save Project · Load Project |
| **Edit** | Undo · Redo · Copy · Paste · Delete · Duplicate · Select All · Deselect All · Clear All |
| **View** | Dark mode · Grid · Snap to grid · Reference grid in export · Widget footprints · Zoom to fit · Actual size (100%) |
| **Help** | Keyboard Shortcuts · Report a Bug… · About |

**Undo** and **Redo** are unavailable when there are no actions to undo or redo.

**Reference grid in export** adds a magenta measurement grid with 50 px spacing. Unlike the regular editor grid, it is included in the export. The same setting appears as **Audit grid** on the Canvas tab.

**Snap to grid** toggles grid snapping. Enabled options in the **View** menu are marked with a checkmark.

**Clear All** removes every element from the canvas after you confirm the action.

**Export** opens a window containing the generated code.

The six widget categories appear on the right side of the toolbar. Click a category to show its widgets. Click it again to close the panel.

<a name="manual-3-2-widget-panel"></a>

### 3.2 · Widget panel

The widget panel contains the full set of widgets, organized into six categories.

To add a widget, open its category, select the widget, and click the canvas.

If a category is wider than the panel, use the mouse wheel to scroll it horizontally.

The **Display** category is open at startup. Click its button again to close it. When no category is open, the panel is empty; this is expected behavior.

<a name="manual-3-3-left-palette"></a>

### 3.3 · Left palette

The left palette provides permanent access to:

- The **Select** and **Hand** tools.
- Seven drawing tools.
- Shortcuts for six containers: Group, StyleRegion, Table, CollapsingHeader, TreeNode, and TabBar.

**Select** is the default tool. Builder returns to it automatically after you place an object.

Use **Hand** to pan the workspace. Hold `Space` to pan temporarily while using any other tool.

Drawing tools are single-use by default: after you create a shape, Builder switches back to **Select**.

To draw several rectangles, circles, lines, triangles, or arcs, hold `Shift` while selecting the tool, then release it before drawing. The tool stays active until you choose another tool or press `Esc`. The status bar shows `[sticky]`. Polygon, Text, and widget placement return to Select after completion.

<a name="manual-3-4-canvas-area"></a>

### 3.4 · Canvas area

The center of the workspace shows the script window layout: the **MyPlugin** title, the interface area, and the surrounding workspace.

The layout area matches the exported content size. The title bar represents ImGui's native title bar, whose height is added in the exported code:

`OUTER_H = H + title bar height`

The canvas area also includes these controls and indicators:

- **Editor / Preview** — the display mode switch above the center of the canvas. See §13.
- **Theme** — the theme selector above the canvas on the right. See §12.
- **Rulers** — along the top and left edges, showing layout coordinates at the current zoom level.
- **Resize handle ⇲** — at the bottom-right corner of the layout. Drag it to resize the canvas. This is equivalent to changing `W` and `H` on the **Canvas** tab.
- **Preview banner** — appears in Preview mode when the layout contains widgets that Builder can only approximate.

<a name="manual-3-5-right-sidebar"></a>

### 3.5 · Right sidebar

The right sidebar has two parts: the **Canvas / Elements / Info** tabs and the **Selection** inspector.

<a name="manual-info"></a>

#### Info

When a widget is selected, or its placement tool is active, the **Info** tab shows an approximation of its ImGui appearance and a brief description of its purpose.

Choosing a widget from the widget panel or left palette opens **Info** automatically. The tab stays open after placement, updating to show the newly created object.

Info shows a preview and description for one selected widget or drawing, or for an active placement tool. With no single-object or tool context, it shows the project summary.

<a name="manual-elements"></a>

#### Elements

The **Elements** tab lists all layout objects in a tree.

Child elements are indented beneath their containers. Click a row to select the corresponding object on the canvas.

<a name="manual-canvas"></a>

#### Canvas

The **Canvas** tab contains layout settings: window size, background mode, grid visibility, and grid spacing.

It also provides a background color picker with an eyedropper, recent swatches, and opacity control. The color value on the bottom line updates as you choose a color. In *Custom* mode, you can enter it directly. In *Default* mode, this line shows the name of the theme that supplies the canvas background.

To edit the window title, click the title on the canvas itself. See §11.

<a name="manual-selection"></a>

#### Selection

The **Selection** inspector uses the selected widget's contract to show only the properties supported by that type.

The available fields therefore change with the selection. Simple widgets have only a few basic properties; widgets with ranges, formatting, or additional flags have more extensive controls.

Inspector fields are organized into sections: **Main** for labels, names, values, and ranges; **Structure** for tabs and tables; **Appearance** for colors, rounding, and thickness; and **Advanced** for formats and flags. Position and size fields follow without a section heading. Empty sections are hidden.

Selecting multiple objects switches the inspector to batch editing. See §5.6.

Section 8 describes all inspector properties. Appendix B lists the properties available for each widget type.

<a name="manual-3-6-status-bar"></a>

### 3.6 · Status bar

The status bar shows:

- The current zoom level and a button to fit the layout in the view.
- The active tool and a usage hint.
- The cursor coordinates.
- The current selection's `X`, `Y`, `W`, and `H`.
- Whether grid snapping is enabled.
- The element count.

This area also displays status messages.

When Builder rejects a placement, it briefly shows the reason in the status bar instead of opening a dialog. For example:

`blocked: overlaps existing widget`

or

`blocked: container too large for target`

---

<a name="manual-04-core-concepts"></a>

## 04. Core concepts

<a name="manual-4-1-widgets-and-drawings"></a>

### 4.1 · Widgets and drawings

Canvas objects fall into two categories: **widgets** and **drawings**. They differ in interactivity, nesting, overlap rules, drawing order, and export behavior.

|  | Widgets | Drawings |
| --- | --- | --- |
| **Definition** | ImGui widgets: buttons, sliders, tables, and other interactive elements | Geometry in the window's draw list |
| **Interactivity** | Native controls can be interactive; display widgets are visual only | Non-interactive; used for decoration |
| **Export** | `ImGui_Button`, `ImGui_SliderDouble`, … | `DrawList_AddRect`, `AddCircle`, … |
| **Overlap** | Prevented by placement checks; see §4.7 for exceptions | Allowed; stacking order applies |
| **Nesting** | Supported inside containers | Not supported |
| **Drawing order** | Above drawings | Below all widgets |

Use drawings for visual elements without a dedicated ImGui widget, such as a meter housing, a section border, a scale arc, or a logo.

Use widgets for controls that the user interacts with.

<a name="manual-4-2-families-and-variants"></a>

### 4.2 · Families and variants

Builder's palette is organized by **family**, while the exported code uses specific **widget types**.

A family groups variants of the same control. For example:

- `Slider` → `SliderInt` / `SliderDouble` — default: Double
- `Drag` → `DragInt` / `DragDouble` — default: Double
- `Input` → `InputInt` / `InputDouble` — default: Double
- `VSlider` → `VSliderInt` / `VSliderDouble` — default: Double
- `DragRange` → `DragIntRange2` / `DragFloatRange2` — default: Double
- `ColorEdit` → `ColorEdit3` / `ColorEdit4` — default: RGB
- `ColorPicker` → `ColorPicker3` / `ColorPicker4` — default: RGB

For families with multiple variants, a **variant** row appears at the top of the inspector.

Choose the variant before placement, while the placement tool is active. After placement, the row shows the current variant but cannot be edited. To use another variant, delete the widget and place it again.

Keep the palette's family name distinct from the concrete type used in code. For example, **Slider** is the family name in Builder, while **SliderDouble** identifies a specific widget type in the generated code.

Some palette labels are shorter than the contract names used in this guide: **Hint** = HelpMarker, **RadioButton** = RadioButtonEx, **TextLink** = TextLinkOpenURL, **Multiline** = InputTextMultiline, **Style** = StyleRegion, **Header** = CollapsingHeader, **Tree** = TreeNode, and **Tabs** = TabBar.

<a name="manual-4-3-coordinates-and-snapping"></a>

### 4.3 · Coordinates and snapping

Each nested object's `x` and `y` coordinates are stored **relative to its parent**.

For example, a button near the top-left corner of a panel may store the coordinates `(4, 28)`, even though the panel's position puts the button at `(24, 278)` in the overall layout.

Moving the panel also moves the button. The button's own coordinates, `(4, 28)`, remain unchanged.

The inspector and exported code use **absolute layout coordinates**. Builder converts between the two automatically.

<a name="manual-grid-snapping"></a>

#### Grid snapping

When snapping is enabled, coordinates are rounded to the selected grid interval.

Set the interval on the **Canvas** tab:

- 2 px
- 5 px
- 10 px — default

Snapping applies when placing, moving, and resizing objects.

Choose **View → Snap to grid** to turn snapping off. Its current state appears in the status bar.

> **Note: Grid spacing and major grid lines.** The selected interval controls snapping and the spacing of the thin grid lines. Thick lines always appear at 50 px intervals as a visual reference; objects do not snap to them independently. At low zoom levels, Builder may display a coarser grid, but snapping still uses the interval selected on the **Canvas** tab.

<a name="manual-4-4-sizing-contracts"></a>

### 4.4 · Sizing contracts

ImGui does not allow independent width and height settings for every widget type. Builder applies the same constraints on the canvas so the layout can be reproduced correctly in code.

There are four height modes:

| Mode | Behavior |
| --- | --- |
| `explicit-size` | The contract has an explicit layout box. Button, Panel, and similar controls pass dimensions to ImGui; some types use a derived height or a row-count conversion instead. |
| `native-fixed` | ImGui determines the height, usually one frame height, approximately 20 px. Most input widgets use this mode. |
| `native-content` | Content, such as text, determines the height. |
| `native-line` | Height matches a single separator line. |

For a widget with fixed height, only horizontal resize handles remain where width is editable, and **H** is read-only. Checkbox, ArrowButton, and SmallButton have no resize handles; SmallButton width follows its label. ColorPicker has horizontal handles only, with height derived from width and flags.

`↑ height fixed by ImGui` or `↑ size fixed by ImGui`, depending on the widget.

You can still change the widget's width where its contract allows it.

**ColorPicker.** A new picker is 200 px wide with **NoSidePrev** enabled; Builder reserves 246 px of height. H is read-only and changes with width and flags. Enabling the side preview adds 60 px to the reserved width while keeping the picker width unchanged. The export passes the picker width, not the full reserved width, to `SetNextItemWidth`.

**ListBox.** The exporter converts H to a visible-row count: `max(2, round(H / 18))`. H is not passed as a pixel height. TextWrapped also uses a layout box in Builder, while ImGui determines the height of its text.

The contracts use four width modes:

- `explicit-size` — width is passed directly to the widget call.
- `next-item-width` — `SetNextItemWidth` is called before the widget.
- `content-or-widget-box` — the canvas box reserves space for the content; ImGui determines the actual size.
- `widget-box-preview` — the stored box reserves space in Builder; Checkbox and RadioButtonEx use native sizing in the exported interface.

<a name="manual-4-5-labels"></a>

### 4.5 · Labels

By default, ImGui renders a widget's label beside the control as part of the same call. With absolute positioning, this can place text outside the area reserved in Builder.

Builder therefore uses two label placement methods.

<a name="manual-inline-labels"></a>

#### Inline labels

Used by **Button, SmallButton, Selectable, RadioButtonEx,** and native container headers or tabs. Group and StyleRegion have no visible exported header.

The text is passed directly to the ImGui call and rendered as part of the widget.

<a name="manual-external-labels"></a>

#### External labels

Used by sliders, input fields, Combo, Checkbox, color controls, and some other widgets.

The widget itself receives a hidden ID, for example:

`"##Slider_4"`

The visible label is drawn separately through the draw list, above the widget's top edge. Builder shows it in the same position on the canvas.

An external label needs approximately **14 px** of additional vertical space. This space is outside the widget's own bounds.

Leave enough room between controls. For example, if two sliders are placed 20 px apart vertically, the lower slider's label may overlap the upper slider.

<a name="manual-4-6-containers-and-nesting"></a>

### 4.6 · Containers and nesting

Builder supports seven container types:

- Panel
- Group
- StyleRegion
- CollapsingHeader
- TreeNode
- TabBar
- Table

Builder also uses **TabItem** and **TableCell**. These are created automatically and cannot be placed manually.

Nesting is determined by the positions of objects on the canvas.

Placing a widget inside a container's content area makes it a child of that container. Moving it outside returns it to the layout's top level or makes it a child of another suitable container.

There is no separate command for adding an object to a container.

Each of the seven placeable containers reserves a **24 px** strip at the top for editing and placement. TabItem and TableCell are structural children and do not reserve another such strip.

The editing strip itself is not exported. Child coordinates still include the reserved space; native headers and tab strips are drawn by ImGui.

Resizing a container adjusts child positions toward its content area. Table cells and tab pages follow their parent’s size. Keep enough room for the contents: repositioning children does not reduce their dimensions, and the resize checks differ between canvas handles and inspector fields.

Containers can be nested. For example:

`TabBar → TabItem → Panel → Button`

The corresponding ImGui calls are nested in the same order in the exported code.

The inspector's **parent** row shows the selected widget's parent hierarchy.

<a name="manual-4-7-overlap-prevention"></a>

### 4.7 · Overlap prevention

Builder checks widget footprints during placement and movement to prevent overlap. These checks are not a guarantee for every editing path; in particular, pasting containers or children into an existing parent does not use the same free-space search as pasting a top-level leaf widget.

ImGui processes widgets in call order. Overlapping interactive elements can intercept each other's mouse input, so Builder prevents these layouts.

Overlap checks depend on the operation:

- **Placing a new widget.** If the position is occupied, placement is rejected and the status bar displays a message.
- **Moving one widget.** If the target position is occupied, Builder looks for the nearest available grid position.
- **Moving or resizing a selection.** Builder checks the entire selection. If it cannot find a valid placement, it cancels the operation and restores the objects to their previous state.

Some widgets occupy more space than their visible controls suggest.

For example, **ColorPicker** includes a side preview area, while **Checkbox** occupies its full square control area.

Overlap checks use the widget's entire footprint. A placement may therefore be rejected even where there appears to be unused space.

<a name="manual-4-8-object-names"></a>

### 4.8 · Object names

Every new object receives an automatically numbered name:

`Button_2`<br> `Slider_4`<br> `Panel_6`

The name appears on the **Elements** tab and is used to generate Lua code.

For example, `Slider_4` produces:

- The position constant `SLIDER_4_X`.
- The state variable `Slider_4_val`.
- The ImGui ID `"##Slider_4"`.

You can rename objects.

Use Latin letters, digits, and underscores (`_`). Other characters are replaced with `_` during export.

Use unique names wherever possible. If two names become identical after normalization, the preflight panel shows a warning. The exporter resolves duplicates consistently by adding suffixes such as `_2` and `_3`, keeping ImGui IDs unique.

---

<a name="manual-05-working-with-objects"></a>

## 05. Working with objects

<a name="manual-5-1-placing-widgets"></a>

### 5.1 · Placing widgets

Select a widget, then place it on the canvas using either method below.

**Click** to create a widget at the default size defined by its contract.

**Click and drag** to set the size during placement. On each axis, a drag extent of at least **10 layout px**, after snapping, replaces the default dimension. Smaller extents use the default. Fixed or derived dimensions follow the widget’s sizing rules.

For example, you can draw a Button at 200 × 70 px. Dragging a Slider can set its width to 300 px, but its height remains fixed.

After placement, Builder returns to **Select** and keeps the new widget selected, ready for editing in the inspector.

<a name="manual-settings-before-placement"></a>

#### Settings before placement

While a placement tool is active, the **Selection** inspector shows properties you can set before creating the widget.

In version 1.0.3, some fields in this form do not work correctly. The values for `min`, `max`, `format`, numeric flags, `components`, `tooltip`, and `bullet` are not transferred to the new widget on placement.

The variant, label, placeholder text, LabelText value, URL, arrow direction, radio group, and radio value are transferred where applicable. Names are assigned automatically. Set other properties after placement; their pre-placement values are not copied to the new widget.

**Reset** restores the placement settings to their defaults.

Click the active tool again to cancel it.

<a name="manual-placing-widgets-from-the-context-menu"></a>

#### Placing widgets from the context menu

You can also add widgets without opening the widget panel.

Right-click the canvas to open a context menu listing all widget types by category.

The widget you choose is placed at the right-click location.

This is useful when you already know the widget type you need and want to place it directly.

<a name="manual-5-2-selecting-objects"></a>

### 5.2 · Selecting objects

| Action | Result |
| --- | --- |
| **Click** | Select one object |
| **Shift + click** | Add objects that intersect the rectangular area between the anchor object and the clicked object |
| **Cmd/Ctrl + click** | Add an object to the selection or remove it |
| **Drag on empty canvas** | Draw a selection marquee |
| **Shift + marquee** | Add objects to the current selection |
| **Cmd/Ctrl + marquee** | Toggle the selection state of objects within the marquee |
| **Click an Elements row** | Select the corresponding object on the canvas |
| **Cmd/Ctrl + A** | Select all objects |
| **Esc** | Clear the selection or cancel the active tool |

Holding `Shift` or `Cmd/Ctrl` temporarily activates **Select**, even while a drawing or widget placement tool is active.

This lets you change the selection without canceling the current tool.

A multiple selection has a dashed bounding box with eight handles. Drag a handle to resize the selection while respecting each widget's sizing contract.

<a name="manual-5-3-moving-and-resizing"></a>

### 5.3 · Moving and resizing

Drag a selected object to move it.

Drag a selection handle to resize it.

Both operations use grid snapping when enabled.

The widget's contract determines which resize handles are available:

- Eight handles when both width and height can be changed freely.
- Two side handles when height is fixed but width is adjustable.
- No handles when ImGui determines the entire size.

For precise placement, use the inspector's **position** and **size** fields.

These fields use absolute layout coordinates and follow **Snap to grid**. Turn snapping off to enter coordinates in 1 px increments. Values are parsed as integers; negative coordinates are clamped to zero.

The arrow keys move the selection by one grid interval, or by 1 px when snapping is off. Hold `Shift` to move it ten times as far. To enter exact coordinates, use the inspector's **position** fields.

<a name="manual-5-4-copying-duplicating-and-deleting"></a>

### 5.4 · Copying, duplicating, and deleting

<a name="manual-copy-paste"></a>

#### Copy / Paste

`Cmd/Ctrl + C` and `Cmd/Ctrl + V`

The initial paste position is offset by **20 px** on both axes. For a top-level leaf widget, Builder searches for a nearby free position if needed and skips that widget if no position is found. Repeated pastes advance the intended offset.

For Line primitives, Copy/Paste in 1.0.3 leaves the endpoint coordinates unchanged. The pasted line can therefore lie on top of the original; move the selected copy to separate them.

Copying a container includes its entire subtree and preserves all parent–child relationships.

If the original parent still exists, the pasted copy is placed inside it.

<a name="manual-duplicate"></a>

#### Duplicate

`Cmd/Ctrl + D`

Creates and places a copy in one step, equivalent to Copy followed by Paste.

<a name="manual-alt-drag"></a>

#### Alt + drag

Hold `Alt` as you start dragging to move a copy while leaving the original in place.

This also works with multiple selected objects.

<a name="manual-delete"></a>

#### Delete

`Del` or `Backspace`

Deleting a container also deletes all of its children.

No confirmation is required. Use **Undo** to restore deleted objects.

<a name="manual-5-5-undo-history"></a>

### 5.5 · Undo history

Builder stores **50 history steps**.

Successive edits to the same property within **600 ms** are combined into one step. For example, several quick changes to `max` do not create a separate history entry for every intermediate value.

**Undo** restores both the objects and the selection that was active at that step.

Loading a project clears the history. You cannot undo changes made before the load.

<a name="manual-5-6-batch-editing"></a>

### 5.6 · Batch editing

When multiple objects are selected, the inspector shows their total count and a breakdown by type. It offers only properties shared by **all** selected objects. For example, a button and a checkbox share label, tooltip, and bullet properties.

If selected objects have different values for a property, its field shows **Mixed**. No object's value changes until you enter a new value.

The `ΔX / ΔY` fields move the entire selection by the specified offset, subject to workspace-boundary and overlap checks. The workspace extends beyond the exported layout, so a move can leave a widget outside the export frame. If both a container and its child are selected, the child moves with the container once.

Each batch edit is a single history step. One **Undo** restores the original values for every object in the selection.

---

<a name="manual-06-widget-catalog"></a>

## 06. Widget catalog

This catalog lists the **41 widget families** in the toolbar categories. For base dimensions and sizing modes, see [Appendix A](#manual-appendix-a-widget-contracts).

**Buttons & Toggles**

| Family | Purpose |
| --- | --- |
| `Button` | A button that triggers an action when clicked. *Use for commands such as render, apply, reset, or running a script step.* |
| `SmallButton` | A button with reduced padding and the same behavior as Button. *Use for secondary actions or compact layouts.* |
| `Checkbox` | A Boolean control with a checkmark and an external label above it. *Use for on/off settings such as enable, mute, loop, or bypass.* |
| `RadioButtonEx` | A radio button that belongs to a mutually exclusive group; only one option in the group is active. *Use to choose a mode from a short, fixed list.* |
| `ArrowButton` | A square button with an arrow. *Use for steppers, counters, and expand/collapse controls.* |

**Display**

| Family | Purpose |
| --- | --- |
| `Text` | A static, single-line label. *Use for field headings and short status messages.* |
| `BulletText` | A line of text preceded by a bullet. *Use for simple lists.* |
| `TextWrapped` | Text that wraps to the available width. *Use for longer descriptions and help text.* |
| `TextColored` | Text in a specified color. *Use for warnings, status messages, and category labels.* |
| `TextDisabled` | Text in the disabled style. *Use for hints, placeholders, and labels for unavailable options.* |
| `LabelText` | A read-only value on the left and its label on the right. *Use for named values such as tempo or status.* |
| `TextLinkOpenURL` | An underlined link that opens a URL in the browser. *Use for documentation, website, and support links.* |
| `ProgressBar` | A horizontal progress indicator from 0 to 100%. *Use to show progress during rendering, scanning, or other lengthy operations.* |

**Input**

| Family | Purpose |
| --- | --- |
| `Slider` | A horizontal track and thumb for a single numeric value. *Use for bounded continuous parameters such as gain, mix, or threshold.* |
| `VSlider` | A vertical slider for a single numeric value. *Use for faders and level controls.* |
| `SliderAngle` | A slider for entering an angle in degrees. *Use for rotation, panning, and phase.* |
| `Drag` | A numeric field adjusted by dragging horizontally. *Use for fine adjustments and values without fixed bounds.* |
| `DragRange` | Two linked Drag fields that define a lower and upper bound. *Use for ranges such as low/high cutoff or interval start and end.* |
| `Input` | A numeric input field with step buttons. *Use to enter exact integer or decimal values.* |
| `InputText` | A single-line text input. *Use for names, paths, and other short text.* |
| `InputTextWithHint` | A single-line input with placeholder text displayed while the field is empty. *Use to provide a brief example or explain the expected input.* |
| `InputTextMultiline` | A multiline text input. *Use for notes, descriptions, or pasted blocks of text.* |
| `SliderN` | Multiple sliders forming one multicomponent value. *Use for vectors or color channels edited together.* |
| `DragN` | Multiple Drag fields forming one multicomponent value. *Use for coordinates and vectors such as X/Y/Z.* |
| `InputN` | Multiple numeric input fields in one widget. *Use to enter exact multicomponent values.* |

**Selection**

| Family | Purpose |
| --- | --- |
| `Combo` | A drop-down list that displays the selected item. *Use to choose one value from a long list when space is limited.* |
| `ListBox` | A scrollable list with several visible rows. *Use when the available options should remain visible.* |
| `Selectable` | A selectable, full-width row. *Use for lists, menus, and selectable items.* |

**Color**

| Family | Purpose |
| --- | --- |
| `ColorEdit` | A compact color editor with channel fields and a swatch. *Use for editing color directly in the layout.* |
| `ColorPicker` | A full color picker with a saturation area and hue bar. *Use for choosing colors visually.* |
| `ColorButton` | A button displaying a single color swatch. *Use as a color indicator or to open a color editor.* |

**Layout**

| Family | Purpose |
| --- | --- |
| `SeparatorText` | A separator line with a label near the left edge. *Use to title a section.* |
| `Separator` | A horizontal separator line. *Use to divide layout sections.* |
| `HelpMarker` | A “(?)” marker with a tooltip on hover. *Use to explain a nearby control without expanding the layout.* |
| `Panel` | A bordered, scrollable region containing other widgets. *Use for sidebars, settings blocks, and widget groups.* |
| `Group` | An invisible container that groups child widgets into one block. *Use when several widgets should be treated as a single item.* |
| `StyleRegion` | An invisible region with style overrides for colors, rounding, alignment, and fonts. *Use to style a group of widgets independently of the rest of the layout.* |
| `CollapsingHeader` | A full-width header that collapses its contents. *Use for optional or advanced settings.* |
| `TreeNode` | An expandable node with indented children. *Use for hierarchies such as folders, tracks, or nested settings.* |
| `TabBar` | A tab strip that switches between content pages. *Use to organize a panel into pages such as Main / FX / MIDI.* |
| `Table` | A grid of rows and columns containing other widgets. *Use for aligned layouts, matrices, and row-based data.* |

<a name="manual-catalog-notes"></a>

### Catalog notes

**Slider, Drag, and Input.** Slider has a track and range bounds; Drag adjusts values by horizontal dragging; Input supports direct numeric entry. Their inspector fields differ: Slider exposes bounds and flags, Drag adds speed, and scalar Input exposes step settings. SliderAngle and N-suffix families have their own field sets; see Appendix B.

**Families with an N suffix** (SliderN, DragN, InputN) export a `reaper.new_array` with the number of elements specified in *array size*, controlled through a single call. Standard families instead use *components*, from 1 to 4, to generate calls such as `SliderDouble2` or `DragInt3` with separate scalar variables.

**HelpMarker.** Exports a disabled `(?)` symbol. The tooltip text comes from *tooltip*, not from the label.

**Combo and ListBox.** The export includes five placeholder items: `item_0…item_4` and `Item 1…Item 5`, respectively. Item lists cannot be edited in this release; replace them in the generated code.

**RadioButtonEx.** Buttons with the same *group* value share a state variable. Each button has its own *radio value*. This makes the options mutually exclusive in the exported interface.

---

<a name="manual-07-containers"></a>

## 07. Containers

See [§4.6](#manual-4-6-containers-and-nesting) for shared container behavior: a 24 px editor strip, position-based nesting, adjustment of child positions during resizing, and deletion of all children when a container is deleted. The sections below describe the differences between container types.

<a name="manual-7-1-panel"></a>

### 7.1 · Panel

Panel is an ImGui child window: a bordered region that can scroll when needed. Use it for sidebars, settings blocks, and groups of widgets with a visible boundary.

- **border.** Shows a border; enabled by default. When disabled, the region has no visible border but still clips and scrolls its contents.
- **h-scroll.** Enables a horizontal scrollbar. Without it, content wider than the panel is clipped.

```lua
reaper.ImGui_BeginChild(ctx, "Output##Panel_6", 220, 140, reaper.ImGui_ChildFlags_Borders(), 0)
  -- Child widgets; set SetCursorScreenPos for each one
reaper.ImGui_EndChild(ctx)
```

When the theme is not Default, every Panel uses that theme’s child-background color. Builder pushes the color before `BeginChild` and pops it immediately afterward, before emitting the contents. There is no separate per-panel background-color field.

<a name="manual-7-2-group"></a>

### 7.2 · Group

Group has no border or background and draws nothing of its own. It exports `BeginGroup` and `EndGroup` calls, so ImGui treats the child widgets as a single item for layout and hit testing.

Use Group when several widgets should move together in Builder and form one logical block in the exported code. Use Panel if the block needs a visible boundary.

In Preview mode, Group is shown with a hatched fill.

<a name="manual-7-3-styleregion"></a>

### 7.3 · StyleRegion

StyleRegion applies style overrides to its child widgets without affecting the rest of the layout. It is the mechanism for styling individual widgets within a region.

> The StyleRegion inspector provides a checkbox for each override. An unchecked property is inherited unchanged. For example, a region can override only the button color while inheriting every other style setting.

| Override | Export |
| --- | --- |
| text color | `PushStyleColor(Col_Text)` |
| frame bg | `PushStyleColor(Col_FrameBg)` |
| button color | `PushStyleColor(Col_Button)` |
| rounding | `PushStyleVar(StyleVar_FrameRounding)` |
| selectable align | `PushStyleVar(StyleVar_SelectableTextAlign, x, y)`, with both values from 0 to 1 |
| font | `CreateFont(family, flags)` at startup, followed by `PushFont(ctx, font, size)` around the child widgets |

Builder creates each unique font family and style combination with one `CreateFont` call and attaches the font to the context before the first frame. It calls `PushFont` after applying the style overrides and the matching `PopFont` before removing them. The font therefore applies only to widgets inside the StyleRegion.

> **Note.** In Preview, StyleRegion applies supported color, rounding, and font overrides to its children. Its text-color override also reaches external labels and draw-list Text, Separator, SeparatorText, LabelText, and BulletText: Builder resolves their colors when generating Lua. An `Aa` marker in the editor header indicates a font override.

<a name="manual-7-4-collapsingheader-and-treenode"></a>

### 7.4 · CollapsingHeader and TreeNode

Both containers can collapse their contents in the running interface. CollapsingHeader uses a full-width bar; TreeNode uses an indented node with an arrow. TreeNode exports with `TreeNodeFlags_DefaultOpen`, so it starts expanded.

TreeNode has a **hdr color** setting. *default* chooses black or white text for contrast with the canvas; *custom* uses the selected color. The exporter applies this color to the node label in both modes.

Both containers are always shown expanded in Builder.

<a name="manual-7-5-tabbar"></a>

### 7.5 · TabBar

> Select the **Tabs** container header to access its **tabs** list. Edit names in the rows, use × to delete a page and its contents, or add a new page. The × control cannot remove the last remaining page.

A new TabBar starts with two tabs. Click a tab on the canvas to switch pages. Only the active page's contents are displayed and handled. Widgets placed on a page belong to its TabItem.

In the export, `BeginTabItem` / `EndTabItem` pairs are nested inside `BeginTabBar` / `EndTabBar`, with each page's widgets inside the corresponding tab item.

<a name="manual-7-6-table"></a>

### 7.6 · Table

> The Table inspector provides row and column counts, a label and width mode for each column, a header-row checkbox, four table flags, and an overall sizing policy.

Table is a grid of cells, each a container. Row and column counts range from 1 to 16; a new table starts with 3 × 3 cells. When shrinking removes populated cells, the confirmation offers **OK** to delete their contents or **Cancel** to keep those widgets at the top level. Cancel keeps the contents; it does not cancel the table resize.

| Setting | Description |
| --- | --- |
| columns / rows | From 1 to 16 per axis. Growing creates cells; shrinking removes cells and asks how to handle their contents. |
| Column width | Three modes are available. *Auto* sets no width flag. *Fix* sets `WidthFixed` with a width in pixels. *Str* sets `WidthStretch` with a weighting factor. |
| header row | Adds a `TableHeadersRow` call and reserves an 18 px strip for column labels on the canvas. |
| Borders | Cell borders. |
| RowBg | Alternating row backgrounds. |
| Resizable | Allows users to resize columns in the running interface. |
| ScrollY | Enables vertical scrolling. The table height is passed to ImGui only when ScrollY is enabled. |
| sizing | Sizing policy for columns set to *Auto*: `SizingFixedFit` or `SizingStretchSame`. |

Builder subtracts the 24 px editor strip and the 18 px column-label strip, when enabled, from the table height and divides the remainder by the row count. It passes the rounded result to `TableNextRow` as a minimum height. Cells are emitted row by row; their children are ordered by Y, then X. The exporter still emits absolute cursor positions for those child widgets, so this is not automatic flow layout.

> **Note.** Placement in a cell keeps the drop position where possible, clamps it to the cell’s interior with a 4 px inset, and reduces overflowing dimensions if needed. It does not center the widget. If the widget’s center misses the cells but its box intersects the table, placement moves it beyond the nearest table edge.

---

<a name="manual-08-inspector-reference"></a>

## 08. Inspector reference

> The inspector shows the widget type, variant selector, name, label, contract-specific properties, position and size, and a delete button.

**Identification**

| Field | Description |
| --- | --- |
| variant | The selected type within a family: Int / Double or RGB / RGBA. Choose it before placement; for an existing widget, this field is read-only. |
| name | Object identifier. Determines Lua variable names and the ImGui ID. Use a unique name containing only `[A-Za-z0-9_]`. |
| parent | The widget's container hierarchy. Read-only. |
| label / text | Visible text. For Text-family widgets, this is the content itself; for other widgets, it is the label above or inside the control. |
| hint | InputTextWithHint only. The field is labeled **placeholder**; its text appears when the input is empty. |
| value | LabelText only. The read-only value displayed on the left; the label appears on the right. |
| url | TextLinkOpenURL only. The URL opened by the exported link. An empty URL exports `https://example.com`. |

**Numeric properties**

| Field | Description |
| --- | --- |
| components | From 1 to 4. Generates a multicomponent call such as `SliderDouble3`, with a separate variable for each component. |
| array size | N-suffix families only. The size of the `reaper.new_array`, from 2 to 64. |
| min / max | Range bounds. Empty fields use the defaults for the widget type. |
| speed | Drag families only. The change in value per pixel of mouse movement. |
| step / step fast | Scalar InputInt/InputDouble. Explicit step sizes for the step controls. InputInt with 2–4 components omits these arguments in export. |
| format | A printf-style format, such as `%.2f` or `%d dB`. Also controls how the value appears in the widget. |
| format min / max | DragRange only. Separate formats for the lower and upper bounds, such as `Min: %d` and `Max: %d`. |
| numeric flags | Clamp, Log, NoInput, Wrap. See [§9](#manual-09-flags). |

Gray values in empty numeric fields are inspector suggestions. Export fallbacks depend on the widget and on which optional arguments are present, so the gray value is not always the exported default. Enter ranges, speeds, steps, and formats explicitly when their exact values matter. Clearing a field removes its explicit value.

**Appearance and behavior**

| Field | Description |
| --- | --- |
| tooltip | The field is labeled **hint**. It adds `SetItemTooltip` for supported leaf widgets. Text, Separator, SeparatorText, LabelText, BulletText, and TextWrapped do not offer it. Container inspectors show the field, but container export does not emit it. |
| bullet | The **prefix bullet** checkbox adds `Bullet()` and `SameLine()` before supported leaf widgets. The field shown for containers is not emitted by container export. |
| color | The initial color for TextColored and color widgets can be set through the **color** field in batch editing. In 1.0.3 this field is missing from the single-object inspector. |
| alpha | From 0 to 255, for RGBA variants, ColorButton, and TextColored. For ColorEdit4 and ColorPicker4, the exporter uses this alpha only when the object also has an explicit color. |
| direction | ArrowButton only. Arrow direction: Left, Right, Up, or Down. |
| overlay | ProgressBar only. Text over the bar. An empty field exports an empty overlay string, so no automatic percentage is requested. |
| indeterminate | ProgressBar only. Displays an animation instead of a progress value. |
| group / radio value | RadioButtonEx only. The shared state variable and this button's value. |
| hdr color | TreeNode only. The node label color: default or custom. |
| border / h-scroll | Panel only. Border and horizontal scrolling. |
| EEL2 callback | Text input widgets only. See below. |

**Geometry**

The **position** (X, Y) and **size** (W, H) fields use integer layout pixels and follow Snap to grid. Fixed dimensions are read-only. ColorPicker’s H is calculated from its picker width and flags.

Drawings also have a **primitive order** row with back, backward, forward, and front buttons. These change the order within the drawing layer only; drawings always remain below widgets.

**EEL2 callbacks**

> The text input inspector shows basic flags first, followed by callback events and an EEL2 code field.

Select a placed text input and enter EEL2 code in **EEL2 callback**. If no callback event is selected, entering the first nonempty callback automatically enables **OnEdit**. Choose the required events in the flags section; OnTab and OnUp/Down are available only for single-line inputs. The generated script compiles and attaches the callback at startup. The hint below the field warns when code has no selected event.

---

<a name="manual-09-flags"></a>

## 09. Flags

<a name="manual-numeric-flags"></a>

### Numeric flags

These flags apply to the Slider and Drag families. The export combines them using bitwise OR.

**Wrap** is exported for Drag controls only. The SliderN inspector also allows it to be toggled in 1.0.3, but the exporter removes it from SliderN calls.

| Option | ImGui flag | Effect |
| --- | --- | --- |
| Clamp | `SliderFlags_AlwaysClamp` | Clamps manually entered values to the range as well as values set by dragging. |
| Log | `SliderFlags_Logarithmic` | Uses a logarithmic response. Useful for frequency and volume controls. |
| NoInput | `SliderFlags_NoInput` | Disables direct value entry through Ctrl + click. |
| Wrap | `SliderFlags_WrapAround` | Drag families only. Wraps the value when it passes a range boundary. |

<a name="manual-text-input-flags"></a>

### Text input flags

| Section | Button | ImGui flag | Applies to |
| --- | --- | --- | --- |
| basic | `ReadOnly` | `InputTextFlags_ReadOnly` | `InputText`, `InputTextWithHint`, `InputTextMultiline` |
| basic | `Pass` | `InputTextFlags_Password` | `InputText`, `InputTextWithHint` |
| basic | `Dec` | `InputTextFlags_CharsDecimal` | `InputText`, `InputTextWithHint` |
| basic | `Hex` | `InputTextFlags_CharsHexadecimal` | `InputText`, `InputTextWithHint` |
| basic | `Enter` | `InputTextFlags_EnterReturnsTrue` | `InputText`, `InputTextWithHint`, `InputTextMultiline` |
| basic | `Tab` | `InputTextFlags_AllowTabInput` | `InputTextMultiline` |
| basic | `Ctrl+Enter` | `InputTextFlags_CtrlEnterForNewLine` | `InputTextMultiline` |
| callback | `OnEdit` | `InputTextFlags_CallbackEdit` | `InputText`, `InputTextWithHint`, `InputTextMultiline` |
| callback | `Always` | `InputTextFlags_CallbackAlways` | `InputText`, `InputTextWithHint`, `InputTextMultiline` |
| callback | `CharFilter` | `InputTextFlags_CallbackCharFilter` | `InputText`, `InputTextWithHint`, `InputTextMultiline` |
| callback | `OnTab` | `InputTextFlags_CallbackCompletion` | `InputText`, `InputTextWithHint` |
| callback | `OnUp/Down` | `InputTextFlags_CallbackHistory` | `InputText`, `InputTextWithHint` |

<a name="manual-color-flags"></a>

### Color flags

> The color flags inspector places independent toggles at the top, followed by four single-choice groups: display, data type, input, and picker style. Alpha-channel options appear last.

> **Note.** Display, data type, input, and picker options appear as segmented single-choice controls. Selecting an option clears the other flags in that group; clicking the active option clears it.

| Section | Button | ImGui flag | Applies to |
| --- | --- | --- | --- |
| basic | `NoAlpha` | `ColorEditFlags_NoAlpha` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4`, `ColorButton` |
| basic | `NoPicker` | `ColorEditFlags_NoPicker` | `ColorEdit3`, `ColorEdit4` |
| basic | `NoInputs` | `ColorEditFlags_NoInputs` | `ColorEdit3`, `ColorEdit4` |
| basic | `NoTip` | `ColorEditFlags_NoTooltip` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4`, `ColorButton` |
| basic | `NoLabel` | `ColorEditFlags_NoLabel` | `ColorEdit3`, `ColorEdit4` |
| basic | `NoSidePrev` | `ColorEditFlags_NoSidePreview` | `ColorPicker3`, `ColorPicker4` |
| basic | `NoSmallPrev` | `ColorEditFlags_NoSmallPreview` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| basic | `NoOptions` | `ColorEditFlags_NoOptions` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| basic | `NoDragDrop` | `ColorEditFlags_NoDragDrop` | `ColorEdit3`, `ColorEdit4`, `ColorButton` |
| basic | `NoBorder` | `ColorEditFlags_NoBorder` | `ColorButton` |
| display | `RGB` | `ColorEditFlags_DisplayRGB` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| display | `HSV` | `ColorEditFlags_DisplayHSV` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| display | `Hex` | `ColorEditFlags_DisplayHex` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| data type | `0..255` | `ColorEditFlags_Uint8` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| data type | `0..1` | `ColorEditFlags_Float` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| input | `InputRGB` | `ColorEditFlags_InputRGB` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| input | `InputHSV` | `ColorEditFlags_InputHSV` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| picker | `HueBar` | `ColorEditFlags_PickerHueBar` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| picker | `HueWheel` | `ColorEditFlags_PickerHueWheel` | `ColorEdit3`, `ColorEdit4`, `ColorPicker3`, `ColorPicker4` |
| alpha | `AlphaBar` | `ColorEditFlags_AlphaBar` | `ColorEdit4`, `ColorPicker4` |
| alpha | `HalfPrev` | `ColorEditFlags_AlphaPreviewHalf` | `ColorEdit4`, `ColorPicker4`, `ColorButton` |
| alpha | `NoBg` | `ColorEditFlags_AlphaNoBg` | `ColorEdit4`, `ColorPicker4`, `ColorButton` |
| alpha | `Opaque` | `ColorEditFlags_AlphaOpaque` | `ColorEdit4`, `ColorPicker4`, `ColorButton` |

---

<a name="manual-10-drawing-primitives"></a>

## 10. Drawing primitives

> Drawings on the canvas include rectangles, circles, triangles, lines, text, and arcs. All primitives export as draw list calls and appear below the widget layer.

To draw a shape, select its tool from the palette and drag on the canvas. For a polygon, click to place each vertex instead. Close it by clicking the first point again, double-clicking, or pressing `Enter`. Press `Esc` to cancel an unfinished polygon.

| Primitive | Properties | Export |
| --- | --- | --- |
| Rectangle | fill, stroke, rounding, thickness, opacity | `AddRectFilled` and `AddRect` |
| Circle | fill, stroke, thickness, opacity | `AddCircle(Filled)`; `AddEllipse(Filled)` when W ≠ H |
| Triangle | fill, stroke, thickness, orient (four directions) | `AddTriangle(Filled)` |
| Line | stroke, thickness | `AddLine` |
| Polygon | fill, stroke, thickness, list of points | `PathFillConvex` for convex polygons; triangulation with `AddTriangleFilled` for concave polygons |
| Arc | `ring`: stroke, thickness, start and end angles; `pie`: the same properties plus fill | `PathArcTo` and `PathStroke`; `pie` also uses `PathFillConvex` |
| Text | text, color, size, horizontal and vertical alignment | `AddText`, with `CalcTextSize` where needed |

> The arc inspector uses angles in degrees following ImGui conventions: 0° points right, and angles increase clockwise. A 270° sweep starting at 135° gives a conventional rotary knob scale.

Exported drawings are clipped to the layout. A drawing is included if any part of it intersects the layout: for example, a rectangle extending past an edge is exported, and ImGui clips the portion outside. Widgets follow a stricter rule: a widget must be entirely inside the frame to be exported.

**Drawing text size.** The *text size* field changes text on the Builder canvas. The text primitive’s exported `AddText` call does not carry this size; it uses the current ImGui font size. Set the font in Lua when a specific exported text size is required.

<a name="manual-fill-stroke-and-linked-colors"></a>

### Fill, stroke, and linked colors

For primitives, the inspector's **fill & stroke** section contains two color swatches, a **none** checkbox for each, and a linking bracket on the left.

The two **none** checkboxes are mutually exclusive. A shape can have no fill or no stroke, but it cannot have neither. Both boxes may be unchecked, but only one may be checked. When one is checked, the other is dimmed. Clicking the dimmed box transfers **none** to that property in a single undo step.

The stroke's **none** option is available only for closed shapes that support a fill: rectangle, circle, triangle, polygon, and arc in `pie` mode. A line has only a stroke, and the stroke defines the entire shape of a `ring` arc, so neither shows this checkbox.

The **link** is the bracket to the left of the two rows. When linked, changing either color updates both in one undo step. Enabling the link does not change existing colors; it controls subsequent edits. The link is hidden for lines and `ring` arcs, which have no second color.

> **Note.** ImGui fills only convex paths. A non-convex polygon is triangulated on export and rendered with multiple `AddTriangleFilled` calls. Its outline remains a single closed path.

---

<a name="manual-11-canvas-and-project-settings"></a>

## 11. Canvas and project settings

<a name="manual-window-title"></a>

### Window title

The title used when the layout opens in REAPER appears in the blue header above the canvas. Click it to edit. Press `Enter` to apply the title or `Esc` to cancel.

The title is used in the generated script (`CreateContext` and `ImGui_Begin`), saved in the project file, and used as the download filename: *Track Tools* → `Track_Tools.lua`. Apostrophes are escaped so they do not break the script.

<a name="manual-size"></a>

### Size

The Canvas tab's W and H fields set the window's content size. They are exported as `W, H`. Press `Enter` or leave the field to apply a change. Dragging the ⇲ handle has the same effect.

<a name="manual-background"></a>

### Background

- **Default.** The canvas follows the active theme, while the export retains ImGui's native window background. If the selected theme is not Default, Builder also applies its background color to the canvas child window through `PushStyleColor`.
- **Custom.** Choose a color and opacity in the Canvas picker. Opacity blends the color toward white; the export writes the resulting opaque color as `Col_WindowBg`. It does not make the REAPER window transparent.

<a name="manual-color-picker"></a>

### Color picker

Color swatches for drawings, StyleRegion overrides, batch editing, and the theme editor open Builder’s popover picker. It normally opens to the right and upward; near a window edge it moves left or downward. The Canvas tab has its own embedded background picker.

The popover has a saturation/brightness square, hue bar, **HEX** field, and recent swatches. The screen eyedropper appears only if the browser supports it. The HEX field is focused on opening and accepts `#RRGGBB` and `#RGB`. Color changes apply live. `Enter` closes the picker; `Esc` closes it and restores focus without reverting changes. Undo grouping follows the edited field’s history behavior.

Recent swatches are shared across all color fields and retained until the page is reloaded.

<a name="manual-grid"></a>

### Grid

**Show grid** controls the fine grid. Its visibility is stored separately for Editor and Preview modes. **Step** sets the spacing to 2, 5, or 10 px and also controls the snapping interval.

<a name="manual-audit-grid"></a>

### Audit grid

*View → Reference grid in export* enables a magenta measurement grid with 50 px spacing. Unlike the regular grid, the audit grid is exported: the generated code draws the same grid in the REAPER window. Use it to compare coordinates between Builder and REAPER. Disable it before releasing your script.

<a name="manual-zoom-and-pan"></a>

### Zoom and pan

Zoom ranges from 75% to 250%. Choose a preset in the status bar, use `Cmd/Ctrl` + mouse wheel to zoom around the pointer, or click ⤢ to fit the layout in the view. Pan with the Hand tool or by holding `Space`. Zoom affects the view only; object coordinates do not change.

---

<a name="manual-12-themes"></a>

## 12. Themes

> The theme selector lists built-in and custom themes, with **+ Add** and **Edit** controls below. The active theme is saved with the project.

A theme defines fifteen color values: thirteen ImGui style colors, a child-window background, and a color for labels drawn through the draw list. Three themes are included: **Default** (no theme color overrides), **Slate (dark)**, and **Light**.

Themes affect both Preview mode and the export. For a theme other than Default, the export applies its colors with `PushStyleColor` immediately after opening the canvas child window and removes them before closing it.

> With Slate selected, Preview approximates how the layout will appear in REAPER using that palette.

<a name="manual-custom-themes"></a>

### Custom themes

> In the New Theme dialog, four colors define the palette. The swatch strip shows the derived color slots.

To create a theme, choose colors for the background, text, controls, and accent. The remaining eleven slots are calculated automatically. Hovered and active states are derived from the control color: lighter on dark backgrounds and darker on light backgrounds. Header colors blend the background and accent. The accent is also used for checkmarks and the active slider grab.

- Custom themes are stored in the browser's localStorage and are available only in that browser on that computer.
- The active custom theme’s definition is included in the project file. Loading that project makes the theme available for the current session; it does not automatically save it to the browser’s permanent theme library.
- **Edit** opens custom theme management. Use the pencil button to edit a theme, or delete a theme you no longer need. Built-in themes cannot be edited or deleted.

---

<a name="manual-13-preview-mode"></a>

## 13. Preview mode

> Preview hides name tags, container editor strips, and selection controls. It approximates the widgets' ImGui appearance using the active theme.

Use the Editor / Preview switch above the canvas. Preview prevents direct canvas dragging, resizing, and placement, but it does not lock the project: inspector edits and editing commands remain active. Widgets are drawn as visual approximations; clicking them selects them rather than operating the exported control. Switch tabs in Editor mode.

Some widgets appear as labeled, hatched placeholders: **Group**, **Table**, **ColorPicker3/4**, and **TextWrapped**. A banner appears at the bottom when the canvas contains these widgets.

> **Preview limitations in 1.0.3:**
>
> - ColorEdit does not reflect display flags. It always shows R/G/B fields and a color swatch, regardless of *DisplayHSV*, *Hex*, or *NoInputs* settings.
>
> In Preview and export, StyleRegion’s text-color override also applies to external labels. Other widget properties may be represented schematically: Preview does not run ReaImGui or execute the generated Lua.
>
> ProgressBar Preview uses a fixed fill of about 45%; it does not show the exported animation or overlay. Numeric controls likewise use representative values rather than running the generated script.

---

<a name="manual-14-exporting"></a>

## 14. Exporting

<a name="manual-export-preflight"></a>

### Export preflight

The preflight panel at the top of the *Export* window runs whenever you open the window. It reports findings at three levels.

- **Error.** Preflight has found a condition that blocks export, such as invalid IDs, parent relationships, geometry, widget types, or numeric values. The *copy* and *download* buttons remain disabled until these errors are resolved. Preflight validates project data; it does not execute Lua.
- **Warning.** Export remains available, but a setting or omission needs attention. Examples include objects outside the layout, children of omitted containers, clipped drawings, colliding names, duplicate radio values, an empty TabBar, or missing table cells.
- **Information.** A single summary line reports how many elements have no visible label.

The panel header reports how many objects will be **omitted** and how many will be exported out of the total. Review this summary to identify omissions that would not be apparent from the code alone.

Click a finding to select the corresponding object on the canvas.

> The Export window's ReaImGui tab contains the generated script: context creation, position constants, state variables, a drawing function, and a defer loop. Click **copy** to copy the code to the clipboard.

<a name="manual-generated-file-structure"></a>

### Generated file structure

The generated code follows a consistent structure:

1. **Header comments.** Canvas dimensions and positioning rules.
2. **Context and dimensions.** The `CreateContext` call and `W, H` and `OUTER_H` values. `OUTER_H` adds the title bar height so the content area matches the layout dimensions.
3. **Position constants.** Widget X/Y coordinates and widths are listed near the top. The exporter also embeds coordinates and sizes directly in many draw-list and widget calls. For consistent layout changes, edit the Builder project and export again.
4. **State variables.** State for interactive widgets, one shared variable per radio group, and `reaper.new_array` arrays for N-suffix families.
5. **Fonts and EEL2 callbacks.** Created and attached once, before the loop, if a StyleRegion or input field uses them.
6. **The `draw()` function.** Sets padding and spacing to zero, opens the window, obtains the draw list and coordinate origin, opens the canvas child window, applies the theme, draws primitives, and then emits widgets in tree order.
7. **The `defer` loop.**

<a name="manual-positioning-in-code"></a>

### Positioning in code

```lua
PushStyleVar(StyleVar_WindowPadding, 0, 0)
PushStyleVar(StyleVar_ItemSpacing,   0, 0)
…
local wx, wy = GetWindowPos(ctx)
local cx, cy = GetCursorStartPos(ctx)
local ox, oy = wx + cx, wy + cy   -- origin for all coordinates
…
SetCursorScreenPos(ctx, ox + SLIDER_4_X, oy + SLIDER_4_Y)
SetNextItemWidth(ctx, SLIDER_4_W)
```

Widgets and draw list geometry use the same origin, `ox, oy`. A rectangle placed behind a button therefore stays aligned with it in the running interface.

> **Note.** Zero padding and spacing are fundamental to the layout. If you add ordinary flow-layout widgets without setting the cursor position, they will appear without spacing. Position the cursor explicitly or restore the style variables around the code you add.

<a name="manual-what-is-included"></a>

### What is included

- A widget is exported only if its full footprint lies inside the layout bounds. A widget extending past an edge is omitted.
- A drawing is exported if it intersects the layout area.
- The audit grid is exported when enabled.

---

<a name="manual-15-saving-and-loading"></a>

## 15. Saving and loading

<a name="manual-autosave-and-recovery"></a>

### Autosave and recovery

Builder automatically stores a draft of the current layout in browser storage. It saves 0.8 seconds after a change and also checks twice per second for changes that were not recorded in the undo history.

The status bar shows *No unsaved changes*, *Unsaved changes*, *Saving…*, or *Autosaved HH:MM*.

If a recovery draft exists when Builder opens, it offers to restore or discard it. This can follow a normal close as well as an unexpected interruption. The prompt shows the draft’s time, element count, and Builder version. Browser handling of storage for local files varies, so keep a portable JSON copy.

Builder clears the recovery draft when it initiates a JSON download, successfully loads a project, or completes New Project. It cannot confirm that the browser finished saving the downloaded file. Canceling the load picker or encountering a load error keeps the draft. A restored draft remains unsaved until a project download is initiated.

Autosave is a recovery aid, not a project file. It is tied to one browser and is lost when its site data is cleared.

*File → Save Project* downloads `reaper-ui-project.json`. It includes the title, canvas dimensions, background, active theme and custom definition, audit-grid state, snap setting, grid step, counters, and objects. Editor/Preview mode, ordinary-grid visibility, zoom, and undo history are not saved in the file.

*File → Load Project* replaces the current layout. If the current project has unsaved changes, Builder asks for confirmation before opening the file picker; otherwise, the picker opens immediately. A successful load clears undo history and resets zoom to 100%. Loaded data is normalized using the same rules as startup data, so projects from older builds may be updated to the current structure automatically.

A file with missing or duplicate object IDs is rejected before the current layout is replaced. The open project remains unchanged.

*File → New Project* removes all objects and resets the canvas to 600 × 400 px. It retains the current window title, background, theme, grid, and snapping settings.

> **Note.** The project file is the only format that preserves all editable project data. Exported Lua code cannot be imported back into Builder. Keep the `.json` file with your script.

---

<a name="manual-16-keyboard-and-mouse-reference"></a>

## 16. Keyboard and mouse reference

> Choose **Help → Keyboard Shortcuts** to open the built-in shortcut reference.

| Action | Result |
| --- | --- |
| Arrow keys | Move the selection by one grid interval, or by 1 px when snapping is off |
| `Shift` + arrow keys | Move by ten increments |
| `Cmd/Ctrl` + `C` | Copy the selection, including container subtrees |
| `Cmd/Ctrl` + `V` | Paste the copied selection |
| `Cmd/Ctrl` + `D` | Duplicate |
| `Cmd/Ctrl` + `Z` | Undo |
| `Cmd/Ctrl` + `Shift` + `Z` · `Cmd/Ctrl` + `Y` | Redo |
| `Cmd/Ctrl` + `A` | Select all objects |
| `Del` · `Backspace` | Delete the selection, including all children of selected containers |
| `Esc` | Clear the selection, cancel the tool or unfinished polygon, or close a dialog or context menu |
| `Enter` while drawing a polygon | Close the polygon |
| `Shift` + click | Extend the selection across the area from the anchor object |
| `Cmd/Ctrl` + click | Add an object to the selection or remove it |
| `Shift` + marquee | Add objects intersecting the marquee to the selection |
| `Cmd/Ctrl` + marquee | Toggle the selection state of objects intersecting the marquee |
| `Alt` + drag an object | Drag a copy |
| `Space` + drag the canvas | Pan the workspace |
| `Cmd/Ctrl` + mouse wheel | Zoom around the pointer |
| Right-click the canvas | Open the widget menu and place a widget at the click location |
| `Shift` + click Rectangle, Circle, Line, Triangle, or Arc | Keep the selected tool active for repeated drawing |
| Double-click or click the first point while drawing a polygon | Close the polygon |

Arrow keys and `Cmd/Ctrl` shortcuts are not intercepted while a text field, text area, or list has focus. `Esc` still closes an open dialog or menu and cancels the current action.

---

<a name="manual-17-release-limitations"></a>

## 17. Release limitations

This section describes features that are unavailable or may behave differently than expected in version 1.0.3.

<a name="manual-not-implemented"></a>

### Not implemented

- **Editing Combo and ListBox items.** The export uses five placeholder items. The widgets themselves work: their selection variables are declared and updated. Replace only the item strings. The generated code marks the relevant location with `-- TODO: replace the placeholder items …`.
- **Importing or exporting a theme as a separate file.** Themes are stored in the project file and localStorage.

<a name="manual-behavior-to-be-aware-of"></a>

### Behavior to be aware of

- **Widget settings before placement.** The form shows `min`, `max`, `format`, numeric flags, `components`, `tooltip`, and `bullet`, but version 1.0.3 does not transfer these values to the created widget. Set them after placement. See §5.1.
- A widget extending outside the layout is not exported. The preflight panel in *Export* identifies these objects by name; see §14. If a container is omitted, all of its contents are omitted too, even if the children themselves lie inside the layout.
- Labels for sliders, input fields, and similar controls appear above the widget, outside its bounds. Without vertical spacing, they overlap objects above them.
- The `.lua` filename comes from the window title. Characters other than Latin letters, digits, underscores, and hyphens become underscores; if no usable name remains, the filename is `MyPlugin.lua`.
- The toolbar's second row is empty when no widget category is open. The **Display** category is open at startup.
- In a narrow window, the theme panel may cover part of the layout. Click outside the panel to close it.
- Custom themes are stored in one browser's localStorage and removed when its site data is cleared. Save the project file to keep a permanent copy of the active theme.

---

<a name="manual-appendix-a-widget-contracts"></a>

## Appendix A · Widget contracts

The table lists all 50 contract types, including the automatically managed TabItem and TableCell. Sizes are base contract values before placement snapping and type-specific adjustments. **H** marks a fixed height; **D** marks a height derived from width and flags. SmallButton width follows its label; Checkbox and ArrowButton cannot be resized.

| Type | Family · variant | Size | Width | Height | Description |
| --- | --- | --- | --- | --- | --- |
| `Button` | `Button` | 100×20 | `explicit-size` | `explicit-size` | A button that triggers an action when clicked. |
| `SmallButton` | `SmallButton` | 50×20 **H** | `explicit-size` | `native-fixed` | A button with reduced padding and the same behavior as Button. |
| `ArrowButton` | `ArrowButton` | 17×17 **H** | `explicit-size` | `explicit-size` | A square button with an arrow. |
| `Checkbox` | `Checkbox` | 20×20 **H** | `widget-box-preview` | `native-fixed` | A Boolean control with a checkmark and an external label above it. *Use for on/off settings such as enable, mute, loop, or bypass.* |
| `RadioButtonEx` | `RadioButtonEx` | 20×20 **H** | `widget-box-preview` | `native-fixed` | A radio button that belongs to a mutually exclusive group; only one option in the group is active. |
| `Selectable` | `Selectable` | 140×20 | `explicit-size` | `explicit-size` | A selectable, full-width row. |
| `Text` | `Text` | 120×20 **H** | `content-or-widget-box` | `native-content` | A static, single-line label. |
| `TextColored` | `TextColored` | 120×20 **H** | `content-or-widget-box` | `native-content` | Text in a specified color. |
| `TextDisabled` | `TextDisabled` | 120×20 **H** | `content-or-widget-box` | `native-content` | Text in the disabled style. |
| `TextWrapped` | `TextWrapped` | 200×60 | `explicit-size` | `explicit-size` | Text that wraps to the available width. |
| `BulletText` | `BulletText` | 160×14 **H** | `explicit-size` | `native-line` | A line of text preceded by a bullet. |
| `LabelText` | `LabelText` | 140×20 **H** | `next-item-width` | `native-fixed` | A read-only value on the left and its label on the right. *Use for named values such as tempo or status.* |
| `TextLinkOpenURL` | `TextLinkOpenURL` | 120×14 **H** | `explicit-size` | `native-line` | An underlined link that opens a URL in the browser. |
| `SeparatorText` | `SeparatorText` | 200×14 **H** | `explicit-size` | `native-line` | A separator line with a label near the left edge. *Use to title a section.* |
| `Separator` | `Separator` | 200×10 **H** | `explicit-size` | `native-line` | A horizontal separator line. |
| `HelpMarker` | `HelpMarker` | 24×20 **H** | `content-or-widget-box` | `native-content` | A “(?)” marker with a tooltip on hover. |
| `ProgressBar` | `ProgressBar` | 120×20 | `explicit-size` | `explicit-size` | A horizontal progress indicator from 0 to 100%. |
| `SliderInt` | `Slider` · `Int` | 120×20 **H** | `next-item-width` | `native-fixed` | A horizontal track and thumb for a single numeric value. |
| `SliderDouble` | `Slider` · `Double` | 120×20 **H** | `next-item-width` | `native-fixed` | A horizontal track and thumb for a single numeric value. |
| `SliderDoubleN` | `SliderN` | 160×20 **H** | `next-item-width` | `native-fixed` | Multiple sliders forming one multicomponent value. |
| `VSliderInt` | `VSlider` · `Int` | 18×160 | `explicit-size` | `explicit-size` | A vertical slider for a single numeric value. |
| `VSliderDouble` | `VSlider` · `Double` | 18×160 | `explicit-size` | `explicit-size` | A vertical slider for a single numeric value. |
| `SliderAngle` | `SliderAngle` | 140×20 **H** | `next-item-width` | `native-fixed` | A slider for entering an angle in degrees. |
| `DragInt` | `Drag` · `Int` | 120×20 **H** | `next-item-width` | `native-fixed` | A numeric field adjusted by dragging horizontally. |
| `DragDouble` | `Drag` · `Double` | 120×20 **H** | `next-item-width` | `native-fixed` | A numeric field adjusted by dragging horizontally. |
| `DragDoubleN` | `DragN` | 160×20 **H** | `next-item-width` | `native-fixed` | Multiple Drag fields forming one multicomponent value. |
| `DragIntRange2` | `DragRange` · `Int` | 160×20 **H** | `next-item-width` | `native-fixed` | Two linked Drag fields that define a lower and upper bound. |
| `DragFloatRange2` | `DragRange` · `Double` | 160×20 **H** | `next-item-width` | `native-fixed` | Two linked Drag fields that define a lower and upper bound. |
| `InputInt` | `Input` · `Int` | 80×20 **H** | `next-item-width` | `native-fixed` | A numeric input field with step buttons. |
| `InputDouble` | `Input` · `Double` | 80×20 **H** | `next-item-width` | `native-fixed` | A numeric input field with step buttons. |
| `InputDoubleN` | `InputN` | 160×20 **H** | `next-item-width` | `native-fixed` | Multiple numeric input fields in one widget. |
| `InputText` | `InputText` | 120×20 **H** | `next-item-width` | `native-fixed` | A single-line text input. |
| `InputTextWithHint` | `InputTextWithHint` | 140×20 **H** | `next-item-width` | `native-fixed` |  |
| `InputTextMultiline` | `InputTextMultiline` | 200×80 | `next-item-width` | `explicit-size` | A multiline text input. |
| `Combo` | `Combo` | 100×20 **H** | `next-item-width` | `native-fixed` | A drop-down list that displays the selected item. |
| `ListBox` | `ListBox` | 160×80 | `next-item-width` | `explicit-size` | A scrollable list with several visible rows. |
| `ColorEdit3` | `ColorEdit` · `RGB` | 160×20 **H** | `next-item-width` | `native-fixed` | A compact color editor with channel fields and a swatch. |
| `ColorEdit4` | `ColorEdit` · `RGBA` | 160×20 **H** | `next-item-width` | `native-fixed` | A compact color editor with channel fields and a swatch. |
| `ColorPicker3` | `ColorPicker` · `RGB` | 200×246 **D** | `next-item-width` | `explicit-size` | A full color picker with a saturation area and hue bar. |
| `ColorPicker4` | `ColorPicker` · `RGBA` | 200×246 **D** | `next-item-width` | `explicit-size` | A full color picker with a saturation area and hue bar. |
| `ColorButton` | `ColorButton` | 40×20 | `explicit-size` | `explicit-size` | A button displaying a single color swatch. |
| `Panel` | `Panel` | 220×140 | `explicit-size` | `explicit-size` | A bordered, scrollable region containing other widgets. |
| `Group` | `Group` | 200×120 | `explicit-size` | `explicit-size` | An invisible container that groups child widgets into one block. |
| `StyleRegion` | `StyleRegion` | 200×120 | `explicit-size` | `explicit-size` | An invisible region with style overrides for colors, rounding, alignment, and fonts. |
| `CollapsingHeader` | `CollapsingHeader` | 200×120 | `explicit-size` | `explicit-size` | A full-width header that collapses its contents. |
| `TreeNode` | `TreeNode` | 200×120 | `explicit-size` | `explicit-size` | An expandable node with indented children. |
| `TabBar` | `TabBar` | 280×180 | `explicit-size` | `explicit-size` | A tab strip that switches between content pages. |
| `TabItem` | `TabItem` | 280×156 | `explicit-size` | `explicit-size` |  |
| `Table` | `Table` | 320×200 | `explicit-size` | `explicit-size` | A grid of rows and columns containing other widgets. |
| `TableCell` | `TableCell` | 100×50 | `explicit-size` | `explicit-size` |  |

---

<a name="manual-appendix-b-inspector-matrix"></a>

## Appendix B · Inspector matrix

The table lists properties shown for a single selected widget. **name** is available for user-created objects; **parent** appears only when a parent exists. Internal property names are used where helpful: **tooltip** is labeled **hint**, **hint** is labeled **placeholder**, and **bullet** appears as **prefix bullet**. A visible field does not always affect export; see §8.

| Type | Inspector rows |
| --- | --- |
| `Button` | label / text, tooltip, bullet, position, size |
| `SmallButton` | label / text, tooltip, bullet, position, size |
| `ArrowButton` | direction, tooltip, bullet, position, size |
| `Checkbox` | label / text, tooltip, bullet, position, size |
| `RadioButtonEx` | label / text, tooltip, bullet, group, radio value, position, size |
| `Selectable` | label / text, tooltip, position, size |
| `Text` | label / text, position, size |
| `TextColored` | label / text, tooltip, bullet, alpha, position, size |
| `TextDisabled` | label / text, tooltip, bullet, position, size |
| `TextWrapped` | label / text, position, size |
| `BulletText` | label / text, position, size |
| `LabelText` | label / text, value, position, size |
| `TextLinkOpenURL` | label / text, url, tooltip, bullet, position, size |
| `SeparatorText` | label / text, position, size |
| `Separator` | position, size |
| `HelpMarker` | tooltip, bullet, position, size |
| `ProgressBar` | label / text, tooltip, bullet, overlay, indeterminate, position, size |
| `SliderInt` | variant, label / text, components, min, max, format, numeric flags, tooltip, bullet, position, size |
| `SliderDouble` | variant, label / text, components, min, max, format, numeric flags, tooltip, bullet, position, size |
| `SliderDoubleN` | label / text, array size, min, max, format, numeric flags, tooltip, bullet, position, size |
| `VSliderInt` | variant, label / text, min, max, format, numeric flags, tooltip, bullet, position, size |
| `VSliderDouble` | variant, label / text, min, max, format, numeric flags, tooltip, bullet, position, size |
| `SliderAngle` | label / text, tooltip, bullet, position, size |
| `DragInt` | variant, label / text, components, min, max, speed, format, numeric flags, tooltip, bullet, position, size |
| `DragDouble` | variant, label / text, components, min, max, speed, format, numeric flags, tooltip, bullet, position, size |
| `DragDoubleN` | label / text, array size, min, max, speed, format, numeric flags, tooltip, bullet, position, size |
| `DragIntRange2` | variant, label / text, min, max, speed, format min, format max, numeric flags, tooltip, bullet, position, size |
| `DragFloatRange2` | variant, label / text, min, max, speed, format min, format max, numeric flags, tooltip, bullet, position, size |
| `InputInt` | variant, label / text, components, step, step fast, tooltip, bullet, position, size |
| `InputDouble` | variant, label / text, components, step, step fast, format, tooltip, bullet, position, size |
| `InputDoubleN` | label / text, array size, tooltip, bullet, position, size |
| `InputText` | label / text, tooltip, bullet, input flags, EEL2 callback, position, size |
| `InputTextWithHint` | label / text, hint, tooltip, bullet, input flags, EEL2 callback, position, size |
| `InputTextMultiline` | label / text, tooltip, bullet, input flags, EEL2 callback, position, size |
| `Combo` | label / text, tooltip, bullet, position, size |
| `ListBox` | label / text, tooltip, bullet, position, size |
| `ColorEdit3` | variant, label / text, tooltip, bullet, color flags, position, size |
| `ColorEdit4` | variant, label / text, tooltip, bullet, alpha, color flags, position, size |
| `ColorPicker3` | variant, label / text, tooltip, bullet, color flags, position, size |
| `ColorPicker4` | variant, label / text, tooltip, bullet, alpha, color flags, position, size |
| `ColorButton` | tooltip, alpha, color flags, position, size |
| `Panel` | label / text, tooltip, bullet, border, h-scroll, position, size |
| `Group` | label / text, tooltip, bullet, position, size |
| `StyleRegion` | label / text, tooltip, bullet, text color, frame bg, button color, rounding, selectable align, font, position, size |
| `CollapsingHeader` | label / text, tooltip, bullet, position, size |
| `TreeNode` | label / text, tooltip, bullet, hdr color, position, size |
| `TabBar` | tabs, label / text, tooltip, bullet, position, size |
| `TabItem` | label / text, tooltip, bullet, position, size |
| `Table` | table grid, label / text, tooltip, bullet, position, size |
| `TableCell` | label / text, tooltip, bullet, position, size |

---

<a name="manual-appendix-c-generated-file-structure"></a>

## Appendix C · Generated file structure

The abbreviated example below shows the exporter’s structure with a custom white background. Ellipses and comments omit parts of the generated file; this is a reading aid, not a complete script. Use **Export → download .lua** to obtain a complete file for your layout.

```lua
-- ReaImGui layout  (700×520)

local ctx = reaper.ImGui_CreateContext('MyPlugin')
local W, H = 700, 520
local OUTER_H = H + math.floor(reaper.ImGui_GetFrameHeight(ctx) + 0.5)
local BG   = 0xFFFFFFFF

-- Positions
local BUTTON_2_X, BUTTON_2_Y, BUTTON_2_W = 20, 50, 100
local SLIDER_4_X, SLIDER_4_Y, SLIDER_4_W = 20, 150, 120
…

-- Widget state
local Checkbox_3_checked = false
local Slider_4_val = 0.0
local Combo_5_item = 0

local open = true

local function draw()
  reaper.ImGui_PushStyleVar(ctx, reaper.ImGui_StyleVar_WindowPadding(), 0, 0)
  reaper.ImGui_PushStyleVar(ctx, reaper.ImGui_StyleVar_ItemSpacing(),   0, 0)
  reaper.ImGui_PushStyleColor(ctx, reaper.ImGui_Col_WindowBg(), BG)
  reaper.ImGui_SetNextWindowSize(ctx, W, OUTER_H, reaper.ImGui_Cond_Always())
  local flags = reaper.ImGui_WindowFlags_NoResize()
               | reaper.ImGui_WindowFlags_NoScrollbar()
  local visible
  visible, open = reaper.ImGui_Begin(ctx, 'MyPlugin', open, flags)
  reaper.ImGui_PopStyleColor(ctx)
  reaper.ImGui_PopStyleVar(ctx, 2)
  if visible then
    local dl     = reaper.ImGui_GetWindowDrawList(ctx)
    local wx, wy = reaper.ImGui_GetWindowPos(ctx)
    local cx, cy = reaper.ImGui_GetCursorStartPos(ctx)
    local ox, oy = wx + cx, wy + cy
    reaper.ImGui_BeginChild(ctx, '##Canvas', W, H, 0)

    -- Button_2 [Button]
    reaper.ImGui_SetCursorScreenPos(ctx, ox + BUTTON_2_X, oy + BUTTON_2_Y)
    if reaper.ImGui_Button(ctx, "Play##Button_2", 100, 20) then
      -- TODO: Button_2 pressed
    end

    -- Slider_4 [SliderDouble] — label drawn through the draw list; widget uses a hidden ID
    reaper.ImGui_SetCursorScreenPos(ctx, ox + SLIDER_4_X, oy + SLIDER_4_Y)
    reaper.ImGui_SetNextItemWidth(ctx, SLIDER_4_W)
    do
      local _label = "Gain"
      if _label ~= "" then
        local _tw, _th = reaper.ImGui_CalcTextSize(ctx, _label)
        reaper.ImGui_DrawList_AddText(dl, ox+20, oy+148-_th, 0x000000FF, _label)
      end
      local _rv
      _rv, Slider_4_val = reaper.ImGui_SliderDouble(ctx, "##Slider_4", Slider_4_val, 0.0, 1.0)
    end

    -- Panel_6 [Panel] — child widgets inside the child window
    reaper.ImGui_SetCursorScreenPos(ctx, ox + PANEL_6_X, oy + PANEL_6_Y)
    reaper.ImGui_BeginChild(ctx, "Output##Panel_6", 220, 140, reaper.ImGui_ChildFlags_Borders(), 0)
      -- Button_7, Checkbox_8 …
    reaper.ImGui_EndChild(ctx)

    reaper.ImGui_EndChild(ctx)
    reaper.ImGui_End(ctx)
  end
end

local function loop()
  draw()
  if open then reaper.defer(loop) end
end
reaper.defer(loop)
```

Keep these three points in mind when editing the generated code.

- User-placed widgets receive absolute cursor positions; structural TabItem and TableCell elements are managed by their parents. Coordinates and sizes also occur as inline numbers, so editing only the top-of-file constants does not update the complete layout.
- Widgets with external labels are enclosed in a `do … end` block. The label is drawn through the draw list, and the widget uses a hidden ID such as `##Name`.
- Containers are nested in the same order as on the canvas, and each has a matching `End…` call. The outermost `EndChild` closes the canvas.

---

*ReaUI Builder — User Guide for Version 1.0.3. Based on the release source code and project documentation.*

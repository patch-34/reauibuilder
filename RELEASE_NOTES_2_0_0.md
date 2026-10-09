## ReaUI Builder 2.0.0

Resizable windows with stretch constraints, and Theme Studio. The full list of changes is in [CHANGELOG.md](https://github.com/patch-34/reauibuilder/blob/main/CHANGELOG.md).

### Highlights

- **Resizable window.** Turn it on in the Canvas tab, with an optional minimum and maximum size. The exported window opens at the design size the first time and reopens at the size the user left it.
- **Constraints.** Pin an object to the right or bottom edge, keep it centred, or stretch it (Left+Right, Top+Bottom) with a 3 × 3 preset grid and two rows in Properties. Everything inside a pinned container moves with it. Buttons, fields, panels, tab bars and other controls with a size Builder sets can stretch, and so can rectangle and text drawings. The canvas shows each object's constraints as dashed lines to its parent's edges, as Figma does.
- **Preview at any size.** In Preview, drag the frame's edge or corner to see the layout at another window size; double-click returns to the design size. Preflight reports the exact window sizes at which widgets would overlap, leave their container or get too small.
- **Theme Studio.** View › Theme Studio… opens a window for the colours of the exported interface. Choose one of fifty ready-made palettes (Collection, Dark or Light), or edit a theme with four base colours (Basic) or all fifteen (Full). A sample plugin window shows the result; Apply puts it into the project in one Undo step, Save and Save as… keep it in My themes, Export… writes a theme file.
- **Light first launch.** The editor opens in the light theme and a new project starts on the Light preset. The start dialog appears on the first launch only.
- **Editor comfort.** A hint for every setting (View › Show hints), text editing on the canvas (double-click a text, rectangle or circle), a multi-line label field, and a right sidebar with Canvas | Properties on top and Elements below.
- **Checks from an independent audit.** Save Project applies the field you are typing in. A Preflight finding opens its tabs and centres the object. Text inside a disabled StyleRegion dims with the widgets. A filled polygon that crosses itself is a Preflight error, and a polygon with a repeated corner is filled correctly.

### Compatibility

- The exported scripts need REAPER with **ReaImGui 0.10 or later**, as before.
- Projects without "Resizable window" export as in 1.6.0. The exceptions are text and lines inside a disabled StyleRegion and filled polygons with a repeated corner.
- A new project starts on the Light theme; existing projects keep theirs.
- A project saved with a resizable window or constraints opens in older builds as a fixed-window project, with the stretch removed.
- The user manual, in English and Russian, is updated for 2.0.0.

### Download

Download `ReaUI_Builder_2_0_0.html` below and open it in Chrome, Edge, Firefox or Safari, or use the [web version](https://patch-34.github.io/reauibuilder/).

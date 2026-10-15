## ReaUI Builder 2.2.0

A Knob widget, round buttons, and a cleaner canvas for dense layouts. The full list of changes is in [CHANGELOG.md](https://github.com/patch-34/reauibuilder/blob/main/CHANGELOG.md).

### Highlights

- **Knob.** A round dial in Sliders & Drags. In REAPER you drag it up and down (Shift for fine steps), use the mouse wheel, double-click to return to the default, or Ctrl+click to type a value; the value shows in a tooltip. Set min, max, default and a display format. The colours follow the theme, and the knob stays round in any box.
- **Round Button.** One option makes a Button fully round: a circle when it is square, a pill when it is wider.
- **Thin, steady outlines.** Editor outlines are 1 screen pixel at any zoom and opaque for every widget; the selected widget has a heavier frame.
- **Less clutter.** Names are drawn only where they fit, and the widget under the pointer shows its outline and name. Container labels hide while their children cover them, and a container's lock shows when you point at it, select it, or hold U.

### Compatibility

- The exported scripts need REAPER with **ReaImGui 0.10 or later**, as before.
- A 2.1.0 project exports byte for byte as before. Only a Knob or a round Button adds new lines.
- A project with a Knob needs 2.2.0 or later. The round option is ignored by older builds.
- The user manual, in English and Russian, is updated for 2.2.0.

### Download

Download `ReaUI_Builder_2_2_0.html` below and open it in Chrome, Edge, Firefox or Safari, or use the [web version](https://patch-34.github.io/reauibuilder/).

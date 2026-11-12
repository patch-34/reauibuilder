#!/usr/bin/env node
/* ============================================================================
 * export_gate.js (v13) — standing export-gate harness for ReaUI Builder
 * ----------------------------------------------------------------------------
 * Implements ADR-002 (claude/adr/002_gate_coverage.md). Canonical home:
 * tools/export-gate/export_gate.js — every other copy is a mirror (G1).
 * v3 (brief B02 stage 2.1) adds, after every v2 scene: the alpha scenes for ADR-004,
 * the G5 alpha-255 cross-scene check and the theme-library-separation check for
 * ADR-003 F7. No v2 scene content changed: v2 goldens stay byte-identical.
 * v4 (brief B03 stage 3.1) adds, fixture first for release 1.2.0 (ADR-002 G6): four
 * types appended to FROZEN_TYPES (TextLink, CheckboxFlags, PlotLines, PlotHistogram;
 * new slots at y >= 1000, no existing entry moved), the scenes wave-a and
 * wave-a.explicit-defaults after every v3 scene, and the G5 wave-a cross-scene check.
 * No v3 scene content changed: on a build that lacks the four types, all-types is
 * byte-identical to v3 (the new entries are skipped before any create or uid draw)
 * and only gains four `N/A` notes; every other v3 golden is byte-identical.
 * v5 (ADR-005 stage X1.0) adds, fixture first for release 1.3.0 (ADR-002 G6), the scene
 * text-metrics after every v4 scene. No v4 scene content changed: every v4 golden is
 * byte-identical under v5.
 * v6 (brief B05 stage 5.1) adds, fixture first for release 1.4.0 (ADR-002 G6): one type
 * appended to FROZEN_TYPES (InvisibleButton; a new slot at y >= 1000, no existing entry
 * moved), the scenes wave-b and wave-b.explicit-defaults after every v5 scene, and the
 * G5 wave-b cross-scene check. No v5 scene content changed: on a build that lacks
 * InvisibleButton, all-types is byte-identical to v5 (the new entry is skipped before
 * any create or uid draw) and only gains one `N/A` note; every other v5 golden is
 * byte-identical.
 * v7 (brief B06 stage 6.1) adds, fixture first for release 1.5.0 (ADR-002 G6, ADR-011):
 * the scenes tables-b and tables-b.explicit-defaults after every v6 scene, and the
 * G5 tables-b cross-scene check. No v6 scene content changed: every v6 golden is
 * byte-identical under v7. tables-b covers the two new Table properties (ADR-011 G2/G4)
 * — angledHeaders and scrollRows — on six explicitly named tables built through
 * H.create then mutated on the live shape, as wave-a/wave-b do; a bridge helper
 * H.resizeTable grows a table's row count the same way the inspector's row stepper
 * does (rowCount/rowHeights/columns kept in sync, ensureTableCells/syncTableCellBounds
 * re-run), since the harness builds tables outside the inspector UI.
 * v8 (brief B07 stage 7.1) adds, fixture first for release 1.6.0 (ADR-002 G6, ADR-007):
 * the scenes menus, menus.themed and menus.explicit-defaults after every v7 scene, and
 * the G5 menus cross-scene check. No v7 scene content changed: every v7 golden is
 * byte-identical under v8. A menu bar is project data, not a shape: the menus scenes
 * build a small widget set through H.create, then attach `menuBar` to the saved project
 * and round-trip it through Save -> reset -> Load (withMenuBar), so a build that does
 * not know the key still builds every scene (it simply exports no menu). The 1.5.0-dev.2
 * baseline drops an unknown `menuBar` key silently on Save, in genSeed() and in
 * genImGui(), so on the baseline every menus scene exports identically to one with no
 * menu bar at all.
 * v9 (brief B07 stage 7.3) adds, fixture first for release 1.6.0 (ADR-002 G6, ADR-007
 * M11): the scenes themes.slate-title, themes.slate-title.explicit-default and
 * menus.themed-title after every v8 scene, and the G5 title cross-scene check. No v8
 * scene content changed: every v8 golden is byte-identical under v9. `themedTitleBar`
 * is project data, not a shape, same as `menuBar`: withProjectKeys generalises
 * withMenuBar's pattern (Save -> add keys -> reset -> Load) to any project-level key,
 * so a build that does not know the key still builds every scene (it simply always
 * themes the title bar, since the 1.6.0-dev.1 baseline has no title-bar option and
 * colours the title unconditionally on a non-default theme).
 * v10 (brief B11 stage 11.1) adds one scene, `arcs`, after every v9 scene. It covers F04
 * (1.6.0-dev.10) after the fact (B10 review R1; ADR-002 G6 wanted it first): pie fills over
 * 180 degrees, sweeps that cross 0, negative and past-one-turn angles, a full-turn pie, a
 * stroke-less ring. Nothing else is added (no G5, no check). No v9 scene content changed:
 * every v9 golden is byte-identical under v10. On a pre-F04 build (1.6.0-dev.3) the arcs
 * scene shows the F04 lines as CHANGED, which is expected.
 * v11 (brief A01) adds, fixture first for the Adaptive UI layout work (ADR-002 G6, ADR-009
 * AD11), a fourth channel and ten scenes. CHANNEL `file`: every scene also stores
 * `H.saveText()` (the saved project, pretty-printed JSON) taken from the first build, compared
 * with normSeed (ids normalised) exactly like the seed. Before v11 no channel looked at the
 * saved file, so a build could write new keys and demo objects into every project and pass
 * every scene (A0_sketch_review.md §3). A rebuild whose file differs is NON-DETERMINISTIC
 * "(file)". SCENES `adaptive.*` (after `arcs`): per-shape pins `pinH` / `pinV` and the project
 * key `windowResize` are written into the SAVED project only (withAdaptive: Save -> edit the
 * JSON by shape name -> reset -> Load), never onto live shapes, so a build that does not know
 * them shows what its loader does with them. Body A is a 640x440 form (16 named shapes, a Panel
 * with a Group inside); `adaptive.base` has no pins, `adaptive.inert` has MOVE+STRETCH pins and
 * no `windowResize` key, `adaptive.move` / `.move.explicit-defaults` / `.limits` /
 * `.stretch` add the key, `adaptive.nested` (StyleRegion, TabBar, TreeNode, nested Panels,
 * Table, CollapsingHeader), `adaptive.primitives` (seven primitives + one widget) and
 * `adaptive.menus` (the v8 menu fixture, `maxW:1000`) cover the other containers, and
 * `adaptive.invalid` writes every value ADR-009 AD1/AD2/AD4 make the loader drop. CROSS-SCENE
 * CHECK `G5 adaptive`: adaptive.move (absent) vs adaptive.move.explicit-defaults, three parts:
 * (a) imgui, (b) seed after Save -> reset -> Load, (c) the file after Save -> reset -> Load.
 * It prints `N/A` (no exit change) on a build whose loader drops `windowResize` (support
 * probe). CHECK `adaptive inert`: adaptive.inert's genImGui() must equal adaptive.base's, in
 * separate instances, on every build, the baseline included (seed and file are not compared:
 * the pins are in them by design). A G5 adaptive FAIL or an adaptive inert FAIL follows the
 * v3 rule: the build under test sets exit 3, the BEFORE build prints it as pre-existing.
 * No v10 scene content changed: every v10 golden (.imgui, .seed) is byte-identical under v11.
 * v12 (brief A07.1), fixture first for the 2.1.0 tables work (ADR-002 G6, ADR-009 AD4/AD5/AD6/AD8,
 * ADR-011 G1/G3/G4), adds three scenes after every v11 scene and one bridge helper. SCENES
 * `tables-c.stretch` (640x480, `windowResize {minW:480, minH:320}`; three tables tc_list / tc_hdr /
 * tc_plain, cell children inside tc_list, pins written through withAdaptive), `tables-c.style` (a
 * fixed window; the new Table properties `cellPadding`, `rowBg`, `highlightColor` +
 * `highlightRows`, `rowsFill` and the StyleRegion property `styleFramePadding`, set on the live
 * shapes as tables-b does) and `tables-c.explicit-defaults` (the same body with every new property
 * written as its default). BRIDGE `H.cellChild(tableName, r, c, type, x, y, ov)` creates a widget
 * inside a Table cell at a cell-relative point; `H.cellChildNote()` returns `NOT NESTED ...` when
 * the new widget did not land in that cell. `H.resizeTable(t, rows, cols)` also grows columns now.
 * CROSS-SCENE CHECK `G5 tables-c`: the tables-c.style body built with the new properties absent vs
 * tables-c.explicit-defaults, three parts as G5 adaptive: (a) imgui, (b) seed and (c) file after
 * Save -> reset -> Load. On a build that keeps unknown shape keys (2.0.0) part (a) passes for the
 * wrong reason and (b) / (c) may FAIL, as G5 tables-b did on its baseline; the harness does not
 * hide that. No v11 scene content changed: every v11 golden (.imgui, .seed, .file) is
 * byte-identical under v12.
 * v13 (2026-11-13, QA): fix the historical tables-b fixture's out-of-order
 * TableCell layout update. It now calls H.resizeTable after angledHeaders/scrollRows
 * edits and before creating its nested Button, matching the inspector's reflow.
 * No other scene, generator, gate assertion, or exported builder code is modified.
 * v12 is preserved unchanged for the audit trail.
 *
 * Loads a single-file ReaUI Builder .html headlessly (jsdom), injects a bridge at
 * the end of the main <script> (same technique as v1: no tool edits), and builds a
 * set of SCENES through the tool's own functions. Each scene is exported through
 * genImGui() and genSeed() and diffed on its own (G2). Every scene is loaded in a
 * fresh jsdom instance, so one scene can never leak state into the next; reset()
 * still pins every project-level variable, so no scene depends on init defaults (G4).
 *
 * SCENES
 *   core        v1's fixture, verbatim (same calls, coordinates, order). Its output
 *               is byte-identical to a v1 golden of the same build.
 *   all-types   one instance of every type in FROZEN_TYPES (every creatable
 *               WIDGET_CONTRACTS key except the structural TabItem/TableCell), default
 *               properties, fixed grid slots; plus one of each draw primitive, created
 *               through the editor's own release path (finalizeCanvasRelease/finishPoly).
 *               A type the build does not know prints `N/A (build lacks <T>)`.
 *   themes.*    a compact scene exported under slate, light and a custom 15-channel
 *               theme registered through adoptProjectTheme.
 *   project     non-default canvas, custom background with alpha < 1, quoted title.
 *   examples.*  frozen copies of the five examples/*.json, loaded through
 *               applyLoadedProject. Files: <this dir>/fixtures/examples/.
 *   guards      creation-path guards (things creation must refuse if the loader does).
 *   themes.gate-alpha          (v3) the themes.* body under GATE_CUSTOM_THEME's colours,
 *               id `gate-alpha`, with an `alpha` map on all 12 ADR-004 A2 channels
 *               (12 distinct values, none 0, none 255). A build without theme alpha
 *               ignores the map, so there it equals themes.gate-custom except for the
 *               `-- Theme:` comment line.
 *   themes.gate-alpha-opaque   (v3) GATE_CUSTOM_THEME itself (id `gate-custom`) plus an
 *               `alpha` map of twelve 255s.
 *   wave-a      (v4) the 1.2.0 widget wave on the pinned default-theme canvas. Built
 *               through H.create, then properties set on the returned live shape (as
 *               core does with pb.overlay), so a build that does not know a property
 *               still builds the scene. Every widget has an explicit name, and the
 *               existing-type part is created before the new types, so a new type
 *               cannot rename or re-number (seed ids) anything else. Content:
 *               three TreeNodes, each with a child TreeNode and a child Button,
 *               `treeLines` absent / 'full' / 'toNodes'; two Selectables, `highlight`
 *               absent / true; SliderInt, DragInt, InputInt with `componentCount`
 *               2 / 3 / 4 and SliderDouble with 3 (the shipped Int N-variants);
 *               then, new types: three CheckboxFlags (group 'opts' bits 0 and 3,
 *               group 'mode' bit 0), a PlotLines (`plotValues` [0,0.5,1,0.25,0.75],
 *               overlay 'lvl', scaleMin 0, scaleMax 1), a PlotHistogram at defaults,
 *               one TextLink. A type the build lacks prints `N/A (build lacks <T>)`.
 *   wave-a.explicit-defaults   (v4) the TreeNode and Selectable part of wave-a with
 *               every new property set explicitly to its default: `treeLines:'none'`
 *               on all six TreeNodes (parents and children), `highlight:false` on
 *               both Selectables.
 *   text-metrics (v5) wrapped text for ADR-005: rect, circle and Text primitives created
 *               through the editor's own release path (H.primitive), then label,
 *               textSize, align / vAlign and fill set on the live shape. Every shape has
 *               an explicit name. Cases: short text, a sentence at every align, explicit
 *               newlines (incl. an empty line), runs of blanks, a word longer than the
 *               box, punctuation break points without spaces, Cyrillic, a box too short
 *               for its text (the ellipsis case), sizes 10 / 12 / 14 / 20, a circle and an
 *               ellipse, and Text boxes at every vAlign including one whose text is taller
 *               than the box (drawn below it, ADR-005 T4).
 *   wave-b      (v6) the 1.4.0 widget wave on a 1100x600 default-theme canvas. Built
 *               through H.create, then properties set on the returned live shape (as
 *               core does with pb.overlay and wave-a does with tree.treeLines), so a
 *               build that does not know a property still builds the scene. Every widget
 *               has an explicit name; the existing-type part is created first, the new
 *               type last. Content: three
 *               TabBars, each with its two auto-created TabItems, `tabButton` absent /
 *               'leading' / 'trailing' with `tabButtonLabel` 'Add'; two StyleRegions,
 *               each holding one Button and one SliderInt, `disabled` absent / true (the
 *               second also with `styleText` set, to cover the push order); three Tables
 *               with `headersRow` true: `freezeHeader` absent with `tableFlags.ScrollY`
 *               true, `freezeHeader` true with ScrollY true, `freezeHeader` true with
 *               ScrollY false (must emit no freeze); then one InvisibleButton (120x40,
 *               at 500,220). A type the build lacks prints
 *               `N/A (build lacks <T>)`.
 *   wave-b.explicit-defaults   (v6) the TabBar, StyleRegion and Table part of wave-b with
 *               every new property set explicitly to its default: `tabButton:'none'` on
 *               all three TabBars, `disabled:false` on both StyleRegions,
 *               `freezeHeader:false` on all three Tables.
 *   tables-b    (v7) six explicitly named Tables (3 columns each) for ADR-011 G2/G4, on
 *               a widened default-theme canvas (H.set, as wave-b does). Built through
 *               H.create, then properties set on the returned live shape; a table needing
 *               more than the default 3 rows is grown with H.resizeTable (mirrors the
 *               inspector's row stepper: rowCount/rowHeights/columns kept in sync,
 *               ensureTableCells/syncTableCellBounds re-run), so a build that does not
 *               know angledHeaders/scrollRows still builds the same shapes. Column labels
 *               are of clearly different widths ('Gain','Pan','Output routing') on the
 *               angled tables, so a wrong maxW would show. Content:
 *                 tb_angled_scroll     ScrollY on,  6 rows, angledHeaders:[0,2], one
 *                                      Button nested in cell r0c0 (checked with
 *                                      waveNested, as wave's container children are);
 *                 tb_angled_all        ScrollY off, 4 rows, angledHeaders:[0,1,2];
 *                 tb_scroll_plain      ScrollY on,  4 rows, no new property (G3 (b));
 *                 tb_scrollrows        ScrollY on,  4 rows, scrollRows:20,
 *                                      freezeHeader:true;
 *                 tb_scrollrows_noscroll ScrollY off, 4 rows, scrollRows:20 (must emit
 *                                      no loop);
 *                 tb_angled_noheader   headersRow false, angledHeaders:[1] (must emit no
 *                                      angled row).
 *               A type/property the build lacks is silently absent from its export; the
 *               scene itself never prints N/A (Table has shipped since 1.0).
 *   tables-b.explicit-defaults (v7) the same six tables, with angledHeaders and
 *               scrollRows both set explicitly to their defaults ([] and 0) instead of
 *               left absent.
 *   menus       (v8) a menu bar loaded as project data (not a shape) alongside three
 *               named widgets (mn_origin at 0,0, mn_check, mn_slider), on the default
 *               theme. MENUS_WITH_INVALID: every ADR-007 entry kind (menu, item,
 *               separator, check, disabled entries, a shortcut, nesting to depth 4)
 *               plus every load-time reject/repair case the 1.6.0 loader must apply —
 *               a stray top-level item, an unknown entry type, an empty label, a name
 *               clashing with a widget, a name clashing with an earlier entry, a label
 *               cut at `##`, and a menu nested one level past the depth limit.
 *   menus.themed (v8) the same MENUS_WITH_INVALID bar under the `slate` theme.
 *   menus.explicit-defaults (v8) the same widgets and MENUS_FIXTURE (the valid entries
 *               only, no invalid cases), with every default (`enabled:true`,
 *               `shortcut:''`, `checked:false`) written out explicitly instead of left
 *               absent.
 *   themes.slate-title (v9) the compact themes.* body (buildThemeBody) under `slate`,
 *               with `themedTitleBar:true` added to the saved project and loaded back
 *               through withProjectKeys (ADR-007 M11). `--scene themes` selects it with
 *               every other themes.* scene.
 *   themes.slate-title.explicit-default (v9) the same body under `slate`, with
 *               `themedTitleBar:false` added instead — the explicit-default reference
 *               for G5 title.
 *   menus.themed-title (v9) the menus widgets (buildMenusWidgets) under `slate`, with
 *               both `menuBar: MENUS_FIXTURE` and `themedTitleBar:true` added to the
 *               saved project in one withProjectKeys call. `--scene menus` selects it
 *               with the other menus.* scenes.
 *   arcs        (v10) fifteen Arc primitives for F04 (1.6.0-dev.10), added after the fact
 *               (B10 review R1), on an 800x560 default-theme canvas. Each arc is drawn through
 *               H.primitive('arc', ...) (the editor's own release path); then `name` and the
 *               arc properties are set on the live shape with Object.assign, as text-metrics
 *               does. Every shape has an explicit name; no labels. ARCS_SHAPES is a frozen
 *               3x5 table (column x 20 + col*155, row y 20 / 180 / 340, boxes 120x120 unless
 *               stated): pies 0-90, 0-180, 0-270, 300-60 (crosses 0), 0-360 (full turn), 45-45
 *               (empty), 0 to -90, 720-810; 0-270 pies with strokeNone / fillNone / opacity 128
 *               and thickness 6; rings 0 to -90, 0-360 and 0-270 with strokeNone; one pie
 *               30-250 in a 140x80 box. A refused primitive is noted `BLOCKED primitive arc`.
 *               `--scene arcs` selects it. No G5 and no check belong to it.
 *
 * CROSS-SCENE CHECK
 *   G5 alpha-255  themes.gate-alpha-opaque's imgui must equal themes.gate-custom's byte
 *               for byte in the same build (ADR-002 G5, ADR-004 A1/A4: alpha 255 is
 *               invisible). Printed `G5 alpha-255 IDENTICAL` / `MISMATCH` + multiset.
 *               Runs whenever themes.gate-alpha-opaque is selected (themes.gate-custom
 *               is generated for it if not selected).
 *   G5 wave-a   (v4) the wave-a TreeNode+Selectable part built twice in fresh
 *               instances — properties absent, and set explicitly to their defaults
 *               (= wave-a.explicit-defaults). PASS when (a) the two genImGui() outputs
 *               are identical, and (b) the two genSeed() outputs (ids normalised) are
 *               identical after one Save -> reset -> Load cycle (saveText/loadText:
 *               serializeProjectCore() -> JSON -> applyLoadedProject()). Printed
 *               `G5 wave-a PASS` / `FAIL`, per part, + multiset. Runs whenever
 *               wave-a.explicit-defaults is selected. A build that keeps unknown
 *               properties through load (1.1.0) fails (b) by design: the loader, not
 *               the emitter, is what drops `treeLines:'none'` / `highlight:false`.
 *   G5 wave-b   (v6) the wave-b TabBar+StyleRegion+Table part built twice in fresh
 *               instances — properties absent, and set explicitly to their defaults
 *               (= wave-b.explicit-defaults). PASS when (a) the two genImGui() outputs
 *               are identical, and (b) the two genSeed() outputs (ids normalised) are
 *               identical after one Save -> reset -> Load cycle. Printed
 *               `G5 wave-b PASS` / `FAIL`, per part, + multiset. Runs whenever
 *               wave-b.explicit-defaults is selected. A build that keeps unknown
 *               properties through load (the 1.3.0 baseline) fails (b) by design: the
 *               loader, not the emitter, is what drops `tabButton:'none'` /
 *               `disabled:false` / `freezeHeader:false`.
 *   G5 tables-b (v7) all six tables-b tables built twice in fresh instances — the new
 *               properties (angledHeaders, scrollRows) absent, and set explicitly to
 *               their defaults ([] and 0) (= tables-b.explicit-defaults). PASS when
 *               (a) the two genImGui() outputs are identical, and (b) the two genSeed()
 *               outputs (ids normalised) are identical after one Save -> reset -> Load
 *               cycle. Printed `G5 tables-b PASS` / `FAIL`, per part, + multiset. Runs
 *               whenever tables-b.explicit-defaults is selected. On the 1.4.0 baseline
 *               part (b) is expected to FAIL: the loader keeps unknown properties, so a
 *               table saved with `angledHeaders:[]` round-trips with that literal empty
 *               array present while the "absent" table round-trips with the key missing
 *               — genSeed() differs even though genImGui() (which only reads the live
 *               shape, not the reloaded one) is identical. Note: on the baseline
 *               tb_scroll_plain's own export already differs from what 6.2 will produce
 *               (G3 — ScrollY + header rows move to the runtime path in 6.2); that is a
 *               6.2 concern, not a G5 matter — the absent-vs-default PAIR stays
 *               identical to each other within one build, on the baseline and later.
 *   G5 menus    (v8) three parts, each built in fresh instances: (a) MENUS_FIXTURE vs
 *               menusExplicitDefaults(MENUS_FIXTURE) — the two genImGui() outputs must
 *               be identical; (b) the same pair's genSeed() (ids normalised) must be
 *               identical after one Save -> reset -> Load cycle; (c) an empty `menuBar`
 *               array vs no `menuBar` key at all — both genImGui() and the post-cycle
 *               genSeed() must be identical. PASS when all three hold. Printed
 *               `G5 menus PASS` / `FAIL`, per part, + multiset. Runs whenever
 *               menus.explicit-defaults is selected. On the 1.5.0-dev.2 baseline the
 *               loader drops the unknown `menuBar` key outright, so all three parts
 *               trivially hold (every side exports no menu) — PASS is expected there,
 *               unlike G5 tables-b's baseline part (b).
 *   G5 title    (v9) the slate themed body (buildThemeBody) built twice in fresh
 *               instances via withProjectKeys — `themedTitleBar` absent vs
 *               `themedTitleBar:false` explicit (= themes.slate-title.explicit-default's
 *               own key set). PASS when (a) the two genImGui() outputs are identical,
 *               and (b) the two genSeed() outputs (ids normalised) are identical after
 *               one Save -> reset -> Load cycle. Printed `G5 title PASS` / `FAIL`, per
 *               part, + multiset. Runs whenever themes.slate-title.explicit-default is
 *               selected. On the 1.6.0-dev.1 baseline the loader does not know
 *               `themedTitleBar` and always themes the title bar on a non-default
 *               theme, so both sides export identically — PASS is expected there, same
 *               shape as G5 menus' baseline PASS.
 *
 * CHECKS (verdict lines like `defaults`, not export scenes; no .imgui/.seed)
 *   theme-library-separation   (ADR-003 F7) fresh instance: register library theme
 *               `lib-x` (colours A, persist=true); load, through the Save/Load path, a
 *               project whose themeDef is `lib-x` with colours B and whose themeId is
 *               `lib-x`; register library theme `lib-y` (persist=true, which runs
 *               saveCustomThemes); read THEME_STORAGE_KEY back from localStorage.
 *               PASS when the stored `lib-x` still has colours A and the loaded project
 *               still exports colours B (all 13 theme pushes that map one-to-one to an
 *               authored channel). The store's content is printed and, in capture
 *               mode, written to golden/<stem>/theme-library-separation.txt.
 *               Runs when no --scene is given, or when named with --scene.
 *
 * CHANNELS per scene
 *   imgui       genImGui() — before vs after, multiset line diff (G7).
 *   seed        genSeed() with random ids normalised — before vs after, multiset.
 *   roundtrip   genImGui() must survive Save -> fresh reset -> applyLoadedProject in
 *               the SAME build (G3). Judged on the build under test (see EXIT CODES).
 *   determinism each scene is built twice (fresh reset) and generated twice; any
 *               difference is NON-DETERMINISTIC.
 * Plus one `defaults` verdict: a fresh init with NO reset — cw ch themeId bgMode
 * projectTitle — so a changed default is a product decision, not noise (G4).
 *
 * USAGE
 *   Capture goldens (writes golden/<build-stem>/<scene>.{imgui,seed} + defaults.txt):
 *     node export_gate.js ReaUI_Builder.html
 *   Gate a patch (before vs after):
 *     node export_gate.js ReaUI_Builder.html ReaUI_Builder_1_0_72.html
 *   Options:
 *     --scene <name>   run one scene (e.g. `text-metrics`), or one group (`themes`,
 *                      `examples`, `wave-a`, `wave-b`, `tables-b`, `menus`), or
 *                      the check `theme-library-separation`; repeatable. `themes` selects
 *                      every themes.* scene, the v3 alpha scenes included and the v9
 *                      themes.slate-title* scenes; `wave-a` selects wave-a and
 *                      wave-a.explicit-defaults (and so G5 wave-a); `tables-b` selects
 *                      tables-b and tables-b.explicit-defaults (and so G5 tables-b);
 *                      `menus` selects menus, menus.themed, menus.explicit-defaults and
 *                      the v9 menus.themed-title scene (and so G5 menus).
 *                      `arcs` selects the one v10 arcs scene (F04 coverage).
 *                      `adaptive` selects every adaptive.* scene (v11; with G5 adaptive and adaptive inert).
 *                      `tables-c` selects the three tables-c.* scenes (v12; with G5 tables-c).
 *     --full           print every diff line (default: first 80 per direction)
 *     --list           print the scene names, then the check names, then the cross-scene
 *                      checks (as `# ` comment lines: not selectable, they run with
 *                      their scene), and exit
 *
 * EXIT CODES
 *   0  clean: every scene IDENTICAL on both channels, defaults identical
 *   1  changed: some scene / channel / defaults differs — read the multiset
 *   2  usage or configuration error (bad args, fixtures folder missing)
 *   3  round-trip mismatch, a throw, or non-determinism. Round-trip is judged on the
 *      build under test: the captured build in capture mode, the AFTER build in compare
 *      mode. A round-trip failure of the BEFORE build is printed as pre-existing and
 *      does not set 3 (that is how a fix shows up: before FAIL, after PASS).
 *      Throws and non-determinism on EITHER side set 3.
 *      v3: G5 alpha-255 MISMATCH and theme-library-separation FAIL follow the same
 *      rule — the build under test sets 3, the BEFORE build prints as pre-existing.
 *      On 1.0.72 theme-library-separation FAILs (the F7 bug), so a v3 capture of
 *      1.0.72 exits 3 for that reason alone; the goldens are still written.
 *      v4: G5 wave-a FAIL follows the same rule. On 1.1.0 part (b) fails (the loader
 *      keeps `treeLines:'none'` / `highlight:false`), so a v4 capture of 1.1.0, and a
 *      1.1.0 -> 1.1.0 compare, exit 3 for that reason alone; goldens are still written.
 *      v6: G5 wave-b FAIL follows the same rule. On the 1.3.0 baseline part (b) is
 *      expected to fail (the loader keeps `tabButton:'none'` / `disabled:false` /
 *      `freezeHeader:false`), so a v6 capture of the baseline, and a baseline -> baseline
 *      compare, exit 3 for that reason alone; goldens are still written.
 *      v7: G5 tables-b FAIL follows the same rule. On the 1.4.0 baseline part (b) is
 *      expected to fail (the loader keeps `angledHeaders:[]` / `scrollRows:0`), so a v7
 *      capture of the baseline, and a baseline -> baseline compare, exit 3 for that
 *      reason alone; goldens are still written.
 *      v8: G5 menus FAIL follows the same rule. On the 1.5.0-dev.2 baseline every part
 *      is expected to PASS instead (the loader drops the unknown `menuBar` key outright,
 *      so every side exports no menu) — see CROSS-SCENE CHECK above.
 *      v9: G5 title FAIL follows the same rule. On the 1.6.0-dev.1 baseline both parts
 *      are expected to PASS instead (the loader does not know `themedTitleBar` and
 *      always themes the title bar on a non-default theme, so both sides export
 *      identically) — see CROSS-SCENE CHECK above.
 *
 * REQUIREMENT:  npm install jsdom        (one-time, next to this file or above it)
 * ============================================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// ---- deterministic 2d-context stub (measureText stable for SmallButton width) ----
// Unchanged from v1: 7 px per character. Keeps the gate deterministic; says nothing
// about real font metrics (ADR-002 consequences).
function makeCtx2d(){
  const noop=()=>{}; const ctx={};
  ['save','restore','clearRect','fillRect','strokeRect','beginPath','closePath','moveTo',
   'lineTo','arc','arcTo','ellipse','rect','stroke','fill','setLineDash','getLineDash','scale',
   'translate','rotate','setTransform','resetTransform','clip','fillText','strokeText','drawImage',
   'quadraticCurveTo','bezierCurveTo','putImageData','transform'].forEach(m=>ctx[m]=noop);
  ctx.measureText = s => ({ width: ((s==null?'':String(s)).length)*7 });
  ctx.createLinearGradient = () => ({ addColorStop: noop });
  ctx.createRadialGradient = () => ({ addColorStop: noop });
  ctx.getImageData = () => ({ data: new Uint8ClampedArray(4) });
  // v2: the loader path renders (applyLoadedProject -> render), which reaches canvas
  // APIs the creation-only v1 fixture never touched. No-ops; hit tests answer false.
  ['roundRect'].forEach(m=>ctx[m]=noop);
  ctx.isPointInPath = () => false; ctx.isPointInStroke = () => false;
  ['font','fillStyle','strokeStyle','lineWidth','textAlign','textBaseline','globalAlpha',
   'lineCap','lineJoin','lineDashOffset','shadowBlur','shadowColor','miterLimit'].forEach(p=>ctx[p]='');
  return ctx;
}
// jsdom has no Path2D; primitive painting builds one per shape.
function mulberry32(a){
  return function(){
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
class Path2DStub {
  constructor(){}
  addPath(){} closePath(){} moveTo(){} lineTo(){} bezierCurveTo(){} quadraticCurveTo(){}
  arc(){} arcTo(){} ellipse(){} rect(){} roundRect(){}
}

// ---- bridge ------------------------------------------------------------------
// Appended to the tool's main <script> so its closures see the tool's lexical state.
// Every project-level variable reset() pins is listed in PINNED; a name the build does
// not declare is reported (a silent miss would reopen the G4 hole).
const BRIDGE = `
;window.__H = (function(){
  var PINNED = ['shapes','selection','cnt','cw','ch','themeId','bgMode','bgColor','bgAlpha',
    'savedCustomBg','projectTitle','activeTab','auditGridMode','snapEnabled','gridStep',
    'customThemes','tool','drawing','action','polyPts','pendingWidget','pendingWidgetConfig',
    'containerCaptureUnlockedOnce','containerUnlockHeld'];
  var pinProblems = [];
  function declared(n){ try{ return eval('typeof '+n)!=='undefined'; }catch(e){ return false; } }
  function pin(label, fn){ try{ fn(); }catch(e){ pinProblems.push(label+': '+(e&&e.message||e)); } }
  function reset(){
    pinProblems = PINNED.filter(function(n){ return !declared(n); }).map(function(n){ return n+': not declared'; });
    pin('shapes',        function(){ shapes.length=0; });
    pin('selection',     function(){ selection={ids:[],primaryId:null,scope:'groups'}; });
    pin('cnt',           function(){ cnt={rect:0,circle:0,poly:0,line:0,text:0,triangle:0,arc:0,widget:0}; });
    pin('cw/ch',         function(){ cw=900; ch=700; });
    // Background: the values every new project had before 1.0.71 (STARTUP_SEED and
    // newProject(): '#ffffff', 1.0, 'default'). Theme: 'default' — init would otherwise
    // pick 'light' when the editor skin is light.
    pin('themeId',       function(){ themeId='default'; });
    pin('bg',            function(){ bgMode='default'; bgColor='#ffffff'; bgAlpha=1; });
    pin('savedCustomBg', function(){ savedCustomBg.color='#ffffff'; savedCustomBg.alpha=1; });
    pin('projectTitle',  function(){ projectTitle='MyPlugin'; });
    pin('activeTab',     function(){ activeTab='imgui'; });
    pin('auditGridMode', function(){ auditGridMode=false; });
    pin('snap',          function(){ snapEnabled=true; gridStep=10; });
    // A theme registered by an earlier scene/load must not survive: the round-trip has
    // to prove the project file carries its own theme (themeDef).
    pin('customThemes',  function(){ Object.keys(customThemes).forEach(function(k){ delete customThemes[k]; }); });
    // Editor interaction state read by the creation paths.
    pin('editor',        function(){ tool='select'; drawing=null; action=null; polyPts=[]; polyMousePt=null;
      pendingWidget=null; pendingWidgetConfig=null; containerCaptureUnlockedOnce.clear(); containerUnlockHeld=false; });
  }
  // Records flashInfobarHint text while fn runs (creation refusals report through it).
  var lastHints = [];
  function withHints(fn){
    var orig = flashInfobarHint; lastHints = [];
    flashInfobarHint = function(t){ lastHints.push(String(t)); return orig.apply(this, arguments); };
    try{ return fn(); } finally { flashInfobarHint = orig; }
  }
  var SETTABLE = { themeId:1, bgMode:1, bgColor:1, bgAlpha:1, projectTitle:1, cw:1, ch:1 };
  function set(k, v){
    if(!SETTABLE[k]) throw new Error('bridge: '+k+' is not settable');
    if(!declared(k)) throw new Error('bridge: build does not declare '+k);
    switch(k){
      case 'themeId': themeId=v; break;       case 'bgMode': bgMode=v; break;
      case 'bgColor': bgColor=v; break;       case 'bgAlpha': bgAlpha=v; break;
      case 'projectTitle': projectTitle=v; break;
      case 'cw': cw=v; break;                 case 'ch': ch=v; break;
    }
  }
  // Draw primitives through the editor's own creation path: the canvas release handler
  // for rect/circle/line/text/triangle/arc, finishPoly for poly. There is no standalone
  // primitive factory in the tool; these are the only places primitives are made.
  function primitive(kind, x1, y1, x2, y2){
    var before = shapes.length;
    if(kind==='poly'){
      polyPts = [{x:x1,y:y2},{x:x2,y:y2},{x:Math.round((x1+x2)/2),y:y1}];
      finishPoly();
    } else {
      action = null; tool = kind;
      drawing = {sx:x1, sy:y1, cx:x2, cy:y2, screenX:0, screenY:0, maxScreenDistance:100};
      finalizeCanvasRelease();
    }
    tool = 'select'; drawing = null;
    return shapes.length>before ? shapes[shapes.length-1] : null;
  }
  // Loader. applyLoadedProject returns false on rejection and reports the reason only
  // through uiAlert(message, title); capture it instead of opening a dialog.
  function loadText(text){
    var origAlert = uiAlert, msgs = [];
    uiAlert = function(m){ msgs.push(String(m)); };
    try{
      var r = applyLoadedProject(JSON.parse(text));
      return { ok: r!==false, reason: msgs.join(' | ') };
    } finally { uiAlert = origAlert; }
  }
  // v7 — grow a Table's row count outside the inspector UI. Mirrors the row-stepper's
  // commit (commitTableCounts, graph ~4909-4924) for the fields the harness needs:
  // rowCount, rowHeights padded with 0 (flexible), then the same two calls the stepper
  // makes to create the new cells and re-flow every cell's geometry. columnCount /
  // columns are left alone — every tables-b table keeps its 3 authored columns.
  function resizeTable(t, rowCount, colCount){
    if(!t || t.widgetType!=='Table') throw new Error('bridge: resizeTable on a non-Table');
    var n = Math.max(1, Math.floor(rowCount)||1);
    t.rowCount = n;
    if(!Array.isArray(t.rowHeights)) t.rowHeights = [];
    while(t.rowHeights.length < n) t.rowHeights.push(0);
    t.rowHeights.length = n;
    // v12 — optional third argument: grow / shrink the columns the way the column stepper
    // does (columnCount, columns[] labels, columnConfig[] padded with null).
    if(colCount !== undefined){
      var nc = Math.max(1, Math.floor(colCount)||1);
      t.columnCount = nc;
      if(!Array.isArray(t.columns)) t.columns = [];
      while(t.columns.length < nc) t.columns.push('Column '+(t.columns.length+1));
      t.columns.length = nc;
      if(!Array.isArray(t.columnConfig)) t.columnConfig = [];
      while(t.columnConfig.length < nc) t.columnConfig.push(null);
      t.columnConfig.length = nc;
    }
    ensureTableCells(t);
    syncTableCellBounds(t);
    return t;
  }
  // v12 — create a widget inside a Table cell at a cell-relative point (brief A07.1):
  // absolute = absX(cell) + x, absY(cell) + y. The problem, if any, is read with cellChildNote().
  var cellChildNoteText = '';
  function cellChild(tableName, r, c, type, x, y, ov){
    cellChildNoteText = '';
    var t = shapes.find(function(s){ return s.widgetType==='Table' && s.name===tableName; });
    if(!t){ cellChildNoteText = 'NO TABLE '+tableName; return null; }
    var cell = getTableCell(t, r, c);
    if(!cell){ cellChildNoteText = 'NO CELL r'+r+'c'+c+' on '+tableName; return null; }
    var s = withHints(function(){ return createWidgetAtPoint(type, getAbsoluteX(cell)+x, getAbsoluteY(cell)+y, ov); });
    if(s && s.parentId!==cell.id)
      cellChildNoteText = 'NOT NESTED '+(s.name||type)+' (parentId '+JSON.stringify(s.parentId)+', expected cell r'+r+'c'+c+' of '+tableName+')';
    return s;
  }
  return {
    reset: reset,
    pinProblems: function(){ return pinProblems.slice(); },
    shapes: function(){ return shapes; },
    create: function(t,x,y,ov){ return withHints(function(){ return createWidgetAtPoint(t,x,y,ov); }); },
    hints: function(){ return lastHints.slice(); },
    primitive: primitive,
    hasType: function(t){ return Object.prototype.hasOwnProperty.call(WIDGET_CONTRACTS, t); },
    contractKeys: function(){ return Object.keys(WIDGET_CONTRACTS); },
    set: set,
    get: function(k){ return declared(k) ? eval(k) : undefined; },
    adoptProjectTheme: function(def){ return adoptProjectTheme(def); },
    serializeProjectCore: function(){ return serializeProjectCore(); },
    applyLoadedProject: function(p,o){ return applyLoadedProject(p,o); },
    // The Save path writes JSON.stringify(serializeProjectCore(), null, 2).
    saveText: function(){ return JSON.stringify(serializeProjectCore(), null, 2); },
    loadText: loadText,
    defaults: function(){ return { cw:cw, ch:ch, themeId:themeId, bgMode:bgMode, projectTitle:projectTitle }; },
    cellsOf: function(id){ return getCellsOfTable(id); },
    cellAt: function(id,r,c){ return getTableCell({id:id}, r, c); },
    absX: function(s){ return getAbsoluteX(s); }, absY: function(s){ return getAbsoluteY(s); },
    genImGui: function(){ return genImGui(); }, genSeed: function(){ return genSeed(); },
    // v3 — theme library access for the theme-library-separation check (ADR-003 F7).
    // registerCustomTheme is the one door into customThemes; persist=true is what makes
    // it call saveCustomThemes. The store is read back raw, exactly as it was written.
    registerTheme: function(def, persist){ var t = registerCustomTheme(def, persist); return t ? t.id : null; },
    themeStoreRead: function(){ return localStorage.getItem(THEME_STORAGE_KEY); },
    themeStoreClear: function(){ localStorage.removeItem(THEME_STORAGE_KEY); },
    // v7 — table row growth outside the inspector UI (see resizeTable above).
    resizeTable: resizeTable,
    // v12 — widget inside a Table cell (see cellChild above).
    cellChild: cellChild,
    cellChildNote: function(){ return cellChildNoteText; }
  };
})();`;

class HarnessError extends Error {}

function loadTool(htmlPath){
  let html = fs.readFileSync(htmlPath,'utf8');
  const lc = html.lastIndexOf('</script>');
  if(lc<0) throw new HarnessError('no </script> in '+htmlPath);
  html = html.slice(0,lc) + BRIDGE + html.slice(lc);
  const dom = new JSDOM(html,{ runScripts:'outside-only', pretendToBeVisual:true, url:'https://local.test/' });
  const { window } = dom;
  window.HTMLCanvasElement.prototype.getContext = () => makeCtx2d();
  window.requestAnimationFrame = () => 0; window.cancelAnimationFrame = () => {};
  if(!window.Path2D) window.Path2D = Path2DStub;
  // Seeded PRNG per instance: uid() draws on Math.random, so v1 seeds differed on every
  // run and a golden seed could only be compared after normSeed. With a fixed seed the
  // goldens are byte-reproducible (cmp works run to run); the before/after comparison
  // still normalises ids, because a patch that adds one random draw shifts them all.
  window.Math.random = mulberry32(0x5eed0a02);
  window.alert = window.prompt = window.confirm = () => {};
  if(!window.matchMedia) window.matchMedia = () => ({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  const errs = [];
  window.addEventListener('error', e => errs.push('window.error: '+(e.message||e)));
  for(const el of [...window.document.querySelectorAll('script')]){
    try { window.eval(el.textContent); }
    catch(e){ throw new HarnessError('SCRIPT THROW during init ('+path.basename(htmlPath)+'): '+(e&&e.stack||e)); }
  }
  if(!window.__H) throw new HarnessError('bridge __H missing — injection failed ('+path.basename(htmlPath)+')');
  return { H: window.__H, errs, window };
}

// ============================================================================
// Frozen fixture data. Changing anything here changes goldens: extend, never edit
// (ADR-002 G6: a new type is added here first, captured on the unchanged builder).
// ============================================================================

// Every palette-creatable type in 1.0.70 (WIDGET_CONTRACTS minus TabItem/TableCell),
// each with a fixed absolute slot on a 1200x1200 canvas. Slots are fixed per entry, so a
// type missing from one build never moves the others. Names are explicit for the same
// reason: the default name draws on a running counter, and one N/A would rename every
// later widget and turn a one-type difference into a whole-scene diff.
const COL = [20, 260, 500, 740, 980];
const FROZEN_TYPES = [
  // single-line widgets (default h <= 20), 5 per row, 40 px pitch
  ['HelpMarker',        COL[0],  20], ['Button',           COL[1],  20], ['Checkbox',        COL[2],  20], ['Text',            COL[3],  20], ['TextColored',      COL[4],  20],
  ['TextDisabled',      COL[0],  60], ['Separator',        COL[1],  60], ['SliderDouble',    COL[2],  60], ['SliderInt',       COL[3],  60], ['InputText',        COL[4],  60],
  ['InputInt',          COL[0], 100], ['InputDouble',      COL[1], 100], ['Combo',           COL[2], 100], ['ProgressBar',     COL[3], 100], ['DragInt',          COL[4], 100],
  ['DragDouble',        COL[0], 140], ['SeparatorText',    COL[1], 140], ['ColorEdit3',      COL[2], 140], ['ColorEdit4',      COL[3], 140], ['ArrowButton',      COL[4], 140],
  ['InputTextWithHint', COL[0], 180], ['LabelText',        COL[1], 180], ['SmallButton',     COL[2], 180], ['Selectable',      COL[3], 180], ['BulletText',       COL[4], 180],
  ['TextLinkOpenURL',   COL[0], 220], ['SliderAngle',      COL[1], 220], ['ColorButton',     COL[2], 220], ['RadioButtonEx',   COL[3], 220], ['SliderDoubleN',    COL[4], 220],
  ['DragDoubleN',       COL[0], 260], ['InputDoubleN',     COL[1], 260], ['DragIntRange2',   COL[2], 260], ['DragFloatRange2', COL[3], 260],
  // multi-line / tall
  ['ListBox',           COL[0], 310], ['TextWrapped',      COL[1], 310], ['InputTextMultiline', COL[2], 310],
  ['VSliderInt',        COL[3], 310], ['VSliderDouble',    COL[4], 310],
  // pickers (height derived from width)
  ['ColorPicker3',      COL[0], 500], ['ColorPicker4',     COL[1], 500],
  // containers, empty (children are covered by core / themes / examples)
  ['Panel',             COL[2], 500], ['Group',            COL[3], 500], ['StyleRegion',     COL[4], 500],
  ['CollapsingHeader',  COL[2], 680], ['TreeNode',         COL[3], 680],
  ['TabBar',            COL[0], 830], ['Table',            340,    830],
  // v4 — release 1.2.0 types (B03 3.1). Appended, never interleaved: every earlier slot
  // and name is unchanged. Placed where nothing is at y >= 1000 on the 1200x1200 canvas:
  // TabBar (20,830 280x180) and Table (340,830 320x200) end at x 660, and the primitive
  // row starts at y 1080 and ends at x 860. The plots sit at x 740/980 from y 1000:
  // a default height up to 80 keeps PlotLines clear of the primitive row (x 780-860
  // from y 1080); PlotHistogram (x 980-1180) only meets TextLink (x 900 + default w,
  // y 1160) at a height of 160. CheckboxFlags (x 900-920) meets neither.
  ['TextLink',          900,    1160], ['CheckboxFlags',    900,    1110],
  ['PlotLines',         COL[3], 1000], ['PlotHistogram',    COL[4], 1000],
  // v6 — release 1.4.0 type (B05 5.1; slot fixed in the coordinator's review). Appended,
  // never interleaved: every earlier slot and name is unchanged. Slot (20,1150): below the
  // primitive row (y 1080-1140), left of TextLink (x 900, y 1160) and CheckboxFlags
  // (x 900, y 1110); a default size up to 860x50 stays clear of both and inside the
  // 1200x1200 canvas (B05 B2 suggests 100x40).
  ['InvisibleButton',   COL[0], 1150],
];
const ALL_TYPES_CANVAS = { cw:1200, ch:1200 };
// Draw primitives: [kind, x1, y1, x2, y2] — a drag from (x1,y1) to (x2,y2).
const FROZEN_PRIMITIVES = [
  ['rect',     20, 1080, 100, 1140], ['circle', 140, 1080, 220, 1140], ['poly',  260, 1080, 340, 1140],
  ['line',    380, 1080, 460, 1140], ['text',   500, 1080, 620, 1140], ['triangle', 660, 1080, 740, 1140],
  ['arc',     780, 1080, 860, 1140],
];
// Structural children: made by their containers, never from the palette.
const STRUCTURAL_TYPES = new Set(['TabItem','TableCell']);

// A custom theme with all 15 THEME_CHANNELS authored, every value distinct.
const GATE_CUSTOM_THEME = {
  id:'gate-custom', label:'Gate custom',
  colors:{
    text:'#f1e2d3', textLabel:'#e3d4c5', childBg:'#1a2b3c', frameBg:'#243546',
    frameBgHovered:'#2e3f50', frameBgActive:'#38495a', button:'#6a2c1e', buttonHovered:'#7b3d2f',
    buttonActive:'#8c4e40', header:'#1e6a2c', headerHovered:'#2f7b3d', headerActive:'#408c4e',
    checkMark:'#c0ffee', sliderGrab:'#b16d2a', sliderGrabActive:'#d28e4b'
  }
};

// v3 — ADR-004 A2: the 12 channels that may carry alpha, in A2 order. Frozen here, not
// read from the build (a build without alpha has no such list).
const ALPHA_CHANNELS = ['frameBg','frameBgHovered','frameBgActive','button','buttonHovered',
  'buttonActive','header','headerHovered','headerActive','checkMark','sliderGrab','sliderGrabActive'];
// themes.gate-alpha: GATE_CUSTOM_THEME's colours, own id, 12 distinct alphas, none 0/255.
const GATE_ALPHA_VALUES = [0x21,0x32,0x43,0x54,0x65,0x76,0x87,0x98,0xA9,0xBA,0xCB,0xDC];
const GATE_ALPHA_THEME = {
  id:'gate-alpha', label:'Gate alpha',
  colors: Object.assign({}, GATE_CUSTOM_THEME.colors),
  alpha: Object.fromEntries(ALPHA_CHANNELS.map((c,i)=>[c, GATE_ALPHA_VALUES[i]]))
};
// themes.gate-alpha-opaque: GATE_CUSTOM_THEME itself (same id) plus twelve 255s. Must
// export exactly like themes.gate-custom (G5).
const GATE_ALPHA_OPAQUE_THEME = {
  id:GATE_CUSTOM_THEME.id, label:GATE_CUSTOM_THEME.label,
  colors: Object.assign({}, GATE_CUSTOM_THEME.colors),
  alpha: Object.fromEntries(ALPHA_CHANNELS.map(c=>[c, 255]))
};

// v3 — theme-library-separation (ADR-003 F7). Library colours A and project colours B
// share the id `lib-x`; every value is canonical lower-case and no value repeats across
// A, B and lib-y, so a match can only mean one source.
const LIB_X_A = {
  id:'lib-x', label:'Library X',
  colors:{
    text:'#e1f0a1', textLabel:'#e1f0a2', childBg:'#10a0a1', frameBg:'#20a0a1',
    frameBgHovered:'#20a0a2', frameBgActive:'#20a0a3', button:'#30a0a1', buttonHovered:'#30a0a2',
    buttonActive:'#30a0a3', header:'#40a0a1', headerHovered:'#40a0a2', headerActive:'#40a0a3',
    checkMark:'#50a0a1', sliderGrab:'#60a0a1', sliderGrabActive:'#60a0a2'
  }
};
const LIB_X_B = {
  id:'lib-x', label:'Project X',
  colors:{
    text:'#e1f0b1', textLabel:'#e1f0b2', childBg:'#10b0b1', frameBg:'#20b0b1',
    frameBgHovered:'#20b0b2', frameBgActive:'#20b0b3', button:'#30b0b1', buttonHovered:'#30b0b2',
    buttonActive:'#30b0b3', header:'#40b0b1', headerHovered:'#40b0b2', headerActive:'#40b0b3',
    checkMark:'#50b0b1', sliderGrab:'#60b0b1', sliderGrabActive:'#60b0b2'
  }
};
const LIB_Y = { id:'lib-y', label:'Library Y', colors:{ text:'#e1f0c1', childBg:'#10c0c1' } };
// The 13 theme pushes that map one-to-one to an authored channel (buildThemeColorPushes).
// resolveThemeColors lets authored values win, so each carries the authored colour.
const THEME_PUSH_SLOTS = [
  ['Text','text'], ['FrameBg','frameBg'], ['FrameBgHovered','frameBgHovered'],
  ['FrameBgActive','frameBgActive'], ['Button','button'], ['ButtonHovered','buttonHovered'],
  ['ButtonActive','buttonActive'], ['Header','header'], ['HeaderHovered','headerHovered'],
  ['HeaderActive','headerActive'], ['CheckMark','checkMark'], ['SliderGrab','sliderGrab'],
  ['SliderGrabActive','sliderGrabActive'],
];

const EXAMPLE_FILES = [
  'example_01_batch_rename.json',
  'example_02_item_fade_tool.json',
  'example_03_render_loudness.json',
  'example_04_midi_humanizer.json',
  'example_05_marker_palette.json',
];
const FIXTURE_DIR = path.join(__dirname, 'fixtures', 'examples');

// ============================================================================
// Scenes. build(H, note) runs after H.reset(); note(text) attaches a line to the verdict.
// ============================================================================

// core — v1's fixture, verbatim. Do not edit: its output must stay byte-identical
// to the v1 golden of the same build (ADR-002 G2, the rewrite's acceptance test).
function buildCore(H){
  H.create('Button', 40, 40);                                   // bare canvas
  const grp = H.create('Group', 40, 120, { w:200, h:120 });
  if(grp) H.create('Checkbox', 70, 160);                        // inside group
  const tabbar = H.create('TabBar', 300, 40, { w:240, h:160 });
  if(tabbar) H.create('SliderInt', 330, 90);                    // inside active tab
  const table = H.create('Table', 40, 280, { w:320, h:110 });
  // Locked-size types: their w/h come from a native ReaImGui contract, not the
  // grid, and an audit found all four drifting between creation and load (F01).
  // The gate reported CLEAN on that patch because none of them were here.
  H.create('ArrowButton',     600,  40);
  H.create('SeparatorText',   600,  90);
  H.create('BulletText',      600, 140);
  H.create('TextLinkOpenURL', 600, 190);
  // CollapsingHeader with a child: the one container whose emission shape is not
  // otherwise covered, and the type whose generated state caused F03.
  const hdr = H.create('CollapsingHeader', 40, 440, { w:200, h:120 });
  if(hdr) H.create('Button', 60, 500);
  // A labelled primitive: size, colour and clipping of a shape label are a code path
  // of their own, and the fixture could not see it - running the gate on the patch that
  // rewrote that path reported CLEAN. Long label, non-default text size, and a stroke
  // colour distinct from any label colour, so a regression in any of the three shows up
  // as a diff rather than as silence.
  // c62-c65 coverage (1.0.68). The gate was blind to all of these, which is how a
  // 2.5-4 px text-landing offset (c64) and invisible tint marks (c65) shipped CLEAN.
  // Native-text landing: TextColored / TextDisabled / HelpMarker.
  H.create('TextColored',  600, 240, { w:140, label:'TextColored' });
  H.create('TextDisabled', 600, 280, { w:140, label:'TextDisabled' });
  H.create('HelpMarker',   600, 320);
  // ProgressBar overlay text (exported verbatim; empty exports "").
  const pb = H.create('ProgressBar', 600, 360, { w:200, h:20 });
  if(pb) pb.overlay = 'Loading';
  // Tint ramp (c65) + cascade to children: marks must differ from the surface.
  const tg = H.create('Group', 300, 440, { w:240, h:150 });
  if(tg){ tg.widgetTint = '#b03a2e'; H.create('Checkbox', 320, 480); H.create('SliderDouble', 320, 530, { w:160 }); }
  const ttb = H.create('TabBar', 600, 420, { w:260, h:140 });
  if(ttb){ ttb.widgetTint = '#6c3483'; H.create('Button', 620, 480, { w:120, h:20 }); }
  // Label-less container (c62): a stored label must not reach the ImGui ID.
  H.create('Panel', 600, 600, { w:200, h:80, label:'IGNORED_LABEL' });
  H.shapes().push({ id:'fixture-rect-label', name:'Rect_label', type:'rect',
    x:400, y:300, w:170, h:90, fill:'#ffffff', stroke:'#ff0000', thickness:2,
    label:'This label is far longer than the shape that carries it', textSize:20 });
  let cellCount = 0;
  if(table){
    const cells = H.cellsOf(table.id);
    cellCount = cells.length;
    if(cells.length){
      const c = cells[0];
      H.create('Text', H.absX(c)+c.w/2-10, H.absY(c)+c.h/2-6, { w:20, h:12 }); // inside a cell
    }
  }
}

function buildAllTypes(H, note){
  H.set('cw', ALL_TYPES_CANVAS.cw); H.set('ch', ALL_TYPES_CANVAS.ch);
  for(const [t, x, y] of FROZEN_TYPES){
    if(!H.hasType(t)){ note('N/A (build lacks '+t+')'); continue; }
    const s = H.create(t, x, y, { name:'at_'+t });
    if(!s) note('BLOCKED '+t+' at '+x+','+y+(H.hints().length?' — '+H.hints().join(' / '):''));
  }
  for(const [kind, x1, y1, x2, y2] of FROZEN_PRIMITIVES){
    if(!H.primitive(kind, x1, y1, x2, y2)) note('BLOCKED primitive '+kind);
  }
  const frozen = new Set(FROZEN_TYPES.map(e=>e[0]));
  const extra = H.contractKeys().filter(k=>!frozen.has(k) && !STRUCTURAL_TYPES.has(k));
  if(extra.length) note('build has types outside the frozen list: '+extra.join(', ')+' (add them first — G6)');
}

// Compact scene for the theme channel: every theme-coloured family appears once.
function buildThemeBody(H){
  H.create('Button',       40,  40);
  H.create('Checkbox',     40,  80);
  H.create('SliderDouble', 40, 120);
  const hdr = H.create('CollapsingHeader', 40, 170, { w:200, h:120 });
  if(hdr) H.create('Button', 60, 230);
  H.create('TabBar',      300,  40, { w:240, h:160 });
  H.create('ProgressBar', 300, 240, { w:200, h:20 });
}
function themeScene(id){
  return function(H, note){
    if(id===GATE_CUSTOM_THEME.id){
      const got = H.adoptProjectTheme(JSON.parse(JSON.stringify(GATE_CUSTOM_THEME)));
      if(got!==GATE_CUSTOM_THEME.id) throw new Error('adoptProjectTheme returned '+JSON.stringify(got));
    }
    H.set('themeId', id);
    buildThemeBody(H);
  };
}

function buildProject(H){
  H.set('cw', 640); H.set('ch', 360);
  H.set('bgMode', 'custom'); H.set('bgColor', '#2d4a6b'); H.set('bgAlpha', 0.6);
  H.set('projectTitle', 'Gate "quoted" \\ title');
  H.create('Button',      40,  40);
  H.create('TextColored', 40,  80, { w:140, label:'On custom bg' });
  H.create('SliderInt',   40, 120);
}

function exampleScene(file){
  return function(H){
    const p = path.join(FIXTURE_DIR, file);
    if(!fs.existsSync(p)) throw new HarnessError('fixture missing: '+p);
    const r = H.loadText(fs.readFileSync(p,'utf8'));
    if(!r.ok) throw new Error('applyLoadedProject rejected '+file+(r.reason?': '+r.reason:''));
  };
}

// Creation-path guards: creation must not produce a project the loader rejects.
function buildGuards(H, note){
  const pk = H.create('ColorPicker4', 40, 40, { colorEditFlags:['NoInputs'] });
  note('ColorPicker4 + colorEditFlags [NoInputs]: '+(pk
    ? 'created (flags '+JSON.stringify(pk.colorEditFlags)+')'
    : 'refused'+(H.hints().length?' — '+H.hints().join(' / '):'')));
}

// v3 — a themes.* scene for a theme definition held here. Same sequence as themeScene's
// gate-custom branch (adopt, set themeId, same body), so two defs that differ only in a
// field the build ignores produce the same export.
function customThemeScene(def){
  return function(H){
    const got = H.adoptProjectTheme(JSON.parse(JSON.stringify(def)));
    if(got!==def.id) throw new Error('adoptProjectTheme returned '+JSON.stringify(got));
    H.set('themeId', def.id);
    buildThemeBody(H);
  };
}

// v4 — wave-a (B03 3.1). Layout on the pinned 900x700 canvas, default theme.
// Every widget is created with an explicit name (see the header). Creation goes through
// H.create; a type the build lacks is noted N/A and skipped before any create or uid
// draw; a refused create is noted BLOCKED with the tool's own hint.
function waveMake(H, note, t, x, y, ov){
  if(!H.hasType(t)){ note('N/A (build lacks '+t+')'); return null; }
  const s = H.create(t, x, y, ov);
  if(!s) note('BLOCKED '+t+' '+(ov&&ov.name||'')+' at '+x+','+y+(H.hints().length?' — '+H.hints().join(' / '):''));
  return s;
}
// A child that did not land in its intended parent would change what the scene covers
// without changing any count, so it is reported.
function waveNested(note, child, parent){
  if(child && parent && child.parentId!==parent.id)
    note('NOT NESTED '+child.name+' (parentId '+JSON.stringify(child.parentId)+', expected '+parent.name+')');
}
// [name, x, treeLines in wave-a (undefined = absent)]. Each TreeNode 240x200 at y 20;
// child TreeNode 180x70 at +20,+40 (below the 24 px header); child Button at +20,+140.
const WAVE_A_TREES = [
  ['wa_tree_none',     20, undefined],
  ['wa_tree_full',    280, 'full'],
  ['wa_tree_tonodes', 540, 'toNodes'],
];
// [name, x, highlight in wave-a]. Selectables at y 250.
const WAVE_A_SELECTABLES = [ ['wa_sel_plain', 20, undefined], ['wa_sel_hl', 200, true] ];
const WAVE_A_PLOT_VALUES = [0, 0.5, 1, 0.25, 0.75];

// mode: 'wave'     — the wave-a values above;
//       'absent'   — no new property set anywhere (G5 wave-a reference);
//       'explicit' — every new property set to its default: treeLines 'none' on all six
//                    TreeNodes (parents and children), highlight false on both Selectables.
function buildWaveATreeSel(H, note, mode){
  for(const [name, x, lines] of WAVE_A_TREES){
    const tree = waveMake(H, note, 'TreeNode', x, 20, { name, w:240, h:200 });
    if(!tree) continue;
    const sub = waveMake(H, note, 'TreeNode', x+20, 60, { name:name+'_sub', w:180, h:70 });
    const btn = waveMake(H, note, 'Button',   x+20, 160, { name:name+'_btn', w:120, h:20, label:'Btn' });
    waveNested(note, sub, tree); waveNested(note, btn, tree);
    if(mode==='wave' && lines!==undefined) tree.treeLines = lines;
    if(mode==='explicit'){ tree.treeLines = 'none'; if(sub) sub.treeLines = 'none'; }
  }
  for(const [name, x, hl] of WAVE_A_SELECTABLES){
    const s = waveMake(H, note, 'Selectable', x, 250, { name, label:name });
    if(!s) continue;
    if(mode==='wave' && hl!==undefined) s.highlight = hl;
    if(mode==='explicit') s.highlight = false;
  }
}

function buildWaveA(H, note){
  buildWaveATreeSel(H, note, 'wave');
  // Existing types first: the shipped Int N-variants (componentCount 2..4) plus one
  // SliderDouble 3. No change is expected here in 1.2.0.
  const cc = [ ['SliderInt',    300, 2], ['DragInt',     350, 3],
               ['InputInt',     400, 4], ['SliderDouble', 450, 3] ];
  for(const [t, y, n] of cc){
    const s = waveMake(H, note, t, 20, y, { name:'wa_cc_'+t, w:240, label:t+' x'+n });
    if(s) s.componentCount = n;
  }
  // New types (1.2.0), after everything else.
  const cbf = [ ['wa_cbf_opts0', 300, 'opts', 0], ['wa_cbf_opts3', 340, 'opts', 3],
                ['wa_cbf_mode0', 380, 'mode', 0] ];
  for(const [name, y, group, bit] of cbf){
    const s = waveMake(H, note, 'CheckboxFlags', 600, y, { name, label:name });
    if(s){ s.flagGroup = group; s.flagBit = bit; }
  }
  const pl = waveMake(H, note, 'PlotLines', 320, 300, { name:'wa_plot_lines', w:200, h:60, label:'Lines' });
  if(pl){ pl.plotValues = WAVE_A_PLOT_VALUES.slice(); pl.overlay = 'lvl'; pl.scaleMin = 0; pl.scaleMax = 1; }
  waveMake(H, note, 'PlotHistogram', 320, 400, { name:'wa_plot_hist', w:200, h:60, label:'Histogram' });
  waveMake(H, note, 'TextLink', 600, 440, { name:'wa_textlink', label:'Link' });
}
function buildWaveAExplicit(H, note){ buildWaveATreeSel(H, note, 'explicit'); }

// v5 — text-metrics (ADR-005 X1.0). Shapes are drawn through H.primitive (the editor's
// release path), then the text properties are set on the live shape. A dark fill gives the
// rect/circle labels the light label colour, a light fill the dark one — both appear.
const TM_LONG  = 'The quick brown fox jumps over the lazy dog, then naps in the sun.';
const TM_CYR   = 'Съешь же ещё этих мягких французских булок, да выпей чаю.';
// [kind, name, x, y, w, h, props]
const TEXT_METRICS_SHAPES = [
  ['rect',   'tm_r_short',     20,  20, 160,  40, { label:'OK', textSize:12, align:'center', fill:'#26323c' }],
  ['rect',   'tm_r_left',     200,  20, 160,  90, { label:TM_LONG, textSize:12, align:'left',   fill:'#26323c' }],
  ['rect',   'tm_r_center',   380,  20, 160,  90, { label:TM_LONG, textSize:12, align:'center', fill:'#26323c' }],
  ['rect',   'tm_r_right',    560,  20, 160,  90, { label:TM_LONG, textSize:12, align:'right',  fill:'#26323c' }],
  ['rect',   'tm_r_newlines',  20, 130, 160,  90, { label:'Line one\nLine two\n\nLine four', textSize:12, align:'left', fill:'#e8ecef' }],
  ['rect',   'tm_r_blanks',   200, 130, 160,  60, { label:'Hello     world   and    more   blanks', textSize:12, align:'left', fill:'#e8ecef' }],
  ['rect',   'tm_r_longword', 380, 130, 120,  60, { label:'Antidisestablishmentarianism', textSize:14, align:'center', fill:'#e8ecef' }],
  ['rect',   'tm_r_punct',    560, 130, 140,  60, { label:'alpha,beta,gamma;delta!epsilon?zeta.eta"theta', textSize:12, align:'left', fill:'#e8ecef' }],
  ['rect',   'tm_r_cyr',       20, 240, 180,  90, { label:TM_CYR, textSize:12, align:'left', fill:'#26323c' }],
  ['rect',   'tm_r_ellipsis', 220, 240, 160,  30, { label:TM_LONG, textSize:12, align:'center', fill:'#26323c' }],
  ['rect',   'tm_r_size20',   400, 240, 200,  90, { label:'Big text wraps too', textSize:20, align:'center', fill:'#26323c' }],
  ['rect',   'tm_r_size10',   620, 240, 120,  50, { label:'Small text in a small box wraps here', textSize:10, align:'left', fill:'#26323c' }],
  ['circle', 'tm_c_circle',    20, 350, 120, 120, { label:TM_LONG, textSize:12, align:'center', fill:'#e8ecef' }],
  ['circle', 'tm_c_ellipse',  160, 370, 160,  80, { label:TM_CYR, textSize:10, align:'center', fill:'#26323c' }],
  ['text',   'tm_t_single',   340, 350, 200,  20, { label:'Hello', textSize:14, align:'left', vAlign:'top' }],
  ['text',   'tm_t_top',      340, 380, 200,  60, { label:TM_LONG, textSize:12, align:'left', vAlign:'top' }],
  ['text',   'tm_t_middle',   560, 350, 200,  60, { label:TM_LONG, textSize:12, align:'center', vAlign:'middle' }],
  ['text',   'tm_t_bottom',   560, 420, 200,  60, { label:TM_LONG, textSize:12, align:'right', vAlign:'bottom' }],
  ['text',   'tm_t_cyr',       20, 490, 160,  60, { label:TM_CYR, textSize:12, align:'left', vAlign:'top' }],
  ['text',   'tm_t_newlines', 200, 490, 160,  60, { label:'First line\nSecond line', textSize:14, align:'center', vAlign:'middle' }],
  ['text',   'tm_t_overflow', 380, 490, 120,  20, { label:'This sentence is much taller than its box once it wraps', textSize:20, align:'left', vAlign:'top' }],
];
function buildTextMetrics(H, note){
  for(const [kind, name, x, y, w, h, props] of TEXT_METRICS_SHAPES){
    const s = H.primitive(kind, x, y, x+w, y+h);
    if(!s){ note('BLOCKED primitive '+kind+' '+name); continue; }
    s.name = name;
    Object.assign(s, props);
  }
}

// v6 — wave-b (B05 5.1). Layout on a widened 1100x600 canvas (H.set, as buildProject
// does), default theme. Every widget has an explicit name. Creation goes through
// H.create; a type the build lacks is noted N/A and skipped before any create or uid
// draw; a refused create is noted BLOCKED with the tool's own hint — same helpers as
// wave-a (waveMake, waveNested).
// [name, x, tabButton in wave-b (undefined = absent)]. Each TabBar 280x180 at y 20; its
// two TabItems ("Tab 1"/"Tab 2") are auto-created by H.create (createWidgetAtPoint),
// same as core's tabbar. tabButtonLabel 'Add' is set whenever tabButton is set.
const WAVE_B_TABBARS = [
  ['wb_tabbar_none',     20, undefined],
  ['wb_tabbar_leading', 340, 'leading'],
  ['wb_tabbar_trailing',660, 'trailing'],
];
// [name, x, disabled in wave-b]. StyleRegion 200x120 at y 220; each holds one Button
// (interior +20,+40) and one SliderInt (interior +20,+80). The second also gets
// styleText, to cover the push order (B4).
const WAVE_B_STYLEREGIONS = [
  ['wb_sr_off', 20,  undefined],
  ['wb_sr_on', 260,  true],
];
// [name, x, freezeHeader in wave-b (undefined = absent), scrollY]. Table 320x200 at
// y 380; headersRow true on all three (freezeHeader is only meaningful with it).
const WAVE_B_TABLES = [
  ['wb_table_freeze_scrolly',    20, undefined, true],
  ['wb_table_freeze_on_scrolly',380, true,      true],
  ['wb_table_freeze_on_noscroll',740, true,      false],
];
// mode: 'wave'     — the wave-b values above;
//       'absent'   — no new property set anywhere (G5 wave-b reference);
//       'explicit' — every new property set to its default: tabButton 'none' on all
//                    three TabBars, disabled false on both StyleRegions, freezeHeader
//                    false on all three Tables.
function buildWaveBTabSrTable(H, note, mode){
  for(const [name, x, btn] of WAVE_B_TABBARS){
    const tb = waveMake(H, note, 'TabBar', x, 20, { name, w:280, h:180 });
    if(!tb) continue;
    if(mode==='wave' && btn!==undefined){ tb.tabButton = btn; tb.tabButtonLabel = 'Add'; }
    if(mode==='explicit') tb.tabButton = 'none';
  }
  for(const [name, x, dis] of WAVE_B_STYLEREGIONS){
    const sr = waveMake(H, note, 'StyleRegion', x, 220, { name, w:200, h:120 });
    if(!sr) continue;
    const btn = waveMake(H, note, 'Button',    x+20, 260, { name:name+'_btn', w:120, h:20, label:'Btn' });
    const sl  = waveMake(H, note, 'SliderInt', x+20, 300, { name:name+'_sl',  w:120 });
    waveNested(note, btn, sr); waveNested(note, sl, sr);
    if(mode==='wave' && dis!==undefined){ sr.disabled = dis; if(name==='wb_sr_on') sr.styleText = '#c0ffee'; }
    if(mode==='explicit') sr.disabled = false;
  }
  for(const [name, x, freeze, scrollY] of WAVE_B_TABLES){
    const t = waveMake(H, note, 'Table', x, 380, { name, w:320, h:200 });
    if(!t) continue;
    t.headersRow = true;
    t.tableFlags = Object.assign({}, t.tableFlags, { ScrollY: scrollY });
    if(mode==='wave' && freeze!==undefined) t.freezeHeader = freeze;
    if(mode==='explicit') t.freezeHeader = false;
  }
}
function buildWaveB(H, note){
  H.set('cw', 1100); H.set('ch', 600);
  buildWaveBTabSrTable(H, note, 'wave');
  // The new type last (as wave-a): created before the existing types it would take the
  // first uid and shift every normalised seed id and auto-name after it. Free spot:
  // right of the StyleRegions (x 20-460), above the Tables (y 380).
  waveMake(H, note, 'InvisibleButton', 500, 220, { name:'wb_invisible', w:120, h:40 });
}
function buildWaveBExplicit(H, note){
  H.set('cw', 1100); H.set('ch', 600);
  buildWaveBTabSrTable(H, note, 'explicit');
}

// v7 — tables-b (B06 6.1, ADR-011 G2/G4). Layout on a widened 1200x800 canvas (H.set),
// default theme. Every table has an explicit name and 3 columns of clearly different
// label widths, so a wrong maxW (ADR-011 fact 3) would show in the REAPER pass. Tables
// sit two per row (600 px pitch), 560x220 boxes at y 20 / 300 / 580 (coordinator review:
// comment corrected; the text-metrics newline labels restored to v6's text).
// [name, x, y, angledHeaders in tables-b (undefined = absent), scrollY, headersRow,
//  rowCount, scrollRows in tables-b (undefined = absent), freezeHeader]
const TABLES_B = [
  ['tb_angled_scroll',      20,  20, [0,2],   true,  true, 6, undefined, undefined],
  ['tb_angled_all',        620,  20, [0,1,2], false, true, 4, undefined, undefined],
  ['tb_scroll_plain',       20, 300, undefined, true, true, 4, undefined, undefined],
  ['tb_scrollrows',        620, 300, undefined, true, true, 4, 20,       true],
  ['tb_angled_noheader',    20, 580, [1],     false, false,4, undefined, undefined],
  ['tb_scrollrows_noscroll',620,580, undefined, false,true, 4, 20,       undefined],
];
// Column labels of clearly different widths, reused on every table (only the angled
// tables' labels are ever measured for maxW, but a uniform set keeps the scene simple).
const TABLES_B_COLUMNS = ['Gain', 'Pan', 'Output routing'];

// v8 — menus (B07 7.1, ADR-007). A menu bar is project data, not a shape: the scenes build
// widgets through H.create, save, add `menuBar` to the saved object, reset and load it back
// (withMenuBar), so a build that does not know the key still builds the scene.
const MENUS_CANVAS = { cw:700, ch:300 };
const MENUS_FIXTURE = [
  { type:'menu', name:'mb_file', label:'File', items:[
    { type:'item', name:'mb_file_new',   label:'New',   shortcut:'Ctrl+N' },
    { type:'item', name:'mb_file_open',  label:'Open…', shortcut:'Ctrl+O' },
    { type:'item', name:'mb_file_open2', label:'Open…' },
    { type:'separator' },
    { type:'menu', name:'mb_file_recent', label:'Recent', items:[
      { type:'item', name:'mb_recent_a', label:'Project A' },
      { type:'menu', name:'mb_recent_more', label:'More', items:[
        { type:'menu', name:'mb_recent_deep', label:'Deep', items:[
          { type:'item', name:'mb_recent_deep_item', label:'Deepest item' },
        ]},
      ]},
    ]},
    { type:'separator' },
    { type:'item', name:'mb_file_quit', label:'Quit', shortcut:'Ctrl+Q', enabled:false },
  ]},
  { type:'menu', name:'mb_view', label:'View', items:[
    { type:'check', name:'mb_view_grid',   label:'Show grid', checked:true },
    { type:'check', name:'mb_view_snap',   label:'Snap', shortcut:'S' },
    { type:'check', name:'mb_view_locked', label:'Locked', enabled:false },
  ]},
  { type:'menu', name:'mb_edit', label:'Edit', enabled:false, items:[
    { type:'item', name:'mb_edit_undo', label:'Undo' },
  ]},
  { type:'menu', name:'mb_help', label:'Help', items:[] },
];

// findMenuByName: depth-first search for an entry by name, used to attach
// MENUS_WITH_INVALID's extra entries to the right parent's items array.
function findMenuByName(tree, name){
  for(const e of tree){
    if(e.name===name) return e;
    if(e.items){ const r = findMenuByName(e.items, name); if(r) return r; }
  }
  return null;
}
// MENUS_WITH_INVALID: MENUS_FIXTURE plus entries the 1.6.0 loader must drop or change
// (ADR-007 M2). Each entry's comment says why.
const MENUS_WITH_INVALID = (function(){
  const tree = JSON.parse(JSON.stringify(MENUS_FIXTURE));
  // top level holds menus only.
  tree.push({ type:'item', name:'mb_top_item', label:'Top item' });
  const view = findMenuByName(tree, 'mb_view');
  view.items.push({ type:'bogus', name:'mb_bogus', label:'?' });           // unknown type
  view.items.push({ type:'item', name:'mb_empty', label:'' });             // empty label
  view.items.push({ type:'item', name:'mn_origin', label:'Clash' });       // name taken by a widget
  view.items.push({ type:'item', name:'mb_view_grid', label:'Dup name' }); // name taken by an earlier entry
  view.items.push({ type:'item', name:'mb_hash', label:'Save##x' });       // kept, label cut at `##` -> `Save`
  const deep = findMenuByName(tree, 'mb_recent_deep');
  deep.items.push({ type:'menu', name:'mb_too_deep', label:'Too deep',    // depth 5, dropped with its items
    items:[ { type:'item', name:'mb_too_deep_item', label:'x' } ] });
  return tree;
})();

// menusExplicitDefaults: MENUS_FIXTURE with every default written out explicitly
// (enabled:true, shortcut:'', checked:false) instead of left absent.
function menusExplicitDefaults(tree){
  const clone = JSON.parse(JSON.stringify(tree));
  (function walk(items){
    for(const e of items){
      if(e.type==='menu' || e.type==='item' || e.type==='check'){
        if(e.enabled===undefined) e.enabled = true;
      }
      if(e.type==='item' || e.type==='check'){
        if(e.shortcut===undefined) e.shortcut = '';
      }
      if(e.type==='check'){
        if(e.checked===undefined) e.checked = false;
      }
      if(e.items) walk(e.items);
    }
  })(clone);
  return clone;
}

// mode: 'wave'     — the tables-b values above (angledHeaders / scrollRows per row);
//       'absent'   — no new property set anywhere (G5 tables-b reference);
//       'explicit' — angledHeaders:[] and scrollRows:0 set explicitly on every table
//                    (the defaults ADR-011 G2/G4 specify).
function buildTablesB(H, note, mode){
  for(const [name, x, y, angled, scrollY, headersRow, rowCount, scrollRows, freeze] of TABLES_B){
    const t = waveMake(H, note, 'Table', x, y, { name, w:560, h:220 });
    if(!t) continue;
    t.columns = TABLES_B_COLUMNS.slice();
    t.headersRow = headersRow;
    t.tableFlags = Object.assign({}, t.tableFlags, { ScrollY: scrollY });
    if(freeze !== undefined) t.freezeHeader = freeze;
    if(mode==='wave'){
      if(angled !== undefined) t.angledHeaders = angled.slice();
      if(scrollRows !== undefined) t.scrollRows = scrollRows;
    } else if(mode==='explicit'){
      t.angledHeaders = [];
      t.scrollRows = 0;
    }
    // v13 fixture correction: emulate the inspector's committed Table-property edit.
    // The v12 fixture set angledHeaders after its only resize/reflow call, leaving
    // TableCell bounds stale until Save -> Load. Refresh AFTER all live mutations,
    // and BEFORE positioning the nested Button. This is test setup, not a builder fix.
    H.resizeTable(t, rowCount);
    // tb_angled_scroll: one Button nested in cell r0c0, captured by the tool's own
    // cell placement (as core does with its Text-in-cell, wave*'s waveNested pattern).
    if(name==='tb_angled_scroll'){
      const c = H.cellAt(t.id, 0, 0);
      if(!c){ note('NO CELL r0c0 on '+name); }
      else {
        const btn = waveMake(H, note, 'Button', H.absX(c)+4, H.absY(c)+4, { name:name+'_btn', w:60, h:20, label:'Go' });
        waveNested(note, btn, c);
      }
    }
  }
}
function buildTablesB_(H, note){ H.set('cw', 1200); H.set('ch', 520 + 280); buildTablesB(H, note, 'wave'); }
function buildTablesBExplicit(H, note){ H.set('cw', 1200); H.set('ch', 520 + 280); buildTablesB(H, note, 'explicit'); }

// v8 — menus scene helpers (B07 7.1). withMenuBar round-trips the current project
// through Save -> add `menuBar` -> reset -> Load, so a build that does not know the
// key still builds the scene (menu data lives only in the saved/loaded project, never
// set on a live shape).
function withMenuBar(H, menuBar){
  const p = JSON.parse(H.saveText());
  if(menuBar !== undefined) p.menuBar = JSON.parse(JSON.stringify(menuBar));
  H.reset();
  const r = H.loadText(JSON.stringify(p));
  if(!r.ok) throw new Error('applyLoadedProject rejected the menus project'+(r.reason?': '+r.reason:''));
  return r;
}
// Widgets first (explicit names), at y = 0 so a moved canvas origin would show.
function buildMenusWidgets(H, note){
  H.set('cw', MENUS_CANVAS.cw); H.set('ch', MENUS_CANVAS.ch);
  waveMake(H, note, 'Button',    0,   0, { name:'mn_origin', w:120, h:20, label:'Origin' });
  waveMake(H, note, 'Checkbox',  240, 0, { name:'mn_check' });
  waveMake(H, note, 'SliderInt', 0,  40, { name:'mn_slider', w:200 });
}
function buildMenusScene(menuBar, theme){
  return function(H, note){
    if(theme) H.set('themeId', theme);
    buildMenusWidgets(H, note);
    const r = withMenuBar(H, menuBar);
    if(r.reason) note('loader: '+r.reason.replace(/\s+/g,' ').trim());
  };
}

// v9 — add project-level keys to a saved project and load it back (withMenuBar's pattern,
// any keys). A build that does not know a key ignores it.
function withProjectKeys(H, keys){
  const p = JSON.parse(H.saveText());
  Object.assign(p, JSON.parse(JSON.stringify(keys)));
  H.reset();
  const r = H.loadText(JSON.stringify(p));
  if(!r.ok) throw new Error('applyLoadedProject rejected the project'+(r.reason?': '+r.reason:''));
  return r;
}

// v9 — themes.slate-title / themes.slate-title.explicit-default (B07 7.3, ADR-007 M11).
// The compact themes.* body under `slate`, with `themedTitleBar` added to the saved
// project through withProjectKeys — true for the "on" scene, false (the explicit
// default) for the reference scene G5 title compares it against.
function buildSlateTitleScene(themedTitleBar){
  return function(H, note){
    H.set('themeId', 'slate');
    buildThemeBody(H);
    const r = withProjectKeys(H, { themedTitleBar });
    if(r.reason) note('loader: '+r.reason.replace(/\s+/g,' ').trim());
  };
}
// v9 — menus.themed-title (B07 7.3, ADR-007 M11). The menus widgets under `slate`, with
// both `menuBar` and `themedTitleBar:true` added in one withProjectKeys call.
function buildMenusThemedTitleScene(){
  return function(H, note){
    H.set('themeId', 'slate');
    buildMenusWidgets(H, note);
    const r = withProjectKeys(H, { menuBar: MENUS_FIXTURE, themedTitleBar:true });
    if(r.reason) note('loader: '+r.reason.replace(/\s+/g,' ').trim());
  };
}

// v10 — arcs (B11 11.1; F04 coverage after the fact, B10 review R1). Each arc is drawn through
// H.primitive('arc', ...) (the editor's release path), then name and properties are set on the
// live shape, as text-metrics does. Canvas 800x560, default theme. Frozen table:
// [name, x, y, w, h, props]; 3 rows of 5, column x = 20 + col*155, row y = 20 / 180 / 340,
// boxes 120x120 unless stated. Arcs only, no labels; fill and stroke colours stay at the
// defaults the creation path gives; names are explicit (nothing depends on running counters).
const ARCS_CANVAS = { cw:800, ch:560 };
const ARCS_SHAPES = [
  // row 1 (y 20)
  ['ar_pie_90',          20,  20, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:90  }],  // convex, unchanged by F04
  ['ar_pie_180',        175,  20, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:180 }],  // convex boundary
  ['ar_pie_270',        330,  20, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:270 }],  // concave fill (fill + stroke)
  ['ar_pie_wrap',       485,  20, 120, 120, { arcMode:'pie', angleStart:300, angleEnd:60  }],  // crosses 0: 120 deg clockwise
  ['ar_pie_full',       640,  20, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:360 }],  // full turn: no centre point
  // row 2 (y 180)
  ['ar_pie_equal',       20, 180, 120, 120, { arcMode:'pie', angleStart:45,  angleEnd:45  }],  // empty sweep
  ['ar_pie_neg',        175, 180, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:-90 }],  // negative end: 270 deg clockwise, concave
  ['ar_pie_big',        330, 180, 120, 120, { arcMode:'pie', angleStart:720, angleEnd:810 }],  // angles past one turn: 90 deg
  ['ar_pie_fill_only',  485, 180, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:270, strokeNone:true }],  // concave fill, no stroke
  ['ar_pie_stroke_only',640, 180, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:270, fillNone:true }],    // stroke only
  // row 3 (y 340)
  ['ar_pie_alpha',       20, 340, 120, 120, { arcMode:'pie', angleStart:0,   angleEnd:270, opacity:128, thickness:6 }],  // concave fill with alpha, thick stroke
  ['ar_ring_neg',       175, 340, 120, 120, { arcMode:'ring', angleStart:0,  angleEnd:-90 }],  // open arc, clockwise sweep
  ['ar_ring_full',      330, 340, 120, 120, { arcMode:'ring', angleStart:0,  angleEnd:360 }],  // open arc, full turn
  ['ar_ring_nostroke',  485, 340, 120, 120, { arcMode:'ring', angleStart:0,  angleEnd:270, strokeNone:true }],  // nothing to draw: emits nothing on dev.12
  ['ar_pie_ellipse',    640, 340, 140,  80, { arcMode:'pie', angleStart:30,  angleEnd:250 }],  // non-square box (radius = min(w, h)/2), concave
];
function buildArcs(H, note){
  H.set('cw', ARCS_CANVAS.cw); H.set('ch', ARCS_CANVAS.ch);
  for(const [name, x, y, w, h, props] of ARCS_SHAPES){
    const s = H.primitive('arc', x, y, x+w, y+h);
    if(!s){ note('BLOCKED primitive arc '+name); continue; }
    s.name = name;
    Object.assign(s, props);
  }
}

// v11 — adaptive scenes (A01, ADR-009 AD11). Fixture first (ADR-002 G6): the harness learns
// `pinH` / `pinV` (per shape) and `windowResize` (per project) before the builder knows them.
// Pins and project keys never touch live shapes: withAdaptive writes them into the SAVED
// project and loads it back, so a build that does not know them shows what its loader does
// with them (1.7.0-dev.3 keeps unknown shape keys and drops unknown project keys).
//
// Body A — a 640x440 form. [name, type, x, y, overrides, parent name | null]. Absolute
// canvas coordinates, passed to H.create (which nests a widget into the container under it);
// a container is created before its children. Every shape has an explicit name.
const ADAPTIVE_BODY_A = [
  ['ad_title',    'Text',         20,  10, { w:200, label:'Adaptive' },            null],
  ['ad_close',    'Button',      520,  10, { w:100, h:20, label:'Close' },        null],
  ['ad_input',    'InputText',    20,  50, { w:380 },                             null],
  ['ad_combo',    'Combo',       440,  50, { w:180 },                             null],
  ['ad_center',   'Button',      270,  90, { w:100, h:24, label:'Center' },       null],
  ['ad_slider',   'SliderDouble',440,  90, { w:180 },                             null],
  ['ad_panel',    'Panel',        20, 130, { w:600, h:200 },                      null],
  ['ad_p_btn',    'Button',       30, 140, { w:80, h:20, label:'Inner' },         'ad_panel'],
  ['ad_p_list',   'ListBox',      30, 180, { w:280, h:110 },                      'ad_panel'],
  ['ad_p_grp',    'Group',       340, 180, { w:170, h:100 },                      'ad_panel'],
  ['ad_g_btn',    'Button',      360, 230, { w:100, h:20, label:'Grouped' },       'ad_p_grp'],
  ['ad_p_ok',     'Button',      520, 300, { w:90, h:20, label:'Apply' },         'ad_panel'],
  ['ad_progress', 'ProgressBar',  20, 350, { w:600, h:20 },                       null],
  ['ad_status',   'Text',         20, 400, { w:240, label:'Status' },             null],
  ['ad_cancel',   'Button',      410, 400, { w:100, h:20, label:'Cancel' },       null],
  ['ad_ok',       'Button',      520, 400, { w:100, h:20, label:'OK' },           null],
];
// Pin sets: { <name>: { pinH?, pinV? } }.
const ADAPTIVE_PINS_MOVE = {
  ad_close:  { pinH:'right' },
  ad_combo:  { pinH:'right' },
  ad_center: { pinH:'center' },
  ad_slider: { pinH:'right', pinV:'center' },
  ad_panel:  { pinV:'bottom' },
  ad_p_grp:  { pinH:'right' },
  ad_g_btn:  { pinH:'center' },
  ad_p_ok:   { pinH:'right', pinV:'bottom' },
  ad_status: { pinV:'bottom' },
  ad_cancel: { pinH:'right', pinV:'bottom' },
  ad_ok:     { pinH:'right', pinV:'bottom' },
};
const ADAPTIVE_PINS_STRETCH = {   // applied after MOVE; a key here overrides MOVE's
  ad_input:    { pinH:'stretch' },
  ad_panel:    { pinH:'stretch', pinV:'stretch' },
  ad_p_list:   { pinH:'stretch', pinV:'stretch' },
  ad_progress: { pinH:'stretch' },
};
// Body N pins (the table of the brief, column "pins").
const ADAPTIVE_PINS_NESTED = {
  ad_n_sr:      { pinH:'stretch' },
  ad_n_sr_sl:   { pinH:'right' },
  ad_n_sr_bt:   { pinH:'center' },
  ad_n_tabs:    { pinH:'stretch', pinV:'stretch' },
  ad_n_tab_bt:  { pinH:'right', pinV:'bottom' },
  ad_n_tree:    { pinH:'right' },
  ad_n_tree_bt: { pinH:'center' },
  ad_n_pan:     { pinV:'bottom' },
  ad_n_pan_in:  { pinH:'stretch' },
  ad_n_pan_bt:  { pinH:'right' },
  ad_n_tbl:     { pinH:'right', pinV:'bottom' },
  ad_n_hdr:     { pinV:'bottom' },
  ad_n_hdr_bt:  { pinH:'right' },
};
// Body P: [kind, name, x1, y1, x2, y2, props] through H.primitive, then name and props are
// set on the live shape (as buildTextMetrics does).
const ADAPTIVE_PRIMS = [
  ['rect',     'ad_r',   20,  20, 220,  80, { label:'Rect label that wraps at runtime', textSize:14 }],
  ['text',     'ad_t',   20, 100, 320, 140, { label:'Text primitive that wraps inside its box', textSize:12, align:'left', vAlign:'top' }],
  ['circle',   'ad_c',  520,  20, 600, 100, { label:'C' }],
  ['arc',      'ad_a',  280, 180, 360, 260, {}],
  ['line',     'ad_l',   20, 300, 220, 340, {}],
  ['poly',     'ad_p',  420, 300, 520, 380, {}],
  ['triangle', 'ad_tri',260, 320, 340, 400, {}],
];
const ADAPTIVE_PINS_PRIMS = {
  ad_r:     { pinH:'stretch', pinV:'center' },
  ad_t:     { pinH:'stretch' },
  ad_c:     { pinH:'right' },
  ad_a:     { pinH:'center', pinV:'center' },
  ad_l:     { pinV:'bottom' },
  ad_p:     { pinH:'right', pinV:'bottom' },
  ad_tri:   { pinH:'center' },
  ad_pr_bt: { pinH:'right' },
};
// Body M: buildMenusWidgets + MENUS_FIXTURE (the v8 data, unchanged).
const ADAPTIVE_PINS_MENUS = {
  mn_origin: { pinH:'right' },
  mn_check:  { pinH:'right' },
  mn_slider: { pinV:'bottom' },
};
// adaptive.invalid: values ADR-009 AD1, AD2 and AD4 make the loader drop (maxH:2000 is kept).
// The TabItem and TableCell have no name of their own; buildAdaptiveInvalid finds them.
const ADAPTIVE_PINS_INVALID = {
  ad_title:  { pinH:'up' },
  ad_close:  { pinV:5, pinH:'RIGHT' },
  ad_combo:  { pinH:'left' },
  ad_slider: { pinV:'stretch' },      // a native-height control: stretch refused by AD4
  ad_p_grp:  { pinH:null },
};
const ADAPTIVE_WINDOW_INVALID = { minW:10, minH:'x', maxW:100, maxH:2000 };

// withAdaptive(H, pins, keys, note, edit): the pattern of withProjectKeys.
//   1. p = the saved project;
//   2. for every [name, props] of `pins`, Object.assign the props onto the shape named `name`
//      in p.shapes (undefined values are not set; a missing name is noted `MISSING <name>`);
//   3. `edit(p)`, when given, may change p further (shapes that have no name of their own);
//   4. Object.assign(p, keys) (undefined values are not set), then reset and Load. A rejected
//      load throws, as withProjectKeys does; a loader message is noted as `loader: …`.
// `note` is the scene's note function (MISSING and loader notes go through it).
function withAdaptive(H, pins, keys, note, edit){
  const defined = o => Object.fromEntries(Object.entries(o || {}).filter(([, v]) => v !== undefined));
  const p = JSON.parse(H.saveText());
  for(const [name, props] of Object.entries(pins || {})){
    const s = p.shapes.find(sh => sh.name === name);
    if(!s){ note('MISSING '+name); continue; }
    Object.assign(s, defined(props));
  }
  if(edit) edit(p);
  Object.assign(p, JSON.parse(JSON.stringify(defined(keys))));
  H.reset();
  const r = H.loadText(JSON.stringify(p));
  if(!r.ok) throw new Error('applyLoadedProject rejected the adaptive project'+(r.reason?': '+r.reason:''));
  if(r.reason) note('loader: '+r.reason.replace(/\s+/g,' ').trim());
  return r;
}

// Body A, on a 640 x canvasH canvas (440; 560 for adaptive.invalid). Returns { name: shape }.
function buildAdaptiveBody(H, note, canvasH){
  H.set('cw', 640); H.set('ch', canvasH);
  const made = {};
  for(const [name, type, x, y, ov, parent] of ADAPTIVE_BODY_A){
    const s = waveMake(H, note, type, x, y, Object.assign({ name }, ov));
    if(!s) continue;
    made[name] = s;
    if(parent) waveNested(note, s, made[parent]);
  }
  return made;
}
// 'move' = MOVE; 'move+stretch' = MOVE then STRETCH (a key in STRETCH overrides MOVE's);
// 'move+explicit' = MOVE plus {pinH:'left', pinV:'top'} on every Body A shape for each key
// MOVE leaves unset; null = no pins.
function adaptivePins(pinSet){
  const out = {};
  const put = src => { for(const [n, pr] of Object.entries(src)) out[n] = Object.assign(out[n] || {}, pr); };
  switch(pinSet){
    case null: break;
    case 'move': put(ADAPTIVE_PINS_MOVE); break;
    case 'move+stretch': put(ADAPTIVE_PINS_MOVE); put(ADAPTIVE_PINS_STRETCH); break;
    case 'move+explicit':
      for(const row of ADAPTIVE_BODY_A) out[row[0]] = { pinH:'left', pinV:'top' };
      put(ADAPTIVE_PINS_MOVE);
      break;
    default: throw new Error('adaptivePins: unknown pin set '+pinSet);
  }
  return out;
}
// windowResize === null: no `windowResize` key at all; otherwise the key is set to it.
function adaptiveScene(body, pinSet, windowResize){
  return function(H, note){
    if(body !== 'A') throw new Error('adaptiveScene: unknown body '+body);
    buildAdaptiveBody(H, note, 440);
    withAdaptive(H, adaptivePins(pinSet), windowResize === null ? {} : { windowResize }, note);
  };
}

// Body N — containers and what they hold, 640x520, `windowResize: {}`.
function buildAdaptiveNested(H, note){
  H.set('cw', 640); H.set('ch', 520);
  const mk = (t, name, x, y, ov, parent) => {
    const s = waveMake(H, note, t, x, y, Object.assign({ name }, ov));
    if(s && parent) waveNested(note, s, parent);
    return s;
  };
  const sr = mk('StyleRegion', 'ad_n_sr', 20, 20, { w:600, h:110 });
  mk('SliderDouble', 'ad_n_sr_sl', 40, 60, { w:200 }, sr);
  mk('Button', 'ad_n_sr_bt', 300, 90, { w:100, h:20, label:'Mid' }, sr);
  const tabs = mk('TabBar', 'ad_n_tabs', 20, 150, { w:380, h:160 });
  const tabBt = mk('Button', 'ad_n_tab_bt', 40, 260, { w:100, h:20, label:'InTab' });
  if(tabBt && tabs){
    // The parent must be the TabBar's active TabItem.
    const ti = H.shapes().find(s => s.widgetType==='TabItem' && s.parentId===tabs.id && s.id===tabs.activeTabId);
    if(ti) waveNested(note, tabBt, ti);
    else note('NOT NESTED ad_n_tab_bt (active TabItem of ad_n_tabs not found)');
  }
  const tree = mk('TreeNode', 'ad_n_tree', 420, 150, { w:200, h:160 });
  mk('Button', 'ad_n_tree_bt', 440, 220, { w:120, h:20, label:'InTree' }, tree);
  const pan = mk('Panel', 'ad_n_pan', 20, 330, { w:380, h:80 });
  const panIn = mk('Panel', 'ad_n_pan_in', 30, 340, { w:180, h:60 }, pan);
  mk('Button', 'ad_n_pan_bt', 40, 350, { w:80, h:20, label:'Deep' }, panIn);
  const tbl = mk('Table', 'ad_n_tbl', 420, 330, { w:200, h:80 });
  if(tbl){
    const cells = H.cellsOf(tbl.id);                    // centre of the first cell, as buildCore does
    if(cells.length){
      const c = cells[0];
      mk('Text', 'ad_n_tbl_txt', H.absX(c)+c.w/2-10, H.absY(c)+c.h/2-6, { w:20, h:12 }, c);
    } else note('NOT NESTED ad_n_tbl_txt (the table has no cells)');
  }
  const hdr = mk('CollapsingHeader', 'ad_n_hdr', 20, 430, { w:600, h:80 });
  mk('Button', 'ad_n_hdr_bt', 40, 470, { w:100, h:20, label:'InHeader' }, hdr);
  withAdaptive(H, ADAPTIVE_PINS_NESTED, { windowResize:{} }, note);
}

// Body P — seven primitives and one widget, 640x440, `windowResize: {}`.
function buildAdaptivePrimitives(H, note){
  H.set('cw', 640); H.set('ch', 440);
  for(const [kind, name, x1, y1, x2, y2, props] of ADAPTIVE_PRIMS){
    const s = H.primitive(kind, x1, y1, x2, y2);
    if(!s){ note('BLOCKED primitive '+kind+' '+name); continue; }
    s.name = name;
    Object.assign(s, props);
  }
  waveMake(H, note, 'Button', 420, 200, { name:'ad_pr_bt', w:100, h:20, label:'Btn' });
  withAdaptive(H, ADAPTIVE_PINS_PRIMS, { windowResize:{} }, note);
}

// Body M — the v8 menus widgets and MENUS_FIXTURE, `windowResize: { maxW: 1000 }`.
function buildAdaptiveMenus(H, note){
  buildMenusWidgets(H, note);
  withAdaptive(H, ADAPTIVE_PINS_MENUS, { menuBar: MENUS_FIXTURE, windowResize:{ maxW:1000 } }, note);
}

// adaptive.invalid — Body A on a 640x560 canvas plus a TabBar and a Table, then every invalid
// value. The first TabItem and the first TableCell are parent-managed: found in p.shapes by
// widgetType and parentId (a MISSING note if absent).
function buildAdaptiveInvalid(H, note){
  buildAdaptiveBody(H, note, 560);
  waveMake(H, note, 'TabBar', 20, 450, { name:'ad_i_tabs', w:300, h:100 });
  waveMake(H, note, 'Table', 340, 450, { name:'ad_i_tbl', w:280, h:100 });
  withAdaptive(H, ADAPTIVE_PINS_INVALID, { windowResize: ADAPTIVE_WINDOW_INVALID }, note, p => {
    const firstChild = (parentName, widgetType, props, label) => {
      const par = p.shapes.find(s => s.name === parentName);
      const kid = par && p.shapes.find(s => s.widgetType === widgetType && s.parentId === par.id);
      if(kid) Object.assign(kid, props); else note('MISSING '+label);
    };
    firstChild('ad_i_tabs', 'TabItem',   { pinH:'right' },  'first TabItem of ad_i_tabs');
    firstChild('ad_i_tbl',  'TableCell', { pinV:'bottom' }, 'first TableCell of ad_i_tbl');
  });
}

// v12 — tables-c scenes (A07.1, ADR-002 G6). Fixture first: the harness learns the 2.1.0 Table
// properties (`cellPadding`, `rowBg`, `highlightColor`, `highlightRows`, `rowsFill`), the
// StyleRegion property `styleFramePadding` and Table stretch pins before the builder knows them.
// Tables are built through H.create and then mutated on the live shape (the wave-b / tables-b
// pattern); pins and `windowResize` go through withAdaptive (the v11 pattern), so a build that
// does not know a property still builds every scene. Canvas 640x480, default theme.
//
// tcCellMake: H.cellChild plus the harness notes (N/A, BLOCKED, NOT NESTED) in waveMake's words.
function tcCellMake(H, note, tableName, r, c, type, x, y, ov){
  if(!H.hasType(type)){ note('N/A (build lacks '+type+')'); return null; }
  const s = H.cellChild(tableName, r, c, type, x, y, ov);
  const n = H.cellChildNote();
  if(n) note(n);
  else if(!s) note('BLOCKED '+type+' '+(ov&&ov.name||'')+' in '+tableName+' r'+r+'c'+c+(H.hints().length?' — '+H.hints().join(' / '):''));
  return s;
}
// Column sizing as the inspector stores it: { sizing:'fixed'|'stretch', value }.
const TC_FIXED = v => ({ sizing:'fixed', value:v });
const TC_STRETCH = { sizing:'stretch', value:1 };

// tables-c.stretch: three tables, [name, x, y, w, h]. Pins: tc_list Left+Right + Top+Bottom
// (pinH + pinV 'stretch'), tc_hdr Left+Right only (pinH 'stretch'), tc_plain Top+Bottom only
// (pinV 'stretch'). tc_list's cell children are named tc_list_r<r>c<c>; the pinned ones are
// tc_list_btn (r0c2, pinH 'right') and tc_list_wrap (r1c2, pinH 'stretch').
const TABLES_C_STRETCH = {
  list:  ['tc_list',  20,  20, 600, 200],
  hdr:   ['tc_hdr',   20, 232, 600, 110],
  plain: ['tc_plain', 20, 354, 600, 110],
};
const TABLES_C_STRETCH_PINS = {
  tc_list:      { pinH:'stretch', pinV:'stretch' },
  tc_list_btn:  { pinH:'right' },
  tc_list_wrap: { pinH:'stretch' },
  tc_hdr:       { pinH:'stretch' },
  tc_plain:     { pinV:'stretch' },
};
function buildTablesCStretch(H, note){
  H.set('cw', 640); H.set('ch', 480);
  // tc_list: 4 columns fixed 20 / fixed 30 / stretch / fixed 64, no header, ScrollY, 5 rows fixed at 24.
  const [ln, lx, ly, lw, lh] = TABLES_C_STRETCH.list;
  const list = waveMake(H, note, 'Table', lx, ly, { name:ln, w:lw, h:lh });
  if(list){
    list.columns = ['A', 'B', 'C', 'D'];
    list.columnConfig = [TC_FIXED(20), TC_FIXED(30), Object.assign({}, TC_STRETCH), TC_FIXED(64)];
    list.headersRow = false;
    list.tableFlags = Object.assign({}, list.tableFlags, { ScrollY:true });
    list.rowHeights = [24, 24, 24, 24, 24];
    H.resizeTable(list, 5, 4);                       // grows to 5 x 4 and re-flows the cells
    for(let r = 0; r < 5; r++){
      tcCellMake(H, note, ln, r, 0, 'ColorButton',  2, 4, { name:'tc_list_r'+r+'c0', w:16, h:16 });
      tcCellMake(H, note, ln, r, 1, 'Text',         4, 4, { name:'tc_list_r'+r+'c1', w:22, label:String(r+1) });
      tcCellMake(H, note, ln, r, 2, 'Text',         4, 4, { name:'tc_list_r'+r+'c2', w:120, label:'Region '+(r+1) });
      tcCellMake(H, note, ln, r, 3, 'TextDisabled', 4, 4, { name:'tc_list_r'+r+'c3', w:56, label:'00:0'+r });
    }
    tcCellMake(H, note, ln, 0, 2, 'Button',      380, 2, { name:'tc_list_btn',  w:70, h:20, label:'Go' });
    tcCellMake(H, note, ln, 1, 2, 'TextWrapped', 130, 4, { name:'tc_list_wrap', w:200, h:16, label:'A longer name that wraps' });
  }
  // tc_hdr: 3 columns, header row, ScrollY, rows flexible.
  const [hn, hx, hy, hw, hh] = TABLES_C_STRETCH.hdr;
  const hdr = waveMake(H, note, 'Table', hx, hy, { name:hn, w:hw, h:hh });
  if(hdr){
    hdr.headersRow = true;
    hdr.tableFlags = Object.assign({}, hdr.tableFlags, { ScrollY:true });
    H.resizeTable(hdr, 3);
  }
  // tc_plain: no ScrollY, rows flexible.
  const [pn, px, py, pw, ph] = TABLES_C_STRETCH.plain;
  const plain = waveMake(H, note, 'Table', px, py, { name:pn, w:pw, h:ph });
  if(plain) H.resizeTable(plain, 3);
  withAdaptive(H, TABLES_C_STRETCH_PINS, { windowResize:{ minW:480, minH:320 } }, note);
}

// tables-c.style: [name, x, y, w, h]. Fixed window, no `windowResize` key.
const TABLES_C_STYLE = [
  ['tc_pad',     20,  20, 300, 110],
  ['tc_bg',     330,  20, 290, 110],
  ['tc_hl',      20, 140, 300, 130],
  ['tc_nofill', 330, 140, 290, 130],
];
const TC_ROW_BG = ['#ffe0e0', null, '#e0e8ff'];       // rowBg on rows 0 and 2 of tc_bg
// mode: 'values'   — the 2.1.0 values (tables-c.style);
//       'absent'   — no new property set anywhere (G5 tables-c reference);
//       'explicit' — every new property set to its default: cellPadding [4,2], rowBg [],
//                    highlightRows [], rowsFill true on every table; highlightColor and
//                    styleFramePadding left out (they have no default / are nullable).
function buildTablesCStyle(H, note, mode){
  H.set('cw', 640); H.set('ch', 480);
  for(const [name, x, y, w, h] of TABLES_C_STYLE){
    const t = waveMake(H, note, 'Table', x, y, { name, w, h });
    if(!t) continue;
    if(name === 'tc_hl'){
      t.tableFlags = Object.assign({}, t.tableFlags, { ScrollY:true });
      t.scrollRows = 10;
      t.rowCount = 5;
    }
    if(name === 'tc_nofill'){
      t.tableFlags = Object.assign({}, t.tableFlags, { ScrollY:true });
      t.rowHeights = [24, 24, 24];
    }
    if(mode === 'values'){
      if(name === 'tc_pad') t.cellPadding = [4, 4];
      if(name === 'tc_bg') t.rowBg = TC_ROW_BG.slice();
      if(name === 'tc_hl'){ t.highlightColor = '#F1F1F1'; t.highlightRows = [1, 3]; }
      if(name === 'tc_nofill') t.rowsFill = false;
    } else if(mode === 'explicit'){
      t.cellPadding = [4, 2];
      t.rowBg = [];
      t.highlightRows = [];
      t.rowsFill = true;
    }
    H.resizeTable(t, name === 'tc_hl' ? 5 : 3);      // re-flow the cells after the mutations
    if(name === 'tc_pad'){
      tcCellMake(H, note, name, 0, 0, 'Text', 4, 4, { name:'tc_pad_r0c0', w:60, label:'Padded' });
      tcCellMake(H, note, name, 1, 1, 'Text', 4, 4, { name:'tc_pad_r1c1', w:60, label:'Cell' });
    }
  }
  // tc_sr: a StyleRegion with styleFramePadding [8,5] holding an InputTextWithHint and a Button.
  const sr = waveMake(H, note, 'StyleRegion', 20, 290, { name:'tc_sr', w:600, h:90 });
  if(sr){
    if(mode === 'values') sr.styleFramePadding = [8, 5];
    const inp = waveMake(H, note, 'InputTextWithHint', 40, 326, { name:'tc_sr_in', w:300 });
    waveNested(note, inp, sr);
    const btn = waveMake(H, note, 'Button', 360, 326, { name:'tc_sr_btn', w:100, h:20, label:'Go' });
    waveNested(note, btn, sr);
  }
}
function buildTablesCStyleScene(H, note){ buildTablesCStyle(H, note, 'values'); }
function buildTablesCExplicit(H, note){ buildTablesCStyle(H, note, 'explicit'); }

const SCENES = [
  { name:'core',      build: buildCore },
  { name:'all-types', build: buildAllTypes },
  { name:'themes.slate',       build: themeScene('slate') },
  { name:'themes.light',       build: themeScene('light') },
  { name:'themes.gate-custom', build: themeScene(GATE_CUSTOM_THEME.id) },
  { name:'project',   build: buildProject },
  ...EXAMPLE_FILES.map(f => ({ name:'examples.'+f.replace(/\.json$/,''), build: exampleScene(f) })),
  { name:'guards',    build: buildGuards },
  // v3 — after every v2 scene (B02 2.1). Names start with `themes.`, so `--scene themes`
  // selects them with the others.
  { name:'themes.gate-alpha',        build: customThemeScene(GATE_ALPHA_THEME) },
  { name:'themes.gate-alpha-opaque', build: customThemeScene(GATE_ALPHA_OPAQUE_THEME) },
  // v4 — after every v3 scene (B03 3.1). `--scene wave-a` selects both.
  { name:'wave-a',                   build: buildWaveA },
  { name:'wave-a.explicit-defaults', build: buildWaveAExplicit },
  // v5 — after every v4 scene (ADR-005 X1.0).
  { name:'text-metrics',             build: buildTextMetrics },
  // v6 — after every v5 scene (B05 5.1). `--scene wave-b` selects both.
  { name:'wave-b',                   build: buildWaveB },
  { name:'wave-b.explicit-defaults', build: buildWaveBExplicit },
  // v7 — after every v6 scene (B06 6.1). `--scene tables-b` selects both.
  { name:'tables-b',                   build: buildTablesB_ },
  { name:'tables-b.explicit-defaults', build: buildTablesBExplicit },
  // v8 — after every v7 scene (B07 7.1). `--scene menus` selects all three.
  { name:'menus',                   build: buildMenusScene(MENUS_WITH_INVALID) },
  { name:'menus.themed',            build: buildMenusScene(MENUS_WITH_INVALID, 'slate') },
  { name:'menus.explicit-defaults', build: buildMenusScene(menusExplicitDefaults(MENUS_FIXTURE)) },
  // v9 — after every v8 scene (B07 7.3, ADR-007 M11). `--scene themes` picks up the two
  // themes.* scenes by prefix; `--scene menus` picks up the third.
  { name:'themes.slate-title',                     build: buildSlateTitleScene(true) },
  { name:'themes.slate-title.explicit-default',    build: buildSlateTitleScene(false) },
  { name:'menus.themed-title',                     build: buildMenusThemedTitleScene() },
  // v10 — after every v9 scene (B11)
  { name:'arcs', build: buildArcs },
  // v11 — after every v10 scene (A01, ADR-009 AD11). `--scene adaptive` selects all ten.
  { name:'adaptive.base',                    build: adaptiveScene('A', null,                   null) },
  { name:'adaptive.inert',                   build: adaptiveScene('A', 'move+stretch',         null) },
  { name:'adaptive.move',                    build: adaptiveScene('A', 'move',                 {}) },
  { name:'adaptive.move.explicit-defaults',  build: adaptiveScene('A', 'move+explicit',        {minW:640, minH:440, maxW:0, maxH:0}) },
  { name:'adaptive.limits',                  build: adaptiveScene('A', 'move',                 {minW:520, minH:380, maxW:1200, maxH:900}) },
  { name:'adaptive.stretch',                 build: adaptiveScene('A', 'move+stretch',         {}) },
  { name:'adaptive.nested',                  build: buildAdaptiveNested },
  { name:'adaptive.primitives',              build: buildAdaptivePrimitives },
  { name:'adaptive.menus',                   build: buildAdaptiveMenus },
  { name:'adaptive.invalid',                 build: buildAdaptiveInvalid },
  // v12 — after every v11 scene (A07.1). `--scene tables-c` selects all three.
  { name:'tables-c.stretch',                 build: buildTablesCStretch },
  { name:'tables-c.style',                   build: buildTablesCStyleScene },
  { name:'tables-c.explicit-defaults',       build: buildTablesCExplicit },
];
const G5_SCENE = 'themes.gate-alpha-opaque', G5_REFERENCE = 'themes.gate-custom';
const G5W_SCENE = 'wave-a.explicit-defaults';
const G5W2_SCENE = 'wave-b.explicit-defaults';
const G5T_SCENE = 'tables-b.explicit-defaults';
const G5M_SCENE = 'menus.explicit-defaults';
const G5TT_SCENE = 'themes.slate-title.explicit-default';
const G5AD_REFERENCE = 'adaptive.move', G5AD_SCENE = 'adaptive.move.explicit-defaults';   // v11 — G5 adaptive
const ADAPTIVE_INERT_SCENE = 'adaptive.inert', ADAPTIVE_BASE_SCENE = 'adaptive.base';     // v11 — adaptive inert
const G5TC_SCENE = 'tables-c.explicit-defaults';                                          // v12 — G5 tables-c
const CHECKS = [ { name:'theme-library-separation', run: runLibrarySeparation } ];
// Cross-scene checks: listed by --list, not selectable; each runs with its scene.
const CROSS_CHECKS = [ ['G5 alpha-255', G5_SCENE], ['G5 wave-a', G5W_SCENE], ['G5 wave-b', G5W2_SCENE], ['G5 tables-b', G5T_SCENE], ['G5 menus', G5M_SCENE], ['G5 title', G5TT_SCENE], ['G5 adaptive', G5AD_SCENE], ['adaptive inert', ADAPTIVE_INERT_SCENE], ['G5 tables-c', G5TC_SCENE] ];

// ============================================================================
// Running
// ============================================================================

function normSeed(s){
  const map = new Map();
  return s.replace(/"(id|[A-Za-z0-9_]*[Ii]d)"\s*:\s*"([^"]*)"/g, (m, key, val) => {
    if(!map.has(val)) map.set(val, '<ID'+(map.size+1)+'>');
    return '"'+key+'":"'+map.get(val)+'"';
  });
}

function closeWindow(w){ try{ w.close(); }catch(_){} }

// One scene in a fresh jsdom instance: build, export twice; reset, rebuild, export;
// then the round-trip on the rebuilt state.
function runScene(htmlPath, scene){
  const res = { name:scene.name, notes:[], problems:[], imgui:null, seed:null, file:null,
                stable:true, rt:null, error:null };
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H, errs } = tool;
    const note = t => { if(!res.notes.includes(t)) res.notes.push(t); };
    const build = () => {
      H.reset();
      H.pinProblems().forEach(p => note('reset could not pin '+p));
      scene.build(H, note);
    };
    build();
    const i1 = H.genImGui(), s1 = H.genSeed();
    const i1b = H.genImGui(), s1b = H.genSeed();
    const f1 = H.saveText();                                   // v11: the file channel
    if(i1!==i1b || s1!==s1b){ res.stable=false; res.problems.push('NON-DETERMINISTIC '+scene.name+' (same state generated twice differs)'); }
    build();
    const i2 = H.genImGui(), s2 = H.genSeed();
    if(i1!==i2 || normSeed(s1)!==normSeed(s2)){ res.stable=false; res.problems.push('NON-DETERMINISTIC '+scene.name+' (rebuild after reset differs — reset() leaks state?)'); }
    const f2 = H.saveText();
    if(normSeed(f1)!==normSeed(f2)){ res.stable=false; res.problems.push('NON-DETERMINISTIC '+scene.name+' (rebuild after reset differs (file) — reset() leaks state?)'); }
    res.imgui = i1; res.seed = s1; res.file = f1;
    // G3 round-trip: Save -> fresh reset -> Load -> genImGui == pre-round-trip export.
    const saved = H.saveText();
    H.reset();
    const loaded = H.loadText(saved);
    if(!loaded.ok){
      res.rt = { ok:false, reason:'loader rejected the saved project'+(loaded.reason?': '+loaded.reason.replace(/\s+/g,' ').trim():'') };
    } else {
      const post = H.genImGui();
      if(post===i2) res.rt = { ok:true };
      else {
        const d = multisetDiff(i2.split('\n'), post.split('\n'));
        res.rt = { ok:false, reason:'export differs after reload (+'+d.added.length+' −'+d.removed.length+')', diff:d };
      }
    }
    if(errs.length) res.problems.push('window errors in '+scene.name+': '+errs.join(' | '));
  } catch(e){
    if(e instanceof HarnessError) throw e;
    res.error = 'THROW '+scene.name+': '+(e&&e.stack||e);
  } finally {
    if(tool) closeWindow(tool.window);
  }
  return res;
}

function runDefaults(htmlPath){
  const tool = loadTool(htmlPath);
  try {
    const d = tool.H.defaults();
    return ['cw','ch','themeId','bgMode','projectTitle'].map(k => k+'='+JSON.stringify(d[k])).join(' ');
  } finally { closeWindow(tool.window); }
}

// v3 — ADR-003 F7 probe. Returns { ok, lines:[...], store:<raw string|null> } or
// { error } on a throw. `lines` are what gets printed under the verdict and written to
// the capture file; they say exactly what the store held.
function hexLiteral(hex){ return '0x'+hex.slice(1).toUpperCase()+'FF'; }
function countPushes(imgui, colors){
  return THEME_PUSH_SLOTS.filter(([slot,key]) =>
    imgui.includes('reaper.ImGui_Col_'+slot+'(), '+hexLiteral(colors[key])+')')).length;
}
function sameColors(a, b){
  const ka = Object.keys(a||{}).sort(), kb = Object.keys(b||{}).sort();
  return ka.length===kb.length && ka.every((k,i)=>k===kb[i] && String(a[k]).toLowerCase()===String(b[k]).toLowerCase());
}
function runLibrarySeparation(htmlPath){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const clone = o => JSON.parse(JSON.stringify(o));
    // The project file, made by the tool's own Save path: a Button under themeDef lib-x (B).
    H.reset();
    if(H.adoptProjectTheme(clone(LIB_X_B))!=='lib-x') throw new Error('adoptProjectTheme refused LIB_X_B');
    H.set('themeId', 'lib-x');
    H.create('Button', 40, 40);
    const projectText = H.saveText();
    // The probe proper, on an empty session and an empty library.
    H.reset();
    H.themeStoreClear();
    if(H.registerTheme(clone(LIB_X_A), true)!=='lib-x') throw new Error('registerCustomTheme refused LIB_X_A');
    const loaded = H.loadText(projectText);
    if(!loaded.ok) throw new Error('loader rejected the probe project'+(loaded.reason?': '+loaded.reason:''));
    if(H.registerTheme(clone(LIB_Y), true)!=='lib-y') throw new Error('registerCustomTheme refused LIB_Y');
    const raw = H.themeStoreRead();
    const imgui = H.genImGui();
    const lines = [];
    let stored = null, storeProblem = null;
    try {
      const arr = raw==null ? null : JSON.parse(raw);
      if(!Array.isArray(arr)) storeProblem = raw==null ? 'store empty (key absent)' : 'store is not an array';
      else {
        lines.push('store ids   : '+JSON.stringify(arr.map(t=>t&&t.id)));
        stored = arr.find(t=>t&&t.id==='lib-x') || null;
        if(!stored) storeProblem = 'store has no lib-x';
      }
    } catch(e){ storeProblem = 'store is not JSON: '+e.message; }
    let holds = 'n/a';
    if(stored){
      holds = sameColors(stored.colors, LIB_X_A.colors) ? 'A (library)'
            : sameColors(stored.colors, LIB_X_B.colors) ? 'B (project copy)' : 'neither A nor B';
      lines.push('store lib-x : colours '+holds+' · label '+JSON.stringify(stored.label));
      lines.push('store lib-x colours: '+JSON.stringify(stored.colors));
    }
    if(storeProblem) lines.push('store       : '+storeProblem);
    const nb = countPushes(imgui, LIB_X_B.colors), na = countPushes(imgui, LIB_X_A.colors);
    const themeId = H.get('themeId');
    lines.push('export      : colours B '+nb+'/'+THEME_PUSH_SLOTS.length+' pushes, colours A '+na+'/'+THEME_PUSH_SLOTS.length
      +' · themeId '+JSON.stringify(themeId));
    const ok = holds==='A (library)' && nb===THEME_PUSH_SLOTS.length;
    if(!ok){
      const why = [];
      if(holds!=='A (library)') why.push('library lib-x '+(stored ? 'now holds colours '+holds : 'not readable ('+storeProblem+')'));
      if(nb!==THEME_PUSH_SLOTS.length) why.push('project exports '+nb+'/'+THEME_PUSH_SLOTS.length+' colour-B pushes');
      lines.push('reason      : '+why.join('; '));
    }
    return { ok, lines, store: raw };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW theme-library-separation: '+(e&&e.stack||e) };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}

// v3 — G5 alpha-255: themes.gate-alpha-opaque must export exactly like themes.gate-custom
// in the same build. Takes the build's results; generates the reference scene if it was
// not selected. null when the opaque scene was not selected.
function runG5(htmlPath, results){
  const opaque = results.find(r=>r.name===G5_SCENE);
  if(!opaque) return null;
  const ref = results.find(r=>r.name===G5_REFERENCE)
           || runScene(htmlPath, SCENES.find(s=>s.name===G5_REFERENCE));
  if(opaque.error || ref.error) return { ok:false, reason:'a scene threw (see its line)' };
  if(opaque.imgui===ref.imgui) return { ok:true };
  const diff = multisetDiff(ref.imgui.split('\n'), opaque.imgui.split('\n'));
  return { ok:false, reason:G5_SCENE+' vs '+G5_REFERENCE+' (+'+diff.added.length+' −'+diff.removed.length+')', diff };
}

// v4 — G5 wave-a. One fresh instance per variant: build, genImGui (part a), then
// Save -> reset -> Load and genSeed (part b). Both variants make the same creates in the
// same order, so their uid draws line up; the seeds are still compared through normSeed.
function probeWaveATreeSel(htmlPath, mode){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    buildWaveATreeSel(H, note, mode);
    const imgui = H.genImGui();
    const saved = H.saveText();
    H.reset();
    const loaded = H.loadText(saved);
    if(!loaded.ok) throw new Error('loader rejected the '+mode+' project'+(loaded.reason?': '+loaded.reason:''));
    return { imgui, seed: H.genSeed(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when wave-a.explicit-defaults was not selected.
function runG5WaveA(htmlPath, results){
  if(!results.some(r=>r.name===G5W_SCENE)) return null;
  try {
    const abs = probeWaveATreeSel(htmlPath, 'absent'), exp = probeWaveATreeSel(htmlPath, 'explicit');
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    return {
      ok: okA && okB,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      notes: abs.notes.concat(exp.notes.filter(n=>!abs.notes.includes(n))),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 wave-a: '+(e&&e.stack||e) };
  }
}

// v6 — G5 wave-b. Same pattern as probeWaveATreeSel/runG5WaveA (B03 3.1) applied to the
// wave-b TabBar+StyleRegion+Table part (B05 5.1).
function probeWaveBTabSrTable(htmlPath, mode){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    buildWaveBTabSrTable(H, note, mode);
    const imgui = H.genImGui();
    const saved = H.saveText();
    H.reset();
    const loaded = H.loadText(saved);
    if(!loaded.ok) throw new Error('loader rejected the '+mode+' project'+(loaded.reason?': '+loaded.reason:''));
    return { imgui, seed: H.genSeed(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when wave-b.explicit-defaults was not selected.
function runG5WaveB(htmlPath, results){
  if(!results.some(r=>r.name===G5W2_SCENE)) return null;
  try {
    const abs = probeWaveBTabSrTable(htmlPath, 'absent'), exp = probeWaveBTabSrTable(htmlPath, 'explicit');
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    return {
      ok: okA && okB,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      notes: abs.notes.concat(exp.notes.filter(n=>!abs.notes.includes(n))),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 wave-b: '+(e&&e.stack||e) };
  }
}

// v7 — G5 tables-b. Same pattern as probeWaveBTabSrTable/runG5WaveB (B05 5.1) applied to
// the tables-b six-table part (B06 6.1, ADR-011 G2/G4).
function probeTablesB(htmlPath, mode){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    buildTablesB(H, note, mode);
    const imgui = H.genImGui();
    const saved = H.saveText();
    H.reset();
    const loaded = H.loadText(saved);
    if(!loaded.ok) throw new Error('loader rejected the '+mode+' project'+(loaded.reason?': '+loaded.reason:''));
    return { imgui, seed: H.genSeed(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when tables-b.explicit-defaults was not selected.
function runG5TablesB(htmlPath, results){
  if(!results.some(r=>r.name===G5T_SCENE)) return null;
  try {
    const abs = probeTablesB(htmlPath, 'absent'), exp = probeTablesB(htmlPath, 'explicit');
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    return {
      ok: okA && okB,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      notes: abs.notes.concat(exp.notes.filter(n=>!abs.notes.includes(n))),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 tables-b: '+(e&&e.stack||e) };
  }
}

// v9 — G5 title (B07 7.3, ADR-007 M11). Same pattern as probeTablesB/runG5TablesB
// (B06 6.1) applied to the slate themed body with `themedTitleBar` absent vs explicit
// false, both loaded through withProjectKeys.
function probeTitle(htmlPath, keys){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    H.set('themeId', 'slate');
    buildThemeBody(H);
    const r = withProjectKeys(H, keys);
    if(r.reason) note('loader: '+r.reason.replace(/\s+/g,' ').trim());
    const imgui = H.genImGui();
    return { imgui, seed: H.genSeed(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when themes.slate-title.explicit-default was not selected.
function runG5Title(htmlPath, results){
  if(!results.some(r=>r.name===G5TT_SCENE)) return null;
  try {
    const abs = probeTitle(htmlPath, {}), exp = probeTitle(htmlPath, { themedTitleBar:false });
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    return {
      ok: okA && okB,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      notes: abs.notes.concat(exp.notes.filter(n=>!abs.notes.includes(n))),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 title: '+(e&&e.stack||e) };
  }
}

// v8 — G5 menus (B07 7.1). probeMenus builds the menus widgets on a fresh instance,
// loads the given menuBar (undefined = no key at all) through withMenuBar, and returns
// imgui + seed after the same Save -> reset -> Load cycle probeTablesB uses. Three
// parts: (a)/(b) MENUS_FIXTURE (absent-style, i.e. defaults left implicit) vs
// menusExplicitDefaults(MENUS_FIXTURE) — imgui and post-cycle seed must match: a build
// that keeps unknown properties through load would still agree here since both sides
// go through one Save/Load cycle before comparison; (c) an empty menuBar array vs no
// `menuBar` key at all — both channels must agree that an empty bar exports nothing.
function probeMenus(htmlPath, menuBar){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    buildMenusWidgets(H, note);
    const r = withMenuBar(H, menuBar);
    if(r.reason) note('loader: '+r.reason.replace(/\s+/g,' ').trim());
    return { imgui: H.genImGui(), seed: H.genSeed(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when menus.explicit-defaults was not selected.
function runG5Menus(htmlPath, results){
  if(!results.some(r=>r.name===G5M_SCENE)) return null;
  try {
    const abs = probeMenus(htmlPath, MENUS_FIXTURE), exp = probeMenus(htmlPath, menusExplicitDefaults(MENUS_FIXTURE));
    const empty = probeMenus(htmlPath, []), none = probeMenus(htmlPath, undefined);
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    const okC = empty.imgui===none.imgui && normSeed(empty.seed)===normSeed(none.seed);
    return {
      ok: okA && okB && okC,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      c: okC ? { ok:true } : { ok:false, diff: multisetDiff(
          empty.imgui.split('\n').concat(normSeed(empty.seed).split('\n')),
          none.imgui.split('\n').concat(normSeed(none.seed).split('\n'))) },
      notes: abs.notes.concat(exp.notes, empty.notes, none.notes)
        .filter((n,i,arr)=>arr.indexOf(n)===i),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 menus: '+(e&&e.stack||e) };
  }
}

// v11 — G5 adaptive and adaptive inert (A01, ADR-009 AD11).
// probeAdaptiveScene builds a named scene in a fresh instance and returns its genImGui()
// (before any cycle), then the genSeed() and the saved file after one Save -> reset -> Load
// cycle.
function probeAdaptiveScene(htmlPath, sceneName){
  const scene = SCENES.find(s => s.name === sceneName);
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    H.pinProblems().forEach(p => note('reset could not pin '+p));
    scene.build(H, note);
    const imgui = H.genImGui();
    const saved = H.saveText();
    H.reset();
    const r = H.loadText(saved);
    if(!r.ok) throw new Error('applyLoadedProject rejected the saved project'+(r.reason?': '+r.reason:''));
    return { imgui, seed: H.genSeed(), file: H.saveText(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// Support probe: does a build keep `windowResize` through Save -> Load? (Fresh instance.)
function adaptiveSupported(htmlPath){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    H.reset();
    withAdaptive(H, {}, { windowResize:{} }, () => {});
    return Object.prototype.hasOwnProperty.call(JSON.parse(H.saveText()), 'windowResize');
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when adaptive.move.explicit-defaults was not selected; { ok:true, na:true } on a build
// without adaptive support.
function runG5Adaptive(htmlPath, results){
  if(!results.some(r=>r.name===G5AD_SCENE)) return null;
  try {
    if(!adaptiveSupported(htmlPath)) return { ok:true, na:true };
    const abs = probeAdaptiveScene(htmlPath, G5AD_REFERENCE), exp = probeAdaptiveScene(htmlPath, G5AD_SCENE);
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    const okC = normSeed(abs.file)===normSeed(exp.file);
    return {
      ok: okA && okB && okC,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      c: okC ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.file).split('\n'), normSeed(exp.file).split('\n')) },
      notes: abs.notes.concat(exp.notes).filter((n,i,arr)=>arr.indexOf(n)===i),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 adaptive: '+(e&&e.stack||e) };
  }
}
// null when adaptive.inert was not selected. No N/A: it must PASS on every build.
function runAdaptiveInert(htmlPath, results){
  if(!results.some(r=>r.name===ADAPTIVE_INERT_SCENE)) return null;
  try {
    const inert = probeAdaptiveScene(htmlPath, ADAPTIVE_INERT_SCENE), base = probeAdaptiveScene(htmlPath, ADAPTIVE_BASE_SCENE);
    if(inert.imgui===base.imgui) return { ok:true };
    return { ok:false, diff: multisetDiff(base.imgui.split('\n'), inert.imgui.split('\n')) };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW adaptive inert: '+(e&&e.stack||e) };
  }
}

// v12 — G5 tables-c (A07.1). The tables-c.style body built twice in fresh instances, the new
// Table / StyleRegion properties absent vs at their defaults (= tables-c.explicit-defaults).
// Same three parts as G5 adaptive: (a) imgui before any cycle, (b) seed and (c) saved file after
// one Save -> reset -> Load cycle. No N/A: on a build that keeps unknown shape keys (2.0.0) (b)
// and (c) may FAIL, and that is reported, not hidden.
function probeTablesC(htmlPath, mode){
  let tool;
  try {
    tool = loadTool(htmlPath);
    const { H } = tool;
    const notes = [];
    const note = t => { if(!notes.includes(t)) notes.push(t); };
    H.reset();
    H.pinProblems().forEach(p => note('reset could not pin '+p));
    buildTablesCStyle(H, note, mode);
    const imgui = H.genImGui();
    const saved = H.saveText();
    H.reset();
    const r = H.loadText(saved);
    if(!r.ok) throw new Error('applyLoadedProject rejected the '+mode+' project'+(r.reason?': '+r.reason:''));
    return { imgui, seed: H.genSeed(), file: H.saveText(), notes };
  } finally {
    if(tool) closeWindow(tool.window);
  }
}
// null when tables-c.explicit-defaults was not selected.
function runG5TablesC(htmlPath, results){
  if(!results.some(r=>r.name===G5TC_SCENE)) return null;
  try {
    const abs = probeTablesC(htmlPath, 'absent'), exp = probeTablesC(htmlPath, 'explicit');
    const okA = abs.imgui===exp.imgui;
    const okB = normSeed(abs.seed)===normSeed(exp.seed);
    const okC = normSeed(abs.file)===normSeed(exp.file);
    return {
      ok: okA && okB && okC,
      a: okA ? { ok:true } : { ok:false, diff: multisetDiff(abs.imgui.split('\n'), exp.imgui.split('\n')) },
      b: okB ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.seed).split('\n'), normSeed(exp.seed).split('\n')) },
      c: okC ? { ok:true } : { ok:false, diff: multisetDiff(normSeed(abs.file).split('\n'), normSeed(exp.file).split('\n')) },
      notes: abs.notes.concat(exp.notes).filter((n,i,arr)=>arr.indexOf(n)===i),
    };
  } catch(e){
    if(e instanceof HarnessError) throw e;
    return { error: 'THROW G5 tables-c: '+(e&&e.stack||e) };
  }
}

// Multiset line diff (G7): lines only in A (removed) and only in B (added), counted
// with multiplicity, in order of first appearance. Insensitive to position, so one
// inserted line does not cascade.
function multisetDiff(a, b){
  const count = arr => { const m=new Map(); for(const l of arr) m.set(l,(m.get(l)||0)+1); return m; };
  const cb = count(b), ca = count(a);
  const removed = [], added = [];
  for(const l of a){ if(cb.get(l)>0) cb.set(l, cb.get(l)-1); else removed.push(l); }
  for(const l of b){ if(ca.get(l)>0) ca.set(l, ca.get(l)-1); else added.push(l); }
  return { removed, added };
}

// ============================================================================
// CLI
// ============================================================================
function usage(msg){
  if(msg) console.error('export_gate: '+msg);
  console.error('usage: node export_gate.js <build.html> [<after.html>] [--scene <name>]... [--full] [--list]');
  process.exit(2);
}

const argv = process.argv.slice(2);
const files = []; const sceneFilter = []; let FULL = false, LIST = false;
for(let i=0;i<argv.length;i++){
  const a = argv[i];
  if(a==='--scene'){ if(i+1>=argv.length) usage('--scene needs a name'); sceneFilter.push(argv[++i]); }
  else if(a==='--full') FULL = true;
  else if(a==='--list') LIST = true;
  else if(a.startsWith('--')) usage('unknown option '+a);
  else files.push(a);
}
if(LIST){
  SCENES.forEach(s=>console.log(s.name)); CHECKS.forEach(c=>console.log(c.name));
  console.log('# cross-scene checks (not selectable; each runs with its scene)');
  CROSS_CHECKS.forEach(([n, s])=>console.log('# '+n+'  <- '+s));
  process.exit(0);
}
if(files.length<1 || files.length>2) usage();
for(const f of files) if(!fs.existsSync(f)) usage('no such file: '+f);

const selected = sceneFilter.length
  ? SCENES.filter(s => sceneFilter.some(f => s.name===f || s.name.startsWith(f+'.')))
  : SCENES;
for(const f of sceneFilter)
  if(!SCENES.some(s => s.name===f || s.name.startsWith(f+'.')) && !CHECKS.some(c => c.name===f))
    usage('unknown scene '+f+' (try --list)');
// Checks run when no filter is given, or when named exactly.
const selectedChecks = sceneFilter.length ? CHECKS.filter(c => sceneFilter.includes(c.name)) : CHECKS;
if(selected.some(s=>s.name.startsWith('examples.')) && !fs.existsSync(FIXTURE_DIR))
  usage('fixtures folder missing: '+FIXTURE_DIR);

const CAP = 80;
function printLines(sign, lines, indent){
  const shown = FULL ? lines : lines.slice(0, CAP);
  for(const l of shown) console.log(indent+sign+' '+l);
  if(shown.length<lines.length) console.log(indent+'  ... '+(lines.length-shown.length)+' more (--full)');
}
function printDiff(d, indent){
  printLines('−', d.removed, indent);
  printLines('+', d.added, indent);
}
function rtText(r){ return r ? (r.ok ? 'PASS' : 'FAIL') : '—'; }

function runAll(htmlPath){
  const out = [];
  for(const s of selected) out.push(runScene(htmlPath, s));
  return out;
}

// v3 — reporting for G5 alpha-255 and the checks. `gated` = this is the build under test.
function printG5(g, gated){
  if(!g) return;
  if(g.ok){ console.log((gated?'':'    before: ')+'G5 alpha-255 IDENTICAL  ('+G5_SCENE+' vs '+G5_REFERENCE+')'); return; }
  console.log((gated?'':'    before: ')+'G5 alpha-255 MISMATCH — '+g.reason
    +(gated?'':' (pre-existing in the before build; not gated)'));
  if(g.diff) printDiff(g.diff, '      ');
  if(gated) raise(3);
}
// v4 — G5 wave-a. `gated` as above. `sameAsGated`: the before build failed in exactly
// the same way as the build under test, so its detail is not repeated.
function printG5WaveA(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 wave-a THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 wave-a '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit defaults: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5WaveA(x, y){
  if(!x || !y || x.error || y.error) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b]);
  return k(x)===k(y);
}
// v6 — G5 wave-b reporting. Same shape as printG5WaveA/sameG5WaveA (B03 3.1).
function printG5WaveB(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 wave-b THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 wave-b '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit defaults: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5WaveB(x, y){
  if(!x || !y || x.error || y.error) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b]);
  return k(x)===k(y);
}
// v7 — G5 tables-b reporting. Same shape as printG5WaveB/sameG5WaveB (B05 5.1).
function printG5TablesB(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 tables-b THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 tables-b '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit defaults: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5TablesB(x, y){
  if(!x || !y || x.error || y.error) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b]);
  return k(x)===k(y);
}
// v9 — G5 title reporting. Same shape as printG5TablesB/sameG5TablesB (B06 6.1).
function printG5Title(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 title THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 title '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit false: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5Title(x, y){
  if(!x || !y || x.error || y.error) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b]);
  return k(x)===k(y);
}
// v8 — G5 menus reporting. Same shape as printG5TablesB/sameG5TablesB (B06 6.1), with a
// third part: (c) an empty menuBar array vs no key at all.
function printG5Menus(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 menus THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 menus '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit defaults: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+' · (c) empty bar vs none '+part(g.c)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
    if(!g.c.ok){ console.log('    (c) empty vs none:'); printDiff(g.c.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5Menus(x, y){
  if(!x || !y || x.error || y.error) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b, g.c]);
  return k(x)===k(y);
}
// v11 — G5 adaptive reporting. Same shape as printG5Menus/sameG5Menus (B07 7.1), with part
// (c) the saved file after save→load, and an N/A for a build without adaptive support (no
// failure, no exit change).
function printG5Adaptive(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 adaptive THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  if(g.na){ console.log(pre+'G5 adaptive N/A (build has no adaptive support: windowResize dropped on load)'); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 adaptive '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit defaults: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+' · (c) file after save→load '+part(g.c)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
    if(!g.c.ok){ console.log('    (c) file:');  printDiff(g.c.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5Adaptive(x, y){
  if(!x || !y || x.error || y.error || x.na || y.na) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b, g.c]);
  return k(x)===k(y);
}
// v11 — adaptive inert reporting: adaptive.inert's imgui must equal adaptive.base's.
function printAdaptiveInert(g, gated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'adaptive inert THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  console.log(pre+'adaptive inert '+(g.ok?'PASS':'FAIL')+'  (imgui of '+ADAPTIVE_INERT_SCENE+' vs '+ADAPTIVE_BASE_SCENE+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  if(!g.ok){
    console.log('    imgui (− '+ADAPTIVE_BASE_SCENE+', + '+ADAPTIVE_INERT_SCENE+'):');
    printDiff(g.diff, '      ');
    if(gated) raise(3);
  }
}
// v12 — G5 tables-c reporting. Same shape as printG5Adaptive/sameG5Adaptive (A01), no N/A.
function printG5TablesC(g, gated, sameAsGated){
  if(!g) return;
  const pre = gated ? '' : '    before: ';
  if(g.error){ console.log(pre+'G5 tables-c THROW'); console.log('    '+g.error.split('\n').join('\n    ')); raise(3); return; }
  const part = p => p.ok ? 'IDENTICAL' : 'DIFFERS (+'+p.diff.added.length+' −'+p.diff.removed.length+')';
  console.log(pre+'G5 tables-c '+(g.ok?'PASS':'FAIL')+'  (absent vs explicit defaults: (a) imgui '+part(g.a)
    +' · (b) seed after save→load '+part(g.b)+' · (c) file after save→load '+part(g.c)+')'
    +(!gated && !g.ok ? ' (pre-existing in the before build; not gated)' : ''));
  g.notes.forEach(n => console.log('    '+(gated?'':'before ')+'note: '+n));
  if(!g.ok && !sameAsGated){
    if(!g.a.ok){ console.log('    (a) imgui:'); printDiff(g.a.diff, '      '); }
    if(!g.b.ok){ console.log('    (b) seed:');  printDiff(g.b.diff, '      '); }
    if(!g.c.ok){ console.log('    (c) file:');  printDiff(g.c.diff, '      '); }
  } else if(!g.ok) console.log('    before: same result as the after build');
  if(gated && !g.ok) raise(3);
}
function sameG5TablesC(x, y){
  if(!x || !y || x.error || y.error) return false;
  const k = g => JSON.stringify([g.ok, g.a, g.b, g.c]);
  return k(x)===k(y);
}
function checkText(c){ return c.error ? 'THROW' : (c.ok ? 'PASS' : 'FAIL'); }
function checkFileText(name, c){
  if(c.error) return name+' THROW\n'+c.error+'\n';
  return name+' '+checkText(c)+'\n'+c.lines.join('\n')+'\nraw store:\n'+(c.store==null?'(absent)':c.store)+'\n';
}

let exitCode = 0;
const raise = c => { if(c>exitCode) exitCode = c; };

try {
  if(files.length===1){
    // ── capture ──
    const a = files[0];
    const stem = path.basename(a).replace(/\.html?$/i,'');
    const dir = path.join(process.cwd(),'golden',stem);
    fs.mkdirSync(dir,{recursive:true});
    const defs = runDefaults(a);
    fs.writeFileSync(path.join(dir,'defaults.txt'), defs+'\n');
    console.log('── export gate v12 · capture ──');
    console.log('file     : '+path.basename(a));
    console.log('goldens  : golden/'+stem+'/<scene>.{imgui,seed,file}');
    console.log('defaults : '+defs);
    const R = runAll(a);
    for(const r of R){
      if(r.error){ console.log(r.name.padEnd(36)+' THROW'); console.log('    '+r.error.split('\n').join('\n    ')); raise(3); continue; }
      fs.writeFileSync(path.join(dir,r.name+'.imgui'), r.imgui);
      fs.writeFileSync(path.join(dir,r.name+'.seed'),  r.seed);
      fs.writeFileSync(path.join(dir,r.name+'.file'),  r.file);
      console.log(r.name.padEnd(36)+' '+(r.stable?'STABLE':'NON-DETERMINISTIC')
        +' · roundtrip '+rtText(r.rt)
        +' · bytes imgui '+Buffer.byteLength(r.imgui)+' seed '+Buffer.byteLength(r.seed)+' file '+Buffer.byteLength(r.file));
      r.notes.forEach(n => console.log('    note: '+n));
      r.problems.forEach(p => { console.log('    '+p); raise(3); });
      if(r.rt && !r.rt.ok){
        console.log('    ROUNDTRIP MISMATCH '+r.name+' — '+r.rt.reason);
        if(r.rt.diff) printDiff(r.rt.diff, '      ');
        raise(3);
      }
    }
    printG5(runG5(a, R), true);
    printG5WaveA(runG5WaveA(a, R), true, false);
    printG5WaveB(runG5WaveB(a, R), true, false);
    printG5TablesB(runG5TablesB(a, R), true, false);
    printG5Menus(runG5Menus(a, R), true, false);
    printG5Title(runG5Title(a, R), true, false);
    printG5Adaptive(runG5Adaptive(a, R), true, false);
    printAdaptiveInert(runAdaptiveInert(a, R), true);
    printG5TablesC(runG5TablesC(a, R), true, false);
    for(const ck of selectedChecks){
      const c = ck.run(a);
      fs.writeFileSync(path.join(dir, ck.name+'.txt'), checkFileText(ck.name, c));
      console.log(ck.name.padEnd(36)+' '+checkText(c));
      if(c.error){ console.log('    '+c.error.split('\n').join('\n    ')); raise(3); continue; }
      c.lines.forEach(l => console.log('    '+l));
      if(!c.ok) raise(3);
    }
  } else {
    // ── compare ──
    const [a, b] = files;
    console.log('── export gate v12 · compare ──');
    console.log('before: '+path.basename(a)+' | after: '+path.basename(b));
    const da = runDefaults(a), db = runDefaults(b);
    if(da===db) console.log('defaults'.padEnd(36)+' IDENTICAL  ('+da+')');
    else {
      console.log('defaults'.padEnd(36)+' CHANGED');
      console.log('    before: '+da); console.log('    after : '+db);
      raise(1);
    }
    const A = runAll(a), B = runAll(b);
    for(let i=0;i<A.length;i++){
      const x = A[i], y = B[i];
      if(x.error || y.error){
        console.log(x.name.padEnd(36)+' THROW');
        if(x.error) console.log('    before: '+x.error.split('\n').join('\n    '));
        if(y.error) console.log('    after : '+y.error.split('\n').join('\n    '));
        raise(3); continue;
      }
      const ci = multisetDiff(x.imgui.split('\n'), y.imgui.split('\n'));
      const cs = multisetDiff(normSeed(x.seed).split('\n'), normSeed(y.seed).split('\n'));
      const sameI = x.imgui===y.imgui, sameS = normSeed(x.seed)===normSeed(y.seed);
      const cf = multisetDiff(normSeed(x.file).split('\n'), normSeed(y.file).split('\n'));
      const sameF = normSeed(x.file)===normSeed(y.file);
      const verdict = (same, d) => same ? 'IDENTICAL'
        : (d.added.length||d.removed.length ? 'CHANGED +'+d.added.length+' −'+d.removed.length
                                            : 'CHANGED (order only)');
      console.log(x.name.padEnd(36)+' imgui '+verdict(sameI,ci)+' · seed '+verdict(sameS,cs)+' · file '+verdict(sameF,cf)
        +' · roundtrip '+rtText(x.rt)+'/'+rtText(y.rt)
        +' · '+(x.stable&&y.stable?'STABLE':'NON-DETERMINISTIC'));
      const notesA = x.notes.join('\n'), notesB = y.notes.join('\n');
      if(notesA===notesB) x.notes.forEach(n => console.log('    note: '+n));
      else { x.notes.forEach(n => console.log('    note (before): '+n)); y.notes.forEach(n => console.log('    note (after) : '+n)); }
      if(!sameI){ console.log('    imgui:'); printDiff(ci, '      '); raise(1); }
      if(!sameS){ console.log('    seed:');  printDiff(cs, '      '); raise(1); }
      if(!sameF){ console.log('    file:');  printDiff(cf, '      '); raise(1); }
      x.problems.forEach(p => { console.log('    before: '+p); raise(3); });
      y.problems.forEach(p => { console.log('    after : '+p); raise(3); });
      if(x.rt && !x.rt.ok) console.log('    before: ROUNDTRIP MISMATCH '+x.name+' — '+x.rt.reason+' (pre-existing in the before build; not gated)');
      if(y.rt && !y.rt.ok){
        console.log('    ROUNDTRIP MISMATCH '+y.name+' — '+y.rt.reason);
        if(y.rt.diff) printDiff(y.rt.diff, '      ');
        raise(3);
      }
    }
    // v3 — G5 on the build under test (after); a before-build mismatch is pre-existing.
    const g5a = runG5(a, A), g5b = runG5(b, B);
    printG5(g5b, true);
    if(g5a && !g5a.ok) printG5(g5a, false);
    // v4 — G5 wave-a on the build under test; a before-build FAIL is pre-existing.
    const gwa = runG5WaveA(a, A), gwb = runG5WaveA(b, B);
    printG5WaveA(gwb, true, false);
    if(gwa && (gwa.error || !gwa.ok)) printG5WaveA(gwa, false, sameG5WaveA(gwa, gwb));
    // v6 — G5 wave-b on the build under test; a before-build FAIL is pre-existing.
    const gwa2 = runG5WaveB(a, A), gwb2 = runG5WaveB(b, B);
    printG5WaveB(gwb2, true, false);
    if(gwa2 && (gwa2.error || !gwa2.ok)) printG5WaveB(gwa2, false, sameG5WaveB(gwa2, gwb2));
    // v7 — G5 tables-b on the build under test; a before-build FAIL is pre-existing.
    const gwa3 = runG5TablesB(a, A), gwb3 = runG5TablesB(b, B);
    printG5TablesB(gwb3, true, false);
    if(gwa3 && (gwa3.error || !gwa3.ok)) printG5TablesB(gwa3, false, sameG5TablesB(gwa3, gwb3));
    // v8 — G5 menus on the build under test; a before-build FAIL is pre-existing.
    const gwa4 = runG5Menus(a, A), gwb4 = runG5Menus(b, B);
    printG5Menus(gwb4, true, false);
    if(gwa4 && (gwa4.error || !gwa4.ok)) printG5Menus(gwa4, false, sameG5Menus(gwa4, gwb4));
    // v9 — G5 title on the build under test; a before-build FAIL is pre-existing.
    const gwa5 = runG5Title(a, A), gwb5 = runG5Title(b, B);
    printG5Title(gwb5, true, false);
    if(gwa5 && (gwa5.error || !gwa5.ok)) printG5Title(gwa5, false, sameG5Title(gwa5, gwb5));
    // v11 — G5 adaptive and adaptive inert on the build under test; a before-build FAIL is
    // pre-existing. A before-build N/A is shown only when the after build supports adaptive.
    const gad1 = runG5Adaptive(a, A), gad2 = runG5Adaptive(b, B);
    printG5Adaptive(gad2, true, false);
    if(gad1 && (gad1.error || !gad1.ok)) printG5Adaptive(gad1, false, sameG5Adaptive(gad1, gad2));
    else if(gad1 && gad1.na && gad2 && !gad2.na) printG5Adaptive(gad1, false, false);
    const gin1 = runAdaptiveInert(a, A), gin2 = runAdaptiveInert(b, B);
    printAdaptiveInert(gin2, true);
    if(gin1 && (gin1.error || !gin1.ok)) printAdaptiveInert(gin1, false);
    // v12 — G5 tables-c on the build under test; a before-build FAIL is pre-existing.
    const gtc1 = runG5TablesC(a, A), gtc2 = runG5TablesC(b, B);
    printG5TablesC(gtc2, true, false);
    if(gtc1 && (gtc1.error || !gtc1.ok)) printG5TablesC(gtc1, false, sameG5TablesC(gtc1, gtc2));
    for(const ck of selectedChecks){
      const ca = ck.run(a), cb = ck.run(b);
      console.log(ck.name.padEnd(36)+' '+checkText(ca)+'/'+checkText(cb));
      if(cb.error){ console.log('    after : '+cb.error.split('\n').join('\n    ')); raise(3); }
      else { cb.lines.forEach(l => console.log('    after : '+l)); if(!cb.ok) raise(3); }
      if(ca.error){ console.log('    before: '+ca.error.split('\n').join('\n    ')); raise(3); }
      else if(!ca.ok){
        const same = !cb.error && ca.lines.join('\n')===cb.lines.join('\n');
        if(same) console.log('    before: same result (pre-existing in the before build; not gated)');
        else { ca.lines.forEach(l => console.log('    before: '+l)); console.log('    before: FAIL is pre-existing in the before build; not gated'); }
      }
    }
    console.log('result: '+(exitCode===0 ? 'CLEAN — every scene identical on both channels'
      : exitCode===1 ? 'CHANGED — review the multisets: only intended lines may differ'
      : 'FAIL — round-trip mismatch, throw, non-determinism, a G5 mismatch (alpha-255 / wave-a / wave-b / tables-b / menus / title / adaptive / tables-c), adaptive inert or a failed check (exit 3)'));
  }
} catch(e){
  if(e instanceof HarnessError){ console.error(e.message); process.exit(3); }
  throw e;
}
process.exit(exitCode);

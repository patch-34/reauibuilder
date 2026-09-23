# Changelog

All notable changes to ReaUI Builder are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
Versions correspond to the release tags on GitHub (tag name = build number,
e.g. `1.0.68`).

## [Unreleased]

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

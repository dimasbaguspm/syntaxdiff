## [1.5.13](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.12...syntaxdiff_v1.5.13) (2026-08-22)

## [1.5.12](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.11...syntaxdiff_v1.5.12) (2026-08-22)

## [1.5.11](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.10...syntaxdiff_v1.5.11) (2026-08-22)

## [1.5.10](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.9...syntaxdiff_v1.5.10) (2026-08-22)

# Changelog

All notable changes to SyntaxDiff are captured in this file, shaped by `semantic-release` version tags.

## [1.5.9](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.8...syntaxdiff_v1.5.9) (2026-08-22)

### Features

- Mobile UX fixes: floating bottom-right diff controls FAB and mobile `min-height` removal so short diffs size to their content.

## [1.5.8](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.7...syntaxdiff_v1.5.8) (2026-08-22)

### Features

- Unify all formatting on Prettier in an async Web Worker with browser-worker hardening.

## [1.5.7](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.6...syntaxdiff_v1.5.7) (2026-08-22)

### Features

- Frontend UX improvements FE #1–#7: gutter tone, language icon, addition/deletion counts, change navigation, and resizable panes.

## [1.5.6](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.5...syntaxdiff_v1.5.6) (2026-08-21)

### Features

- Frontend UX overhaul FE #6–#12: vertical divider, full-height gutter, intent markers, JS/TS/Go/PHP adapters, and shared input components.

### Code Refactoring

- Modular repository pattern + provider decomposition (#6).

## [1.5.5](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.4...syntaxdiff_v1.5.5) (2026-08-21)

### Features

- Material language icons + diff-page polish: icons, full-width highlight, opaque & full-height gutter.

### Tests

- Switch test environment to happy-dom for a real localStorage implementation.

## [1.5.4](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.3...syntaxdiff_v1.5.4) (2026-08-21)

### Features

- Allow renaming Source A/B with live diff + history labels.

## [1.5.3](https://github.com/dimasbaguspm/syntaxdiff/compare/syntaxdiff_v1.5.2...syntaxdiff_v1.5.3) (2026-08-21)

### Features

- Engine: CSV/SQL parser hardening.
- Diff horizontal scroll, aligned line numbers, and deduplicated analytics.

## 1.2.0 - 2026-08-16

### Features

- Bottombar: version badge beside the GitHub stars; mobile GitHub shows star + count only
- Mobile history shows icon + count
- Bottombar entrypoints use the shared Tooltip component

## 1.1.0 - 2026-08-16

### Features

- App version badge (`VITE_APP_VERSION`, fallback `Nightly`) wired into track/log/trace
- Searchable changelog modal rendering `CHANGELOG.md`
- Split-pane grab handle; mobile orientation-aware drag
- Windowed diff rendering for smooth scrolling
- Semantic-release versioned releases (`syntaxdiff_v<ver>` tags)

## 1.0.0 - 2026-08-16

### Features

- Privacy-first, client-side, syntax-aware diff for JSON, YAML, SQL, TOML, and XML
- Structure-aware diffing: auto-detect the language, format, and recursively sort keys
- Split (side-by-side) and unified diff views with a draggable split-pane handle
- Local diff history stored in IndexedDB (search, delete, clear)
- Language options incl. SQL dialect, key sorting, and XML prettify
- Privacy-first telemetry (OTLP logs/traces + Umami); no content leaves the browser
- SEO / social / AI-agent metadata (Open Graph, JSON-LD, `llms.txt`, sitemap)
- Windowed diff rendering for smooth scrolling on large inputs

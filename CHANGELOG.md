# Changelog

All notable changes to SyntaxDiff are captured in this file, shaped by `semantic-release` version tags.

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

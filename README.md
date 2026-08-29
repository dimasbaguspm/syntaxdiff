# SyntaxDiff

<p align="center">
  <img src="public/syntaxdiff.png" alt="SyntaxDiff logo" width="128" />
</p>

Privacy-first, client-side syntax-aware diff for 36 languages. Paste two snippets, get a Git-style diff of the structure, not the bytes. Nothing leaves your machine.

**Motto:** Diff structure, not bytes.

## Purpose

Answer one question quickly: did the structure change? Paste, compare, and trust the result without worrying about whitespace, ordering, or leaking data.

## Problem

Plain text diffs show false positives. A JSON object with reordered keys or SQL with different casing appears as a change when nothing structural changed. Those false positives waste review time and hide real changes, while sending snippets to a server risks privacy and heavy parsers can freeze the UI.

## Solution

Parse each input, canonicalize to a stable form, then diff the canonical text. JSON re-serializes, SQL formats and uppercases keywords, CSV normalizes and optionally aligns, but the pipeline is the same: `parse -> canonicalize -> line diff -> render`. Array order is always preserved. The work runs in a Web Worker with a sync fallback, so large inputs stay responsive. Results render as split or unified views and are saved locally.

See `docs/ENGINEERING_SPEC.md` for the full spec, architecture, and sequence diagrams.

## Features

- **Smart diff:** auto-detect language, format and normalize before diffing. Key order and formatting never cause false positives. Array order is preserved.
- **Import files:** drag a file onto either pane or use the upload button. Language auto-selects from the extension.
- **Split or unified:** side-by-side or inline. Drag the divider to resize. Divider blends with the panel and narrows on desktop.
- **Fast:** parsing and diffing run in a Web Worker, off the main thread.
- **Local history:** past diffs saved in IndexedDB (search, delete, clear).
- **Installable PWA:** offline-ready, prompts when a new version is available.
- **Privacy-first:** no backend. Optional telemetry never carries file contents.

## Languages

36 adapters. Plain text is the fallback.

| Group | Languages |
|-------|-----------|
| Data | JSON, JSON5, JSONC, YAML, YML, TOML, XML, CSV, SQL |
| Code | JS, TS, Go, PHP, HTML, CSS, Less, SCSS, Markdown, MDX, Vue, Angular, Svelte, Astro, GraphQL, Gherkin, Handlebars, Pug, Go-template, Glimmer, Nginx, Sh |
| Fallback | Plain text (ignore case / ignore whitespace) |

Formatter-disabled (whitespace-only) : Ruby, Rust, Kotlin, Java, Glimmer.

## Stack

React 19 + TypeScript, Vite, Tailwind v4, Zustand, Dexie, `diff` (jsdiff), OpenTelemetry + Umami, PWA (vite-plugin-pwa)

Tooling: pnpm, Node 24, devenv (Nix), oxlint, oxfmt, vitest, Husky

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:5173
```

Requires `devenv` (see `devenv.nix`) or Node 24 + pnpm 10.

## Scripts

| Script | What |
|--------|------|
| `pnpm dev` | dev server |
| `pnpm build` | typecheck + production build |
| `pnpm preview` | serve the production build |
| `pnpm test` | unit tests (vitest) |
| `pnpm lint` | oxlint |
| `pnpm fmt` / `fmt:check` | format / verify |
| `pnpm typecheck` | tsc --noEmit |

Pre-commit hook (Husky): `oxfmt --check`, `oxlint`, `tsc -b --noEmit`.

## Config (build-time env)

| Env | Purpose |
|-----|---------|
| `VITE_OTEL_COLLECTOR_URL` | OTLP endpoint for logs and traces |
| `VITE_UMAMI_WEBSITE_ID` | Umami site id (lazy-loaded) |
| `VITE_APP_VERSION` | version tag in telemetry and badge (fallback `Nightly`) |
| `VITE_SITE_URL` | canonical site URL |

## Layout

```
src/core/            app shell, store, db, worker
src/modules/engine/  pure diff engine (adapters -> canonical -> line diff)
src/modules/compare/ panes, file import, language select, options sheet
src/modules/diff/    diff view, windowing, change groups
src/modules/history/ history drawer
src/modules/analytics/ otel + umami
src/components/      UI primitives, layout, inputs, modal/sheet/drawer
src/pages/           compare + diff pages
src/hooks/           app boot, theme, etc.
```

## Deploy

Single GitHub Actions workflow `CI` on `push[main]`, `pull_request`, `release[published]`:

```
verify -> build -> deploy
```

- **Verify:** install, format check, lint, typecheck, build, tests. Required for protected `main`.
- **Build:** builds and pushes `ghcr.io/dimasbaguspm/syntaxdiff:latest` on push to `main`. On a published GitHub Release it also tags `syntaxdiff_v<ver>` and `<ver>`.
- **Deploy:** posts to `DEPLOY_WEBHOOK_URL` when set. Skipped on PRs.

Docker: `node:24-alpine` build → `nginx:1.27-alpine` serve, SPA fallback.

## Docs

- `docs/PRD.md` — product requirements
- `docs/ENGINEERING_SPEC.md` — purpose, problem, solution, approaches, architecture, sequences, release plan

# SyntaxDiff

<p align="center">
  <img src="public/syntaxdiff.svg" alt="SyntaxDiff logo" width="128" />
</p>

Privacy-first, client-side **syntax-aware diff**. Paste two JSON / YAML / SQL /
TOML / XML / plain-text snippets and get a Git-style diff of the
**structure** — ignoring formatting and key order. Nothing leaves your machine.

## Features

- **Paste → smart diff** — two full-height panes, then a read-only `/diff/:id` page in **split (side-by-side)** or **unified** view
- **Structure-aware** — auto-detect the language, then format + recursively sort keys before diffing, so key order and formatting never cause false positives (array order is always preserved)
- **Fast** — parsing + diffing run in a **Web Worker**, off the main thread
- **Local history** — past diffs in IndexedDB (search / delete / clear)
- **Privacy-first** — zero network by default; optional telemetry carries no file contents

## Supported languages

| Language | Pre-processing (on by default) |
|----------|--------------------------------|
| JSON     | Prettify, alphabetize keys (recursive) |
| YAML     | Alphabetize keys (recursive) |
| SQL      | Format + uppercase keywords; choose a dialect (MySQL, Postgres, …) |
| TOML     | Alphabetize keys (recursive) |
| XML      | Prettify (multi-line), alphabetize elements/attrs (recursive) |
| Plain text | Fallback for anything else |

## Stack

React + TypeScript · Vite · Tailwind v4 · Zustand · Dexie · jsdiff (custom diff renderer) ·
OpenTelemetry (OTLP logs + traces) · Umami
Tooling: pnpm · Node 24 · oxlint · oxfmt · vitest

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:5173
```

## Scripts

| Script           | What |
|------------------|------|
| `pnpm dev`       | dev server |
| `pnpm build`     | typecheck + production build |
| `pnpm preview`   | serve the production build |
| `pnpm test`      | unit tests (vitest) |
| `pnpm lint`      | oxlint |
| `pnpm fmt`       | oxfmt |
| `pnpm fmt:check` | verify formatting |
| `pnpm typecheck` | `tsc --noEmit` |

## Config (optional build-time env)

| Env                          | Purpose                          |
|------------------------------|----------------------------------|
| `VITE_OTEL_COLLECTOR_URL`    | OTLP endpoint for logs + traces  |
| `VITE_UMAMI_WEBSITE_ID`      | Umami site id (tracker lazy-loaded) |
| `VITE_APP_VERSION`           | version tag in telemetry / footer |

## Layout

```
src/engine/       pure diff engine (language adapters → canonicalize → line-diff)
src/worker/       web worker + promise client
src/lib/analytics OTEL logging/tracing + Umami trackEvent
src/components/   UI primitives + bottom bar + history drawer
src/pages/        compare + diff pages
src/db.ts         IndexedDB (Dexie) history
```

## Deploy

Pushing to `main` runs GitHub Actions: builds a
`ghcr.io/dimasbaguspm/syntaxdiff` image (`<sha>` + `latest`) and fires the
`DEPLOY_WEBHOOK_URL` webhook when set.

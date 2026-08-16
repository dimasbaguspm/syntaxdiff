# SyntaxDiff

<p align="center">
  <img src="public/syntaxdiff.png" alt="SyntaxDiff logo" width="128" />
</p>

Privacy-first, client-side **syntax-aware diff** for JSON, YAML, SQL, TOML, and XML. Paste two snippets, get a Git-style diff of the **structure**, not the bytes. Nothing leaves your machine.

**Motto:** Diff structure, not bytes.

## Features

- **Smart diff** — auto-detect the language, format, and recursively sort keys before diffing, so key order and formatting never cause false positives. Array order is always preserved.
- **Import files** — drag a file onto either pane or use the upload button; the language auto-selects from the extension.
- **Split or unified** — view the result side-by-side or inline; drag the divider to resize.
- **Fast** — parsing and diffing run in a **Web Worker**, off the main thread.
- **Local history** — past diffs saved in IndexedDB (search, delete, clear).
- **Installable PWA** — offline-ready, and prompts you when a new version is available.
- **Privacy-first** — no backend; optional telemetry never carries file contents.

## Languages

| Language | Pre-processing (on by default) |
|----------|--------------------------------|
| JSON | Prettify, alphabetize keys (recursive) |
| YAML | Alphabetize keys (recursive) |
| SQL | Format + uppercase keywords; pick a dialect |
| CSV | Normalize quotes + trim cells; optional sort (header kept) |
| TOML | Alphabetize keys (recursive) |
| XML | Prettify (multi-line), alphabetize elements/attrs |
| Plain text | Fallback for anything else |

## Stack

React + TypeScript · Vite · Tailwind v4 · Zustand · Dexie · jsdiff (custom renderer) · OpenTelemetry · Umami · PWA (vite-plugin-pwa)
Tooling: pnpm · Node 24 · oxlint · oxfmt · vitest

## Develop

```bash
pnpm install
pnpm dev      # http://localhost:5173
```

## Scripts

| Script | What |
|--------|------|
| `pnpm dev` | dev server |
| `pnpm build` | typecheck + production build |
| `pnpm preview` | serve the production build |
| `pnpm test` | unit tests (vitest) |
| `pnpm lint` | oxlint |
| `pnpm fmt` / `fmt:check` | format / verify |

## Config (build-time env)

| Env | Purpose |
|-----|---------|
| `VITE_OTEL_COLLECTOR_URL` | OTLP endpoint for logs + traces |
| `VITE_UMAMI_WEBSITE_ID` | Umami site id (lazy-loaded) |
| `VITE_APP_VERSION` | version tag in telemetry |

## Layout

```
src/engine/       pure diff engine (adapters -> canonicalize -> line-diff)
src/worker/       web worker + promise client
src/lib/analytics OTEL logging/tracing + Umami trackEvent
src/components/   UI primitives, bottom bar, history drawer, help
src/pages/        compare + diff pages
src/db.ts         IndexedDB (Dexie) history
```

## Deploy

Two GitHub Actions workflows on push to `main`:

- **CI** — builds a `ghcr.io/dimasbaguspm/syntaxdiff` image (`<sha>` + `latest`) and fires the `DEPLOY_WEBHOOK_URL` webhook when set.
- **Release** — `semantic-release` creates a versioned GitHub Release tagged `syntaxdiff_v<semver>` (e.g. `syntaxdiff_v1.0.0`) with auto-generated notes from Conventional Commits. Version bumps: `fix` = patch, `feat` = minor, `BREAKING` = major. Run locally with `pnpm release`.

# SyntaxDiff

<p align="center">
  <img src="public/syntaxdiff.svg" alt="SyntaxDiff logo" width="128" />
</p>

Privacy-first, client-side **syntax-aware diff**. Paste two JSON / YAML / SQL /
TOML / XML / BSON / plain-text snippets and get a Git-style diff of the
**structure** — ignoring formatting and key order. Nothing leaves your machine.

## Features

- **Compare → result** — two full-screen panes, then a read-only `/diff/:id` page
- **Schema-aware** — auto-detect language, canonicalize (keys sort, array order preserved)
- **Fast** — parsing + diffing run in a **Web Worker**
- **Local history** — past diffs in IndexedDB (search / delete / clear)
- **Dark & light** themes; zero network by default

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

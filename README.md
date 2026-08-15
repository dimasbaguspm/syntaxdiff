# SyntaxDiff

Privacy-first, fully client-side **syntax-aware diff** tool.

Diff **structure, not bytes**: paste two JSON / YAML / SQL / TOML / XML / BSON
(and plain text) snippets and get a Git-style diff that ignores formatting and
key order, showing only real changes. Everything runs in your browser — nothing
ever leaves your machine.

## Features

- Auto-detects the pasted language (with manual override)
- Language-specific canonicalization (e.g. recursive key sorting)
- Web Worker engine — no UI freezes on large payloads
- Split (side-by-side) and Unified (inline) views
- Added/removed line counts
- Zero network requests (all dependencies bundled; strict CSP)

## Stack

React + TypeScript · Vite · Zustand · `diff` (jsdiff) · `diff2html` ·
`sql-formatter` · `js-yaml` · `smol-toml` · `fast-xml-parser` · `bson`

Tooling: pnpm · Node 24 · oxlint · oxfmt · vitest

## Getting started

```bash
pnpm install
pnpm dev        # dev server
```

### Development container (mandatory workflow)

Development runs inside a **devcontainer** (Node 24 + pnpm toolchain). This repo
ships `.devcontainer/` (Dockerfile + `devcontainer.json` + `setup.sh`), managed
by the [`opencode-devcontainers`](https://github.com/athal7/opencode-devcontainers)
plugin: the plugin clones each branch and spins up an isolated container, with
the Vite dev port (5173) auto-mapped into the configured port range.

```bash
# inside a devcontainer, the toolchain is pre-wired:
pnpm install && pnpm dev
```

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Start the Vite dev server |
| `pnpm build` | Type-check + production build to `dist/` |
| `pnpm typecheck` | `tsc -b --noEmit` |
| `pnpm test` | Run vitest unit tests |
| `pnpm lint` | oxlint |
| `pnpm fmt` / `pnpm fmt:check` | oxfmt / verify formatting |

## Project layout

```
src/
  engine/        # pure, framework-free core (runs in worker + tests)
    adapters/    # one file per language (JSON, YAML, SQL, TOML, XML, BSON, Plain)
    canonical.ts # recursive canonicalization — the "structure not bytes" rule
    diff.ts      # format → line-diff pipeline
    registry.ts  # detection waterfall + adapter lookup
  worker/        # Web Worker + promise client
  components/    # UI (InputPane, TogglesPanel, DiffView)
  store.ts       # Zustand state
```

Adding a language = implement `LanguageAdapter` in `src/engine/adapters/` and
register it in `registry.ts`. See `docs/PRD.md` for the full design.

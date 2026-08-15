# SyntaxDiff — Product Requirements Document (v2, corrected)

> Blueprint for a **privacy-first, fully client-side** syntax-aware diff SPA.
> This revision records the decisions locked during the greenfield brainstorm
> (2026-08-15). It supersedes the original draft.

## 1. Product Overview

SyntaxDiff is a client-side Single Page Application that elevates a text
comparison tool by adding **Language Schema Support**. Instead of "dumb"
string comparison, it auto-detects the pasted language, applies
language-specific canonicalization, and diffs the **structure**, not the bytes.

**Core value proposition**
- **Diff structure, not bytes** — the defining feature. A JSON key that moved
  position is *not* a diff; a changed value *is*.
- **Privacy by default** — zero network requests. Enforced via a strict CSP
  (`connect-src 'none'`, no runtime CDN; everything bundled).
- **Fast** — parsing/diffing runs in a **Web Worker**, off the main thread.

## 2. Supported Languages (Phase 1)

| Language | Canonicalization | Toggles |
|----------|------------------|---------|
| JSON | `JSON.parse` → `JSON.stringify` | Prettify, Alphabetize keys (recursive), Minify |
| YAML | `js-yaml` load → dump | Alphabetize keys (recursive) |
| SQL | `sql-formatter` | Uppercase keywords |
| TOML | `smol-toml` parse → stringify | Alphabetize keys (recursive) |
| XML | `fast-xml-parser` parse → build | Alphabetize elements/attrs (recursive) |
| BSON | `bson` deserialize → JSON | Alphabetize keys (recursive) |
| Plain Text | identity | Ignore case, Ignore whitespace |

**Decision — no WASM.** All Phase 1 languages have mature, smaller, more
testable pure-JS parsers/formatters. WASM was the plan for Nix (`nixpkgs-fmt`),
which has **no** good JS parser — but Nix was removed from scope. WASM is
therefore out of the MVP entirely. *If Nix returns, WASM is the tool for it and
it should be isolated to a single async adapter.*

**Scope changes vs original draft**
- **Removed:** Nix, Protobuf.
- **Protobuf removed** because it is binary + schema-dependent; without a
  `.proto` descriptor you cannot produce a meaningful structural diff (only a
  byte diff), which contradicts the core value prop. Revisit only if a schema
  input is accepted.

## 3. The Core Algorithm: Canonicalize → Diff

```
parse → canonicalize (re-serialize) → line-based unified diff
```

The single most important rule, encoded in the engine:

> **Object keys may be sorted; ARRAY ORDER IS ALWAYS PRESERVED.**
> Arrays are ordered data — sorting them would fabricate diffs.

This is what makes "structure not bytes" true: two inputs that differ only in
key order or whitespace produce a **zero-change** diff; a real value or array
order change still surfaces.

## 4. Technical Architecture

- **Framework:** React + TypeScript, built with Vite.
- **State:** Zustand (lightweight).
- **Engine:** a pure, framework-free module under `src/engine/` that runs
  identically in a Web Worker and in Node (vitest). No DOM dependencies.
- **Worker:** Vite `new Worker(new URL(...), { type: "module" })`. Promise-based
  client wrapper (`src/worker/client.ts`).
- **Diffing:** `diff` (jsdiff) — line-based, feeds diff2html.
- **Rendering:** `diff2html` — Git-style Split (side-by-side) / Unified
  (inline). Thin wrapper so it can be swapped later.
- **Extensibility:** `LanguageAdapter` interface. A new language = one file
  implementing `detect()` + `format()` + `toggles`. UI and worker are
  adapter-agnostic.

### LanguageAdapter interface
```ts
interface LanguageAdapter {
  id: LanguageId;
  label: string;
  detect(input: string): number;        // heuristic confidence 0..1
  toggles: ToggleDef[];
  format(input: string, opts: FormatOptions): FormatResult; // throws ParseError
}
```

### Tooling
- **pnpm** (workspace-free, simple), **Node 24** (pinned via `mise.toml`)
- **oxlint** (lint), **oxfmt** (format), **vitest** (unit tests)
- Test config lives in `vitest.config.ts`, separate from `vite.config.ts` to
  avoid the Vitest-3/Vite-8 dual-Vite type conflict.

## 5. MVP Scope (shipped in scaffold)

- [x] Engine: adapter interface + JSON adapter wired end-to-end
- [x] Stub adapters: YAML, SQL, TOML, XML, BSON, Plain
- [x] Web Worker engine offload + promise client
- [x] UI: two textareas, auto-detect + language override, dynamic toggles,
      Split/Unified view, added/removed counts
- [x] Unit tests (vitest) for JSON canonicalization, detection, structural diff
- [x] PRD + README

## 6. Non-Goals (Out of Scope)

- Cloud sync / accounts / backend database (privacy guarantee).
- **URL-share of diff content** — would leak data into browser history;
  explicitly forbidden.
- Inline dual-pane editing (Monaco) — read-only output for now.
- WASM (deferred; only relevant if Nix returns).

## 7. Known Optimization (follow-up)

The main bundle currently pulls all adapter parser libraries (sql-formatter,
js-yaml, etc.) because `App.tsx` imports the engine index transitively. Follow
up with **lazy-loaded adapter libraries** (dynamic `import()` inside each
adapter's `format`) so heavy parsers load only when that language is used and
the main thread bundle shrinks.

## 8. Acceptance Criteria

- Diffing 1 MB of JSON completes without freezing the UI (worker).
- Key-reorder-only JSON inputs report zero added/removed lines (structure not
  bytes).
- Network tab shows zero requests beyond the initial page load (privacy).

import type { Plugin } from "prettier";
import type { FormatOptions, FormatResult, LanguageAdapter } from "@/modules/engine/lib/types";
import { whitespaceCanonicalize } from "@/modules/engine/lib/adapters/code-format";
import { csvPlugin } from "@/core/worker/format-plugins/csv";

/**
 * WORKER-ONLY formatting runtime.
 *
 * Everything in this module depends on the heavy formatter stack. It must be
 * imported ONLY from engine-worker code (`core/worker/diff-runner.ts`,
 * `core/worker/worker.ts`, `core/worker/prettier-adapters.ts`) so that the
 * main-thread bundle never pulls it in. Plain adapters
 * (`modules/engine/lib/adapters/*`) carry metadata + robust sync
 * canonicalization; this module attaches the real formatter pass on top of a
 * plain adapter, worker-side.
 */

/** A plugin reference: an npm id (resolved via {@link PLUGIN_LOADERS}) or an
 *  already-resolved plugin object (in-repo plugins). */
type PluginSpec = string | Plugin;

/**
 * Lazy plugin loading table: npm id -> dynamic import thunk. The literal
 * specifiers keep every statically-loadable plugin analyzable so Rollup
 * code-splits them into lazy chunks loaded on demand inside the worker.
 *
 * NOTE: some plugins are intentionally absent and go through the bare
 * runtime-import fallback in {@link resolvePlugin} instead:
 * - `prettier-plugin-sh`: its dependency needs manual WASM wiring under the
 *   browser export condition.
 * - `prettier-plugin-astro`: pulls the node-only `@astrojs/compiler/sync`
 *   build (~35 MB of inline WASM glue) when statically bundled.
 * - `prettier-plugin-toml`: pulls `@taplo/lib` (~34 MB WASM-in-JS) when
 *   statically bundled.
 */
const PLUGIN_LOADERS: Record<string, () => Promise<unknown>> = {
  "@prettier/plugin-xml": () => import("@prettier/plugin-xml"),
  "@prettier/plugin-php": () => import("@prettier/plugin-php"),
  "@prettier/plugin-pug": () => import("@prettier/plugin-pug"),
  "prettier-plugin-java": () => import("prettier-plugin-java"),
  "prettier-plugin-nginx": () => import("prettier-plugin-nginx"),
  "prettier-plugin-sql": () => import("prettier-plugin-sql"),
  "prettier-plugin-svelte": () => import("prettier-plugin-svelte"),
  "prettier-plugin-gherkin": () => import("prettier-plugin-gherkin"),
  "@poliklot/prettier-plugin-handlebars": () => import("@poliklot/prettier-plugin-handlebars"),
  "@htnabe/prettier-plugin-go-template": () => import("@htnabe/prettier-plugin-go-template"),
};

/**
 * Per-language plugin lookup (worker-only). Maps the adapter's neutral
 * `fmtParser` marker to the plugin specs the formatter pass needs.
 */
export const PLUGINS_BY_PARSER: Record<string, readonly PluginSpec[]> = {
  xml: ["@prettier/plugin-xml"],
  php: ["@prettier/plugin-php"],
  java: ["prettier-plugin-java"],
  nginx: ["prettier-plugin-nginx"],
  sh: ["prettier-plugin-sh"],
  sql: ["prettier-plugin-sql"],
  toml: ["prettier-plugin-toml"],
  astro: ["prettier-plugin-astro"],
  svelte: ["prettier-plugin-svelte"],
  gherkin: ["prettier-plugin-gherkin"],
  handlebars: ["@poliklot/prettier-plugin-handlebars"],
  pug: ["@prettier/plugin-pug"],
  "go-template": ["@htnabe/prettier-plugin-go-template"],
  // In-repo CSV plugin — no npm equivalent exists.
  csv: [csvPlugin],
};

async function resolvePlugin(spec: PluginSpec): Promise<Plugin> {
  if (typeof spec !== "string") return spec;
  const loader = PLUGIN_LOADERS[spec];
  if (!loader) {
    // No static loader (e.g. plugins that cannot be bundled for the browser):
    // attempt a bare runtime import; failures degrade to the robust fallback
    // upstream.
    const mod = (await import(/* @vite-ignore */ spec)) as { default?: unknown };
    return (mod.default ?? mod) as Plugin;
  }
  const mod = (await loader()) as { default?: unknown };
  return (mod.default ?? mod) as Plugin;
}

/**
 * Real formatter pass via the lazily-loaded stack. Returns the formatted text,
 * or `null` when unavailable/rejecting (e.g. invalid syntax) so callers can
 * fall back to the robust canonical text.
 */
export async function formatWithPrettier(
  code: string,
  parser: string,
  plugins: Array<string | Plugin>,
  options: Record<string, unknown>,
): Promise<string | null> {
  try {
    const prettier = await import("prettier");
    const resolved = await Promise.all(plugins.map(resolvePlugin));
    return await prettier.format(code, { parser, plugins: resolved, ...options });
  } catch {
    return null;
  }
}

export interface FormatterConfig {
  parser: string;
  plugins?: Array<string | Plugin>;
  /** Default options; entries are overridden by matching `opts` keys. */
  options?: Record<string, unknown>;
  /** Robust synchronous baseline (used directly and as the fallback). */
  robust: (input: string, opts: FormatOptions) => FormatResult;
}

/**
 * Generic async canonicalization: applies the heavy formatter, falls back to
 * the robust canonicalizer, finally to whitespace-only normalization. Always
 * resolves — parse failures never throw so the diff pipeline can still run.
 */
export async function genericFormatAsync(
  input: string,
  opts: FormatOptions,
  cfg: FormatterConfig,
): Promise<FormatResult> {
  const options: Record<string, unknown> = { ...(cfg.options ?? {}) };
  for (const key of Object.keys(options)) {
    if (opts[key] !== undefined) options[key] = opts[key];
  }
  const pretty = await formatWithPrettier(input, cfg.parser, cfg.plugins ?? [], options);
  if (pretty !== null) return { canonical: pretty };
  try {
    return { canonical: cfg.robust(input, opts).canonical };
  } catch {
    // Robust canonicalizer (e.g. parse) can also reject invalid input — fall
    // back to the always-safe whitespace normalization rather than throwing.
    return { canonical: whitespaceCanonicalize(input, opts).canonical };
  }
}

/**
 * Wrap a plain `LanguageAdapter`: keep its metadata + robust sync `format()`,
 * attach `formatAsync()` (when the language is not `formatterDisabled`) via
 * `genericFormatAsync`. Runs inside the engine worker only.
 */
export function makePrettierAdapter(config: {
  plain: LanguageAdapter;
  parser: string;
  plugins?: Array<string | Plugin>;
}): LanguageAdapter {
  const plain = config.plain;
  const robust = (input: string, opts: FormatOptions): FormatResult => plain.format(input, opts);
  const wrapped: LanguageAdapter = {
    ...plain,
    format: robust,
    formatAsync: plain.formatterDisabled
      ? undefined
      : (input, opts) =>
          genericFormatAsync(input, opts, {
            parser: config.parser,
            plugins: config.plugins,
            options: plain.fmtOptions,
            robust,
          }),
  };
  return wrapped;
}

/**
 * Browser-safe stand-in for the Node builtins that the formatter stack
 * references (prettier core, @prettier/plugin-php, @prettier/plugin-pug,
 * prettier-plugin-java's web-tree-sitter).
 *
 * In the engine Web Worker none of these specifiers exist, so
 * `vite.config.ts` / `vitest.config.ts` alias each of them to THIS module.
 * One module serves every family (`fs`, `path`, `module`, `assert`,
 * `util`, `url`, `process`, `fs/promises`, `node:util`): it carries a
 * permissive default export plus the full set of NAMED exports that the
 * bundles access through namespace imports (`import * as path from "path"`),
 * which resolve against static exports only — unknown names would be
 * `undefined` and crash on first call.
 *
 * Everything here is deterministic, side-effect-free and tree-shakeable; the
 * module is only ever reachable from the worker graph.
 */

type AnyFn = (...args: unknown[]) => unknown;

const noop: AnyFn = () => undefined;

/** `/`-based path operations good enough for the plugins' happy path. */
const pathOps = {
  sep: "/",
  delimiter: ":",
  join: (...parts: string[]): string => parts.filter(Boolean).join("/"),
  resolve: (...parts: string[]): string => "/" + parts.filter(Boolean).join("/"),
  relative: (_from: string, _to: string): string => "",
  dirname: (p: string): string => p.replace(/\/[^/]*$/, "") || "/",
  basename: (p: string, ext?: string): string => {
    const base = p.split("/").pop() ?? "";
    return ext && base.endsWith(ext) ? base.slice(0, -ext.length) : base;
  },
  extname: (p: string): string => {
    const base = p.split("/").pop() ?? "";
    const i = base.lastIndexOf(".");
    return i > 0 ? base.slice(i) : "";
  },
  parse: (p: string) => {
    const base = p.split("/").pop() ?? "";
    const ext = base.includes(".") ? "." + base.split(".").pop() : "";
    return {
      root: "/",
      dir: p.replace(/\/[^/]*$/, ""),
      base,
      ext,
      name: base.slice(0, base.length - ext.length),
    };
  },
  format: (): string => "",
  isAbsolute: (p: string): boolean => p.startsWith("/"),
  normalize: (p: string): string => p,
  toNamespacedPath: (p: string): string => p,
  posix: null as unknown,
  win32: null as unknown,
};
pathOps.posix = pathOps;
pathOps.win32 = { ...pathOps, sep: "\\" };

/** Callback-or-promise adapter so `fs.stat(p, cb)` and `await fs.stat(p)` both work. */
function dual<T>(impl: (...args: unknown[]) => T): AnyFn {
  return (...args: unknown[]) => {
    const maybeCb = args[args.length - 1];
    if (typeof maybeCb === "function") {
      const cb = maybeCb as (err: unknown, val?: T) => void;
      try {
        cb(null, impl(...args.slice(0, -1)));
      } catch (e) {
        cb(e);
      }
      return undefined;
    }
    return Promise.resolve(impl(...args));
  };
}

const fakeStats = () => ({
  isFile: () => true,
  isDirectory: () => false,
  isBlockDevice: () => false,
  isCharacterDevice: () => false,
  isSymbolicLink: () => false,
  isFIFO: () => false,
  isSocket: () => false,
  size: 0,
  mtimeMs: 0,
});

/**
 * Read a file's bytes. In the browser the only realistic caller is
 * web-tree-sitter loading a grammar WASM from a bundler-emitted asset URL —
 * serve that via `fetch`. Everything else rejects loudly instead of silently
 * returning garbage.
 */
async function readBytes(p: unknown): Promise<Uint8Array> {
  if (typeof fetch === "function") {
    const url =
      p instanceof URL ? p : typeof p === "string" && /^[a-z]+:\/\//.test(p) ? new URL(p) : null;
    if (url) {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`[stub fs] fetch failed: ${res.status} ${String(p)}`);
      return new Uint8Array(await res.arrayBuffer());
    }
  }
  throw new Error(`[stub fs] readFile unavailable in browser for ${String(p)}`);
}

/** `fs` read-only surface (+ `fs/promises`) used across the formatter stack. */
const fsOps = {
  constants: { F_OK: 0, R_OK: 4, W_OK: 2, X_OK: 1 },
  existsSync: (): boolean => false,
  readFileSync: (p: unknown): string =>
    p instanceof URL || String(p).endsWith(".wasm")
      ? // WASM reads must go through the async fetch path; sync callers never
        // hit this in the formatter happy path.
        ""
      : "",
  readFileSyncBytes: undefined as unknown,
  readFile: dual((p: unknown) => readBytes(p)),
  writeFileSync: noop,
  writeFile: dual(() => undefined),
  appendFileSync: noop,
  statSync: fakeStats,
  lstatSync: fakeStats,
  stat: dual(() => fakeStats()),
  lstat: dual(() => fakeStats()),
  realpathSync: (p: string): string => p,
  realpath: dual((p: unknown) => String(p)),
  readdirSync: (): string[] => [],
  readdir: dual(() => [] as string[]),
  openSync: (): number => -1,
  closeSync: noop,
  readSync: (): number => 0,
  mkdirSync: noop,
  promises: null as unknown,
};

/** `fs.promises` — mirrors the sync surface with async signatures. */
fsOps.promises = {
  readFile: (p: unknown) => readBytes(p),
  writeFile: async () => undefined,
  stat: async () => fakeStats(),
  lstat: async () => fakeStats(),
  realpath: async (p: string) => p,
  readdir: async () => [] as string[],
  mkdir: async () => undefined,
  access: async () => undefined,
  constants: fsOps.constants,
};

/** `module` surface (prettier resolves config loaders through createRequire). */
const moduleOps = {
  createRequire: (): AnyFn =>
    new Proxy(noop, { get: (_t, prop: string) => (prop === "resolve" ? () => "" : noop) }),
  builtinModules: [] as string[],
  isBuiltin: (): boolean => false,
};

/** `assert` surface — never throws in the browser (dev-time invariants only). */
const assertOps = {
  ok: noop,
  strict: null as unknown,
  equal: noop,
  deepEqual: noop,
  strictEqual: noop,
  deepStrictEqual: noop,
  notEqual: noop,
  notDeepEqual: noop,
  notStrictEqual: noop,
  fail: noop,
  throws: noop,
  doesNotThrow: noop,
  rejects: noop,
  resolves: noop,
  ifError: noop,
};
assertOps.strict = assertOps;

/** `util` surface (bare `util` from prettier core, `node:util` from pug). */
const utilOps = {
  types: {
    isNativeError: (v: unknown): boolean => v instanceof Error,
    isPromise: (v: unknown): boolean =>
      !!v && typeof (v as PromiseLike<unknown>).then === "function",
    isDate: (v: unknown): boolean => v instanceof Date,
    isRegExp: (v: unknown): boolean => v instanceof RegExp,
    isArray: (v: unknown): boolean => Array.isArray(v),
    isError: (v: unknown): boolean => v instanceof Error,
  },
  format: (f: unknown, ...rest: unknown[]): string =>
    typeof f === "string"
      ? rest.reduce((acc: string, v, i) => acc.replace(`%${i}s`, String(v)), f)
      : rest.map(String).join(" "),
  inspect: (v: unknown): string => String(v),
  promisify:
    (fn: AnyFn): AnyFn =>
    (...args: unknown[]) =>
      new Promise((resolve, reject) =>
        fn(...args, (err: unknown, val: unknown) => (err ? reject(err) : resolve(val))),
      ),
  deprecate: <T extends AnyFn>(fn: T): T => fn,
  isArray: (v: unknown): boolean => Array.isArray(v),
  isError: (v: unknown): boolean => v instanceof Error,
};

/** `url` surface (file↔URL conversions around the WASM loader). */
const urlOps = {
  URL: globalThis.URL,
  URLSearchParams: globalThis.URLSearchParams,
  fileURLToPath: (u: URL | string): string =>
    u instanceof URL ? decodeURIComponent(u.pathname) : String(u),
  pathToFileURL: (p: string): URL => new URL(`file://${p.startsWith("/") ? "" : "/"}${p}`),
  domainToASCII: (d: string): string => d,
  domainToUnicode: (d: string): string => d,
  urlToHttpOptions: (u: URL) => ({ href: u.href, protocol: u.protocol, hostname: u.hostname }),
};

/**
 * Minimal `process` surface. NOTE: `versions.node` MUST stay a truthy,
 * dot-separated version string — prettier's bundled `@nodelib/fs.scandir`
 * runs `process.versions.node.split(".")` at module load, and an empty value
 * crashes the whole dynamic import (identity fallback for every language).
 * web-tree-sitter sees the truthy value too, so the `fs/promises` stub above
 * must serve its WASM loads via `fetch`.
 */
const processOps = {
  cwd: (): string => "/",
  env: {} as Record<string, string | undefined>,
  platform: "linux",
  arch: "x64",
  versions: { node: "22.0.0" } as Record<string, string>,
  argv: [] as string[],
  pid: 0,
  exitCode: 0,
  type: "worker",
  nextTick: (fn: (...args: unknown[]) => void, ...args: unknown[]): void => {
    void Promise.resolve().then(() => fn(...args));
  },
};

/**
 * Default export satisfies default-form imports from EVERY aliased specifier
 * (`import fs from "fs"`, `import assert from "assert"`,
 * `import process from "process"`, …) — any unknown member resolves to a safe
 * no-op so an unexpected access can never throw.
 */
const defaultShim: Record<string, unknown> = new Proxy(
  { ...pathOps, ...fsOps, ...moduleOps, ...assertOps, ...utilOps, ...urlOps, ...processOps },
  {
    get: (target, prop: string) => {
      const t = target as Record<string, unknown>;
      return prop === "__esModule" ? true : prop in t ? t[prop] : noop;
    },
  },
);

export default defaultShim;

// Named exports — required for namespace imports (`import * as path …`) and
// named imports (`import { statSync } from "fs"`, `import { inspect } from
// "util"`, `import { builtinModules } from "module"`,
// `import { fileURLToPath } from "url"`, …).
export const sep = pathOps.sep;
export const delimiter = pathOps.delimiter;
export const join = pathOps.join;
export const resolve = pathOps.resolve;
export const relative = pathOps.relative;
export const dirname = pathOps.dirname;
export const basename = pathOps.basename;
export const extname = pathOps.extname;
export const parse = pathOps.parse;
export const format = utilOps.format;
export const inspect = utilOps.inspect;
export const promisify = utilOps.promisify;
export const deprecate = utilOps.deprecate;
export const isAbsolute = pathOps.isAbsolute;
export const normalize = pathOps.normalize;
export const toNamespacedPath = pathOps.toNamespacedPath;
export const posix = pathOps.posix;
export const win32 = pathOps.win32;
export const constants = fsOps.constants;
export const existsSync = fsOps.existsSync;
export const readFileSync = fsOps.readFileSync;
export const readFile = fsOps.readFile;
export const writeFile = fsOps.writeFile;
export const writeFileSync = fsOps.writeFileSync;
export const statSync = fsOps.statSync;
export const lstatSync = fsOps.lstatSync;
export const stat = fsOps.stat;
export const lstat = fsOps.lstat;
export const realpathSync = fsOps.realpathSync;
export const realpath = fsOps.realpath;
export const readdirSync = fsOps.readdirSync;
export const readdir = fsOps.readdir;
export const promises = fsOps.promises;
export const createRequire = moduleOps.createRequire;
export const builtinModules = moduleOps.builtinModules;
export const isBuiltin = moduleOps.isBuiltin;
export const ok = assertOps.ok;
export const strict = assertOps.strict;
export const strictEqual = assertOps.strictEqual;
export const deepStrictEqual = assertOps.deepStrictEqual;
export const equal = assertOps.equal;
export const deepEqual = assertOps.deepEqual;
export const fail = assertOps.fail;
export const types = utilOps.types;
export const URL = urlOps.URL;
export const URLSearchParams = urlOps.URLSearchParams;
export const fileURLToPath = urlOps.fileURLToPath;
export const pathToFileURL = urlOps.pathToFileURL;

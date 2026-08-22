import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Browser-safe stand-ins for the Node builtins the formatter plugins reference
// (see src/core/worker/node-builtins-stub.ts). Aliasing them here makes the
// test environment mirror the production engine Web Worker, where these
// specifiers are externalized — proving the plugins tolerate their absence.
const nodeBuiltinsStub = fileURLToPath(
  new URL("./src/core/worker/node-builtins-stub.ts", import.meta.url),
);
// Use the clean ESM entry of @prettier/plugin-php (the `browser` UMD standalone
// entry calls process.cwd()/fs and is unsafe in the worker / under these
// shims). This matches the production vite.config.ts alias.
const pluginPhpEntry = fileURLToPath(
  new URL("./node_modules/@prettier/plugin-php/src/index.mjs", import.meta.url),
);

// Exact-specifier aliases (anchored regexes) mirroring vite.config.ts —
// object-form string keys prefix-match, so `fs/promises` would wrongly hit the
// `fs` key.
const builtinAliases = [
  { find: /^fs\/promises$/, replacement: nodeBuiltinsStub },
  { find: /^fs$/, replacement: nodeBuiltinsStub },
  { find: /^path$/, replacement: nodeBuiltinsStub },
  { find: /^module$/, replacement: nodeBuiltinsStub },
  { find: /^assert$/, replacement: nodeBuiltinsStub },
  { find: /^node:util$/, replacement: nodeBuiltinsStub },
  // Mirror vite.config.ts: prettier core also imports bare "process", "util"
  // and "url".
  { find: /^util$/, replacement: nodeBuiltinsStub },
  { find: /^url$/, replacement: nodeBuiltinsStub },
  { find: /^process$/, replacement: nodeBuiltinsStub },
];

// Vitest uses its own bundled Vite (currently 7.x) — kept separate from
// vite.config.ts so the Vite 8 project config stays untouched.
export default defineConfig({
  resolve: {
    alias: [
      ...builtinAliases,
      { find: /^@prettier\/plugin-php$/, replacement: pluginPhpEntry },
      { find: /^@\//, replacement: fileURLToPath(new URL("./src/", import.meta.url)) },
      // The PWA virtual module only exists under Vite (with the plugin). Under
      // vitest (no plugin) resolve it to a no-op stub.
      {
        find: /^virtual:pwa-register$/,
        replacement: fileURLToPath(new URL("./src/test/pwa-register-stub.ts", import.meta.url)),
      },
    ],
  },
  test: {
    // happy-dom provides a real localStorage implementation (jsdom omitted it,
    // breaking use-theme / use-github-stars / bottom-bar / app boot tests).
    environment: "happy-dom",
    environmentOptions: {
      happyDOM: {
        settings: {
          // Tests assume the dark scheme as the no-preference default;
          // happy-dom's matchMedia otherwise reports "light".
          device: { prefersColorScheme: "dark" },
        },
      },
    },
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});

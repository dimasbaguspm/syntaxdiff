import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// Browser-safe stand-ins for Node builtins the formatter plugins reference.
// In the engine Web Worker these would otherwise be externalized to empty
// objects (or undefined) and crash the plugins on the happy path. Aliasing
// them keeps the worker graph free of Node while giving deterministic shims.
const nodeBuiltinsStub = fileURLToPath(
  new URL("./src/core/worker/node-builtins-stub.ts", import.meta.url),
);
// The clean ESM entry of @prettier/plugin-php. Its `browser` export maps to a
// UMD `standalone.js` that calls `process.cwd()` + `fs` at module load and is
// unsafe in the worker; the ESM entry formats purely in JS (no PHP binary).
const pluginPhpEntry = fileURLToPath(
  new URL("./node_modules/@prettier/plugin-php/src/index.mjs", import.meta.url),
);

// Exact-specifier aliases (anchored regexes): object-form string keys
// prefix-match, so `import("fs/promises")` would wrongly hit the `fs` key and
// resolve to `node-builtins-stub.ts/promises`.
const builtinAliases = [
  { find: /^fs\/promises$/, replacement: nodeBuiltinsStub },
  { find: /^fs$/, replacement: nodeBuiltinsStub },
  { find: /^path$/, replacement: nodeBuiltinsStub },
  { find: /^module$/, replacement: nodeBuiltinsStub },
  { find: /^assert$/, replacement: nodeBuiltinsStub },
  { find: /^node:util$/, replacement: nodeBuiltinsStub },
  // Bare forms referenced by prettier core itself (`import process from
  // "process"`, `import { inspect } from "util"`, `import * as url from
  // "url"`) — Vite would otherwise externalize them to browser proxies that
  // throw on first property access inside the worker.
  { find: /^util$/, replacement: nodeBuiltinsStub },
  { find: /^url$/, replacement: nodeBuiltinsStub },
  { find: /^process$/, replacement: nodeBuiltinsStub },
];

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: [
      ...builtinAliases,
      { find: /^@prettier\/plugin-php$/, replacement: pluginPhpEntry },
      { find: /^@\//, replacement: fileURLToPath(new URL("./src/", import.meta.url)) },
    ],
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      includeAssets: [
        "syntaxdiff.svg",
        "favicon-32x32.png",
        "apple-touch-icon.png",
        "og-image.png",
      ],
      manifest: {
        name: "SyntaxDiff",
        short_name: "SyntaxDiff",
        description: "Privacy-first, client-side syntax-aware diff. Diff structure, not bytes.",
        start_url: "/",
        display: "standalone",
        background_color: "#203020",
        theme_color: "#131d17",
        icons: [
          { src: "/syntaxdiff.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          { src: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
          { src: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,webmanifest}"],
        navigateFallback: "index.html",
        cleanupOutdatedCaches: true,
        // The engine worker chunk bundles the formatter runtime (several MB);
        // without raising this limit workbox refuses to precache it, which
        // would break offline diffing.
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024,
      },
    }),
  ],
});

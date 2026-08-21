import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest uses its own bundled Vite (currently 7.x) — kept separate from
// vite.config.ts so the Vite 8 project config stays untouched.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // The PWA virtual module only exists under Vite (with the plugin). Under
      // vitest (no plugin) resolve it to a no-op stub.
      "virtual:pwa-register": fileURLToPath(
        new URL("./src/test/pwa-register-stub.ts", import.meta.url),
      ),
    },
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

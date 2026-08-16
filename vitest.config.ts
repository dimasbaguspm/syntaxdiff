import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

// Vitest uses its own bundled Vite (currently 7.x) — kept separate from
// vite.config.ts so the Vite 8 project config stays untouched.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});

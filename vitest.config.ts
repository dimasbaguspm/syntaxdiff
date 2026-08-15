import { defineConfig } from "vitest/config";

// Vitest uses its own bundled Vite (currently 7.x) — kept separate from
// vite.config.ts so the Vite 8 project config stays untouched.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});

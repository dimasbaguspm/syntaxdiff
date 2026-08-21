import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
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
      },
    }),
  ],
});

import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { makePrettierAdapter, markupPrettierToggles } from "./code-format";

function detectNginx(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/\b(server|location|upstream|http|events)\s*\{/.test(t)) return 0.9;
  if (/^\s*(listen|server_name|proxy_pass|root|index)\s+/.test(t)) return 0.7;
  return 0;
}

export const nginxAdapter: LanguageAdapter = makePrettierAdapter({
  id: "nginx",
  label: "Nginx",
  parser: "nginx",
  plugins: ["prettier-plugin-nginx"],
  prettierOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  toggles: markupPrettierToggles,
  detect: detectNginx,
});

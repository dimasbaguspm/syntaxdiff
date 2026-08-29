import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { markupFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectNginx(input: string): number {
  const t = input.trimStart();
  if (!t || t.length < 10) return 0;
  let score = 0;
  if (/\b(server|location|upstream|http|events)\s*\{/.test(input)) score += 0.5;
  if (/\b(listen|server_name|proxy_pass|root|index)\s+[^;]+;/.test(input)) score += 0.4;
  if (!/;/.test(input)) score -= 0.5;
  return Math.min(1, Math.max(0, score));
}

export const nginxAdapter: LanguageAdapter = {
  id: "nginx",
  label: "Nginx",
  fmtParser: "nginx",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectNginx,
  toggles: markupFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};

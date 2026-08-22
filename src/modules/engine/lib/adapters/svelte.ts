import type { LanguageAdapter } from "@/modules/engine/lib/types";
import { codeFmtToggles, whitespaceCanonicalize } from "./code-format";

function detectSvelte(input: string): number {
  const t = input.trimStart();
  if (!t) return 0;
  if (/<script[\s>]/.test(t) && /<\/script>/.test(input)) return 0.9;
  if (/export\s+let\s/.test(input)) return 0.6;
  if (/on:[\w-]+=/.test(input)) return 0.5;
  return 0;
}

export const svelteAdapter: LanguageAdapter = {
  id: "svelte",
  label: "Svelte",
  fmtParser: "svelte",
  fmtOptions: { printWidth: 80, tabWidth: 2, useTabs: false },
  detect: detectSvelte,
  toggles: codeFmtToggles,
  format: (input, opts) => whitespaceCanonicalize(input, opts),
};

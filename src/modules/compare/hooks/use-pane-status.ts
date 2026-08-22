import { useEffect, useState } from "react";
import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";

export type PaneStatus = "valid" | "invalid" | "idle" | "loading";

/** Debounced live validation of a pane against the active adapter.
 *
 * While formatting/validating it reports `loading`; on settle it reports
 * `valid`/`invalid` from the synchronous parse canonicalizer (`format()`),
 * which throws `ParseError` on invalid input for data languages. The async
 * Prettier `formatAsync()` pass is awaited purely to drive the loading state
 * (it is intentionally lenient and never used as the validity signal). */
export function usePaneStatus(
  value: string,
  adapter: LanguageAdapter,
  opts: FormatOptions,
): PaneStatus {
  const [status, setStatus] = useState<PaneStatus>("idle");
  useEffect(() => {
    if (!value.trim()) {
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    const id = setTimeout(() => {
      void (async () => {
        try {
          if (adapter.formatAsync) {
            await adapter.formatAsync(value, opts);
          }
          if (cancelled) return;
          try {
            adapter.format(value, opts);
            if (!cancelled) setStatus("valid");
          } catch {
            if (!cancelled) setStatus("invalid");
          }
        } catch {
          if (!cancelled) setStatus("valid");
        }
      })();
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [value, adapter, opts]);
  return status;
}

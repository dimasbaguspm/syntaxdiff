import { useEffect, useState } from "react";
import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";

export type PaneStatus = "valid" | "invalid" | "idle" | "loading";

/** Debounced live validation of a pane against the active adapter.
 *
 * While debouncing it reports `loading`; on settle it reports `valid`/
 * `invalid` from the synchronous parse canonicalizer (`format()`), which
 * throws `ParseError` on invalid input for data languages. Validation is sync
 * and main-thread-safe — the heavy async formatting pass runs only inside the
 * engine worker. */
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
      if (cancelled) return;
      try {
        adapter.format(value, opts);
        if (!cancelled) setStatus("valid");
      } catch {
        if (!cancelled) setStatus("invalid");
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [value, adapter, opts]);
  return status;
}

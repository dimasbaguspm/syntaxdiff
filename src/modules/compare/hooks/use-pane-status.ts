import { useEffect, useState } from "react";
import type { FormatOptions, LanguageAdapter } from "@/modules/engine/lib/types";

export type PaneStatus = "valid" | "invalid" | "idle";

/** Debounced live validation of a pane against the active adapter. */
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
    const id = setTimeout(() => {
      try {
        adapter.format(value, opts);
        setStatus("valid");
      } catch {
        setStatus("invalid");
      }
    }, 350);
    return () => clearTimeout(id);
  }, [value, adapter, opts]);
  return status;
}

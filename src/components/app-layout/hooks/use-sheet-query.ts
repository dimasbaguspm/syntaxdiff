import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type SheetId = "options";

export function useSheetQuery(): SheetId | null {
  const [params] = useSearchParams();
  const raw = params.get("sheet");
  return useMemo(() => {
    if (raw === "options") return raw;
    return null;
  }, [raw]);
}

export function sheetHref(id: SheetId): string {
  const sp = new URLSearchParams(window.location.search);
  sp.set("sheet", id);
  return `?${sp.toString()}`;
}

export function useCloseSheet(): () => void {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("sheet");
        return next;
      },
      { replace: true },
    );
  }, [setParams]);
}

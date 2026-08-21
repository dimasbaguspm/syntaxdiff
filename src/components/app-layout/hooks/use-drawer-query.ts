import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export interface DrawerQuery {
  id: string | null;
  args: unknown;
}

const ARGS_KEY = "drawerArgs";

/** Reads the drawer id + JSON args from the URL query string. */
export function useDrawerQuery(): DrawerQuery {
  const [params] = useSearchParams();
  return useMemo(() => {
    const id = params.get("drawerId");
    const raw = params.get(ARGS_KEY);
    let args: unknown = undefined;
    if (raw) {
      try {
        args = JSON.parse(raw);
      } catch {
        args = undefined;
      }
    }
    return { id, args };
  }, [params]);
}

/** Builds a href that opens a drawer via the URL (shareable / back-button safe). */
export function drawerHref(id: string, args?: unknown): string {
  const sp = new URLSearchParams();
  sp.set("drawerId", id);
  if (args !== undefined) sp.set(ARGS_KEY, JSON.stringify(args));
  return `?${sp.toString()}`;
}

/** Clears the drawer query param (closes any open drawer). */
export function useCloseDrawer(): () => void {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("drawerId");
        next.delete(ARGS_KEY);
        return next;
      },
      { replace: true },
    );
  }, [setParams]);
}

import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export type ModalId = "help" | "changelog";

export function useModalQuery(): ModalId | null {
  const [params] = useSearchParams();
  const raw = params.get("modal");
  return useMemo(() => {
    if (raw === "help" || raw === "changelog") return raw;
    return null;
  }, [raw]);
}

export function modalHref(id: ModalId): string {
  const sp = new URLSearchParams(window.location.search);
  sp.set("modal", id);
  return `?${sp.toString()}`;
}

export function useCloseModal(): () => void {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("modal");
        return next;
      },
      { replace: true },
    );
  }, [setParams]);
}

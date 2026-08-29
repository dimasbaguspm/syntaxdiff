import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

export function useQueryParam(key: string): string | null {
  const [params] = useSearchParams();
  return useMemo(() => params.get(key), [params, key]);
}

export function useCloseQueryParam(key: string, extraKeys: string[] = []): () => void {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete(key);
        for (const k of extraKeys) next.delete(k);
        return next;
      },
      { replace: true },
    );
  }, [setParams, key, extraKeys]);
}

export function queryHref(key: string, value: string): string {
  const sp = new URLSearchParams(window.location.search);
  sp.set(key, value);
  return `?${sp.toString()}`;
}

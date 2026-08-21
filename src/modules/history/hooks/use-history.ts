import { useCallback, useEffect, useMemo, useState } from "react";
import { clearDiffs, deleteDiff, listDiffs, type DiffRecord } from "@/core/db";
import { filterDiffs } from "@/modules/history/lib/filter";

/** Owns history list state: fetch, search filter, and mutations. */
export function useHistory(open: boolean) {
  const [diffs, setDiffs] = useState<DiffRecord[]>([]);
  const [query, setQuery] = useState("");

  const refresh = useCallback(async () => {
    setDiffs(await listDiffs());
  }, []);

  useEffect(() => {
    if (open) void refresh();
  }, [open, refresh]);

  const filtered = useMemo(() => filterDiffs(diffs, query), [diffs, query]);

  const clear = useCallback(async () => {
    await clearDiffs();
    void refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await deleteDiff(id);
      void refresh();
    },
    [refresh],
  );

  return { diffs, filtered, query, setQuery, clear, remove, refresh };
}

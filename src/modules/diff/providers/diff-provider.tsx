import { useEffect, useState, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { getDiff, type DiffRecord } from "@/core/db";
import { DiffContext } from "@/modules/diff/providers/context";

/** Loads the saved diff record for the current :id route param. */
export function DiffProvider({ children }: { children: ReactNode }) {
  const { id } = useParams();
  const [rec, setRec] = useState<DiffRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setRec(null);
      return;
    }
    let active = true;
    void getDiff(id).then((r) => {
      if (active) setRec(r ?? null);
    });
    return () => {
      active = false;
    };
  }, [id]);

  return <DiffContext.Provider value={{ rec }}>{children}</DiffContext.Provider>;
}

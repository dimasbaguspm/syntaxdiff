import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowLeft, Columns2, FileDiff, Rows3 } from "lucide-react";
import { getAdapter } from "../engine";
import { getDiff, type DiffRecord } from "../db";
import { useStore } from "../store";
import { DiffView } from "../components/DiffView";
import { btnActive, Spinner } from "../components/ui";

const btnSegment =
  "inline-flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-dim transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/40";

export function DiffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const [rec, setRec] = useState<DiffRecord | null | undefined>(undefined);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isFinite(n)) {
      setRec(null);
      return;
    }
    void getDiff(n).then((r) => setRec(r ?? null));
  }, [id]);

  if (rec === undefined) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (rec === null) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 text-faint">
        <FileDiff className="size-8" aria-hidden />
        <p className="text-sm">Diff not found.</p>
        <button
          type="button"
          className="rounded-lg border border-edge bg-surface-2 px-3 py-1.5 text-sm text-ink transition-colors hover:border-edge-strong"
          onClick={() => navigate("/")}
        >
          Back
        </button>
      </div>
    );
  }

  const adapter = getAdapter(rec.lang);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-edge bg-surface/40 px-4 py-2">
        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Back"
          title="Back"
          className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </button>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-dim">
          <FileDiff className="size-3.5" aria-hidden />
          {adapter.label}
        </span>

        <span className="text-xs text-faint">
          <span className="text-[var(--tint-emerald-fg)]">+{rec.added}</span>
          {" · "}
          <span className="text-[var(--tint-rose-fg)]">−{rec.removed}</span>
        </span>

        <div className="ml-auto flex items-center gap-0.5 rounded-lg border border-edge bg-surface-2/50 p-0.5">
          <button
            type="button"
            onClick={() => setMode("split")}
            className={clsx(btnSegment, mode === "split" && btnActive)}
            aria-label="Split view"
            title="Split (side-by-side)"
          >
            <Columns2 className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => setMode("unified")}
            className={clsx(btnSegment, mode === "unified" && btnActive)}
            aria-label="Unified view"
            title="Unified (inline)"
          >
            <Rows3 className="size-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-4">
        <DiffView
          patch={rec.patch}
          mode={mode}
          counts={{ added: rec.added, removed: rec.removed }}
        />
      </div>
    </div>
  );
}

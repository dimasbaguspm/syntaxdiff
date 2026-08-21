import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { clsx } from "clsx";
import { ArrowLeft, Columns2, FileDiff, Rows3 } from "lucide-react";
import { getAdapter } from "@/engine";
import { getDiff, type DiffRecord } from "@/db";
import { useStore } from "@/store";
import { DiffView } from "@/components/diff-view";
import { Tooltip } from "@/components/tooltip";
import { trackEvent } from "@/lib/analytics/track";
import { btnActive, Spinner } from "@/components/ui";

const btnSegment =
  "inline-flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-dim transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/40";

export function DiffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);
  const [rec, setRec] = useState<DiffRecord | null | undefined>(undefined);

  useEffect(() => {
    if (!id) {
      setRec(null);
      return;
    }
    void getDiff(id).then((r) => setRec(r ?? null));
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
        <Tooltip label="Back">
          <button
            type="button"
            onClick={() => {
              navigate("/");
              trackEvent("back");
            }}
            aria-label="Back"
            className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </button>
        </Tooltip>

        <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-dim">
          <FileDiff className="size-3.5" aria-hidden />
          {adapter.label}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center gap-0.5 rounded-lg border border-edge bg-surface-2/50 p-0.5">
            <Tooltip label="Split (side-by-side)">
              <button
                type="button"
                onClick={() => {
                  setMode("split");
                  trackEvent("switch_view", { mode: "split" });
                }}
                className={clsx(btnSegment, mode === "split" && btnActive)}
                aria-label="Split view"
              >
                <Columns2 className="size-4" aria-hidden />
              </button>
            </Tooltip>
            <Tooltip label="Unified (inline)">
              <button
                type="button"
                onClick={() => {
                  setMode("unified");
                  trackEvent("switch_view", { mode: "unified" });
                }}
                className={clsx(btnSegment, mode === "unified" && btnActive)}
                aria-label="Unified view"
              >
                <Rows3 className="size-4" aria-hidden />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        <DiffView
          lines={rec.lines}
          mode={mode}
          labelA={rec.labelA ?? "Source A"}
          labelB={rec.labelB ?? "Source B"}
        />
      </div>
    </div>
  );
}

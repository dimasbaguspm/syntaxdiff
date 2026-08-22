import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Columns2, FileDiff, Rows3 } from "lucide-react";
import { getAdapter } from "@/modules/engine/lib";
import { useStore } from "@/core/store";
import { Icon } from "@/modules/engine/ui/language-icon";
import { DiffView } from "@/modules/diff/ui/diff-view";
import { DiffControlsFab } from "@/modules/diff/ui/diff-controls-fab";
import { useDiff } from "@/modules/diff/providers/context";
import { computeChangeGroups } from "@/modules/diff/lib/change-groups";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { trackEvent } from "@/modules/analytics/lib/track";
import { Spinner } from "@/components/ui";

/** Diff screen view: renders the loaded record or its empty/not-found states. */
export function DiffPageView() {
  const { rec } = useDiff();
  const navigate = useNavigate();
  const mode = useStore((s) => s.mode);
  const setMode = useStore((s) => s.setMode);

  // Line-by-line change navigation: groups of contiguous changed lines.
  // null = nothing selected yet (view starts at the top, no auto-scroll).
  const changeGroups = useMemo(() => (rec ? computeChangeGroups(rec.lines) : []), [rec]);
  const [groupIdx, setGroupIdx] = useState<number | null>(null);

  const goToGroup = (dir: -1 | 1) => {
    const total = changeGroups.length;
    if (total === 0) return;
    // null means "before the first change" — first press lands on group 0.
    const next = Math.min(total - 1, Math.max(0, (groupIdx ?? -1) + dir));
    setGroupIdx(next);
    trackEvent("diff_nav", {
      dir: dir === -1 ? "prev" : "next",
      group: next + 1,
      total,
    });
  };

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
        <FileDiff className="size-8" aria-hidden="true" />
        <p className="text-sm">Diff not found.</p>
        <Button size="sm" onClick={() => navigate("/")}>
          Back
        </Button>
      </div>
    );
  }

  const adapter = getAdapter(rec.lang);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-edge bg-surface/40 px-4 py-2">
        <Tooltip label="Back">
          <Button
            variant="ghost"
            onClick={() => {
              navigate("/");
              trackEvent("back");
            }}
            aria-label="Back"
            className="p-1.5"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
          </Button>
        </Tooltip>

        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-dim">
            <Icon name={rec.lang} className="size-5" />
            {adapter.label}
          </span>
          {/* Addition/deletion tally — reflows with the header on narrow screens. */}
          <span className="text-xs tabular-nums">
            <span className="text-[var(--tint-emerald-fg)]">+{rec.added}</span>{" "}
            <span className="text-[var(--tint-rose-fg)]">−{rec.removed}</span>
          </span>
        </span>

        {changeGroups.length > 0 && (
          <div className="ml-auto flex items-center gap-1">
            <div className="flex items-center gap-0.5 rounded-lg border border-edge bg-surface-2/50 p-0.5">
              <Tooltip label="Split (side-by-side)">
                <Button
                  variant="segment"
                  active={mode === "split"}
                  onClick={() => {
                    setMode("split");
                    trackEvent("switch_view", { mode: "split" });
                  }}
                  aria-label="Split view"
                >
                  <Columns2 className="size-4" aria-hidden="true" />
                </Button>
              </Tooltip>
              <Tooltip label="Unified (inline)">
                <Button
                  variant="segment"
                  active={mode === "unified"}
                  onClick={() => {
                    setMode("unified");
                    trackEvent("switch_view", { mode: "unified" });
                  }}
                  aria-label="Unified view"
                >
                  <Rows3 className="size-4" aria-hidden="true" />
                </Button>
              </Tooltip>
            </div>
          </div>
        )}
      </div>

      <div className="flex min-h-0 flex-1">
        <DiffView
          lines={rec.lines}
          mode={mode}
          labelA={rec.labelA ?? "Source A"}
          labelB={rec.labelB ?? "Source B"}
          icon={rec.lang}
          navIndex={groupIdx}
          navStarts={changeGroups}
        />
      </div>

      {/* Change navigation floats bottom-right on every viewport size;
          the split/unified toggle + +/- tally stay in the header. */}
      <DiffControlsFab
        groupIdx={groupIdx}
        changeGroupsLen={changeGroups.length}
        goToGroup={goToGroup}
      />
    </div>
  );
}

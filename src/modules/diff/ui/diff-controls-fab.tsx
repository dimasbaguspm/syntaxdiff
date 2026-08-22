import { ChevronDown, ChevronUp, Columns2, Rows3 } from "lucide-react";
import type { ViewMode } from "@/core/store";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { trackEvent } from "@/modules/analytics/lib/track";

export type DiffControlsFabProps = {
  /** Current diff layout mode. */
  mode: ViewMode;
  setMode: (m: ViewMode) => void;
  /** Selected change-group index; null = none selected yet (view at top). */
  groupIdx: number | null;
  changeGroupsLen: number;
  goToGroup: (dir: -1 | 1) => void;
  /** Stats for the accessible cluster label only (tally lives in the header). */
  added: number;
  removed: number;
};

/**
 * Floating bottom-right control cluster for the diff page: split/unified
 * toggle + prev/next change navigation. Fixed position so it stays reachable
 * on every viewport size and in both modes (the header only carries Back +
 * language + +/- tally).
 */
export function DiffControlsFab({
  mode,
  setMode,
  groupIdx,
  changeGroupsLen,
  goToGroup,
  added,
  removed,
}: DiffControlsFabProps) {
  const hasNav = changeGroupsLen > 0;

  return (
    <div
      role="group"
      aria-label={`Diff controls (+${added} / −${removed})`}
      className="fixed right-4 bottom-4 z-30 flex max-w-[calc(100vw-2rem)] items-center gap-0.5 rounded-2xl border border-edge bg-surface/90 p-1.5 shadow-[var(--shadow)] backdrop-blur"
    >
      <div className="flex shrink-0 items-center gap-0.5 rounded-lg border border-edge bg-surface-2/50 p-0.5">
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

      {hasNav && (
        <>
          <span className="mx-0.5 h-5 w-px shrink-0 bg-edge" />
          <Tooltip label="Previous change">
            <Button
              variant="ghost"
              onClick={() => goToGroup(-1)}
              disabled={(groupIdx ?? 0) === 0}
              aria-label="Previous change"
              className="size-10 justify-center p-0"
            >
              <ChevronUp className="size-4" aria-hidden="true" />
            </Button>
          </Tooltip>
          <span className="min-w-10 text-center text-xs text-dim tabular-nums" aria-live="polite">
            {(groupIdx ?? 0) + 1} / {changeGroupsLen}
          </span>
          <Tooltip label="Next change">
            <Button
              variant="ghost"
              onClick={() => goToGroup(1)}
              disabled={(groupIdx ?? 0) >= changeGroupsLen - 1}
              aria-label="Next change"
              className="size-10 justify-center p-0"
            >
              <ChevronDown className="size-4" aria-hidden="true" />
            </Button>
          </Tooltip>
        </>
      )}
    </div>
  );
}

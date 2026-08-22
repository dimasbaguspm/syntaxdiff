import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/button";
import { Tooltip } from "@/components/tooltip";
import { trackEvent } from "@/modules/analytics/lib/track";

export type DiffControlsFabProps = {
  /** Selected change-group index; null = none selected yet (view at top). */
  groupIdx: number | null;
  changeGroupsLen: number;
  goToGroup: (dir: -1 | 1) => void;
};

/**
 * Floating bottom-right control cluster for the diff page: change navigation
 * only (prev/next), stacked vertically. Fixed position so it stays reachable
 * on every viewport size. Split/Unified toggle lives in the header; the
 * +/- tally lives in the header too.
 */
export function DiffControlsFab({ groupIdx, changeGroupsLen, goToGroup }: DiffControlsFabProps) {
  const hasNav = changeGroupsLen > 0;
  if (!hasNav) return null;

  return (
    <div
      role="group"
      aria-label={`Change navigation (${(groupIdx ?? 0) + 1} of ${changeGroupsLen})`}
      className="fixed right-4 bottom-20 z-30 flex w-12 flex-col items-stretch gap-1 rounded-3xl border border-edge bg-surface/90 p-1.5 shadow-[var(--shadow)] backdrop-blur"
    >
      <Tooltip label="Previous change">
        <Button
          variant="ghost"
          onClick={() => {
            trackEvent("diff_prev_change");
            goToGroup(-1);
          }}
          aria-label="Previous change"
          className="flex size-9 items-center justify-center rounded-2xl p-0"
        >
          <ChevronUp className="size-4" aria-hidden="true" />
        </Button>
      </Tooltip>
      <span className="text-center text-xs text-dim tabular-nums" aria-live="polite">
        {(groupIdx ?? 0) + 1} / {changeGroupsLen}
      </span>
      <Tooltip label="Next change">
        <Button
          variant="ghost"
          onClick={() => {
            trackEvent("diff_next_change");
            goToGroup(1);
          }}
          aria-label="Next change"
          className="flex size-9 items-center justify-center rounded-2xl p-0"
        >
          <ChevronDown className="size-4" aria-hidden="true" />
        </Button>
      </Tooltip>
    </div>
  );
}

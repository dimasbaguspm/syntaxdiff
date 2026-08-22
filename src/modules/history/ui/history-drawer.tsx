import { FileDiff, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/modules/engine/ui/language-icon";
import { trackEvent } from "@/modules/analytics/lib/track";
import { Button } from "@/components/button";
import { SearchInput } from "@/components/inputs";
import { useCloseDrawer } from "@/components/app-layout/hooks/use-drawer-query";
import { useHistory } from "@/modules/history/hooks/use-history";

/** History drawer content — rendered inside the URL-driven DrawerHost. */
export function HistoryDrawer() {
  const navigate = useNavigate();
  const close = useCloseDrawer();
  // The drawer is mounted only when ?drawerId=history is present, so treat it as open.
  const { filtered, query, setQuery, clear, remove } = useHistory(true);

  const handleOpen = (id: string) => {
    close();
    trackEvent("open_diff");
    navigate(`/diff/${id}`);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <SearchInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          aria-label="Search history"
          className="flex-1"
        />
        {filtered.length > 0 && (
          <Button
            variant="danger"
            className="shrink-0 text-xs text-[var(--tint-rose-fg)]"
            onClick={() => void clear()}
          >
            Clear
          </Button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
          <FileDiff className="size-8 text-faint" aria-hidden="true" />
          <p className="text-sm text-faint">No diffs yet. Compare something to see it here.</p>
        </div>
      ) : (
        <div className="mt-2 flex flex-col gap-1.5">
          {filtered.map((d) => (
            <div
              key={d.id}
              className="flex items-center gap-2 rounded-lg border border-edge bg-well px-2 py-2 transition-colors hover:border-edge-strong"
            >
              <Button
                variant="bare"
                onClick={() => d.id !== undefined && handleOpen(d.id)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left"
              >
                <Icon name={d.lang} className="size-4 shrink-0 opacity-80" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {d.labelA ?? "Source A"} → {d.labelB ?? "Source B"}
                  </span>
                  <span className="block text-xs text-faint">
                    <span className="text-[var(--tint-emerald-fg)]">+{d.added}</span>
                    {" · "}
                    <span className="text-[var(--tint-rose-fg)]">−{d.removed}</span>
                    {" · "}
                    {new Date(d.createdAt).toLocaleString()}
                  </span>
                </span>
              </Button>
              <Button
                variant="danger"
                onClick={() =>
                  d.id !== undefined &&
                  (() => {
                    void remove(d.id);
                    trackEvent("delete_diff");
                  })()
                }
                aria-label="Delete"
                title="Delete"
                className="p-1 text-dim"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { FileDiff, Search, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@/modules/engine/ui/language-icon";
import { trackEvent } from "@/modules/analytics/lib/track";
import { Drawer } from "@/components/drawer";
import { useHistory } from "@/modules/history/hooks/use-history";

/** History drawer: searchable list of saved diffs with open/delete actions. */
export function HistoryDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const { filtered, query, setQuery, clear, remove } = useHistory(open);

  const handleOpen = (id: string) => {
    onClose();
    trackEvent("open_diff");
    navigate(`/diff/${id}`);
  };

  return (
    <Drawer open={open} title="History" onClose={onClose}>
      <div className="flex items-center gap-2 rounded-md border border-edge bg-well px-2 py-1.5">
        <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-transparent text-sm text-ink placeholder-faint focus:outline-none"
        />
        {filtered.length > 0 && (
          <button
            type="button"
            onClick={() => void clear()}
            className="shrink-0 text-xs text-[var(--tint-rose-fg)] transition-colors hover:bg-[var(--tint-rose-bg)]"
          >
            Clear
          </button>
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
              <button
                type="button"
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
              </button>
              <button
                type="button"
                onClick={() =>
                  d.id !== undefined &&
                  (() => {
                    void remove(d.id);
                    trackEvent("delete_diff");
                  })()
                }
                aria-label="Delete"
                title="Delete"
                className="rounded p-1 text-dim transition-colors hover:bg-[var(--tint-rose-bg)] hover:text-[var(--tint-rose-fg)]"
              >
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </Drawer>
  );
}

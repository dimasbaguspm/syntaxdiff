import { Bookmark, MessageSquareText, Moon, Sun } from "lucide-react";
import { useTheme } from "../hooks/use-theme";

const SITE_URL = "https://syntaxdiff.dimasbaguspm.dev";
const FEEDBACK_URL = "https://github.com/dimasbaguspm/syntaxdiff/issues";

export function BottomBar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const { theme, toggle } = useTheme();

  return (
    <footer className="relative z-30 shrink-0 border-t border-edge">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-1">
        <div className="flex items-center justify-start gap-0.5">
          <button
            type="button"
            onClick={onOpenHistory}
            aria-label="History"
            title="History"
            className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Bookmark className="size-4" aria-hidden />
          </button>
        </div>

        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-dim transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <span className="hidden sm:inline">syntaxdiff.dimasbaguspm.dev</span>
          <span className="sm:hidden">syntaxdiff</span>
        </a>

        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle theme"
            title="Toggle theme"
            className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun className="size-4" aria-hidden />
            ) : (
              <Moon className="size-4" aria-hidden />
            )}
          </button>
          <a
            href={FEEDBACK_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-strong sm:flex"
          >
            <MessageSquareText className="size-4" aria-hidden />
            Feedback
          </a>
        </div>
      </div>
    </footer>
  );
}

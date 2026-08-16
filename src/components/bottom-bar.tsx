import { useEffect, useState } from "react";
import { Bookmark, MessageSquareText, Moon, MoreVertical, Star, Sun } from "lucide-react";
import { GithubIcon } from "./icons/github-icon";
import { useTheme } from "../hooks/use-theme";
import { useGithubStars } from "../hooks/use-github-stars";
import { listDiffs } from "../db";
import { trackEvent } from "../lib/analytics/track";
import { DropdownMenu } from "./dropdown-menu";

const SITE_URL = "https://syntaxdiff.dimasbaguspm.dev";
const GITHUB_URL = "https://github.com/dimasbaguspm/syntaxdiff";
const FEEDBACK_URL = "https://github.com/dimasbaguspm/syntaxdiff/issues";

export function BottomBar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const { theme, toggle } = useTheme();
  const stars = useGithubStars();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    void listDiffs().then((d) => {
      if (active) setCount(d.length);
    });
    return () => {
      active = false;
    };
  }, []);

  const openHistory = () => {
    onOpenHistory();
    void listDiffs().then((d) => setCount(d.length));
  };

  return (
    <footer className="relative z-30 shrink-0 border-t border-edge">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-3 py-1">
        <div className="flex items-center justify-start gap-0.5">
          <button
            type="button"
            onClick={openHistory}
            aria-label="History"
            title="History"
            className="flex items-center gap-1.5 rounded px-1.5 py-1 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <Bookmark className="size-4" aria-hidden />
            <span className="hidden text-xs font-medium tabular-nums sm:inline">{count} Saved</span>
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
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            title="GitHub"
            onClick={() => trackEvent("nav_github")}
            className="flex items-center gap-1.5 rounded-full border border-edge bg-surface-2/50 px-2 py-1 text-dim transition-colors hover:border-edge-strong hover:bg-surface-2 hover:text-ink"
          >
            <GithubIcon size={14} />
            {stars !== null && (
              <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
                <Star className="size-3 text-[#C8A65B]" fill="currentColor" aria-hidden />
                {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
              </span>
            )}
          </a>

          <button
            type="button"
            onClick={() => {
              trackEvent("theme_toggle", { theme: theme === "dark" ? "light" : "dark" });
              toggle();
            }}
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
            onClick={() => trackEvent("feedback_click")}
            className="hidden items-center gap-1.5 text-xs font-medium text-accent transition-colors hover:text-accent-strong sm:flex"
          >
            <MessageSquareText className="size-4" aria-hidden />
            Feedback
          </a>

          <div className="sm:hidden">
            <DropdownMenu
              label="More"
              trigger={<MoreVertical className="size-4" aria-hidden />}
              side="top"
            >
              <a
                href={FEEDBACK_URL}
                target="_blank"
                rel="noreferrer"
                role="menuitem"
                onClick={() => trackEvent("feedback_click")}
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm text-ink transition-colors hover:bg-surface-2"
              >
                <MessageSquareText className="size-4 text-dim" aria-hidden />
                Feedback
              </a>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </footer>
  );
}

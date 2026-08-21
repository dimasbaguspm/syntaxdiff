import { useEffect, useState } from "react";
import {
  Bookmark,
  HelpCircle,
  MessageSquareText,
  Moon,
  MoreVertical,
  ScrollText,
  Star,
  Sun,
  Tag,
} from "lucide-react";
import { GithubIcon } from "@/components/icons/github-icon";
import { HelpModal } from "@/components/help-modal";
import { ChangelogModal } from "@/components/changelog-modal";
import { useTheme } from "@/hooks/use-theme";
import { useGithubStars } from "@/hooks/use-github-stars";
import { listDiffs } from "@/core/db";
import { trackEvent } from "@/modules/analytics/lib/track";
import { APP_VERSION } from "@/utils/version";
import { SITE_HOST, SITE_NAME, SITE_URL } from "@/utils/site";
import { DropdownMenu } from "@/components/dropdown-menu";
import { Tooltip } from "@/components/tooltip";

const GITHUB_URL = "https://github.com/dimasbaguspm/syntaxdiff";
const FEEDBACK_URL = "https://github.com/dimasbaguspm/syntaxdiff/issues";

export function BottomBar({ onOpenHistory }: { onOpenHistory: () => void }) {
  const { theme, toggle } = useTheme();
  const stars = useGithubStars();
  const [count, setCount] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);
  const [changelogOpen, setChangelogOpen] = useState(false);

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
          <Tooltip label="Changelog">
            <button
              type="button"
              onClick={() => {
                trackEvent("changelog_open");
                setChangelogOpen(true);
              }}
              aria-label="Changelog"
              className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <ScrollText className="size-4" aria-hidden />
            </button>
          </Tooltip>

          <Tooltip label="Help">
            <button
              type="button"
              onClick={() => {
                trackEvent("help_open");
                setHelpOpen(true);
              }}
              aria-label="Help"
              className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <HelpCircle className="size-4" aria-hidden />
            </button>
          </Tooltip>

          <Tooltip label="History">
            <button
              type="button"
              onClick={openHistory}
              aria-label="History"
              className="flex items-center gap-1.5 rounded px-1.5 py-1 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Bookmark className="size-4" aria-hidden />
              <span className="text-xs font-medium tabular-nums sm:hidden">{count}</span>
              <span className="hidden text-xs font-medium tabular-nums sm:inline">
                {count} Saved
              </span>
            </button>
          </Tooltip>
        </div>

        <a
          href={SITE_URL}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-dim transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <span className="hidden sm:inline">{SITE_HOST}</span>
          <span className="sm:hidden">{SITE_NAME}</span>
        </a>

        <div className="flex items-center justify-end gap-1 sm:gap-3">
          <span className="hidden items-center gap-1 rounded-full border border-edge px-2 py-0.5 text-[11px] font-medium text-accent sm:flex">
            <Tag className="size-3" aria-hidden />v{APP_VERSION}
          </span>

          <Tooltip label="GitHub">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              onClick={() => trackEvent("nav_github")}
              className="flex items-center gap-1.5 rounded-full border border-edge bg-surface-2/50 px-2 py-1 text-dim transition-colors hover:border-edge-strong hover:bg-surface-2 hover:text-ink"
            >
              <GithubIcon size={14} className="hidden sm:block" />
              {stars !== null && (
                <span className="flex items-center gap-1 text-xs font-medium tabular-nums">
                  <Star className="size-3 text-[#C8A65B]" fill="currentColor" aria-hidden />
                  {stars >= 1000 ? `${(stars / 1000).toFixed(1)}k` : stars}
                </span>
              )}
            </a>
          </Tooltip>

          <Tooltip label={theme === "dark" ? "Light mode" : "Dark mode"}>
            <button
              type="button"
              onClick={() => {
                trackEvent("theme_toggle", { theme: theme === "dark" ? "light" : "dark" });
                toggle();
              }}
              aria-label="Toggle theme"
              className="rounded p-1.5 text-dim transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {theme === "dark" ? (
                <Sun className="size-4" aria-hidden />
              ) : (
                <Moon className="size-4" aria-hidden />
              )}
            </button>
          </Tooltip>

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
              <div
                role="menuitem"
                aria-disabled
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-dim"
              >
                <Tag className="size-4" aria-hidden />v{APP_VERSION}
              </div>
            </DropdownMenu>
          </div>
        </div>
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
      <ChangelogModal open={changelogOpen} onClose={() => setChangelogOpen(false)} />
    </footer>
  );
}

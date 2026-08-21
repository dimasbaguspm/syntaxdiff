import { Download, Info, X } from "lucide-react";
import { usePwaUpdate } from "@/hooks/use-pwa-update";
import { Button } from "@/components/button";

/**
 * New-version CTA prompt. When the service worker detects a fresh build, we
 * ask the user to update instead of silently reloading. Also shows a one-time
 * "ready to work offline" note when the SW activates.
 */
export function PwaUpdateBanner() {
  const { needRefresh, offlineReady, acceptUpdate, dismiss, dismissOffline } = usePwaUpdate();

  if (needRefresh) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 flex justify-center px-4">
        <div
          role="alert"
          className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border border-[var(--tint-accent-bd,#c9a75c59)] bg-[var(--tint-amber-bg)] px-4 py-3 font-mono text-sm text-[var(--tint-amber-fg)] shadow-[var(--shadow)] backdrop-blur"
        >
          <Download className="size-4 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">A new version of SyntaxDiff is available.</p>
          <Button size="sm" onClick={acceptUpdate}>
            Update
          </Button>
          <Button
            variant="ghost"
            onClick={dismiss}
            aria-label="Dismiss update"
            className="shrink-0 p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  if (offlineReady) {
    return (
      <div className="pointer-events-none fixed inset-x-0 bottom-16 z-50 flex justify-center px-4">
        <div
          role="status"
          className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg border border-[var(--tint-sky-bd)] bg-[var(--tint-sky-bg)] px-4 py-3 font-mono text-sm text-[var(--tint-sky-fg)] shadow-[var(--shadow)] backdrop-blur"
        >
          <Info className="size-4 shrink-0" aria-hidden />
          <p className="min-w-0 flex-1">SyntaxDiff is ready to work offline.</p>
          <Button
            variant="ghost"
            onClick={dismissOffline}
            aria-label="Dismiss offline notice"
            className="shrink-0 p-0.5 opacity-70 transition-opacity hover:opacity-100"
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    );
  }

  return null;
}

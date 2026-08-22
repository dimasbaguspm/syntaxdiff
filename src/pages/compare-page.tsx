import { useEffect } from "react";
import { CompareProvider } from "@/modules/compare/providers/compare-provider";
import { CompareView } from "@/modules/compare/ui/compare-view";

/**
 * Compare route entry. All compare logic lives in the compare module.
 *
 * File-drop note: the browser's default action for a file dragged anywhere on
 * the page is to navigate to / open the file, which swallows the drop before
 * our pane handlers get a chance. We prevent that at the window level so the
 * drop always reaches the pane's native listeners. (Per-pane listeners still do
 * the actual import; this guard only stops the browser hijack.)
 */
export function ComparePage() {
  useEffect(() => {
    // CRITICAL: preventDefault on BOTH dragover and drop, unconditionally.
    // The browser only allows a drop when dragover.preventDefault() ran —
    // if we gate it behind a `types.includes("Files")` check, that check can
    // be empty/null during dragover and the prevent never happens, so the
    // browser opens the file and our pane handlers never fire (no logs, no
    // network, no store update). Unconditional preventDefault is the
    // bulletproof pattern for file-drop zones.
    const prevent = (e: DragEvent) => {
      e.preventDefault();
    };
    // Capture phase so it beats any other listener and runs before the
    // browser's default file-open.
    window.addEventListener("dragover", prevent, { capture: true });
    window.addEventListener("drop", prevent, { capture: true });
    return () => {
      window.removeEventListener("dragover", prevent, { capture: true });
      window.removeEventListener("drop", prevent, { capture: true });
    };
  }, []);

  return (
    <CompareProvider>
      <CompareView />
    </CompareProvider>
  );
}

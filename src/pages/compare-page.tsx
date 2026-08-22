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
    const prevent = (e: DragEvent) => {
      // Only block drops that carry files — leave text/link drags alone.
      if (e.dataTransfer?.types?.includes("Files")) {
        e.preventDefault();
      }
    };
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", prevent);
    return () => {
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", prevent);
    };
  }, []);

  return (
    <CompareProvider>
      <CompareView />
    </CompareProvider>
  );
}

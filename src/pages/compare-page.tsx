import { CompareProvider } from "@/modules/compare/providers/compare-provider";
import { CompareView } from "@/modules/compare/ui/compare-view";

/** Thin route entry — all compare logic lives in the compare module. */
export function ComparePage() {
  return (
    <CompareProvider>
      <CompareView />
    </CompareProvider>
  );
}

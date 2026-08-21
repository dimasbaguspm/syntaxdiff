import { DiffProvider } from "@/modules/diff/providers/diff-provider";
import { DiffPageView } from "@/modules/diff/ui/diff-page-view";

/** Thin route entry — diff loading/record state lives in the diff module. */
export function DiffPage() {
  return (
    <DiffProvider>
      <DiffPageView />
    </DiffProvider>
  );
}

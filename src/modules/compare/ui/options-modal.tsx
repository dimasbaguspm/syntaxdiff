import { Modal } from "@/components/modal";
import { TogglesPanel } from "@/components/toggles-panel";
import type { LanguageAdapter } from "@/modules/engine/lib/types";

/** Options modal — wraps the language-specific toggle set in a Modal. */
export function OptionsModal({
  open,
  onClose,
  adapter,
}: {
  open: boolean;
  onClose: () => void;
  adapter: LanguageAdapter;
}) {
  return (
    <Modal open={open} title={`Options — ${adapter.label}`} onClose={onClose}>
      <TogglesPanel adapter={adapter} />
    </Modal>
  );
}

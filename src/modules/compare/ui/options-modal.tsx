import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { BottomSheet } from "@/components/bottom-sheet";
import { Modal } from "@/components/modal";
import { TogglesPanel } from "@/components/toggles-panel";
import type { LanguageAdapter } from "@/modules/engine/lib/types";

function useIsMobile(bp = 768): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const h = () => setMobile(m.matches);
    h();
    m.addEventListener("change", h);
    return () => m.removeEventListener("change", h);
  }, [bp]);
  return mobile;
}

/** Route-driven options sheet: ?sheet=options → BottomSheet on mobile, Modal on desktop. */
export function OptionsModal({
  open,
  onClose,
  adapter,
}: {
  open: boolean;
  onClose: () => void;
  adapter: LanguageAdapter;
}) {
  const isMobile = useIsMobile();
  if (!open) return null;
  const title = `Options - ${adapter.label}`;
  const body = <TogglesPanel adapter={adapter} />;
  const node = isMobile ? (
    <BottomSheet open title={title} onClose={onClose}>
      {body}
    </BottomSheet>
  ) : (
    <Modal open title={title} onClose={onClose}>
      {body}
    </Modal>
  );
  return createPortal(node, document.body);
}

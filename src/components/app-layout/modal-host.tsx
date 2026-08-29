import { createPortal } from "react-dom";
import { useModalQuery, useCloseModal } from "@/components/app-layout/hooks/use-modal-query";
import { Modal } from "@/components/modal";
import { BottomSheet } from "@/components/bottom-sheet";
import { HelpModal } from "@/components/help-modal";
import { ChangelogModal } from "@/components/changelog-modal";
import { useEffect, useState } from "react";

function useIsMobile(bp = 768): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(`(max-width: ${bp - 1}px)`);
    const handler = () => setMobile(m.matches);
    handler();
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [bp]);
  return mobile;
}

export function ModalHost() {
  const modal = useModalQuery();
  const close = useCloseModal();
  const isMobile = useIsMobile();

  if (!modal) return null;

  const inner =
    modal === "help" ? (
      <HelpModal open onClose={close} bare />
    ) : (
      <ChangelogModal open onClose={close} bare />
    );

  // Route-driven: ?modal=help|changelog — separate from ?drawerId and ?sheet.
  // Mobile renders BottomSheet, desktop renders Modal — no overlapping scrims.
  const node = isMobile ? (
    <BottomSheet
      open
      title={modal === "help" ? "How to use SyntaxDiff" : "Changelog"}
      onClose={close}
    >
      {inner}
    </BottomSheet>
  ) : (
    <Modal open title={modal === "help" ? "How to use SyntaxDiff" : "Changelog"} onClose={close}>
      {inner}
    </Modal>
  );

  return createPortal(node, document.body);
}

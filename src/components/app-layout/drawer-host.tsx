import { createPortal } from "react-dom";
import { Drawer } from "@/components/drawer";
import { useCloseDrawer, useDrawerQuery } from "@/components/app-layout/hooks/use-drawer-query";

/** Maps a drawerId (from ?drawerId=) to its rendered content. */
export type DrawerRegistry = Record<string, (args: unknown) => React.ReactNode>;

/**
 * Single source of mounted drawers. Reads the URL (?drawerId=history&drawerArgs=…)
 * and renders the matching drawer through a portal on document.body, so drawers
 * are addressable/deep-linkable rather than toggled by local component state.
 */
export function DrawerHost({ registry }: { registry: DrawerRegistry }) {
  const { id, args } = useDrawerQuery();
  const close = useCloseDrawer();

  if (!id || !registry[id]) return null;

  return createPortal(
    <Drawer open title={id} onClose={close}>
      {registry[id](args)}
    </Drawer>,
    document.body,
  );
}

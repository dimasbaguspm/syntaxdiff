import type { ReactNode } from "react";
import { BottomBar } from "@/components/app-layout/bottom-bar";
import { DrawerHost, type DrawerRegistry } from "@/components/app-layout/drawer-host";

/**
 * Top-level layout shell: routes in <main>, the persistent BottomBar footer, and
 * the URL-driven DrawerHost. Drawer registration is injected from core so the
 * shell stays a presentational wrapper while wiring lives in core/.
 */
export function AppShell({
  children,
  drawerRegistry,
}: {
  children: ReactNode;
  drawerRegistry: DrawerRegistry;
}) {
  return (
    <div className="flex h-screen flex-col supports-[height:100dvh]:h-dvh">
      <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">{children}</main>
      <BottomBar />
      <DrawerHost registry={drawerRegistry} />
    </div>
  );
}

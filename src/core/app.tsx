import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/app-layout/app-shell";
import { HistoryDrawer } from "@/modules/history/ui/history-drawer";
import { PwaUpdateBanner } from "@/components/pwa-update-banner";
import { Snack } from "@/components/snack";
import { ComparePage } from "@/pages/compare-page";
import { DiffPage } from "@/pages/diff-page";
import { Spinner } from "@/components/ui";
import { useAppBoot } from "@/hooks/use-app-boot";

// Drawer registration lives in core: the shell renders, core wires which
// drawerId maps to which module component.
const drawerRegistry = {
  history: () => <HistoryDrawer />,
};

export default function App() {
  const ready = useAppBoot();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppShell drawerRegistry={drawerRegistry}>
        <Routes>
          <Route path="/" element={<ComparePage />} />
          <Route path="/diff/:id" element={<DiffPage />} />
        </Routes>
      </AppShell>
      <Snack />
      <PwaUpdateBanner />
    </BrowserRouter>
  );
}

import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BottomBar } from "@/components/bottom-bar";
import { HistoryDrawer } from "@/components/history-drawer";
import { PwaUpdateBanner } from "@/components/pwa-update-banner";
import { Snack } from "@/components/snack";
import { ComparePage } from "@/pages/compare-page";
import { DiffPage } from "@/pages/diff-page";
import { Spinner } from "@/components/ui";
import { useAppBoot } from "@/hooks/use-app-boot";

export default function App() {
  const ready = useAppBoot();
  const [historyOpen, setHistoryOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <Spinner />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex h-screen flex-col supports-[height:100dvh]:h-dvh">
        <main className="flex min-h-0 w-full flex-1 flex-col overflow-hidden">
          <Routes>
            <Route path="/" element={<ComparePage />} />
            <Route path="/diff/:id" element={<DiffPage />} />
          </Routes>
        </main>
        <BottomBar onOpenHistory={() => setHistoryOpen(true)} />
      </div>
      <HistoryDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} />
      <Snack />
      <PwaUpdateBanner />
    </BrowserRouter>
  );
}

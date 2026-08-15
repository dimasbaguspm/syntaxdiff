import { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BottomBar } from "./components/BottomBar";
import { HistoryDrawer } from "./components/HistoryDrawer";
import { ComparePage } from "./pages/ComparePage";
import { DiffPage } from "./pages/DiffPage";

export default function App() {
  const [historyOpen, setHistoryOpen] = useState(false);

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
    </BrowserRouter>
  );
}

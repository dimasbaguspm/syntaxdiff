import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { adapters, applyOptsDefaults, autoDetect, getAdapter } from "@/modules/engine/lib";
import type { LanguageId } from "@/modules/engine/lib/types";
import { useStore } from "@/core/store";
import { useBaseDiff } from "@/core/stores/use-base-diff";
import { saveDiff } from "@/core/db";
import { createDiffClient } from "@/core/worker/client";
import { trackEvent } from "@/modules/analytics/lib/track";
import { logError } from "@/modules/analytics/lib/otel";
import { languageFromExtension } from "@/modules/compare/lib/file-language";
import { usePaneStatus } from "@/modules/compare/hooks/use-pane-status";
import {
  CompareContext,
  type CompareContextValue,
  type Side,
} from "@/modules/compare/providers/context";

const client = createDiffClient();

/**
 * Owns all compare-screen orchestration: store wiring, adapter resolution,
 * per-pane validation, file import, validate/format mutations, and the diff
 * run. UI components consume it through `useCompare()` — no store reads leak
 * into the view layer.
 */
export function CompareProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const sideA = useBaseDiff("a");
  const sideB = useBaseDiff("b");
  const a = sideA.value;
  const b = sideB.value;
  const lang = useStore((s) => s.lang);
  const opts = useStore((s) => s.opts);
  const status = useStore((s) => s.status);
  const setLangStore = useStore((s) => s.setLang);
  const runStart = useStore((s) => s.runStart);
  const runSuccess = useStore((s) => s.runSuccess);
  const runError = useStore((s) => s.runError);
  const showSnack = useStore((s) => s.showSnack);

  const [optionsOpen, setOptionsOpen] = useState(false);

  const adapter = useMemo(
    () => (lang === "auto" ? autoDetect(a || b) : getAdapter(lang as LanguageId)),
    [lang, a, b],
  );
  const eOpts = useMemo(() => applyOptsDefaults(adapter, opts), [adapter, opts]);
  const statusA = usePaneStatus(a, adapter, eOpts);
  const statusB = usePaneStatus(b, adapter, eOpts);

  const sides: Record<
    Side,
    {
      value: string;
      label: string;
      set: (v: string) => void;
      setLabel: (v: string) => void;
      status: ReturnType<typeof usePaneStatus>;
    }
  > = {
    a: {
      value: a,
      label: sideA.label,
      set: sideA.setValue,
      setLabel: sideA.setLabel,
      status: statusA,
    },
    b: {
      value: b,
      label: sideB.label,
      set: sideB.setValue,
      setLabel: sideB.setLabel,
      status: statusB,
    },
  };

  const importFile = (side: Side, file: File, method: "drop" | "button") => {
    const ext = languageFromExtension(file.name);
    void file
      .text()
      .then((text) => {
        // Same callback as paste/type so content-based auto-detection runs
        // exactly like manual input (no language forcing).
        sides[side].set(text);
        trackEvent("import_file", { method, ext, lang: adapter.id, bytes: file.size });
        showSnack(`Imported ${file.name}`, "success");
      })
      .catch((e) => {
        showSnack(`Failed to read ${file.name}`, "error");
        logError(e, "import file failed", { name: file.name });
      });
  };

  const validate = (side: Side) => {
    const value = sides[side].value;
    try {
      adapter.format(value, eOpts);
      showSnack(`Valid ${adapter.label}`, "success");
      trackEvent("validate", { lang: adapter.id, ok: "true" });
    } catch (e) {
      showSnack(`Invalid ${adapter.label}: ${(e as Error).message}`, "error");
      logError(e, "validate failed", { lang: adapter.id });
      trackEvent("validate", { lang: adapter.id, ok: "false" });
    }
  };

  const formatPane = (side: Side) => {
    const { value, set } = sides[side];
    try {
      set(adapter.format(value, eOpts).canonical);
      showSnack(`Formatted as ${adapter.label}`, "success");
      trackEvent("format", { lang: adapter.id, ok: "true" });
    } catch (e) {
      showSnack((e as Error).message, "error");
      logError(e, "format failed", { lang: adapter.id });
      trackEvent("format", { lang: adapter.id, ok: "false" });
    }
  };

  const onCompare = async () => {
    runStart();
    trackEvent("compare", { lang: adapter.id });
    try {
      const res = await client.diff({ a, b, lang: adapter.id, opts });
      const id = await saveDiff({
        createdAt: Date.now(),
        lang: res.language,
        opts,
        a,
        b,
        labelA: sideA.label,
        labelB: sideB.label,
        patch: res.patch,
        lines: res.lines,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      runSuccess(res);
      trackEvent("compare_done", {
        lang: res.language,
        added: res.counts.added,
        removed: res.counts.removed,
      });
      navigate(`/diff/${id}`);
    } catch (e) {
      runError((e as Error).message);
      logError(e, "compare failed", { lang: adapter.id });
    }
  };

  const getPane = (side: Side) => {
    const s = sides[side];
    return {
      side,
      label: s.label,
      value: s.value,
      status: s.status,
      icon: adapter.id,
      onLabelChange: s.setLabel,
      onChange: s.set,
      onImportFile: (file: File, method: "drop" | "button") => importFile(side, file, method),
    };
  };

  const value: CompareContextValue = {
    adapter,
    lang,
    status,
    optionsOpen,
    adapters,
    getPane,
    setLang: (l) => {
      setLangStore(l);
      trackEvent("change_language", { lang: l });
    },
    openOptions: () => {
      setOptionsOpen(true);
      trackEvent("open_options");
    },
    closeOptions: () => setOptionsOpen(false),
    compare: onCompare,
    validateSide: validate,
    formatSide: formatPane,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

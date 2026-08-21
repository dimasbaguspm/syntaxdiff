import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { useCompare } from "@/modules/compare/providers/context";
import type { LangChoice } from "@/core/store";
import { Button } from "@/components/button";
import { SplitPanes } from "@/components/split-panes";
import { Tooltip } from "@/components/tooltip";
import { Spinner } from "@/components/ui";
import { Pane } from "@/modules/compare/ui/pane";
import { OptionsModal } from "@/modules/compare/ui/options-modal";
import { SelectInput } from "@/components/inputs";

/** Compare screen layout: language toolbar, two source panes, options modal. */
export function CompareView() {
  const {
    adapter,
    lang,
    status,
    adapters,
    setLang,
    openOptions,
    compare,
    optionsOpen,
    closeOptions,
    getPane,
  } = useCompare();

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-edge bg-surface/40 px-4 py-2">
        <SelectInput
          value={lang}
          onChange={(e) => setLang(e.target.value as LangChoice)}
          className="max-w-[10rem] sm:max-w-[16rem]"
        >
          <option value="auto">Auto ({adapter.label})</option>
          {adapters.map((ad) => (
            <option key={ad.id} value={ad.id}>
              {ad.label}
            </option>
          ))}
        </SelectInput>

        <div className="ml-auto flex items-center gap-2">
          <Tooltip label="Options">
            <Button variant="ghost" onClick={openOptions} aria-label="Options" className="p-1">
              <SlidersHorizontal className="size-4" aria-hidden />
            </Button>
          </Tooltip>

          <Tooltip label="Compare">
            <Button
              variant="primary"
              onClick={compare}
              disabled={status === "running" || !getPane("a").value || !getPane("b").value}
              aria-label="Compare"
            >
              {status === "running" ? (
                <Spinner />
              ) : (
                <>
                  <span className="hidden sm:inline">Compare</span>
                  <ChevronRight className="size-4" aria-hidden />
                </>
              )}
            </Button>
          </Tooltip>
        </div>
      </div>

      <SplitPanes orientation="vertical" left={<Pane side="a" />} right={<Pane side="b" />} />

      <OptionsModal open={optionsOpen} onClose={closeOptions} adapter={adapter} />
    </div>
  );
}

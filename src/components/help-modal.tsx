import { Modal } from "./modal";

const STEPS = [
  "Paste Source A and Source B into the two panes.",
  "Pick a language (or Auto) and set options like sort keys or a SQL dialect.",
  "Click Compare to get a structure-aware diff.",
  "Switch between Split (side-by-side) and Unified view; drag the divider to resize.",
  "Past diffs are saved to local history (bottom left) for search and reuse.",
];

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} title="How to use SyntaxDiff" onClose={onClose}>
      <ol className="flex flex-col gap-3">
        {STEPS.map((step, i) => (
          <li key={i} className="flex gap-3 text-sm text-ink">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
              {i + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    </Modal>
  );
}

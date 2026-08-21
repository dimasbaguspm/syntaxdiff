import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/button";

/** Shared UI class constants — mirrors the uncover64 design system. */
export const btn =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-edge bg-surface-2 px-3 py-2 text-sm font-medium text-ink transition-colors hover:border-edge-strong hover:bg-[var(--edge)] focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:cursor-not-allowed disabled:opacity-50";

export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition-colors hover:bg-accent-strong focus:outline-none focus:ring-2 focus:ring-accent/50 disabled:cursor-not-allowed disabled:opacity-50";

export const btnActive =
  "border-accent/60 bg-accent/10 text-accent hover:border-accent/60 hover:bg-accent/15";

export const inputCls =
  "w-full rounded-lg border border-edge bg-well px-3 py-2 text-sm text-ink placeholder-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20";

export function Spinner() {
  return (
    <span className="inline-block size-4 animate-spin rounded-full border-2 border-edge border-t-accent" />
  );
}

export function ErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      role="alert"
      className="rounded-lg border border-[var(--tint-rose-bd)] bg-[var(--tint-rose-bg)] px-4 py-3 font-mono text-sm text-[var(--tint-rose-fg)]"
    >
      {message}
    </div>
  );
}

export function CopyButton({
  value,
  label = "Copy",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable — ignore
    }
  };
  return (
    <Button className={className} onClick={() => void copy()}>
      {copied ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <Copy className="size-3.5" aria-hidden />
      )}
      {copied ? "Copied" : label}
    </Button>
  );
}

import { clsx } from "clsx";
import type { ComponentPropsWithoutRef } from "react";
import { btn, btnActive, btnPrimary } from "@/components/ui";

/** Visual variants built from the shared tokens in components/ui. */
export type ButtonVariant = "primary" | "ghost" | "segment" | "danger" | "bare";

/** Variant → class token. `bare` opts out of all preset styling (Switch, menu items). */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: btnPrimary,
  ghost: "rounded text-dim transition-colors hover:bg-surface-2 hover:text-ink",
  segment:
    "inline-flex items-center justify-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-dim transition-colors hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/40",
  danger:
    "rounded transition-colors hover:bg-[var(--tint-rose-bg)] hover:text-[var(--tint-rose-fg)]",
  bare: "",
};

const SIZE_CLASSES = {
  sm: "px-2.5 py-1 text-xs",
  md: "",
} as const;

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  /** Visual style; omitted → standard bordered button (btn). */
  variant?: ButtonVariant;
  size?: keyof typeof SIZE_CLASSES;
  /** Highlights segment-style toggles (adds btnActive). */
  active?: boolean;
};

/**
 * Polymorphic button: <Button attrs><Icon/>Text</Button>.
 * Defaults `type="button"` and spreads native attributes last so callers can
 * override anything; className is always merged with the variant classes.
 */
export function Button({
  variant,
  size = "md",
  active = false,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={clsx(
        variant === undefined ? btn : VARIANT_CLASSES[variant],
        size !== "md" && SIZE_CLASSES[size],
        active && btnActive,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

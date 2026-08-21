import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface HiddenInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/** Thin wrapper rendering a hidden `<input>` (e.g. programmatic file inputs). */
export const HiddenInput = forwardRef<HTMLInputElement, HiddenInputProps>(function HiddenInput(
  { className, type = "hidden", ...rest },
  ref,
) {
  return <input ref={ref} type={type} className={clsx("hidden", className)} {...rest} />;
});

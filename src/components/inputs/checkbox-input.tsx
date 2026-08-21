import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface CheckboxInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

/** Styled `<input type="checkbox">` using the accent token. */
export const CheckboxInput = forwardRef<HTMLInputElement, CheckboxInputProps>(
  function CheckboxInput({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        type="checkbox"
        className={clsx("size-4 accent-[var(--accent)]", className)}
        {...rest}
      />
    );
  },
);

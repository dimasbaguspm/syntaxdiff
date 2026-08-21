import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { clsx } from "clsx";
import { inputBase } from "./styles";

export interface SelectInputOption {
  value: string;
  label: string;
}

export interface SelectInputProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  "children"
> {
  className?: string;
  /** Convenience alternative to manually writing `<option>` children. */
  options?: SelectInputOption[];
  /** Manual `<option>` children (used when options need non-trivial markup). */
  children?: ReactNode;
}

/** Styled `<select>` — accepts either `options` or raw `<option>` children. */
export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(function SelectInput(
  { className, options, children, ...rest },
  ref,
) {
  return (
    <select ref={ref} className={clsx(inputBase, className)} {...rest}>
      {options
        ? options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))
        : children}
    </select>
  );
});

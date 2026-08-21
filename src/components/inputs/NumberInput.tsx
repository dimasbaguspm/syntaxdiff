import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";
import { inputBase } from "./styles";

export interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  className?: string;
}

/** Styled `<input type="number">`. */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  { className, ...rest },
  ref,
) {
  return <input ref={ref} type="number" className={clsx(inputBase, className)} {...rest} />;
});

import { forwardRef, type InputHTMLAttributes } from "react";
import { clsx } from "clsx";
import { inputBase } from "./styles";

export interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

/** Styled `<input type="text">` (or any text-like type via the `type` prop). */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { className, type = "text", ...rest },
  ref,
) {
  return <input ref={ref} type={type} className={clsx(inputBase, className)} {...rest} />;
});

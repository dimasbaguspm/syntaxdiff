import { forwardRef, type TextareaHTMLAttributes } from "react";
import { clsx } from "clsx";
import { inputBase } from "./styles";

export interface TextareaInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

/** Styled `<textarea>` reusing the entry-editor surface tokens. */
export const TextareaInput = forwardRef<HTMLTextAreaElement, TextareaInputProps>(
  function TextareaInput({ className, ...rest }, ref) {
    return <textarea ref={ref} className={clsx(inputBase, "resize-none", className)} {...rest} />;
  },
);

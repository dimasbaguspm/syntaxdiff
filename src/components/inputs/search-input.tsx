import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { clsx } from "clsx";
import { Search } from "lucide-react";

export interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  /** Leading icon (defaults to a Search glyph). Pass `null` to hide it. */
  icon?: ReactNode | null;
}

/** Styled search field with an optional leading icon. Mirrors the other
 * input primitives (SelectInput, TextInput) for consistent styling. */
export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    className,
    icon = <Search className="size-4 shrink-0 text-faint" aria-hidden="true" />,
    type = "search",
    ...rest
  },
  ref,
) {
  return (
    <label className={clsx("relative flex min-w-0 items-center", className)}>
      {icon !== null && <span className="pointer-events-none absolute left-3 flex">{icon}</span>}
      <input
        ref={ref}
        type={type}
        className={clsx(
          "w-full rounded-lg border border-edge bg-well py-1.5 text-sm text-ink placeholder-faint focus:border-accent/60 focus:outline-none focus:ring-2 focus:ring-accent/20",
          icon !== null ? "pl-9" : "pl-3",
          "pr-3",
        )}
        {...rest}
      />
    </label>
  );
});

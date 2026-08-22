import type { LanguageId } from "@/modules/engine/lib";
import { LANGUAGE_PATHS } from "./language-paths";

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Language whose Material Symbol should render. */
  name: LanguageId;
}

/** Inline Material Symbols icon for a language (auto-detected or explicit).
 *
 * Rendered as an inline <svg> with `fill="currentColor"` so the glyph inherits
 * the surrounding text color — apply `text-dim` / `text-accent` etc. via
 * className. (An <img> data-URI cannot inherit currentColor, so the previous
 * implementation ignored the color class entirely.) */
export function Icon({ name, className, ...attrs }: IconProps) {
  return (
    <svg viewBox="0 -960 960 960" fill="currentColor" aria-hidden className={className} {...attrs}>
      <path d={LANGUAGE_PATHS[name]} />
    </svg>
  );
}

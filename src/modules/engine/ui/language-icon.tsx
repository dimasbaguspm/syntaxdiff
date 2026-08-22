import type { LanguageId } from "@/modules/engine/lib";

// Material Symbols (weight 400, outlined) — tree-shaken per-icon SVG imports.
// Vite inlines small SVGs as data URLs and content-hashes larger ones; either
// way they end up precached by the PWA like any other asset.
import jsonIcon from "@material-symbols/svg-400/outlined/data_object.svg";
import yamlIcon from "@material-symbols/svg-400/outlined/code_blocks.svg";
import sqlIcon from "@material-symbols/svg-400/outlined/database.svg";
import csvIcon from "@material-symbols/svg-400/outlined/table_rows.svg";
import tomlIcon from "@material-symbols/svg-400/outlined/settings_applications.svg";
import xmlIcon from "@material-symbols/svg-400/outlined/code.svg";
import plainIcon from "@material-symbols/svg-400/outlined/description.svg";
import jsIcon from "@material-symbols/svg-400/outlined/javascript.svg";
import tsIcon from "@material-symbols/svg-400/outlined/code.svg";
import goIcon from "@material-symbols/svg-400/outlined/deployed_code.svg";
import phpIcon from "@material-symbols/svg-400/outlined/code_blocks.svg";
import codeIcon from "@material-symbols/svg-400/outlined/code.svg";

const ICONS: Record<LanguageId, string> = {
  json: jsonIcon,
  json5: jsonIcon,
  jsonc: jsonIcon,
  yaml: yamlIcon,
  yml: yamlIcon,
  sql: sqlIcon,
  csv: csvIcon,
  toml: tomlIcon,
  xml: xmlIcon,
  plain: plainIcon,
  js: jsIcon,
  ts: tsIcon,
  go: goIcon,
  php: phpIcon,
  ruby: codeIcon,
  rust: codeIcon,
  kotlin: codeIcon,
  java: codeIcon,
  html: codeIcon,
  css: codeIcon,
  less: codeIcon,
  scss: codeIcon,
  markdown: yamlIcon,
  mdx: codeIcon,
  vue: codeIcon,
  angular: codeIcon,
  svelte: codeIcon,
  astro: codeIcon,
  graphql: codeIcon,
  gherkin: codeIcon,
  handlebars: codeIcon,
  pug: codeIcon,
  "go-template": codeIcon,
  nginx: codeIcon,
  sh: codeIcon,
  glimmer: codeIcon,
};

export interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Language whose Material Symbol should render. */
  name: LanguageId;
}

/** Material Symbols icon for a language (auto-detected or explicit).
 * Uses `text-accent` (the same accent as the bottom bar) so the glyph
 * inherits the brand accent color via currentColor. Callers' className
 * (sizing/opacity) is merged on top. */
export function Icon({ name, className, ...attrs }: IconProps) {
  return (
    <img
      src={ICONS[name]}
      alt=""
      aria-hidden
      className={`text-accent ${className ?? ""}`}
      {...attrs}
    />
  );
}

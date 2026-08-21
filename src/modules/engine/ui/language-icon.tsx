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

const ICONS: Record<LanguageId, string> = {
  json: jsonIcon,
  yaml: yamlIcon,
  sql: sqlIcon,
  csv: csvIcon,
  toml: tomlIcon,
  xml: xmlIcon,
  plain: plainIcon,
};

export interface IconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Language whose Material Symbol should render. */
  name: LanguageId;
}

/** Material Symbols icon for a language (auto-detected or explicit). */
export function Icon({ name, ...attrs }: IconProps) {
  return <img src={ICONS[name]} alt="" aria-hidden {...attrs} />;
}

import type { LanguageAdapter, LanguageId } from "@/modules/engine/lib/types";
import { angularAdapter } from "@/modules/engine/lib/adapters/angular";
import { astroAdapter } from "@/modules/engine/lib/adapters/astro";
import { cssAdapter } from "@/modules/engine/lib/adapters/css";
import { csvAdapter } from "@/modules/engine/lib/adapters/csv";
import { gherkinAdapter } from "@/modules/engine/lib/adapters/gherkin";
import { goAdapter } from "@/modules/engine/lib/adapters/go";
import { goTemplateAdapter } from "@/modules/engine/lib/adapters/go-template";
import { graphqlAdapter } from "@/modules/engine/lib/adapters/graphql";
import { handlebarsAdapter } from "@/modules/engine/lib/adapters/handlebars";
import { htmlAdapter } from "@/modules/engine/lib/adapters/html";
import { javaAdapter } from "@/modules/engine/lib/adapters/java";
import { jsAdapter } from "@/modules/engine/lib/adapters/js";
import { json5Adapter } from "@/modules/engine/lib/adapters/json5";
import { jsonAdapter } from "@/modules/engine/lib/adapters/json";
import { jsoncAdapter } from "@/modules/engine/lib/adapters/jsonc";
import { kotlinAdapter } from "@/modules/engine/lib/adapters/kotlin";
import { lessAdapter } from "@/modules/engine/lib/adapters/less";
import { markdownAdapter } from "@/modules/engine/lib/adapters/markdown";
import { mdxAdapter } from "@/modules/engine/lib/adapters/mdx";
import { nginxAdapter } from "@/modules/engine/lib/adapters/nginx";
import { phpAdapter } from "@/modules/engine/lib/adapters/php";
import { plainAdapter } from "@/modules/engine/lib/adapters/plain";
import { pugAdapter } from "@/modules/engine/lib/adapters/pug";
import { rubyAdapter } from "@/modules/engine/lib/adapters/ruby";
import { rustAdapter } from "@/modules/engine/lib/adapters/rust";
import { scssAdapter } from "@/modules/engine/lib/adapters/scss";
import { shAdapter } from "@/modules/engine/lib/adapters/sh";
import { sqlAdapter } from "@/modules/engine/lib/adapters/sql";
import { svelteAdapter } from "@/modules/engine/lib/adapters/svelte";
import { tomlAdapter } from "@/modules/engine/lib/adapters/toml";
import { tsAdapter } from "@/modules/engine/lib/adapters/ts";
import { vueAdapter } from "@/modules/engine/lib/adapters/vue";
import { xmlAdapter } from "@/modules/engine/lib/adapters/xml";
import { yamlAdapter } from "@/modules/engine/lib/adapters/yaml";
import { ymlAdapter } from "@/modules/engine/lib/adapters/yml";
import { glimmerAdapter } from "@/modules/engine/lib/adapters/glimmer";

export const adapters: LanguageAdapter[] = [
  jsonAdapter,
  json5Adapter,
  jsoncAdapter,
  yamlAdapter,
  ymlAdapter,
  sqlAdapter,
  csvAdapter,
  tomlAdapter,
  xmlAdapter,
  jsAdapter,
  tsAdapter,
  goAdapter,
  phpAdapter,
  rubyAdapter,
  rustAdapter,
  kotlinAdapter,
  javaAdapter,
  htmlAdapter,
  cssAdapter,
  lessAdapter,
  scssAdapter,
  markdownAdapter,
  mdxAdapter,
  vueAdapter,
  angularAdapter,
  svelteAdapter,
  astroAdapter,
  graphqlAdapter,
  gherkinAdapter,
  handlebarsAdapter,
  pugAdapter,
  goTemplateAdapter,
  nginxAdapter,
  shAdapter,
  glimmerAdapter,
  plainAdapter,
];

export function getAdapter(id: LanguageId): LanguageAdapter {
  const adapter = adapters.find((a) => a.id === id);
  if (!adapter) throw new Error(`Unknown language: ${id}`);
  return adapter;
}

/** Pick the best language by heuristic confidence; falls back to Plain Text. */
export function autoDetect(input: string): LanguageAdapter {
  let best = plainAdapter;
  let bestScore = 0;
  for (const adapter of adapters) {
    if (adapter.id === "plain") continue;
    const score = adapter.detect(input);
    if (score > bestScore) {
      bestScore = score;
      best = adapter;
    }
  }
  return best;
}

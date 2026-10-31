/**
 * Gera os SVGs das ilustrações em public/ilustracoes a partir do pacote
 * Fluent Emoji (Microsoft, licença MIT). Rode com: npm run ilustracoes
 * Requer Node.js 22.18+ (execução de TypeScript nativa).
 */
import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CONCEPT_DATA, UI_ILLUSTRATIONS } from "../src/content/concept-data.ts";

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "ilustracoes");
const pkgDir = dirname(require.resolve("@iconify-json/fluent-emoji/package.json"));
const set = JSON.parse(readFileSync(join(pkgDir, "icons.json"), "utf8")) as {
  width?: number;
  height?: number;
  icons: Record<string, { body: string; width?: number; height?: number }>;
  aliases?: Record<string, { parent: string }>;
};

mkdirSync(outDir, { recursive: true });

const wanted = new Map<string, string>();
for (const c of CONCEPT_DATA) if (c.illustration) wanted.set(c.id, c.illustration);
for (const [file, icon] of Object.entries(UI_ILLUSTRATIONS)) wanted.set(`ui-${file}`, icon);

let missing = 0;
for (const [file, iconName] of wanted) {
  const name = set.icons[iconName] ? iconName : set.aliases?.[iconName]?.parent;
  const icon = name ? set.icons[name] : undefined;
  if (!icon) {
    console.error(`✗ ilustração não encontrada: ${iconName} (${file})`);
    missing++;
    continue;
  }
  const w = icon.width ?? set.width ?? 32;
  const h = icon.height ?? set.height ?? 32;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">${icon.body}</svg>\n`;
  writeFileSync(join(outDir, `${file}.svg`), svg);
}

copyFileSync(join(pkgDir, "..", "fluent-emoji", "info.json"), join(outDir, "FONTE.json"));
writeFileSync(
  join(outDir, "LICENCA-FLUENT-EMOJI.txt"),
  `Ilustrações: Fluent Emoji — Copyright (c) Microsoft Corporation.
Licença MIT: https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE
Uso comercial permitido, mantendo este aviso.
`,
);

console.log(`✓ ${wanted.size - missing} ilustrações geradas em public/ilustracoes`);
if (missing) process.exit(1);

/**
 * export-tokens-studio.mjs
 *
 * Chuyển đổi mattle-tokens.json sang format Tokens Studio (token-studio-export.json)
 * để import vào Figma qua plugin "Tokens Studio for Figma".
 *
 * Usage:
 *   node scripts/export-tokens-studio.mjs
 *
 * Output: tokens-studio-export.json (trong thư mục gốc project)
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Load tokens ─────────────────────────────────────────────────────────────

const tokensPath = join(__dirname, "../mattle-tokens.json");
const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
const { Color, Typography } = tokens?.MattleWiki ?? {};

// ─── Build Tokens Studio format ──────────────────────────────────────────────
// Tokens Studio expects:
// {
//   "global": {
//     "<group>": {
//       "<name>": { "value": "...", "type": "color" | "typography" | ... }
//     }
//   }
// }

const global = {};

// Colors
if (Color) {
  global.Color = {};
  for (const [name, token] of Object.entries(Color)) {
    global.Color[name] = {
      value: token.$value,
      type: token.$type,
    };
  }
}

// Gradients (từ globals.css — không có trong mattle-tokens.json, thêm thủ công)
global.Gradient = {
  "book-bg": {
    value: "linear-gradient(to right, #28251e 0%, #221f18 50%, #28251e 100%)",
    type: "other",
    description: "Book layout background gradient",
  },
  "page-spread": {
    value:
      "linear-gradient(to right, #1d1b16 0%, #1f1c17 20%, #1f1c17 46%, #171511 50%, #1f1c17 54%, #1f1c17 80%, #1d1b16 100%)",
    type: "other",
    description: "Page spread gradient",
  },
  "page-divider": {
    value:
      "linear-gradient(to bottom, #16130d 0%, rgba(23, 21, 16, 0.02) 49.5%, #16130d 100%)",
    type: "other",
    description: "Page divider gradient",
  },
};

// Typography
if (Typography) {
  global.Typography = {};
  for (const [name, token] of Object.entries(Typography)) {
    global.Typography[name] = {
      value: token.$value,
      type: token.$type,
    };
  }
}

// ─── Output ───────────────────────────────────────────────────────────────────

const output = { global };
const outputPath = join(__dirname, "../tokens-studio-export.json");
writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

// Summary
const colorCount = Object.keys(global.Color ?? {}).length;
const gradientCount = Object.keys(global.Gradient ?? {}).length;
const typographyCount = Object.keys(global.Typography ?? {}).length;

console.log("✅  Tokens Studio export hoàn thành!");
console.log(`   📁 Output: tokens-studio-export.json`);
console.log(`   🎨 Colors:     ${colorCount}`);
console.log(`   🌈 Gradients:  ${gradientCount}`);
console.log(`   🔤 Typography: ${typographyCount}`);
console.log();
console.log("👉  Import vào Figma:");
console.log("    1. Mở plugin Tokens Studio for Figma");
console.log('    2. Chọn "Import" → "JSON" → chọn file tokens-studio-export.json');
console.log("    3. Apply tokens vào file");

/**
 * push-tokens-to-figma.mjs
 *
 * Đọc mattle-tokens.json và đẩy tất cả Color tokens lên Figma Variables.
 *
 * Usage:
 *   FIGMA_TOKEN=<your_personal_access_token> node scripts/push-tokens-to-figma.mjs
 *
 * Lấy Figma Personal Access Token tại:
 *   Figma → Account Settings → Personal access tokens
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Config ─────────────────────────────────────────────────────────────────

const FIGMA_FILE_KEY = "87Sgue3XLlaj2b6qw2oLUR";
const COLLECTION_NAME = "MattleWiki";
const MODE_NAME = "Default";

const FIGMA_TOKEN = process.env.FIGMA_TOKEN;
if (!FIGMA_TOKEN) {
  console.error("❌  Thiếu FIGMA_TOKEN. Chạy lệnh:");
  console.error(
    "    FIGMA_TOKEN=<token> node scripts/push-tokens-to-figma.mjs"
  );
  process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Hex #rrggbb hoặc #rrggbbaa → { r, g, b, a } (0–1) */
function hexToFigmaColor(hex) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

/** rgba(r, g, b, a) string → { r, g, b, a } (0–1) */
function rgbaStringToFigmaColor(str) {
  const m = str.match(/rgba?\(\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\s*\)/);
  if (!m) return null;
  return {
    r: parseFloat(m[1]) / 255,
    g: parseFloat(m[2]) / 255,
    b: parseFloat(m[3]) / 255,
    a: m[4] !== undefined ? parseFloat(m[4]) : 1,
  };
}

function parseColor(value) {
  if (typeof value !== "string") return null;
  if (value.startsWith("#")) return hexToFigmaColor(value);
  if (value.startsWith("rgb")) return rgbaStringToFigmaColor(value);
  return null;
}

// ─── Load tokens ─────────────────────────────────────────────────────────────

const tokensPath = join(__dirname, "../mattle-tokens.json");
const tokens = JSON.parse(readFileSync(tokensPath, "utf-8"));
const colorTokens = tokens?.MattleWiki?.Color ?? {};

// ─── Build Figma Variables payload ───────────────────────────────────────────

// Temporary IDs (prefixed "TemporaryId:") are used for cross-referencing
// within the same request — Figma replaces them with real IDs on creation.
const COLL_ID = "TemporaryId:coll_1";
const MODE_ID = "TemporaryId:mode_1";

const variableCollections = [
  {
    action: "CREATE",
    id: COLL_ID,
    name: COLLECTION_NAME,
  },
];

const variableModes = [
  {
    action: "CREATE",
    id: MODE_ID,
    variableCollectionId: COLL_ID,
    name: MODE_NAME,
  },
];

const variables = [];
const variableModeValues = [];

let idx = 10;
for (const [name, token] of Object.entries(colorTokens)) {
  if (token.$type !== "color") continue;

  const color = parseColor(token.$value);
  if (!color) {
    console.warn(`⚠️  Bỏ qua "${name}" — không parse được màu: ${token.$value}`);
    continue;
  }

  const varId = `TemporaryId:var_${idx++}`;

  variables.push({
    action: "CREATE",
    id: varId,
    name: `Color/${name}`,
    variableCollectionId: COLL_ID,
    resolvedType: "COLOR",
  });

  variableModeValues.push({
    variableId: varId,
    modeId: MODE_ID,
    value: color,
  });
}

console.log(`📦  Sẵn sàng push ${variables.length} color variables lên Figma...`);

// ─── Call Figma API ───────────────────────────────────────────────────────────

const url = `https://api.figma.com/v1/files/${FIGMA_FILE_KEY}/variables`;
const payload = { variableCollections, variableModes, variables, variableModeValues };

const res = await fetch(url, {
  method: "POST",
  headers: {
    "X-Figma-Token": FIGMA_TOKEN,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});

const data = await res.json();

if (!res.ok) {
  console.error(`❌  Figma API trả về lỗi (${res.status}):`);
  console.error(JSON.stringify(data, null, 2));
  process.exit(1);
}

console.log("✅  Variables đã được push lên Figma thành công!");
console.log(`   Collection: "${COLLECTION_NAME}" / Mode: "${MODE_NAME}"`);
console.log(`   Số lượng: ${variables.length} variables`);

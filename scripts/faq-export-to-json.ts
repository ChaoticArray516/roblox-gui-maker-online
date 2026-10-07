/**
 * SOP-3J faq-engine 集成：导出 FAQ_ENTRIES 为 JSON 供 build_jsonld.py lint
 *
 * 输出格式（与 scripts/faq-build-jsonld.py 输入一致）：
 * [
 *   { "q": "...", "capsule": "...", "detail": "...", "category": "..." },
 *   ...
 * ]
 *
 * 输出路径：scripts/.faq-build-cache/faqs.json（已在 .gitignore）
 */

import { mkdirSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

import { FAQ_ENTRIES } from "../src/app/faq/data";

const outDir = join(process.cwd(), "scripts", ".faq-build-cache");
const outFile = join(outDir, "faqs.json");

if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

const payload = FAQ_ENTRIES.map((entry) => ({
  q: entry.question,
  capsule: entry.capsule,
  detail: entry.detail ?? "",
  category: entry.category ?? "",
}));

writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf-8");
console.log(`Exported ${payload.length} FAQs to ${outFile}`);

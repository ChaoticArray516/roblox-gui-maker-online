#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * SOP-3E-03: rendering-audit.js — 约束自动化检查脚本
 *
 * 7 项检查（对照 pipeline_with_ssg_constraints.md Phase 5 + MASTER_SOP SOP-3D）：
 *   1. 每个A级/B级页面 HTML 有 <h1>
 *   2. 每页有 <title> + <meta name="description">
 *   3. 无违规 "use client"（非 C级页面源码扫描）
 *   4. 动态路由有 generateStaticParams
 *   5. JSON-LD 在 HTML <script> 中
 *   6. 内链用 <Link>（源码扫描，<a href> 仅允许外链 + noscript）
 *   7. 广告容器固定尺寸（本期 N/A，记录跳过）
 *
 * 用法：
 *   pnpm start &            # 先启动生产预览
 *   pnpm rendering-audit    # 默认 http://localhost:3000
 *   BASE_URL=http://localhost:3100 pnpm rendering-audit
 *
 * 退出码：0 = 全部通过，1 = 有违规。
 */

const fs = require("node:fs");
const path = require("node:path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const WORKSPACE = path.resolve(__dirname, "..");

// A级/B级 SEO 页面（Wave 5 扩展后）
const PAGES = [
  { path: "", label: "/" },
  { path: "templates", label: "/templates" },
  { path: "templates/rpg-inventory", label: "/templates/[slug]" },
  { path: "pricing", label: "/pricing" },
  { path: "faq", label: "/faq" },
  { path: "editor", label: "/editor" },
  { path: "plugin", label: "/plugin" },
  { path: "figma-to-roblox", label: "/figma-to-roblox" },
  { path: "guides", label: "/guides" },
  { path: "guides/fix-gui-scaling", label: "/guides/[slug]" },
  { path: "use-cases", label: "/use-cases" },
  { path: "use-cases/simulator-hud", label: "/use-cases/[game-type]" },
  { path: "blog", label: "/blog" },
  { path: "blog/best-roblox-ui-maker-no-coding", label: "/blog/[slug]" },
  { path: "docs", label: "/docs" },
  { path: "docs/quick-start", label: "/docs/[slug]" },
];

// SSG/ISR 页面源码（禁止 "use client"）
const SERVER_PAGES = [
  "src/app/page.tsx",
  "src/app/templates/page.tsx",
  "src/app/templates/[slug]/page.tsx",
  "src/app/pricing/page.tsx",
  "src/app/faq/page.tsx",
  "src/app/plugin/page.tsx",
  "src/app/figma-to-roblox/page.tsx",
  "src/app/guides/page.tsx",
  "src/app/guides/[slug]/page.tsx",
  "src/app/use-cases/page.tsx",
  "src/app/use-cases/[game-type]/page.tsx",
  "src/app/blog/page.tsx",
  "src/app/blog/[slug]/page.tsx",
  "src/app/docs/page.tsx",
  "src/app/docs/[slug]/page.tsx",
];

// 动态路由 generateStaticParams 检查
const DYNAMIC_ROUTES = [
  "src/app/templates/[slug]/page.tsx",
  "src/app/guides/[slug]/page.tsx",
  "src/app/use-cases/[game-type]/page.tsx",
  "src/app/blog/[slug]/page.tsx",
  "src/app/docs/[slug]/page.tsx",
];

let violations = 0;
const results = [];

function check(name, pass, detail) {
  const status = pass ? "✅" : "❌";
  results.push({ name, status, detail });
  if (!pass) violations += 1;
}

function fetchSync(url) {
  // Node 18+ 内置 fetch
  return fetch(url).then((r) => r.text());
}

function readSrc(rel) {
  return fs.readFileSync(path.join(WORKSPACE, rel), "utf8");
}

function grepDir(dir, pattern) {
  const out = [];
  const re = new RegExp(pattern);
  const walk = (d) => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === ".next") continue;
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(tsx|ts)$/.test(e.name)) {
        const c = fs.readFileSync(full, "utf8");
        if (re.test(c)) out.push(full);
      }
    }
  };
  walk(dir);
  return out;
}

async function main() {
  console.log(`rendering-audit — 目标 ${BASE_URL}\n`);

  // ---- 源码扫描类检查（不需服务器）----
  // 检查 3: SSG/ISR 页面源码无 "use client"
  const useClientLeaks = SERVER_PAGES.filter((f) =>
    /^['"]use client['"];?/m.test(readSrc(f)),
  );
  check(
    "3. SSG/ISR 页面无 \"use client\"",
    useClientLeaks.length === 0,
    useClientLeaks.length === 0
      ? `${SERVER_PAGES.length} 个 SSG/ISR 页面源码均无 'use client'`
      : `违规文件: ${useClientLeaks.join(", ")}`,
  );

  // 检查 4: 动态路由有 generateStaticParams
  const missingParams = DYNAMIC_ROUTES.filter(
    (f) => !/export function generateStaticParams/.test(readSrc(f)),
  );
  check(
    "4. 动态路由有 generateStaticParams",
    missingParams.length === 0,
    missingParams.length === 0
      ? `${DYNAMIC_ROUTES.length} 个动态路由均含 generateStaticParams`
      : `缺失: ${missingParams.join(", ")}`,
  );

  // 检查 6: 内链用 <Link>（<a href="/..."> 仅允许在 noscript 内）
  const srcDir = path.join(WORKSPACE, "src");
  const aHrefFiles = grepDir(srcDir, '<a\\s+[^>]*href="/');
  // 过滤：noscript 内的 <a> 是合理的
  const realViolations = aHrefFiles.filter((f) => {
    const c = fs.readFileSync(f, "utf8");
    // 提取所有 <a href="/...">，检查是否在 <noscript> 块内
    const matches = c.match(/<a\s+[^>]*href="\/[^"]*"[^>]*>/g) || [];
    return matches.some((m) => {
      const idx = c.indexOf(m);
      const before = c.slice(0, idx);
      const lastNoscript = before.lastIndexOf("<noscript");
      const lastClose = before.lastIndexOf("</noscript>");
      return lastNoscript === -1 || lastClose > lastNoscript;
    });
  });
  check(
    "6. 站内导航用 <Link>（<a href> 仅限 noscript）",
    realViolations.length === 0,
    realViolations.length === 0
      ? "无站内 <a href> 泄漏（noscript 内除外）"
      : `违规文件: ${realViolations.join(", ")}`,
  );

  // 检查 7: 广告容器固定尺寸（本期无广告，跳过）
  check("7. 广告容器固定尺寸", true, "本期无广告容器，N/A 跳过");

  // ---- HTML 抓取类检查（需服务器）----
  let serverUp = false;
  try {
      await fetch(BASE_URL, { method: "HEAD" });
    serverUp = true;
  } catch {
    serverUp = false;
  }

  if (!serverUp) {
    console.log("⚠️  服务器未运行，跳过 HTML 抓取类检查（1/2/5）。\n");
    printResults();
    console.log(
      `\n${violations === 0 ? "✅ 源码类检查通过" : "❌ 有违规"}（HTML 类未跑，请先 pnpm start）`,
    );
    process.exit(violations === 0 ? 0 : 1);
  }

  // 检查 1/2/5: 抓取每页 HTML
  for (const p of PAGES) {
    const url = `${BASE_URL}/${p.path}`.replace(/\/$/, "") || BASE_URL;
    const html = await fetchSync(url);
    const h1 = (html.match(/<h1/g) || []).length;
    const title = (html.match(/<title/g) || []).length;
    const desc = /<meta\s+name="description"/i.test(html);
    const ld = (html.match(/application\/ld\+json/g) || []).length;

    check(
      `1. ${p.label} 有 <h1>`,
      h1 >= 1,
      `h1 计数 = ${h1}`,
    );
    check(
      `2. ${p.label} 有 <title> + <meta description>`,
      title >= 1 && desc,
      `title=${title}, description=${desc}`,
    );
    check(
      `5. ${p.label} 有 JSON-LD (application/ld+json)`,
      ld >= 1,
      `ld+json 计数 = ${ld}`,
    );
  }

  printResults();
  console.log(
    `\n${violations === 0 ? "✅ 全部通过" : `❌ ${violations} 项违规`}`,
  );
  process.exit(violations === 0 ? 0 : 1);
}

function printResults() {
  console.log("检查结果:");
  for (const r of results) {
    console.log(`  ${r.status} ${r.name}`);
    console.log(`     ${r.detail}`);
  }
}

main().catch((e) => {
  console.error("audit 异常:", e);
  process.exit(1);
});

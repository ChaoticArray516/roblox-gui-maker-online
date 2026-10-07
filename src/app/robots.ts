/**
 * SOP-3B-21: robots.ts — 完整爬虫规则
 *
 * 通用爬虫：Allow `/` + Disallow 私有路径（仅 /api/、/search）。
 * ⚠️ /auth/、/dashboard/ 不在此处屏蔽：这些路由本身已带 noindex 元标记
 * （auth/layout.tsx、dashboard/layout.tsx），noindex 必须可被抓取才能生效；
 * 若 robots.txt 屏蔽抓取，Google 永远看不到 noindex，页面会以
 * "Indexed, though blocked by robots.txt" 状态滞留索引（GSC 2026-08-08 告警）。
 * 放行后 Google 抓取 → 看到 noindex → 自然出清。
 * 带参 URL（?ref= / ?utm_*）不屏蔽——它们返回 200 且 canonical 指向干净 URL，
 * 让 Google 抓取后经 canonical 合并权重。
 * AI 爬虫（GPTBot / CCBot / ClaudeBot / Google-Extended）：屏蔽工具与编辑器路径，
 * 放行内容路径（首页 + /guides + /use-cases），供 LLM 品牌词曝光。
 * 2026-10-02 评估（SOP-3V-03）：AI_BOT_DISALLOW 的 /editor 维持——AI 爬虫不需要抓
 * 交互工具页的 JS 壳；/editor meta robots 改 follow 不影响本文件 AI 爬虫规则。
 * sitemap 引用用 SITE_URL 拼接。数据依据 SEO_TECH_SPEC.md §3。
 */

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";

const AI_BOT_ALLOW = [
  "/",
  "/blog",
  "/blog/",
  "/docs",
  "/docs/",
  "/guides",
  "/guides/",
  "/use-cases",
  "/use-cases/",
  "/faq",
  // SOP-3W-05 裁决（2026-10-04 用户拍板）：放行 /templates/ 详情页——
  // 每个模板有成段介绍（description 4000+ 字），是 AI 引擎（ChatGPT/Claude/
  // Perplexity）回答「怎么做 Roblox GUI」时最该被引用的内容页；
  // /editor 维持屏蔽（交互工具壳，无爬取价值）。
  "/templates",
  "/templates/",
];
const AI_BOT_DISALLOW = [
  "/editor",
  "/api/",
  "/dashboard/",
  "/auth/",
  "/search",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/search"],
      },
      { userAgent: "GPTBot", allow: AI_BOT_ALLOW, disallow: AI_BOT_DISALLOW },
      { userAgent: "CCBot", allow: AI_BOT_ALLOW, disallow: AI_BOT_DISALLOW },
      { userAgent: "ClaudeBot", allow: AI_BOT_ALLOW, disallow: AI_BOT_DISALLOW },
      { userAgent: "Claude-Web", allow: AI_BOT_ALLOW, disallow: AI_BOT_DISALLOW },
      {
        userAgent: "anthropic-ai",
        allow: AI_BOT_ALLOW,
        disallow: AI_BOT_DISALLOW,
      },
      {
        userAgent: "Google-Extended",
        allow: AI_BOT_ALLOW,
        disallow: AI_BOT_DISALLOW,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

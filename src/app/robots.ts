/**
 * SOP-3B-21: robots.ts — 完整爬虫规则
 *
 * 通用爬虫：Allow `/` + Disallow 私有/查询参数路径。
 * AI 爬虫（GPTBot / CCBot / ClaudeBot / Google-Extended）：屏蔽工具与编辑器路径，
 * 放行内容路径（首页 + /guides + /use-cases），供 LLM 品牌词曝光。
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
];
const AI_BOT_DISALLOW = [
  "/editor",
  "/templates/",
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
        disallow: [
          "/api/",
          "/dashboard/",
          "/auth/",
          "/search",
          "/*?ref=*",
          "/*?utm_*",
        ],
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

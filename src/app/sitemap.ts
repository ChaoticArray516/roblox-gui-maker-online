/**
 * SOP-3B-22 / SOP-3O-03 / SOP-3K-09: sitemap.ts - 程序化生成
 *
 * 含静态路由 + 全部动态路由详情 slug：
 * - 静态：/ /templates /pricing /faq /editor /plugin /figma-to-roblox
 *   /script-generator /ai-generator /compare /guides /use-cases /blog /docs
 *   /privacy /terms（16 条）
 * - 动态：/templates/[slug] (13) + /guides/[slug] (3) + /use-cases/[game-type] (5)
 *   + /blog/[slug] (17) + /docs/[slug] (6) + /compare/[slug] (3)
 * 所有 URL 用 SITE_URL 拼接。slug 列表从各 data.ts 导入，单一数据源。
 *
 * SOP-3V-04（2026-10-02）：lastmod 全量真实化——LAST_MODIFIED 假常量废除。
 * blog/guides/templates/docs/use-cases/compare 条目取各自 data 层真实 modifiedAt；
 * 静态条目统一用构建期常量 BUILD_TIME（next.config.ts env 内联；
 * 运行期不取当前时间戳，防 ISR 冷启动漂移）。
 */

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-config";
import { TEMPLATES } from "@/lib/templates";
import { POSTS } from "./blog/[slug]/data";
import { DOCS } from "./docs/[slug]/data";
import { GUIDES } from "./guides/[slug]/data";
import { USE_CASES } from "./use-cases/[game-type]/data";
import { COMPARES } from "./compare/[slug]/data";

const BUILD_TIME = process.env.BUILD_TIME ?? "2026-10-02";

const STATIC: MetadataRoute.Sitemap = [
  { url: SITE_URL, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 1.0 },
  { url: `${SITE_URL}/templates`, lastModified: BUILD_TIME, changeFrequency: "daily", priority: 0.9 },
  { url: `${SITE_URL}/pricing`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/faq`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.7 },
  { url: `${SITE_URL}/editor`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.9 },
  { url: `${SITE_URL}/plugin`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/figma-to-roblox`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/script-generator`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/ai-generator`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.8 },
  { url: `${SITE_URL}/compare`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/guides`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/use-cases`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/blog`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/docs`, lastModified: BUILD_TIME, changeFrequency: "weekly", priority: 0.8 },
  { url: `${SITE_URL}/privacy`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.3 },
  { url: `${SITE_URL}/terms`, lastModified: BUILD_TIME, changeFrequency: "monthly", priority: 0.3 },
];

function mapRecords(
  prefix: string,
  records: readonly { slug: string; modifiedAt: string }[],
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number,
): MetadataRoute.Sitemap {
  return records.map((r) => ({
    url: `${SITE_URL}${prefix}${r.slug}`,
    lastModified: r.modifiedAt,
    changeFrequency,
    priority,
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC,
    ...Object.values(TEMPLATES).map((t) => ({
      url: `${SITE_URL}/templates/${t.slug}`,
      lastModified: t.modifiedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...mapRecords("/guides/", Object.values(GUIDES), "monthly", 0.7),
    ...mapRecords("/use-cases/", Object.values(USE_CASES), "monthly", 0.7),
    ...mapRecords("/blog/", Object.values(POSTS), "monthly", 0.7),
    ...mapRecords("/docs/", Object.values(DOCS), "monthly", 0.7),
    ...mapRecords("/compare/", Object.values(COMPARES), "monthly", 0.7),
  ];
}

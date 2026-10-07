/**
 * SOP-3B-17: Open Graph 元数据构建器
 *
 * `buildOpenGraph()` 将 OpenGraphProps 转换为 Next.js `Metadata["openGraph"]` 对象，
 * 供各页面的 `generateMetadata()` 或 `export const metadata` 直接展开使用。
 * 本文件只导出工具函数，不渲染 JSX —— OG 标签由 Next.js metadata 系统统一注入。
 */

import type { Metadata } from "next";
import { SITE_NAME, SITE_DEFAULT_OG_IMAGE, SITE_LOCALE } from "@/lib/site-config";

export interface OpenGraphProps {
  title: string;
  description: string;
  /** 绝对 URL；缺省用站点默认 OG 图 */
  image?: string;
  type?: "website" | "article";
  locale?: string;
}

export function buildOpenGraph({
  title,
  description,
  image = SITE_DEFAULT_OG_IMAGE,
  type = "website",
  locale = SITE_LOCALE,
}: OpenGraphProps): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    type,
    locale,
    siteName: SITE_NAME,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: `${title} — ${SITE_NAME}`,
      },
    ],
  };
}

/**
 * SOP-3W-02: 页级 OG/Twitter 工厂（路径 A 双键同返）。
 *
 * Next 16 的 openGraph/twitter 是键级整体替换（无字段级合并，
 * generate-metadata.md Merging/Inheriting 节）：页级一旦定义 openGraph
 * 就必须五要素写全；twitter 不设则键级继承 layout 的首页卡——
 * 故本工厂一次调用返回两键，页级展开 `...buildPageOpenGraph(...)` 即可。
 *
 * `url` 传相对路径（如 "/editor"），由 layout.tsx 的 metadataBase 解析为绝对。
 * image 缺省 default.png；模板专属 1200×630 图为后置任务。
 */
export function buildPageOpenGraph(params: {
  /** 相对路径（metadataBase 解析），如 "/editor" */
  url: string;
  /** 页 title——与该页 metadata.title 同源（静态页从 OG_PAGES 取） */
  title: string;
  /** 页 description（同源） */
  description: string;
  /** 可选分页 OG 图；缺省站点默认图 */
  image?: string;
}): {
  openGraph: NonNullable<Metadata["openGraph"]>;
  twitter: NonNullable<Metadata["twitter"]>;
} {
  const image = params.image ?? SITE_DEFAULT_OG_IMAGE;
  return {
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      url: params.url,
      title: params.title,
      description: params.description,
      locale: SITE_LOCALE,
      images: [
        { url: image, width: 1200, height: 630, alt: params.title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: params.title,
      description: params.description,
      images: [image],
    },
  };
}

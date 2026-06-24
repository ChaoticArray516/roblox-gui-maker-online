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

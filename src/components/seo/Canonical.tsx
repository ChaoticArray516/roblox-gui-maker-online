/**
 * SOP-3B-19: Canonical URL + hreflang 构建器
 *
 * `buildAlternates()` 将 path（不含域名）转换为 Next.js `Metadata["alternates"]` 对象，
 * 供各页面的 `generateMetadata()` 或 `export const metadata` 直接展开使用。
 * 所有 URL 用 `SITE_URL` 拼接，禁止硬编码域名。
 */

import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";

export interface CanonicalProps {
  /** 当前页面的 canonical 路径（不含域名），如 "/pricing" */
  path: string;
  /** 多语言映射: { "en": "/page", "zh": "/zh/page" } */
  alternateUrls?: Record<string, string>;
}

export function buildAlternates({
  path,
  alternateUrls,
}: CanonicalProps): NonNullable<Metadata["alternates"]> {
  const canonical = `${SITE_URL}${path}`;

  const languages = alternateUrls
    ? Object.fromEntries(
        Object.entries(alternateUrls).map(([lang, urlPath]) => [
          lang,
          `${SITE_URL}${urlPath}`,
        ]),
      )
    : undefined;

  return {
    canonical,
    ...(languages ? { languages } : {}),
  };
}

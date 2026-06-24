/**
 * SOP-3B-18: 视觉面包屑导航 + BreadcrumbList Schema 双输出
 *
 * 渲染可见的 `<nav aria-label="breadcrumb">` 导航，同时在同组件内输出
 * BreadcrumbList JSON-LD。站内导航用 `<Link>`，末项标 aria-current="page"。
 * 颜色类沿用本项目 token（text-text / text-text-muted）。
 */

import Link from "next/link";

import { SITE_URL } from "@/lib/site-config";
import { JsonLd } from "./JsonLd";

export interface BreadcrumbItem {
  name: string;
  /** 站内路径（"/templates"）或绝对 URL */
  url: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  const breadcrumbSchema = {
    "@type": "BreadcrumbList" as const,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };

  return (
    <>
      <nav aria-label="breadcrumb" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-2">
                {index > 0 && (
                  <span aria-hidden="true" className="text-text-muted/50">
                    /
                  </span>
                )}
                {isLast ? (
                  <span className="font-medium text-text" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="transition-colors hover:text-text"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <JsonLd data={breadcrumbSchema} id="breadcrumb-jsonld" />
    </>
  );
}

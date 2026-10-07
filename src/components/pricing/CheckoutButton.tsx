"use client";

import { trackEvent } from "@/lib/analytics";

/**
 * GA4-05: pricing 页 Pro CTA 微客户端岛。
 * pricing 是 SSG Server Component，不能加 'use client'——
 * 用本组件包住原 <a>（样式由父级算好传入），点击时打 begin_checkout，
 * 不 preventDefault，正常 302 到 Creem。
 */
export function CheckoutButton({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className={className}
      onClick={() => trackEvent("begin_checkout", { product: "pro_monthly" })}
    >
      {children}
    </a>
  );
}

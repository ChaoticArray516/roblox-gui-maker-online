"use client";

import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

/**
 * SOP-3H-12: 付费模板购买按钮 / Owned badge（客户端 island）
 *
 * 模板详情页是 ISR Server Component（不能读 session，否则破坏 ISR）。
 * 本组件在客户端 hydrate 后：
 *   - 未登录：显示 "Buy Template" 按钮（点击跳 /api/checkout，未登录会被守卫拦到 login）
 *   - 已登录 + 已购买：显示 "Owned" badge
 *   - 已登录 + 未购买：显示 "Buy Template" 按钮 → /api/checkout?productId=...&templateSlug=...
 */
export function TemplatePurchaseButton({
  slug,
  productId,
}: {
  slug: string;
  productId: string;
}) {
  const [owned, setOwned] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setOwned(false);
        return;
      }
      const { data } = await supabase
        .from("purchased_templates")
        .select("id")
        .eq("user_id", user.id)
        .eq("template_slug", slug)
        .maybeSingle();
      setOwned(!!data);
    });
  }, [slug]);

  if (owned === null) {
    return (
      <span className="text-sm text-text-muted">Checking access…</span>
    );
  }

  if (owned) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-cyan-accent/30 bg-surface-raised px-4 py-2 text-sm font-medium text-cyan-accent">
        ✓ Owned
      </span>
    );
  }

  return (
    <a
      href={`/api/checkout?productId=${productId}&templateSlug=${slug}`}
      className={cn(buttonVariants({ size: "lg" }))}
    >
      Buy Template
    </a>
  );
}

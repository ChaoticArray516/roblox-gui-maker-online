"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * SOP-3H-02: 浏览器端 Supabase 客户端
 *
 * 供 Client Component（auth 表单、dashboard、AIGenerator 等）使用。
 * 复用 color_pages 验证过的 @supabase/ssr 模式。
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

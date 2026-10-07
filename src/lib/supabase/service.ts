import { createClient } from "@supabase/supabase-js";

/**
 * SOP-3H-02: Service-role Supabase 客户端 — 绕过 RLS
 *
 * 仅供 webhook / 积分 RPC 等服务端特权操作使用。
 * 使用 SUPABASE_SERVICE_ROLE_KEY（非 public，绝不暴露给客户端）。
 */
export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Supabase service client missing env vars");
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

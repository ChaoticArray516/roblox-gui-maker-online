"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface OverviewData {
  email: string | null;
  creditsRemaining: number;
  plan: "Free" | "Pro";
  // ONB-03: 最近项目（dashboard 欢迎区「继续上次」动线）
  latestProject: { id: string; name: string } | null;
}

/**
 * SOP-3H-10: Dashboard 概览数据 hook
 * 客户端读 profiles 表（RLS：用户只能读自己的）。
 * ONB-03: 追加最近 1 条 projects 查询（同 RLS 本人限定）。
 */
export function useOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const [{ data: profile }, { data: latest }] = await Promise.all([
      supabase
        .from("profiles")
        .select("credits_remaining, plan, email")
        .eq("id", user.id)
        .single(),
      supabase
        .from("projects")
        .select("id, name")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);
    if (profile) {
      setData({
        email: profile.email ?? user.email ?? null,
        creditsRemaining: profile.credits_remaining,
        plan: profile.plan as "Free" | "Pro",
        latestProject: latest
          ? { id: latest.id as string, name: (latest.name as string) || "Untitled GUI" }
          : null,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, reload: load };
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface BillingData {
  plan: "Free" | "Pro";
  status: string | null;
  currentPeriodEnd: string | null;
}

export default function DashboardBillingPage() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("plan")
        .eq("id", user.id)
        .single();
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status, current_period_end")
        .eq("user_id", user.id)
        .eq("provider", "creem")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setData({
        plan: (profile?.plan as "Free" | "Pro") ?? "Free",
        status: sub?.status ?? null,
        currentPeriodEnd: sub?.current_period_end ?? null,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) return <p className="text-text-muted">Loading…</p>;
  if (!data) return <p className="text-text-muted">Could not load billing.</p>;

  const isPro = data.plan === "Pro";

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text">
          Billing
        </h1>
        <p className="text-text-muted">Manage your subscription.</p>
      </header>

      <div className="rounded-2xl border border-glass-border bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
              Current plan
            </h2>
            <p className="mt-2 font-display text-2xl font-semibold text-text">
              {data.plan}
            </p>
            {isPro && data.currentPeriodEnd && (
              <p className="mt-1 text-xs text-text-muted">
                Renews {new Date(data.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
            {!isPro && (
              <p className="mt-1 text-xs text-text-muted">
                Free plan — 50 AI credits / month
              </p>
            )}
          </div>
          {isPro ? (
            <a
              href="/api/portal"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Manage subscription
            </a>
          ) : (
            <Link
              href="/pricing"
              className={cn(buttonVariants())}
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {!isPro && (
        <div className="rounded-2xl border border-cyan-accent/30 bg-surface-raised p-6">
          <h2 className="font-display text-lg font-semibold text-text">
            Pro — $9.99/month
          </h2>
          <ul className="mt-3 flex flex-col gap-1 text-sm text-text-muted">
            <li>• Unlimited AI generations</li>
            <li>• Premium template library</li>
            <li>• Priority Figma → Roblox import</li>
            <li>• Priority email support</li>
          </ul>
          <p className="mt-4 text-xs text-text-muted">
            Pro subscriptions open soon. Join the waitlist on the{" "}
            <Link href="/pricing" className="text-cyan-accent hover:underline">
              pricing page
            </Link>{" "}
            to be notified.
          </p>
        </div>
      )}
    </div>
  );
}

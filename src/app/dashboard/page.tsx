"use client";

import Link from "next/link";
import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOverview } from "@/components/dashboard/useOverview";
import { trackEvent } from "@/lib/analytics";
import { PRO_PLAN } from "@/lib/constants";

/**
 * GA4-06: Creem 支付回跳捕获（successUrl = /dashboard?checkout=success）。
 * sessionStorage 防重；transaction_id 取不到真实回跳 id 时用时间戳占位
 * （已知降级：真实 id 需 Measurement Protocol，另立任务）。
 */
function PurchaseTracker() {
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("checkout") !== "success") return;
    if (sessionStorage.getItem("purchase_tracked")) return;
    sessionStorage.setItem("purchase_tracked", "1");
    trackEvent("purchase", {
      transaction_id: params.get("checkout_id") ?? `creem_${Date.now()}`,
      value: PRO_PLAN.priceUSD,
      currency: "USD",
    });
  }, [params]);

  return null;
}

export default function DashboardOverviewPage() {
  const { data, loading } = useOverview();

  // purchase 回跳捕获覆盖 loading / 异常 / 正常三分支
  const tracker = (
    <Suspense fallback={null}>
      <PurchaseTracker />
    </Suspense>
  );

  if (loading) {
    return (
      <>
        {tracker}
        <p className="text-text-muted">Loading…</p>
      </>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col gap-4">
        {tracker}
        <h1 className="font-display text-3xl font-semibold text-text">
          Welcome
        </h1>
        <p className="text-text-muted">
          Could not load your profile. Try refreshing the page.
        </p>
      </div>
    );
  }

  const isPro = data.plan === "Pro";

  return (
    <div className="flex flex-col gap-8">
      {tracker}
      <header className="space-y-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text">
          Dashboard
        </h1>
        <p className="text-text-muted">Signed in as {data.email}</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-glass-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            AI Credits
          </h2>
          <p className="mt-2 font-display text-3xl font-semibold text-text">
            {isPro ? "Unlimited" : data.creditsRemaining}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            {isPro
              ? "Pro plan — no monthly limit"
              : `Free plan — ${data.creditsRemaining} remaining this month`}
          </p>
        </div>

        <div className="rounded-2xl border border-glass-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
            Plan
          </h2>
          <p className="mt-2 font-display text-3xl font-semibold text-text">
            {data.plan}
          </p>
          {!isPro && (
            <Link
              href="/dashboard/billing"
              className={cn(buttonVariants({ size: "sm" }), "mt-4")}
            >
              Upgrade to Pro
            </Link>
          )}
        </div>
      </div>

      {/* ONB-03: 欢迎区动线 —— 有项目「继续上次」/ 无项目「开始第一个」，原三 CTA 降级次级链接 */}
      <div className="rounded-2xl border border-glass-border bg-surface-raised p-6">
        {data.latestProject ? (
          <>
            <h2 className="font-display text-lg font-semibold text-text">
              Continue editing · {data.latestProject.name}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Pick up right where you left off.
            </p>
            <Link
              href={`/editor?project=${data.latestProject.id}`}
              className={cn(buttonVariants({ size: "lg" }), "mt-4")}
            >
              Continue editing
            </Link>
          </>
        ) : (
          <>
            <h2 className="font-display text-lg font-semibold text-text">
              Create your first GUI
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Start from the main-menu template, describe your UI to the AI,
              and export clean Luau in minutes.
            </p>
            <Link
              href="/editor?template=main-menu"
              className={cn(buttonVariants({ size: "lg" }), "mt-4")}
            >
              Create your first GUI
            </Link>
          </>
        )}
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          <Link href="/editor" className="text-cyan-accent hover:underline">
            Open Editor
          </Link>
          <Link href="/templates" className="text-cyan-accent hover:underline">
            Browse Templates
          </Link>
          <Link
            href="/dashboard/projects"
            className="text-cyan-accent hover:underline"
          >
            My Projects
          </Link>
        </div>
      </div>
    </div>
  );
}

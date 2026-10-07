"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SITE_NAME } from "@/lib/site-config";
import { getURL } from "@/lib/get-url";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { sanitizeNext } from "@/lib/auth-next";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  // SOP-3U-05: next 兜底收敛（开放重定向防护）
  const next = sanitizeNext(params.get("next"));
  const errorParam = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "callback_failed"
      ? "Login callback failed. Please try again."
      : errorParam === "confirmation_failed"
        ? "Email confirmation failed. Please try again."
        : null,
  );

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // GA4-04: 密码登录成功打 login
    trackEvent("login", { method: "email" });
    // SOP-3V-10: /api/ 前缀的 next（checkout 回跳）必须整页跳转——
    // SPA router.push 对 Route Handler 的 302 外部跳转处理不确定，整页跳转必然走真 302
    if (next.startsWith("/api/")) {
      window.location.assign(next);
      return;
    }
    router.push(next);
    router.refresh();
  }

  async function handleOAuth(provider: "google" | "github") {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${getURL()}auth/callback?next=${encodeURIComponent(next)}&method=oauth`,
      },
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
      <header className="space-y-2 text-center">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-text">
          Log in to {SITE_NAME}
        </h1>
        <p className="text-sm text-text-muted">
          Welcome back. Pick up where you left off.
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Email</span>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-text placeholder:text-text-muted"
            placeholder="you@example.com"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Password</span>
          <input
            id="login-password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-text placeholder:text-text-muted"
            placeholder="••••••••"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-text-muted">
        <span className="h-px flex-1 bg-glass-border" />
        or
        <span className="h-px flex-1 bg-glass-border" />
      </div>

      <div className="flex flex-col gap-2">
        <button
          onClick={() => handleOAuth("google")}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          Continue with Google
        </button>
        <button
          onClick={() => handleOAuth("github")}
          className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
        >
          Continue with GitHub
        </button>
      </div>

      <p className="text-center text-sm text-text-muted">
        No account yet?{" "}
        <Link
          href={`/auth/signup${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-cyan-accent hover:underline"
        >
          Sign up free
        </Link>
      </p>
    </div>
  );
}

// SOP-3U-03: Suspense bailout 期间的静态骨架（全静态零 hooks），
// 根治 fallback={null} 导致的整页空白假死。文案与产品事实一致（免登录可试）。
function LoginSkeleton() {
  return (
    <div
      className="mx-auto w-full max-w-md rounded-2xl border border-glass-border bg-surface p-8"
      aria-hidden="true"
    >
      <h1 className="font-display text-2xl">Sign in to {SITE_NAME}</h1>
      <p className="mt-2 text-sm text-text-muted">
        Free · No login required to try · 50 free credits
      </p>
      <div className="mt-6 space-y-3">
        <div className="h-10 rounded-lg bg-surface-raised" />
        <div className="h-10 rounded-lg bg-surface-raised" />
        <div className="h-10 rounded-lg bg-brand-500/40" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="h-9 rounded-lg bg-surface-raised" />
        <div className="h-9 rounded-lg bg-surface-raised" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24">
      <Suspense fallback={<LoginSkeleton />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

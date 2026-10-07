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

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  // SOP-3U-05: next 兜底收敛（与 login 页同构，开放重定向防护）
  const next = sanitizeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${getURL()}auth/callback?next=${encodeURIComponent(next)}&method=email` },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    // 若 Supabase 开启了邮箱确认，data.session 为 null，需提示查邮件
    if (data.session === null) {
      setNotice("Check your inbox to confirm your email, then log in.");
      return;
    }
    // GA4-02: 会话已建立的真实注册才打 sign_up（待邮箱验证场景不打，避免虚高）
    trackEvent("sign_up", { method: "email" });
    // SOP-3V-10: /api/ 前缀的 next（checkout 回跳）必须整页跳转（同 login 页）
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
          Create your {SITE_NAME} account
        </h1>
        <p className="text-sm text-text-muted">
          Free plan: 50 AI credits every month. No credit card.
        </p>
      </header>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded-lg border border-cyan-accent/30 bg-surface-raised px-4 py-2 text-sm text-text">
          {notice}
        </p>
      )}

      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-text">Email</span>
          <input
            id="signup-email"
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
            id="signup-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-text placeholder:text-text-muted"
            placeholder="At least 8 characters"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className={cn(buttonVariants({ size: "lg" }), "w-full")}
        >
          {loading ? "Creating account…" : "Sign up free"}
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
        Already have an account?{" "}
        <Link
          href={`/auth/login${next !== "/dashboard" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="text-cyan-accent hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-24">
      <Suspense fallback={null}>
        <SignupForm />
      </Suspense>
    </main>
  );
}

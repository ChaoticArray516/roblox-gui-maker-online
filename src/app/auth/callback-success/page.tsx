"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { trackEvent } from "@/lib/analytics";
import { sanitizeNext } from "@/lib/auth-next";

/**
 * GA4-03: OAuth / 邮箱确认回跳的客户端探针页。
 * auth/callback/route.ts（服务端 302）打不了客户端事件，
 * 成功分支改跳此页，打完 login 事件后立即 replace 到最终落点。
 * noindex 由 auth/layout.tsx 继承。
 */
function CallbackSuccessProbe() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    // GA4-VAL 口径修正：method=email 的邮箱确认回跳 = 注册完成，打 sign_up；
    // method=oauth（或缺省）= 登录回跳，保持 login。
    const method = params.get("method") ?? "oauth";
    if (method === "email") {
      trackEvent("sign_up", { method: "email" });
    } else {
      trackEvent("login", { method });
    }
    const target = sanitizeNext(params.get("next"));
    // SOP-3V-10: /api/ 前缀的 next（checkout 回跳）整页跳转，必走真 302 到 Creem
    if (target.startsWith("/api/")) {
      window.location.assign(target);
      return;
    }
    router.replace(target);
  }, [params, router]);

  return <p aria-live="polite">Signing you in…</p>;
}

export default function CallbackSuccessPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-6 py-24">
      <Suspense fallback={null}>
        <CallbackSuccessProbe />
      </Suspense>
    </main>
  );
}

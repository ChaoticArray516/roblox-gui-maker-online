"use client";

/**
 * SOP-3F-11: AI 生成器面板
 *
 * 提供 prompt 输入、guiType/style/device 选择、示例 prompt 芯片、
 * 状态徽章与生成按钮。调用 /api/ai/generate SSE 接口，
 * 生成完成后通过 importJSON 导入画布。
 */

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Wand2,
  Monitor,
  Smartphone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { useEditorContext } from "../context/EditorContext";
import { normalizeAIGenerated } from "@/lib/openrouter";
import type { AIGenerationRequest } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { trackEvent } from "@/lib/analytics";
import { currentPathAsNext } from "@/lib/auth-next";
import Link from "next/link";

const GUI_TYPES: { value: AIGenerationRequest["guiType"]; label: string }[] = [
  { value: "menu", label: "Main Menu" },
  { value: "shop", label: "Shop" },
  { value: "hud", label: "HUD" },
  { value: "inventory", label: "Inventory" },
  { value: "settings", label: "Settings" },
  { value: "custom", label: "Custom" },
];

const STYLES: { value: AIGenerationRequest["style"]; label: string }[] = [
  { value: "bright", label: "Bright" },
  { value: "dark", label: "Dark" },
  { value: "clean", label: "Clean" },
  { value: "cartoon", label: "Cartoon" },
];

const EXAMPLES = [
  { prompt: "A main menu with Play, Settings and Shop buttons", type: "menu", style: "bright" },
  { prompt: "Dark shop UI with 6 item cards and a buy button", type: "shop", style: "dark" },
  { prompt: "Mobile HUD with health bar and action buttons", type: "hud", style: "cartoon" },
  { prompt: "Inventory scrolling list with 5 empty slots", type: "inventory", style: "clean" },
];

// SOP-3X-06: 等待期分阶段文案（替换原始 JSON 尾部滚动——非技术用户看乱码流无意义）
const STAGES = [
  "Analyzing your prompt…",
  "Choosing layout containers…",
  "Building the frame tree…",
  "Writing Luau…",
];

interface AIStatus {
  configured: boolean;
  mock: boolean;
  model: string | null;
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function AIGenerator() {
  const { actions, projectId } = useEditorContext();

  const [prompt, setPrompt] = useState("");
  const [guiType, setGuiType] = useState<AIGenerationRequest["guiType"]>("menu");
  const [style, setStyle] = useState<AIGenerationRequest["style"]>("bright");
  const [device, setDevice] = useState<AIGenerationRequest["device"]>("desktop");

  const [status, setStatus] = useState<AIStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // SOP-3X-06: 阶段索引 + 进度百分比（95% 停住——到 100% 还在等比 90% 更焦虑，刻意设计）
  const [stageIdx, setStageIdx] = useState(0);
  const [percent, setPercent] = useState(0);
  const [success, setSuccess] = useState<string | null>(null);
  const [needUpgrade, setNeedUpgrade] = useState(false);

  // SOP-3H-09: 登录态 + 积分门槛
  const [authState, setAuthState] = useState<{
    loggedIn: boolean;
    userId: string | null;
    credits: number | null;
    isPro: boolean;
  }>({ loggedIn: false, userId: null, credits: null, isPro: false });

  // SOP-3X-03/04/05: 生成凭证与计时（响应头捕获 → 埋点/退款/自动落库用）
  const generationIdRef = useRef<string | null>(null);
  const freeFirstRef = useRef(false);
  const genStartRef = useRef(0);
  const refundedRef = useRef(false);

  // ONB-02: 登录用户首次使用 AI（ai_guided_v1 未设置）→ placeholder 引导语 + prompt 自动聚焦
  // 用独立 key（与 ONB-01 的 onboarded_v1 解耦——引导条②步会先写 onboarded_v1，
  // 若共用则 AI 面板永远读不到「首次」状态）；首次输入 prompt 时写 key，引导随之结束。
  const [aiFirstVisit, setAiFirstVisit] = useState(false);

  const abortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem("ai_guided_v1")) setAiFirstVisit(true);
    } catch {}
  }, []);

  // SOP-3V-14(E9): 首页岛输入的 prompt 经 sessionStorage 预填到 AI 面板（读后清除，一次性）
  useEffect(() => {
    try {
      const prefill = sessionStorage.getItem("homepage_ai_prompt");
      if (prefill) {
        setPrompt(prefill);
        sessionStorage.removeItem("homepage_ai_prompt");
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (authState.loggedIn && aiFirstVisit) {
      document.getElementById("ai-prompt")?.focus();
    }
  }, [authState.loggedIn, aiFirstVisit]);

  const markAiGuided = () => {
    if (!aiFirstVisit) return;
    try {
      localStorage.setItem("ai_guided_v1", "1");
    } catch {}
    setAiFirstVisit(false);
  };

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((data) => setStatus(data as AIStatus))
      .catch(() => setStatus({ configured: false, mock: true, model: null }))
      .finally(() => setStatusLoading(false));
  }, []);

  // SOP-3X-06: 等待期反馈驱动——阶段 ~2.5s 轮替；进度缓推至 95% 停住
  useEffect(() => {
    if (!generating) return;
    setStageIdx(0);
    setPercent(0);
    const stageTimer = setInterval(() => {
      setStageIdx((i) => Math.min(i + 1, STAGES.length - 1));
    }, 2500);
    const pctTimer = setInterval(() => {
      setPercent((p) => (p < 95 ? Math.min(95, p + (95 - p) * 0.08 + 0.5) : 95));
    }, 200);
    return () => {
      clearInterval(stageTimer);
      clearInterval(pctTimer);
    };
  }, [generating]);

  // 读登录态 + 积分（RLS：用户只能读自己的 profile）
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setAuthState({ loggedIn: false, userId: null, credits: null, isPro: false });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("credits_remaining, plan")
        .eq("id", user.id)
        .single();
      setAuthState({
        loggedIn: true,
        userId: user.id,
        credits: profile?.credits_remaining ?? null,
        isPro: profile?.plan === "Pro",
      });
    });
  }, [success]); // 生成成功后刷新积分显示

  const applyExample = (ex: (typeof EXAMPLES)[number]) => {
    setPrompt(ex.prompt);
    setGuiType(ex.type as AIGenerationRequest["guiType"]);
    setStyle(ex.style as AIGenerationRequest["style"]);
  };

  // SOP-3X-05: 生成成功自动落库（upsert 语义同 Toolbar handleSave）；
  // 失败降级 notice 不阻塞成功横幅——草稿层 debounce 已兜底，用户可手动 Save 重试
  const autoSaveProject = async (userId: string) => {
    try {
      const supabase = createClient();
      const guiJson = JSON.parse(actions.exportJSON());
      if (projectId) {
        const { error } = await supabase
          .from("projects")
          .update({ gui_json: guiJson })
          .eq("id", projectId);
        if (error) throw error;
      } else {
        const name = prompt.trim().slice(0, 40) || "Untitled GUI";
        const { data, error } = await supabase
          .from("projects")
          .insert({ user_id: userId, name, gui_json: guiJson })
          .select("id")
          .single();
        if (error) throw error;
        if (data) {
          actions.setProjectId(data.id); // 防用户再点 Save 插第二行
          actions.setProjectName(name); // insert 时命名；update 不动用户已改的名
        }
      }
      actions.clearDraft(); // 与 Toolbar 落库成功同一清除时机（Toolbar.tsx:139 先例）
      trackEvent("project_saved", { source: "auto" });
    } catch (e) {
      console.error("Auto-save failed:", e);
      actions.setNotice("Auto-save failed — your work is safe in the local draft.");
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setSuccess(null);
    setNeedUpgrade(false);

    // SOP-3X-03: 埋点——生成开始（重置凭证/计时）
    generationIdRef.current = null;
    freeFirstRef.current = false;
    refundedRef.current = false;
    genStartRef.current = Date.now();
    trackEvent("generate_started", {
      template:
        new URLSearchParams(window.location.search).get("template") ?? undefined,
      is_anon: !authState.loggedIn,
    });

    const controller = new AbortController();
    abortRef.current = () => controller.abort();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, guiType, style, device }),
        signal: controller.signal,
      });

      if (response.status === 402) {
        // 积分不足
        const body = await response.json().catch(() => ({}));
        setError(body.error ?? "Out of AI credits. Upgrade to Pro.");
        setNeedUpgrade(true);
        // GA4-07: 402 曝光事件
        trackEvent("out_of_credits", { plan: authState.isPro ? "pro" : "free" });
        return;
      }

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

      // SOP-3X-03: 响应头捕获生成凭证（匿名 Mock/回退 Mock 不带头 → mock:true）
      generationIdRef.current = response.headers.get("X-Generation-Id");
      freeFirstRef.current = response.headers.get("X-Free-First") === "1";

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let jsonText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const raw of lines) {
          const line = raw.trim();
          if (!line.startsWith("data:")) continue;
          const data = line.slice(5).trim();
          if (data === "[DONE]") {
            break;
          }
          jsonText += data;
        }
      }

      const parsed = JSON.parse(jsonText);
      const normalized = normalizeAIGenerated(parsed);
      const elements = Object.values(normalized.elements);

      if (elements.length === 0) {
        throw new Error("AI returned an empty GUI");
      }

      const importPayload = JSON.stringify({
        version: "1.0",
        exportedAt: new Date().toISOString(),
        gui: {
          name: `${style} ${guiType}`,
          elements,
        },
      });

      actions.importJSON(importPayload);
      setSuccess(`Generated ${elements.length} element${elements.length === 1 ? "" : "s"}`);
      // SOP-3X-03: 埋点——生成完成（mock = 匿名 Mock 或回退 Mock，均无 X-Generation-Id 头）
      trackEvent("generation_completed", {
        is_first: freeFirstRef.current,
        mock: !generationIdRef.current,
        duration_ms: Date.now() - genStartRef.current,
      });
      // SOP-3X-05: 已登录真生成 → 自动落库（匿名/Mock 跳过——guest 数据不落库）
      if (authState.loggedIn && authState.userId && generationIdRef.current) {
        void autoSaveProject(authState.userId);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // SOP-3X-06: cancel 不扣费（3X-03 流完成才扣已落地，此文案为真）
        setError("Generation stopped — this attempt didn't use a credit.");
      } else if (err instanceof Error) {
        // SOP-3X-04: 流完整但解析失败 → 退款兜底（端点校验 charged+completed，幂等）
        if (generationIdRef.current) {
          try {
            const res = await fetch("/api/ai/generate/refund", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ generationId: generationIdRef.current }),
            });
            if (res.ok) refundedRef.current = true;
          } catch {
            // 退款请求失败静默——credits_logs 可对账
          }
        }
        setError(
          refundedRef.current
            ? "Generation failed — your credit has been refunded."
            : err.message,
        );
      } else {
        setError("Failed to generate GUI");
      }
    } finally {
      setGenerating(false);
      abortRef.current = null;
    }
  };

  const handleCancel = () => {
    abortRef.current?.();
  };

  const statusBadge = () => {
    if (statusLoading) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-2 py-0.5 text-[10px] text-text-muted">
          <Loader2 className="size-3 animate-spin" />
          Checking...
        </span>
      );
    }
    if (!status) return null;
    if (status.configured && !status.mock) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Live
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-400">
        <span className="size-1.5 rounded-full bg-amber-400" />
        Demo
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-3 p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-text">
          <Sparkles className="size-4 text-cyan-accent" />
          AI Generator
        </div>
        {statusBadge()}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="ai-prompt" className="text-xs font-medium text-text-muted">
          Describe your GUI
        </label>
        <textarea
          id="ai-prompt"
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            markAiGuided();
          }}
          placeholder={
            authState.loggedIn && aiFirstVisit
              ? "Try: a cyberpunk shop UI with a buy button"
              : "e.g. A bright main menu with Play, Shop and Settings buttons"
          }
          rows={4}
          disabled={generating}
          className="resize-none rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-xs text-text placeholder:text-text-muted focus:border-brand-500 focus:outline-none disabled:opacity-50"
        />
      </div>

      {/* SOP-3X-09: 首访期间次要操作视觉弱化（opacity-60，不删不藏） */}
      <div className={classNames("grid grid-cols-2 gap-2", aiFirstVisit && "opacity-60")}>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Type</label>
          <select
            value={guiType}
            onChange={(e) => setGuiType(e.target.value as AIGenerationRequest["guiType"])}
            disabled={generating}
            className="rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-xs text-text focus:border-brand-500 focus:outline-none"
          >
            {GUI_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Style</label>
          <select
            value={style}
            onChange={(e) => setStyle(e.target.value as AIGenerationRequest["style"])}
            disabled={generating}
            className="rounded-md border border-glass-border bg-surface-raised px-2 py-1.5 text-xs text-text focus:border-brand-500 focus:outline-none"
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={classNames("flex flex-col gap-1", aiFirstVisit && "opacity-60")}>
        <label className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Device</label>
        <div className="flex rounded-md border border-glass-border bg-surface-raised p-0.5">
          {[
            { value: "desktop" as const, icon: Monitor, label: "Desktop" },
            { value: "mobile" as const, icon: Smartphone, label: "Mobile" },
          ].map((d) => {
            const Icon = d.icon;
            const active = device === d.value;
            return (
              <button
                key={d.value}
                type="button"
                onClick={() => setDevice(d.value)}
                disabled={generating}
                className={classNames(
                  "flex flex-1 items-center justify-center gap-1 rounded py-1 text-xs font-medium transition-colors",
                  active
                    ? "bg-brand-500 text-white"
                    : "text-text-muted hover:bg-surface-raised hover:text-text",
                )}
              >
                <Icon className="size-3.5" />
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className={classNames("flex flex-col gap-1.5", aiFirstVisit && "opacity-60")}>
        <span className="text-[10px] font-medium uppercase tracking-wide text-text-muted">Examples</span>
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((ex, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => applyExample(ex)}
              disabled={generating}
              className="max-w-full truncate rounded-full border border-glass-border bg-surface-raised px-2 py-1 text-[10px] text-text-muted transition-colors hover:border-brand-400/40 hover:text-text disabled:opacity-50"
            >
              {ex.prompt}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={generating ? handleCancel : handleGenerate}
        disabled={!prompt.trim() && !generating}
        className={classNames(
          "flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors",
          generating
            ? "bg-amber-500 hover:bg-amber-400"
            : "bg-cyan-accent hover:bg-cyan-400",
        )}
      >
        {generating ? (
          <>
            <RefreshCw className="size-3.5 animate-spin" />
            Cancel
          </>
        ) : (
          <>
            <Wand2 className="size-3.5" />
            {/* SOP-3X-09: 首访强化（aiFirstVisit 门控无登录限制，匿名同生效） */}
            {aiFirstVisit ? "Generate my first GUI" : "Generate GUI"}
          </>
        )}
      </button>

      {/* SOP-3H-09: 积分/登录态提示 */}
      {!authState.loggedIn && (
        <div className="rounded-md bg-surface-raised px-2 py-1.5 text-[10px] text-text-muted">
          You are generating a demo.{" "}
          <Link
            href={`/auth/login?next=${encodeURIComponent(currentPathAsNext())}`}
            onClick={(e) => {
              // SOP-3U-02/04: 整页跳转兜底 + next 透传（绕开 CSR bailout 客户端路由悬挂）
              e.preventDefault();
              window.location.assign(e.currentTarget.href);
            }}
            className="text-cyan-accent hover:underline"
          >
            Log in
          </Link>{" "}
          to save projects and use live AI.
        </div>
      )}
      {authState.loggedIn && !authState.isPro && authState.credits !== null && (
        <div className="text-[10px] text-text-muted">
          {authState.credits} AI credits remaining this month
        </div>
      )}
      {authState.loggedIn && authState.isPro && (
        <div className="text-[10px] text-text-muted">Pro plan — unlimited generations</div>
      )}
      {/* SOP-3T-06: 402 弹出 CTA —— 未登录场景升级「保存作品 + 升级」双价值主张（仅文案区） */}
      {needUpgrade && !authState.loggedIn && (
        <div className="rounded-md bg-amber-500/10 px-2 py-2 text-xs text-amber-400">
          <p className="font-semibold">You&apos;ve used all 50 free credits</p>
          <p className="mt-1 text-amber-400/80">
            Log in to save your designs and claim monthly credits — your work
            stays in the editor.
          </p>
          <div className="mt-2 flex items-center gap-2">
            <Link
              href={`/auth/login?next=${encodeURIComponent(currentPathAsNext())}`}
              className="rounded-md bg-amber-500/20 px-2 py-1 font-semibold hover:bg-amber-500/30"
            >
              Save My Work
            </Link>
            <Link href="/pricing" className="font-semibold underline">
              Upgrade to Pro
            </Link>
          </div>
        </div>
      )}
      {needUpgrade && authState.loggedIn && (
        <div className="flex items-center justify-between gap-1.5 rounded-md bg-amber-500/10 px-2 py-1.5 text-xs text-amber-400">
          <span>Out of credits</span>
          <Link href="/pricing" className="font-semibold underline">
            Upgrade to Pro
          </Link>
        </div>
      )}

      {generating && (
        <div className="rounded-md bg-surface-raised px-2 py-1.5 text-[10px] text-text-muted">
          <div className="flex items-center gap-1.5">
            <Loader2 className="size-3 animate-spin" />
            {STAGES[stageIdx]}
          </div>
          <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-glass-border">
            <div
              className="h-full bg-cyan-accent transition-[width] duration-200"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-1.5 rounded-md bg-red-500/10 px-2 py-1.5 text-xs text-red-400">
          <AlertCircle className="size-3.5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs text-emerald-400">
          <CheckCircle2 className="size-3.5 shrink-0" />
          {success}
        </div>
      )}
    </div>
  );
}

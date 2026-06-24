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

interface AIStatus {
  configured: boolean;
  mock: boolean;
  model: string | null;
}

function classNames(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function AIGenerator() {
  const { actions } = useEditorContext();

  const [prompt, setPrompt] = useState("");
  const [guiType, setGuiType] = useState<AIGenerationRequest["guiType"]>("menu");
  const [style, setStyle] = useState<AIGenerationRequest["style"]>("bright");
  const [device, setDevice] = useState<AIGenerationRequest["device"]>("desktop");

  const [status, setStatus] = useState<AIStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const abortRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    fetch("/api/ai/status")
      .then((r) => r.json())
      .then((data) => setStatus(data as AIStatus))
      .catch(() => setStatus({ configured: false, mock: true, model: null }))
      .finally(() => setStatusLoading(false));
  }, []);

  const applyExample = (ex: (typeof EXAMPLES)[number]) => {
    setPrompt(ex.prompt);
    setGuiType(ex.type as AIGenerationRequest["guiType"]);
    setStyle(ex.style as AIGenerationRequest["style"]);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setSuccess(null);
    setProgress("");

    const controller = new AbortController();
    abortRef.current = () => controller.abort();

    try {
      const response = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, guiType, style, device }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`Server error: ${response.status}`);
      }

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
          setProgress(jsonText.slice(-60) + "...");
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
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Generation cancelled");
      } else if (err instanceof Error) {
        setError(err.message);
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
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. A bright main menu with Play, Shop and Settings buttons"
          rows={4}
          disabled={generating}
          className="resize-none rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-xs text-text placeholder:text-text-muted focus:border-brand-500 focus:outline-none disabled:opacity-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
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

      <div className="flex flex-col gap-1">
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

      <div className="flex flex-col gap-1.5">
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
            Generate GUI
          </>
        )}
      </button>

      {generating && progress && (
        <div className="rounded-md bg-surface-raised px-2 py-1.5 text-[10px] text-text-muted">
          {progress}
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

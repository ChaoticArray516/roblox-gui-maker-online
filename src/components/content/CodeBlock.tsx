"use client";

/**
 * SOP-3J-02: CodeBlock — 通用代码块组件
 *
 * 基于 prism-react-renderer 语法高亮（3I-10 已安装），
 * 复用 export-utils.ts 的 copyToClipboard，
 * 支持文件名标签、行号、复制按钮、可选底部 CTA。
 */

import { useState, memo } from "react";
import { Highlight, themes, type PrismTheme } from "prism-react-renderer";
import { Copy, Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/export-utils";
import { CTAButton } from "./CTA";
import type { CTAConfig } from "@/lib/types";

export interface CodeBlockProps {
  code: string;
  language?: "lua" | "luau" | "bash" | "json" | "plaintext";
  filename?: string;
  showLineNumbers?: boolean;
  className?: string;
  cta?: { variant: CTAConfig["variant"]; href: string; label: string };
}

const robloxTheme: PrismTheme = {
  ...themes.vsDark,
  plain: {
    color: "#e2e8f0",
    backgroundColor: "#0f172a",
  },
  styles: [
    ...themes.vsDark.styles,
    { types: ["comment"], style: { color: "#6b7280", fontStyle: "italic" } },
    { types: ["keyword"], style: { color: "#c084fc", fontWeight: "bold" } },
    { types: ["string"], style: { color: "#4ade80" } },
    { types: ["function"], style: { color: "#60a5fa" } },
    { types: ["number"], style: { color: "#f472b6" } },
    { types: ["operator"], style: { color: "#f87171" } },
    { types: ["punctuation"], style: { color: "#94a3b8" } },
    { types: ["property"], style: { color: "#38bdf8" } },
    { types: ["tag"], style: { color: "#fbbf24" } },
  ],
};

const CopyButton = memo(function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(code);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-md border border-glass-border bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-cyan-accent/40 hover:text-text"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          <span>Copy Code</span>
        </>
      )}
    </button>
  );
});

export const CodeBlock = memo(function CodeBlock({
  code,
  language = "lua",
  filename,
  showLineNumbers = true,
  className,
  cta,
}: CodeBlockProps) {
  const displayLanguage = language === "luau" ? "Luau" : language;

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-glass-border bg-surface-raised",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-glass-border px-4 py-2">
        {filename ? (
          <span className="text-xs font-medium text-text">{filename}</span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <span className="rounded bg-surface px-2 py-0.5 text-[10px] uppercase tracking-wide text-text-muted">
            {displayLanguage}
          </span>
          <CopyButton code={code} />
        </div>
      </div>

      {/* Code */}
      <Highlight theme={robloxTheme} code={code.trim()} language={language === "luau" ? "lua" : language}>
        {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(
              highlightClass,
              "overflow-x-auto p-4 text-sm leading-6"
            )}
            style={{ ...style, margin: 0, background: "transparent" }}
          >
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })} className="table-row">
                {showLineNumbers && (
                  <span className="table-cell select-none pr-4 text-right text-xs text-text-muted">
                    {i + 1}
                  </span>
                )}
                <span className="table-cell">
                  {line.map((token, key) => (
                    <span key={key} {...getTokenProps({ token })} />
                  ))}
                </span>
              </div>
            ))}
          </pre>
        )}
      </Highlight>

      {/* Optional CTA */}
      {cta && (
        <div className="border-t border-glass-border px-4 py-3">
          <CTAButton variant={cta.variant} href={cta.href} label={cta.label} />
        </div>
      )}
    </div>
  );
});
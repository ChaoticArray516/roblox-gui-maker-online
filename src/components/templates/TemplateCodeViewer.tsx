"use client";

/**
 * SOP-3I-10: TemplateCodeViewer — 模板代码查看器
 *
 * 四标签：Preview / Client Code / Server Code / ModuleScript。
 * 基于 prism-react-renderer 高亮 Luau（lua grammar），带行号、复制、全屏。
 * 纯客户端岛，外层 /templates/[slug] 保持 Server Component。
 */

import { useState, useMemo, memo } from "react";
import { Highlight, themes, type PrismTheme } from "prism-react-renderer";
import {
  Eye,
  Monitor,
  Server,
  Package,
  Maximize,
  Minimize,
  Copy,
  Check,
} from "lucide-react";
import { copyToClipboard } from "@/lib/export-utils";

export interface TemplateCodeViewerProps {
  templateName: string;
  previewComponent: React.ReactNode;
  clientCode: string;
  serverCode?: string;
  moduleCode?: string;
  defaultTab?: "preview" | "client" | "server" | "module";
}

type ViewerTab = "preview" | "client" | "server" | "module";

interface TabConfig {
  id: ViewerTab;
  label: string;
  icon: React.ReactNode;
  code: string | null;
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
      className="flex items-center gap-1.5 rounded-md border border-[#334155] bg-[#1e293b] px-3 py-1.5 text-xs font-medium text-[#cbd5e1] transition-colors hover:border-[#475569] hover:text-text"
    >
      {copied ? (
        <>
          <Check className="size-3.5 text-green-500" />
          <span className="text-green-500">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="size-3.5" />
          Copy Code
        </>
      )}
    </button>
  );
});

export const TemplateCodeViewer = memo(function TemplateCodeViewer({
  templateName,
  previewComponent,
  clientCode,
  serverCode,
  moduleCode,
  defaultTab = "preview",
}: TemplateCodeViewerProps) {
  const [activeTab, setActiveTab] = useState<ViewerTab>(defaultTab);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const tabs: TabConfig[] = useMemo(
    () => [
      { id: "preview", label: "Preview", icon: <Eye className="size-3.5" />, code: null },
      { id: "client", label: "Client Code", icon: <Monitor className="size-3.5" />, code: clientCode },
      { id: "server", label: "Server Code", icon: <Server className="size-3.5" />, code: serverCode || null },
      { id: "module", label: "ModuleScript", icon: <Package className="size-3.5" />, code: moduleCode || null },
    ],
    [clientCode, serverCode, moduleCode],
  );

  const visibleTabs = tabs.filter((t) => t.code !== null || t.id === "preview");
  const activeCode = tabs.find((t) => t.id === activeTab)?.code;

  return (
    <div
      className={`flex flex-col overflow-hidden rounded-xl border border-[#1e293b] bg-[#0f172a] ${
        isFullscreen ? "fixed inset-4 z-50 rounded-2xl" : ""
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1e293b] bg-[#020617] px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[#f1f5f9]">{templateName}</h3>
          <span className="rounded bg-[#1e293b] px-2 py-0.5 font-mono text-[10px] text-[#94a3b8]">
            Luau
          </span>
        </div>
        <div className="flex items-center gap-2">
          {activeTab !== "preview" && activeCode && <CopyButton code={activeCode} />}
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-[#334155] bg-[#1e293b] px-2.5 py-1.5 text-xs font-medium text-[#94a3b8] transition-colors hover:border-[#475569] hover:text-text"
          >
            {isFullscreen ? <Minimize className="size-3.5" /> : <Maximize className="size-3.5" />}
            {isFullscreen ? "Exit Full" : "Full"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5 border-b border-[#1e293b] bg-[#020617] px-4 pt-1">
        {visibleTabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 border-b-2 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "border-brand-500 text-brand-400"
                : "border-transparent text-text-muted hover:text-text"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-auto ${isFullscreen ? "" : "max-h-[600px]"}`}>
        {activeTab === "preview" ? (
          <div className="flex min-h-[300px] items-start justify-center p-6">
            {previewComponent}
          </div>
        ) : activeCode ? (
          <div className="bg-[#0f172a] py-4 text-[13px] leading-relaxed">
            <Highlight theme={robloxTheme} code={activeCode} language="lua">
              {({ className, style, tokens, getLineProps, getTokenProps }) => (
                <div
                  className={`${className} flex overflow-auto`}
                  style={{
                    ...style,
                    fontFamily: 'var(--font-mono), Consolas, Monaco, "Courier New", monospace',
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <div className="sticky left-0 min-w-[48px] select-none border-r border-[#1e293b] bg-[#0f172a] py-0 pr-4 pl-3 text-right">
                    {tokens.map((_, i) => (
                      <div
                        key={i}
                        className="h-[20.8px] text-xs leading-[20.8px] text-[#475569]"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                  <div className="min-w-0 flex-1 py-0 pr-6 pl-3">
                    {tokens.map((line, i) => (
                      <div
                        key={i}
                        {...getLineProps({ line })}
                        className="h-[20.8px] whitespace-pre leading-[20.8px]"
                      >
                        {line.map((token, key) => (
                          <span key={key} {...getTokenProps({ token })} />
                        ))}
                        {line.length === 0 && <span>&nbsp;</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Highlight>
          </div>
        ) : (
          <div className="p-10 text-center text-sm text-text-muted">
            No code available for this tab.
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-[#1e293b] bg-[#020617] px-4 py-2 text-[11px] text-[#64748b]">
        <span>
          {activeTab === "preview"
            ? "Visual preview of the template"
            : activeCode
              ? `${activeCode.split("\n").length} lines`
              : ""}
        </span>
        <span>Roblox GUI Maker</span>
      </div>
    </div>
  );
});

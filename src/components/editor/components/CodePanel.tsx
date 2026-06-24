"use client";

/**
 * SOP-3F-10: 代码预览面板
 *
 * 使用 @uiw/react-codemirror + @codemirror/legacy-modes 实现 Lua 语法高亮。
 * CodeMirror 通过 next/dynamic(ssr:false) 懒加载，不进入首页 bundle。
 * 支持 Client / Server 两个代码标签页切换。
 */

import { useState } from "react";
import dynamic from "next/dynamic";
import { StreamLanguage } from "@codemirror/language";
import { lua } from "@codemirror/legacy-modes/mode/lua";

// Lazy-load CodeMirror to keep it out of the initial page bundle.
const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((mod) => mod.default),
  { ssr: false },
);

type Tab = "client" | "server";

interface CodePanelProps {
  clientCode: string;
  serverCode: string;
}

function TabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-b-2 border-brand-500 text-text"
          : "text-text-muted hover:text-text"
      }`}
    >
      {label}
    </button>
  );
}

export function CodePanel({ clientCode, serverCode }: CodePanelProps) {
  const [tab, setTab] = useState<Tab>("client");
  const code = tab === "client" ? clientCode : serverCode;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-b-2xl">
      <div className="flex items-center border-b border-glass-border">
        <TabButton active={tab === "client"} label="Client" onClick={() => setTab("client")} />
        <TabButton active={tab === "server"} label="Server" onClick={() => setTab("server")} />
      </div>
      <div className="relative flex-1 overflow-auto bg-[#0d0d12]">
        <CodeMirror
          key={tab}
          value={code}
          theme="dark"
          editable={false}
          extensions={[StreamLanguage.define(lua)]}
          className="h-full text-xs"
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: false,
            highlightActiveLine: false,
            foldGutter: false,
          }}
        />
      </div>
    </div>
  );
}

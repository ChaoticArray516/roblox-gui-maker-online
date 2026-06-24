"use client";

/**
 * SOP-3F-13: 键盘快捷键 hook
 *
 * 绑定：Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y（撤销/重做）、Delete（删除选中）、
 * Ctrl+C / Ctrl+V / Ctrl+D（复制/粘贴/_duplicate）、方向键微移、
 * Ctrl+E（导出 Luau）、Ctrl+S（保存 JSON）。
 * 在 input/textarea/contenteditable 中自动屏蔽，避免误触发。
 */

import { useEffect } from "react";
import { useEditorContext } from "../context/EditorContext";
import { downloadTextFile } from "@/lib/export-utils";

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.getAttribute("contenteditable") === "true"
  );
}

export function useKeyboardShortcuts() {
  const { state, actions } = useEditorContext();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const selectedId = state.selectedId;
      const rootId = state.rootId;

      // Ctrl/Meta 组合键
      if (ctrl && !e.altKey) {
        const key = e.key.toLowerCase();

        if (key === "z") {
          e.preventDefault();
          if (e.shiftKey) actions.redo();
          else actions.undo();
          return;
        }

        if (key === "y") {
          e.preventDefault();
          actions.redo();
          return;
        }

        if (key === "c" && selectedId) {
          e.preventDefault();
          actions.copyElement(selectedId);
          return;
        }

        if (key === "v") {
          e.preventDefault();
          actions.pasteElement(selectedId);
          return;
        }

        if (key === "d" && selectedId) {
          e.preventDefault();
          actions.duplicateElement(selectedId);
          return;
        }

        if (key === "e") {
          e.preventDefault();
          const code = actions.exportLuau();
          downloadTextFile(code, "gui.lua", "text/plain");
          return;
        }

        if (key === "s") {
          e.preventDefault();
          const json = actions.exportJSON();
          downloadTextFile(json, "gui.json", "application/json");
          return;
        }
      }

      // Delete / Backspace
      if ((e.key === "Delete" || e.key === "Backspace") && selectedId && selectedId !== rootId) {
        e.preventDefault();
        actions.removeElement(selectedId);
        return;
      }

      // Arrow nudge
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedId
      ) {
        const el = state.elements[selectedId];
        if (!el) return;
        const step = e.shiftKey ? 10 : 1;
        const pos = { ...el.properties.position };
        switch (e.key) {
          case "ArrowUp":
            pos.offsetY -= step;
            break;
          case "ArrowDown":
            pos.offsetY += step;
            break;
          case "ArrowLeft":
            pos.offsetX -= step;
            break;
          case "ArrowRight":
            pos.offsetX += step;
            break;
        }
        e.preventDefault();
        actions.updateElement(selectedId, {
          properties: { ...el.properties, position: pos },
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [state, actions]);
}

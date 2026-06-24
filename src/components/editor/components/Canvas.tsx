"use client";

/**
 * SOP-3F-05: 画布 — drop 目标 + 元素渲染 + 网格 + 设备框 + zoom
 *
 * palette 拖入用原生 HTML5 DnD（onDrop 读取 application/x-rgm-type）。
 * 元素内拖拽移动由 EditorElement 的指针事件处理。
 * 点击空白取消选中。消费 useEditorContext。
 */

import { type DragEvent } from "react";
import { MousePointer2 } from "lucide-react";
import { useEditorContext } from "../context/EditorContext";
import { EditorElement } from "./EditorElement";
import { DeviceFrame } from "./DeviceFrame";
import { DEVICE_CONFIGS } from "@/lib/editor-utils";
import { type GUIElementType, isVisualElement, getDefaultProperties } from "@/lib/types";

export function Canvas() {
  const { state, actions } = useEditorContext();
  const cfg = DEVICE_CONFIGS[state.deviceType];

  const root = state.rootId ? state.elements[state.rootId] : null;
  const children = root ? root.children.map((id) => state.elements[id]).filter(Boolean) : [];
  const visualChildren = children.filter((c) => isVisualElement(c.type) && c.type !== "ScreenGui");

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData("application/x-rgm-type") as GUIElementType;
    if (!type) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const defaults = getDefaultProperties(type);
    // 落点为中心
    const sizePx = { x: defaults.size.scaleX * cfg.width + defaults.size.offsetX, y: defaults.size.scaleY * cfg.height + defaults.size.offsetY };
    actions.addElement(type, state.rootId, {
      properties: {
        ...defaults,
        position: { scaleX: 0, offsetX: Math.max(0, Math.round(x - sizePx.x / 2)), scaleY: 0, offsetY: Math.max(0, Math.round(y - sizePx.y / 2)) },
      },
    });
  };

  const handleMove = (id: string, x: number, y: number) => {
    const el = state.elements[id];
    if (!el) return;
    actions.updateElement(id, {
      properties: { ...el.properties, position: { scaleX: 0, offsetX: x, scaleY: 0, offsetY: y } },
    });
  };

  const handleResize = (id: string, w: number, h: number) => {
    const el = state.elements[id];
    if (!el) return;
    actions.updateElement(id, {
      properties: { ...el.properties, size: { scaleX: 0, offsetX: w, scaleY: 0, offsetY: h } },
    });
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-start gap-3 overflow-auto bg-bg p-6">
      {/* Zoom 控制 */}
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <button
          type="button"
          onClick={() => actions.setZoom(Math.max(0.1, state.zoom - 0.1))}
          className="rounded-md border border-glass-border bg-surface px-2 py-1 hover:bg-surface-raised"
        >
          −
        </button>
        <span className="w-12 text-center">{Math.round(state.zoom * 100)}%</span>
        <button
          type="button"
          onClick={() => actions.setZoom(Math.min(3, state.zoom + 0.1))}
          className="rounded-md border border-glass-border bg-surface px-2 py-1 hover:bg-surface-raised"
        >
          +
        </button>
        <button
          type="button"
          onClick={() => actions.setZoom(1)}
          className="rounded-md border border-glass-border bg-surface px-2 py-1 hover:bg-surface-raised"
        >
          Reset
        </button>
      </div>

      <DeviceFrame deviceType={state.deviceType} zoom={state.zoom}>
        <div
          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
          onDrop={handleDrop}
          onClick={() => actions.selectElement(null)}
          className="relative"
          style={{
            width: cfg.width,
            height: cfg.height,
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {visualChildren.length === 0 && (
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-text-muted">
              <MousePointer2 className="size-6" />
              <span className="text-sm">Drag a component here</span>
            </div>
          )}
          {visualChildren.map((el) => (
            <EditorElement
              key={el.id}
              element={el}
              isSelected={state.selectedId === el.id}
              isPreview={state.previewMode}
              parentW={cfg.width}
              parentH={cfg.height}
              onSelect={() => actions.selectElement(el.id)}
              onMove={handleMove}
              onResize={handleResize}
            />
          ))}
        </div>
      </DeviceFrame>
    </div>
  );
}

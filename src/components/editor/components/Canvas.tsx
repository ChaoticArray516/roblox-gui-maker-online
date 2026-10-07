"use client";

/**
 * SOP-3F-05: 画布 — drop 目标 + 元素渲染 + 网格 + 设备框 + zoom
 *
 * palette 拖入用原生 HTML5 DnD（onDrop 读取 application/x-rgm-type）。
 * 元素内拖拽移动由 EditorElement 的指针事件处理。
 * 点击空白取消选中。消费 useEditorContext。
 */

import { useRef, useEffect, type DragEvent } from "react";

const CANVAS_SIZE = 4000;
import { MousePointer2 } from "lucide-react";
import { useEditorContext } from "../context/EditorContext";
import { EditorElement } from "./EditorElement";
import { DeviceFrame } from "./DeviceFrame";
import { DEVICE_CONFIGS } from "@/lib/editor-utils";
import { type GUIElementType, isVisualContainer, getDefaultProperties } from "@/lib/types";

export function Canvas() {
  const { state, actions, projectLoading } = useEditorContext();
  const cfg = DEVICE_CONFIGS[state.deviceType];
  const scrollRef = useRef<HTMLDivElement>(null);

  // 首次加载时将设备框置于画布中央，给用户四周都有空间的感觉
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = (CANVAS_SIZE - el.clientWidth) / 2;
    el.scrollTop = (CANVAS_SIZE - el.clientHeight) / 2;
  }, []);

  const root = state.rootId ? state.elements[state.rootId] : null;
  const children = root ? root.children.map((id) => state.elements[id]).filter(Boolean) : [];
  // SOP-3I-04: 媒体/3D 组件（VideoFrame/ViewportFrame/CanvasGroup）是可视化容器，纳入渲染
  const visualChildren = children.filter((c) => isVisualContainer(c.type) && c.type !== "ScreenGui");

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
    <div
      ref={scrollRef}
      className="relative flex-1 overflow-auto bg-bg"
      style={{
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.14) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
        backgroundAttachment: "local",
      }}
    >
      <div
        className="flex shrink-0 items-center justify-center"
        style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
      >
        <div className="shrink-0">
          <DeviceFrame deviceType={state.deviceType} zoom={state.zoom}>
            <div
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
              onDrop={handleDrop}
              onClick={() => actions.selectElement(null)}
              className="relative"
              style={{
                width: cfg.width,
                height: cfg.height,
              }}
            >
              {/* SOP-3X-07: ?project= 加载期不渲染空态提示（治闪烁） */}
              {!projectLoading && visualChildren.length === 0 && (
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
      </div>
    </div>
  );
}

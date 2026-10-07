"use client";

/**
 * SOP-3F-05: 画布元素 — 单个 GUI 元素渲染 + 拖拽移动 + resize
 *
 * 指针事件拖拽（setPointerCapture try/catch，与原 EditorShell 一致）。
 * 选中显示 cyan 描边 + 8 向 resize 手柄。Preview 模式禁用交互。
 */

import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { type GUIElement, isVisualContainer } from "@/lib/types";
import { color3ToCss, udim2ToPixels, snapToGrid } from "@/lib/editor-utils";
import { useEditorContext } from "../context/EditorContext";

interface Props {
  element: GUIElement;
  isSelected: boolean;
  isPreview: boolean;
  parentW: number;
  parentH: number;
  onSelect: () => void;
  onMove: (id: string, x: number, y: number) => void;
  onResize: (id: string, w: number, h: number) => void;
}

const HANDLES = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;
type HandleDir = (typeof HANDLES)[number];

export function EditorElement({ element, isSelected, isPreview, parentW, parentH, onSelect, onMove, onResize }: Props) {
  const dragState = useRef<{ kind: "move" | HandleDir; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number } | null>(null);

  const pos = udim2ToPixels(element.properties.position, parentW, parentH);
  const size = udim2ToPixels(element.properties.size, parentW, parentH);
  const { state, actions } = useEditorContext();
  const childElements = element.children
    .map((id) => state.elements[id])
    .filter((c): c is GUIElement => Boolean(c) && isVisualContainer(c.type) && c.type !== "ScreenGui");
  const p = element.properties;

  const bg = color3ToCss(p.backgroundColor3, p.backgroundTransparency);
  const isText = element.type === "TextLabel" || element.type === "TextButton" || element.type === "TextBox";

  const handlePointerDown = (e: ReactPointerEvent, kind: "move" | HandleDir) => {
    if (isPreview) return;
    e.stopPropagation();
    onSelect();
    dragState.current = {
      kind,
      startX: e.clientX,
      startY: e.clientY,
      origX: pos.x,
      origY: pos.y,
      origW: size.x,
      origH: size.y,
    };
    try {
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      // synthetic pointer — move still works via canvas pointermove
    }
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    const ds = dragState.current;
    if (!ds) return;
    const dx = e.clientX - ds.startX;
    const dy = e.clientY - ds.startY;
    if (ds.kind === "move") {
      onMove(element.id, snapToGrid(ds.origX + dx), snapToGrid(ds.origY + dy));
    } else {
      let w = ds.origW;
      let h = ds.origH;
      let x = ds.origX;
      let y = ds.origY;
      if (ds.kind.includes("e")) w = Math.max(10, ds.origW + dx);
      if (ds.kind.includes("s")) h = Math.max(10, ds.origH + dy);
      if (ds.kind.includes("w")) { w = Math.max(10, ds.origW - dx); x = ds.origX + (ds.origW - w); }
      if (ds.kind.includes("n")) { h = Math.max(10, ds.origH - dy); y = ds.origY + (ds.origH - h); }
      onResize(element.id, snapToGrid(w), snapToGrid(h));
      if (ds.kind.includes("w") || ds.kind.includes("n")) {
        onMove(element.id, snapToGrid(x), snapToGrid(y));
      }
    }
  };

  const handlePointerUp = (e: ReactPointerEvent) => {
    dragState.current = null;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // noop
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={(e) => handlePointerDown(e, "move")}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => {
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
        }
      }}
      className={`absolute flex items-center justify-center overflow-hidden text-xs select-none ${isPreview ? "cursor-default" : "cursor-move"} ${isSelected ? "outline outline-2 outline-cyan-accent" : "outline outline-1 outline-white/5"}`}
      style={{
        left: pos.x,
        top: pos.y,
        width: size.x,
        height: size.y,
        backgroundColor: bg,
        borderRadius: p.cornerRadius || 0,
        color: isText ? color3ToCss(p.textColor3) : undefined,
        fontSize: p.textSize,
        pointerEvents: isPreview ? "none" : "auto",
      }}
    >
      {isText && p.text}
      {element.type === "ImageLabel" && p.image && (
        <img src={p.image} alt={element.name || "ImageLabel"} className="pointer-events-none h-full w-full object-cover" />
      )}
      {element.type === "ScrollingFrame" && (
        <span className="text-text-muted/50">ScrollingFrame</span>
      )}
      {/* SOP-3I-04: 媒体/3D 组件画布占位 */}
      {element.type === "VideoFrame" && (
        <span className="text-text-muted/50">VideoFrame</span>
      )}
      {element.type === "ViewportFrame" && (
        <span className="text-text-muted/50">ViewportFrame</span>
      )}
      {element.type === "CanvasGroup" && (
        <span className="text-text-muted/50">CanvasGroup</span>
      )}
      {/* SOP-3I-05: 世界空间容器画布占位 */}
      {element.type === "BillboardGui" && (
        <span className="text-text-muted/50">BillboardGui</span>
      )}
      {element.type === "SurfaceGui" && (
        <span className="text-text-muted/50">SurfaceGui</span>
      )}
      {/* SOP-3I-07: 交互复合组件画布占位 */}
      {element.type === "DraggablePanel" && (
        <span className="text-text-muted/50">{p.dragHandleTitle || "DraggablePanel"}</span>
      )}
      {element.type === "AnimatedButton" && (
        <span className="text-text-muted/50">{p.text || "AnimatedButton"}</span>
      )}
      {element.type === "TypewriterText" && (
        <span className="text-text-muted/50">{p.fullText || "TypewriterText"}</span>
      )}
      {element.type === "CountdownTimer" && (
        <span className="text-text-muted/50">{p.text || "00:00"}</span>
      )}
      {element.type === "ModalDialog" && (
        <span className="text-text-muted/50">{p.titleText || "ModalDialog"}</span>
      )}
      {element.type === "TabContainer" && (
        <span className="text-text-muted/50">TabContainer</span>
      )}
      {element.type === "DropdownMenu" && (
        <span className="text-text-muted/50">{p.dropdownPlaceholder || "DropdownMenu"}</span>
      )}
      {element.type === "SliderBar" && (
        <span className="text-text-muted/50">SliderBar</span>
      )}
      {element.type === "NotificationToast" && (
        <span className="text-text-muted/50">{p.text || "NotificationToast"}</span>
      )}
      {element.type === "TweenedFrame" && (
        <span className="text-text-muted/50">TweenedFrame</span>
      )}

      {/* 递归渲染子可视元素 */}
      {childElements.map((child) => (
        <EditorElement
          key={child.id}
          element={child}
          isSelected={state.selectedId === child.id}
          isPreview={isPreview}
          parentW={size.x}
          parentH={size.y}
          onSelect={() => actions.selectElement(child.id)}
          onMove={onMove}
          onResize={onResize}
        />
      ))}

      {/* Resize 手柄（仅选中 + 非 preview） */}
      {isSelected && !isPreview && HANDLES.map((dir) => (
        <div
          key={dir}
          onPointerDown={(e) => handlePointerDown(e, dir)}
          className={`absolute size-2 rounded-sm border border-cyan-accent bg-surface ${handleClass(dir)}`}
          style={{ cursor: `${dir}-resize` }}
        />
      ))}
    </div>
  );
}

function handleClass(dir: HandleDir): string {
  const map: Record<HandleDir, string> = {
    nw: "-top-1 -left-1",
    n: "-top-1 left-1/2 -translate-x-1/2",
    ne: "-top-1 -right-1",
    e: "top-1/2 -right-1 -translate-y-1/2",
    se: "-bottom-1 -right-1",
    s: "-bottom-1 left-1/2 -translate-x-1/2",
    sw: "-bottom-1 -left-1",
    w: "top-1/2 -left-1 -translate-y-1/2",
  };
  return map[dir];
}

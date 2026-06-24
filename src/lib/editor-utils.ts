/**
 * SOP-3F-05: 编辑器工具函数 — 颜色转换 + UDim2 像素计算 + 吸附
 *
 * 被 Canvas / PropertiesPanel / ColorPicker 复用。纯函数，无副作用。
 */

import type { Color3, UDim2, GUIElement } from "./types";

/** Color3 (0-1 float) → "#rrggbb" */
export function color3ToHex(c: Color3): string {
  const to2 = (n: number) => Math.round(Math.max(0, Math.min(1, n)) * 255).toString(16).padStart(2, "0");
  return `#${to2(c.r)}${to2(c.g)}${to2(c.b)}`;
}

/** "#rrggbb" → Color3 (0-1 float) */
export function hexToColor3(hex: string): Color3 {
  const h = hex.replace("#", "").slice(0, 6).padEnd(6, "0");
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
  };
}

/** Color3 (0-1) → "rgba(r,g,b,a)" CSS 字符串 */
export function color3ToCss(c: Color3, transparency = 0): string {
  const r = Math.round(Math.max(0, Math.min(1, c.r)) * 255);
  const g = Math.round(Math.max(0, Math.min(1, c.g)) * 255);
  const b = Math.round(Math.max(0, Math.min(1, c.b)) * 255);
  return `rgba(${r}, ${g}, ${b}, ${1 - transparency})`;
}

/** UDim2 → 像素 {x, y}，给定父容器尺寸 */
export function udim2ToPixels(udim: UDim2, parentW: number, parentH: number): { x: number; y: number } {
  return {
    x: udim.scaleX * parentW + udim.offsetX,
    y: udim.scaleY * parentH + udim.offsetY,
  };
}

/** 像素 {x, y} + 父尺寸 → UDim2（保留原 scale，更新 offset） */
export function pixelsToUdim2(
  x: number,
  y: number,
  parentW: number,
  parentH: number,
  base: UDim2,
): UDim2 {
  return {
    scaleX: base.scaleX,
    offsetX: Math.round(x - base.scaleX * parentW),
    scaleY: base.scaleY,
    offsetY: Math.round(y - base.scaleY * parentH),
  };
}

/** 吸附到网格（grid 像素） */
export function snapToGrid(value: number, grid = 10): number {
  return Math.round(value / grid) * grid;
}

/** 收集元素的所有后代 id（递归） */
export function getDescendants(id: string, elements: Record<string, GUIElement>): string[] {
  const el = elements[id];
  if (!el) return [];
  return [id, ...el.children.flatMap((c) => getDescendants(c, elements))];
}

/** 收集元素的所有祖先 id（从自身往上） */
export function getAncestors(id: string, elements: Record<string, GUIElement>): string[] {
  const el = elements[id];
  if (!el?.parentId) return [id];
  return [id, ...getAncestors(el.parentId, elements)];
}

/** 设备预览尺寸配置 */
export const DEVICE_CONFIGS = {
  desktop: { width: 1280, height: 720, label: "Desktop" },
  tablet: { width: 1024, height: 768, label: "Tablet" },
  mobile: { width: 375, height: 667, label: "Mobile" },
} as const;

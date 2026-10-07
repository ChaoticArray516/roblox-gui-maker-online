/**
 * Template → Editor element tree 转换器
 *
 * 将 `template-preview-trees.ts` 中用于 div 模拟预览的 `PreviewNode[]`
 * 转换为编辑器状态所需的 `Record<string, GUIElement>`，
 * 使 `/editor?template={slug}` 进入时画布直接渲染真实 GUI 组件。
 */

import { v4 as uuidv4 } from "uuid";
import type { PreviewNode } from "@/components/templates/TemplateLivePreview";
import {
  type GUIElement,
  type GUIElementType,
  type ElementProperties,
  GUI_ELEMENT_TYPES,
  getDefaultProperties,
} from "@/lib/types";
import { getTemplatePreviewTree } from "@/lib/template-preview-trees";

function isGUIElementType(type: string): type is GUIElementType {
  return (GUI_ELEMENT_TYPES as readonly string[]).includes(type);
}

function toUDim2(value: unknown): { scaleX: number; offsetX: number; scaleY: number; offsetY: number } | null {
  const v = value as Record<string, number> | undefined;
  if (v == null) return null;
  return {
    scaleX: v.scaleX ?? 0,
    offsetX: v.offsetX ?? 0,
    scaleY: v.scaleY ?? 0,
    offsetY: v.offsetY ?? 0,
  };
}

function toColor3(value: unknown): { r: number; g: number; b: number } | null {
  const v = value as Record<string, number> | undefined;
  if (v == null) return null;
  return { r: v.r ?? 1, g: v.g ?? 1, b: v.b ?? 1 };
}

function toAnchorPoint(value: unknown): { x: number; y: number } | null {
  const v = value as Record<string, number> | undefined;
  if (v == null) return null;
  return { x: v.x ?? 0, y: v.y ?? 0 };
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  return null;
}

function convertNode(
  node: PreviewNode,
  parentId: string | null,
): { element: GUIElement; descendants: GUIElement[] } {
  if (!isGUIElementType(node.type)) {
    throw new Error(`Unsupported preview node type: ${node.type}`);
  }

  const defaults = getDefaultProperties(node.type);
  const props = node.properties;
  const overrides: Partial<ElementProperties> = {};

  const size = toUDim2(props.Size);
  if (size) overrides.size = size;

  const position = toUDim2(props.Position);
  if (position) overrides.position = position;

  const backgroundColor3 = toColor3(props.BackgroundColor3);
  if (backgroundColor3) overrides.backgroundColor3 = backgroundColor3;

  const backgroundTransparency = toNumber(props.BackgroundTransparency);
  if (backgroundTransparency !== null) overrides.backgroundTransparency = backgroundTransparency;

  const borderSizePixel = toNumber(props.BorderSizePixel);
  if (borderSizePixel !== null) overrides.borderSizePixel = borderSizePixel;

  const borderColor3 = toColor3(props.BorderColor3);
  if (borderColor3) overrides.borderColor3 = borderColor3;

  const cornerRadius = toNumber(props.CornerRadius);
  if (cornerRadius !== null) overrides.cornerRadius = cornerRadius;

  const anchorPoint = toAnchorPoint(props.AnchorPoint);
  if (anchorPoint) overrides.anchorPoint = anchorPoint;

  const text = props.Text;
  if (typeof text === "string") overrides.text = text;

  const textColor3 = toColor3(props.TextColor3);
  if (textColor3) overrides.textColor3 = textColor3;

  const textSize = toNumber(props.TextSize);
  if (textSize !== null) overrides.textSize = textSize;

  const font = props.Font;
  if (typeof font === "string") overrides.font = font;

  const properties: ElementProperties = { ...defaults, ...overrides };

  const zIndexValue = toNumber(props.ZIndex);
  const element: GUIElement = {
    id: uuidv4(),
    type: node.type,
    name: node.name,
    parentId,
    children: [],
    properties,
    zIndex: zIndexValue ?? (node.type === "ScreenGui" ? 0 : 1),
  };

  const descendants: GUIElement[] = [];
  for (const child of node.children) {
    const { element: childEl, descendants: childDescendants } = convertNode(child, element.id);
    element.children.push(childEl.id);
    descendants.push(childEl, ...childDescendants);
  }

  return { element, descendants };
}

export function getTemplateEditorTree(slug: string): {
  elements: Record<string, GUIElement>;
  rootId: string | null;
} {
  const previewRoots = getTemplatePreviewTree(slug);
  if (!previewRoots.length) {
    return { elements: {}, rootId: null };
  }

  // PreviewTree 当前每个 slug 只有一棵 ScreenGui 根树，直接取第一项。
  const { element: root, descendants } = convertNode(previewRoots[0], null);
  const elements: Record<string, GUIElement> = { [root.id]: root };
  for (const d of descendants) {
    elements[d.id] = d;
  }

  return { elements, rootId: root.id };
}

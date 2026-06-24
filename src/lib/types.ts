/**
 * SOP-3F-01: 编辑器类型系统
 *
 * 来源：func_extend 参考实现，适配 React 19 + TS strict。
 * 作为编辑器唯一类型源，替换 EditorShell 原局部 CanvasElement 类型。
 * 所有 /editor/* 内组件从此 import。
 */

/** 编辑器支持的 GUI 元素类型 */
export type GUIElementType =
  | "ScreenGui"
  | "Frame"
  | "TextLabel"
  | "TextButton"
  | "TextBox"
  | "ImageLabel"
  | "ImageButton"
  | "ScrollingFrame"
  | "UICorner"
  | "UIGradient"
  | "UIListLayout"
  | "UIGridLayout"
  | "UIPadding";

export const GUI_ELEMENT_TYPES: readonly GUIElementType[] = [
  "ScreenGui",
  "Frame",
  "TextLabel",
  "TextButton",
  "TextBox",
  "ImageLabel",
  "ImageButton",
  "ScrollingFrame",
  "UICorner",
  "UIGradient",
  "UIListLayout",
  "UIGridLayout",
  "UIPadding",
] as const;

/** Roblox UDim2 — position/size with scale and offset components */
export interface UDim2 {
  scaleX: number;
  offsetX: number;
  scaleY: number;
  offsetY: number;
}

/** Roblox Color3 — RGB (0-1) */
export interface Color3 {
  r: number;
  g: number;
  b: number;
}

/** 完整元素属性（覆盖所有元素类型） */
export interface ElementProperties {
  // Layout
  position: UDim2;
  size: UDim2;
  anchorPoint: { x: number; y: number };

  // Appearance
  backgroundColor3: Color3;
  backgroundTransparency: number;
  cornerRadius: number;

  // Text
  text: string;
  font: string;
  textSize: number;
  textColor3: Color3;

  // Container
  layout: "none" | "list" | "grid";
  padding: number;

  // Action
  onClick: string;

  // Extended（按元素类型可选）
  image?: string;
  placeholder?: string;
  cellSize?: { x: number; y: number };
  cellPadding?: { x: number; y: number };
  fillDirection?: "horizontal" | "vertical";
  sortOrder?: "layoutOrder" | "name" | "custom";
  startCorner?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  gradientColor1?: Color3;
  gradientColor2?: Color3;
  gradientTransparency1?: number;
  gradientTransparency2?: number;
  gradientRotation?: number;
}

/** 单个 GUI 元素 */
export interface GUIElement {
  id: string;
  type: GUIElementType;
  name: string;
  parentId: string | null;
  children: string[];
  properties: ElementProperties;
  zIndex: number;
}

/** 撤销/重做：状态快照式（history 存历次操作后的 elements 快照，可靠回滚） */
export interface Command {
  type: "add" | "remove" | "move" | "reorder" | "update";
  elementId: string;
  timestamp: number;
}

/** 设备预览类型 */
export type DeviceType = "desktop" | "tablet" | "mobile";

/** 编辑器状态容器 */
export interface EditorState {
  elements: Record<string, GUIElement>;
  rootId: string | null;
  selectedId: string | null;
  deviceType: DeviceType;
  zoom: number;
  previewMode: boolean;
  /** 操作元信息（UI 显示用） */
  history: Command[];
  /** 元素树快照栈（与 history 同步，undo/redo 回滚用） */
  snapshots: Record<string, GUIElement>[];
  historyIndex: number;
}

/** AI 生成请求 */
export interface AIGenerationRequest {
  prompt: string;
  guiType: "menu" | "shop" | "hud" | "inventory" | "settings" | "custom";
  style: "bright" | "dark" | "clean" | "cartoon";
  device: "desktop" | "mobile";
}

/** AI 生成响应 */
export interface AIGenerationResponse {
  elements: Array<{
    type: GUIElementType;
    name: string;
    parentId: string | null;
    properties: Partial<ElementProperties>;
    children?: Array<{
      type: GUIElementType;
      name: string;
      properties: Partial<ElementProperties>;
    }>;
  }>;
}

/** 组件面板项 */
export interface ComponentItem {
  type: GUIElementType;
  icon: string;
  title: string;
  description: string;
}

/** 基础对象组件 */
export const OBJECT_COMPONENTS: readonly ComponentItem[] = [
  { type: "ScreenGui", icon: "Monitor", title: "ScreenGui", description: "Root screen container" },
  { type: "Frame", icon: "Square", title: "Frame", description: "Solid rectangle container" },
  { type: "TextLabel", icon: "Type", title: "TextLabel", description: "Static text display" },
  { type: "TextButton", icon: "MousePointerClick", title: "TextButton", description: "Clickable button" },
  { type: "TextBox", icon: "TextCursor", title: "TextBox", description: "Text input field" },
  { type: "ImageLabel", icon: "Image", title: "ImageLabel", description: "Image display" },
  { type: "ImageButton", icon: "ImagePlus", title: "ImageButton", description: "Clickable image" },
  { type: "ScrollingFrame", icon: "Scroll", title: "ScrollingFrame", description: "Scrollable container" },
] as const;

/** 效果与布局组件 */
export const EFFECTS_COMPONENTS: readonly ComponentItem[] = [
  { type: "UICorner", icon: "Radius", title: "UICorner", description: "Round corners" },
  { type: "UIGradient", icon: "Palette", title: "UIGradient", description: "Color gradient" },
  { type: "UIListLayout", icon: "List", title: "UIListLayout", description: "Vertical stack" },
  { type: "UIGridLayout", icon: "LayoutGrid", title: "UIGridLayout", description: "Grid layout" },
  { type: "UIPadding", icon: "Move", title: "UIPadding", description: "Inner padding" },
] as const;

/** Roblox 字体列表 */
export const ROBLOX_FONTS: string[] = [
  "Gotham", "GothamBlack", "GothamBold", "GothamMedium",
  "SourceSans", "SourceSansBold", "SourceSansItalic", "SourceSansLight",
  "Arial", "ArialBold", "Cartoon", "Code",
  "Bangers", "Creepster", "DenkOne", "Fondamento", "FredokaOne",
  "GrenzeGotisch", "IndieFlower", "JosefinSans", "Jura", "Kalam",
  "LuckiestGuy", "Merriweather", "Michroma", "Nunito", "Oswald",
  "PatrickHand", "PermanentMarker", "PressStart2P", "Roboto",
  "RobotoCondensed", "RobotoMono", "Sarpanch", "SciFi", "SpecialElite",
  "TitilliumWeb", "Ubuntu",
];

/** 可视/容器元素（有 position/size） */
export function isVisualElement(type: GUIElementType): boolean {
  return (
    type === "Frame" || type === "TextLabel" || type === "TextButton" ||
    type === "TextBox" || type === "ImageLabel" || type === "ImageButton" ||
    type === "ScrollingFrame" || type === "ScreenGui"
  );
}

/** 文本元素 */
export function isTextElement(type: GUIElementType): boolean {
  return type === "TextLabel" || type === "TextButton" || type === "TextBox";
}

/** 容器元素 */
export function isContainerElement(type: GUIElementType): boolean {
  return type === "Frame" || type === "ScrollingFrame";
}

/** 按钮元素 */
export function isButtonElement(type: GUIElementType): boolean {
  return type === "TextButton" || type === "ImageButton";
}

/** UI 效果（无 position/size） */
export function isUIEffect(type: GUIElementType): boolean {
  return (
    type === "UICorner" || type === "UIGradient" || type === "UIListLayout" ||
    type === "UIGridLayout" || type === "UIPadding"
  );
}

/** 按元素类型返回默认属性 */
export function getDefaultProperties(type: GUIElementType): ElementProperties {
  const base = {
    position: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 0 },
    size: { scaleX: 0, offsetX: 0, scaleY: 0, offsetY: 0 },
    anchorPoint: { x: 0, y: 0 },
    backgroundTransparency: 0,
    cornerRadius: 0,
    text: "",
    font: "Gotham",
    textSize: 14,
    textColor3: { r: 1, g: 1, b: 1 },
    layout: "none" as const,
    padding: 0,
    onClick: "",
  };

  const defaults: Record<GUIElementType, ElementProperties> = {
    ScreenGui: { ...base, size: { scaleX: 1, offsetX: 0, scaleY: 1, offsetY: 0 }, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1 },
    Frame: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.3, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 8, padding: 8 },
    TextLabel: { ...base, size: { scaleX: 0.2, offsetX: 0, scaleY: 0.05, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 4, text: "Label", textSize: 18 },
    TextButton: { ...base, size: { scaleX: 0.2, offsetX: 0, scaleY: 0.06, offsetY: 0 }, backgroundColor3: { r: 0.429, g: 0.365, b: 0.984 }, cornerRadius: 8, text: "Button", font: "GothamBold", textSize: 18, onClick: "print('Button clicked!')" },
    TextBox: { ...base, size: { scaleX: 0.2, offsetX: 0, scaleY: 0.05, offsetY: 0 }, backgroundColor3: { r: 0.18, g: 0.18, b: 0.22 }, cornerRadius: 6, textSize: 16, placeholder: "Enter text..." },
    ImageLabel: { ...base, size: { scaleX: 0.15, offsetX: 0, scaleY: 0.15, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 8, image: "" },
    ImageButton: { ...base, size: { scaleX: 0.15, offsetX: 0, scaleY: 0.15, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 8, image: "", onClick: "print('Image button clicked!')" },
    ScrollingFrame: { ...base, size: { scaleX: 0.4, offsetX: 0, scaleY: 0.5, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 8, layout: "list", padding: 8 },
    UICorner: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, cornerRadius: 8 },
    UIGradient: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, gradientColor1: { r: 0.429, g: 0.365, b: 0.984 }, gradientColor2: { r: 0.545, g: 0.36, b: 0.964 }, gradientTransparency1: 0, gradientTransparency2: 0, gradientRotation: 0 },
    UIListLayout: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, layout: "list", padding: 8, fillDirection: "vertical", sortOrder: "layoutOrder" },
    UIGridLayout: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, layout: "grid", padding: 8, cellSize: { x: 100, y: 100 }, cellPadding: { x: 8, y: 8 }, startCorner: "topLeft", fillDirection: "horizontal", sortOrder: "layoutOrder" },
    UIPadding: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, padding: 16, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16 },
  };

  return defaults[type] ?? defaults.Frame;
}

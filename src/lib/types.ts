/**
 * SOP-3F-01: 编辑器类型系统
 *
 * 来源：func_extend 参考实现，适配 React 19 + TS strict。
 * 作为编辑器唯一类型源，替换 EditorShell 原局部 CanvasElement 类型。
 * 所有 /editor/* 内组件从此 import。
 */

/** 编辑器支持的 GUI 元素类型 */
export type GUIElementType =
  // 基础对象（SOP-3F-01 原有 13 种）
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
  | "UIPadding"
  // SOP-3I-01 扩展：约束类（5）
  | "UIStroke"
  | "UIScale"
  | "UIAspectRatioConstraint"
  | "UISizeConstraint"
  | "UITextSizeConstraint"
  // SOP-3I-01 扩展：交互类（1）
  | "UIDragDetector"
  // SOP-3I-01 扩展：媒体/3D 类（3）
  | "VideoFrame"
  | "ViewportFrame"
  | "CanvasGroup"
  // SOP-3I-01 扩展：世界空间类（4）
  | "BillboardGui"
  | "SurfaceGui"
  | "SelectionBox"
  | "SelectionSphere"
  // SOP-3I-01 扩展：增强效果类（2）
  | "UIGradientEnhanced"
  | "UIFlexLayout"
  // SOP-3I-07 扩展：交互复合组件类（10）
  | "DraggablePanel"
  | "AnimatedButton"
  | "TypewriterText"
  | "CountdownTimer"
  | "ModalDialog"
  | "TabContainer"
  | "DropdownMenu"
  | "SliderBar"
  | "NotificationToast"
  | "TweenedFrame";

export const GUI_ELEMENT_TYPES: readonly GUIElementType[] = [
  // 基础对象（13）
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
  // SOP-3I-01 扩展（15）
  "UIStroke",
  "UIScale",
  "UIAspectRatioConstraint",
  "UISizeConstraint",
  "UITextSizeConstraint",
  "UIDragDetector",
  "VideoFrame",
  "ViewportFrame",
  "CanvasGroup",
  "BillboardGui",
  "SurfaceGui",
  "SelectionBox",
  "SelectionSphere",
  "UIGradientEnhanced",
  "UIFlexLayout",
  // SOP-3I-07 扩展（10 交互复合组件）
  "DraggablePanel",
  "AnimatedButton",
  "TypewriterText",
  "CountdownTimer",
  "ModalDialog",
  "TabContainer",
  "DropdownMenu",
  "SliderBar",
  "NotificationToast",
  "TweenedFrame",
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

/** Roblox Vector2 — XY pair */
export interface Vector2 {
  x: number;
  y: number;
}

/** Roblox Vector3 — XYZ triple */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/** Roblox ColorSequence — keypoint 渐变（UIGradientEnhanced 用） */
export interface ColorSequenceKeypoint {
  time: number; // 0-1
  color: Color3;
}
export interface ColorSequence {
  keypoints: ColorSequenceKeypoint[];
}

/** Roblox NumberSequence — keypoint 数值曲线（UIGradientEnhanced 透明度用） */
export interface NumberSequenceKeypoint {
  time: number; // 0-1
  value: number; // 0-1
}
export interface NumberSequence {
  keypoints: NumberSequenceKeypoint[];
}

/** 事件绑定（UIDragDetector / 交互组件用） */
export interface EventBinding {
  script: string; // Luau 代码
  params: string[]; // 参数名
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

  // SOP-3I-01 扩展：UIStroke
  strokeColor?: Color3;
  strokeThickness?: number;
  strokeTransparency?: number;
  strokeApplyMode?: "Contextual" | "Border" | "Inner" | "Outline";
  strokeLineJoinMode?: "Round" | "Bevel" | "Miter";
  strokeEnabled?: boolean;

  // SOP-3I-01 扩展：UIScale
  scale?: number;

  // SOP-3I-01 扩展：UIAspectRatioConstraint
  aspectRatio?: number;
  aspectType?: "FitWithinMaxSize" | "ScaleWithParentSize";
  dominantAxis?: "Width" | "Height";

  // SOP-3I-01 扩展：UISizeConstraint
  minSize?: Vector2;
  maxSize?: Vector2;

  // SOP-3I-01 扩展：UITextSizeConstraint
  minTextSize?: number;
  maxTextSize?: number;

  // SOP-3I-01 扩展：UIDragDetector
  dragStyle?: "TranslateLine" | "TranslateView" | "TranslatePlane" | "Rotate" | "Scriptable";
  responseStyle?: "Linear" | "Constant" | "Acceleration";
  minDragDistance?: number;
  maxDragDistance?: number;
  dragEnabled?: boolean;
  onDragStart?: EventBinding;
  onDragMove?: EventBinding;
  onDragEnd?: EventBinding;

  // SOP-3I-01 扩展：VideoFrame
  video?: string;
  playing?: boolean;
  looped?: boolean;
  volume?: number;
  playbackSpeed?: number;

  // SOP-3I-01 扩展：ViewportFrame
  ambient?: Color3;
  lightColor?: Color3;
  lightDirection?: Vector3;

  // SOP-3I-01 扩展：CanvasGroup
  groupColor3?: Color3;
  groupTransparency?: number;

  // SOP-3I-01 扩展：BillboardGui / SurfaceGui / Selection*（世界空间）
  adornee?: string;
  studsOffset?: Vector3;
  alwaysOnTop?: boolean;
  lightInfluence?: number;
  maxDistance?: number;
  brightness?: number;
  resetOnSpawn?: boolean;
  zIndexBehavior?: "Sibling" | "Global";
  face?: "Front" | "Back" | "Left" | "Right" | "Top" | "Bottom";
  sizingMode?: "PixelsPerStud" | "FixedSize";
  pixelsPerStud?: number;
  canvasSize?: Vector2;
  lineThickness?: number;
  surfaceColor3?: Color3;
  surfaceTransparency?: number;

  // SOP-3I-01 扩展：UIGradientEnhanced
  colorSequence?: ColorSequence;
  transparencySequence?: NumberSequence;
  gradientOffset?: Vector2;
  gradientEnabled?: boolean;

  // SOP-3I-01 扩展：UIFlexLayout
  flexDirection?: "Row" | "Column" | "RowReverse" | "ColumnReverse";
  flexWrap?: "NoWrap" | "Wrap" | "WrapReverse";
  justifyContent?: "FlexStart" | "FlexEnd" | "Center" | "SpaceBetween" | "SpaceAround" | "SpaceEvenly";
  alignItems?: "FlexStart" | "FlexEnd" | "Center" | "Stretch" | "Baseline";
  gap?: number;
  enabled?: boolean;

  // SOP-3I-07 扩展：交互复合组件（10）— 字段映射源 editor-component-extensions.md §3.2–3.11
  // 通用（多个复合组件复用：边框/圆角/动画时长）
  borderSizePixel?: number;
  borderColor3?: Color3;
  tweenTime?: number;
  easingStyle?: string;
  easingDirection?: "In" | "Out" | "InOut";
  // DraggablePanel
  dragHandleHeight?: number;
  constrainToScreen?: boolean;
  snapToEdges?: boolean;
  snapThreshold?: number;
  showDragHandle?: boolean;
  dragHandleColor?: Color3;
  dragHandleTitle?: string;
  titleTextColor?: Color3;
  titleTextSize?: number;
  showCloseButton?: boolean;
  closeButtonColor?: Color3;
  onClose?: EventBinding;
  // AnimatedButton
  hoverColor3?: Color3;
  pressedColor3?: Color3;
  hoverTweenTime?: number;
  pressTweenTime?: number;
  hoverScale?: number;
  pressScale?: number;
  onClickBinding?: EventBinding;
  onHover?: EventBinding;
  onLeave?: EventBinding;
  // TypewriterText
  fullText?: string;
  typeSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  cursorBlinkRate?: number;
  cursorChar?: string;
  cursorColor?: Color3;
  loop?: boolean;
  loopDelay?: number;
  deleteBeforeLoop?: boolean;
  deleteSpeed?: number;
  richText?: boolean;
  // CountdownTimer
  duration?: number;
  timerFormat?: "MM:SS" | "SS.mm" | "HH:MM:SS" | "Custom";
  customFormat?: string;
  autoStart?: boolean;
  countDirection?: "Down" | "Up";
  flashOnComplete?: boolean;
  flashColor?: Color3;
  flashDuration?: number;
  onComplete?: EventBinding;
  // ModalDialog
  overlayColor?: Color3;
  overlayTransparency?: number;
  titleHeight?: number;
  titleText?: string;
  titleColor?: Color3;
  showTitleBar?: boolean;
  closeButtonSize?: number;
  showAnimation?: boolean;
  closeOnOverlayClick?: boolean;
  onOpen?: EventBinding;
  // TabContainer
  tabBarHeight?: number;
  tabBarColor?: Color3;
  tabTextSize?: number;
  tabTextColor?: Color3;
  activeTabColor?: Color3;
  activeTabTextColor?: Color3;
  tabPadding?: number;
  tabCornerRadius?: number;
  contentBackgroundColor?: Color3;
  contentTransparency?: number;
  contentCornerRadius?: number;
  tabs?: TabDefinition[];
  defaultTabIndex?: number;
  tabSwitchAnimation?: boolean;
  animationTime?: number;
  // DropdownMenu
  options?: string[];
  dropdownPlaceholder?: string;
  defaultIndex?: number;
  dropdownBackgroundColor?: Color3;
  optionHeight?: number;
  optionTextColor?: Color3;
  hoverColor?: Color3;
  hoverTextColor?: Color3;
  dropdownMaxHeight?: number;
  arrowColor?: Color3;
  openTweenTime?: number;
  closeTweenTime?: number;
  onSelectionChanged?: EventBinding;
  // SliderBar
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  step?: number;
  orientation?: "Horizontal" | "Vertical";
  trackColor?: Color3;
  trackThickness?: number;
  trackCornerRadius?: number;
  fillColor?: Color3;
  showFill?: boolean;
  handleSize?: number;
  handleColor?: Color3;
  handleBorderColor?: Color3;
  handleBorderThickness?: number;
  handleCornerRadius?: number;
  showValue?: boolean;
  valueTextColor?: Color3;
  valueTextSize?: number;
  valueFormat?: string;
  onValueChanged?: EventBinding;
  // NotificationToast
  toastTitleColor?: Color3;
  messageColor?: Color3;
  messageTextSize?: number;
  showIcon?: boolean;
  iconAssetId?: string;
  iconSize?: number;
  iconColor?: Color3;
  showProgressBar?: boolean;
  progressBarColor?: Color3;
  progressBarHeight?: number;
  dismissible?: boolean;
  slideDirection?: "Left" | "Right" | "Top" | "Bottom";
  slideTweenTime?: number;
  fadeOutTime?: number;
  // TweenedFrame
  presetAnimation?: "FadeIn" | "SlideUp" | "SlideDown" | "SlideLeft" | "SlideRight" | "ScaleUp" | "ScaleDown" | "BounceIn" | "Custom";
  delayTime?: number;
  repeatCount?: number;
  reverses?: boolean;
  trigger?: "OnCreated" | "OnActivated" | "OnHover" | "Manual";
  targetSize?: UDim2;
  targetPosition?: UDim2;
  targetTransparency?: number;
  targetColor?: Color3;
  loopAnimation?: boolean;
}

/** SOP-3I-07: TabContainer 标签定义 */
export interface TabDefinition {
  label: string;
  icon?: string;
  contentColor?: Color3;
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

/** SOP-3I-01: 约束类组件（5） */
export const CONSTRAINTS_COMPONENTS: readonly ComponentItem[] = [
  { type: "UIStroke", icon: "Square", title: "UIStroke", description: "Border stroke" },
  { type: "UIScale", icon: "Maximize2", title: "UIScale", description: "Scale multiplier" },
  { type: "UIAspectRatioConstraint", icon: "RectangleHorizontal", title: "UIAspectRatioConstraint", description: "Lock aspect ratio" },
  { type: "UISizeConstraint", icon: "Scaling", title: "UISizeConstraint", description: "Min/max size" },
  { type: "UITextSizeConstraint", icon: "Type", title: "UITextSizeConstraint", description: "Min/max text size" },
] as const;

/** SOP-3I-01: 交互类组件（1） */
export const INTERACTIVE_COMPONENTS: readonly ComponentItem[] = [
  { type: "UIDragDetector", icon: "Hand", title: "UIDragDetector", description: "Drag interaction" },
] as const;

/** SOP-3I-01: 媒体/3D 类组件（3） */
export const MEDIA_3D_COMPONENTS: readonly ComponentItem[] = [
  { type: "VideoFrame", icon: "Video", title: "VideoFrame", description: "Video playback" },
  { type: "ViewportFrame", icon: "Box", title: "ViewportFrame", description: "3D viewport" },
  { type: "CanvasGroup", icon: "Layers", title: "CanvasGroup", description: "Grouped tint/alpha" },
] as const;

/** SOP-3I-01: 世界空间类组件（4） */
export const WORLD_COMPONENTS: readonly ComponentItem[] = [
  { type: "BillboardGui", icon: "MapPin", title: "BillboardGui", description: "World-space billboard" },
  { type: "SurfaceGui", icon: "RectangleHorizontal", title: "SurfaceGui", description: "Part-surface GUI" },
  { type: "SelectionBox", icon: "BoxSelect", title: "SelectionBox", description: "Selection outline" },
  { type: "SelectionSphere", icon: "Circle", title: "SelectionSphere", description: "Selection sphere" },
] as const;

/** SOP-3I-01: 增强效果类组件（2） */
export const ENHANCED_EFFECTS_COMPONENTS: readonly ComponentItem[] = [
  { type: "UIGradientEnhanced", icon: "Palette", title: "UIGradient (Enhanced)", description: "ColorSequence gradient" },
  { type: "UIFlexLayout", icon: "Rows3", title: "UIFlexLayout", description: "Flexbox polyfill" },
] as const;

/** SOP-3I-07: 交互复合组件类（10）— 多实例 + 行为脚本，画布可见可拖拽 */
export const INTERACTIVE_COMPOSITE_COMPONENTS: readonly ComponentItem[] = [
  { type: "DraggablePanel", icon: "Move", title: "Draggable Panel", description: "Draggable window panel" },
  { type: "AnimatedButton", icon: "MousePointerClick", title: "Animated Button", description: "Tween hover/press button" },
  { type: "TypewriterText", icon: "Type", title: "Typewriter Text", description: "Char-by-char typing text" },
  { type: "CountdownTimer", icon: "Timer", title: "Countdown Timer", description: "Countdown/count-up timer" },
  { type: "ModalDialog", icon: "PanelTop", title: "Modal Dialog", description: "Overlay modal with title bar" },
  { type: "TabContainer", icon: "PanelLeft", title: "Tab Container", description: "Tabbed content panels" },
  { type: "DropdownMenu", icon: "ChevronDown", title: "Dropdown Menu", description: "Expandable option selector" },
  { type: "SliderBar", icon: "SlidersHorizontal", title: "Slider Bar", description: "Draggable value slider" },
  { type: "NotificationToast", icon: "Bell", title: "Notification Toast", description: "Auto-dismiss toast popup" },
  { type: "TweenedFrame", icon: "Play", title: "Tweened Frame", description: "Auto-animating frame" },
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

/** SOP-3I-01: 约束类组件（必须 parent 到 GUI 对象，无独立 position/size） */
export function isConstraint(type: GUIElementType): boolean {
  return (
    type === "UIStroke" || type === "UIScale" || type === "UIAspectRatioConstraint" ||
    type === "UISizeConstraint" || type === "UITextSizeConstraint"
  );
}

/** SOP-3I-01: 交互类组件 */
export function isInteractive(type: GUIElementType): boolean {
  return type === "UIDragDetector";
}

/** SOP-3I-01: 媒体/3D 类组件（有 position/size，可含子元素） */
export function isMedia3D(type: GUIElementType): boolean {
  return type === "VideoFrame" || type === "ViewportFrame" || type === "CanvasGroup";
}

/** SOP-3I-01: 世界空间类组件（BillboardGui/SurfaceGui 为容器，Selection* 为 effect） */
export function isWorldSpace(type: GUIElementType): boolean {
  return (
    type === "BillboardGui" || type === "SurfaceGui" ||
    type === "SelectionBox" || type === "SelectionSphere"
  );
}

/** SOP-3I-01: 增强效果类组件（无 position/size） */
export function isEnhancedEffect(type: GUIElementType): boolean {
  return type === "UIGradientEnhanced" || type === "UIFlexLayout";
}

/** SOP-3I-01: 是否为效果/约束类（无独立 position/size，parent 到其他元素） */
export function isEffectLike(type: GUIElementType): boolean {
  return isUIEffect(type) || isConstraint(type) || isEnhancedEffect(type) ||
    isInteractive(type) ||
    type === "SelectionBox" || type === "SelectionSphere";
}

/** SOP-3I-01: 是否为可视化容器（有 position/size 且可拖拽缩放，含新媒体/3D/世界空间容器） */
export function isVisualContainer(type: GUIElementType): boolean {
  return isVisualElement(type) || isMedia3D(type) || isInteractiveComposite(type) ||
    type === "BillboardGui" || type === "SurfaceGui";
}

/** SOP-3I-07: 交互复合组件类（10）— 有 position/size，画布可见，生成多实例 + 行为脚本 */
export function isInteractiveComposite(type: GUIElementType): boolean {
  return (
    type === "DraggablePanel" || type === "AnimatedButton" || type === "TypewriterText" ||
    type === "CountdownTimer" || type === "ModalDialog" || type === "TabContainer" ||
    type === "DropdownMenu" || type === "SliderBar" || type === "NotificationToast" ||
    type === "TweenedFrame"
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
    // SOP-3I-01 扩展：约束类（5）
    UIStroke: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, strokeColor: { r: 0, g: 0, b: 0 }, strokeThickness: 1, strokeTransparency: 0, strokeApplyMode: "Contextual", strokeLineJoinMode: "Round", strokeEnabled: true },
    UIScale: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, scale: 1 },
    UIAspectRatioConstraint: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, aspectRatio: 1, aspectType: "FitWithinMaxSize", dominantAxis: "Width" },
    UISizeConstraint: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, minSize: { x: 0, y: 0 }, maxSize: { x: Infinity, y: Infinity } },
    UITextSizeConstraint: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, minTextSize: 1, maxTextSize: 100 },
    // SOP-3I-01 扩展：交互类（1）
    UIDragDetector: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, dragStyle: "TranslatePlane", responseStyle: "Linear", minDragDistance: 0, maxDragDistance: 0, dragEnabled: true, onDragStart: { script: "", params: ["inputPosition"] }, onDragMove: { script: "", params: ["inputPosition", "delta"] }, onDragEnd: { script: "", params: ["inputPosition"] } },
    // SOP-3I-01 扩展：媒体/3D 类（3）
    VideoFrame: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.2, offsetY: 0 }, backgroundColor3: { r: 0.05, g: 0.05, b: 0.08 }, cornerRadius: 8, video: "", playing: false, looped: true, volume: 1, playbackSpeed: 1 },
    ViewportFrame: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.3, offsetY: 0 }, backgroundColor3: { r: 0.12, g: 0.11, b: 0.27 }, cornerRadius: 8, ambient: { r: 0.4, g: 0.4, b: 0.4 }, lightColor: { r: 1, g: 1, b: 1 }, lightDirection: { x: -1, y: -1, z: -1 } },
    CanvasGroup: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.3, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 8, groupColor3: { r: 1, g: 1, b: 1 }, groupTransparency: 0 },
    // SOP-3I-01 扩展：世界空间类（4）
    BillboardGui: { ...base, size: { scaleX: 0, offsetX: 200, scaleY: 0, offsetY: 100 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, backgroundTransparency: 0.1, cornerRadius: 8, adornee: "", studsOffset: { x: 0, y: 0, z: 2 }, alwaysOnTop: false, lightInfluence: 1, maxDistance: 1000, brightness: 1, resetOnSpawn: false, zIndexBehavior: "Sibling" },
    SurfaceGui: { ...base, size: { scaleX: 0, offsetX: 800, scaleY: 0, offsetY: 600 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, backgroundTransparency: 0.1, cornerRadius: 0, adornee: "", face: "Front", sizingMode: "PixelsPerStud", pixelsPerStud: 50, canvasSize: { x: 800, y: 600 } },
    SelectionBox: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, adornee: "", strokeColor: { r: 0.05, g: 0.58, b: 1 }, strokeTransparency: 0, lineThickness: 0.03, surfaceColor3: { r: 0.05, g: 0.58, b: 1 }, surfaceTransparency: 0.9 },
    SelectionSphere: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, adornee: "", strokeColor: { r: 0.05, g: 0.58, b: 1 }, surfaceColor3: { r: 0.05, g: 0.58, b: 1 }, surfaceTransparency: 0.9 },
    // SOP-3I-01 扩展：增强效果类（2）
    UIGradientEnhanced: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, colorSequence: { keypoints: [{ time: 0, color: { r: 1, g: 0, b: 0 } }, { time: 0.5, color: { r: 0, g: 1, b: 0 } }, { time: 1, color: { r: 0, g: 0, b: 1 } }] }, transparencySequence: { keypoints: [{ time: 0, value: 0 }, { time: 1, value: 0 }] }, gradientRotation: 0, gradientOffset: { x: 0, y: 0 }, gradientEnabled: true },
    UIFlexLayout: { ...base, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, flexDirection: "Row", flexWrap: "NoWrap", justifyContent: "FlexStart", alignItems: "Stretch", gap: 0, enabled: true },
    // SOP-3I-07 扩展：交互复合组件（10）— 默认值映射源 editor-component-extensions.md §3.2–3.11
    DraggablePanel: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.3, offsetY: 0 }, backgroundColor3: { r: 0.16, g: 0.16, b: 0.2 }, cornerRadius: 6, borderSizePixel: 1, borderColor3: { r: 0.3, g: 0.3, b: 0.35 }, dragHandleHeight: 28, constrainToScreen: false, snapToEdges: false, snapThreshold: 20, showDragHandle: true, dragHandleColor: { r: 0.25, g: 0.25, b: 0.3 }, dragHandleTitle: "Draggable Panel", titleTextColor: { r: 1, g: 1, b: 1 }, titleTextSize: 14, showCloseButton: true, closeButtonColor: { r: 0.85, g: 0.2, b: 0.2 }, onClose: { script: "", params: [] } },
    AnimatedButton: { ...base, size: { scaleX: 0.2, offsetX: 0, scaleY: 0.07, offsetY: 0 }, backgroundColor3: { r: 0.429, g: 0.365, b: 0.984 }, cornerRadius: 8, text: "Animated Button", font: "GothamBold", textSize: 18, hoverColor3: { r: 0.545, g: 0.36, b: 0.964 }, pressedColor3: { r: 0.35, g: 0.28, b: 0.85 }, hoverTweenTime: 0.15, pressTweenTime: 0.1, easingStyle: "Quad", easingDirection: "Out", hoverScale: 1.05, pressScale: 0.95, onClickBinding: { script: "print('Button clicked!')", params: [] }, onHover: { script: "", params: [] }, onLeave: { script: "", params: [] } },
    TypewriterText: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.08, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, backgroundTransparency: 0.5, cornerRadius: 4, text: "", fullText: "Type this text...", font: "Gotham", textSize: 18, textColor3: { r: 1, g: 1, b: 1 }, typeSpeed: 30, startDelay: 0.5, showCursor: true, cursorBlinkRate: 2, cursorChar: "|", cursorColor: { r: 1, g: 1, b: 1 }, loop: false, loopDelay: 1, deleteBeforeLoop: false, deleteSpeed: 0.03, richText: false },
    CountdownTimer: { ...base, size: { scaleX: 0.15, offsetX: 0, scaleY: 0.06, offsetY: 0 }, backgroundColor3: { r: 0.133, g: 0.133, b: 0.141 }, cornerRadius: 6, text: "00:00", font: "GothamBold", textSize: 24, textColor3: { r: 1, g: 1, b: 1 }, duration: 60, timerFormat: "MM:SS", customFormat: "", autoStart: true, countDirection: "Down", flashOnComplete: false, flashColor: { r: 1, g: 0.2, b: 0.2 }, flashDuration: 0.5, onComplete: { script: "", params: [] }, loop: false },
    ModalDialog: { ...base, size: { scaleX: 0.4, offsetX: 0, scaleY: 0.4, offsetY: 0 }, anchorPoint: { x: 0.5, y: 0.5 }, backgroundColor3: { r: 0.16, g: 0.16, b: 0.2 }, cornerRadius: 10, overlayColor: { r: 0, g: 0, b: 0 }, overlayTransparency: 0.5, titleHeight: 36, titleText: "Modal Dialog", titleColor: { r: 0.25, g: 0.25, b: 0.3 }, titleTextColor: { r: 1, g: 1, b: 1 }, titleTextSize: 16, showTitleBar: true, showCloseButton: true, closeButtonSize: 20, closeButtonColor: { r: 0.85, g: 0.2, b: 0.2 }, showAnimation: true, tweenTime: 0.3, closeOnOverlayClick: true, onOpen: { script: "", params: [] }, onClose: { script: "", params: [] } },
    TabContainer: { ...base, size: { scaleX: 0.4, offsetX: 0, scaleY: 0.4, offsetY: 0 }, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, tabBarHeight: 36, tabBarColor: { r: 0.2, g: 0.2, b: 0.25 }, tabTextSize: 14, tabTextColor: { r: 0.7, g: 0.7, b: 0.75 }, activeTabColor: { r: 0.429, g: 0.365, b: 0.984 }, activeTabTextColor: { r: 1, g: 1, b: 1 }, tabPadding: 8, tabCornerRadius: 6, contentBackgroundColor: { r: 0.13, g: 0.13, b: 0.16 }, contentTransparency: 0, contentCornerRadius: 0, tabs: [{ label: "Tab 1" }, { label: "Tab 2" }, { label: "Tab 3" }], defaultTabIndex: 0, tabSwitchAnimation: false, animationTime: 0.2 },
    DropdownMenu: { ...base, size: { scaleX: 0.2, offsetX: 0, scaleY: 0.06, offsetY: 0 }, backgroundColor3: { r: 0.16, g: 0.16, b: 0.2 }, cornerRadius: 6, text: "Select...", font: "Gotham", textSize: 14, textColor3: { r: 1, g: 1, b: 1 }, borderSizePixel: 1, borderColor3: { r: 0.3, g: 0.3, b: 0.35 }, options: ["Option 1", "Option 2", "Option 3"], dropdownPlaceholder: "Select...", defaultIndex: -1, dropdownBackgroundColor: { r: 0.18, g: 0.18, b: 0.22 }, optionHeight: 30, optionTextColor: { r: 0.9, g: 0.9, b: 0.9 }, hoverColor: { r: 0.429, g: 0.365, b: 0.984 }, hoverTextColor: { r: 1, g: 1, b: 1 }, dropdownMaxHeight: 150, arrowColor: { r: 0.7, g: 0.7, b: 0.75 }, openTweenTime: 0.2, closeTweenTime: 0.15, onSelectionChanged: { script: 'print("Selected: {selected}")', params: ["selected"] } },
    SliderBar: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.05, offsetY: 0 }, backgroundColor3: { r: 0, g: 0, b: 0 }, backgroundTransparency: 1, minValue: 0, maxValue: 100, defaultValue: 50, step: 1, orientation: "Horizontal", trackColor: { r: 0.25, g: 0.25, b: 0.3 }, trackThickness: 6, trackCornerRadius: 3, fillColor: { r: 0.429, g: 0.365, b: 0.984 }, showFill: true, handleSize: 16, handleColor: { r: 1, g: 1, b: 1 }, handleBorderColor: { r: 0.429, g: 0.365, b: 0.984 }, handleBorderThickness: 2, handleCornerRadius: 8, showValue: true, valueTextColor: { r: 0.9, g: 0.9, b: 0.9 }, valueTextSize: 12, valueFormat: "%d", onValueChanged: { script: "", params: ["value"] } },
    NotificationToast: { ...base, size: { scaleX: 0, offsetX: 280, scaleY: 0, offsetY: 80 }, backgroundColor3: { r: 0.16, g: 0.16, b: 0.2 }, cornerRadius: 8, borderSizePixel: 0, text: "", titleColor: { r: 1, g: 1, b: 1 }, toastTitleColor: { r: 1, g: 1, b: 1 }, messageColor: { r: 0.8, g: 0.8, b: 0.85 }, titleTextSize: 16, messageTextSize: 13, font: "Gotham", showIcon: true, iconAssetId: "", iconSize: 24, iconColor: { r: 0.429, g: 0.365, b: 0.984 }, showProgressBar: true, progressBarColor: { r: 0.429, g: 0.365, b: 0.984 }, progressBarHeight: 3, duration: 4, dismissible: true, slideDirection: "Right", slideTweenTime: 0.3, fadeOutTime: 0.3 },
    TweenedFrame: { ...base, size: { scaleX: 0.3, offsetX: 0, scaleY: 0.2, offsetY: 0 }, backgroundColor3: { r: 0.429, g: 0.365, b: 0.984 }, backgroundTransparency: 0, cornerRadius: 8, presetAnimation: "FadeIn", tweenTime: 0.5, easingStyle: "Quad", easingDirection: "Out", delayTime: 0, repeatCount: 0, reverses: false, trigger: "OnCreated", targetSize: undefined, targetPosition: undefined, targetTransparency: undefined, targetColor: undefined, loopAnimation: false, loopDelay: 0 },
  };

  return defaults[type] ?? defaults.Frame;
}

// ==================== SOP-3J-01: 内容数据类型（Phase 4 内容填充前置） ====================

/** 可复用富文本段落（数据层保持纯字符串，渲染层按需解析 Markdown 子集） */
export type RichText = string;

/** 内容图片 */
export interface ContentImage {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
}

/** FAQ 单项 */
export interface FAQItem {
  question: string;
  answer: string;
}

/** CTA 配置（6 变体：primary/secondary/editor/template/waitlist/next） */
export interface CTAConfig {
  variant: "primary" | "secondary" | "editor" | "template" | "waitlist" | "next";
  href: string;
  label: string;
  /** 跳转时携带的查询参数，仅在 variant 为 editor/template/waitlist 时使用 */
  query?: Record<string, string>;
}

/** 内链配置 */
export interface InternalLinkConfig {
  href: string;
  /** 未指定时从 ANCHOR_TEXTS 字典查找 */
  anchorText?: string;
  /** 鼠标悬停提示 */
  title?: string;
}

/** 对比特性行 */
export interface CompareFeature {
  name: string;
  /** 我方产品值，必填 */
  ours: string | boolean;
  /** 竞品值，缺失表示不适用 */
  competitor?: string | boolean;
  /** 是否高亮为关键差异 */
  highlight?: boolean;
}

/** 对比产品配置 */
export interface CompareProduct {
  id: string;
  name: string;
  url?: string;
  /** 是否为我方产品；一组对比中仅允许一个 true */
  isOurs?: boolean;
  logo?: string;
}

/** 纯文本段落 */
export interface ContentText {
  type: "text";
  body: RichText;
}

/** 标题分节 */
export interface ContentHeading {
  type: "heading";
  level: 2 | 3 | 4;
  text: string;
  id?: string;
}

/** 代码块 */
export interface ContentCode {
  type: "code";
  language: "lua" | "luau" | "bash" | "json" | "plaintext";
  code: string;
  filename?: string;
  showLineNumbers?: boolean;
  cta?: { variant: CTAConfig["variant"]; href: string; label: string };
}

/** 列表 */
export interface ContentList {
  type: "list";
  items: string[];
  ordered?: boolean;
}

/** 表格 */
export interface ContentTable {
  type: "table";
  headers: string[];
  rows: string[][];
}

/** 图片区块 */
export interface ContentImageBlock {
  type: "image";
  image: ContentImage;
}

/** 提示框 */
export interface ContentCallout {
  type: "callout";
  style: "tip" | "warning" | "info";
  title?: string;
  text: string;
}

/** FAQ 区块 */
export interface ContentFAQBlock {
  type: "faq";
  items: FAQItem[];
  /** 是否同时注入 FAQPage JSON-LD */
  injectSchema?: boolean;
}

/** CTA 区块 */
export interface ContentCTABlock {
  type: "cta";
  title?: string;
  description?: string;
  buttons: CTAConfig[];
}

/** 对比表格区块 */
export interface ContentCompareBlock {
  type: "compare";
  title: string;
  products: CompareProduct[];
  features: CompareFeature[];
  footnote?: string;
}

/** 内链区块 */
export interface ContentLinksBlock {
  type: "links";
  links: InternalLinkConfig[];
}

/** 图片画廊 */
export interface ContentGalleryBlock {
  type: "gallery";
  images: ContentImage[];
}

/** 内容 Section 联合类型（SOP-3J-01，不含 template_preview） */
export type ContentSection =
  | ContentText
  | ContentHeading
  | ContentCode
  | ContentList
  | ContentTable
  | ContentImageBlock
  | ContentCallout
  | ContentFAQBlock
  | ContentCTABlock
  | ContentCompareBlock
  | ContentLinksBlock
  | ContentGalleryBlock;

/** 博客文章数据类型（供 Phase 4 大规模博客内容使用） */
export interface BlogPost {
  slug: string;
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  publishedAt: string;
  modifiedAt: string;
  authorName: string;
  imageUrl: string;
  sections: ContentSection[];
}

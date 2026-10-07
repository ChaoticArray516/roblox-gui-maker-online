"use client";

/**
 * SOP-3I-11: TemplateLivePreview — 模板实时 div 模拟预览
 *
 * 非 iframe：用嵌套 div + CSS transform: scale 模拟 Roblox GUI 画布。
 * 支持 5 种设备预设、25%–150% 缩放、交互日志。
 * 复用 editor-utils 的 color3ToCss / udim2ToPixels。
 */

import { useState, useCallback, useEffect, useRef, memo } from "react";
import { Monitor, Laptop, Tablet, Smartphone } from "lucide-react";
import { color3ToCss, udim2ToPixels } from "@/lib/editor-utils";
import type { Color3, UDim2 } from "@/lib/types";

export interface PreviewNode {
  id: string;
  type: string;
  name: string;
  properties: Record<string, unknown>;
  children: PreviewNode[];
}

export interface InteractiveElement {
  nodeId: string;
  onClick?: () => void;
  hoverEffect?: "scale" | "brightness" | "colorShift";
  tooltip?: string;
}

export interface DevicePreset {
  name: string;
  width: number;
  height: number;
  label: string;
  icon: React.ReactNode;
}

const DEFAULT_DEVICES: DevicePreset[] = [
  { name: "desktop", width: 1920, height: 1080, label: "Desktop (FHD)", icon: <Monitor className="size-3.5" /> },
  { name: "laptop", width: 1366, height: 768, label: "Laptop", icon: <Laptop className="size-3.5" /> },
  { name: "tablet", width: 1024, height: 768, label: "Tablet", icon: <Tablet className="size-3.5" /> },
  { name: "mobile", width: 390, height: 844, label: "Mobile (iPhone)", icon: <Smartphone className="size-3.5" /> },
  { name: "mobile-small", width: 360, height: 640, label: "Mobile (Small)", icon: <Smartphone className="size-3.5" /> },
];

interface PreviewFrame {
  position: { x: number; y: number };
  size: { width: number; height: number };
  backgroundColor: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  transparency: number;
  zIndex: number;
  children: PreviewFrame[];
  nodeId: string;
  name: string;
  type: string;
  text?: string;
  textColor?: string;
  textSize?: number;
  fontFamily?: string;
  image?: string;
  isInteractive?: boolean;
  hoverEffect?: string;
  tooltip?: string;
}

function getUDim2Prop(value: unknown): UDim2 {
  const v = value as Record<string, number> | undefined;
  return {
    scaleX: v?.scaleX ?? 0,
    offsetX: v?.offsetX ?? 0,
    scaleY: v?.scaleY ?? 0,
    offsetY: v?.offsetY ?? 0,
  };
}

function getColor3Prop(value: unknown): Color3 {
  const v = value as Record<string, number> | undefined;
  return {
    r: v?.r ?? 1,
    g: v?.g ?? 1,
    b: v?.b ?? 1,
  };
}

function buildPreviewFrames(
  nodes: PreviewNode[],
  parentWidth: number,
  parentHeight: number,
  interactiveElements: InteractiveElement[] = [],
  depth = 0,
): PreviewFrame[] {
  const frames: PreviewFrame[] = [];

  for (const node of nodes) {
    const props = node.properties;
    const interactive = interactiveElements.find((ie) => ie.nodeId === node.id);

    const size = getUDim2Prop(props.Size);
    const position = getUDim2Prop(props.Position);

    const width = size.scaleX * parentWidth + size.offsetX;
    const height = size.scaleY * parentHeight + size.offsetY;
    const posPixels = udim2ToPixels(position, parentWidth, parentHeight);
    const x = posPixels.x;
    const y = posPixels.y;

    const color = getColor3Prop(props.BackgroundColor3);
    const transparency = (props.BackgroundTransparency as number) ?? 0;
    const borderSize = (props.BorderSizePixel as number) ?? 0;
    const borderColor = getColor3Prop(props.BorderColor3);
    const cornerRadius = (props.CornerRadius as number) ?? 0;
    const anchorPoint = (props.AnchorPoint as { x: number; y: number }) || { x: 0, y: 0 };

    const frame: PreviewFrame = {
      position: {
        x: x - width * anchorPoint.x,
        y: y - height * anchorPoint.y,
      },
      size: { width, height },
      backgroundColor: color3ToCss(color, transparency),
      borderRadius: cornerRadius,
      borderWidth: borderSize,
      borderColor: color3ToCss(borderColor),
      transparency,
      zIndex: (props.ZIndex as number) ?? depth,
      children: [],
      nodeId: node.id,
      name: node.name,
      type: node.type,
      text: props.Text as string,
      textColor: color3ToCss(getColor3Prop(props.TextColor3), 0),
      textSize: (props.TextSize as number) ?? 14,
      fontFamily: (props.Font as string) ?? "SourceSans",
      isInteractive: !!interactive,
      hoverEffect: interactive?.hoverEffect,
      tooltip: interactive?.tooltip,
    };

    if (node.children.length > 0) {
      frame.children = buildPreviewFrames(node.children, width, height, interactiveElements, depth + 1);
    }

    frames.push(frame);
  }

  return frames;
}

const PreviewFrameRenderer = memo(function PreviewFrameRenderer({
  frame,
  onInteract,
}: {
  frame: PreviewFrame;
  onInteract?: (nodeId: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleClick = useCallback(() => {
    if (frame.isInteractive && onInteract) {
      onInteract(frame.nodeId);
    }
  }, [frame.isInteractive, frame.nodeId, onInteract]);

  const hoverTransform = isHovered
    ? frame.hoverEffect === "scale"
      ? "scale(1.02)"
      : frame.hoverEffect === "brightness"
        ? "brightness(1.1)"
        : "none"
    : "none";

  const hoverBackground =
    isHovered && frame.hoverEffect === "colorShift"
      ? "rgba(59, 130, 246, 0.15)"
      : frame.backgroundColor;

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      className="absolute box-border flex flex-col items-center justify-center overflow-hidden"
      style={{
        left: frame.position.x,
        top: frame.position.y,
        width: frame.size.width,
        height: frame.size.height,
        backgroundColor: hoverBackground,
        borderRadius: frame.borderRadius,
        border: `${frame.borderWidth}px solid ${frame.borderColor}`,
        zIndex: frame.zIndex,
        cursor: frame.isInteractive ? "pointer" : "default",
        transform: isPressed ? "scale(0.98)" : hoverTransform,
        transition: "transform 0.15s, background-color 0.15s, filter 0.15s",
      }}
      title={frame.isInteractive ? frame.tooltip || "Click to interact" : `${frame.name} (${frame.type})`}
    >
      {frame.text && (
        <span
          className="pointer-events-none select-none text-center"
          style={{
            color: frame.textColor,
            fontSize: frame.textSize,
            fontFamily: (frame.fontFamily || "SourceSans").replace("SourceSans", "Arial, sans-serif"),
            fontWeight: frame.type.includes("Button") ? 600 : 400,
          }}
        >
          {frame.text}
        </span>
      )}
      {!frame.text && (
        <span
          className="pointer-events-none select-none font-mono"
          style={{
            fontSize: Math.max(9, Math.min(12, frame.size.height * 0.15)),
            color: frame.transparency > 0.5 ? "#94a3b8" : "rgba(0,0,0,0.4)",
          }}
        >
          {frame.type}
        </span>
      )}
      {frame.isInteractive && (
        <div
          className="absolute right-1 top-1 size-1.5 rounded-full transition-colors"
          style={{ backgroundColor: isHovered ? "#22c55e" : "#3b82f6" }}
        />
      )}
      {frame.children.map((child) => (
        <PreviewFrameRenderer key={child.nodeId} frame={child} onInteract={onInteract} />
      ))}
    </div>
  );
});

export interface TemplateLivePreviewProps {
  templateName: string;
  description?: string;
  uiTree: PreviewNode[];
  interactiveElements?: InteractiveElement[];
  supportedDevices?: DevicePreset[];
}

export const TemplateLivePreview = memo(function TemplateLivePreview({
  templateName,
  description,
  uiTree,
  interactiveElements = [],
  supportedDevices = DEFAULT_DEVICES,
}: TemplateLivePreviewProps) {
  const [activeDevice, setActiveDevice] = useState<DevicePreset>(supportedDevices[0]);
  const [zoom, setZoom] = useState(1);
  const [interactionLog, setInteractionLog] = useState<string[]>([]);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  const handleInteract = useCallback(
    (nodeId: string) => {
      const element = interactiveElements.find((ie) => ie.nodeId === nodeId);
      if (element?.onClick) {
        element.onClick();
      }
      setInteractionLog((prev) => [
        ...prev.slice(-9),
        `Clicked: ${nodeId} at ${new Date().toLocaleTimeString()}`,
      ]);
    },
    [interactiveElements],
  );

  const computeScale = useCallback(() => {
    if (!previewContainerRef.current) return 1;
    const container = previewContainerRef.current.parentElement;
    if (!container) return 1;
    const padding = 48;
    const maxW = container.clientWidth - padding;
    const maxH = container.clientHeight - padding;
    const scaleX = maxW / activeDevice.width;
    const scaleY = maxH / activeDevice.height;
    return Math.min(scaleX, scaleY, 1);
  }, [activeDevice]);

  useEffect(() => {
    setZoom(computeScale());
    const handleResize = () => setZoom(computeScale());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [computeScale]);

  const frames = buildPreviewFrames(uiTree, activeDevice.width, activeDevice.height, interactiveElements);

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-[#1e293b] bg-[#020617]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1e293b] bg-[#0f172a] px-4 py-3">
        <div className="flex items-center gap-3">
          <h3 className="text-sm font-semibold text-[#f1f5f9]">{templateName}</h3>
          <span className="rounded bg-[#1e293b] px-2 py-0.5 text-[10px] text-[#94a3b8]">
            {activeDevice.width}×{activeDevice.height}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            {supportedDevices.map((device) => (
              <button
                key={device.name}
                type="button"
                title={device.label}
                onClick={() => setActiveDevice(device)}
                className={`flex items-center gap-1 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-colors ${
                  activeDevice.name === device.name
                    ? "border-brand-500 bg-brand-500/10 text-brand-400"
                    : "border-[#334155] text-text-muted hover:border-[#475569] hover:text-text"
                }`}
              >
                {device.icon}
                {device.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#64748b]">Zoom</span>
            <input
              type="range"
              min={25}
              max={150}
              value={Math.round(zoom * 100)}
              onChange={(e) => setZoom(parseInt(e.target.value) / 100)}
              className="h-1 w-20 cursor-pointer appearance-none rounded bg-[#334155] accent-brand-500"
            />
            <span className="min-w-[36px] text-right text-[11px] text-[#94a3b8]">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Preview canvas */}
      <div className="relative flex flex-1 items-center justify-center overflow-auto bg-[#020617] p-6">
        <div
          ref={previewContainerRef}
          className="relative shrink-0 bg-[#1e293b] shadow-[0_0_0_1px_#334155,0_8px_32px_rgba(0,0,0,0.4)]"
          style={{
            width: activeDevice.width,
            height: activeDevice.height,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <div className="absolute -top-5 left-0 font-mono text-[10px] text-[#475569]">
            {activeDevice.label}
          </div>
          {frames.map((frame) => (
            <PreviewFrameRenderer key={frame.nodeId} frame={frame} onInteract={handleInteract} />
          ))}
        </div>
      </div>

      {description && (
        <div className="border-t border-[#1e293b] bg-[#0f172a] px-4 py-2 text-xs text-text-muted">
          {description}
        </div>
      )}

      {/* Interaction log */}
      {interactionLog.length > 0 && (
        <div className="max-h-[100px] overflow-y-auto border-t border-[#1e293b] bg-[#0f172a] px-4 py-2">
          <div className="mb-1 text-[10px] font-semibold text-[#64748b]">Interaction Log</div>
          {interactionLog.map((log, i) => (
            <div key={i} className="font-mono text-[11px] text-text-muted">
              {log}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

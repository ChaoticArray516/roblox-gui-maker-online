"use client";

/**
 * SOP-3I-08: ColorSequence 编辑器 — 源 editor-component-extensions.md §4.2 (行 4543–4773)
 *
 * 渐变轨道 + 拖拽 keypoint + 选中 keypoint 颜色编辑。最小 2 keypoint。
 * 复用 editor-utils 的 color3ToHex / hexToColor3。
 */

import { memo, useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { Color3, ColorSequence, ColorSequenceKeypoint } from "@/lib/types";
import { color3ToHex, hexToColor3 } from "@/lib/editor-utils";

interface Props {
  value: ColorSequence;
  onChange: (value: ColorSequence) => void;
  disabled?: boolean;
}

/** 在时间 t 处采样插值颜色 */
function sampleColorSequence(cs: ColorSequence, t: number): Color3 {
  const kps = cs.keypoints;
  if (kps.length === 0) return { r: 1, g: 1, b: 1 };
  if (kps.length === 1 || t <= kps[0].time) return kps[0].color;
  if (t >= kps[kps.length - 1].time) return kps[kps.length - 1].color;
  for (let i = 0; i < kps.length - 1; i++) {
    if (t >= kps[i].time && t <= kps[i + 1].time) {
      const range = kps[i + 1].time - kps[i].time;
      const alpha = range === 0 ? 0 : (t - kps[i].time) / range;
      return {
        r: kps[i].color.r + (kps[i + 1].color.r - kps[i].color.r) * alpha,
        g: kps[i].color.g + (kps[i + 1].color.g - kps[i].color.g) * alpha,
        b: kps[i].color.b + (kps[i + 1].color.b - kps[i].color.b) * alpha,
      };
    }
  }
  return kps[kps.length - 1].color;
}

/** 构建渐变 CSS background 字符串 */
function buildGradientCSS(cs: ColorSequence): string {
  const stops = cs.keypoints
    .map((kp) => {
      const r = Math.round(kp.color.r * 255);
      const g = Math.round(kp.color.g * 255);
      const b = Math.round(kp.color.b * 255);
      return `rgb(${r},${g},${b}) ${(kp.time * 100).toFixed(2)}%`;
    })
    .join(", ");
  return `linear-gradient(to right, ${stops})`;
}

export const ColorSequenceEditor = memo(function ColorSequenceEditor({ value, onChange, disabled = false }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleTrackClick = useCallback(
    (e: ReactMouseEvent) => {
      if (disabled || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const time = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const color = sampleColorSequence(value, time);
      const newKeypoint: ColorSequenceKeypoint = { time, color };
      const newKeypoints = [...value.keypoints, newKeypoint].sort((a, b) => a.time - b.time);
      onChange({ keypoints: newKeypoints });
      setSelectedIndex(newKeypoints.indexOf(newKeypoint));
    },
    [value, onChange, disabled],
  );

  const handleKeypointDrag = useCallback(
    (index: number, newTime: number) => {
      const clampedTime = Math.max(0, Math.min(1, newTime));
      onChange({
        keypoints: value.keypoints.map((kp, i) => (i === index ? { ...kp, time: clampedTime } : kp)),
      });
    },
    [value, onChange],
  );

  const handleColorChange = useCallback(
    (index: number, newColor: Color3) => {
      onChange({
        keypoints: value.keypoints.map((kp, i) => (i === index ? { ...kp, color: newColor } : kp)),
      });
    },
    [value, onChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      if (value.keypoints.length <= 2) return;
      onChange({ keypoints: value.keypoints.filter((_, i) => i !== index) });
      setSelectedIndex(null);
    },
    [value, onChange],
  );

  return (
    <div className="rounded-md border border-glass-border bg-surface-raised p-2">
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative mb-2 h-8 cursor-crosshair rounded"
        style={{ background: buildGradientCSS(value) }}
      >
        {value.keypoints.map((kp, i) => (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(i);
            }}
            onMouseDown={(e) => {
              if (disabled) return;
              e.stopPropagation();
              const startX = e.clientX;
              const startTime = kp.time;
              const trackWidth = trackRef.current?.offsetWidth || 1;
              const move = (me: globalThis.MouseEvent) => {
                handleKeypointDrag(i, startTime + (me.clientX - startX) / trackWidth);
              };
              const up = () => {
                window.removeEventListener("mousemove", move);
                window.removeEventListener("mouseup", up);
              };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            className="absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{
              left: `${kp.time * 100}%`,
              top: "50%",
              backgroundColor: `rgb(${Math.round(kp.color.r * 255)},${Math.round(kp.color.g * 255)},${Math.round(kp.color.b * 255)})`,
              borderColor: selectedIndex === i ? "#60a5fa" : "white",
              zIndex: selectedIndex === i ? 10 : 1,
            }}
          />
        ))}
      </div>

      {selectedIndex !== null && value.keypoints[selectedIndex] && (
        <div className="flex items-center gap-2 py-1">
          <span className="min-w-[45px] text-xs text-text-muted">
            Time: {value.keypoints[selectedIndex].time.toFixed(3)}
          </span>
          <input
            type="color"
            value={color3ToHex(value.keypoints[selectedIndex].color)}
            onChange={(e) => handleColorChange(selectedIndex, hexToColor3(e.target.value))}
            disabled={disabled}
            className="h-6 w-8 rounded border-none bg-transparent p-0"
          />
          <button
            type="button"
            onClick={() => handleRemove(selectedIndex)}
            disabled={value.keypoints.length <= 2}
            className="rounded bg-destructive px-2 py-0.5 text-xs text-white disabled:opacity-50"
          >
            Remove
          </button>
        </div>
      )}

      <div className="mt-1 text-[10px] text-text-muted">
        {value.keypoints.length} keypoints (click track to add, click handle to select)
      </div>
    </div>
  );
});

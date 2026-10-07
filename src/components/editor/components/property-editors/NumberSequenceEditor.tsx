"use client";

/**
 * SOP-3I-08: NumberSequence 编辑器 — 源 editor-component-extensions.md §4.3 (行 4775–4947)
 *
 * SVG polyline 曲线可视化 + 拖拽 keypoint + 选中 keypoint 数值编辑。
 */

import { memo, useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import type { NumberSequence, NumberSequenceKeypoint } from "@/lib/types";

interface Props {
  value: NumberSequence;
  onChange: (value: NumberSequence) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

function sampleNumberSequence(ns: NumberSequence, t: number): number {
  const kps = ns.keypoints;
  if (kps.length === 0) return 0;
  if (kps.length === 1 || t <= kps[0].time) return kps[0].value;
  if (t >= kps[kps.length - 1].time) return kps[kps.length - 1].value;
  for (let i = 0; i < kps.length - 1; i++) {
    if (t >= kps[i].time && t <= kps[i + 1].time) {
      const range = kps[i + 1].time - kps[i].time;
      const alpha = range === 0 ? 0 : (t - kps[i].time) / range;
      return kps[i].value + (kps[i + 1].value - kps[i].value) * alpha;
    }
  }
  return kps[kps.length - 1].value;
}

export const NumberSequenceEditor = memo(function NumberSequenceEditor({
  value, onChange, disabled = false, min = 0, max = 1, step = 0.01,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const range = max - min || 1;

  const handleTrackClick = useCallback(
    (e: ReactMouseEvent) => {
      if (disabled || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const time = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const interpolated = sampleNumberSequence(value, time);
      const newKeypoint: NumberSequenceKeypoint = {
        time,
        value: Math.round(interpolated / step) * step,
      };
      const newKeypoints = [...value.keypoints, newKeypoint].sort((a, b) => a.time - b.time);
      onChange({ keypoints: newKeypoints });
      setSelectedIndex(newKeypoints.indexOf(newKeypoint));
    },
    [value, onChange, disabled, step],
  );

  const handleValueChange = useCallback(
    (index: number, newValue: number) => {
      const clamped = Math.max(min, Math.min(max, newValue));
      onChange({
        keypoints: value.keypoints.map((kp, i) => (i === index ? { ...kp, value: clamped } : kp)),
      });
    },
    [value, onChange, min, max],
  );

  const polylinePoints = value.keypoints
    .map((kp) => `${kp.time},${1 - (kp.value - min) / range}`)
    .join(" ");

  return (
    <div className="rounded-md border border-glass-border bg-surface-raised p-2">
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative mb-2 h-10 cursor-crosshair rounded bg-surface"
      >
        <svg className="absolute inset-0 size-full" preserveAspectRatio="none" viewBox="0 0 1 1">
          {value.keypoints.length >= 2 && (
            <polyline
              points={polylinePoints}
              fill="none"
              stroke="#60a5fa"
              strokeWidth={0.02}
            />
          )}
        </svg>
        {value.keypoints.map((kp, i) => (
          <div
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedIndex(i);
            }}
            className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white"
            style={{
              left: `${kp.time * 100}%`,
              top: `${(1 - (kp.value - min) / range) * 100}%`,
              backgroundColor: selectedIndex === i ? "#60a5fa" : "#94a3b8",
              zIndex: 2,
            }}
          />
        ))}
      </div>

      {selectedIndex !== null && value.keypoints[selectedIndex] && (
        <div className="flex items-center gap-2 py-1">
          <span className="text-xs text-text-muted">
            Time: {value.keypoints[selectedIndex].time.toFixed(3)}
          </span>
          <input
            type="number"
            value={value.keypoints[selectedIndex].value.toFixed(3)}
            min={min}
            max={max}
            step={step}
            onChange={(e) => handleValueChange(selectedIndex, parseFloat(e.target.value))}
            disabled={disabled}
            className="w-16 rounded border border-glass-border bg-surface px-1.5 py-0.5 text-xs text-text"
          />
        </div>
      )}
    </div>
  );
});

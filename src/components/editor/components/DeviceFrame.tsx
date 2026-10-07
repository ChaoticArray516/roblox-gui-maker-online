"use client";

/**
 * SOP-3F-05: 设备预览框 — Desktop/Tablet/Mobile 尺寸缩放
 */

import { type ReactNode } from "react";
import { type DeviceType } from "@/lib/types";
import { DEVICE_CONFIGS } from "@/lib/editor-utils";

export function DeviceFrame({ deviceType, zoom, children }: { deviceType: DeviceType; zoom: number; children: ReactNode }) {
  const cfg = DEVICE_CONFIGS[deviceType];
  return (
    <div
      className="relative"
      style={{
        width: cfg.width * zoom,
        height: cfg.height * zoom,
      }}
    >
      <div
        style={{
          width: cfg.width,
          height: cfg.height,
          transform: `scale(${zoom})`,
          transformOrigin: "top left",
          position: "absolute",
          top: 0,
          left: 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}

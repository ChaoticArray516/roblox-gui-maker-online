"use client";

/**
 * SOP-3F-11: AI 面板包装
 *
 * 目前直接渲染 AIGenerator；未来可扩展为向导式多步面板。
 */

import { AIGenerator } from "./AIGenerator";

export function AIPanel() {
  return <AIGenerator />;
}

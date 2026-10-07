/**
 * SOP-3J FAQ-Engine 集成：FAQ 数据 helpers
 *
 * 来源 F:\skillhub\faq-engine SKILL.md 规范：
 * - capsule：40-60 词，首句 ≤25 词，以 Yes/No/数字/结论开头，可独立引用
 * - detail：可选，≤60 词或 ≤5 条列表
 * - cta：可选软 CTA，每条答案最多 1 个
 * - source：问题来源 URL（PAA/Reddit/竞品/截图/支持日志）
 *
 * 渲染层仍用 FAQItem（question + answer），通过 toFAQItem 合并三层为单个 answer 字符串。
 * 这样 FAQAccordion / FaqJsonLd 的 props 与 UI 行为无需改动。
 */

import type { FAQItem } from "@/lib/types";

export interface FAQEntry {
  question: string;
  category?: string;
  /** 40-60 词，首句 ≤25 词，以 Yes/No/数字/结论开头 */
  capsule: string;
  /** 可选扩展，≤60 词或 ≤5 条列表 */
  detail?: string;
  /** 可选软 CTA */
  cta?: string;
  /** 问题来源 URL 或备注（PAA/Reddit/竞品/截图/支持日志） */
  source?: string;
}

/** 将 FAQEntry 合并为 FAQItem（answer = capsule + detail + cta） */
export function toFAQItem(entry: FAQEntry): FAQItem {
  return {
    question: entry.question,
    answer: [entry.capsule, entry.detail, entry.cta]
      .filter(Boolean)
      .join(" "),
  };
}

/** 批量转换 */
export function toFAQItems(entries: FAQEntry[]): FAQItem[] {
  return entries.map(toFAQItem);
}

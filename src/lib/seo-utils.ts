/**
 * SOP-3J-07: SEO 文案工具函数
 *
 * 生成符合 Google SEO 规范的 title / meta description / alt text。
 * 品牌与域名统一从 site-config 取，禁止硬编码。
 * 不重复已有 buildOpenGraph / buildAlternates 的功能。
 */

import { SITE_NAME } from "@/lib/site-config";

const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 150;
const DESC_MAX = 160;
const ALT_MAX = 125;

function truncatePreservingKeyword(text: string, max: number): string {
  if (text.length <= max) return text;
  // 优先在句号/问号/感叹号后截断，避免截断关键词
  const breakpoints = [
    text.lastIndexOf(". ", max - 1),
    text.lastIndexOf("? ", max - 1),
    text.lastIndexOf("! ", max - 1),
    text.lastIndexOf(" ", max - 3),
  ].filter((i) => i > 0);
  const cut = breakpoints.length > 0 ? Math.max(...breakpoints) + 1 : max - 3;
  return text.slice(0, cut).trim() + "...";
}

/**
 * 生成页面 title。
 * 格式：Primary Keyword — Suffix | SITE_NAME
 * 无 suffix 时：Primary Keyword | SITE_NAME
 * 长度约束 50–60 字符。
 */
export function generateTitle(primaryKeyword: string, suffix?: string): string {
  const brand = ` | ${SITE_NAME}`;
  const body = suffix ? `${primaryKeyword} — ${suffix}` : primaryKeyword;
  const full = `${body}${brand}`;

  if (full.length <= TITLE_MAX) return full;

  // 超出时先压缩 suffix，再压缩 keyword，最后压缩 brand
  const availableForBody = TITLE_MAX - brand.length;
  if (body.length > availableForBody) {
    const shortened = truncatePreservingKeyword(body, availableForBody);
    return `${shortened}${brand}`;
  }
  return full;
}

/**
 * 生成 meta description。
 * 模板：${value}. Learn ${keyword} with step-by-step Luau code examples. ${cta}
 * 长度约束 150–160 字符。
 */
export function generateDescription(
  keyword: string,
  value: string,
  cta: string,
): string {
  const base = `${value}. Learn ${keyword} with step-by-step Luau code examples. ${cta}`;
  if (base.length <= DESC_MAX) return base;
  return truncatePreservingKeyword(base, DESC_MAX);
}

/**
 * 生成 alt text。
 * 类型：screenshot / code-preview / template / diagram / comparison
 * 约束：≤125 字符；必须含关键词；不以 "image of" / "picture of" 开头。
 */
export function generateAltText({
  type,
  subject,
  keyword,
}: {
  type: "screenshot" | "code-preview" | "template" | "diagram" | "comparison";
  subject: string;
  keyword: string;
}): string {
  let text = "";
  switch (type) {
    case "screenshot":
      text = `${SITE_NAME} screenshot showing ${subject} for ${keyword}`;
      break;
    case "code-preview":
      text = `Luau code preview for ${keyword}: ${subject}`;
      break;
    case "template":
      text = `${subject} Roblox GUI template preview with Luau code for ${keyword}`;
      break;
    case "diagram":
      text = `Diagram explaining ${subject} for ${keyword}`;
      break;
    case "comparison":
      text = `Comparison of ${subject} for ${keyword}`;
      break;
  }

  // 清理 image of / picture of 开头
  text = text.replace(/^\b(image of|picture of)\s+/i, "");

  if (text.length <= ALT_MAX) return text;
  return truncatePreservingKeyword(text, ALT_MAX);
}

/** 校验 title 是否合规（调试用） */
export function isTitleValid(title: string): boolean {
  return title.length >= TITLE_MIN && title.length <= TITLE_MAX;
}

/** 校验 description 是否合规（调试用） */
export function isDescriptionValid(description: string): boolean {
  return description.length >= DESC_MIN && description.length <= DESC_MAX;
}

/** 校验 alt text 是否合规（调试用） */
export function isAltTextValid(alt: string): boolean {
  return alt.length <= ALT_MAX && !/^\b(image of|picture of)\s+/i.test(alt);
}
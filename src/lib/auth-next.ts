/**
 * SOP-3U-04/05: 登录回跳 next 工具
 *
 * currentPathAsNext() — 登录出口侧：把当前页面路径（含查询串）编码为 next 参数，
 *   登录成功后落回原处（editor?template=x / editor?project=<uuid> 均兼容）。
 * sanitizeNext() — 登录兜底侧：收敛所有 next 消费点，堵开放重定向。
 *   纯字符串逻辑、顶层零 window 依赖，server route 与 client page 双端可 import。
 */

export function currentPathAsNext(): string {
  if (typeof window === "undefined") return "/dashboard";
  return window.location.pathname + window.location.search;
}

export function sanitizeNext(
  raw: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!raw) return fallback;
  if (raw.length > 512) return fallback;
  // 必须站内相对路径：拒绝协议相对（//）、反斜杠变体（/\）
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  // 控制字符（转义形式书写，禁止原始控制字节入源码）
  if (/[\x00-\x1f\x7f]/.test(raw)) return fallback;
  // 路径穿越防御性兜底
  if (raw.includes("\\") && raw.includes("..")) return fallback;
  return raw;
}

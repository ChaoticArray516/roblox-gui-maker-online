/**
 * SOP-3H-03: 站点 URL 工具（client-safe）
 *
 * 供 auth 重定向（OAuth redirectTo / emailRedirectTo）等场景拼接绝对地址。
 *
 * 优先级：
 * 1. NEXT_PUBLIC_SITE_URL —— 显式配置（.env.local / Vercel env）
 * 2. window.location.origin —— 浏览器运行时自适应（本地/预览/生产）
 * 3. http://localhost:3000 —— SSR 等无 window 环境的兜底
 *
 * 返回值保证带协议头、结尾带 `/`。
 */
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (typeof window !== "undefined" ? window.location.origin : undefined) ??
    "http://localhost:3000";

  // 确保带协议头
  url = url.startsWith("http") ? url : `https://${url}`;
  // 确保末尾带斜杠
  url = url.endsWith("/") ? url : `${url}/`;
  return url;
}

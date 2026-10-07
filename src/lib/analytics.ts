// GA4 事件单一出口 —— 全站埋点必须经此文件，禁止散落裸调 window.gtag
// @next/third-parties 的 gtag script 为懒加载，调用时可能尚未就绪：
// 优先 window.gtag，兜底 dataLayer.push（gtag.js 协议同构）。

type GtagParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function trackEvent(name: string, params?: GtagParams): void {
  if (typeof window === "undefined") return;
  const payload = params ?? {};
  if (typeof window.gtag === "function") {
    window.gtag("event", name, payload);
    return;
  }
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: name, ...payload });
}

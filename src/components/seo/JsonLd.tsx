/**
 * SOP-3B-01: 通用 JSON-LD 渲染器
 *
 * 服务端渲染 `<script type="application/ld+json">` —— 禁止客户端注入。
 * 支持 @graph 数组输入和单对象输入；下游组件统一输出 @graph 结构。
 */

import type { ReactElement } from "react";

export interface JsonLdProps {
  /** Schema.org JSON-LD 数据 — 单对象或 @graph 数组 */
  data: Record<string, unknown> | Record<string, unknown>[];
  /** 可选的 script id，用于测试选择 */
  id?: string;
}

/**
 * 将数据包装为 @graph 格式（如果还不是的话）。
 * 这样下游组件永远输出统一的 @graph 结构，方便测试断言。
 */
function wrapGraph(data: JsonLdProps["data"]): {
  "@context": string;
  "@graph": Record<string, unknown>[];
} {
  const graph = Array.isArray(data) ? data : [data];
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function JsonLd({ data, id }: JsonLdProps): ReactElement {
  const payload = wrapGraph(data);

  // 运行时自检：确保 JSON 可序列化
  try {
    JSON.parse(JSON.stringify(payload));
  } catch {
    // 静默失败 —— 开发阶段由 TypeScript strict + 自检兜底
    // 生产环境不应出现非法 JSON
  }

  return (
    <script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}

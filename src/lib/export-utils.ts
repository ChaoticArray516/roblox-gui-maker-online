/**
 * SOP-3F-09: 导出工具函数
 *
 * 纯客户端工具：文本/Blob 下载、剪贴板复制、ZIP 打包。
 * 所有文件操作均通过浏览器原生 API 完成，无服务端依赖。
 */

import { saveAs } from "file-saver";
import JSZip from "jszip";

export function downloadTextFile(text: string, filename: string, mimeType = "text/plain"): void {
  const blob = new Blob([text], { type: mimeType });
  downloadBlob(blob, filename);
}

export function downloadBlob(blob: Blob, filename: string): void {
  saveAs(blob, filename);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallthrough to textarea fallback
  }

  // Fallback for contexts where navigator.clipboard is unavailable
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
    return true;
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

export interface ZipFileEntry {
  name: string;
  content: string;
}

export async function downloadZIP(files: ZipFileEntry[], filename: string): Promise<void> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.content);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, filename);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

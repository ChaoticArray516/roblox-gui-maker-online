/**
 * 全站唯一域名/品牌定义点。
 * 所有 SEO 组件、metadata、JSON-LD 必须从此 import，禁止硬编码 URL。
 */

export const SITE_URL = "https://roblox-gui-maker.online" as const;
export const SITE_NAME = "Roblox GUI Maker" as const;
export const SITE_DESCRIPTION =
  "Free Roblox GUI Maker with AI code generation, drag-and-drop editor, and planned Figma-to-Studio import. Build polished UI for your Roblox game in minutes." as const;
export const SITE_DEFAULT_OG_IMAGE = `${SITE_URL}/og/default.png` as const;
export const SITE_LOCALE = "en_US" as const;

/** 全站支持邮箱(唯一来源;与 Creem 商家资料保持一致,Footer/政策页/JSON-LD 一律 import 此常量) */
export const SUPPORT_EMAIL = "archtorrent017@aliyun.com" as const;

export const ORG_NAME = SITE_NAME;
export const ORG_LOGO = `${SITE_URL}/logo.png` as const;

/** 站内主导航 — 与 INFORMATION_ARCHITECTURE.md §6 内链规范保持同步 */
export const PRIMARY_NAV = [
  { label: "Editor", href: "/editor" },
  { label: "Templates", href: "/templates" },
  { label: "Plugin", href: "/plugin" },
  { label: "Script Generator", href: "/script-generator" },
  { label: "Compare", href: "/compare/best-roblox-gui-makers" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
] as const;

export const FOOTER_NAV = [
  { label: "Templates", href: "/templates" },
  { label: "Plugin", href: "/plugin" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/faq" },
  { label: "Guides", href: "/guides" },
  { label: "Use Cases", href: "/use-cases" },
  { label: "Blog", href: "/blog" },
  { label: "Docs", href: "/docs" },
  { label: "Figma to Roblox", href: "/figma-to-roblox" },
  { label: "Script Generator", href: "/script-generator" },
  { label: "AI Generator", href: "/ai-generator" },
  { label: "Compare", href: "/compare/best-roblox-gui-makers" },
] as const;

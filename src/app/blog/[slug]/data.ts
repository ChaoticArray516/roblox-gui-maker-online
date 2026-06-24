import { SITE_URL } from "@/lib/site-config";

export const POST_SLUGS = [
  "best-roblox-ui-maker-no-coding",
  "convert-figma-to-roblox-studio-ui",
  "top-10-free-roblox-gui-templates",
] as const;
export type PostSlug = (typeof POST_SLUGS)[number];

export interface BlogPostData {
  slug: PostSlug;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  modifiedAt: string;
  authorName: string;
  imageUrl: string;
  keywords: string[];
}

export const POSTS: Record<PostSlug, BlogPostData> = {
  "best-roblox-ui-maker-no-coding": {
    slug: "best-roblox-ui-maker-no-coding",
    title: "The Best Roblox UI Maker Without Coding in 2026",
    description:
      "A comparison of visual Roblox UI builders and why controllable AI beats black-box generators for real game projects.",
    content: `Visual Roblox UI builders have come a long way. In 2026, the best tools combine a drag-and-drop canvas with AI that exports editable Luau, so you are never locked into generated code you cannot change.

Roblox GUI Maker keeps you in control: every ScreenGui, Frame, TextButton, and layout object is visible on the canvas and editable after generation. You can tweak Scale/Offset, anchor points, colors, and Z-index without touching code.

For creators who want to ship fast, this means less time in Studio and more time tuning gameplay. The free tier includes 50 AI generation credits per month and full access to the template library, making it easy to test before upgrading.`,
    publishedAt: "2026-06-20",
    modifiedAt: "2026-06-20",
    authorName: "Roblox GUI Maker Team",
    imageUrl: `${SITE_URL}/blog/best-roblox-ui-maker-no-coding.webp`,
    keywords: ["best roblox ui maker no coding 2026", "roblox gui maker", "roblox ui builder"],
  },
  "convert-figma-to-roblox-studio-ui": {
    slug: "convert-figma-to-roblox-studio-ui",
    title: "Figma to Roblox Studio UI Converter — Coming Soon",
    description:
      "A Figma-to-Roblox converter is in development. Join the waitlist to get notified when automatic component mapping, asset upload, and Studio plugin import are ready.",
    content: `Moving a Figma design into Roblox Studio usually means exporting images, copying Asset IDs, and recreating layouts by hand. A Figma-to-Roblox converter automates that busywork — and we are building one.

When it launches, you will be able to paste a public Figma file URL. The converter will read frames and components, map them to Roblox GUI objects, and upload image layers to your Roblox library. It will convert position and size values into Scale/Offset pairs that stay responsive across devices.

Once the conversion is done, the Roblox GUI Maker Studio plugin (also in development) will import the generated UI into StarterGui. You can then edit it further in Studio or in the web editor.

Join the waitlist at roblox-gui-maker.online/figma-to-roblox to be notified when the converter and plugin are ready.`,
    publishedAt: "2026-06-20",
    modifiedAt: "2026-06-20",
    authorName: "Roblox GUI Maker Team",
    imageUrl: `${SITE_URL}/blog/convert-figma-to-roblox-studio-ui.webp`,
    keywords: ["roblox figma to studio", "figma to roblox", "roblox ui import"],
  },
  "top-10-free-roblox-gui-templates": {
    slug: "top-10-free-roblox-gui-templates",
    title: "Top 10 Free Roblox GUI Templates for Your Game",
    description:
      "A curated list of free Roblox GUI templates — inventories, shops, HUDs, leaderboards, and more — with real Luau logic.",
    content: `Starting from a template saves hours. The best free Roblox GUI templates include not just visuals, but working Luau for interactions, data persistence, and layout logic.

Our favorites include an RPG inventory with drag-and-drop and DataStore persistence, a simulator HUD with click counter and rebirth badge, a global leaderboard powered by OrderedDataStore, and a settings panel with volume sliders and toggles.

Every template can be opened in the web editor, customized visually, and exported as clean Luau for your game.`,
    publishedAt: "2026-06-20",
    modifiedAt: "2026-06-20",
    authorName: "Roblox GUI Maker Team",
    imageUrl: `${SITE_URL}/blog/top-10-free-roblox-gui-templates.webp`,
    keywords: ["roblox gui templates free", "free roblox ui templates", "roblox inventory template"],
  },
};

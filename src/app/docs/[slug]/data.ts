export const DOC_SLUGS = ["quick-start", "editor-guide", "plugin-guide"] as const;
export type DocSlug = (typeof DOC_SLUGS)[number];

export interface DocData {
  slug: DocSlug;
  title: string;
  description: string;
  content: string;
}

export const DOCS: Record<DocSlug, DocData> = {
  "quick-start": {
    slug: "quick-start",
    title: "Quick Start",
    description: "Create your first Roblox GUI in under five minutes.",
    content: `Welcome to Roblox GUI Maker. This quick start walks you from a blank canvas to exported Luau.

1. Open the web editor and choose a device preset (desktop, tablet, or mobile).
2. Drag a Frame from the Components tab onto the canvas.
3. Add a TextButton and edit the text in the Properties panel.
4. Use UIListLayout or UIGridLayout to arrange children automatically.
5. Click Export to download the client .lua file or a full ZIP project.

You can also pick a template from the Templates page and open it directly in the editor.`,
  },
  "editor-guide": {
    slug: "editor-guide",
    title: "Editor Guide",
    description: "Learn the canvas, layers, properties, and export options.",
    content: `The editor is built around three panels: the left Components/Hierarchy/AI sidebar, the center canvas, and the right Properties panel.

Components tab: drag ScreenGui, Frame, TextLabel, TextButton, ImageLabel, ScrollingFrame, and layout objects onto the canvas.
Hierarchy tab: rename, duplicate, reorder, or delete elements. Right-click for context actions.
Properties panel: edit Position, Size, AnchorPoint, colors, text, layout mode, padding, and corner radius.

Undo and redo are available from the toolbar or with Ctrl+Z / Ctrl+Y.`,
  },
  "plugin-guide": {
    slug: "plugin-guide",
    title: "Plugin Guide",
    description: "What the Roblox Studio plugin will do and how to join the waitlist.",
    content: `The Roblox Studio plugin is currently in development. Join the waitlist on the plugin page and we'll email you as soon as it passes Roblox Creator Marketplace review.

Once the plugin is live, the workflow will be:
1. Install the plugin from the Roblox Creator Marketplace.
2. Enable HttpService in Game Settings → Security.
3. Open the plugin toolbar and sign in with the same account.
4. Select a saved project and click Import.
5. The generated instances appear in StarterGui, ready to play.

Until then, you can export clean Luau from the editor and paste it into StarterGui.

If the import button does nothing, double-check that HTTP requests are enabled and that the project was saved.`,
  },
};

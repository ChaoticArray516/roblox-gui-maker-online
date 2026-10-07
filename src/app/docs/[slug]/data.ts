export const DOC_SLUGS = [
  "quick-start",
  "editor-guide",
  "plugin-guide",
  "ai-generation-api",
  "figma-import-guide",
  "template-developer-guide",
] as const;
export type DocSlug = (typeof DOC_SLUGS)[number];

export interface DocSection {
  heading: string;
  body: string;
}

export interface DocData {
  slug: DocSlug;
  title: string;
  description: string;
  /** sitemap lastmod（SOP-3V-04；3O-06 批次 2026-07-21） */
  modifiedAt: string;
  content: string;
  /** 结构化正文（优先于 content 渲染，SOP-3O-06） */
  sections?: DocSection[];
}

export const DOCS: Record<DocSlug, DocData> = {
  "quick-start": {
    slug: "quick-start",
    modifiedAt: "2026-07-21",
    title: "Quick Start",
    description: "Create your first Roblox GUI in under five minutes.",
    content: `Welcome to Roblox GUI Maker. This quick start walks you from a blank canvas to exported Luau in about five minutes, no Luau knowledge required.

1. Open the web editor and pick a device preset (desktop, tablet, or mobile). The canvas shows a DeviceFrame at the chosen size, so you see exactly how the layout will look on that device.
2. Drag a Frame from the Components tab onto the canvas. The Frame becomes your root container. Resize it by dragging its corner handles, or set exact Size values in the Properties panel.
3. Add a TextButton inside the Frame. Click the Frame first so the button parents to it, then drag the TextButton from the Components tab. Edit the button text in the Properties panel.
4. Use UIListLayout or UIGridLayout to arrange children automatically. Drag a layout object into the Frame and the children snap into a vertical list or a grid without manual UDim2 math.
5. Adjust colors and corner radius in the Properties panel. Every change updates the canvas instantly, and you can undo with Ctrl+Z if you make a mistake.
6. Preview on a different device by switching the DeviceFrame preset at the top of the canvas. Scale-based sizing means your layout stays proportional across sizes.
7. Click Export and pick a format: copy the client Luau, download a ModuleScript or Client+Server bundle, save the project JSON, or grab a ZIP with everything. The exported code is editable Luau, not a screenshot.
8. In Roblox Studio, insert a LocalScript under StarterGui and paste the code. Press Play and your GUI appears exactly as designed.

You can also skip the blank canvas: pick a template from the Templates page, open it directly in the editor, and customize it before exporting. Templates include inventories, shops, HUDs, and menus with real game logic.

Common first-timer questions: the Free plan gives you 50 AI generation credits per month, so you can also describe a UI in the AI panel and let the generator build the starting layout for you. And you do not need Roblox Studio open until the export step - everything up to then happens in the browser.`,
  },
  "editor-guide": {
    slug: "editor-guide",
    modifiedAt: "2026-07-21",
    title: "Editor Guide",
    description: "Learn the canvas, layers, properties, and export options.",
    content: `The editor is built around three panels: the left sidebar (Components, Hierarchy, AI), the center canvas, and the right Properties panel. Understanding how they interact is the key to building UIs fast.

Components tab: this is your toolbox. Drag ScreenGui, Frame, TextLabel, TextButton, ImageLabel, ImageButton, TextBox, ScrollingFrame, and layout objects (UICorner, UIGradient, UIListLayout, UIGridLayout, UIPadding) onto the canvas. The 3I extension adds constraint, media/3D, world-space, and interactive composite components. Click a component once to add it at the canvas center, or drag it to drop it at a specific spot.

Hierarchy tab: this shows the element tree. Rename elements by double-clicking, duplicate with Ctrl+D, reorder by dragging, or delete with the Delete key. Right-click any element for context actions. The hierarchy matters because parent-child relationships control layout - a child of a Frame positions relative to that Frame.

AI tab: describe a UI in plain text and the generator returns a starting layout. You can then refine it on the canvas. The Free plan includes 50 AI credits per month; each generation costs one credit.

Canvas: this is your working area. Elements render with their actual colors, text, and borders. Click an element to select it, drag to move it, and drag the corner handles to resize. Grid snapping helps you align elements to a 10px grid. Preview on Desktop, Tablet, or Mobile by switching the DeviceFrame preset.

Properties panel: this is where you fine-tune. It shows Position, Size, AnchorPoint, BackgroundColor3, BackgroundTransparency, Text, Font, TextSize, TextColor3, CornerRadius, and layout-specific fields. Extended component types (UIStroke, UIScale, ColorSequence, EventBinding) have their own editors in the property panel.

Undo and redo: use Ctrl+Z and Ctrl+Y, or the toolbar buttons. The editor keeps a snapshot history, so you can step back through every change.

Export: click Export for Client Luau, Server Luau, ModuleScript, a Client+Server bundle, project JSON, or a ZIP with everything. LocalScript is a single file for StarterGui. ModuleScript wraps the GUI in a reusable module. Client+Server bundles both sides with a RemoteEvent for two-way logic.

Keyboard shortcuts: Ctrl+Z/Y for undo/redo, Ctrl+C/V/D for copy/paste/duplicate, Delete to remove, arrow keys to nudge the selection, and Ctrl+S to save a project.`,
  },
  "plugin-guide": {
    slug: "plugin-guide",
    modifiedAt: "2026-07-21",
    title: "Plugin Guide",
    description: "What the Roblox Studio plugin will do and how to join the waitlist.",
    content: `The Roblox Studio plugin is currently planned and has not yet passed Roblox Creator Marketplace review. This guide explains what it will do, how the workflow will work, and what you can do today.

Current status: the plugin is on the waitlist. Visit the plugin page and join the waitlist to get an email the moment it is installable from the Roblox Creator Marketplace. Until then, you can export clean Luau from the editor and paste it into StarterGui manually - the output is identical.

What the plugin will do: once live, it will import your saved Roblox GUI Maker projects straight into Studio in one click. Instead of copy-pasting Luau, you pick a project from a list and the plugin builds the entire UI hierarchy as real instances in StarterGui.

The planned workflow is four steps:
1. Install the plugin from the Roblox Creator Marketplace. It will appear under the Plugins tab in Studio.
2. Enable HttpService in Game Settings, under Security. This lets the plugin fetch your saved projects from the Roblox GUI Maker API. This is a one-time setup.
3. Open the plugin toolbar button and sign in with the same account you use on the web editor. The plugin lists your saved projects.
4. Select a project and click Import. The generated ScreenGui, Frames, TextLabels, TextButtons, and layout objects appear in StarterGui, ready to play.

Troubleshooting: if the Import button does nothing, first confirm HttpService is enabled - most import failures come from that setting being off. Second, confirm the project was saved in the editor (unsaved projects do not sync). Third, check that you are signed in with the same account on both the web editor and the plugin.

Joining the waitlist: go to the plugin page and click Join Plugin Waitlist. You will be emailed when the plugin passes review. There is no cost to join, and the plugin will be free like the editor.

In the meantime: export Luau from the editor and paste it into StarterGui. The paste workflow produces the same result as the plugin will, just with one extra manual step.`,
  },
  "ai-generation-api": {
    slug: "ai-generation-api",
    modifiedAt: "2026-07-21",
    title: "AI Generation API",
    description: "How the AI endpoint works and how to shape prompts.",
    content: `The AI generation endpoint (/api/ai/generate) turns a plain-text prompt into a working Roblox GUI. This guide explains how the endpoint works, how to shape prompts for the best results, and how credits and errors are handled.

How it works: you send a prompt describing the UI you want, and the endpoint returns a stream of generated elements that load straight into the editor canvas. The AI understands Roblox-specific terms, so you can mention ScreenGui, Frame, UIGridLayout, UDim2, and Scale/Offset by name and it will use them correctly.

Prompt structure: the endpoint accepts a prompt plus three parameters - guiType (menu, shop, hud, inventory, settings, or custom), style (bright, dark, clean, or cartoon), and device (desktop or mobile). The guiType tells the AI the general layout pattern to start from; the style controls the color palette; the device sets the default proportions. A well-shaped prompt names the UI type, lists the key elements, and mentions any constraints. For example: "a pet shop GUI with a 3x3 egg grid, a green Buy button, and a coin balance header, dark style, mobile" is far better than "make a shop".

Model fallback: the endpoint tries a chain of models through OpenRouter (deepseek/deepseek-chat, then qwen/qwen-2.5-72b-instruct, then meta-llama/llama-3.3-70b-instruct). If all models fail, it refunds your credit and falls back to a Mock stream that generates a reasonable layout locally, so you are never charged for a failed generation.

Credits: Free plan users get 50 AI generation credits per month, and each generation costs one credit. Pro plan users have unlimited generations. The endpoint checks your credit balance before generating. If you are logged in and out of credits, it returns a 402 error with an upgrade URL. Anonymous (not logged in) users get a free Mock stream with OpenRouter disabled, so you can try the AI before signing up - the Mock output is a sample layout, not a real AI generation.

Errors: the endpoint streams Server-Sent Events. On success you get a stream of element chunks ending with [DONE]. On failure you get either a 402 (out of credits) or a refund plus Mock fallback. The refund happens automatically when all OpenRouter models fail, so your credit is only consumed on a successful generation.

Best practices: keep prompts specific about layout and elements, not about implementation details. The AI decides the Luau for you. If the first result is not quite right, refine it on the canvas instead of regenerating - editing on the canvas costs no credits.`,
  },
  "figma-import-guide": {
    slug: "figma-import-guide",
    modifiedAt: "2026-07-21",
    title: "Figma Import Guide",
    description: "Convert Figma designs to Roblox GUI objects.",
    content: `The Figma-to-Roblox converter is currently planned. This guide explains what it will do, how the workflow is planned, and how to join the waitlist to be notified when it launches.

Current status: the converter has not shipped yet. You can join the waitlist on the Figma to Roblox page and you will be emailed when the beta opens. Until then, the fastest path from a Figma design to a Roblox GUI is to describe the design in the AI panel or rebuild it on the canvas - both take minutes, not hours.

What the converter will do: it will read a Figma file and map its layers to Roblox GUI objects. Figma Frames become ScreenGui and Frame instances, text layers become TextLabel and TextButton, image layers are uploaded to your Roblox library, and the layout is converted to Scale/Offset so it is responsive across devices.

The planned workflow is three steps:
1. Upload your Figma design. Paste a public Figma file URL or connect your Figma account. The converter reads your frames, components, and image layers.
2. Auto-convert and upload assets. Frames become Roblox GUI instances with matching names and hierarchy, text keeps its content and styling, and images are uploaded to your Roblox library automatically. Scale/Offset conversion keeps the layout responsive.
3. Import via the Studio plugin. Once the Roblox GUI Maker Studio plugin is live, you pick the converted file and drop the UI into StarterGui in one click. Until the plugin ships, you export Luau and paste it manually.

Why this matters: today, moving a Figma design to Roblox means manually exporting PNGs, uploading them one by one, copying Asset IDs, and re-doing the Scale/Offset math by hand. That process is slow and error-prone. The converter collapses it into a single import step, and the output is real instances you can edit in Studio, not a flattened image.

Joining the waitlist: visit the Figma to Roblox page and join the waitlist. You will be emailed when the beta opens for public Figma URLs, automatic asset upload, and Studio plugin import. There is no cost to join.

In the meantime: if you have a Figma design you need in Roblox now, describe it to the AI generator in plain text, or open the editor and rebuild it on the canvas. Both produce editable Luau you can paste into StarterGui.`,
  },
  "template-developer-guide": {
    slug: "template-developer-guide",
    modifiedAt: "2026-07-21",
    title: "Template Developer Guide",
    description: "Build templates that others can reuse.",
    content: `The template marketplace ships 13 production-ready templates covering inventories, shops, HUDs, menus, leaderboards, dialogue, and rewards. This guide explains how templates are structured, what makes a good template, and how you can build one that others can reuse.

Template structure: every template has four parts. The visual layout (the ScreenGui hierarchy of Frames, TextLabels, TextButtons, and layout objects), the client Luau (the script that builds and runs the UI), the server Luau (optional, for purchase validation, DataStore persistence, or multiplayer logic), and the preview image (a screenshot showing the template in action). The template data record ties these together with metadata: name, category, style, device, price, features, and the Luau asset paths.

What makes a good template: a good template solves a real problem completely. It is not a static mockup - it ships with working Luau logic that does something when pasted into Studio. A shop template includes purchase validation. An inventory template includes drag-and-drop and DataStore persistence. A leaderboard template includes OrderedDataStore ranking. The player should be able to paste the template, press Play, and see it work, then customize it for their game.

Layout conventions: use Scale-based sizing, not Offset-only, so the template works on any screen size. Anchor containers with AnchorPoint and use UIListLayout or UIGridLayout so the layout reflows on mobile. Name every element descriptively - "ClaimButton", not "TextButton2". Keep the hierarchy shallow and logical, with one root ScreenGui and a clear parent-child structure.

Luau conventions: comment the key sections so the person using your template understands where to customize. Mark the spots they need to edit with TODO comments (for example, where to wire the purchase grant or the currency system). Use RemoteEvents for client-server communication, and handle DataStore with pcall so a failed save does not crash the game.

The 12 reference templates: study the existing templates in the library to see these patterns in action. The RPG Inventory shows drag-and-drop with UIDragDetector. The Pet Shop shows server-side purchase validation. The FPS HUD shows tweened health and ammo feedback. The Daily Rewards template shows a full streak-and-reset system with DataStore. Each is a working reference for a different UI pattern.

Preview and submission: every template needs a preview image so users can see it before opening it. Once you have a working template with clean Luau and a good preview, it can be added to the library. Reach out through the contact channel on the site to discuss template submission.`,
  },
};
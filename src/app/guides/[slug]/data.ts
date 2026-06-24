import { SITE_URL } from "@/lib/site-config";

export const GUIDE_SLUGS = ["fix-gui-scaling", "uilistlayout-uigridlayout", "draggable-gui"] as const;
export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export interface GuideData {
  slug: GuideSlug;
  h1: string;
  title: string;
  description: string;
  targetKeyword: string;
  publishedAt: string;
  modifiedAt: string;
  imageUrl: string;
  intro: string;
  sections: { heading: string; body: string; code?: string }[];
  steps: { name: string; text: string }[];
  faq: { q: string; a: string }[];
}

export const GUIDES: Record<GuideSlug, GuideData> = {
  "fix-gui-scaling": {
    slug: "fix-gui-scaling",
    h1: "How to Fix Roblox GUI Scaling — Complete Roblox Guide",
    title: "How to Fix Roblox GUI Scaling",
    description:
      "Learn the difference between Scale and Offset in Roblox UI and how to build GUIs that look correct on phone, tablet, and desktop.",
    targetKeyword: "how to fix roblox gui scaling",
    publishedAt: "2026-06-20",
    modifiedAt: "2026-06-20",
    imageUrl: `${SITE_URL}/guides/fix-gui-scaling.webp`,
    intro:
      "GUI scaling is the single most reported issue on Roblox DevForum. A panel that fits perfectly on your 1440p monitor turns into a tiny postage stamp on a phone — or worse, overflows the screen on an iPad. The fix is mechanical: understand UDim2, prefer Scale over Offset, anchor from the center, and verify on every device emulator before you ship. This guide walks through every rule with copy-paste Luau, plus the three traps that catch most beginners.",
    sections: [
      {
        heading: "Why GUIs break on different screens",
        body:
          "A position of UDim2.new(0, 100, 0, 50) means \"100 pixels from the left, 50 pixels from the top\" — regardless of screen size. On a 4K monitor that is barely off the corner; on a phone that is a third of the way across the screen. UDim2 stores two numbers per axis: a Scale (percentage of parent) and an Offset (raw pixels). Most beginners build with Offset because it feels predictable in Studio's emulator, then ship a UI that breaks the moment a real player loads it. The mental model that fixes everything: think in percentages first, pixels only for borders.",
      },
      {
        heading: "The safe default rule",
        body:
          "Use Scale (the first number in each pair) for layout — Position, Size, anchors. Use Offset (the second number) only for fixed-pixel concerns like a 1-pixel border, a 4-pixel padding, or an icon that must stay 32×32 regardless of device. The rule of thumb: if you cannot answer \"why this exact pixel count\" in one sentence, the answer is Scale.",
        code: `local frame = Instance.new("Frame")
-- 50% of parent width, 50% of parent height, no offset
frame.Size = UDim2.new(0.5, 0, 0.5, 0)
-- Centered on the screen
frame.Position = UDim2.new(0.5, 0, 0.5, 0)
frame.AnchorPoint = Vector2.new(0.5, 0.5)
frame.Parent = screenGui`,
      },
      {
        heading: "AnchorPoint keeps things centered",
        body:
          "Set AnchorPoint to (0.5, 0.5) and Position to (0.5, 0, 0.5, 0) to center any element without manual math. AnchorPoint moves the origin of the element to the named point — (0, 0) is top-left, (1, 1) is bottom-right, (0.5, 0.5) is the center. Without an AnchorPoint set, Position is measured from the element's top-left corner, which means \"center the panel\" requires you to subtract half its size manually. AnchorPoint removes that subtraction.",
      },
      {
        heading: "UIAspectRatioConstraint for icons and square buttons",
        body:
          "Scale-based sizing stretches elements with the parent. That is great for panels, terrible for circular avatars or square skill icons. Add a UIAspectRatioConstraint as a child of any element that must keep its proportions — pass an AspectRatio of 1 for squares, 16/9 for video frames, etc.",
        code: `local icon = Instance.new("ImageLabel")
icon.Size = UDim2.new(0, 64, 0, 64) -- starting size

local ratio = Instance.new("UIAspectRatioConstraint")
ratio.AspectRatio = 1 -- 1:1, always square
ratio.AspectType = Enum.AspectType.ScaleWithParentSize
ratio.DominantAxis = Enum.DominantAxis.Width
ratio.Parent = icon`,
      },
      {
        heading: "UISizeConstraint for min/max bounds",
        body:
          "Scale alone has no floor. On a tiny screen your 50%-wide button might shrink to 120 px, which is too small to tap. Add a UISizeConstraint with a MinSize to enforce a hard floor (and MaxSize to prevent comically wide buttons on ultrawide monitors).",
      },
      {
        heading: "Three common scaling traps",
        body:
          "Trap 1: building everything in Offset because Studio's default canvas is 1024×768. Trap 2: forgetting that ScreenGui has an IgnoreGuiInset property. Trap 3: using TextScaled = true on every label. TextScaled fits the largest text the box can hold, which means labels of different lengths render at different sizes. Use TextSize with a UITextSizeConstraint instead.",
      },
    ],
    steps: [
      { name: "Replace hard offsets with scale", text: "Audit every Size/Position pair and move layout values into the Scale component." },
      { name: "Anchor from the center", text: "Set AnchorPoint (0.5, 0.5) on centered panels so they stay put when the parent resizes." },
      { name: "Constrain aspect ratios on icons", text: "Add UIAspectRatioConstraint to ImageLabels and square buttons so circles stay circular." },
      { name: "Floor your touch targets", text: "Add UISizeConstraint with MinSize 44×44 px on every button." },
      { name: "Test on all devices", text: "Use the device preview in Roblox GUI Maker or Studio's emulator." },
    ],
    faq: [
      { q: "Should I ever use Offset instead of Scale?", a: "Yes — for borders, separators, padding, and icons whose size must not stretch." },
      { q: "Why does TextScaled make my UI look inconsistent?", a: "TextScaled fits the largest text that fits the TextLabel, so different-length labels render at different sizes." },
      { q: "Do I need to test on every Roblox device?", a: "Three is enough: phone, tablet, and desktop 1080p." },
    ],
  },
  "uilistlayout-uigridlayout": {
    slug: "uilistlayout-uigridlayout",
    h1: "UIListLayout & UIGridLayout in Roblox — Complete Roblox Guide",
    title: "UIListLayout & UIGridLayout Explained",
    description:
      "A complete guide to UIListLayout and UIGridLayout: padding, spacing, sort order, and responsive grids for inventories, shops, and leaderboards.",
    targetKeyword: "how to use uilistlayout roblox",
    publishedAt: "2026-06-20",
    modifiedAt: "2026-06-20",
    imageUrl: `${SITE_URL}/guides/uilistlayout-uigridlayout.webp`,
    intro:
      "UIListLayout and UIGridLayout are the two layout objects you will use in 90% of Roblox GUIs. Used correctly they eliminate manual math and adapt automatically when items are added, removed, or sorted. This guide covers when to pick which, how padding and sort order work, and how to wrap them in a ScrollingFrame.",
    sections: [
      {
        heading: "When to use UIListLayout",
        body:
          "UIListLayout stacks children in a single direction — vertical or horizontal. It is perfect for leaderboards, settings rows, chat messages, hotbar slots, and dialogue choice buttons. The layout reads each child's LayoutOrder property and sorts them ascending.",
        code: `local list = Instance.new("UIListLayout")
list.FillDirection = Enum.FillDirection.Vertical
list.HorizontalAlignment = Enum.HorizontalAlignment.Center
list.VerticalAlignment = Enum.VerticalAlignment.Top
list.SortOrder = Enum.SortOrder.LayoutOrder
list.Padding = UDim.new(0, 8)
list.Parent = container`,
      },
      {
        heading: "When to use UIGridLayout",
        body:
          "UIGridLayout arranges children in a 2D grid with fixed cell size. Use it for inventories, shop cards, ability hotbars, and pet collections. Cells stay square regardless of parent size, and rows wrap automatically.",
        code: `local grid = Instance.new("UIGridLayout")
grid.CellSize = UDim2.new(0, 100, 0, 100)
grid.CellPadding = UDim2.new(0, 8, 0, 8)
grid.FillDirection = Enum.FillDirection.Horizontal
grid.SortOrder = Enum.SortOrder.LayoutOrder
grid.Parent = container`,
      },
      {
        heading: "LayoutOrder — the property nobody mentions",
        body:
          "Both layouts honor each child's LayoutOrder when SortOrder is set to LayoutOrder. Leave gaps (10, 20, 30) instead of (1, 2, 3) so you can insert items without renumbering.",
      },
      {
        heading: "Wrapping in a ScrollingFrame",
        body:
          "For long lists or grids, parent the layout container inside a ScrollingFrame and set AutomaticCanvasSize to Y. The ScrollingFrame reads the layout's AbsoluteContentSize and resizes its CanvasSize to match.",
        code: `local scroll = Instance.new("ScrollingFrame")
scroll.Size = UDim2.new(1, 0, 1, 0)
scroll.CanvasSize = UDim2.new(0, 0, 0, 0)
scroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
scroll.ScrollBarThickness = 6
scroll.Parent = parent

local list = Instance.new("UIListLayout")
list.SortOrder = Enum.SortOrder.LayoutOrder
list.Padding = UDim.new(0, 8)
list.Parent = scroll`,
      },
      {
        heading: "UIPadding — the inset you keep forgetting",
        body:
          "Layouts measure spacing between children, not from the container edge. Without UIPadding, your top item sits flush against the container border. Add a UIPadding sibling with PaddingTop / PaddingBottom / PaddingLeft / PaddingRight to inset content.",
      },
      {
        heading: "Performance and lifecycle gotchas",
        body:
          "Layouts run on every frame change, but cost is negligible until ~200 children. Set LayoutOrder before parenting to avoid double-sort. Do not put a UIListLayout and a UIGridLayout under the same parent — Roblox honors the first one and ignores the second silently.",
      },
    ],
    steps: [
      { name: "Pick the right layout object", text: "UIListLayout for stacks, UIGridLayout for 2D grids." },
      { name: "Set padding and sort order", text: "Use LayoutOrder for explicit ordering and Padding for gaps." },
      { name: "Wrap in a ScrollingFrame for long lists", text: "Set AutomaticCanvasSize = Y so the canvas resizes automatically." },
      { name: "Add UIPadding for edge inset", text: "Add 12–24 px on each side for breathing room." },
      { name: "Test with dynamic content", text: "Add and remove children at runtime to confirm reflow." },
    ],
    faq: [
      { q: "Can I nest UIListLayout inside UIGridLayout?", a: "Yes — common pattern: UIGridLayout for outer cards, UIListLayout inside each card." },
      { q: "Why does my UIGridLayout cut off rows?", a: "The parent's Size is too small to fit a full row. Shrink CellSize or wrap in a ScrollingFrame." },
      { q: "What is the difference between SortOrder.Name and SortOrder.LayoutOrder?", a: "Name sorts alphabetically; LayoutOrder sorts by integer property." },
    ],
  },
  "draggable-gui": {
    slug: "draggable-gui",
    h1: "How to Make a Draggable GUI in Roblox — Complete Roblox Guide",
    title: "How to Make a Draggable GUI",
    description:
      "Add drag-and-drop to any Roblox Frame with a short, reusable Luau script. Includes screen clamping so the panel never leaves the viewport.",
    targetKeyword: "how to make a draggable gui roblox",
    publishedAt: "2026-06-20",
    modifiedAt: "2026-06-20",
    imageUrl: `${SITE_URL}/guides/draggable-gui.webp`,
    intro:
      "A draggable GUI lets the player reposition a panel — chat window, minimap, settings menu. Roblox deprecated Frame.Draggable in 2023, so you write the behavior in ~30 lines of Luau. This guide gives a copy-paste pattern that works on mouse, touch, and gamepad, plus screen-clamping logic.",
    sections: [
      {
        heading: "Why Frame.Draggable was deprecated",
        body:
          "Roblox removed Frame.Draggable because it only worked with mouse input — touch and gamepad were silently broken. Manually implementing drag with UserInputService handles every input type and lets you clamp the panel to the screen.",
      },
      {
        heading: "The draggable pattern",
        body:
          "Listen to InputBegan on the frame to start dragging. Capture the start position. Listen to InputChanged on UserInputService for every movement. Listen to InputEnded to stop. Update the frame's Position by adding the input delta to the captured start position.",
        code: `local UserInputService = game:GetService("UserInputService")
local frame = script.Parent

local dragging = false
local dragStart, startPos

frame.InputBegan:Connect(function(input)
  if input.UserInputType == Enum.UserInputType.MouseButton1
    or input.UserInputType == Enum.UserInputType.Touch then
    dragging = true
    dragStart = input.Position
    startPos = frame.Position
    input.Changed:Connect(function()
      if input.UserInputState == Enum.UserInputState.End then
        dragging = false
      end
    end)
  end
end)

UserInputService.InputChanged:Connect(function(input)
  if not dragging then return end
  if input.UserInputType == Enum.UserInputType.MouseMovement
    or input.UserInputType == Enum.UserInputType.Touch then
    local delta = input.Position - dragStart
    frame.Position = UDim2.new(
      startPos.X.Scale,
      startPos.X.Offset + delta.X,
      startPos.Y.Scale,
      startPos.Y.Offset + delta.Y
    )
  end
end)`,
      },
      {
        heading: "Clamp to screen bounds",
        body:
          "Without clamping, players drag the panel off the edge and lose it. Read AbsoluteSize on the screen and frame, calculate max X/Y, and clamp the new Position to that range.",
        code: `local screenSize = workspace.CurrentCamera.ViewportSize
local frameSize = frame.AbsoluteSize

local newX = math.clamp(startPos.X.Offset + delta.X, 0, screenSize.X - frameSize.X)
local newY = math.clamp(startPos.Y.Offset + delta.Y, 0, screenSize.Y - frameSize.Y)

frame.Position = UDim2.new(0, newX, 0, newY)`,
      },
      {
        heading: "Adding a drag handle",
        body:
          "Move the InputBegan listener from the frame to a child Frame named DragHandle. The math is identical; only the input source changes.",
      },
      {
        heading: "Persisting the position with DataStore",
        body:
          "Players expect layout choices to survive a server hop. Write final UDim2 components to a DataStore keyed by UserId, and restore on player join.",
      },
      {
        heading: "Touch and gamepad gotchas",
        body:
          "Touch input fires InputBegan for both Touch and MouseButton1. Guard with a dragging flag to avoid two simultaneous drags. Gamepad does not have a pointer; support select + d-pad to nudge instead.",
      },
    ],
    steps: [
      { name: "Add the input listeners", text: "Connect InputBegan, InputChanged, and InputEnded to track drag state." },
      { name: "Apply the delta to Position", text: "Add the input delta to startPos offset components." },
      { name: "Clamp to screen bounds", text: "Use math.clamp so the frame stays inside ViewportSize − AbsoluteSize." },
      { name: "Move listeners to a drag handle", text: "Restrict drag to a title bar if needed." },
      { name: "Persist to DataStore", text: "Save final position keyed by UserId on InputEnded." },
    ],
    faq: [
      { q: "Why does the panel jump on the first drag?", a: "You read frame.Position after dragging started. Capture startPos inside InputBegan." },
      { q: "Does this work on mobile?", a: "Yes — UserInputType.Touch is handled like MouseButton1." },
      { q: "Can I limit dragging to one axis?", a: "Yes — keep startPos.X.Offset or Y.Offset constant." },
    ],
  },
};

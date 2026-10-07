export const USE_CASE_SLUGS = [
  "simulator-hud",
  "fps-game-ui",
  "roleplay-menu",
  "tycoon-ui",
  "obby-start-screen",
] as const;
export type UseCaseSlug = (typeof USE_CASE_SLUGS)[number];

export interface UseCaseStep {
  name: string;
  text: string;
}

export interface UseCaseData {
  slug: UseCaseSlug;
  gameType: string;
  /** sitemap lastmod（SOP-3V-04；3O-04 批次 2026-07-19） */
  modifiedAt: string;
  h1: string;
  description: string;
  /** 首段引言（含 gameType 关键词） */
  intro: string;
  /** 4+ 设计要点 */
  requirements: string[];
  /** 5-6 个步骤教程 */
  steps: UseCaseStep[];
  /** 2-4 段正文散文（每段 80-120 词），承载 ≥800 词目标 */
  bodySections: { heading: string; body: string }[];
  /** 设计提示（可选，3-5 条） */
  designTips: string[];
  relatedTemplates: string[];
}

export const USE_CASES: Record<UseCaseSlug, UseCaseData> = {
  "simulator-hud": {
    slug: "simulator-hud",
    modifiedAt: "2026-07-19",
    gameType: "Simulator",
    h1: "Design the Perfect Simulator UI for Your Roblox Game",
    description:
      "A simulator HUD needs click counters, rebirth badges, pet counts, and currency labels - all readable on mobile while the player spams clicks.",
    intro:
      "Simulator games live or die by their HUD. Players tap a button hundreds of times a minute, so the counter has to update instantly, the rebirth badge has to stay visible, and the whole layout has to survive a phone screen held in one hand. This guide covers the layout, the feedback loops, and the Luau wiring that makes a simulator HUD feel responsive.",
    requirements: [
      "Large, tappable button anchored to a thumb-friendly zone",
      "Currency counters that update every click without lag",
      "Pet and equipped-item icons in a compact horizontal strip",
      "Rebirth badge showing current tier and next threshold",
      "Tweened pop numbers that confirm each click",
      "Mobile-safe layout that avoids the top notch and bottom bar",
    ],
    steps: [
      { name: "Anchor the main click button", text: "Place a large TextButton in the bottom-right thumb zone, sized with Scale so it scales across devices. Give it a UICorner and a subtle UIGradient so it reads as tappable." },
      { name: "Add currency labels", text: "Stack your counters (coins, gems, clicks) with a UIListLayout anchored to the top-left. Use a monospace font for the digits so they do not jitter as they change." },
      { name: "Build the rebirth panel", text: "Show the current rebirth count, the multiplier it grants, and the cost of the next rebirth. Disable the rebirth button when the player cannot afford it." },
      { name: "Add the pet strip", text: "Lay out equipped pets in a horizontal ScrollingFrame with UIGridLayout. Each slot shows the pet icon and a small rarity border." },
      { name: "Wire the click event", text: "Fire a RemoteEvent to the server for the real currency update, and update the HUD locally for instant feedback. Use TweenService for the pop number on each click." },
      { name: "Test on mobile", text: "Open the editor's mobile preview and confirm the button stays in the thumb zone, counters do not overflow, and pets wrap cleanly on a 375px width." },
    ],
    bodySections: [
      {
        heading: "Why simulator HUDs need Scale over Offset",
        body: "Simulator players are almost always on phones, and phone aspect ratios range from 16:9 to 21:9. If you size your click button with Offset (pixel values), it will look tiny on a 6.7-inch phone and huge on a 5.4-inch one. Scale sizes the button as a percentage of the screen, so it stays proportional. Anchor the button to the bottom-center or bottom-right, set its AnchorPoint to (0.5, 1), and use a Size like {0.4, 0, 0.12, 0}. The button will land in the thumb zone on every device.",
      },
      {
        heading: "Making clicks feel instant",
        body: "The single biggest UX mistake in simulator HUDs is waiting for the server before updating the counter. Network round-trip adds 50 to 200 milliseconds of lag, and at 10 clicks per second that means the counter is always behind the player's finger. The fix is optimistic updates: increment the local counter immediately, fire the RemoteEvent to the server, and let the server reconcile. If the server rejects a click (cooldown, cheat detection), it sends a correction and you snap the counter back. The player never sees lag.",
      },
      {
        heading: "Rebirth UI patterns that convert",
        body: "Rebirth is your main monetization lever, so the rebirth panel has to sell it. Show the current rebirth count, the permanent multiplier it grants, and the next reward threshold. Use a progress bar that fills as the player approaches the next rebirth cost. When they can afford it, pulse the rebirth button with a TweenService scale animation. Do not hide the rebirth panel behind a menu - put a compact badge in the HUD that opens the full panel on tap. Players who see the rebirth progress constantly are more likely to grind for it.",
      },
      {
        heading: "Pet strips and inventory previews",
        body: "Equipped pets are status symbols in simulator games, so they belong in the HUD, not buried in a menu. A horizontal strip of 3 to 5 slots along the top or side of the screen shows what the player has equipped. Each slot is a small ImageLabel with a rarity-colored UICorner border. If the player has more pets than slots, show a '+N more' tile that opens the full inventory. Use UIGridLayout with a fixed cell size and padding so the strip stays neat on any screen width.",
      },
    ],
    designTips: [
      "Use TweenService for pop numbers - a 0.2-second scale-up and fade makes each click feel rewarding.",
      "Keep the click button at least 80x80 logical pixels to meet Apple/Google touch-target guidance.",
      "Animate the rebirth button with a subtle pulse when the player can afford it.",
      "Test your HUD on the slowest device you can find - simulator players are often on low-end phones.",
    ],
    relatedTemplates: ["/templates/simulator-hud", "/templates/shop-ui", "/templates/pet-shop"],
  },
  "fps-game-ui": {
    slug: "fps-game-ui",
    modifiedAt: "2026-07-19",
    gameType: "FPS",
    h1: "Design the Perfect FPS UI for Your Roblox Game",
    description:
      "A first-person shooter UI is minimal and readable under pressure: ammo, health, armor, crosshair, and a kill feed.",
    intro:
      "FPS UI has one job: not get in the way. Players are tracking moving targets, flicking their crosshair, and managing reloads all at once. Every element on screen competes for attention, so the HUD has to be small, high-contrast, and glued to the screen edges. This guide covers the layout rules, the crosshair, the ammo and health readouts, and the kill feed that makes a Roblox FPS feel like a real shooter.",
    requirements: [
      "Low-clutter corners for health and ammo",
      "Center crosshair that does not obstruct targets",
      "Kill feed with fade-out entries",
      "Hitmarker feedback on successful shots",
      "Scales for 16:9 and ultrawide without stretching",
      "Low-health screen vignette for tension",
    ],
    steps: [
      { name: "Layout the HUD corners", text: "Anchor health bottom-left, ammo bottom-right, minimap top-right, and kill feed top-left. Keep each cluster under 200x80 logical pixels so it does not eat the viewport." },
      { name: "Add the crosshair", text: "Use a small Frame or ImageLabel anchored to the exact screen center with AnchorPoint (0.5, 0.5). Four thin lines or a single cross image works; keep the gap in the middle clear." },
      { name: "Build the ammo counter", text: "Show magazine and reserve counts with a monospace font. Color the counter red when magazine is below 25% so players know to reload." },
      { name: "Wire the health bar", text: "Bind Humanoid.HealthChanged to a TweenService fill animation. Add a red screen vignette (a full-screen ImageLabel with low transparency) when health drops below 30%." },
      { name: "Add the kill feed", text: "Use a UIListLayout anchored top-left. Each kill entry is a small Frame that fades out after 4 seconds using TweenService. Cap the list at 5 entries." },
      { name: "Add hitmarkers", text: "On a successful hit, flash a small cross or X at the crosshair for 100 milliseconds. Play a short UI sound for audio feedback." },
    ],
    bodySections: [
      {
        heading: "Crosshair design: the center must stay clear",
        body: "The crosshair is the most-clicked pixel in an FPS. If it is too thick, it hides the target. If it is too thin, players lose it against bright backgrounds. Four lines with a 4 to 6 pixel gap in the center is the standard because the gap lets you see exactly where the shot lands. Anchor the crosshair to the screen center with AnchorPoint (0.5, 0.5) and use Scale sizing so it stays centered on any aspect ratio. Avoid animated crosshairs that expand on movement - they look cool but they add noise during aim.",
      },
      {
        heading: "Ammo counters that read at a glance",
        body: "Players check ammo mid-fight, so the counter has to be readable in under half a second. Use a monospace font (RobotoMono or Code) so digits do not shift width as they change. Show magazine over reserve, large over small, so '30 / 90' reads top-to-bottom. Color-code the state: white at full, yellow at half, red at the last 25%. When the magazine hits zero, flash the counter once and show a 'RELOAD' prompt below it. Do not auto-reload for the player - it breaks muscle memory.",
      },
      {
        heading: "Health bars and low-health feedback",
        body: "A flat health bar is not enough in an FPS. You need three layers: the bar itself (a Frame that fills based on Humanoid.Health / MaxHealth), a damage flash (a brief white overlay when damage is taken), and a low-health vignette (a red full-screen ImageLabel at 60 to 80 percent transparency that fades in below 30% health). Bind the bar to Humanoid.HealthChanged and use TweenService with a 0.15-second animation so the bar drains smoothly instead of snapping. The vignette creates urgency without blocking the view.",
      },
      {
        heading: "Kill feeds that do not clutter",
        body: "The kill feed goes top-left, opposite the minimap. Each entry shows the killer name, a weapon icon, and the victim name. Use a UIListLayout that adds new entries at the top and pushes old ones down. Each entry auto-destroys after 4 seconds with a fade-out TweenService animation. Cap the list at 5 entries so a multi-kill does not fill the screen. Keep entry height at 24 to 28 logical pixels - small enough to stay out of the way, large enough to read.",
      },
    ],
    designTips: [
      "Keep HUD elements under 10% of total screen area - anything more blocks targets.",
      "Use high-contrast colors: white or yellow text on dark backgrounds, not mid-gray on gray.",
      "Bind hitmarkers to both visual flash and audio - players react faster to sound than sight.",
      "Test the HUD at 16:9, 21:9, and 4:3 aspect ratios in the editor's device preview.",
    ],
    relatedTemplates: ["/templates/fps-hud", "/templates/health-bar"],
  },
  "roleplay-menu": {
    slug: "roleplay-menu",
    modifiedAt: "2026-07-19",
    gameType: "Roleplay",
    h1: "Design the Perfect Roleplay UI for Your Roblox Game",
    description:
      "Roleplay games rely on character panels, dialogue boxes, shops, and job UIs. The layout should feel immersive and easy to navigate.",
    intro:
      "Roleplay UI is the opposite of FPS UI. Where a shooter strips everything down, a roleplay game builds up layered menus: character sheets, dialogue trees, job selectors, inventories, and shops, all reachable from a single HUD. The challenge is keeping it navigable without overwhelming the player. This guide covers the menu shell, dialogue system, and the transitions that make a roleplay UI feel polished.",
    requirements: [
      "Character sheet with avatar preview and stats",
      "Dialogue box with speaker portrait and typewriter text",
      "Inventory and backpack panel with rarity colors",
      "Job or faction selector with role previews",
      "Settings accessible from any submenu",
      "Smooth open and close transitions on every panel",
    ],
    steps: [
      { name: "Create the menu shell", text: "Build a full-screen Frame with a semi-transparent backdrop. Add a UIListLayout tab bar on the left for Character, Inventory, Jobs, and Settings. Each tab swaps the right panel content." },
      { name: "Build the character panel", text: "Show a ViewportFrame with the player's avatar, plus TextLabels for name, level, and stats. Add a 'Customize' button that opens the avatar editor." },
      { name: "Add the dialogue box", text: "Anchor a panel to the bottom of the screen with a speaker ImageLabel on the left and a TextLabel for the line. Use a typewriter effect (one character per 0.03 seconds) for the text." },
      { name: "Build the inventory grid", text: "Use a ScrollingFrame with UIGridLayout for item slots. Each slot shows the item icon, a count badge, and a rarity-colored border. Drag-and-drop uses UIDragDetector." },
      { name: "Wire the job selector", text: "List available jobs as cards. Clicking a card shows a preview of the job's uniform and abilities, with an 'Accept' button that fires a RemoteEvent." },
      { name: "Polish transitions", text: "Use TweenService to slide panels in from the right and fade the backdrop. Keep transitions under 0.3 seconds so the menu feels responsive." },
    ],
    bodySections: [
      {
        heading: "The menu shell pattern",
        body: "Every roleplay menu needs a shell: a full-screen Frame with a darkened backdrop, a tab bar, and a content area. The tab bar goes on the left (vertical UIListLayout) or top (horizontal UIListLayout). Each tab is a TextButton that, when clicked, hides the current content panel and shows the new one. The backdrop is a Frame with 50% transparency that sits between the game and the menu; clicking it closes the menu. Use a single shell Frame and swap content panels inside it, rather than building separate full-screen menus for each feature - it keeps the transition consistent and the code simpler.",
      },
      {
        heading: "Dialogue boxes with typewriter text",
        body: "Roleplay dialogue is not just text on screen - it is a performance. The dialogue box anchors to the bottom third of the screen, with the speaker's portrait (an ImageLabel) on the left and the line (a TextLabel) on the right. The text appears one character at a time using a RunService loop or a series of task.wait(0.03) calls. Players can click to skip the typewriter and reveal the full line instantly. When the line finishes, show a small 'click to continue' indicator. Branching choices appear as TextButtons below the dialogue box after the line completes.",
      },
      {
        heading: "Inventory grids with rarity colors",
        body: "A roleplay inventory is a grid of item slots, each showing an icon, a count, and a rarity border. Use a ScrollingFrame with UIGridLayout, a fixed cell size (64x64 or 80x80), and small padding. Rarity is communicated by border color: gray for common, green for uncommon, blue for rare, purple for epic, gold for legendary. Store the rarity on the item data and set the slot's UIStroke color accordingly. Drag-and-drop between slots uses UIDragDetector - on drop, swap the item data and refresh the grid. Add a tooltip Frame that appears on hover showing the item's full stats.",
      },
      {
        heading: "Smooth panel transitions",
        body: "Menus that pop in instantly feel cheap. Menus that take a full second to open feel slow. The sweet spot is 0.2 to 0.3 seconds. Use TweenService to animate the panel's Position (slide in from the right edge) and the backdrop's Transparency (fade from 1 to 0.5). On close, reverse the animation and destroy or hide the panel when the tween completes. Keep the tween EasingStyle to Quad or Quint with Out direction - it feels natural without being bouncy. Avoid scale animations on full-screen panels; they cause layout shift on mobile.",
      },
    ],
    designTips: [
      "Use a consistent tab bar across all menus so players learn the layout once.",
      "Bind the Escape key to close the topmost menu - roleplay players expect this.",
      "Keep dialogue text readable: 18 to 22 size, high contrast, no decorative fonts.",
      "Add a subtle sound on menu open and close - audio makes UI feel responsive.",
    ],
    relatedTemplates: ["/templates/main-menu", "/templates/dialogue-system", "/templates/rpg-inventory"],
  },
  "tycoon-ui": {
    slug: "tycoon-ui",
    modifiedAt: "2026-07-19",
    gameType: "Tycoon",
    h1: "Design the Perfect Tycoon UI for Your Roblox Game",
    description:
      "Tycoon games need cash counters, purchase buttons, a base overview, and an upgrade tree - all readable while the player manages their factory.",
    intro:
      "Tycoon UI balances two competing needs: the player has to see their cash grow constantly, and they also have to manage a base full of machines, conveyors, and upgrades. The HUD shows cash and stats; the base UI shows the layout and lets the player buy and upgrade. This guide covers the cash counter, the purchase panel, the upgrade tree, and the base overview that makes a tycoon game playable.",
    requirements: [
      "Cash counter anchored top-center, always visible",
      "Purchase buttons on the base itself (world-space or screen-space)",
      "Upgrade tree panel with locked and unlocked states",
      "Base overview minimap showing machine layout",
      "Stats panel (income per second, total earned, multiplier)",
      "Save indicator that confirms DataStore writes",
    ],
    steps: [
      { name: "Anchor the cash counter", text: "Place a TextLabel top-center with the current cash formatted with commas. Use a monospace font and a subtle gold UIGradient so it reads as currency." },
      { name: "Build purchase buttons", text: "For each buyable machine, place a TextButton near its base location. Show the name, cost, and a lock icon if the player cannot afford it. Clicking fires a RemoteEvent." },
      { name: "Create the upgrade tree", text: "Build a ScrollingFrame with a vertical UIGridLayout of upgrade nodes. Each node shows the upgrade name, current level, cost, and effect. Locked nodes are dimmed." },
      { name: "Add the stats panel", text: "Show income per second, total earned, and the current multiplier. Update these every second with a RunService loop or a server-pushed RemoteEvent." },
      { name: "Build the base overview", text: "Add a small ViewportFrame or minimap in a corner showing the base layout. Highlight unbuilt plots in red and built machines in green." },
      { name: "Wire the save indicator", text: "After each DataStore write, flash a small 'Saved' TextLabel for 1 second. This reassures players their progress is safe." },
    ],
    bodySections: [
      {
        heading: "Cash counters that feel rewarding",
        body: "The cash counter is the heart of a tycoon game. It goes top-center, always visible, and it has to make the number feel good. Format with commas (1,234,567 not 1234567), use a monospace or semi-condensed font so wide numbers do not push the layout, and add a subtle gold or green UIGradient. When cash increases, animate the counter with a brief scale-up (1.0 to 1.05 and back) using TweenService. When the player makes a big purchase, flash the counter red briefly to confirm the spend. Do not round the display - players want to see every coin.",
      },
      {
        heading: "Purchase buttons on the base",
        body: "Tycoon purchases happen in the world, not in a menu. For each buyable machine or plot, place a TextButton near its location. You can do this two ways: world-space SurfaceGui on a part (the button lives in the 3D world), or screen-space GuiObjects positioned above the part's screen projection. SurfaceGui is simpler and scales with the camera; screen-space gives more control over styling but requires per-frame position updates. Show the machine name, the cost, and a lock state. When the player cannot afford it, dim the button and show a lock icon.",
      },
      {
        heading: "Upgrade trees that show progress",
        body: "The upgrade tree is where players plan their progression. Lay it out as a vertical or grid of nodes in a ScrollingFrame, with lines connecting prerequisites. Each node shows the upgrade name, current level (e.g., 'Lvl 3/5'), the next cost, and the effect (e.g., '+20% income'). Unlocked nodes use full color; locked nodes are dimmed with a lock icon. When the player buys an upgrade, animate the node (a brief glow or scale) and refresh the connecting lines. Keep the tree readable - if it has more than 20 nodes, group them into categories with headers.",
      },
      {
        heading: "Stats and the save indicator",
        body: "Tycoon players are stats junkies. Show income per second, total earned, and the current multiplier in a compact panel, updated every second. Use a RunService.Heartbeat loop on the client to estimate income between server updates, so the numbers tick up smoothly. The save indicator is small but critical: after every DataStore write, flash a 'Saved' TextLabel in a corner for one second. Tycoon players have been burned by progress loss, and that indicator is how you earn their trust. If a save fails, show a red 'Save failed - reconnecting' warning instead of hiding the error.",
      },
    ],
    designTips: [
      "Format cash with commas and a currency symbol - raw numbers feel unfinished.",
      "Animate the cash counter on increase so growth feels rewarding.",
      "Show locked upgrades with their cost and requirement - players plan ahead.",
      "Flash the save indicator after every DataStore write to build player trust.",
    ],
    relatedTemplates: ["/templates/shop-ui", "/templates/leaderboard", "/templates/main-menu"],
  },
  "obby-start-screen": {
    slug: "obby-start-screen",
    modifiedAt: "2026-07-19",
    gameType: "Obby",
    h1: "Design the Perfect Obby Start Screen for Your Roblox Game",
    description:
      "An obby start screen needs a big play button, stage counter, best time, and shop link - all tappable on mobile and big enough for kids.",
    intro:
      "Obby start screens are deceptively simple. They look like just a play button, but they have to work for the youngest audience in Roblox: kids on phones and tablets who will tap anywhere and expect something to happen. The buttons have to be huge, the text has to be readable, and the layout has to survive being held sideways. This guide covers the start button, the stage and best-time display, the shop link, and the mobile-first sizing that makes an obby start screen work.",
    requirements: [
      "Huge Play button (at least 200x80 logical pixels)",
      "Stage counter showing current and max stage",
      "Best time display for the current stage",
      "Shop and settings buttons reachable from the start screen",
      "Big, readable fonts (18+ for body, 32+ for the title)",
      "Mobile-first layout that works at 375px width",
    ],
    steps: [
      { name: "Build the title", text: "Place the game title at the top with a large font (48 or bigger). Use a bold, rounded font like GothamBold or FredokaOne for a kid-friendly feel." },
      { name: "Add the Play button", text: "Center a large TextButton below the title. Size it at least 200x80 logical pixels, give it a UICorner, and a bright color (green or brand violet). The text says 'PLAY' in 32+ font." },
      { name: "Show stage and best time", text: "Below the Play button, show 'Stage 12 / 50' and 'Best: 0:42'. Use a monospace font for the time so it lines up." },
      { name: "Add shop and settings", text: "Place smaller buttons in the corners for Shop and Settings. Use ImageButtons with icons (a cart and a gear) plus a TextLabel underneath." },
      { name: "Make it mobile-safe", text: "Test at 375px width. The Play button should still be huge, the title should not overflow, and the corner buttons should not overlap the title." },
      { name: "Add a play sound", text: "When the Play button is clicked, play a short UI sound and fade the start screen out with TweenService before teleporting the player." },
    ],
    bodySections: [
      {
        heading: "Sizing for the youngest audience",
        body: "Obby players are often kids on phones, and they tap fast and imprecisely. The Play button has to be big - at least 200x80 logical pixels, ideally larger. Use Scale sizing so it scales with the screen, but set a minimum via UISizeConstraint so it never gets too small on a narrow phone. The corner buttons (Shop, Settings) should be at least 64x64 with a generous hit area. Font sizes: 48+ for the title, 32+ for the Play button text, 18+ for everything else. If you cannot read it on a 5-inch phone held at arm's length, it is too small.",
      },
      {
        heading: "Stage and best-time displays",
        body: "Obby progression is stage-by-stage, so the start screen has to show where the player is. Put 'Stage 12 / 50' (or just 'Stage 12' if there is no cap) below the Play button, large and readable. Show the best time for the current stage next to it: 'Best: 0:42'. Use a monospace font for the time so the digits do not shift as they change. If the player has not beaten the stage yet, show 'Best: --:--' instead of hiding the field. Pull these values from a DataStore on join and update them when the player completes a stage.",
      },
      {
        heading: "Shop and settings placement",
        body: "Shop and Settings go in the corners - usually top-right and top-left, as ImageButtons with a clear icon (cart for shop, gear for settings) and a small TextLabel underneath. Keep them at least 64x64 with UISizeConstraint minimums so they stay tappable. Do not put them in a hamburger menu - kids will not find them. If the shop is a key monetization path, make it slightly larger or add a notification badge when there is a new item. Settings should always be one tap away from the start screen so players can lower volume or turn off music before they start playing.",
      },
      {
        heading: "Transitions and feedback",
        body: "When the player taps Play, two things should happen: a UI sound confirms the tap, and the start screen fades out before the game loads. Use TweenService to animate the screen's Transparency from 0 to 1 over 0.3 seconds, then hide it. Do not teleport the player instantly on tap - the fade covers the loading time and feels polished. If the game has a stage select, the Play button can open a stage list first, with each stage as a large tappable card. Avoid nested menus more than two levels deep - young players get lost in deep menus.",
      },
    ],
    designTips: [
      "Use rounded fonts (GothamBold, FredokaOne) for a kid-friendly feel.",
      "Make the Play button impossible to miss - it is the only thing that matters on the screen.",
      "Add a UI sound on Play tap so kids get audio confirmation.",
      "Test at 375px width and on a tablet - obby players are almost all on mobile.",
    ],
    relatedTemplates: ["/templates/obby-start-screen", "/templates/main-menu", "/templates/loading-screen"],
  },
};

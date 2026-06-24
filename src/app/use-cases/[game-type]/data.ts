export const USE_CASE_SLUGS = ["simulator-hud", "fps-game-ui", "roleplay-menu"] as const;
export type UseCaseSlug = (typeof USE_CASE_SLUGS)[number];

export interface UseCaseData {
  slug: UseCaseSlug;
  gameType: string;
  h1: string;
  description: string;
  requirements: string[];
  steps: { name: string; text: string }[];
  relatedTemplates: string[];
}

export const USE_CASES: Record<UseCaseSlug, UseCaseData> = {
  "simulator-hud": {
    slug: "simulator-hud",
    gameType: "Simulator",
    h1: "Design the Perfect Simulator UI for Your Roblox Game",
    description:
      "A simulator HUD needs click counters, rebirth badges, pet counts, and currency labels — all readable on mobile while the player spams clicks.",
    requirements: [
      "Large, tappable buttons for clicking and rebirth",
      "Currency counters that update every click",
      "Pet / equipped item icons with compact layout",
      "Mobile-safe thumb zones",
      "Tweened pop numbers for feedback",
    ],
    steps: [
      { name: "Anchor the main click button", text: "Place a large button in a thumb-friendly zone, scaled relative to the screen." },
      { name: "Add currency labels", text: "Use TextLabels with UIListLayout so counters stack cleanly." },
      { name: "Build the rebirth panel", text: "Show current rebirth count and next reward threshold." },
      { name: "Wire the click event", text: "Fire a RemoteEvent and update the HUD locally for instant feedback." },
    ],
    relatedTemplates: ["/templates/simulator-hud", "/templates/shop-ui", "/templates/pet-shop"],
  },
  "fps-game-ui": {
    slug: "fps-game-ui",
    gameType: "FPS",
    h1: "Design the Perfect FPS UI for Your Roblox Game",
    description:
      "A first-person shooter UI is minimal and readable under pressure: ammo, health, armor, crosshair, and a kill feed.",
    requirements: [
      "Low-clutter corners for health and ammo",
      "Center crosshair that does not obstruct targets",
      "Kill feed with fade-out",
      "Hitmarker feedback",
      "Scales for 16:9 and ultrawide",
    ],
    steps: [
      { name: "Layout the HUD corners", text: "Place health bottom-left, ammo bottom-right, and minimap top-right." },
      { name: "Add the crosshair", text: "Use a small Frame or ImageLabel anchored to the screen center." },
      { name: "Build the ammo counter", text: "Show magazine and reserve counts with a monospace font." },
      { name: "Hook up weapon events", text: "Update ammo on fire and reload; flash low-ammo warning." },
    ],
    relatedTemplates: ["/templates/fps-hud", "/templates/health-bar"],
  },
  "roleplay-menu": {
    slug: "roleplay-menu",
    gameType: "Roleplay",
    h1: "Design the Perfect Roleplay UI for Your Roblox Game",
    description:
      "Roleplay games rely on character panels, dialogue boxes, shops, and job UIs. The layout should feel immersive and easy to navigate.",
    requirements: [
      "Character sheet with avatar preview",
      "Dialogue box with speaker portrait",
      "Inventory / backpack panel",
      "Job or faction selector",
      "Settings accessible from any menu",
    ],
    steps: [
      { name: "Create the main menu shell", text: "Use a Frame with UIListLayout tabs for Character, Inventory, and Jobs." },
      { name: "Build the dialogue panel", text: "Add a TextLabel for typewriter text and ImageLabel for the speaker." },
      { name: "Add the shop panel", text: "Reuse a UIGridLayout of item cards linked to purchase events." },
      { name: "Polish transitions", text: "Use TweenService for smooth open/close on menu state changes." },
    ],
    relatedTemplates: ["/templates/main-menu", "/templates/dialogue-system", "/templates/rpg-inventory"],
  },
};

/**
 * SOP-3L-02/03/04/06: 模板详情页深度内容数据
 *
 * 13 个模板（含 daily-rewards）的：
 * - howToUse: 300-500 字使用说明（去 AI 味，technical context）
 * - codeSteps: 3 步 Studio 接入代码（CodeBlock 用）
 * - faqs: 4-6 条 FAQ（FAQAccordion + FaqJsonLd 同源）
 * - internalLinks: 3 类内链（/editor + /blog + /compare，IA §6 锚文本）
 *
 * 英文文案经 english-marketing-calibrator 校准 + de-ai-review 去 AI 味。
 */

import type { FAQItem } from "@/lib/types";

export interface TemplateDetailData {
  slug: string;
  howToUse: string;
  codeSteps: { step: string; text: string }[];
  faqs: FAQItem[];
  internalLinks: { href: string; label: string }[];
}

const COMMON_CODE_STEPS = [
  { step: "Copy the Luau", text: "Open the template in the web editor and click Export. Choose LocalScript to copy the full client Luau to your clipboard." },
  { step: "Paste into StarterGui", text: "In Roblox Studio, right-click StarterGui in the Explorer, insert a LocalScript, and paste the copied Luau. Rename it to match the template." },
  { step: "Press Play to verify", text: "Click Play in Studio. The GUI should appear exactly as designed. Tweak any Size or Position values in the script if you want to adjust the layout." },
];

const COMMON_INTERNAL_LINKS = (slug: string) => [
  { href: `/editor?template=${slug}`, label: "Edit this template" },
  { href: "/compare/best-roblox-gui-makers", label: "Compare tools" },
  { href: "/guides/fix-gui-scaling", label: "Read the scaling guide" },
];

export const TEMPLATE_DETAILS: Record<string, TemplateDetailData> = {
  "rpg-inventory": {
    slug: "rpg-inventory",
    howToUse:
      "The RPG Inventory template drops into any game that needs item management. Paste the client Luau into a LocalScript under StarterGui and the inventory panel appears on screen, toggled by the Tab key. The layout uses a slot-based grid with UIGridLayout, so adding or removing item slots is a matter of changing the cell count. Each slot supports drag-and-drop via UIDragDetector, and item rarity is shown by a colored UIStroke border. To wire it to your game, replace the placeholder item table with your own item data and fire a RemoteEvent to the server when the player equips or drops an item. The server Luau stub shows how to validate equip requests and persist the inventory with DataStore. Test on mobile by switching to the phone preview in the editor - the slots reflow to fit the narrower screen because the layout uses Scale-based sizing.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the RPG Inventory template free?", answer: "Yes. The template is free to use on the Free plan. Export the Luau and paste it into StarterGui with no credit card required." },
      { question: "Does it include drag-and-drop?", answer: "Yes. Item slots use UIDragDetector so players can drag items between slots. The drag logic is in the client Luau and updates the inventory state locally before syncing to the server." },
      { question: "Can I use it on mobile?", answer: "Yes. The layout uses Scale-based sizing with UIGridLayout, so slots reflow to fit phone screens. Test it in the editor's mobile preview before exporting." },
      { question: "Does it persist inventory across sessions?", answer: "The server Luau stub includes a DataStore pattern for saving and loading inventory. Replace the stub with your own item IDs and call the save function when the player leaves or equips an item." },
      { question: "Can I sell the game I build with this template?", answer: "Yes. Anything you build with Roblox GUI Maker is yours to use in commercial Roblox games, including ones that earn Robux." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("rpg-inventory"),
  },
  "main-menu": {
    slug: "main-menu",
    howToUse:
      "The Main Menu template is the entry point for any Roblox game. Paste the client Luau into StarterGui and the menu appears with Play, Settings, and Store buttons. The layout uses a centered Frame with UIListLayout, so buttons stack vertically and stay aligned on any screen size. A subtle UIGradient runs across the background for depth. The Play button fires a RemoteEvent to the server to start the match - wire this to your own match-start logic. The Settings and Store buttons open their respective panels, which you can build out or link to your existing UI. The menu uses Scale-based sizing, so it looks right on phone, tablet, and desktop without manual adjustment. To customize, open the template in the editor, recolor the buttons to match your game's theme, and re-export the Luau.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Main Menu template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui, no payment required." },
      { question: "Does it work on mobile?", answer: "Yes. The menu uses Scale-based sizing with UIListLayout, so buttons stack and stay tappable on phone screens. The editor's mobile preview shows the layout before you export." },
      { question: "How do I wire the Play button to my game?", answer: "The Play button fires a RemoteEvent called StartMatch. On the server, listen for that event and run your match-start logic. The template includes a commented stub showing where to add your code." },
      { question: "Can I change the button colors?", answer: "Yes. Open the template in the editor, select each button, and change the BackgroundColor3 in the properties panel. Re-export the Luau and the new colors are baked in." },
      { question: "Does it include settings and store panels?", answer: "The menu has buttons for Settings and Store that fire their own RemoteEvents. The panels themselves are not included - wire them to your existing settings and shop UI." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("main-menu"),
  },
  "pet-shop": {
    slug: "pet-shop",
    howToUse:
      "The Pet Shop template is built for pet collection games and simulators. Paste the client Luau into StarterGui and a shop panel appears with six pet cards, each showing a pet icon, rarity badge, and Buy button. The layout uses UIGridLayout so cards arrange in a clean grid that reflows on mobile. Clicking Buy fires a RemoteEvent to the server, which validates the purchase and grants the pet - the server Luau stub shows the validation pattern with MarketplaceService or your own currency system. The coin balance header updates in real time when the player buys. To customize, replace the placeholder pet data with your own pet IDs, icons, and prices. The rarity colors are driven by a lookup table, so adding a new rarity tier is one line. Test the purchase flow in Studio by firing the RemoteEvent manually and confirming the server responds correctly.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Pet Shop template free?", answer: "No. The Pet Shop is a premium template. You can open it in the editor and preview the layout for free, but exporting the full Luau requires purchasing the template." },
      { question: "Does it include server-side purchase validation?", answer: "Yes. The server Luau stub shows how to validate a purchase request, check the player's currency balance, and grant the pet. Replace the stub with your own currency and pet-grant logic." },
      { question: "Can I add more pet cards?", answer: "Yes. The grid uses UIGridLayout, so adding cards is a matter of inserting more pet data entries. The layout reflows automatically to fit the new cards." },
      { question: "Does it work on mobile?", answer: "Yes. The grid reflows to a single column on phone screens, and the Buy buttons are sized for touch. Test in the editor's mobile preview before exporting." },
      { question: "Can I sell the game I build with this template?", answer: "Yes. Premium templates include a commercial license. You can use the Luau in any Roblox game, including ones that earn Robux." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("pet-shop"),
  },
  "shop-ui": {
    slug: "shop-ui",
    howToUse:
      "The Shop UI template is a general-purpose shop for Gamepasses and Developer Products. Paste the client Luau into StarterGui and a shop panel appears with category tabs (Gear, Power-ups, Skins) and an item grid. Each item card has a Buy button that calls MarketplaceService:PromptProductPurchase or PromptGamepassPurchase, depending on the item type. The server Luau stub shows how to handle purchase receipts and grant the item. The layout uses UIGridLayout with Scale-based sizing, so it works on mobile and desktop. To customize, replace the placeholder item data with your own product IDs and icons. The category tabs filter the grid by item type - add or remove tabs by editing the tab list in the client Luau. Test the purchase flow in Studio by clicking Buy and confirming the Roblox purchase prompt appears.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Shop UI template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui, no payment required." },
      { question: "Does it support Gamepasses and Developer Products?", answer: "Yes. The template handles both. Each item card specifies whether it is a Gamepass or Developer Product, and the Buy button calls the correct MarketplaceService method." },
      { question: "Can I add my own categories?", answer: "Yes. The category tabs are driven by a list in the client Luau. Add a new category name and assign items to it in the item data, and the tab appears automatically." },
      { question: "Does it work on mobile?", answer: "Yes. The grid uses Scale-based sizing and reflows on phone screens. The Buy buttons are sized for touch targets." },
      { question: "Do I need to write server code?", answer: "The template includes a server Luau stub for handling purchase receipts. You need to fill in the logic for granting the purchased item, but the receipt-handling pattern is provided." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("shop-ui"),
  },
  "leaderboard": {
    slug: "leaderboard",
    howToUse:
      "The Global Leaderboard template shows the top 10 players by score, auto-refreshing every minute. Paste the server Luau into ServerScriptService and the client Luau into StarterGui. The server uses OrderedDataStore to rank players and pushes the top 10 to all clients via a RemoteEvent. The client renders the rows with player name, avatar placeholder, and score. The layout uses UIListLayout so rows stack cleanly and scroll on mobile. To customize, replace the score key with your own stat (coins, wins, level). The auto-refresh interval is configurable in the server Luau. Note that OrderedDataStore has rate limits - the default 60-second refresh avoids throttling. Test in Studio by adding fake entries to the OrderedDataStore and confirming they appear in the correct order.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Leaderboard template free?", answer: "Yes. The template is free on the Free plan. Export both the client and server Luau and paste them into the correct locations." },
      { question: "Does it use OrderedDataStore?", answer: "Yes. The server Luau uses OrderedDataStore to rank players by score. Replace the score key with your own stat (coins, wins, level) and the leaderboard updates automatically." },
      { question: "How often does it refresh?", answer: "Every 60 seconds by default. You can change the interval in the server Luau, but keep it above 30 seconds to avoid OrderedDataStore rate limits." },
      { question: "Does it show player avatars?", answer: "The template includes avatar placeholder frames. To show real avatars, fetch the player's thumbnail via Players:GetUserThumbnailAsync and set it on the ImageLabel." },
      { question: "Can I show more than 10 players?", answer: "Yes. Change the row count in the client Luau and the server's top-N fetch. The layout uses UIListLayout so additional rows stack and scroll automatically." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("leaderboard"),
  },
  "health-bar": {
    slug: "health-bar",
    howToUse:
      "The Health Bar template tracks a Humanoid's health with a tweened fill animation. Paste the client Luau into StarterGui and the bar appears, bound to the local player's Humanoid. When health changes, the fill animates to the new ratio using TweenService, and a damage flash plays when the player takes a hit. Below 25% health, the bar pulses red to signal danger. The layout uses Scale-based sizing anchored to the bottom of the screen, so it stays in the same relative position on any device. To customize, change the fill color in the properties panel and re-export. The bar binds to Humanoid.HealthChanged, so it works with any damage system. Test in Studio by setting the Humanoid's health in the command bar and confirming the bar animates correctly.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Health Bar template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui." },
      { question: "Does it animate when health changes?", answer: "Yes. The fill uses TweenService to animate to the new health ratio. The animation takes 0.2 seconds, so damage feels responsive without snapping." },
      { question: "Does it show low-health warning?", answer: "Yes. Below 25% health, the bar pulses red using a TweenService loop. The pulse stops when health goes back above the threshold." },
      { question: "Can I bind it to a different Humanoid?", answer: "Yes. The client Luau binds to the local player's Humanoid by default. To track an NPC or enemy, change the Humanoid reference in the HealthChanged connection." },
      { question: "Does it work on mobile?", answer: "Yes. The bar uses Scale-based sizing anchored to the bottom of the screen, so it stays in the correct position on any device." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("health-bar"),
  },
  settings: {
    slug: "settings",
    howToUse:
      "The Settings Menu template gives players control over volume, fullscreen, and music. Paste the client Luau into StarterGui and a settings panel appears with sliders and toggles arranged in a UIListLayout. The master and SFX volume sliders bind to SoundService, so changes apply immediately. The music toggle mutes and unmutes the background music. The fullscreen toggle uses GameSettings. The layout uses Scale-based sizing, so the panel fits any screen. To customize, add your own settings rows (graphics quality, controls, language) by inserting new frames into the UIListLayout. The save pattern uses DataStore so settings persist across sessions - the server Luau stub shows how to save and load. Test in Studio by dragging the sliders and confirming the audio changes.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Settings Menu template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui." },
      { question: "Does it save settings across sessions?", answer: "Yes. The server Luau stub shows a DataStore pattern for saving and loading settings. Call the save function when the player leaves, and load on join." },
      { question: "Can I add my own settings rows?", answer: "Yes. The rows use UIListLayout, so adding a new setting is a matter of inserting a new Frame with a slider or toggle. The pattern is shown in the existing rows." },
      { question: "Do the volume sliders work immediately?", answer: "Yes. The sliders bind to SoundService, so dragging them changes the volume in real time. No server round-trip is needed." },
      { question: "Does it work on mobile?", answer: "Yes. The panel uses Scale-based sizing and the sliders are sized for touch. Test in the editor's mobile preview before exporting." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("settings"),
  },
  "loading-screen": {
    slug: "loading-screen",
    howToUse:
      "The Loading Screen template shows a progress bar and rotating gameplay tips while the game loads. Paste the client Luau into StarterGui and the loading screen appears on join, fading out when loading completes. The progress bar fills based on ContentProvider:PreloadAsync, so it reflects real asset loading. The tips rotate every 4 seconds using a simple loop. The layout uses Scale-based sizing with a full-screen Frame, so it covers any device. To customize, replace the placeholder tips with your own gameplay hints. The fade-out uses TweenService on the Frame's Transparency. To wire it to your game, call the loading screen's hide function when your game is ready. Test in Studio by preloading a few large assets and confirming the progress bar fills.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Loading Screen template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui." },
      { question: "Does the progress bar reflect real loading?", answer: "Yes. The bar fills based on ContentProvider:PreloadAsync, so it tracks actual asset loading. Pass your asset list to the preload function and the bar updates." },
      { question: "Can I add my own gameplay tips?", answer: "Yes. The tips are stored in a table in the client Luau. Replace the placeholder strings with your own hints and they rotate automatically." },
      { question: "Does it fade out when done?", answer: "Yes. The loading screen uses TweenService to fade the Frame's Transparency to 1, then hides it. Call the hide function when your game is ready to start." },
      { question: "Does it work on mobile?", answer: "Yes. The loading screen is a full-screen Frame with Scale-based sizing, so it covers any device completely." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("loading-screen"),
  },
  "fps-hud": {
    slug: "fps-hud",
    howToUse:
      "The FPS HUD template shows ammo, health, crosshair, and a kill feed for first-person shooters. Paste the client Luau into StarterGui and the HUD appears, with health bottom-left, ammo bottom-right, and the crosshair centered. The ammo counter updates when the player fires or reloads, and turns red below 25% magazine. The health bar tweens to the new ratio on damage. The crosshair is a small Frame anchored to the screen center. The kill feed is a UIListLayout that fades entries out after 4 seconds. The layout uses Scale-based sizing, so it works on 16:9 and ultrawide. To customize, change the crosshair color and size in the properties panel. Wire the ammo and health updates to your weapon and damage systems. Test in Studio by firing the update events manually and confirming the HUD responds.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the FPS HUD template free?", answer: "No. The FPS HUD is a premium template. You can open it in the editor and preview the layout for free, but exporting the full Luau requires purchasing the template." },
      { question: "Does it include a kill feed?", answer: "Yes. The kill feed is a UIListLayout that shows the last 5 kills. Each entry fades out after 4 seconds. Feed it kill data via a RemoteEvent and the entries appear automatically." },
      { question: "Does it show a crosshair?", answer: "Yes. The crosshair is a small Frame anchored to the exact screen center. You can change its color, size, and style (four lines or a single cross) in the editor." },
      { question: "Does it work on ultrawide?", answer: "Yes. The HUD uses Scale-based sizing, so it stays in the correct position on 16:9, 21:9, and 4:3 aspect ratios." },
      { question: "Can I sell the game I build with this template?", answer: "Yes. Premium templates include a commercial license. You can use the Luau in any Roblox game, including ones that earn Robux." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("fps-hud"),
  },
  "simulator-hud": {
    slug: "simulator-hud",
    howToUse:
      "The Simulator HUD template shows click counters, rebirth badges, pet counts, and currency for simulator games. Paste the client Luau into StarterGui and the HUD appears, with the click counter top-left, rebirth badge top-right, and pet strip along the bottom. The click counter updates optimistically on each tap - the local count increments immediately, and a RemoteEvent syncs to the server. The rebirth badge shows the current tier and pulses when the player can afford the next rebirth. The pet strip uses a horizontal ScrollingFrame with UIGridLayout. The layout uses Scale-based sizing, so it works on phone and desktop. To customize, change the counter colors and pet slot count. Wire the click and rebirth events to your own server logic. Test in Studio by clicking rapidly and confirming the counter updates without lag.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Simulator HUD template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui." },
      { question: "Does the click counter update instantly?", answer: "Yes. The counter updates optimistically on each tap, so there is no network lag. A RemoteEvent syncs to the server, which reconciles if needed." },
      { question: "Does it show a rebirth badge?", answer: "Yes. The rebirth badge shows the current tier and pulses when the player can afford the next rebirth. Wire it to your rebirth cost and currency logic." },
      { question: "Can I show equipped pets?", answer: "Yes. The pet strip is a horizontal ScrollingFrame with UIGridLayout. Add pet icons to the strip and they arrange automatically." },
      { question: "Does it work on mobile?", answer: "Yes. The HUD uses Scale-based sizing and the click button is sized for touch. Test in the editor's mobile preview before exporting." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("simulator-hud"),
  },
  "dialogue-system": {
    slug: "dialogue-system",
    howToUse:
      "The Dialogue System template shows NPC dialogue with typewriter text, speaker portrait, and branching choices. Paste the client Luau into StarterGui and a dialogue box appears at the bottom of the screen. The text appears one character at a time using a RunService loop, and players can click to skip the typewriter and reveal the full line. When the line finishes, branching choice buttons appear below the dialogue box. The layout uses Scale-based sizing, so the dialogue box fits any screen. To customize, replace the placeholder dialogue tree with your own lines and choices. The typewriter speed is configurable. Wire the choice clicks to your quest or story logic. Test in Studio by advancing through the dialogue and confirming the choices appear at the right time.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Dialogue System template free?", answer: "No. The Dialogue System is a premium template. You can open it in the editor and preview the layout for free, but exporting the full Luau requires purchasing the template." },
      { question: "Does it include a typewriter effect?", answer: "Yes. The text appears one character at a time using a RunService loop. Players can click to skip the typewriter and reveal the full line instantly." },
      { question: "Can I add branching choices?", answer: "Yes. The choices are driven by a dialogue tree table. Each line can have one or more choices, and each choice links to the next line or a quest event." },
      { question: "Does it show a speaker portrait?", answer: "Yes. The dialogue box includes an ImageLabel for the speaker portrait. Set the image to the NPC's portrait and it appears on the left of the dialogue box." },
      { question: "Can I sell the game I build with this template?", answer: "Yes. Premium templates include a commercial license. You can use the Luau in any Roblox game, including ones that earn Robux." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("dialogue-system"),
  },
  "obby-start-screen": {
    slug: "obby-start-screen",
    howToUse:
      "The Obby Start Screen template is the entry point for obstacle course games. Paste the client Luau into StarterGui and a start screen appears with a big Play button, rules panel, and shop link. The Play button fires a RemoteEvent to the server to teleport the player to the first stage. The layout uses Scale-based sizing with large, tappable buttons sized for mobile. The title uses a rounded font for a kid-friendly feel. To customize, change the title text and button colors. Wire the Play button to your stage-teleport logic. The best-time display shows the player's fastest clear time for the current stage, pulled from a DataStore. Test in Studio by clicking Play and confirming the teleport fires.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Obby Start Screen template free?", answer: "Yes. The template is free on the Free plan. Export the Luau and paste it into StarterGui." },
      { question: "Does it show best time?", answer: "Yes. The best-time display pulls the player's fastest clear time from a DataStore. Replace the stub with your own time-saving logic." },
      { question: "Are the buttons big enough for kids?", answer: "Yes. The Play button is at least 200x80 logical pixels, sized for imprecise taps. The layout uses Scale-based sizing so it stays proportional on any device." },
      { question: "Can I add a shop link?", answer: "Yes. The shop button fires a RemoteEvent. Wire it to your shop UI or a Gamepass purchase prompt." },
      { question: "Does it work on mobile?", answer: "Yes. The start screen is mobile-first, with large buttons and Scale-based sizing. Test in the editor's mobile preview before exporting." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("obby-start-screen"),
  },
  "daily-rewards": {
    slug: "daily-rewards",
    howToUse:
      "The Daily Rewards template gives players a reason to come back every day. Paste the server Luau into ServerScriptService and the client Luau into StarterGui. The server tracks each player's login streak and last claim time in a DataStore, and the client shows a claim button that enables every 24 hours. When the player claims, the server grants a reward based on the streak day (day 7 gives a bonus), plays a tweened reveal animation on the client, and disables the button until the next reset. The layout uses Scale-based sizing, so the rewards panel fits any screen. To customize, replace the reward table with your own currency or item rewards. The reset interval is configurable. Test in Studio by firing the claim event and confirming the streak increments and the button disables.",
    codeSteps: COMMON_CODE_STEPS,
    faqs: [
      { question: "Is the Daily Rewards template free?", answer: "Yes. The template is free on the Free plan. Export both the client and server Luau and paste them into the correct locations." },
      { question: "Does it track login streaks?", answer: "Yes. The server Luau tracks each player's streak in a DataStore. If the player claims two days in a row, the streak increments. If they miss a day, the streak resets to 1." },
      { question: "Does it persist across sessions?", answer: "Yes. The streak, last claim time, and claimed state are saved in a DataStore. The server loads the state on join and pushes it to the client." },
      { question: "Can I change the rewards?", answer: "Yes. The reward table is at the top of the server Luau. Replace the placeholder values with your own currency amounts or item IDs." },
      { question: "Does it work on mobile?", answer: "Yes. The rewards panel uses Scale-based sizing, so it fits any screen. The claim button is sized for touch." },
    ],
    internalLinks: COMMON_INTERNAL_LINKS("daily-rewards"),
  },
};

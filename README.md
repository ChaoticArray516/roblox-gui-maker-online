# Roblox GUI Maker

**Build Roblox GUIs in your browser — drag, drop, and export clean Luau.**

https://roblox-gui-maker.online

A full-stack web editor that lets Roblox developers compose `ScreenGui` layouts visually (no Studio required), generate UIs from natural-language prompts via AI, and export production-ready Luau (`Instance.new` code with Scale-based responsive sizing) that pastes straight into `StarterGui`.

> Unofficial third-party tool · Not affiliated with or endorsed by Roblox Corporation.

---

## Feature Overview

| Area | What it does |
|---|---|
| **Visual Editor** | Drag-and-drop canvas (Frame / TextLabel / TextButton / ImageLabel / ScrollingFrame / media & 3D containers), hierarchy tree, properties panel (Scale+Offset, anchors, Z-index, layout constraints), undo/redo, device preview (Desktop / Tablet / Mobile) |
| **AI Generation** | Prompt → GUI via OpenRouter (multi-model fallback); anonymous visitors get a Mock demo stream; logged-in Free users get their **first real generation free** then 50 credits/month; every generation is logged in `generations` for activation analytics |
| **Templates** | 13 ready-to-play templates with real business logic (MarketplaceService / DataStore / RemoteEvent Luau), scale-based so they don't break on mobile |
| **Export** | Client Luau / Server Luau / ModuleScript / Client+Server bundle (RemoteEvent wiring) / project JSON / ZIP bundle with README — all readable, editable `Instance.new` code (not a black box) |
| **Cloud Projects** | Supabase-backed save (RLS-scoped), draft auto-recovery (sessionStorage), `?project=` deep-link restore, auto-save on generation, `/dashboard/projects` manager |
| **Auth & Billing** | Supabase Auth (email + Google/GitHub OAuth) with safe `?next=` redirect chain; Creem subscriptions (Free / Pro $9.99 mo) with webhook-driven plan sync and credit RPCs |
| **Content & SEO** | 20+ content pages (blog / guides / use-cases / docs / compare / FAQ), 16 JSON-LD components, per-page OG/Twitter cards, sitemap, `robots.txt` with AI-crawler policy, SSG/ISR hybrid rendering |

## Tech Stack

- **Framework**: Next.js 16.2.9 (App Router) + React 19 + TypeScript strict
- **Styling**: Tailwind CSS v4 (`@theme inline` tokens) — no hardcoded colors
- **Data**: Supabase (Postgres + Auth + RLS + atomic credit RPCs)
- **Payments**: Creem (`@creem_io/nextjs`), Moderation pre-check on AI prompts
- **AI**: OpenRouter streaming (SSE), server-side settle-on-completion billing
- **Editor internals**: custom element tree + snapshot undo/redo, `@dnd-kit`, CodeMirror 6 (Luau preview)
- **Hosting**: Vercel

## Getting Started

Requirements: Node ≥ 20, pnpm.

```bash
pnpm install
cp .env.local.example .env.local   # fill in real values (see below)
pnpm dev                           # http://localhost:3000
```

### Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin (OAuth redirect building) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase browser client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only privileged ops (credit RPCs, generation logging) — **never expose** |
| `OPENROUTER_API_KEY` | AI generation; absent → Mock demo streams |
| `CREEM_API_KEY` / `CREEM_WEBHOOK_SECRET` | Billing; `creem_test_` prefix auto-selects sandbox |
| `CREEM_PRODUCT_*` | Pro monthly + paid template product IDs |
| `NEXT_PUBLIC_GA_ID` | GA4 (optional) |

**Real keys must never be committed** — `.gitignore` blocks `.env*` (only `.env.local.example` is tracked). On Vercel, set the same names in Project Settings → Environment Variables.

### Database

Schema lives in `supabase/migrations/` — apply via Supabase Dashboard → SQL Editor, in order:

1. `0001_init.sql` — profiles / subscriptions / credits_logs / projects / purchased_templates + atomic `deduct_credit` / `add_credits` RPCs + registration trigger
2. `0002_generations.sql` — AI generation log (activation analytics + first-generation-free claim via partial unique index + refund audit)

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` / `pnpm type-check` | ESLint / `tsc --noEmit` |
| `pnpm rendering-audit` | Rendering constraint audit (SSG boundaries, `<Link>` usage, ad containers) |
| `pnpm content-check` | Content quality checks for blog/guides data files |
| `pnpm faq-jsonld` | Rebuild FAQ JSON-LD from source data (tsx export + python strict build) |
| `pnpm deploy` | Vercel deploy helper |

## Architecture Notes

- **Rendering strategy is audited**: marketing pages are static (`○`), template & use-case detail pages are ISR, `/editor` is a deliberate CSR island (`dynamic(ssr: false)`) behind an SSR shell with JSON-LD. `pnpm rendering-audit` enforces the boundaries.
- **Credit billing settles only after the generation stream completes** — cancel/disconnect means no charge (see `src/app/api/ai/generate/route.ts`; refund endpoint for parse failures: `/api/ai/generate/refund`).
- **First generation is free** for logged-in Free users, claimed via a partial unique index on `generations(user_id) where is_free_first` — concurrency-safe by design.
- **RLS everywhere user-facing**: projects and profiles are row-scoped; privileged writes go through the service-role client server-side only.
- This repo tracks the **Next.js 16 docs in `node_modules/next/dist/docs/`** rather than training-data assumptions — APIs here (metadata merging, proxy conventions) differ from older Next versions.

## Deployment

Deployed on Vercel (`roblox-gui-maker.online`). Push to `main` or use `pnpm deploy`. All environment variables must be present in the Vercel project; the Supabase redirect allowlist must include the production origin + `/auth/callback`.

## License & Attribution

All rights reserved. "Roblox" is a registered trademark of Roblox Corporation; this project is an independent tool and is not affiliated with, endorsed by, or sponsored by Roblox Corporation.
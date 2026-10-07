import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FigmaToRobloxJsonLd, buildPageOpenGraph } from "@/components/seo";
import { OG_PAGES } from "@/lib/og-pages";
import { SUPPORT_EMAIL } from "@/lib/site-config";

const OG = OG_PAGES["/figma-to-roblox"];

export const metadata: Metadata = {
  title: OG.title,
  description: OG.description,
  alternates: { canonical: "/figma-to-roblox" },
  ...buildPageOpenGraph({ url: "/figma-to-roblox", ...OG }), // SOP-3W-02
};

const WAITLIST_EMAIL = SUPPORT_EMAIL;
const WAITLIST_SUBJECT = "Notify me when the Figma to Roblox converter launches";

const PAIN_POINTS = [
  "Manually exporting Figma layers as PNGs and re-uploading to Roblox is slow.",
  "Copying Asset IDs and recreating layouts in Studio causes drift from the design.",
  "Scale/Offset math is easy to get wrong when moving from a design tool to Roblox.",
];

const PLANNED_STEPS = [
  {
    title: "Upload your Figma design",
    body: "Paste a public Figma file URL or connect your Figma account. We read frames, components, and image layers.",
  },
  {
    title: "Auto-convert & upload assets",
    body: "Frames become ScreenGui/Frame instances, text becomes TextLabel/TextButton, and images are uploaded to your Roblox library.",
  },
  {
    title: "Import via Studio plugin",
    body: "Once the Roblox GUI Maker Studio plugin is live, pick the converted file and drop the UI into StarterGui in one click.",
  },
];

export default function FigmaToRobloxPage() {
  return (
    <>
      <head>
        <FigmaToRobloxJsonLd />
      </head>
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-24">
        <header className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-accent">
            Coming soon
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text sm:text-5xl">
            Convert Figma to Roblox Studio UI in One Click
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-text-muted">
            The converter is not yet available. Join the waitlist to be notified
            when automatic Figma layer-to-Roblox-GUI mapping, asset upload, and
            Studio plugin import go live.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent(WAITLIST_SUBJECT)}`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Join Converter Waitlist
            </a>
            <Link
              href="/editor"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Try in Editor
            </Link>
          </div>
          <p className="mx-auto mt-4 max-w-xl text-xs text-text-muted">
            Not affiliated with Figma or Roblox Corporation. The converter and
            Studio plugin are third-party tools under development.
          </p>
        </header>

        {/* Pain points */}
        <section className="rounded-2xl border border-glass-border bg-surface p-8">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Why Figma → Studio usually hurts
          </h2>
          <ul className="mt-6 flex flex-col gap-3 text-text-muted">
            {PAIN_POINTS.map((p) => (
              <li key={p}>• {p}</li>
            ))}
          </ul>
        </section>

        {/* Planned steps */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            Planned workflow
          </h2>
          <ol className="mt-6 flex flex-col gap-4">
            {PLANNED_STEPS.map((step, i) => (
              <li
                key={step.title}
                className="flex gap-4 rounded-2xl border border-glass-border bg-surface p-5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-raised font-semibold text-cyan-accent">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold text-text">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-sm text-text-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Demo placeholder */}
        <section className="rounded-2xl border border-glass-border bg-surface p-8 text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Interactive demo coming soon
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-text-muted">
            Upload a Figma file and watch the converter build the Roblox GUI in
            real time. For now, open the editor to build from scratch or use a
            template.
          </p>
          <Link
            href="/editor"
            className={cn(buttonVariants({ size: "lg" }), "mt-6")}
          >
            Open the Editor
          </Link>
        </section>
      </main>
    </>
  );
}

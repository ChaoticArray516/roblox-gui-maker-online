import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PluginJsonLd } from "@/components/seo";

export const metadata: Metadata = {
  title: "Roblox Studio Plugin — Join the Waitlist",
  description:
    "The Roblox GUI Maker Studio plugin is coming soon. Join the waitlist to get notified when it lands on the Roblox Creator Marketplace.",
  alternates: { canonical: "/plugin" },
};

const WAITLIST_EMAIL = "chaoticarray.rf516@gmail.com";
const WAITLIST_SUBJECT = "Notify me when the Roblox GUI Maker Studio plugin launches";

const PLANNED_FEATURES = [
  "One-click import of any saved project straight into StarterGui",
  "Two-way sync between the web editor and Roblox Studio",
  "Generated Luau lands as real instances — Frames, TextButtons, layouts",
];

const HOW_IT_WILL_WORK = [
  {
    title: "Install from the Creator Marketplace",
    body: "Once approved, open the plugin page on the Roblox Creator Marketplace and click Install. It will appear under the Plugins tab in Studio.",
  },
  {
    title: "Enable HttpService",
    body: "In Game Settings → Security, turn on “Allow HTTP Requests” so the plugin can fetch your saved projects.",
  },
  {
    title: "Sign in and import",
    body: "Click the plugin toolbar button, sign in with your Roblox GUI Maker account, pick a project, and import it in one click.",
  },
];

export default function PluginPage() {
  return (
    <>
      <head>
        <PluginJsonLd />
      </head>
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-12 px-6 py-24">
        <header className="flex flex-col gap-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-accent">
            Coming soon
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-text">
            Join the Waitlist for the Roblox GUI Maker Studio Plugin
          </h1>
          <p className="text-lg text-text-muted">
            The plugin is not yet available. Add your email to be the first to
            know when it lands on the Roblox Creator Marketplace.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={`mailto:${WAITLIST_EMAIL}?subject=${encodeURIComponent(WAITLIST_SUBJECT)}`}
              className={cn(buttonVariants({ size: "lg" }))}
            >
              Join Plugin Waitlist
            </a>
            <Link
              href="/editor"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }))}
            >
              Open the Web Editor
            </Link>
          </div>
          <p className="text-xs text-text-muted">
            Not affiliated with Roblox Corporation. The plugin is a third-party
            tool and will be listed on the Roblox Creator Marketplace once it
            passes review.
          </p>
        </header>

        {/* Features overview */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            What the plugin will do
          </h2>
          <ul className="mt-4 flex flex-col gap-2 text-text-muted">
            {PLANNED_FEATURES.map((f) => (
              <li key={f}>• {f}</li>
            ))}
          </ul>
        </section>

        {/* Future installation guide */}
        <section>
          <h2 className="font-display text-2xl font-semibold tracking-tight text-text">
            How it will work
          </h2>
          <ol className="mt-6 flex flex-col gap-4">
            {HOW_IT_WILL_WORK.map((step, i) => (
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
      </main>
    </>
  );
}
import type { Metadata } from "next";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 gap-8 px-6 py-12">
      <aside className="hidden w-48 shrink-0 md:block">
        <DashboardNav />
      </aside>
      <div className="flex-1">{children}</div>
    </main>
  );
}

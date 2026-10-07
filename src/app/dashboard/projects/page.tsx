"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

interface ProjectRow {
  id: string;
  name: string;
  slug: string | null;
  updated_at: string;
}

export default function DashboardProjectsPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const load = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("projects")
      .select("id, name, slug, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setProjects((data as ProjectRow[] | null) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleRename(id: string) {
    if (!editName.trim()) return;
    const supabase = createClient();
    await supabase.from("projects").update({ name: editName.trim() }).eq("id", id);
    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("projects").delete().eq("id", id);
    load();
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-text">
            Projects
          </h1>
          <p className="text-text-muted">Saved GUI projects from the editor.</p>
        </div>
        <Link href="/editor" className={cn(buttonVariants())}>
          New project
        </Link>
      </header>

      {loading ? (
        <p className="text-text-muted">Loading…</p>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-glass-border bg-surface p-8 text-center">
          <p className="text-text-muted">
            No projects yet. Open the editor and save your first GUI.
          </p>
          <Link href="/editor" className={cn(buttonVariants({ size: "lg" }), "mt-4")}>
            Open Editor
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-glass-border bg-surface p-4"
            >
              {editingId === p.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-glass-border bg-surface-raised px-3 py-2 text-sm text-text"
                    autoFocus
                  />
                  <button
                    onClick={() => handleRename(p.id)}
                    className={cn(buttonVariants({ size: "sm" }))}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  {/* SAVE-02: 原死链 /editor/[id]（路由不存在）→ /editor?project=<id>；整行可点 */}
                  <Link
                    href={`/editor?project=${p.id}`}
                    className="flex flex-1 flex-col rounded-lg px-1 py-0.5 transition-colors hover:bg-surface-raised"
                  >
                    <span className="font-medium text-text hover:underline">
                      {p.name}
                    </span>
                    <span className="text-xs text-text-muted">
                      Updated {new Date(p.updated_at).toLocaleDateString()}
                    </span>
                  </Link>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingId(p.id);
                        setEditName(p.name);
                      }}
                      className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                    >
                      Rename
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

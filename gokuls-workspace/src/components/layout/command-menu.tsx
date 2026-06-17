"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, CornerDownLeft, FileText } from "lucide-react";
import { PRIMARY_NAV, SECONDARY_NAV } from "./nav-items";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function CommandMenu() {
  const router = useRouter();
  const { tasks, isAdmin } = useStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const nav = [...PRIMARY_NAV, ...SECONDARY_NAV].filter((n) => !n.adminOnly || isAdmin);

  const results = useMemo(() => {
    const q = query.toLowerCase().trim();
    const navMatches = nav.filter((n) => n.label.toLowerCase().includes(q));
    const taskMatches = q
      ? tasks
          .filter(
            (t) =>
              t.title.toLowerCase().includes(q) ||
              t.reference.toLowerCase().includes(q) ||
              t.tags.some((tag) => tag.includes(q))
          )
          .slice(0, 6)
      : [];
    return { navMatches, taskMatches };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, tasks, isAdmin]);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-xl animate-fade-in overflow-hidden rounded-xl border border-border bg-popover shadow-soft-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks or jump to a page…"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
            ESC
          </kbd>
        </div>

        <div className="max-h-80 overflow-y-auto scrollbar-thin p-2">
          {results.taskMatches.length > 0 && (
            <div className="mb-1">
              <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Tasks</p>
              {results.taskMatches.map((t) => (
                <button
                  key={t.id}
                  onClick={() => go(`/tasks/${t.id}`)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
                >
                  <FileText className="size-4 text-muted-foreground" />
                  <span className="font-mono text-[11px] text-muted-foreground">{t.reference}</span>
                  <span className="truncate">{t.title}</span>
                </button>
              ))}
            </div>
          )}

          <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Navigate</p>
          {results.navMatches.map((n) => (
            <button
              key={n.href}
              onClick={() => go(n.href)}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
            >
              <n.icon className="size-4 text-muted-foreground" />
              {n.label}
            </button>
          ))}

          {results.navMatches.length === 0 && results.taskMatches.length === 0 && (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">No results.</p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <CornerDownLeft className="size-3" /> to select
          </span>
          <span className={cn("font-mono")}>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}

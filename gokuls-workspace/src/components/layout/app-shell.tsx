"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, Plus, Search } from "lucide-react";
import { SidebarNav } from "./sidebar";
import { ThemeToggle } from "./theme-toggle";
import { NotificationCenter } from "./notification-center";
import { CommandMenu } from "./command-menu";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <CommandMenu />

      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-card/40 p-4 lg:block">
        <SidebarNav />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 animate-fade-in border-r border-border bg-card p-4">
            <div className="mb-2 flex justify-end">
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="size-4" />
              </Button>
            </div>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </Button>

          <button
            onClick={() => {
              window.dispatchEvent(
                new KeyboardEvent("keydown", { key: "k", metaKey: true })
              );
            }}
            className="hidden items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent sm:flex"
          >
            <Search className="size-4" />
            <span>Search…</span>
            <kbd className="ml-6 rounded border border-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1">
            <Link
              href="/tasks/new"
              className={cn(buttonVariants({ size: "sm" }), "hidden sm:inline-flex")}
            >
              <Plus className="size-4" /> New Request
            </Link>
            <NotificationCenter />
            <ThemeToggle />
          </div>
        </header>

        <main className="animate-fade-in p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

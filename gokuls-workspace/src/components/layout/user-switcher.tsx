"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Shield } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * Demo-only role switcher. In production this is replaced by the
 * Google SSO session (Supabase Auth) and the signed-in user.
 */
export function UserSwitcher() {
  const { users, currentUser, setCurrentUser } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-left transition-colors hover:bg-accent"
      >
        <Avatar name={currentUser.name} color={currentUser.avatarColor} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{currentUser.name}</p>
          <p className="truncate text-[10px] capitalize text-muted-foreground">
            {currentUser.role === "admin" ? "Designer · Admin" : currentUser.department}
          </p>
        </div>
        <ChevronsUpDown className="size-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute bottom-full z-50 mb-1 w-full animate-fade-in rounded-lg border border-border bg-popover p-1 shadow-soft-lg">
          <p className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            Switch user (demo)
          </p>
          {users.map((u) => (
            <button
              key={u.id}
              onMouseDown={() => {
                setCurrentUser(u.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors hover:bg-accent"
            >
              <Avatar name={u.name} color={u.avatarColor} size="sm" />
              <span className="min-w-0 flex-1 truncate">{u.name}</span>
              {u.role === "admin" && <Shield className="size-3 text-primary" />}
              {u.id === currentUser.id && <Check className="size-3.5 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

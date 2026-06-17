"use client";

import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}

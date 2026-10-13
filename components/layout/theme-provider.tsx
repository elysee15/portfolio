"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import type { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Writes `data-theme` on `<html>` before first paint, so dark mode never
 * flashes. `eb-theme` is the key the design prototype already uses.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemeProvider disableTransitionOnChange storageKey="eb-theme">
      {children}
    </NextThemeProvider>
  );
}

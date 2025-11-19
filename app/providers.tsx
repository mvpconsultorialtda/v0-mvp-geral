"use client";

import { AppProvider } from "@/providers/AppProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AppProvider>{children}</AppProvider>
    </ThemeProvider>
  );
}

"use client";

import { AppProvider } from './AppProvider';
import { ThemeProvider } from '@/components/providers/theme-provider';

/**
 * Componente central que envolve a aplicação com todos os provedores de contexto necessários.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* AppProvider agora gerencia autenticação e permissões em um único local */}
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  );
}

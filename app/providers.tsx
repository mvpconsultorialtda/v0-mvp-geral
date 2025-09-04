'use client';

import { AuthProvider } from '@/src/components/auth/AuthProvider';
import { AbilityProvider } from '@/src/modules/access-control/AbilityProvider';
import { ThemeProvider } from '@/src/components/theme-provider';

/**
 * Componente central que envolve a aplicação com todos os provedores de contexto necessários.
 * A ordem dos provedores é importante: AuthProvider deve vir antes de AbilityProvider.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        {/* AbilityProvider depende do AuthProvider, então ele deve vir dentro dele */}
        <AbilityProvider>
          {children}
        </AbilityProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

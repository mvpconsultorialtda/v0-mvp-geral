'use client';

import { AuthProvider, useAuth } from "@/src/components/auth/AuthProvider";
import { Header } from "@/src/components/layout/header";
import { AbilityProvider } from "@/src/modules/access-control/AbilityProvider";
import { ReactNode } from "react";

// Componente intermediário para garantir que a autenticação está pronta
function AppContent({ children }: { children: ReactNode }) {
  const { isReady } = useAuth();

  // Não renderiza nada até que o estado de autenticação seja verificado.
  // Isso evita que componentes filhos tentem usar contextos (como o de habilidade)
  // antes que eles estejam prontos, especialmente durante o build estático.
  if (!isReady) {
    return null; // Ou um componente de loading global
  }

  return (
    (<AbilityProvider>
      <Header />
      {children}
    </AbilityProvider>)
  );
}

// Componente principal que agrupa todos os provedores
export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AppContent>{children}</AppContent>
    </AuthProvider>
  );
}

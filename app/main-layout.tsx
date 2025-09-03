'use client'

import { useAuth } from "@/components/auth-provider";
import { Header } from "@/components/layout/header";
import { Toaster } from "@/components/ui/toaster";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";
import { AbilityContext } from "@/src/modules/access-control/AbilityContext";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  // Define as habilidades para o usuário atual.
  // A função lida com o caso de o usuário ser nulo.
  const ability = defineAbilitiesFor(user);

  return (
    // Disponibiliza as habilidades para todos os componentes filhos
    // através do Provedor de Contexto do CASL.
    <AbilityContext.Provider value={ability}>
      {user && <Header />}
      <main>{children}</main>
      <Toaster />
    </AbilityContext.Provider>
  );
}

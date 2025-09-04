'use client';

import { useAuth } from "@/src/components/auth/AuthProvider";
import { ReactNode } from "react";
import { AbilityContext } from "./AbilityContext";
import { defineAbilitiesFor } from "./ability";

/**
 * Provedor que constrói e fornece o objeto de habilidade para a aplicação.
 * Ele usa o usuário autenticado e seu status de admin para determinar as permissões.
 */
export function AbilityProvider({ children }: { children: ReactNode }) {
  // Consome o usuário e o status de admin do AuthProvider
  const { user, isAdmin } = useAuth();
  
  // Constrói o objeto de habilidade com base no usuário e seu status de admin
  const ability = defineAbilitiesFor(user, isAdmin);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { ReactNode } from "react";
import { AbilityContext } from "./AbilityContext";
import { defineAbilitiesFor } from "./ability";

/**
 * Provedor que constrói e fornece o objeto de habilidade para a aplicação.
 * Ele usa o usuário autenticado para determinar as permissões.
 */
export function AbilityProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // Constrói o objeto de habilidade com base no usuário atual
  const ability = defineAbilitiesFor(user);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

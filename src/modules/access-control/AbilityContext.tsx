import { createContext, useContext } from 'react';
import { AppAbility } from './ability'; // Importa o tipo da nossa habilidade

// Cria um Contexto React para as habilidades. 
// O valor padrão é um objeto de habilidade vazio, que não permite nada.
export const AbilityContext = createContext<AppAbility>(null!);

// Hook customizado para consumir o contexto de habilidade de forma fácil.
// Em vez de usar `useContext(AbilityContext)` em todo lugar, usamos `useAbility()`.
export function useAbility() {
  const context = useContext(AbilityContext);
  if (!context) {
    throw new Error('useAbility must be used within an AbilityProvider');
  }
  return context;
}

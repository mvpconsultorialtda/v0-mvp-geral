"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { defineAbilitiesFor, AppAbility } from '@/modules/access-control/ability';
import { Spinner } from '@/components/ui/spinner';

interface AppContextType {
  user: User | null;
  ability: AppAbility;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Função para sincronizar o cookie de sessão com o servidor
async function syncSessionCookie(user: User | null) {
  if (user) {
    const idToken = await user.getIdToken();
    await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });
  } else {
    // Se não há usuário, chama a rota de logout para limpar o cookie
    await fetch('/api/auth/logout', {
      method: 'POST',
    });
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ability, setAbility] = useState<AppAbility>(defineAbilitiesFor(null)); // Habilidade inicial de convidado
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      // Sincroniza o cookie de sessão a cada mudança de token/usuário
      await syncSessionCookie(firebaseUser);

      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const userIsAdmin = !!tokenResult.claims.admin;
        
        const permissionUser = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          isAdmin: userIsAdmin,
        };

        setUser(firebaseUser);
        setAbility(defineAbilitiesFor(permissionUser));
      } else {
        setUser(null);
        setAbility(defineAbilitiesFor(null));
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (authLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <AppContext.Provider value={{ user, ability: ability!, authLoading }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

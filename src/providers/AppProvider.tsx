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

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ability, setAbility] = useState<AppAbility>(defineAbilitiesFor(null)); // Habilidade inicial de convidado
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const tokenResult = await firebaseUser.getIdTokenResult();
        const userIsAdmin = !!tokenResult.claims.admin;
        
        // O objeto do usuário a ser passado para as habilidades
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

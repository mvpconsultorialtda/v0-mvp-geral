"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase-client';
import { defineAbilitiesFor, AppAbility } from '@/src/modules/access-control/ability';
import { Spinner } from '@/src/components/ui/spinner';

interface AppContextType {
  user: User | null;
  isAdmin: boolean;
  ability: AppAbility | null;
  authLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [ability, setAbility] = useState<AppAbility | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // FOR DEVELOPMENT ONLY: Force admin status for a specific user.
        // In production, this should be handled by Firebase custom claims.
        const isDevAdmin = firebaseUser.email === 'test@test.com';
        const tokenResult = await firebaseUser.getIdTokenResult();
        const userIsAdmin = !!tokenResult.claims.admin || isDevAdmin;
        
        setUser(firebaseUser);
        setIsAdmin(userIsAdmin);
        setAbility(defineAbilitiesFor(firebaseUser, userIsAdmin));
      } else {
        setUser(null);
        setIsAdmin(false);
        setAbility(defineAbilitiesFor(null, false));
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
    <AppContext.Provider value={{ user, isAdmin, ability, authLoading }}>
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

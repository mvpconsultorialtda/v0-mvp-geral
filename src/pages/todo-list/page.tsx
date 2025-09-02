"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

// This is a temporary version of the page, focused on protecting the route
// and showing the authentication state. The "todos" logic will be
// re-implemented in the full Phase 3.

export default function TodoListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    // The AuthProvider already shows a loading state, but we can have one here too
    // to prevent any content flash.
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center p-8 border-dashed border-2 rounded-lg">
          <h2 className="text-xl font-semibold">Em construção!</h2>
          <p className="text-muted-foreground mt-2">
            A funcionalidade de listas de tarefas está sendo reconstruída para
            suportar múltiplos usuários.
          </p>
        </div>
      </div>
    </div>
  );
}

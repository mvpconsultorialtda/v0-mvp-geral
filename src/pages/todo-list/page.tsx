"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// Esta é uma versão temporária da página, focada em proteger a rota
// e mostrar o estado de autenticação. A lógica de "todos" será
// re-implementada na Fase 3 completa.

export default function TodoListPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (loading || !user) {
    // O AuthProvider já mostra um loading, mas podemos ter um aqui também
    // para evitar qualquer flash de conteúdo.
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Verificando autenticação...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Minhas Listas de Tarefas</h1>
            <p className="text-muted-foreground">
              Bem-vindo, {user.email}!
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </header>

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

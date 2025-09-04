'use client';

import Link from "next/link";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { useAbility } from "@/src/modules/access-control/AbilityContext";
import { ReactNode } from "react";

// Componente reutilizável para um card de módulo
// Ele verifica a permissão antes de se renderizar.
type ModuleCardProps = {
  moduleName: string;
  description: string;
  href: string;
  subject: string; // O "assunto" que o CASL usará para verificar a permissão
  children: ReactNode;
};

function ModuleCard({ moduleName, description, href, subject, children }: ModuleCardProps) {
  const ability = useAbility();

  // Se o usuário não tiver permissão para 'access' (acessar) o 'subject' (assunto/módulo),
  // o componente retorna null e não renderiza nada.
  if (ability.cannot('access', subject as any)) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-2">{moduleName}</h2>
      <p className="text-muted-foreground mb-4">{description}</p>
      <Button asChild className="w-full">
        <Link href={href}>{children}</Link>
      </Button>
    </Card>
  );
}

// Página principal que atua como um hub de módulos
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Aplicação React Modular</h1>
          <p className="text-muted-foreground text-lg">Uma aplicação modular com componentes e páginas reutilizáveis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cada módulo agora é um componente que sabe se deve ser exibido */}
          <ModuleCard
            moduleName="Removedor de Fundo"
            description="Remova fundos de imagens usando tecnologia de IA"
            href="/background-remover"
            subject="BackgroundRemover" // Corresponde à regra em ability.ts
          >
            Abrir Removedor de Fundo
          </ModuleCard>

          <ModuleCard
            moduleName="Lista de Tarefas"
            description="Organize suas tarefas com categorias, prioridades e filtros"
            href="/todo-list"
            subject="TodoList" // Corresponde à regra em ability.ts
          >
            Abrir Lista de Tarefas
          </ModuleCard>

          {/* O card "Em Breve" pode ser mantido como está ou também virar um ModuleCard 
              com uma regra específica se necessário, mas por enquanto fica simples. */}
          <Card className="p-6 opacity-50">
            <h2 className="text-xl font-semibold mb-2">Em Breve</h2>
            <p className="text-muted-foreground mb-4">Mais módulos serão adicionados aqui</p>
            <Button disabled className="w-full">
              Em Breve
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

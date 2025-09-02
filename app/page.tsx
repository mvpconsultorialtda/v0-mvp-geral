import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Aplicação React Modular</h1>
          <p className="text-muted-foreground text-lg">Uma aplicação modular com componentes e páginas reutilizáveis</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Removedor de Fundo</h2>
            <p className="text-muted-foreground mb-4">Remova fundos de imagens usando tecnologia de IA</p>
            <Button asChild className="w-full">
              <Link href="/background-remover">Abrir Removedor de Fundo</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Lista de Tarefas</h2>
            <p className="text-muted-foreground mb-4">Organize suas tarefas com categorias, prioridades e filtros</p>
            <Button asChild className="w-full">
              <Link href="/todo-list">Abrir Lista de Tarefas</Link>
            </Button>
          </Card>

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
  )
}

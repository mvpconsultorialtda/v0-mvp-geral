import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">Modular React App</h1>
          <p className="text-muted-foreground text-lg">A modular application with reusable components and pages</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Background Remover</h2>
            <p className="text-muted-foreground mb-4">Remove backgrounds from images using AI technology</p>
            <Button asChild className="w-full">
              <Link href="/background-remover">Open Background Remover</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-2">Todo List</h2>
            <p className="text-muted-foreground mb-4">Organize your tasks with categories, priorities, and filters</p>
            <Button asChild className="w-full">
              <Link href="/todo-list">Open Todo List</Link>
            </Button>
          </Card>

          <Card className="p-6 opacity-50">
            <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
            <p className="text-muted-foreground mb-4">More modules will be added here</p>
            <Button disabled className="w-full">
              Coming Soon
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

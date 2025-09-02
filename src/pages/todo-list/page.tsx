"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, LayoutGrid, List, FileDown, FileUp, Sun, Moon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { TodoListCore } from "@/modules/todo-list"
import { TodoItem } from "@/modules/todo-list/components/TodoItem"
import { TodoForm } from "@/modules/todo-list/components/TodoForm"
import { TodoFilters } from "@/modules/todo-list/components/TodoFilters"
import type { Todo, TodoFilter } from "@/modules/todo-list/types"

const todoListCore = TodoListCore.getInstance()

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<TodoFilter>({ status: "all" })
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const { toast } = useToast()

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      await todoListCore.refreshFromFile()
      setTodos(todoListCore.getTodos())
      setCategories(todoListCore.getCategories())
      setIsLoading(false)
    }
    init()
  }, [])

  const filteredTodos = useMemo(() => {
    return todoListCore.getTodos(filter)
  }, [todos, filter])

  const refreshTodos = () => {
    setTodos(todoListCore.getTodos(filter))
    setCategories(todoListCore.getCategories())
  }

  const handleAddTodo = async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    await todoListCore.addTodo(todoData)
    refreshTodos()
    setIsFormVisible(false)
    toast({
      title: "Tarefa Adicionada!",
      description: `A tarefa "${todoData.title}" foi criada com sucesso.`,
    })
  }

  const handleUpdateTodo = async (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    if (!editingTodo) return
    await todoListCore.updateTodo(editingTodo.id, todoData)
    refreshTodos()
    setEditingTodo(null)
    setIsFormVisible(false)
    toast({
      title: "Tarefa Atualizada!",
      description: `A tarefa "${todoData.title}" foi atualizada.`,
    })
  }

  const handleDeleteTodo = async (id: string) => {
    const todo = todoListCore.getTodoById(id)
    if (todo && confirm(`Tem certeza que deseja remover a tarefa "${todo.title}"?`)) {
      await todoListCore.deleteTodo(id)
      refreshTodos()
      toast({
        title: "Tarefa Removida",
        variant: "destructive",
      })
    }
  }

  const handleStatusChange = async (id: string, status: "pending" | "in-progress" | "completed") => {
    await todoListCore.updateTodoStatus(id, status)
    refreshTodos()
  }

  const handleEdit = (todo: Todo) => {
    setEditingTodo(todo)
    setIsFormVisible(true)
  }

  const handleFormCancel = () => {
    setEditingTodo(null)
    setIsFormVisible(false)
  }

  const handleFilterChange = (newFilter: TodoFilter) => {
    setFilter(newFilter)
    refreshTodos()
  }
  
  const handleClearFilters = () => {
    setFilter({ status: "all" })
    refreshTodos()
  }

  const handleExport = () => {
    const json = todoListCore.exportToJSON()
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "todos.json"
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Tarefas exportadas com sucesso!" })
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const success = await todoListCore.importFromJSON(event.target?.result as string)
            if (success) {
              refreshTodos()
              toast({ title: "Tarefas importadas com sucesso!" })
            } else {
              toast({ title: "Erro na Importação", description: "Formato de arquivo inválido.", variant: "destructive" })
            }
          } catch (error) {
            toast({ title: "Erro na Importação", description: "Não foi possível processar o arquivo.", variant: "destructive" })
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Minhas Tarefas</h1>
            <Button size="sm" onClick={() => setIsFormVisible(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Tarefa
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleImport}><FileUp className="h-4 w-4 mr-2" />Importar</Button>
            <Button variant="outline" size="sm" onClick={handleExport}><FileDown className="h-4 w-4 mr-2" />Exportar</Button>
            <Separator orientation="vertical" className="h-6" />
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')}><List className="h-4 w-4" /></Button>
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')}><LayoutGrid className="h-4 w-4" /></Button>
          </div>
        </div>
        
        <div className="mb-8">
          <TodoFilters filter={filter} categories={categories} onFilterChange={handleFilterChange} onClearFilters={handleClearFilters}/>
        </div>

        {isFormVisible && (
          <div className="mb-8">
            <TodoForm
              todo={editingTodo}
              categories={categories}
              onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {isLoading ? (
          <div className="text-center p-8"><p>Carregando tarefas...</p></div>
        ) : filteredTodos.length > 0 ? (
          <div className={`transition-all duration-300 ${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-3'}`}>
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteTodo}
                onEdit={handleEdit}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border-dashed border-2 rounded-lg">
            <h2 className="text-xl font-semibold">Nenhuma tarefa encontrada.</h2>
            <p className="text-muted-foreground mt-2">
              Crie uma nova tarefa ou ajuste os filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

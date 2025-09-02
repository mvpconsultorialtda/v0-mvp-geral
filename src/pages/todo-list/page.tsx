"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { todoList } from "@/src/modules/todo-list"
import { TodoItem } from "@/src/modules/todo-list/components/TodoItem"
import { TodoForm } from "@/src/modules/todo-list/components/TodoForm"
import { TodoFilters } from "@/src/modules/todo-list/components/TodoFilters"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Download, Upload, Trash2, CheckCircle } from "lucide-react"
import type { Todo, TodoFilter, TodoStats, TodoStatus } from "@/src/modules/todo-list/types"

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [filter, setFilter] = useState<TodoFilter>({ status: "all" })
  const [stats, setStats] = useState<TodoStats>({
    total: 0,
    completed: 0,
    pending: 0,
    inProgress: 0,
    byPriority: {},
    byCategory: {},
  })
  const [categories, setCategories] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to sync local state with the backend
  const syncWithBackend = async () => {
    const dataToSave = todoList.core.exportToJSON();
    try {
      await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dataToSave,
      });
    } catch (error) {
      console.error("Falha ao sincronizar com o backend", error);
    }
  };
  
  const loadTodos = () => {
    const filteredTodos = todoList.core.getTodos(filter)
    const allStats = todoList.core.getStats()
    const allCategories = todoList.core.getCategories()

    setTodos(filteredTodos)
    setStats(allStats)
    setCategories(allCategories)
  }

  // Fetch initial data from API on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const response = await fetch('/api/todos');
        if (response.ok) {
          const data = await response.json();
          if (data && (data.todos.length > 0 || data.categories.length > 0)) {
            todoList.core.importFromJSON(JSON.stringify(data));
          }
        }
      } catch (error) {
        console.error("Falha ao buscar tarefas:", error);
      } finally {
        setIsLoaded(true);
        loadTodos(); // Initial load after fetching
      }
    };

    fetchInitialData();
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    if (isLoaded) {
        loadTodos()
    }
  }, [filter, isLoaded])

  const handleAddTodo = (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    todoList.core.addTodo(todoData)
    loadTodos()
    syncWithBackend();
    setShowForm(false)
  }

  const handleUpdateTodo = (todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">) => {
    if (editingTodo) {
      todoList.core.updateTodo(editingTodo.id, todoData)
      loadTodos()
      syncWithBackend();
      setEditingTodo(null)
    }
  }

  const handleStatusChange = (id: string, status: TodoStatus) => {
    todoList.core.updateTodoStatus(id, status)
    loadTodos()
    syncWithBackend();
  }

  const handleDeleteTodo = (id: string) => {
    todoList.core.deleteTodo(id)
    loadTodos()
    syncWithBackend();
  }

  const handleEditTodo = (todo: Todo) => {
    setEditingTodo(todo)
    setShowForm(false)
  }

  const handleClearCompleted = () => {
    const cleared = todoList.core.clearCompleted()
    if (cleared > 0) {
      loadTodos()
      syncWithBackend();
    }
  }

  const handleExport = () => {
    const jsonData = todoList.core.exportToJSON()
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `todos-${new Date().toISOString().split("T")[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (todoList.core.importFromJSON(content)) {
        loadTodos()
        syncWithBackend();
        alert("Tarefas importadas com sucesso!")
      } else {
        alert("Falha ao importar tarefas. Verifique o formato do arquivo.")
      }
    }
    reader.readAsText(file)
    event.target.value = "" // Reset input
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lista de Tarefas</h1>
          <p className="text-muted-foreground">Organize suas tarefas e mantenha-se produtivo</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-muted-foreground">Total de Tarefas</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            <div className="text-sm text-muted-foreground">Pendentes</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.inProgress}</div>
            <div className="text-sm text-muted-foreground">Em Andamento</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <div className="text-sm text-muted-foreground">Concluídas</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-teal-600">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Progresso</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="p-4">
              <div className="space-y-2">
                <Button onClick={() => setShowForm(true)} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Tarefa
                </Button>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExport} className="flex-1 bg-transparent">
                    <Download className="h-3 w-3 mr-1" />
                    Exportar
                  </Button>
                  <div className="flex-1">
                    <input type="file" accept=".json" onChange={handleImport} className="hidden" id="import-file" />
                    <Button variant="outline" size="sm" asChild className="w-full bg-transparent">
                      <label htmlFor="import-file" className="cursor-pointer">
                        <Upload className="h-3 w-3 mr-1" />
                        Importar
                      </label>
                    </Button>
                  </div>
                </div>

                {stats.completed > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearCompleted}
                    className="w-full text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Limpar Concluídas
                  </Button>
                )}
              </div>
            </Card>

            <Card className="p-4">
              <TodoFilters
                filter={filter}
                categories={categories}
                onFilterChange={setFilter}
                onClearFilters={() => setFilter({ status: "all" })}
              />
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            {(showForm || editingTodo) && (
              <TodoForm
                todo={editingTodo}
                categories={categories}
                onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTodo(null)
                }}
              />
            )}

            {todos.length === 0 ? (
              <Card className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma tarefa encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  {filter.status === "all" && !filter.search && !filter.priority && !filter.category
                    ? "Comece adicionando sua primeira tarefa!"
                    : "Tente ajustar seus filtros ou adicione uma nova tarefa."}
                </p>
                <Button onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Sua Primeira Tarefa
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {todos.map((todo) => (
                  <TodoItem
                    key={todo.id}
                    todo={todo}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDeleteTodo}
                    onEdit={handleEditTodo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  LayoutGrid,
  List,
  FileDown,
  FileUp,
  Sun,
  Moon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { TodoItem } from '@/src/modules/todo-list/components/TodoItem'
import { TodoForm } from '@/src/modules/todo-list/components/TodoForm'
import { TodoFilters } from '@/src/modules/todo-list/components/TodoFilters'
import type { Todo, TodoFilter } from '@/src/modules/todo-list/types'

export const dynamic = 'force-dynamic'

async function fetchTodos() {
  const res = await fetch('/api/todos')
  if (!res.ok) {
    throw new Error('Failed to fetch todos')
  }
  const data = await res.json()
  return data
}

async function saveTodos(data: { todos: Todo[]; categories: string[] }) {
  const res = await fetch('/api/todos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    throw new Error('Failed to save todos')
  }
}

export default function TodoListPage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<TodoFilter>({ status: 'all' })
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [isFormVisible, setIsFormVisible] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const { toast } = useToast()

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      try {
        const data = await fetchTodos()
        setTodos(data.todos)
        setCategories(data.categories)
      } catch (error) {
        toast({
          title: 'Erro ao carregar tarefas',
          description: 'Não foi possível buscar os dados do servidor.',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }
    init()
  }, [toast])

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
        if (filter.status === 'all') return true
        return todo.status === filter.status
      })
  }, [todos, filter])

    const refreshTodos = async () => {
        setIsLoading(true);
        try {
            const data = await fetchTodos();
            setTodos(data.todos);
            setCategories(data.categories);
        } catch (error) {
            toast({
                title: 'Erro ao atualizar tarefas',
                description: 'Não foi possível buscar os dados mais recentes.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };


  const handleAddTodo = async (
    todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const newTodo = {
        ...todoData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
    const newTodos = [...todos, newTodo];
    try {
        await saveTodos({ todos: newTodos, categories });
        await refreshTodos(); 
        setIsFormVisible(false);
        toast({
            title: 'Tarefa Adicionada!',
            description: `A tarefa '${todoData.title}' foi criada com sucesso.`,
        });
    } catch (error) {
        toast({
            title: 'Erro ao adicionar tarefa',
            variant: 'destructive',
        });
    }
  }

  const handleUpdateTodo = async (
    todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!editingTodo) return;
    const updatedTodos = todos.map(t => t.id === editingTodo.id ? { ...t, ...todoData, updatedAt: new Date().toISOString() } : t);
    try {
        await saveTodos({ todos: updatedTodos, categories });
        await refreshTodos();
        setEditingTodo(null);
        setIsFormVisible(false);
        toast({
            title: 'Tarefa Atualizada!',
            description: `A tarefa '${todoData.title}' foi atualizada.`,
        });
    } catch (error) {
        toast({
            title: 'Erro ao atualizar tarefa',
            variant: 'destructive',
        });
    }
  }

  const handleDeleteTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo && confirm(`Tem certeza que deseja remover a tarefa '${todo.title}'?`)) {
        const newTodos = todos.filter(t => t.id !== id);
        try {
            await saveTodos({ todos: newTodos, categories });
            await refreshTodos();
            toast({
                title: 'Tarefa Removida',
                variant: 'destructive',
            });
        } catch (error) {
            toast({
                title: 'Erro ao remover tarefa',
                variant: 'destructive',
            });
        }
    }
  }

  const handleStatusChange = async (
    id: string,
    status: 'pending' | 'in-progress' | 'completed'
  ) => {
    const updatedTodos = todos.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t);
    try {
        await saveTodos({ todos: updatedTodos, categories });
        await refreshTodos();
    } catch (error) {
        toast({
            title: 'Erro ao mudar status',
            variant: 'destructive',
        });
    }
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
  }

  const handleClearFilters = () => {
    setFilter({ status: 'all' })
  }

  const handleExport = () => {
    const json = JSON.stringify({ todos, categories }, null, 2);
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'todos.json'
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: 'Tarefas exportadas com sucesso!' })
  }

//   const handleImport = () => {
//     // TODO: Implement import functionality by sending file to the server
//     toast({ title: 'Importação ainda não implementada' })
//   }

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center gap-4'>
            <h1 className='text-2xl font-bold'>Minhas Tarefas</h1>
            <Button size='sm' onClick={() => setIsFormVisible(true)}>
              <Plus className='h-4 w-4 mr-2' />
              Nova Tarefa
            </Button>
          </div>
          <div className='flex items-center gap-2'>
            {/* <Button variant='outline' size='sm' onClick={handleImport}>
              <FileUp className='h-4 w-4 mr-2' />
              Importar
            </Button> */}
            <Button variant='outline' size='sm' onClick={handleExport}>
              <FileDown className='h-4 w-4 mr-2' />
              Exportar
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('list')}
            >
              <List className='h-4 w-4' />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size='sm'
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className='h-4 w-4' />
            </Button>
          </div>
        </div>

        <div className='mb-8'>
          <TodoFilters
            filter={filter}
            categories={categories}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {isFormVisible && (
          <div className='mb-8'>
            <TodoForm
              todo={editingTodo}
              categories={categories}
              onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
              onCancel={handleFormCancel}
            />
          </div>
        )}

        {isLoading ? (
          <div className='text-center p-8'>
            <p>Carregando tarefas...</p>
          </div>
        ) : filteredTodos.length > 0 ? (
          <div
            className={`transition-all duration-300 ${
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
                : 'space-y-3'
            }`}
          >
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
          <div className='text-center p-8 border-dashed border-2 rounded-lg'>
            <h2 className='text-xl font-semibold'>Nenhuma tarefa encontrada.</h2>
            <p className='text-muted-foreground mt-2'>
              Crie uma nova tarefa ou ajuste os filtros.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

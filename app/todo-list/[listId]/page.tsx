'use client'

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus, LayoutGrid, List, Sun, Moon, Share2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { TodoItem } from '@/modules/todo-list/components/TodoItem';
import { TodoForm } from '@/modules/todo-list/components/TodoForm';
import { TodoFilters } from '@/modules/todo-list/components/TodoFilters';
import type { Todo, TodoFilter, TodoList } from '@/modules/todo-list/types';
import { GoBackButton } from '@/components/ui/go-back-button';

// A página agora é dinâmica para forçar a renderização no lado do cliente
export const dynamic = 'force-dynamic';

async function fetchListDetails(listId: string): Promise<TodoList> {
    const res = await fetch(`/api/todo-lists/${listId}`);
    if (!res.ok) {
        // Em caso de 403 ou 404, o servidor pode retornar uma mensagem
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch list details');
    }
    return res.json();
}

async function saveListDetails(listId: string, todos: Todo[]) {
    const res = await fetch(`/api/todo-lists/${listId}`,
    {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todos }), // A API espera um objeto com a chave 'todos'
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to save list');
    }
}

export default function TodoListPage() {
    const [list, setList] = useState<TodoList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<TodoFilter>({ status: 'all' });
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const listId = params.listId as string;

    const refreshTodos = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await fetchListDetails(id);
            setList(data);
        } catch (error: any) {
            toast({
                title: 'Erro ao carregar a lista',
                description: error.message,
                variant: 'destructive',
            });
            // Se falhar (ex: acesso negado), redireciona para a página de listas
            router.push('/todo-list');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (listId) {
            refreshTodos(listId);
        }
    }, [listId, toast, router]);

    const filteredTodos = useMemo(() => {
        if (!list) return [];
        return list.todos.filter((todo) => {
            if (filter.status === 'all') return true;
            return todo.status === filter.status;
        });
    }, [list, filter]);

    const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!list) return;
        const newTodo = {
            ...todoData,
            id: `todo_${Date.now()}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const newTodos = [...list.todos, newTodo];
        try {
            await saveListDetails(listId, newTodos);
            await refreshTodos(listId);
            setIsFormVisible(false);
            toast({ title: 'Tarefa Adicionada!', description: `A tarefa '${todoData.title}' foi criada.` });
        } catch (error: any) {
            toast({ title: 'Erro ao adicionar tarefa', description: error.message, variant: 'destructive' });
        }
    };

    const handleUpdateTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => {
        if (!editingTodo || !list) return;
        const updatedTodos = list.todos.map(t => t.id === editingTodo.id ? { ...t, ...todoData, updatedAt: new Date().toISOString() } : t);
        try {
            await saveListDetails(listId, updatedTodos);
            await refreshTodos(listId);
            setEditingTodo(null);
            setIsFormVisible(false);
            toast({ title: 'Tarefa Atualizada!', description: `A tarefa '${todoData.title}' foi atualizada.` });
        } catch (error: any) {
            toast({ title: 'Erro ao atualizar tarefa', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteTodo = async (id: string) => {
        if (!list) return;
        const todo = list.todos.find(t => t.id === id);
        if (todo && confirm(`Tem certeza que deseja remover a tarefa '${todo.title}'?`)) {
            const newTodos = list.todos.filter(t => t.id !== id);
            try {
                await saveListDetails(listId, newTodos);
                await refreshTodos(listId);
                toast({ title: 'Tarefa Removida', variant: 'destructive' });
            } catch (error: any) {
                toast({ title: 'Erro ao remover tarefa', description: error.message, variant: 'destructive' });
            }
        }
    };

    const handleStatusChange = async (id: string, status: 'pending' | 'in-progress' | 'completed') => {
        if (!list) return;
        const updatedTodos = list.todos.map(t => t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t);
        try {
            await saveListDetails(listId, updatedTodos);
            await refreshTodos(listId);
        } catch (error: any) {
            toast({ title: 'Erro ao mudar status', description: error.message, variant: 'destructive' });
        }
    };

    const handleEdit = (todo: Todo) => {
        setEditingTodo(todo);
        setIsFormVisible(true);
    };

    const handleFormCancel = () => {
        setEditingTodo(null);
        setIsFormVisible(false);
    };

  // Funções de filtro e visualização permanecem iguais...
  const handleFilterChange = (newFilter: TodoFilter) => setFilter(newFilter);
  const handleClearFilters = () => setFilter({ status: 'all' });

    if (isLoading) {
        return <div className='text-center p-8'>Carregando tarefas...</div>;
    }

    if (!list) {
        return (
            <div className='text-center p-8'>
                <h2 className='text-xl font-semibold'>Lista não encontrada ou acesso negado.</h2>
                <p className='text-muted-foreground mt-2'>Verifique o ID da lista ou suas permissões.</p>
                <Button onClick={() => router.push('/todo-list')} className="mt-4">Voltar para Minhas Listas</Button>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background p-4'>
            <div className='max-w-7xl mx-auto'>
                <GoBackButton href="/todo-list" />
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-2xl font-bold truncate'>{list.name}</h1>
                    <div className='flex items-center gap-2'>
                        <Button size='sm' onClick={() => setIsFormVisible(true)}>
                            <Plus className='h-4 w-4 mr-2' />
                            Nova Tarefa
                        </Button>
                         {/* Botão de compartilhar (funcionalidade futura) */}
                        <Button variant='outline' size='sm' onClick={() => toast({title: 'Em breve!'})}>
                            <Share2 className='h-4 w-4 mr-2' />
                            Compartilhar
                        </Button>
                    </div>
                </div>

                <div className='mb-8'>
                    <TodoFilters
                        filter={filter}
                        categories={[] /* Categorias não são mais usadas neste escopo */}
                        onFilterChange={handleFilterChange}
                        onClearFilters={handleClearFilters}
                    />
                </div>

                {isFormVisible && (
                    <div className='mb-8'>
                        <TodoForm
                            todo={editingTodo}
                            categories={[]}
                            onSubmit={editingTodo ? handleUpdateTodo : handleAddTodo}
                            onCancel={handleFormCancel}
                        />
                    </div>
                )}

                {filteredTodos.length > 0 ? (
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
                        <h2 className='text-xl font-semibold'>Nenhuma tarefa nesta lista.</h2>
                        <p className='text-muted-foreground mt-2'>Adicione sua primeira tarefa!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

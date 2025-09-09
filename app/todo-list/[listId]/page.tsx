
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

// --- API Helper Functions --- //

async function fetchListDetails(listId: string): Promise<TodoList> {
    const res = await fetch(`/api/todo-lists/${listId}`);
    if (!res.ok) throw new Error('Failed to fetch list details');
    return res.json();
}

async function fetchTasksForList(listId: string): Promise<Todo[]> {
    const res = await fetch(`/api/todo-lists/${listId}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const tasksData = await res.json();
    // Garante que as datas sejam objetos Date
    return tasksData.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
    }));
}

// --- Main Component --- //

export default function TodoListPage() {
    // Estados separados para lista e tarefas
    const [list, setList] = useState<TodoList | null>(null);
    const [tasks, setTasks] = useState<Todo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<TodoFilter>({ status: 'all' });
    const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    const { toast } = useToast();
    const params = useParams();
    const router = useRouter();
    const listId = params.listId as string;

    // Efeito para carregar dados iniciais da lista e das tarefas
    useEffect(() => {
        if (!listId) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                // Carrega detalhes da lista e tarefas em paralelo
                const [listData, tasksData] = await Promise.all([
                    fetchListDetails(listId),
                    fetchTasksForList(listId)
                ]);
                setList(listData);
                setTasks(tasksData);
            } catch (error: any) {
                toast({
                    title: 'Erro ao carregar dados',
                    description: error.message,
                    variant: 'destructive',
                });
                router.push('/todo-list');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [listId, toast, router]);

    const filteredTodos = useMemo(() => {
        return tasks.filter((todo) => {
            if (filter.status === 'all') return true;
            return todo.status === filter.status;
        });
    }, [tasks, filter]);

    // --- CRUD Handlers (Refatorados) --- //

    const handleAddTodo = async (todoData: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'listId'>) => {
        try {
            const res = await fetch(`/api/todo-lists/${listId}/tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todoData),
            });
            if (!res.ok) throw new Error('Failed to create task');
            const newTodo = await res.json();

            // Atualização otimista
            setTasks(prevTasks => [...prevTasks, { ...newTodo, createdAt: new Date(newTodo.createdAt), updatedAt: new Date(newTodo.updatedAt) }]);
            setIsFormVisible(false);
            toast({ title: 'Tarefa Adicionada!', description: `A tarefa '${newTodo.title}' foi criada.` });
        } catch (error: any) {
            toast({ title: 'Erro ao adicionar tarefa', description: error.message, variant: 'destructive' });
        }
    };

    const handleUpdateTodo = async (todoData: Partial<Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>>) => {
        if (!editingTodo) return;

        try {
            const res = await fetch(`/api/tasks/${editingTodo.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(todoData),
            });
            if (!res.ok) throw new Error('Failed to update task');
            const updatedTodo = await res.json();

            // Atualização otimista
            setTasks(tasks.map(t => t.id === editingTodo.id ? { ...t, ...updatedTodo, updatedAt: new Date(updatedTodo.updatedAt) } : t));
            setEditingTodo(null);
            setIsFormVisible(false);
            toast({ title: 'Tarefa Atualizada!', description: `A tarefa '${updatedTodo.title}' foi atualizada.` });
        } catch (error: any) {
            toast({ title: 'Erro ao atualizar tarefa', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteTodo = async (id: string) => {
        const todo = tasks.find(t => t.id === id);
        if (todo && confirm(`Tem certeza que deseja remover a tarefa '${todo.title}'?`)) {
            try {
                const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
                if (res.status !== 204) throw new Error('Failed to delete task');

                // Atualização otimista
                setTasks(tasks.filter(t => t.id !== id));
                toast({ title: 'Tarefa Removida', variant: 'destructive' });
            } catch (error: any) {
                toast({ title: 'Erro ao remover tarefa', description: error.message, variant: 'destructive' });
            }
        }
    };

    const handleStatusChange = async (id: string, status: 'pending' | 'in-progress' | 'completed') => {
        const originalTasks = tasks; // Guardar estado original para reverter em caso de erro
        
        // Atualização otimista
        setTasks(tasks.map(t => t.id === id ? { ...t, status } : t));

        try {
            const res = await fetch(`/api/tasks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            // Não precisa fazer nada com a resposta, a UI já foi atualizada.

        } catch (error: any) {
            // Reverter em caso de erro
            setTasks(originalTasks);
            toast({ title: 'Erro ao mudar status', description: error.message, variant: 'destructive' });
        }
    };

    // --- Handlers de UI --- //

    const handleEdit = (todo: Todo) => {
        setEditingTodo(todo);
        setIsFormVisible(true);
    };

    const handleFormCancel = () => {
        setEditingTodo(null);
        setIsFormVisible(false);
    };

    const handleFilterChange = (newFilter: TodoFilter) => setFilter(newFilter);
    const handleClearFilters = () => setFilter({ status: 'all' });

    // --- Renderização --- //

    if (isLoading) {
        return <div className='text-center p-8'>Carregando tarefas...</div>;
    }

    if (!list) {
        return (
            <div className='text-center p-8'>
                <h2 className='text-xl font-semibold'>Lista não encontrada.</h2>
                <p className='text-muted-foreground mt-2'>Verifique o ID da lista ou volte para a página inicial.</p>
                <GoBackButton href="/todo-list" />
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
                    </div>
                </div>

                <TodoFilters
                    filter={filter}
                    categories={[]}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />

                {isFormVisible && (
                    <div className='my-8'>
                        <TodoForm
                            todo={editingTodo}
                            categories={[]}
                            // Ajuste para passar os dados corretos para a função de submit
                            onSubmit={(data) => editingTodo ? handleUpdateTodo(data) : handleAddTodo(data as any)}
                            onCancel={handleFormCancel}
                        />
                    </div>
                )}

                <div className='mt-8'>
                    {filteredTodos.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
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
                            <p className='text-muted-foreground mt-2'>Adicione sua primeira tarefa ou ajuste os filtros.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

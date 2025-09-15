
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useNotification } from '@/context/NotificationProvider';
import { useApiMutation } from '@/hooks/useApiMutation';
import { TodoItem } from '@/modules/todo-list/components/TodoItem';
import { TodoForm } from '@/modules/todo-list/components/TodoForm';
import { TodoFilters } from '@/modules/todo-list/components/TodoFilters';
import type { Todo, TodoFilter, TodoList, Task } from '@/modules/todo-list/types';
import { GoBackButton } from '@/components/ui/go-back-button';

export const dynamic = 'force-dynamic';

// --- API Helper Functions --- //

async function fetchListDetails(listId: string): Promise<TodoList> {
    const res = await fetch(`/api/todo-lists/${listId}`);
    if (!res.ok) throw new Error('Failed to fetch list details');
    return res.json();
}

async function fetchTasksForList(listId: string): Promise<Task[]> {
    const res = await fetch(`/api/todo-lists/${listId}/tasks`);
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const tasksData = await res.json();
    return tasksData.map((task: any) => ({ ...task, createdAt: new Date(task.createdAt), updatedAt: new Date(task.updatedAt) }));
}

async function createTaskApi({ listId, taskData }: { listId: string, taskData: Omit<Task, 'id' | 'listId'> }): Promise<Task> {
    const res = await fetch(`/api/todo-lists/${listId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create task');
    }
    return res.json();
}

async function updateTaskApi({ listId, taskId, taskData }: { listId: string, taskId: string, taskData: Partial<Omit<Task, 'id'>> }): Promise<void> {
    const res = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update task');
    }
}

async function deleteTaskApi({ listId, taskId }: { listId: string, taskId: string }): Promise<void> {
    const res = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}`, { method: 'DELETE' });
    if (res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete task');
    }
}


// --- Main Component --- //

export default function TodoListPage() {
    const [list, setList] = useState<TodoList | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<TodoFilter>({ status: 'all' });
    const [editingTodo, setEditingTodo] = useState<Task | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);
    
    const { addToast } = useNotification();
    const params = useParams();
    const router = useRouter();
    const listId = params.listId as string;

    // --- Data Fetching --- //
    const refreshData = useCallback(async () => {
        if (!listId) return;
        try {
            const [listData, tasksData] = await Promise.all([
                fetchListDetails(listId),
                fetchTasksForList(listId)
            ]);
            setList(listData ?? null);
            setTasks(tasksData ?? []);
        } catch (error: any) {
            addToast(error.message || 'Error loading data', 'error');
            setList(null); // Garante que a lista seja nula em caso de erro
            setTasks([]); // Garante que as tarefas sejam um array vazio em caso de erro
            router.push('/todo-list');
        }
    }, [listId, addToast, router]);

    useEffect(() => {
        setIsLoading(true);
        refreshData().finally(() => setIsLoading(false));
    }, [refreshData]);

    // --- API Mutations --- //

    const { mutate: addTask, isLoading: isAdding } = useApiMutation({
        mutationFn: (taskData: Omit<Task, 'id' | 'listId'>) => createTaskApi({ listId, taskData }),
        successMessage: 'Task created successfully!',
        onSuccess: () => {
            refreshData();
            setIsFormVisible(false);
        }
    });

    const { mutate: updateTask, isLoading: isUpdating } = useApiMutation({
        mutationFn: (taskData: Partial<Omit<Task, 'id'>>) => updateTaskApi({ listId, taskId: editingTodo!.id, taskData }),
        successMessage: 'Task updated successfully!',
        onSuccess: () => {
            refreshData();
            setEditingTodo(null);
            setIsFormVisible(false);
        }
    });
    
    const { mutate: deleteTask } = useApiMutation({
        mutationFn: (taskId: string) => deleteTaskApi({ listId, taskId }),
        successMessage: 'Task deleted successfully!',
        onSuccess: refreshData,
    });

    const { mutate: changeStatus } = useApiMutation({
        mutationFn: ({ taskId, status }: { taskId: string, status: Task['status'] }) => updateTaskApi({ listId, taskId, taskData: { status } }),
        successMessage: 'Task status updated!',
        onSuccess: refreshData
    });

    // --- Handlers --- //
    const handleSubmit = (data: Omit<Task, 'id' | 'listId'>) => {
        if (editingTodo) {
            updateTask(data);
        } else {
            addTask(data);
        }
    };

    const handleEdit = (todo: Task) => {
        setEditingTodo(todo);
        setIsFormVisible(true);
    };

    const handleFormCancel = () => {
        setEditingTodo(null);
        setIsFormVisible(false);
    };

    const filteredTodos = useMemo(() => (tasks ?? []).filter(todo => filter.status === 'all' || todo.status === filter.status), [tasks, filter]);

    // --- Render --- //
    if (isLoading) {
        return <div className='text-center p-8'>Loading tasks...</div>;
    }

    if (!list) {
        return <div className='text-center p-8'><h2 className='text-xl font-semibold'>List not found.</h2><GoBackButton href="/todo-list" /></div>;
    }

    return (
        <div className='min-h-screen bg-background p-4'>
            <div className='max-w-7xl mx-auto'>
                <GoBackButton href="/todo-list" />
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-2xl font-bold truncate'>{list.name}</h1>
                    <Button size='sm' onClick={() => setIsFormVisible(true)} disabled={isFormVisible}>
                        <Plus className='h-4 w-4 mr-2' /> New Task
                    </Button>
                </div>

                <TodoFilters filter={filter} onFilterChange={setFilter} onClearFilters={() => setFilter({ status: 'all' })} />

                {isFormVisible && (
                    <div className='my-8'>
                        <TodoForm
                            todo={editingTodo}
                            onSubmit={handleSubmit}
                            onCancel={handleFormCancel}
                            isSubmitting={isAdding || isUpdating}
                        />
                    </div>
                )}

                <div className='mt-8'>
                    {filteredTodos.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                            {(filteredTodos ?? []).map((todo) => (
                                <TodoItem
                                    key={todo.id}
                                    todo={todo}
                                    onStatusChange={(status) => changeStatus({ taskId: todo.id, status })}
                                    onDelete={() => deleteTask(todo.id)}
                                    onEdit={() => handleEdit(todo)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className='text-center p-8 border-dashed border-2 rounded-lg'>
                            <h2 className='text-xl font-semibold'>No tasks found.</h2>
                            <p className='text-muted-foreground mt-2'>Add your first task or adjust the filters.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

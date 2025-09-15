
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
import type { TodoList, Task, TodoFilter } from '@/modules/todo-list/types';
import { GoBackButton } from '@/components/ui/go-back-button';

async function fetchTodoList(listId: string): Promise<TodoList> {
    const res = await fetch(`/api/todo-lists/${listId}`);
    if (!res.ok) {
        throw new Error('Failed to fetch list details');
    }
    const data = await res.json();
    return {
        ...data,
        tasks: data.tasks.map((task: any) => ({ ...task, createdAt: new Date(task.createdAt), updatedAt: new Date(task.updatedAt) }))
    };
}

async function createOrUpdateTaskApi(listId: string, taskData: Omit<Task, 'id'> | Partial<Task>): Promise<Task> {
    const method = 'id' in taskData ? 'PATCH' : 'POST';
    const res = await fetch(`/api/todo-lists/${listId}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to ${'id' in taskData ? 'update' : 'create'} task`);
    }
    return res.json();
}

async function deleteTaskApi(listId: string, taskId: string): Promise<void> {
    const res = await fetch(`/api/todo-lists/${listId}/tasks/${taskId}`, { method: 'DELETE' });
    if (res.status !== 204) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete task');
    }
}

export default function TodoListPage() {
    const [todoList, setTodoList] = useState<TodoList | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<TodoFilter>({ status: 'all' });
    const [editingTodo, setEditingTodo] = useState<Task | null>(null);
    const [isFormVisible, setIsFormVisible] = useState(false);

    const { addToast } = useNotification();
    const params = useParams();
    const router = useRouter();
    const listId = params.listId as string;

    const refreshData = useCallback(async () => {
        if (!listId) return;
        try {
            const listData = await fetchTodoList(listId);
            setTodoList(listData);
        } catch (error: any) {
            addToast(error.message || 'Error loading data', 'error');
            router.push('/todo-list');
        }
    }, [listId, addToast, router]);

    useEffect(() => {
        setIsLoading(true);
        refreshData().finally(() => setIsLoading(false));
    }, [refreshData]);

    const { mutate: createOrUpdateTask, isLoading: isSubmitting } = useApiMutation({
        mutationFn: (taskData: Omit<Task, 'id'> | Partial<Task>) => createOrUpdateTaskApi(listId, taskData),
        successMessage: `Task ${editingTodo ? 'updated' : 'created'} successfully!`,
        onSuccess: () => {
            refreshData();
            setEditingTodo(null);
            setIsFormVisible(false);
        }
    });

    const { mutate: deleteTask } = useApiMutation({
        mutationFn: (taskId: string) => deleteTaskApi(listId, taskId),
        successMessage: 'Task deleted successfully!',
        onSuccess: refreshData,
    });

    const handleSubmit = (data: Omit<Task, 'id'>) => {
        const taskData = editingTodo ? { ...editingTodo, ...data } : data;
        createOrUpdateTask(taskData);
    };

    const handleEdit = (todo: Task) => {
        setEditingTodo(todo);
        setIsFormVisible(true);
    };

    const handleFormCancel = () => {
        setEditingTodo(null);
        setIsFormVisible(false);
    };

    const filteredTasks = useMemo(() => 
        (todoList?.tasks ?? []).filter(task => filter.status === 'all' || task.status === filter.status),
    [todoList, filter]);

    if (isLoading) {
        return <div className='text-center p-8'>Loading tasks...</div>;
    }

    if (!todoList) {
        return (
            <div className='text-center p-8'>
                <h2 className='text-xl font-semibold'>List not found.</h2>
                <GoBackButton href="/todo-list" />
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background p-4'>
            <div className='max-w-7xl mx-auto'>
                <GoBackButton href="/todo-list" />
                <div className='flex items-center justify-between mb-6'>
                    <h1 className='text-2xl font-bold truncate'>{todoList.name}</h1>
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
                            isSubmitting={isSubmitting}
                        />
                    </div>
                )}

                <div className='mt-8'>
                    {filteredTasks.length > 0 ? (
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                            {filteredTasks.map((task) => (
                                <TodoItem
                                    key={task.id}
                                    todo={task}
                                    onStatusChange={(status) => createOrUpdateTask({ id: task.id, status })}
                                    onDelete={() => deleteTask(task.id)}
                                    onEdit={() => handleEdit(task)}
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

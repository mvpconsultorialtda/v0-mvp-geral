'use client';

import { useMemo } from 'react';
import { useLists } from '@/modules/task-lists/hooks/use-lists';
import { useTasks } from '@/modules/task-lists/hooks/use-tasks';
import apiClient from '@/lib/api/client';
import { TaskDetailView } from '@/modules/task-lists/components/TaskDetailView';
import { Task } from '@/modules/task-lists/types';
import { Spinner } from '@/components/ui/spinner'; // Supondo que você tenha um componente de spinner

export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  // 1. Busca dados usando os novos hooks SWR
  const { lists, isLoading: listsLoading } = useLists();
  const { tasks, isLoading: tasksLoading, mutate: mutateTasks } = useTasks(listId);

  const activeList = useMemo(() => lists?.find(l => l.id === listId), [lists, listId]);

  // 2. Funções de mutação que chamam a API e atualizam o cache do SWR
  const handleAddTask = async (text: string) => {
    const tempId = `temp-${Date.now()}`;
    const newTask = { text, listId, order: (tasks?.length || 0) + 1, createdAt: new Date() };
    
    // Atualização otimista
    await mutateTasks(
      (currentTasks) => [...(currentTasks || []), { ...newTask, id: tempId, status: 'Pendente' } as Task], 
      false
    );

    try {
      await apiClient(`/lists/${listId}/tasks`, { method: 'POST', body: newTask });
      // Revalida para obter o objeto de tarefa real do servidor
      await mutateTasks();
    } catch (error) {
      console.error("Failed to create task", error);
      // Reverte em caso de erro
      await mutateTasks(); 
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    // Atualização otimista
    await mutateTasks(
      (currentTasks) => currentTasks?.map(t => t.id === taskId ? { ...t, ...updates } : t),
      false
    );

    try {
      await apiClient(`/tasks/${taskId}`, { method: 'PATCH', body: updates });
      await mutateTasks();
    } catch (error) {
      console.error("Failed to update task", error);
      await mutateTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // Atualização otimista
    await mutateTasks(
      (currentTasks) => currentTasks?.filter(t => t.id !== taskId),
      false
    );

    try {
      await apiClient(`/tasks/${taskId}`, { method: 'DELETE' });
      await mutateTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
      await mutateTasks();
    }
  };

  const isLoading = listsLoading || tasksLoading;

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!activeList) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Lista não encontrada</h2>
          <p className="text-gray-500 mt-2">A lista que você está procurando não existe ou foi removida.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen bg-white">
      <TaskDetailView
        activeList={activeList}
        tasks={tasks || []}
        onAddTask={handleAddTask}
        onUpdateTask={handleUpdateTask}
        onDeleteTask={handleDeleteTask}
      />
    </main>
  );
}
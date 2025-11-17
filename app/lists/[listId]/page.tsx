
'use client';

import { useMemo } from 'react';
import { useLists } from '@/modules/task-lists/hooks/use-lists';
import { useTasks } from '@/modules/task-lists/hooks/use-tasks';
import apiClient from '@/lib/api/client';
import { TaskDetailView } from '@/modules/task-lists/components/TaskDetailView';
import { Task } from '@/modules/task-lists/types';
import { Spinner } from '@/components/ui/spinner';

export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  const { lists, isLoading: listsLoading } = useLists();
  const { tasks, isLoading: tasksLoading, mutate: mutateTasks } = useTasks(listId);

  const activeList = useMemo(() => lists?.find(l => l.id === listId), [lists, listId]);

  const handleAddTask = async (text: string) => {
    try {
      const newTask = { text, listId, order: (tasks?.length || 0) + 1 };
      await apiClient(`/lists/${listId}/tasks`, { method: 'POST', body: newTask });
      // After creating the task, re-fetch the task list to ensure the UI is in sync.
      await mutateTasks();
    } catch (error) {
      console.error("Failed to create task", error);
      // Optionally, show an error message to the user.
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await apiClient(`/tasks/${taskId}`, { method: 'PATCH', body: updates });
      await mutateTasks();
    } catch (error) {
      console.error("Failed to update task", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await apiClient(`/tasks/${taskId}`, { method: 'DELETE' });
      await mutateTasks();
    } catch (error) {
      console.error("Failed to delete task", error);
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

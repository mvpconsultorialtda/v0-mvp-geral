'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLists } from '@/modules/task-lists/hooks/use-lists';
import { useTasks } from '@/modules/task-lists/hooks/use-tasks';
import apiClient from '@/lib/api/client';
import { TaskListsSidebar } from '@/modules/task-lists/components/TaskListsSidebar';
import { TasksList } from '@/modules/task-lists/components/TasksList';
import { Task, TaskList } from '@/modules/task-lists/types';

export default function ListsPage() {
  const { lists, isLoading: listsLoading, mutate: mutateLists } = useLists();
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  // Efeito para definir a lista ativa quando as listas são carregadas
  useEffect(() => {
    if (!activeList && lists && lists.length > 0) {
      setActiveList(lists[0]);
    }
  }, [lists, activeList]);

  const activeListId = useMemo(() => activeList?.id || null, [activeList]);
  const { tasks, isLoading: tasksLoading, mutate: mutateTasks } = useTasks(activeListId);

  const handleCreateList = async (listData: { name: string }) => {
    await mutateLists(
      (currentLists) => [...(currentLists || []), { ...listData, id: `temp-${Date.now()}` } as TaskList],
      false
    );
    try {
      const newList = await apiClient('/lists', { method: 'POST', body: listData });
      await mutateLists();
      setActiveList(newList); // Define a nova lista como ativa
    } catch (error) {
      console.error("Failed to create list", error);
      await mutateLists();
    }
  };

  const handleAddTask = async (text: string) => {
    if (!activeListId) return;
    const tempId = `temp-${Date.now()}`;
    const newTask = { text, listId: activeListId, order: (tasks?.length || 0) + 1 };
    
    await mutateTasks(
      (currentTasks) => [...(currentTasks || []), { ...newTask, id: tempId, status: 'Pendente' } as Task], 
      false
    );
    try {
      await apiClient(`/lists/${activeListId}/tasks`, { method: 'POST', body: newTask });
      await mutateTasks();
    } catch (error) {
      console.error("Failed to create task", error);
      await mutateTasks(); 
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <TaskListsSidebar
        lists={lists || []}
        activeList={activeList}
        onSelectList={setActiveList}
        onAddList={handleCreateList}
        isLoading={listsLoading}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {activeList ? (
          <TasksList 
            list={activeList}
            tasks={tasks || []}
            isLoading={tasksLoading}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <h2 className="text-2xl font-semibold">Selecione uma lista</h2>
            <p className="mt-2">Escolha uma lista na barra lateral para ver suas tarefas ou crie uma nova.</p>
          </div>
        )}
      </main>
    </div>
  );
}

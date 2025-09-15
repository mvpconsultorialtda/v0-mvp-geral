'use client';

import { useMemo } from 'react';
import { useTaskLists } from '../../../src/modules/task-lists/hooks/useTaskLists';
import { useTasks } from '../../../src/modules/task-lists/hooks/useTasks';
import { TaskDetailView } from '../../../src/modules/task-lists/components/TaskDetailView';

// Página dinâmica para exibir os detalhes e tarefas de uma lista específica
export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  // Embora esta página seja para uma lista, ainda usamos o hook geral para encontrar a lista pelo ID.
  // Uma otimização futura seria um hook para buscar uma única lista.
  const { lists, isLoading: isLoadingLists } = useTaskLists();
  const activeList = useMemo(() => lists.find(l => l.id === listId), [lists, listId]);

  const { tasks, isLoading: isLoadingTasks, addTask, updateTask, deleteTask } = useTasks(listId);

  if (isLoadingLists || isLoadingTasks) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Carregando tarefas...</p>
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
      {/* A TaskDetailView agora ocupa toda a página, focada em uma única lista */}
      <TaskDetailView
        activeList={activeList}
        tasks={tasks || []}
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </main>
  );
}

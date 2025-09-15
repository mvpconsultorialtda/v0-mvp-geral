'use client';

import { useMemo } from 'react';
import { useTaskLists } from '../../../src/modules/task-lists/hooks/useTaskLists';
import { useTasks } from '../../../src/modules/task-lists/hooks/useTasks';
import { TaskDetailView } from '../../../src/modules/task-lists/components/TaskDetailView';

// Página dinâmica para exibir os detalhes e tarefas de uma lista específica
export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  const { lists, isLoading: isLoadingLists } = useTaskLists();
  
  // CORREÇÃO: Adicionado optional chaining (?.) para evitar erro quando a lista está carregando
  const activeList = useMemo(() => lists?.find(l => l.id === listId), [lists, listId]);

  const { tasks, isLoading: isLoadingTasks, addTask, updateTask, deleteTask } = useTasks(listId);

  if (isLoadingLists) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Carregando lista...</p>
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
  
  // Mostra um carregamento específico para as tarefas após a lista ter sido encontrada
  if (isLoadingTasks) {
      return (
        <div className="flex h-screen items-center justify-center">
            <p className="text-lg text-gray-500">Carregando tarefas...</p>
        </div>
      )
  }

  return (
    <main className="h-screen bg-white">
      <TaskDetailView
        activeList={activeList}
        tasks={tasks || []} // O fallback para array vazio continua sendo uma boa prática
        onAddTask={addTask}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </main>
  );
}

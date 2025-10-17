'use client';

import { useMemo } from 'react';
import { useLists } from '../../../src/modules/task-lists/hooks/useLists';
import { useTasks } from '../../../src/modules/task-lists/hooks/useTasks';
import { TaskDetailView } from '../../../src/modules/task-lists/components/TaskDetailView';

// Página dinâmica para exibir os detalhes e tarefas de uma lista específica
export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  const { lists } = useLists();
  
  const activeList = useMemo(() => lists?.find(l => l.id === listId), [lists, listId]);

  const { tasks, createTask, updateTask, deleteTask } = useTasks(listId);

  if (!activeList) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-gray-700">Carregando lista...</h2>
            <p className="text-gray-500 mt-2">Ou a lista que você está procurando não existe ou foi removida.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="h-screen bg-white">
      <TaskDetailView
        activeList={activeList}
        tasks={tasks || []} // O fallback para array vazio continua sendo uma boa prática
        onAddTask={createTask} // Corrigido para usar a nova função do hook
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
      />
    </main>
  );
}

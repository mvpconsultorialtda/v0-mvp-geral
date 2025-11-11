'use client';

import { useMemo } from 'react';
import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { useLists } from '@/modules/task-lists/hooks/useLists';
import { createTask, updateTask, deleteTask } from '@/modules/task-lists/services/taskService';
import { TaskDetailView } from '@/modules/task-lists/components/TaskDetailView';
import { Task, TaskList } from '@/modules/task-lists/types';
import { db } from '@/lib/firebase-client';

// Página dinâmica para exibir os detalhes e tarefas de uma lista específica
export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  // 1. Busca a lista ativa
  const { lists, loading: listsLoading } = useLists();
  const activeList = useMemo(() => lists?.find(l => l.id === listId), [lists, listId]);

  // 2. Busca as tarefas da lista ativa de forma reativa
  const tasksQuery = useMemo(() => 
    listId ? query(collection(db, 'taskLists', listId, 'tasks'), orderBy('createdAt', 'asc')) : null,
    [listId]
  );
  const [tasksSnapshot, tasksLoading] = useCollection(tasksQuery);

  const tasks = useMemo(() => 
    tasksSnapshot?.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dueDate: doc.data().dueDate?.toDate(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as Task[] | undefined,
    [tasksSnapshot]
  );

  // 3. Funções para manipular tarefas (agora chamam o serviço diretamente)
  const handleAddTask = (text: string) => {
    return createTask(listId, text);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    return updateTask(listId, taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    return deleteTask(listId, taskId);
  };

  const isLoading = listsLoading || tasksLoading;

  if (isLoading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">Carregando...</h2>
            </div>
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

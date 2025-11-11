'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore'; // CORREÇÃO: Importar 'where'
import { useCollection } from 'react-firebase-hooks/firestore';
import { useLists } from '@/modules/task-lists/hooks/useLists';
import { createTask, updateTask, deleteTask } from '@/modules/task-lists/services/taskService';
import { TaskDetailView } from '@/modules/task-lists/components/TaskDetailView';
import { Task } from '@/modules/task-lists/types';
import { db } from '@/lib/firebase-client';

export default function ListDetailPage({ params }: { params: { listId: string } }) {
  const { listId } = params;

  // 1. Busca a lista ativa (Esta parte está correta)
  const { lists, loading: listsLoading } = useLists();
  const activeList = useMemo(() => lists?.find(l => l.id === listId), [lists, listId]);

  // 2. CORREÇÃO: Busca as tarefas na coleção raiz 'tasks' e filtra pelo 'listId'
  const tasksQuery = useMemo(() => 
    listId ? query(
      collection(db, 'tasks'), 
      where('listId', '==', listId), 
      orderBy('createdAt', 'asc')
    ) : null,
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

  // 3. Funções para manipular tarefas
  const handleAddTask = (text: string) => {
    // A função de serviço já sabe como criar a tarefa na coleção correta
    return createTask(listId, text);
  };

  // Esta função agora passa o listId para o serviço, garantindo que o update tenha o contexto necessário
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
    // Adiciona uma verificação para o estado de carregamento inicial
    if (listsLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-700">Carregando listas...</h2>
            </div>
        </div>
      );
    }
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
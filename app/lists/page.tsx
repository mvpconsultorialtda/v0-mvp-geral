'use client';

import { useState } from 'react';
import { useLists } from '@/modules/task-lists/hooks/useLists';
import { createList as createListService } from '@/modules/task-lists/services/listService';
import { TaskListsSidebar } from '@/modules/task-lists/components/TaskListsSidebar';
import { TasksList } from '@/modules/task-lists/components/TasksList';
import { TaskList } from '@/modules/task-lists/types';

export default function ListsPage() {
  const { lists, loading } = useLists();
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  const handleCreateList = (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => {
    createListService(listData).catch(console.error); // Chama o serviço e trata erros
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <TaskListsSidebar 
        lists={lists || []} // Garante que a lista nunca seja undefined
        activeList={activeList}
        onSelectList={setActiveList}
        onAddList={handleCreateList}
        isLoading={loading} // Passa o estado de loading para a sidebar
      />
      <main className="flex-1 p-8 overflow-y-auto">
        {activeList ? (
          <TasksList list={activeList} />
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

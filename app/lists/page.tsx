'use client';

import { useState } from 'react';
import { useLists } from '../../src/modules/task-lists/hooks/useLists'; // Alterado
import { TaskListsSidebar } from '../../src/modules/task-lists/components/TaskListsSidebar';
import { TasksList } from '../../src/modules/task-lists/components/TasksList';
import { TaskList } from '../../src/modules/task-lists/types';

export default function ListsPage() {
  const { lists, createList } = useLists(); // Alterado
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  // A função handleAddList foi renomeada para handleCreateList para melhor clareza
  const handleCreateList = (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => {
    // A função `createList` agora é chamada diretamente
    createList(listData);
  };

  // O estado de isLoading foi removido pois o `useLists` agora é em tempo real

  return (
    <div className="flex h-screen bg-gray-50">
      <TaskListsSidebar 
        lists={lists}
        activeList={activeList}
        onSelectList={setActiveList}
        onAddList={handleCreateList} // Alterado
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

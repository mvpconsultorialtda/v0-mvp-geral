'use client';

import { useState } from 'react';
import { useTaskLists } from '../../src/modules/task-lists/hooks/useTaskLists';
import { TaskListsSidebar } from '../../src/modules/task-lists/components/TaskListsSidebar';
import { TasksList } from '../../src/modules/task-lists/components/TasksList';
import { TaskList } from '../../src/modules/task-lists/types';

export default function ListsPage() {
  const { lists, addList, isLoading } = useTaskLists();
  const [activeList, setActiveList] = useState<TaskList | null>(null);

  const handleAddList = (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => {
    // Agora 'addList' recebe um objeto com name, description, e sharedWith
    addList(listData);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <TaskListsSidebar 
        lists={lists}
        activeList={activeList}
        onSelectList={setActiveList}
        onAddList={handleAddList} // Passando a nova função
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

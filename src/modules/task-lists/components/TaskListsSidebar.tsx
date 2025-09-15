
'use client';

import { useState } from 'react';
import { TaskList } from '../types';
import { ListEditModal } from './ListEditModal'; // Vou criar este componente a seguir

interface TaskListsSidebarProps {
  lists: TaskList[];
  activeList: TaskList | null;
  onSelectList: (list: TaskList) => void;
  onAddList: (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => void;
}

export const TaskListsSidebar = ({ lists, activeList, onSelectList, onAddList }: TaskListsSidebarProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSaveList = (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => {
    onAddList(listData);
    setIsModalOpen(false);
  };

  return (
    <>
      <aside className="w-80 bg-white p-6 border-r border-gray-200 flex flex-col">
        <h2 className="text-2xl font-bold text-black mb-6">Minhas Listas</h2>
        <nav className="flex-grow">
          <ul>
            {lists.map((list) => (
              <li
                key={list.id}
                className={`p-3 rounded-lg cursor-pointer font-semibold transition-colors mb-2 ${
                  activeList?.id === list.id
                    ? 'bg-black text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => onSelectList(list)}
              >
                {list.name}
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-6">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-black text-white p-3 rounded-lg mt-3 w-full font-semibold hover:bg-gray-800 transition-colors"
          >
            Criar Nova Lista
          </button>
        </div>
      </aside>
      {isModalOpen && (
        <ListEditModal
          onSave={handleSaveList}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};

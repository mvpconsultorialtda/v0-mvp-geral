'use client';

import { useState } from 'react';
import { TaskList } from '../../types';

interface TaskListsSidebarProps {
  lists: TaskList[];
  activeList: TaskList | null;
  onSelectList: (list: TaskList) => void;
  onAddList: (name: string) => void;
}

export const TaskListsSidebar = ({ lists, activeList, onSelectList, onAddList }: TaskListsSidebarProps) => {
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    if (newListName.trim()) {
      onAddList(newListName.trim());
      setNewListName('');
    }
  };

  return (
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
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddList()} // Permite adicionar com Enter
          placeholder="Criar nova lista..."
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-shadow"
        />
        <button 
          onClick={handleAddList} 
          className="bg-black text-white p-3 rounded-lg mt-3 w-full font-semibold hover:bg-gray-800 transition-colors"
        >
          Adicionar Lista
        </button>
      </div>
    </aside>
  );
};

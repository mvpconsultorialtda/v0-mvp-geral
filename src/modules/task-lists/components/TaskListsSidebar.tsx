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
    <aside className="w-1/4 bg-gray-100 p-4 border-r">
      <h2 className="text-xl font-bold mb-4">Minhas Listas</h2>
      <nav>
        <ul>
          {lists.map((list) => (
            <li
              key={list.id}
              className={`p-2 rounded cursor-pointer ${
                activeList?.id === list.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200'
              }`}
              onClick={() => onSelectList(list)}
            >
              {list.name}
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-4">
        <input
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="Nova lista..."
          className="border p-2 w-full rounded"
        />
        <button onClick={handleAddList} className="bg-blue-500 text-white p-2 rounded mt-2 w-full">
          Adicionar Lista
        </button>
      </div>
    </aside>
  );
};

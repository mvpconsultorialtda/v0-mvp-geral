
'use client';

import { useState, useEffect } from 'react';
import { TaskList } from '../types';
import usersData from '../../../../data/users.json'; // Carregando os usuários

interface ListEditModalProps {
  list?: TaskList;
  onSave: (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => void;
  onClose: () => void;
}

interface User {
  email: string;
  uid: string;
}

export const ListEditModal = ({ list, onSave, onClose }: ListEditModalProps) => {
  const [name, setName] = useState(list?.name || '');
  const [description, setDescription] = useState(list?.description || '');
  const [sharedWith, setSharedWith] = useState<string[]>(list?.sharedWith || []);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    // Transformando o JSON de usuários em um array de objetos
    const users = Object.entries(usersData).map(([email, { uid }]) => ({ email, uid }));
    setAllUsers(users);
  }, []);

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name, description, sharedWith });
    }
  };

  const handleUserSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions).map(option => option.value);
    setSharedWith(selectedOptions);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-black mb-6">{list ? 'Editar Lista' : 'Criar Nova Lista'}</h2>
        <div className="space-y-6">
          <input
            type="text"
            placeholder="Nome da Lista"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-shadow"
          />
          <textarea
            placeholder="Descrição (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border border-gray-300 p-3 w-full rounded-lg h-24 resize-none focus:ring-2 focus:ring-black focus:border-black transition-shadow"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Compartilhar com:</label>
            <select
              multiple
              value={sharedWith}
              onChange={handleUserSelection}
              className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-shadow h-32"
            >
              {allUsers.map(user => (
                <option key={user.uid} value={user.uid}>
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button onClick={onClose} className="text-gray-600 font-semibold hover:text-gray-800 transition-colors">
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:bg-gray-400"
            disabled={!name.trim()}
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

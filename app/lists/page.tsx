'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTaskLists } from '../../src/modules/task-lists/hooks/useTaskLists';

// Página para gerenciar (ver, criar, deletar) as listas de tarefas
export default function ListManagementPage() {
  const { lists, addList, deleteList, isLoading } = useTaskLists();
  const [newListName, setNewListName] = useState('');

  const handleAddList = () => {
    if (newListName.trim()) {
      addList(newListName.trim());
      setNewListName('');
    }
  };

  // Adiciona o handler para deletar a lista, parando a propagação do evento
  const handleDeleteList = (e: React.MouseEvent, listId: string) => {
    e.preventDefault(); // Impede que o Link seja acionado
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja excluir esta lista e todas as suas tarefas?')) {
      deleteList(listId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-gray-500">Carregando listas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho e Ação de Criar Lista */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-black">Minhas Listas</h1>
            <p className="text-lg text-gray-500 mt-2">Crie, gerencie e navegue por suas listas de tarefas.</p>
          </div>
        </div>

        {/* Formulário de Nova Lista */}
        <div className="mb-12 p-6 border border-gray-200 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold text-black mb-4">Criar Nova Lista</h2>
          <div className="flex gap-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddList()}
              placeholder="Ex: Projetos da Empresa"
              className="flex-grow border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-black transition-shadow"
            />
            <button
              onClick={handleAddList}
              className="bg-black text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Criar Lista
            </button>
          </div>
        </div>

        {/* Grid de Listas Existentes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lists.map((list) => (
            <div key={list.id} className="group relative border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-xl transition-shadow">
              <Link href={`/lists/${list.id}`} className="block p-6">
                <h3 className="text-2xl font-semibold text-black mb-3">{list.name}</h3>
                <p className="text-gray-500 mb-4">Acessar tarefas</p>
                <span className="absolute bottom-4 right-4 text-black font-bold text-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </span>
              </Link>
              {/* Botão de deletar com lógica implementada */}
              <button 
                onClick={(e) => handleDeleteList(e, list.id)}
                className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50 z-10"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    <line x1="10" y1="11" x2="10" y2="17"/>
                    <line x1="14" y1="11" x2="14" y2="17"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {lists.length === 0 && (
          <div className="text-center py-16 px-6 border-2 border-dashed border-gray-300 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-700">Nenhuma lista encontrada</h2>
            <p className="text-gray-500 mt-2">Comece criando sua primeira lista no campo acima.</p>
          </div>
        )}
      </div>
    </div>
  );
}

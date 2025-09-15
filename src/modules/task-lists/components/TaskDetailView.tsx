'use client';

import { useState } from 'react';
import { Task, TaskList, TaskStatus } from '../../types';
import { TasksList } from './TasksList';
import KanbanBoardView from '../../../components/KanbanBoardView';

interface TaskDetailViewProps {
  activeList: TaskList | null;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailView = ({ activeList, tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskDetailViewProps) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  if (!activeList) {
    return (
      <section className="flex-1 p-8 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700">Bem-vindo ao seu Gerenciador de Tarefas</h2>
          <p className="text-gray-500 mt-2">Selecione uma lista na barra lateral para começar a organizar suas tarefas.</p>
        </div>
      </section>
    );
  }

  const handleAddTask = () => {
    if (newTaskText.trim()) {
      onAddTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <section className="flex-1 p-8 bg-white flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-black">{activeList.name}</h2>
        <div className="flex space-x-2">
          <button onClick={() => setViewMode('list')} className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'list' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>Lista</button>
          <button onClick={() => setViewMode('board')} className={`px-4 py-2 rounded-md text-sm font-medium ${viewMode === 'board' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>Quadro</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {viewMode === 'list' ? (
          <TasksList tasks={tasks} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
        ) : (
          // A função onUpdateTask agora é passada para o quadro Kanban.
          <KanbanBoardView tasks={tasks} onUpdateTask={onUpdateTask} />
        )}
      </div>
      
      <div className="mt-6 flex-shrink-0">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Adicionar uma nova tarefa..."
          className="border border-gray-300 p-3 w-full rounded-lg focus:ring-2 focus:ring-black focus:border-black transition-shadow"
        />
        <button onClick={handleAddTask} className="bg-black text-white p-3 rounded-lg mt-3 w-full font-semibold hover:bg-gray-800 transition-colors">
          Adicionar Tarefa
        </button>
      </div>
    </section>
  );
};

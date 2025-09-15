'use client';

import { useState } from 'react';
import { Task, TaskList } from '../../types';

interface TaskDetailViewProps {
  activeList: TaskList | null;
  tasks: Task[];
  onAddTask: (text: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed'>>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskDetailView = ({ activeList, tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskDetailViewProps) => {
  const [newTaskText, setNewTaskText] = useState('');

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
    <section className="flex-1 p-8 bg-white">
      <h2 className="text-3xl font-bold text-black mb-8">{activeList.name}</h2>

      <div className="space-y-4 mb-8">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onUpdateTask(task.id, { completed: !task.completed })}
              className="mr-4 h-5 w-5 rounded text-black focus:ring-black border-gray-300"
            />
            <span className={`flex-1 text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
              {task.text}
            </span>
            <button onClick={() => onDeleteTask(task.id)} className="text-gray-400 hover:text-red-500 font-semibold py-1 px-3 rounded-md transition-colors">
              Excluir
            </button>
          </li>
        ))}
      </div>

      <div className="mt-6">
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

'use client';

import React from 'react';
import { Task } from '../../types';

interface TasksListProps {
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed'>>) => void;
  onDeleteTask: (taskId: string) => void;
}

// Componente dedicado a renderizar a visualização em formato de lista.
export const TasksList: React.FC<TasksListProps> = ({ tasks, onUpdateTask, onDeleteTask }) => {
  return (
    <ul className="space-y-4 mb-8">
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
    </ul>
  );
};

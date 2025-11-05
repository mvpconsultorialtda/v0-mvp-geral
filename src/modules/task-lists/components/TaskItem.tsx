'use client';

import { Task } from '../../types';
import { Badge } from '@/components/ui/badge';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
  onDeleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
}

export const TaskItem = ({ task, onUpdateTask, onDeleteTask, onSelectTask }: TaskItemProps) => {

  const formatDate = (date: Date | string) => {
    if (!date) return null;
    const d = new Date(date);
    // Ajuste para garantir que a data seja exibida corretamente, independentemente do fuso horário
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()).toLocaleDateString();
  };

  return (
    <li 
        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm cursor-pointer"
        onClick={() => onSelectTask(task)}
    >
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => {
              e.stopPropagation();
              onUpdateTask(task.id, { completed: !task.completed });
          }}
          className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
        />
        <div className="ml-3">
          <span className={`text-lg ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
            {task.text}
          </span>
          {task.dueDate && (
            <div className="text-sm text-gray-500 mt-1">
              <Badge variant="secondary">{formatDate(task.dueDate)}</Badge>
            </div>
          )}
        </div>
      </div>
      <button 
        onClick={(e) => {
            e.stopPropagation();
            onDeleteTask(task.id)
        }}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
        </svg>
      </button>
    </li>
  );
};
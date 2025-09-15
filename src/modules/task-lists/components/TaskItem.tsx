'use client';

import { Task } from '../../types';

interface TaskItemProps {
  task: Task;
  onUpdateTask: (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => void;
  onDeleteTask: (taskId: string) => void;
}

export const TaskItem = ({ task, onUpdateTask, onDeleteTask }: TaskItemProps) => {
  return (
    <li className="flex items-center justify-between p-3 bg-gray-50 rounded-lg shadow-sm">
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => onUpdateTask(task.id, { completed: !task.completed })}
          className="h-5 w-5 rounded border-gray-300 text-black focus:ring-black"
        />
        <span className={`ml-3 text-lg ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
          {task.text}
        </span>
      </div>
      <button 
        onClick={() => onDeleteTask(task.id)}
        className="text-gray-400 hover:text-red-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
        </svg>
      </button>
    </li>
  );
};
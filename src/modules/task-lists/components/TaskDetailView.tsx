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
      <section className="flex-1 p-8 flex items-center justify-center text-gray-500">
        Selecione uma lista para ver suas tarefas.
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
    <section className="flex-1 p-8">
      <h2 className="text-2xl font-bold mb-6">{activeList.name}</h2>

      <ul>
        {tasks.map((task) => (
          <li key={task.id} className="flex items-center p-2 border-b">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onUpdateTask(task.id, { completed: !task.completed })}
              className="mr-4 h-5 w-5"
            />
            <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : ''}`}>
              {task.text}
            </span>
            <button onClick={() => onDeleteTask(task.id)} className="text-red-500 hover:text-red-700 p-1">
              Excluir
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-6">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Nova tarefa..."
          className="border p-2 w-full rounded"
        />
        <button onClick={handleAddTask} className="bg-green-500 text-white p-2 rounded mt-2 w-full">
          Adicionar Tarefa
        </button>
      </div>
    </section>
  );
};

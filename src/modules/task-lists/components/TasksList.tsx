'use client';

import React, { useState } from 'react';
import { TaskList } from '../../types';
import { useTasks } from '../hooks/useTasks';
import { TaskItem } from './TaskItem';

interface TasksListProps {
  list: TaskList;
}

export const TasksList = ({ list }: TasksListProps) => {
  const { tasks, createTask, updateTask, deleteTask } = useTasks(list.id);
  const [newTaskText, setNewTaskText] = useState('');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      createTask(newTaskText.trim());
      setNewTaskText('');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{list.name}</h2>
      
      <form onSubmit={handleCreateTask} className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskText}
          onChange={(e) => setNewTaskText(e.target.value)}
          placeholder="Adicionar nova tarefa"
          className="flex-1 p-2 border rounded"
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Adicionar
        </button>
      </form>

      {tasks.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Nenhuma tarefa aqui!</h3>
          <p className="text-gray-500 mt-2">Adicione uma nova tarefa para começar.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              onUpdateTask={(taskId, updates) => updateTask(taskId, updates)} 
              onDeleteTask={deleteTask} 
            />
          ))}
        </ul>
      )}
    </div>
  );
};

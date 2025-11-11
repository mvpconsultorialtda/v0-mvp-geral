'use client';

import React, { useState, useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { Task, TaskList } from '../types';
import { createTask, updateTask, deleteTask } from '../services/taskService';
import { TaskItem } from './TaskItem';
import { TaskDetailModal } from './TaskDetailModal';
import { db } from '@/lib/firebase-client';

interface TasksListProps {
  list: TaskList;
}

export const TasksList = ({ list }: TasksListProps) => {
  const [newTaskText, setNewTaskText] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // CORREÇÃO: Consulta a coleção raiz 'tasks' e filtra por 'listId'
  const tasksQuery = useMemo(() => 
    query(collection(db, 'tasks'), where('listId', '==', list.id), orderBy('createdAt', 'asc')),
    [list.id]
  );
  
  const [tasksSnapshot, loading] = useCollection(tasksQuery);

  const tasks = useMemo(() => 
    tasksSnapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Task[] || [],
    [tasksSnapshot]
  );

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      createTask(list.id, newTaskText.trim());
      setNewTaskText('');
    }
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    updateTask(list.id, taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTask(list.id, taskId);
  };

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };
  
  // NOTE: O componente TaskItem não foi incluído aqui para brevidade,
  // mas ele precisa ser importado e usado como no seu arquivo original.

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

      {loading ? (
        <p>Carregando tarefas...</p>
      ) : tasks.length === 0 ? (
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
              onUpdateTask={(updates) => handleUpdateTask(task.id, updates)} 
              onDeleteTask={() => handleDeleteTask(task.id)} 
              onSelectTask={() => handleSelectTask(task)} 
            />
          ))}
        </ul>
      )}

      {selectedTask && (
        <TaskDetailModal 
          task={selectedTask} 
          listId={list.id}
          isOpen={!!selectedTask} 
          onClose={handleCloseModal} 
          onUpdateTask={(updates) => handleUpdateTask(selectedTask.id, updates)}
        />
      )}
    </div>
  );
};
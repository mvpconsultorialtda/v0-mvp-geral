'use client';

import { useEffect, useState } from 'react';
import { Task } from '../types';
import { getTasks, createTask, updateTask, deleteTask } from '../services/task-lists.service';

export const useTasks = (listId: string) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!listId) {
      setTasks([]);
      return;
    }

    const unsubscribe = getTasks(listId, (fetchedTasks) => {
      setTasks(fetchedTasks);
    });

    return () => unsubscribe();
  }, [listId]);

  const handleCreateTask = (text: string) => {
    const order = tasks.length;
    return createTask(listId, text, order);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    return updateTask(listId, taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    return deleteTask(listId, taskId);
  };

  return {
    tasks,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
  };
};

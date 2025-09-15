import useSWR from 'swr';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task-lists.service';
import { Task } from '../types';

export const useTasks = (listId: string | null) => {
  const { data, error, mutate } = useSWR<Task[]>(
    listId ? `/api/lists/${listId}/tasks` : null,
    () => getTasks(listId!)
  );

  const addTask = async (text: string) => {
    if (!listId) return;
    try {
      const order = (data?.length || 0) + 1;
      const newTask = await createTask(listId, text, order);
      mutate([...(data || []), newTask], false);
      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      throw err;
    }
  };

  const updateExistingTask = async (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed'>>) => {
    if (!listId) return;
    try {
      const updatedTask = await updateTask(taskId, updates);
      mutate(
        data?.map((task) => (task.id === taskId ? { ...task, ...updates } : task)),
        false
      );
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  const removeTask = async (taskId: string) => {
    if (!listId) return;
    try {
      await deleteTask(taskId);
      mutate(
        data?.filter((task) => task.id !== taskId),
        false
      );
    } catch (err) {
      console.error('Error deleting task:', err);
      throw err;
    }
  };

  return {
    tasks: data,
    isLoading: !error && !data,
    isError: error,
    addTask,
    updateTask: updateExistingTask,
    deleteTask: removeTask,
  };
};

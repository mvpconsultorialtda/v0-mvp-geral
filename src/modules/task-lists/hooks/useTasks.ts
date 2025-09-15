import useSWR from 'swr';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from '../services/task-lists.service';
import { Task, TaskStatus } from '../types';

export const useTasks = (listId: string | null) => {
  // A chave SWR agora é mais declarativa para o fetch com Firestore
  const { data, error, mutate } = useSWR<Task[]>(
    listId ? ['lists', listId, 'tasks'] : null, // Chave baseada em array
    () => getTasks(listId!)
  );

  const addTask = async (text: string) => {
    if (!listId) return;
    try {
      const order = (data?.length || 0) + 1;
      // Otimisticamente, adiciona a nova tarefa à UI
      const optimisticTask = { id: 'temp-id', text, order, completed: false, status: 'Pendente', createdAt: new Date() } as Task;
      mutate([...(data || []), optimisticTask], false);

      const newTask = await createTask(listId, text, order);

      // Atualiza a UI com o dado real do backend
      mutate(d => d?.map(item => (item.id === 'temp-id' ? newTask : item)), false);

      return newTask;
    } catch (err) {
      console.error('Error creating task:', err);
      // Reverte em caso de erro
      mutate(data, false);
      throw err;
    }
  };

  const updateExistingTask = async (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status'>>) => {
    if (!listId) return;
    try {
      // Otimisticamente atualiza a UI
      mutate(data?.map((task) => (task.id === taskId ? { ...task, ...updates } : task)), false);

      // Passa o listId para o serviço
      await updateTask(taskId, listId, updates);

      // Revalida para garantir consistência, embora a UI já tenha sido atualizada
      mutate();
    } catch (err) {
      console.error('Error updating task:', err);
      // Reverte em caso de erro
      mutate(data, false);
      throw err;
    }
  };

  const removeTask = async (taskId: string) => {
    if (!listId) return;
    try {
      // Otimisticamente remove da UI
      mutate(data?.filter((task) => task.id !== taskId), false);

      // Passa o listId para o serviço
      await deleteTask(taskId, listId);

      // A UI já foi atualizada, não precisa de revalidação imediata
    } catch (err) {
      console.error('Error deleting task:', err);
      // Reverte em caso de erro
      mutate(data, false);
      throw err;
    }
  };

  return {
    tasks: data,
        // CORREÇÃO: isLoading deve ser true apenas quando `data` é undefined (antes do fetch).
    // Uma lista vazia `[]` é um dado válido e não deve ser um estado de carregamento.
    isLoading: !error && data === undefined && !!listId,
    isError: error,
    addTask,
    updateTask: updateExistingTask,
    deleteTask: removeTask,
  };
};

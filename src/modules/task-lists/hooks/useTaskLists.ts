import useSWR from 'swr';
import { getLists, createList } from '../services/task-lists.service';
import { TaskList } from '../types';

export const useTaskLists = () => {
  const { data, error, mutate } = useSWR<TaskList[]>('/api/lists', getLists);

  const addList = async (name: string) => {
    try {
      const newList = await createList(name);
      mutate([...(data || []), newList], false);
      return newList;
    } catch (err) {
      console.error('Error creating list:', err);
      // TODO: Adicionar tratamento de erro mais robusto (ex: toast de notificação)
      throw err;
    }
  };

  return {
    lists: data,
    isLoading: !error && !data,
    isError: error,
    addList,
  };
};

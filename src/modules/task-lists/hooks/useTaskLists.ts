import useSWR from 'swr';
import { createList, getLists } from '../services/task-lists.service';
import { TaskList } from '../types';

export const useTaskLists = () => {
  const { data, error, mutate } = useSWR<TaskList[]>('lists', getLists);

  const addList = async (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>) => {
    try {
      // Otimisticamente atualiza a UI
      const optimisticData = [...(data || []), { ...listData, id: 'temp-id', ownerId: 'current-user', createdAt: new Date() }] as TaskList[];
      mutate(optimisticData, false);

      const newList = await createList(listData); // Passa o objeto completo

      // Atualiza a UI com o dado real do backend
      mutate(d => d?.map(item => (item.id === 'temp-id' ? newList : item)), false);

      return newList;
    } catch (err) {
      console.error('Error creating list:', err);
      // Reverte em caso de erro
      mutate(data, false);
      throw err;
    }
  };

  return {
    lists: data || [],
    isLoading: !error && !data,
    isError: error,
    addList,
  };
};

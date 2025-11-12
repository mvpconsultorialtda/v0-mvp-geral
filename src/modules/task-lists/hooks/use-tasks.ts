import useSWR from 'swr';
import apiClient from '@/lib/api/client';
import { Task } from '../types';

const fetcher = (url: string) => apiClient<Task[]>(url);

export function useTasks(listId: string | null) {
  // Se listId for nulo, a requisição não é feita.
  // A chave é um array contendo o endpoint e o listId.
  // SWR só fará a requisição se a chave não for nula.
  const { data, error, isLoading, mutate } = useSWR(
    listId ? [`/lists/${listId}/tasks`, listId] : null,
    ([url]) => fetcher(url)
  );

  return {
    tasks: data,
    isLoading,
    isError: error,
    mutate,
  };
}

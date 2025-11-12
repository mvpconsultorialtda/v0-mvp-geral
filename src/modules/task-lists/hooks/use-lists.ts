import useSWR from 'swr';
import apiClient from '@/lib/api/client';
import { List } from '../types';

// O fetcher é uma função que recebe a chave do SWR (neste caso, o endpoint da API)
// e usa o apiClient para buscar os dados.
const fetcher = (url: string) => apiClient<List[]>(url);

export function useLists() {
  // A chave '/lists' será passada para o fetcher como o argumento 'url'.
  // SWR gerenciará o cache, a revalidação e o estado de carregamento/erro.
  const { data, error, isLoading, mutate } = useSWR('/lists', fetcher);

  return {
    lists: data,
    isLoading,
    isError: error,
    mutate, // Expor a função mutate permite a revalidação manual
  };
}

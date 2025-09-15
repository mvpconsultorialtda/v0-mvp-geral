
'use client';

import { useState } from 'react';
import { useNotification } from '@/context/NotificationProvider';

// T é o tipo de dado que a função de mutação recebe (ex: o corpo de um POST)
// U é o tipo de dado que a API retorna
type MutationFunction<T, U> = (data: T) => Promise<U>;

interface UseApiMutationOptions<T, U> {
  mutationFn: MutationFunction<T, U>;
  onSuccess?: (data: U) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
}

export function useApiMutation<T = any, U = any>({ 
  mutationFn, 
  onSuccess, 
  onError,
  successMessage = 'Operation successful!',
  errorMessage = 'An unexpected error occurred.'
}: UseApiMutationOptions<T, U>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { addToast } = useNotification();

  const mutate = async (data: T) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(data);
      addToast(successMessage, 'success');
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (e: any) {
      setError(e);
      addToast(e.message || errorMessage, 'error');
      if (onError) {
        onError(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { mutate, isLoading, error };
}

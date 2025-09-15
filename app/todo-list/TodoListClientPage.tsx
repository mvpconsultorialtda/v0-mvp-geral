
'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GoBackButton } from '@/components/ui/go-back-button';
import { Spinner } from '@/components/ui/spinner';
import { useNotification } from '@/context/NotificationProvider';
import { useApiMutation } from '@/hooks/useApiMutation';
import type { TodoList } from '@/modules/todo-list/types';

type TodoListsResponse = Record<string, TodoList>;

// Funções da API
async function fetchListsApi(): Promise<TodoListsResponse> {
  const res = await fetch('/api/todo-lists');
  if (!res.ok) {
    throw res;
  }
  return res.json();
}

async function createListApi(name: string): Promise<TodoList> {
  const res = await fetch('/api/todo-lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to create list' }));
    throw new Error(errorData.message);
  }
  return res.json();
}

export default function TodoListClientPage() {
  const [lists, setLists] = useState<TodoListsResponse>({});
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { addToast } = useNotification();

  useEffect(() => {
    const loadLists = async () => {
      setIsLoading(true);
      try {
        const fetchedLists = await fetchListsApi();
        setLists(fetchedLists);
      } catch (error: any) {
        if (error.status === 401) {
          addToast('Sessão expirada. Por favor, faça o login novamente.', 'error');
          router.push('/login');
        } else {
          addToast('Erro ao carregar as listas.', 'error');
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadLists();
  }, [addToast, router]);

  const refreshLists = async () => {
    try {
      const fetchedLists = await fetchListsApi();
      setLists(fetchedLists);
    } catch (error: any) {
      if (error.status === 401) {
        router.push('/login');
      } else {
        addToast('Erro ao atualizar as listas', 'error');
      }
    }
  };

  const { mutate: createList, isLoading: isCreating } = useApiMutation({
    mutationFn: createListApi,
    successMessage: 'Lista criada com sucesso!',
    onSuccess: () => {
      setNewListName('');
      refreshLists();
    },
  });

  const handleCreateList = async (e: FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      addToast('O nome da lista não pode ser vazio.', 'error');
      return;
    }
    await createList(newListName);
  };

  const handleSelectList = (listId: string) => {
    router.push(`/todo-list/${listId}`);
  };

  if (isLoading) {
    return <div className='text-center p-8'>Carregando...</div>;
  }

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-7xl mx-auto'>
        <GoBackButton />
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-bold'>Minhas Listas de Tarefas</h1>
        </div>

        <div className='mb-8 p-4 border rounded-lg'>
          <form onSubmit={handleCreateList} className='flex items-center gap-4'>
            <Input
              type='text'
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder='Nome da nova lista'
              className='flex-grow'
              disabled={isCreating}
            />
            <Button type='submit' disabled={isCreating} className="w-[140px]">
              {isCreating ? (
                <Spinner className='h-4 w-4' />
              ) : (
                <><Plus className='h-4 w-4 mr-2' /> Criar Lista</>
              )}
            </Button>
          </form>
        </div>

        {Object.keys(lists).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(lists).map(([id, list]) => (
              <div key={id} className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <h2 className="font-bold text-lg truncate">{list.name}</h2>
                  <p className="text-sm text-muted-foreground">{list.todos?.length || 0} tarefa(s)</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className='flex items-center text-sm text-muted-foreground'>
                    <Users className="h-4 w-4 mr-2"/>
                    {Object.keys(list.accessControl || {}).length + 1} membro(s)
                  </div>
                  <Button variant="outline" size="sm" onClick={() => handleSelectList(id)}>
                    Abrir
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='text-center p-8 border-dashed border-2 rounded-lg'>
            <h2 className='text-xl font-semibold'>Nenhuma lista encontrada.</h2>
            <p className='text-muted-foreground mt-2'>
              Que tal criar sua primeira lista de tarefas?
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

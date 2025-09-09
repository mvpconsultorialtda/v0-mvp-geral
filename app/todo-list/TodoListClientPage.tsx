'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GoBackButton } from '@/components/ui/go-back-button';
import type { TodoList } from '@/modules/todo-list/types';

type TodoListsResponse = Record<string, TodoList>;

// Função de fetch modificada para lançar a resposta em caso de erro
async function fetchLists(): Promise<TodoListsResponse> {
  const res = await fetch('/api/todo-lists');
  if (!res.ok) {
    throw res; // Lança o objeto de resposta inteiro
  }
  return res.json();
}

// Função de create modificada para lançar um erro com status
async function createList(name: string): Promise<any> {
  const res = await fetch('/api/todo-lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    credentials: 'include',
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Failed to create list' }));
    const error = new Error(errorData.message);
    (error as any).status = res.status;
    throw error; // Lança um erro com a propriedade status
  }
  return res.json();
}

export default function TodoListClientPage() {
  const [lists, setLists] = useState<TodoListsResponse>({});
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const loadLists = async () => {
      setIsLoading(true);
      try {
        const fetchedLists = await fetchLists();
        setLists(fetchedLists);
      } catch (error: any) {
        // Verifica se o erro tem o status 401 (Não Autorizado)
        if (error.status === 401) {
          toast({
            title: 'Sessão expirada',
            description: 'Por favor, faça o login novamente.',
            variant: 'destructive',
          });
          router.push('/login'); // Redireciona para a página de login
        } else {
          toast({
            title: 'Erro ao carregar as listas',
            description: 'Não foi possível buscar os dados do servidor.',
            variant: 'destructive',
          });
        }
      } finally {
        setIsLoading(false);
      }
    };
    loadLists();
  }, [toast, router]); // Adiciona router ao array de dependências

  const refreshLists = async () => {
    try {
      const fetchedLists = await fetchLists();
      setLists(fetchedLists);
    } catch (error: any) {
       if (error.status === 401) {
          router.push('/login');
        } else {
            toast({
                title: 'Erro ao atualizar as listas',
                variant: 'destructive',
            });
        }
    }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      toast({ title: 'O nome da lista não pode ser vazio.', variant: 'destructive' });
      return;
    }

    try {
      await createList(newListName);
      toast({
        title: 'Sucesso!',
        description: `A lista "${newListName}" foi criada.`,
      });
      setNewListName('');
      await refreshLists();
    } catch (error: any) {
        // Adiciona o mesmo tratamento de erro para a criação da lista
        if (error.status === 401) {
             toast({
                title: 'Sessão expirada',
                description: 'Por favor, faça o login novamente.',
                variant: 'destructive',
            });
            router.push('/login');
        } else {
            toast({
                title: 'Erro ao criar a lista',
                description: error.message || 'Ocorreu um erro inesperado.',
                variant: 'destructive',
            });
        }
    }
  };

  const handleSelectList = (listId: string) => {
    router.push(`/todo-list/${listId}`);
  };

  // Se estiver carregando e ainda não houver erro, podemos mostrar um loader
  // Se um erro 401 ocorrer, o redirecionamento será iniciado.
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
                />
                <Button type='submit'>
                    <Plus className='h-4 w-4 mr-2' />
                    Criar Lista
                </Button>
            </form>
        </div>

        {Object.keys(lists).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(lists).map(([id, list]) => (
                    <div key={id} className="border rounded-lg p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div>
                            <h2 className="font-bold text-lg truncate">{list.name}</h2>
                            <p className="text-sm text-muted-foreground">{list.todos.length} tarefa(s)</p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                            <div className='flex items-center text-sm text-muted-foreground'>
                                <Users className="h-4 w-4 mr-2"/>
                                {Object.keys(list.accessControl).length + 1} membro(s)
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
  )
}

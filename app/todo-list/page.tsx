'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { GoBackButton } from '@/components/ui/go-back-button';
import type { TodoList } from '@/modules/todo-list/types';

// Tipagem para o objeto de listas que vem da API
type TodoListsResponse = Record<string, TodoList>;

// Função para buscar as listas da API
async function fetchLists(): Promise<TodoListsResponse> {
  const res = await fetch('/api/todo-lists');
  if (!res.ok) {
    throw new Error('Failed to fetch lists');
  }
  return res.json();
}

// Função para criar uma nova lista
async function createList(name: string): Promise<any> {
  const res = await fetch('/api/todo-lists', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
    credentials: 'include', // <-- ADICIONADO: Inclui cookies na requisição
  });
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to create list');
  }
  return res.json();
}

export default function TodoListsPage() {
  const [lists, setLists] = useState<TodoListsResponse>({});
  const [newListName, setNewListName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Efeito para carregar as listas iniciais
  useEffect(() => {
    const loadLists = async () => {
      setIsLoading(true);
      try {
        const fetchedLists = await fetchLists();
        setLists(fetchedLists);
      } catch (error) {
        toast({
          title: 'Erro ao carregar as listas',
          description: 'Não foi possível buscar os dados do servidor.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadLists();
  }, [toast]);

  const refreshLists = async () => {
      try {
        const fetchedLists = await fetchLists();
        setLists(fetchedLists);
      } catch (error) {
        toast({
            title: 'Erro ao atualizar as listas',
            variant: 'destructive',
        });
      }
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) {
      toast({ title: 'O nome da lista não pode ser vazio.', variant: 'destructive' });
      return;
    }

    try {
      const result = await createList(newListName);
      toast({
        title: 'Sucesso!',
        description: `A lista "${newListName}" foi criada.`,
      });
      setNewListName('');
      await refreshLists(); // Recarrega as listas para mostrar a nova
    } catch (error: any) {
      toast({
        title: 'Erro ao criar a lista',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Navega para a página de detalhes da lista
  const handleSelectList = (listId: string) => {
    router.push(`/todo-list/${listId}`);
  };

  return (
    <div className='min-h-screen bg-background p-4'>
      <div className='max-w-7xl mx-auto'>
        <GoBackButton />
        <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold'>Minhas Listas de Tarefas</h1>
        </div>

        {/* Formulário para Criar Nova Lista */}
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

        {/* Grid de Listas Existentes */}
        {isLoading ? (
          <div className='text-center p-8'>Carregando listas...</div>
        ) : Object.keys(lists).length > 0 ? (
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

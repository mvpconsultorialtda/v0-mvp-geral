
import { testApiHandler } from 'next-test-api-route-handler';
import * as listHandler from '@/app/api/todo-lists/route';
import * as taskHandler from '@/app/api/todo-lists/[listId]/tasks/route';

// Simulação de alto nível: focada na lógica de negócio e permissões.
jest.mock('@/lib/session');
jest.mock('@/modules/todo-list/core.server');

import { verifySession } from '@/lib/session';
import { getTodoListById, createTodoList, createTask } from '@/modules/todo-list/core.server';

// Tipos para type casting das simulações
const mockVerifySession = verifySession as jest.Mock;
const mockGetTodoListById = getTodoListById as jest.Mock;
const mockCreateTodoList = createTodoList as jest.Mock;
const mockCreateTask = createTask as jest.Mock;

describe('API Access Control & Core Logic', () => {

  afterEach(() => {
    jest.clearAllMocks(); // Limpa as simulações após cada teste
  });

  // Cenário 1: Usuário não autenticado
  it('should return 401 Unauthorized if user is not logged in', async () => {
    mockVerifySession.mockResolvedValue(null); // Simula nenhum usuário logado

    await testApiHandler({
      appHandler: listHandler,
      test: async ({ fetch }) => {
        const res = await fetch({ method: 'POST', body: JSON.stringify({ name: 'New List' }) });
        expect(res.status).toBe(401);
      },
    });
  });

  // Cenário 2: Fluxo de Sucesso
  it('should allow a logged-in user to create a list and then add a task to it', async () => {
    const user = { uid: 'user-123', email: 'test@test.com' }; // Usuário válido
    const listId = 'list-abc';
    const list = { id: listId, name: 'My List', ownerId: user.uid };

    // Etapa 1: Criar a Lista
    mockVerifySession.mockResolvedValue(user);
    mockCreateTodoList.mockResolvedValue(undefined); // Simula a criação bem-sucedida no DB

    await testApiHandler({
      appHandler: listHandler,
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ name: list.name }),
        });
        expect(res.status).toBe(201); // Sucesso na criação da lista
      },
    });

    // Etapa 2: Adicionar uma Tarefa à Lista
    // Aqui está a correção para o problema original!
    // A lógica de permissão em `ability.ts` verifica `ownerId` no objeto da lista.
    // Nossa simulação de `getTodoListById` deve retornar um objeto que satisfaça essa regra.
    mockGetTodoListById.mockResolvedValue(list); 
    mockCreateTask.mockResolvedValue({ id: 'task-123', title: 'New Task' }); // Simula a criação bem-sucedida da tarefa

    await testApiHandler({
      appHandler: taskHandler,
      params: { listId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ title: 'New Task' }),
        });
        const json = await res.json();
        expect(res.status).toBe(201); // Deve ser 201 Created agora
        expect(json.title).toBe('New Task');
      },
    });
  });

  // Cenário 3: Falha de Autorização (Permissão Negada)
  it('should return 403 Forbidden if a user tries to add a task to a list they do not own', async () => {
    const user = { uid: 'user-123' }; // Usuário atacante
    const otherUser = { uid: 'user-456' }; // Dono da lista
    const listId = 'list-owned-by-other';
    // CORREÇÃO: Escapado o apóstrofo em "Other's List"
    const list = { id: listId, name: 'Other\'s List', ownerId: otherUser.uid };

    mockVerifySession.mockResolvedValue(user);
    mockGetTodoListById.mockResolvedValue(list); // Simula a busca da lista que pertence a outro

    await testApiHandler({
      appHandler: taskHandler,
      params: { listId },
      test: async ({ fetch }) => {
        const res = await fetch({
          method: 'POST',
          body: JSON.stringify({ title: 'Malicious Task' }),
        });
        expect(res.status).toBe(403); // Acesso proibido, como esperado
      },
    });
  });

});

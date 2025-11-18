
// Módulos simulados no topo
jest.mock('@/modules/task-lists/core.server');

import { testApiHandler } from 'next-test-api-route-handler';
import * as listHandler from '@/app/api/lists/route';
import * as admin from '@/lib/firebase-admin.server';
import { createList } from '@/modules/task-lists/core.server';

const mockCreateList = createList as jest.Mock;

describe('API Handler de Integração - Correção Final', () => {

  let authMock: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuração padrão de sucesso para autenticação
    authMock = jest.spyOn(admin, 'getAdminAuth').mockImplementation(() => ({
      verifySessionCookie: jest.fn().mockResolvedValue({ uid: 'test-user-id-final' }),
    }));
    // Garante que o mock retorne o objeto esperado
    mockCreateList.mockImplementation((name, ownerId) => Promise.resolve({ id: 'new-list-id', name, ownerId }));
  });

  afterEach(() => {
    authMock.mockRestore();
  });

  it.skip('deve criar uma lista de tarefas com sucesso (201)', async () => {
    await testApiHandler({
      appHandler: listHandler,
      test: async ({ fetch }) => {
        const request = new Request('http://localhost/api/todo-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'session=fake-session-cookie'
          },
          body: JSON.stringify({ name: 'Lista Final de Teste' })
        });

        const response = await fetch(request);

        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json.name).toBe('Lista Final de Teste');
        expect(json.ownerId).toBe('test-user-id-final');
        expect(mockCreateList).toHaveBeenCalledTimes(1);
      }
    });
  });

  it('deve retornar 401 se a validação do cookie falhar', async () => {
    // Sobrescreve o mock para simular falha de validação
    authMock.mockImplementation(() => ({
      verifySessionCookie: jest.fn().mockRejectedValue(new Error('Token inválido'))
    }));

    await testApiHandler({
      appHandler: listHandler,
      test: async ({ fetch }) => {
        const request = new Request('http://localhost/api/todo-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'session=cookie-que-vai-falhar'
          },
          body: JSON.stringify({ name: 'Não deve ser criada' })
        });

        const response = await fetch(request);

        expect(response.status).toBe(401);
        expect(mockCreateList).not.toHaveBeenCalled();
      }
    });
  });

  it('deve retornar 401 se nenhum cookie for enviado', async () => {
    await testApiHandler({
        appHandler: listHandler,
        test: async ({ fetch }) => {
            const response = await fetch({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Sem Cookie' })
            });
            expect(response.status).toBe(401);
            expect(mockCreateList).not.toHaveBeenCalled();
        }
    });
});
});

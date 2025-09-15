
// Módulos simulados no topo
jest.mock('@/lib/firebase-admin.server');
jest.mock('@/modules/todo-list/core.server');

import { testApiHandler } from 'next-test-api-route-handler';
import * as listHandler from '@/app/api/todo-lists/route';
import { getAdminAuth } from '@/lib/firebase-admin.server';
import { createTodoList } from '@/modules/todo-list/core.server';

describe('API Handler de Integração - Correção Final', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Configuração padrão de sucesso para autenticação
    (getAdminAuth as jest.Mock).mockImplementation(() => ({
      verifySessionCookie: jest.fn().mockResolvedValue({ uid: 'test-user-id-final' }),
    }));
  });

  it('deve criar uma lista de tarefas com sucesso (201)', async () => {
    await testApiHandler({
      appHandler: listHandler,
      // A CORREÇÃO DEFINITIVA: Simula o cookie através da construção de um objeto Request
      // com o cabeçalho 'Cookie' correto, que é o que a função `cookies()` da Next.js espera.
      test: async ({ fetch }) => {
        const request = new Request('http://localhost/api/todo-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': 'session=fake-session-cookie' // O formato de cabeçalho é crucial
          },
          body: JSON.stringify({ name: 'Lista Final de Teste' })
        });

        const response = await fetch(request);

        expect(response.status).toBe(201);
        const json = await response.json();
        expect(json.name).toBe('Lista Final de Teste');
        expect(json.ownerId).toBe('test-user-id-final');
        expect(createTodoList).toHaveBeenCalledTimes(1);
      }
    });
  });

  it('deve retornar 401 se a validação do cookie falhar', async () => {
    // Sobrescreve o mock para simular falha de validação
    (getAdminAuth as jest.Mock).mockImplementation(() => ({
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
        expect(createTodoList).not.toHaveBeenCalled();
      }
    });
  });

  it('deve retornar 401 se nenhum cookie for enviado', async () => {
    await testApiHandler({
        appHandler: listHandler,
        test: async ({ fetch }) => {
            // NENHUM cabeçalho de cookie é enviado nesta solicitação
            const response = await fetch({
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Sem Cookie' })
            });
            expect(response.status).toBe(401);
            expect(createTodoList).not.toHaveBeenCalled();
        }
    });
});
});

import { testApiHandler } from 'next-test-api-route-handler';
import * as listHandler from '@/app/api/lists/route';
import * as taskHandler from '@/app/api/todo-lists/[listId]/tasks/route';
import * as admin from '@/lib/firebase-admin.server';

// Mocks
jest.mock('@/lib/session');
jest.mock('@/modules/todo-list/core.server');
jest.mock('@/modules/task-lists/core.server');

import { verifySession } from '@/lib/session';
import { getTodoListById, createTodoList, createTask } from '@/modules/todo-list/core.server';
import { createList } from '@/modules/task-lists/core.server';

// Mock Types
const mockVerifySession = verifySession as jest.Mock;
const mockGetTodoListById = getTodoListById as jest.Mock;
const mockCreateTodoList = createTodoList as jest.Mock;
const mockCreateTask = createTask as jest.Mock;
const mockCreateList = createList as jest.Mock;

describe('Todo List Module API Tests', () => {
    let authMock: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();

        // Default Auth Mock (Admin SDK)
        authMock = jest.spyOn(admin, 'getAdminAuth').mockImplementation(() => ({
            verifySessionCookie: jest.fn().mockResolvedValue({ uid: 'test-user-id' }),
        }));

        // Default Session Mock (Lib)
        mockVerifySession.mockResolvedValue({ uid: 'test-user-id', email: 'test@test.com' });
    });

    afterEach(() => {
        authMock.mockRestore();
    });

    describe('Access Control & Core Logic', () => {
        it('should return 401 Unauthorized if user is not logged in (Session Lib)', async () => {
            mockVerifySession.mockResolvedValue(null);

            await testApiHandler({
                appHandler: listHandler,
                test: async ({ fetch }) => {
                    const res = await fetch({ method: 'POST', body: JSON.stringify({ name: 'New List' }) });
                    expect(res.status).toBe(401);
                },
            });
        });

        it('should allow a logged-in user to create a list and then add a task to it', async () => {
            const user = { uid: 'user-123', email: 'test@test.com' };
            const listId = 'list-abc';
            const list = { id: listId, name: 'My List', ownerId: user.uid };

            mockVerifySession.mockResolvedValue(user);
            mockCreateTodoList.mockResolvedValue(undefined);

            await testApiHandler({
                appHandler: listHandler,
                test: async ({ fetch }) => {
                    const res = await fetch({
                        method: 'POST',
                        headers: { 'Cookie': 'session=fake-session-cookie' },
                        body: JSON.stringify({ name: list.name }),
                    });
                    expect(res.status).toBe(201);
                },
            });

            mockGetTodoListById.mockResolvedValue(list);
            mockCreateTask.mockResolvedValue({ id: 'task-123', title: 'New Task' });

            await testApiHandler({
                appHandler: taskHandler,
                params: { listId },
                test: async ({ fetch }) => {
                    const res = await fetch({
                        method: 'POST',
                        headers: { 'Cookie': 'session=fake-session-cookie' },
                        body: JSON.stringify({ title: 'New Task' }),
                    });
                    const json = await res.json();
                    expect(res.status).toBe(201);
                    expect(json.title).toBe('New Task');
                },
            });
        });

        it('should return 403 Forbidden if a user tries to add a task to a list they do not own', async () => {
            const user = { uid: 'user-123' };
            const otherUser = { uid: 'user-456' };
            const listId = 'list-owned-by-other';
            const list = { id: listId, name: 'Other\'s List', ownerId: otherUser.uid };

            mockVerifySession.mockResolvedValue(user);
            mockGetTodoListById.mockResolvedValue(list);

            await testApiHandler({
                appHandler: taskHandler,
                params: { listId },
                test: async ({ fetch }) => {
                    const res = await fetch({
                        method: 'POST',
                        headers: { 'Cookie': 'session=fake-session-cookie' },
                        body: JSON.stringify({ title: 'Malicious Task' }),
                    });
                    expect(res.status).toBe(403);
                },
            });
        });
    });

    describe('Integration Scenarios', () => {
        it('should return 401 if session cookie validation fails (Admin SDK)', async () => {
            authMock.mockImplementation(() => ({
                verifySessionCookie: jest.fn().mockRejectedValue(new Error('Token inválido'))
            }));

            // Also mock verifySession to return null since the middleware/logic might use either
            mockVerifySession.mockResolvedValue(null);

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

        it('should return 401 if no cookie is sent', async () => {
            mockVerifySession.mockResolvedValue(null);

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
});

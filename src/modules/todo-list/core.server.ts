
// Importa as funções de acesso ao banco de dados do módulo centralizado.
import { readDb, writeDb } from '@/lib/db';
import { TodoList } from './types';

// --- Funções de Lógica de Negócio (Exportadas) ---

/**
 * Retorna todas as listas de tarefas.
 */
export async function getTodoLists(): Promise<Record<string, TodoList>> {
  const db = await readDb();
  // A função readDb garante que db.todoLists sempre seja um objeto.
  return db.todoLists;
}

/**
 * Retorna uma lista de tarefas específica pelo seu ID.
 */
export async function getTodoListById(listId: string): Promise<TodoList | null> {
  const db = await readDb();
  const list = db.todoLists?.[listId];
  // Retorna a lista com seu ID se encontrada, caso contrário null.
  return list ? { ...list, id: listId } : null;
}

/**
 * Cria uma nova lista de tarefas.
 */
export async function createTodoList(listId: string, todoList: Omit<TodoList, 'id' | 'todos'>): Promise<void> {
  const db = await readDb();
  // readDb garante que db.todoLists exista.
  db.todoLists[listId] = todoList;
  await writeDb(db);
}

/**
 * Atualiza os dados de uma lista de tarefas (ex: renomear).
 */
export async function updateTodoList(listId: string, todoList: Partial<Omit<TodoList, 'id' | 'todos'>>): Promise<void> {
  const db = await readDb();
  if (db.todoLists?.[listId]) {
    db.todoLists[listId] = { ...db.todoLists[listId], ...todoList };
    await writeDb(db);
  }
}

/**
 * Deleta uma lista de tarefas e todas as tarefas associadas a ela (exclusão em cascata).
 */
export async function deleteTodoList(listId: string): Promise<void> {
  const db = await readDb();
  
  // Se a lista não existe, não há nada a fazer.
  if (!db.todoLists?.[listId]) {
    console.warn(`Attempted to delete non-existent list with ID: ${listId}`);
    return;
  }

  // Deleta a lista.
  delete db.todoLists[listId];

  // Filtra as tarefas, mantendo apenas aquelas que NÃO pertencem à lista deletada.
  // A função readDb garante que db.tasks seja sempre um objeto.
  const remainingTasks = Object.entries(db.tasks).reduce((acc, [taskId, task]) => {
    if ((task as any).listId !== listId) {
      acc[taskId] = task;
    }
    return acc;
  }, {} as Record<string, any>);

  db.tasks = remainingTasks;
  
  // Escreve o estado final no banco de dados.
  await writeDb(db);
}

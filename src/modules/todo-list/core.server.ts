
import fs from 'fs/promises';
import path from 'path';
import { TodoList } from './types';

// Caminho para o nosso banco de dados em arquivo JSON
const dbPath = path.resolve(process.cwd(), 'data', 'db.json');

// --- Funções Auxiliares para Interagir com o db.json ---

// Lê o banco de dados do arquivo.
async function readDb() {
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    // Se o arquivo estiver vazio ou contiver apenas "null", retorna a estrutura padrão.
    if (!fileContent || fileContent.trim() === 'null') {
      return { todoLists: {}, tasks: {} };
    }
    return JSON.parse(fileContent);
  } catch (error: any) {
    // Se o arquivo não existir (ENOENT), o que é normal na primeira execução, retorna a estrutura padrão.
    if (error.code === 'ENOENT') {
      return { todoLists: {}, tasks: {} };
    }
    // Se for outro erro, lança a exceção.
    console.error("Failed to read database file:", error);
    throw new Error("Could not read from database.");
  }
}

// Escreve os dados atualizados no banco de dados.
async function writeDb(data: any) {
  try {
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to write to database file:", error);
    throw new Error("Could not write to database.");
  }
}

// --- Funções de Lógica de Negócio (Exportadas) ---

/**
 * Retorna todas as listas de tarefas.
 */
export async function getTodoLists(): Promise<Record<string, TodoList>> {
  const db = await readDb();
  return db.todoLists || {};
}

/**
 * Retorna uma lista de tarefas específica pelo seu ID.
 * Agora não contém mais as tarefas aninhadas.
 */
export async function getTodoListById(listId: string): Promise<TodoList | null> {
  const db = await readDb();
  const list = db.todoLists?.[listId];
  return list ? { ...list, id: listId } : null;
}

/**
 * Cria uma nova lista de tarefas.
 */
export async function createTodoList(listId: string, todoList: Omit<TodoList, 'id' | 'todos'>): Promise<void> {
  const db = await readDb();
  db.todoLists[listId] = todoList;
  await writeDb(db);
}

/**
 * Atualiza os dados de uma lista de tarefas (ex: renomear).
 * Não lida mais com a atualização de tarefas.
 */
export async function updateTodoList(listId: string, todoList: Partial<Omit<TodoList, 'id' | 'todos'>>): Promise<void> {
  const db = await readDb();
  if (db.todoLists[listId]) {
    db.todoLists[listId] = { ...db.todoLists[listId], ...todoList };
    await writeDb(db);
  }
}

/**
 * Deleta uma lista de tarefas e todas as tarefas associadas a ela (exclusão em cascata).
 */
export async function deleteTodoList(listId: string): Promise<void> {
  const db = await readDb();
  // Verifica se a lista existe antes de prosseguir
  if (!db.todoLists[listId]) {
    console.warn(`Attempted to delete non-existent list with ID: ${listId}`);
    return; // A lista não existe, então não há nada a fazer.
  }

  // Deleta a lista
  delete db.todoLists[listId];

  // Filtra as tarefas, mantendo apenas aquelas que NÃO pertencem à lista deletada
  const remainingTasks = Object.entries(db.tasks).reduce((acc, [taskId, task]) => {
    if ((task as any).listId !== listId) {
      acc[taskId] = task;
    }
    return acc;
  }, {} as Record<string, any>);

  db.tasks = remainingTasks;
  
  // Escreve as alterações no banco de dados
  await writeDb(db);
}

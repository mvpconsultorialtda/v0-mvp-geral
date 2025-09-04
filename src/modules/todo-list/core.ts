
import fs from "fs";
import path from "path";
import { TodoList } from "./types"; // Importa o tipo TodoList

// Define o caminho para o novo arquivo de banco de dados JSON
const dbPath = path.resolve(process.cwd(), "data/db.json");

// Estrutura de dados esperada para o nosso "banco de dados" em JSON
interface AppDatabase {
  todoLists: Record<string, TodoList>;
}

// Função para ler todo o conteúdo do banco de dados.
function readDatabase(): AppDatabase {
  try {
    // Garante que o diretório de dados exista
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Tenta ler o arquivo do banco de dados
    const jsonData = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(jsonData) as AppDatabase;
  } catch (error) {
    // Se o arquivo não existir ou houver um erro de parsing, retorna uma estrutura vazia
    return { todoLists: {} };
  }
}

// Função para escrever o conteúdo completo no banco de dados.
function writeDatabase(data: AppDatabase) {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Falha ao escrever no banco de dados:", error);
    // Em uma aplicação real, um tratamento de erro mais robusto seria necessário
  }
}

// --- Funções Auxiliares para Manipulação de Listas de Tarefas ---

/**
 * Retorna todas as listas de tarefas do banco de dados.
 * @returns Um objeto contendo todas as listas de tarefas.
 */
export function getTodoLists() {
  const db = readDatabase();
  return db.todoLists;
}

/**
 * Busca uma única lista de tarefas pelo seu ID.
 * @param listId - O ID da lista de tarefas a ser recuperada.
 * @returns A lista de tarefas encontrada ou null se não existir.
 */
export function getTodoListById(listId: string): TodoList | null {
  const db = readDatabase();
  return db.todoLists[listId] || null;
}

/**
 * Adiciona ou atualiza uma lista de tarefas no banco de dados.
 * @param listId - O ID da lista a ser salva.
 * @param todoList - O objeto da lista de tarefas a ser salvo.
 */
export function saveTodoList(listId: string, todoList: TodoList) {
  const db = readDatabase();
  db.todoLists[listId] = todoList;
  writeDatabase(db);
}

/**
 * Deleta uma lista de tarefas do banco de dados.
 * @param listId - O ID da lista de tarefas a ser deletada.
 */
export function deleteTodoList(listId: string) {
  const db = readDatabase();
  delete db.todoLists[listId];
  writeDatabase(db);
}

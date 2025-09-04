
import fs from "fs";
import path from "path";
import { TodoList } from "./types";

// Em ambientes de produção (serverless), só podemos escrever no diretório /tmp
const dbPath = path.resolve("/tmp", "db.json");

interface AppDatabase {
  todoLists: Record<string, TodoList>;
}

// Garante que o estado inicial da base de dados (se existir em /data) é copiado para /tmp na primeira execução.
function initializeDatabase() {
    if (fs.existsSync(dbPath)) {
        return; // A base de dados já está em /tmp
    }

    const initialDbPath = path.resolve(process.cwd(), "data/db.json");

    try {
        if (fs.existsSync(initialDbPath)) {
            const initialData = fs.readFileSync(initialDbPath, "utf-8");
            fs.writeFileSync(dbPath, initialData, "utf-8");
        }
    } catch (error) {
        console.error("Could not initialize database from data/db.json:", error);
        // Se a cópia falhar, continuamos com uma base de dados vazia em /tmp
    }
}

initializeDatabase();

function readDatabase(): AppDatabase {
  try {
    // Lê sempre de /tmp
    const jsonData = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(jsonData) as AppDatabase;
  } catch (error) {
    // Se a leitura falhar (ex: ficheiro não existe), retorna uma base de dados vazia.
    return { todoLists: {} };
  }
}

function writeDatabase(data: AppDatabase) {
  try {
    // Escreve sempre em /tmp
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to database:", error);
    // Lança o erro para que a API possa capturá-lo e responder adequadamente.
    throw error;
  }
}

export function getTodoLists() {
  const db = readDatabase();
  return db.todoLists;
}

export function getTodoListById(listId: string): TodoList | null {
  const db = readDatabase();
  return db.todoLists[listId] || null;
}

export function createTodoList(listId: string, todoList: TodoList) {
  const db = readDatabase();
  db.todoLists[listId] = todoList;
  writeDatabase(db);
}

export function updateTodoList(listId: string, todoList: TodoList) {
  const db = readDatabase();
  db.todoLists[listId] = todoList;
  writeDatabase(db);
}

export function deleteTodoList(listId: string) {
  const db = readDatabase();
  delete db.todoLists[listId];
  writeDatabase(db);
}

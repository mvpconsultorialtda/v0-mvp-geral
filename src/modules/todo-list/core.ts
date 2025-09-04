
import fs from "fs";
import path from "path";
import { TodoList } from "./types";

const dbPath = path.resolve(process.cwd(), "data/db.json");

interface AppDatabase {
  todoLists: Record<string, TodoList>;
}

function readDatabase(): AppDatabase {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const jsonData = fs.readFileSync(dbPath, "utf-8");
    return JSON.parse(jsonData) as AppDatabase;
  } catch (error) {
    return { todoLists: {} };
  }
}

function writeDatabase(data: AppDatabase) {
  try {
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

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

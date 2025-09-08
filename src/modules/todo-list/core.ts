
import { getFirestore } from "@/lib/firebase-admin";
import { TodoList } from "./types";

// Não inicialize a base de dados aqui no topo.
// Em vez disso, obtenha a instância dentro de cada função.

export async function getTodoLists(): Promise<Record<string, TodoList>> {
    const db = getFirestore();
    const snapshot = await db.collection('todoLists').get();
    const todoLists: Record<string, TodoList> = {};
    snapshot.forEach(doc => {
        todoLists[doc.id] = doc.data() as TodoList;
    });
    return todoLists;
}

export async function getTodoListById(listId: string): Promise<TodoList | null> {
    const db = getFirestore();
    const doc = await db.collection('todoLists').doc(listId).get();
    if (!doc.exists) {
        return null;
    }
    return doc.data() as TodoList;
}

export async function createTodoList(listId: string, todoList: TodoList): Promise<void> {
    const db = getFirestore();
    await db.collection('todoLists').doc(listId).set(todoList);
}

export async function updateTodoList(listId: string, todoList: Partial<TodoList>): Promise<void> {
    const db = getFirestore();
    await db.collection('todoLists').doc(listId).update(todoList);
}

export async function deleteTodoList(listId: string): Promise<void> {
    const db = getFirestore();
    await db.collection('todoLists').doc(listId).delete();
}

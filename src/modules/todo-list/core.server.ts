
import { getFirestore } from "@/lib/firebase-admin.server";
import { TodoList } from "./types";

// Não inicialize a base de dados aqui no topo.
// Em vez disso, obtenha a instância dentro de cada função.

export async function getTodoLists(): Promise<Record<string, TodoList>> {
    try {
        console.log("Attempting to get Firestore instance...");
        const db = getFirestore();
        console.log("Firestore instance obtained. Attempting to access 'todoLists' collection.");
        
        const snapshot = await db.collection('todoLists').get();
        console.log("'todoLists' collection snapshot retrieved successfully.");

        const todoLists: Record<string, TodoList> = {};
        snapshot.forEach(doc => {
            todoLists[doc.id] = doc.data() as TodoList;
        });
        return todoLists;
    } catch (error) {
        console.error("FATAL ERROR in getTodoLists:", JSON.stringify(error, null, 2));
        // Rethrow a more specific error to be caught by the API route
        throw new Error(`Failed to retrieve data from Firestore. Original error: ${(error as Error).message}`);
    }
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

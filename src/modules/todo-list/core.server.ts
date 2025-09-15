
import { getFirestore } from '@/lib/firebase-admin.server';
import { TodoList, Task } from './types';
import { FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

// --- Funções de Lógica de Negócio (Exportadas) ---

/**
 * Retorna todas as listas de tarefas do Firestore.
 */
export async function getTodoLists(): Promise<Record<string, TodoList>> {
  const listsSnapshot = await db.collection('todo_lists').get();
  if (listsSnapshot.empty) {
    return {};
  }
  const lists: Record<string, TodoList> = {};
  listsSnapshot.forEach(doc => {
    lists[doc.id] = doc.data() as TodoList;
  });
  return lists;
}

/**
 * Retorna uma lista de tarefas específica pelo seu ID do Firestore.
 */
export async function getTodoListById(listId: string): Promise<TodoList | null> {
  const docRef = db.collection('todo_lists').doc(listId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }
  const data = doc.data();
  return { id: doc.id, todos: [], ...data } as TodoList;
}

/**
 * Cria uma nova lista de tarefas no Firestore.
 */
export async function createTodoList(listId: string, todoList: Omit<TodoList, 'id' | 'todos'>): Promise<void> {
  const docRef = db.collection('todo_lists').doc(listId);
  await docRef.set(todoList);
}

/**
 * Atualiza os dados de uma lista de tarefas no Firestore.
 */
export async function updateTodoList(listId: string, todoList: Partial<Omit<TodoList, 'id' | 'todos'>>): Promise<void> {
  const docRef = db.collection('todo_lists').doc(listId);
  await docRef.update(todoList);
}

/**
 * Deleta uma lista de tarefas e todas as suas tarefas em uma subcoleção.
 */
export async function deleteTodoList(listId: string): Promise<void> {
  const listRef = db.collection('todo_lists').doc(listId);

  // Para deletar a subcoleção, precisamos listar e deletar os documentos individualmente.
  const tasksSnapshot = await listRef.collection('tasks').get();
  if (!tasksSnapshot.empty) {
    const batch = db.batch();
    tasksSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }

  // Agora deleta o documento principal da lista.
  await listRef.delete();
}

// --- Funções de Tarefas ---

/**
 * Retorna todas as tarefas de uma lista específica.
 */
export async function getTasks(listId: string): Promise<Record<string, Task>> {
  const tasksSnapshot = await db.collection('todo_lists').doc(listId).collection('tasks').get();
  if (tasksSnapshot.empty) {
    return {};
  }
  const tasks: Record<string, Task> = {};
  tasksSnapshot.forEach(doc => {
    tasks[doc.id] = doc.data() as Task;
  });
  return tasks;
}

/**
 * Adiciona uma nova tarefa a uma lista.
 */
export async function createTask(listId: string, taskId: string, task: Omit<Task, 'id'>): Promise<void> {
  const taskRef = db.collection('todo_lists').doc(listId).collection('tasks').doc(taskId);
  await taskRef.set(task);
}

/**
 * Atualiza uma tarefa existente.
 */
export async function updateTask(listId: string, taskId: string, task: Partial<Omit<Task, 'id'>>): Promise<void> {
  const taskRef = db.collection('todo_lists').doc(listId).collection('tasks').doc(taskId);
  await taskRef.update(task);
}

/**
 * Deleta uma tarefa.
 */
export async function deleteTask(listId: string, taskId: string): Promise<void> {
  const taskRef = db.collection('todo_lists').doc(listId).collection('tasks').doc(taskId);
  await taskRef.delete();
}

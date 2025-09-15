
import { getFirestore } from '@/lib/firebase-admin.server';
import { TodoList, Task } from './types';

const db = getFirestore();

async function getTasksForList(listId: string): Promise<Task[]> {
  const tasksSnapshot = await db.collection('todo_lists').doc(listId).collection('tasks').get();
  if (tasksSnapshot.empty) {
    return [];
  }
  const tasks: Task[] = [];
  tasksSnapshot.forEach(doc => {
    tasks.push({ id: doc.id, ...(doc.data() as Omit<Task, 'id'>) });
  });
  return tasks;
}

export async function getTodoListById(listId: string): Promise<TodoList | null> {
  const docRef = db.collection('todo_lists').doc(listId);
  const doc = await docRef.get();
  if (!doc.exists) {
    return null;
  }

  const listData = doc.data() as Omit<TodoList, 'id' | 'tasks'>;
  const tasks = await getTasksForList(listId);

  return {
    id: doc.id,
    ...listData,
    tasks: tasks,
  };
}

export async function getTodoLists(): Promise<Omit<TodoList, 'tasks'>[]> {
  const listsSnapshot = await db.collection('todo_lists').get();
  if (listsSnapshot.empty) {
    return [];
  }
  const lists: Omit<TodoList, 'tasks'>[] = [];
  listsSnapshot.forEach(doc => {
    lists.push({ id: doc.id, ...(doc.data() as Omit<TodoList, 'id' | 'tasks'>) });
  });
  return lists;
}

export async function createTodoList(listId: string, todoList: Omit<TodoList, 'id' | 'tasks'>): Promise<void> {
  await db.collection('todo_lists').doc(listId).set(todoList);
}

export async function deleteTodoList(listId: string): Promise<void> {
  const listRef = db.collection('todo_lists').doc(listId);
  const tasksSnapshot = await listRef.collection('tasks').get();

  const batch = db.batch();
  tasksSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  await listRef.delete();
}

export async function createTask(listId: string, task: Omit<Task, 'id'>): Promise<Task> {
    const newTaskRef = db.collection('todo_lists').doc(listId).collection('tasks').doc();
    const newTask = { ...task, id: newTaskRef.id };
    await newTaskRef.set(task);
    return newTask;
}

export async function updateTask(listId: string, taskId: string, task: Partial<Omit<Task, 'id'>>): Promise<void> {
  await db.collection('todo_lists').doc(listId).collection('tasks').doc(taskId).update(task);
}

export async function deleteTask(listId: string, taskId: string): Promise<void> {
  await db.collection('todo_lists').doc(listId).collection('tasks').doc(taskId).delete();
}

import { Task, TaskList, TaskStatus } from '../types';

const API_BASE_URL = '/api';

// Funções para a API de Listas

export const getLists = async (): Promise<TaskList[]> => {
  const response = await fetch(`${API_BASE_URL}/lists`);
  if (!response.ok) {
    throw new Error('Failed to fetch lists');
  }
  return response.json();
};

export const createList = async (name: string): Promise<TaskList> => {
  const response = await fetch(`${API_BASE_URL}/lists`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    throw new Error('Failed to create list');
  }
  return response.json();
};

// Funções para a API de Tarefas

export const getTasks = async (listId: string): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks`);
  if (!response.ok) {
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
};

export const createTask = async (listId: string, text: string, order: number): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/lists/${listId}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, order }),
  });
  if (!response.ok) {
    throw new Error('Failed to create task');
  }
  return response.json();
};

// A função updateTask agora aceita `status` no objeto de atualizações.
export const updateTask = async (taskId: string, updates: Partial<Pick<Task, 'text' | 'completed' | 'status' | 'order'>>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error('Failed to update task');
  }
  return response.json();
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete task');
  }
};

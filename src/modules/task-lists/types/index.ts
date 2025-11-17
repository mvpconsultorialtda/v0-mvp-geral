
// Defines the possible statuses for a task, representing the columns in the Kanban board.
export const taskStatuses = ['A Fazer', 'Em Andamento', 'Concluído'] as const;
export type TaskStatus = typeof taskStatuses[number];

export type MemberRole = 'editor' | 'viewer';

export interface Task {
  id: string;
  listId: string;
  text: string;
  // 'completed' is replaced by 'status' for a proper Kanban board implementation.
  status: TaskStatus;
  order: number;
  // Dates are standardized to string (ISO format) to prevent serialization issues.
  createdAt: string;
  description?: string;
  dueDate?: string | null;
}

export interface TaskList {
  id: string;
  name: string;
  ownerId: string;
  members: Record<string, MemberRole>;
  description: string;
  createdAt: string;
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    text: string;
    createdAt: string;
}

export interface Attachment {
    id: string;
    taskId: string;
    userId: string;
    url: string;
    name: string;
    createdAt: string;
}


export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type AccessPermission = "viewer" | "editor";

export interface TodoList {
  id: string;
  name: string;
  ownerId: string;
  accessControl: Record<string, AccessPermission>;
  tasks: Task[];
}

export interface TodoFilter {
  status: "all" | TaskStatus;
}

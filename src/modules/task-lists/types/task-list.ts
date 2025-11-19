export interface Task {
  id: string;
  text: string;
  completed: boolean;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string; // ISO date string
  tags?: string[];
}

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
  isEditing?: boolean;
}

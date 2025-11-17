export interface Task {
  id: string;
  text: string;
  completed: boolean;
  isEditing?: boolean;
}

export interface TaskList {
  id: string;
  name: string;
  tasks: Task[];
  isEditing?: boolean;
}

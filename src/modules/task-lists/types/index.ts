export interface Task {
  id: string;
  listId: string;
  text: string;
  completed: boolean;
  order: number;
  createdAt: Date;
}

export interface TaskList {
  id: string;
  name: string;
  ownerId: string;
  sharedWith: string[];
  description: string;
  createdAt: Date;
}

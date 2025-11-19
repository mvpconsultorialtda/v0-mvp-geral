export interface Task {
  id: string;
  columnId: string; // Foreign key to KanbanColumn
  text: string;
  completed: boolean; // Keeping for backward compatibility/checklist
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: string; // ISO date string
  tags?: string[];
  order: number; // For sorting within the column
}

export interface KanbanColumn {
  id: string;
  title: string;
  order: number;
}

// Helper type for the UI (denormalized view)
export interface KanbanBoardData {
  columns: {
    [key: string]: KanbanColumn & { tasks: Task[] };
  };
  columnOrder: string[];
}

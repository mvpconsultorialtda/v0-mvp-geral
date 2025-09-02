export type TodoStatus = "pending" | "in-progress" | "completed"

export interface Todo {
  id: string
  title: string
  description?: string
  status: TodoStatus
  priority: "low" | "medium" | "high"
  category?: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
}

export interface TodoList {
  todos: Todo[]
  categories: string[]
  lastUpdated: Date
}

export interface TodoFilter {
  status: "all" | TodoStatus
  priority?: "low" | "medium" | "high"
  category?: string
  search?: string
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  byPriority: Record<string, number>
  byCategory: Record<string, number>
}

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
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
  status: "all" | "completed" | "pending"
  priority?: "low" | "medium" | "high"
  category?: string
  search?: string
}

export interface TodoStats {
  total: number
  completed: number
  pending: number
  byPriority: Record<string, number>
  byCategory: Record<string, number>
}

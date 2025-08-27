import type { Todo, TodoList, TodoFilter, TodoStats } from "./types"

export class TodoListCore {
  private static instance: TodoListCore
  private todoList: TodoList = {
    todos: [],
    categories: [],
    lastUpdated: new Date(),
  }

  private readonly STORAGE_KEY = "todolist-data"

  static getInstance(): TodoListCore {
    if (!TodoListCore.instance) {
      TodoListCore.instance = new TodoListCore()
    }
    return TodoListCore.instance
  }

  constructor() {
    this.loadFromFile()
  }

  private saveToLocalStorage(): void {
    try {
      const dataToSave = {
        ...this.todoList,
        lastUpdated: this.todoList.lastUpdated.toISOString(),
        todos: this.todoList.todos.map((todo) => ({
          ...todo,
          createdAt: todo.createdAt.toISOString(),
          updatedAt: todo.updatedAt.toISOString(),
          dueDate: todo.dueDate?.toISOString(),
        })),
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToSave))
      console.log("[v0] Saved to localStorage successfully")
    } catch (error) {
      console.error("[v0] Failed to save to localStorage:", error)
    }
  }

  private loadFromLocalStorage(): boolean {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        this.todoList = {
          ...data,
          lastUpdated: new Date(data.lastUpdated),
          todos: data.todos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          })),
        }
        console.log("[v0] Loaded from localStorage successfully")
        return true
      }
    } catch (error) {
      console.error("[v0] Failed to load from localStorage:", error)
    }
    return false
  }

  private async loadFromFile(): Promise<void> {
    try {
      console.log("[v0] Attempting to load from file...")
      const response = await fetch("/api/todos")
      if (response.ok) {
        const data = await response.json()
        this.todoList = {
          ...data,
          lastUpdated: new Date(data.lastUpdated),
          todos: data.todos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          })),
        }
        console.log("[v0] Loaded from file successfully")
        this.saveToLocalStorage()
      } else {
        console.log("[v0] File load failed, trying localStorage...")
        this.loadFromLocalStorage()
      }
    } catch (error) {
      console.error("[v0] Failed to load todos from file:", error)
      console.log("[v0] Trying localStorage as fallback...")
      this.loadFromLocalStorage()
    }
  }

  private async saveToFile(): Promise<void> {
    try {
      this.todoList.lastUpdated = new Date()
      console.log("[v0] Attempting to save to file...")

      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.todoList),
      })

      if (response.ok) {
        console.log("[v0] Saved to file successfully")
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error("[v0] Failed to save todos to file:", error)
    }

    this.saveToLocalStorage()
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  async addTodo(todoData: Omit<Todo, "id" | "createdAt" | "updatedAt">): Promise<Todo> {
    const now = new Date()
    const newTodo: Todo = {
      ...todoData,
      id: this.generateId(),
      createdAt: now,
      updatedAt: now,
    }

    this.todoList.todos.push(newTodo)

    if (todoData.category && !this.todoList.categories.includes(todoData.category)) {
      this.todoList.categories.push(todoData.category)
    }

    await this.saveToFile()
    return newTodo
  }

  async updateTodo(id: string, updates: Partial<Omit<Todo, "id" | "createdAt">>): Promise<Todo | null> {
    const todoIndex = this.todoList.todos.findIndex((todo) => todo.id === id)
    if (todoIndex === -1) return null

    const updatedTodo = {
      ...this.todoList.todos[todoIndex],
      ...updates,
      updatedAt: new Date(),
    }

    this.todoList.todos[todoIndex] = updatedTodo

    if (updates.category && !this.todoList.categories.includes(updates.category)) {
      this.todoList.categories.push(updates.category)
    }

    await this.saveToFile()
    return updatedTodo
  }

  async deleteTodo(id: string): Promise<boolean> {
    const initialLength = this.todoList.todos.length
    this.todoList.todos = this.todoList.todos.filter((todo) => todo.id !== id)

    if (this.todoList.todos.length < initialLength) {
      await this.saveToFile()
      return true
    }
    return false
  }

  async toggleTodo(id: string): Promise<Todo | null> {
    const todo = this.todoList.todos.find((t) => t.id === id)
    if (!todo) return null

    return await this.updateTodo(id, { completed: !todo.completed })
  }

  getTodos(filter?: TodoFilter): Todo[] {
    let filteredTodos = [...this.todoList.todos]

    if (filter) {
      if (filter.status === "completed") {
        filteredTodos = filteredTodos.filter((todo) => todo.completed)
      } else if (filter.status === "pending") {
        filteredTodos = filteredTodos.filter((todo) => !todo.completed)
      }

      if (filter.priority) {
        filteredTodos = filteredTodos.filter((todo) => todo.priority === filter.priority)
      }

      if (filter.category) {
        filteredTodos = filteredTodos.filter((todo) => todo.category === filter.category)
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase()
        filteredTodos = filteredTodos.filter(
          (todo) =>
            todo.title.toLowerCase().includes(searchLower) || todo.description?.toLowerCase().includes(searchLower),
        )
      }
    }

    return filteredTodos.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
      if (priorityDiff !== 0) return priorityDiff
      return b.createdAt.getTime() - a.createdAt.getTime()
    })
  }

  getTodoById(id: string): Todo | null {
    return this.todoList.todos.find((todo) => todo.id === id) || null
  }

  getCategories(): string[] {
    return [...this.todoList.categories]
  }

  getStats(): TodoStats {
    const todos = this.todoList.todos
    const completed = todos.filter((t) => t.completed).length
    const pending = todos.length - completed

    const byPriority = todos.reduce(
      (acc, todo) => {
        acc[todo.priority] = (acc[todo.priority] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const byCategory = todos.reduce(
      (acc, todo) => {
        const category = todo.category || "Uncategorized"
        acc[category] = (acc[category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      total: todos.length,
      completed,
      pending,
      byPriority,
      byCategory,
    }
  }

  async clearCompleted(): Promise<number> {
    const initialLength = this.todoList.todos.length
    this.todoList.todos = this.todoList.todos.filter((todo) => !todo.completed)
    const removedCount = initialLength - this.todoList.todos.length

    if (removedCount > 0) {
      await this.saveToFile()
    }

    return removedCount
  }

  exportToJSON(): string {
    return JSON.stringify(this.todoList, null, 2)
  }

  async importFromJSON(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData)
      if (parsed.todos && Array.isArray(parsed.todos)) {
        this.todoList = {
          ...parsed,
          lastUpdated: new Date(parsed.lastUpdated || Date.now()),
          todos: parsed.todos.map((todo: any) => ({
            ...todo,
            createdAt: new Date(todo.createdAt),
            updatedAt: new Date(todo.updatedAt),
            dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined,
          })),
        }
        await this.saveToFile()
        return true
      }
      return false
    } catch (error) {
      console.error("[v0] Failed to import JSON:", error)
      return false
    }
  }

  async refreshFromFile(): Promise<void> {
    await this.loadFromFile()
  }
}

import { TodoListCore } from "./core"
export type { Todo, TodoList, TodoFilter, TodoStats } from "./types"

// Main API for easy usage
export const todoList = {
  core: TodoListCore.getInstance(),
}

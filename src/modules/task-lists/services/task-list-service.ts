import { TaskList, Task } from "../types/task-list";

const mockTaskLists: TaskList[] = [
  {
    id: "1",
    name: "Groceries",
    tasks: [
      { id: "101", text: "Buy milk", completed: false },
      { id: "102", text: "Buy eggs", completed: true },
    ],
  },
  {
    id: "2",
    name: "Work",
    tasks: [
      { id: "201", text: "Finish report", completed: false },
      { id: "202", text: "Meeting at 2pm", completed: false },
    ],
  },
];

export const TaskListService = {
  getTaskLists: async (): Promise<TaskList[]> => {
    return new Promise((resolve) =>
      setTimeout(() => resolve(mockTaskLists), 500)
    );
  },

  getTaskList: async (id: string): Promise<TaskList | null> => {
    const taskList = mockTaskLists.find((list) => list.id === id) || null;
    return new Promise((resolve) => setTimeout(() => resolve(taskList), 500));
  },

  createTaskList: async (newListName: string): Promise<TaskList> => {
    const newList: TaskList = {
      id: String(mockTaskLists.length + 1),
      name: newListName,
      tasks: [],
    };
    mockTaskLists.push(newList);
    return new Promise((resolve) => setTimeout(() => resolve(newList), 500));
  },

  updateTaskList: async (
    listId: string,
    updatedData: Partial<TaskList>
  ): Promise<void> => {
    const listIndex = mockTaskLists.findIndex((list) => list.id === listId);
    if (listIndex !== -1) {
      mockTaskLists[listIndex] = { ...mockTaskLists[listIndex], ...updatedData };
    }
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  deleteTaskList: async (listId: string): Promise<void> => {
    const listIndex = mockTaskLists.findIndex((list) => list.id === listId);
    if (listIndex !== -1) {
      mockTaskLists.splice(listIndex, 1);
    }
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  createTask: async (listId: string, taskText: string): Promise<Task> => {
    const list = mockTaskLists.find((list) => list.id === listId);
    if (list) {
      const newTask: Task = {
        id: String(list.tasks.length + 1),
        text: taskText,
        completed: false,
      };
      list.tasks.push(newTask);
      return new Promise((resolve) => setTimeout(() => resolve(newTask), 500));
    }
    throw new Error("List not found");
  },

  updateTask: async (
    listId: string,
    taskId: string,
    updatedData: Partial<Task>
  ): Promise<void> => {
    const list = mockTaskLists.find((list) => list.id === listId);
    if (list) {
      const taskIndex = list.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        list.tasks[taskIndex] = { ...list.tasks[taskIndex], ...updatedData };
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 500));
  },

  deleteTask: async (listId: string, taskId: string): Promise<void> => {
    const list = mockTaskLists.find((list) => list.id === listId);
    if (list) {
      const taskIndex = list.tasks.findIndex((task) => task.id === taskId);
      if (taskIndex !== -1) {
        list.tasks.splice(taskIndex, 1);
      }
    }
    return new Promise((resolve) => setTimeout(resolve, 500));
  },
};

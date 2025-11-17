"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { TaskList, Task } from "../types/task-list";
import { TaskListService } from "../services/task-list-service";

interface TaskListContextType {
  taskLists: TaskList[];
  loading: boolean;
  createTaskList: (name: string) => void;
  updateTaskList: (id: string, updatedData: Partial<TaskList>) => void;
  deleteTaskList: (id: string) => void;
  createTask: (listId: string, taskText: string) => void;
  updateTask: (listId: string, taskId: string, updatedData: Partial<Task>) => void;
  deleteTask: (listId: string, taskId: string) => void;
}

const TaskListContext = createContext<TaskListContextType | undefined>(
  undefined
);

export const TaskListProvider = ({ children }: { children: ReactNode }) => {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskLists = async () => {
      setLoading(true);
      const lists = await TaskListService.getTaskLists();
      setTaskLists(lists);
      setLoading(false);
    };
    fetchTaskLists();
  }, []);

  const createTaskList = async (name: string) => {
    const newList = await TaskListService.createTaskList(name);
    setTaskLists((prevLists) => [...prevLists, newList]);
  };

  const updateTaskList = async (
    id: string,
    updatedData: Partial<TaskList>
  ) => {
    await TaskListService.updateTaskList(id, updatedData);
    setTaskLists((prevLists) =>
      prevLists.map((list) =>
        list.id === id ? { ...list, ...updatedData } : list
      )
    );
  };

  const deleteTaskList = async (id: string) => {
    await TaskListService.deleteTaskList(id);
    setTaskLists((prevLists) => prevLists.filter((list) => list.id !== id));
  };

  const createTask = async (listId: string, taskText: string) => {
    const newTask = await TaskListService.createTask(listId, taskText);
    setTaskLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? { ...list, tasks: [...(list.tasks || []), newTask] }
          : list
      )
    );
  };

  const updateTask = async (
    listId: string,
    taskId: string,
    updatedData: Partial<Task>
  ) => {
    await TaskListService.updateTask(listId, taskId, updatedData);
    setTaskLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updatedData } : task
              ),
            }
          : list
      )
    );
  };

  const deleteTask = async (listId: string, taskId: string) => {
    await TaskListService.deleteTask(listId, taskId);
    setTaskLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId
          ? { ...list, tasks: list.tasks.filter((task) => task.id !== taskId) }
          : list
      )
    );
  };

  return (
    <TaskListContext.Provider
      value={{
        taskLists,
        loading,
        createTaskList,
        updateTaskList,
        deleteTaskList,
        createTask,
        updateTask,
        deleteTask,
      }}
    >
      {children}
    </TaskListContext.Provider>
  );
};

export const useTaskList = (): TaskListContextType => {
  const context = useContext(TaskListContext);
  if (context === undefined) {
    throw new Error("useTaskList must be used within a TaskListProvider");
  }
  return context;
};

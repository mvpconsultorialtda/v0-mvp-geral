"use client";

import useSWR, { mutate } from "swr";
import { TaskList, Task } from "../types/task-list";
import { TaskListService } from "../services/task-list-service";

const TASK_LISTS_KEY = "taskLists";

export const useTaskList = () => {
  const {
    data: taskLists = [],
    error,
    isLoading,
    mutate: mutateTaskLists,
  } = useSWR<TaskList[]>(TASK_LISTS_KEY, TaskListService.getTaskLists);

  const createTaskList = async (name: string) => {
    // Optimistic update
    const tempId = Date.now().toString();
    const optimisticList: TaskList = { id: tempId, name, tasks: [] };

    await mutateTaskLists(
      async (currentLists) => {
        const newList = await TaskListService.createTaskList(name);
        return [...(currentLists || []), newList];
      },
      {
        optimisticData: (currentLists) => [...(currentLists || []), optimisticList],
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const updateTaskList = async (id: string, updatedData: Partial<TaskList>) => {
    await mutateTaskLists(
      async (currentLists) => {
        await TaskListService.updateTaskList(id, updatedData);
        return (currentLists || []).map((list) =>
          list.id === id ? { ...list, ...updatedData } : list
        );
      },
      {
        optimisticData: (currentLists) =>
          (currentLists || []).map((list) =>
            list.id === id ? { ...list, ...updatedData } : list
          ),
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const deleteTaskList = async (id: string) => {
    await mutateTaskLists(
      async (currentLists) => {
        await TaskListService.deleteTaskList(id);
        return (currentLists || []).filter((list) => list.id !== id);
      },
      {
        optimisticData: (currentLists) =>
          (currentLists || []).filter((list) => list.id !== id),
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const createTask = async (listId: string, taskText: string) => {
    await mutateTaskLists(
      async (currentLists) => {
        const newTask = await TaskListService.createTask(listId, taskText);
        return (currentLists || []).map((list) =>
          list.id === listId
            ? { ...list, tasks: [...(list.tasks || []), newTask] }
            : list
        );
      },
      {
        revalidate: true, // Revalidate to ensure ID sync
      }
    );
  };

  const updateTask = async (
    listId: string,
    taskId: string,
    updatedData: Partial<Task>
  ) => {
    await mutateTaskLists(
      async (currentLists) => {
        await TaskListService.updateTask(listId, taskId, updatedData);
        return (currentLists || []).map((list) =>
          list.id === listId
            ? {
              ...list,
              tasks: list.tasks.map((task) =>
                task.id === taskId ? { ...task, ...updatedData } : task
              ),
            }
            : list
        );
      },
      {
        optimisticData: (currentLists) =>
          (currentLists || []).map((list) =>
            list.id === listId
              ? {
                ...list,
                tasks: list.tasks.map((task) =>
                  task.id === taskId ? { ...task, ...updatedData } : task
                ),
              }
              : list
          ),
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  const deleteTask = async (listId: string, taskId: string) => {
    await mutateTaskLists(
      async (currentLists) => {
        await TaskListService.deleteTask(listId, taskId);
        return (currentLists || []).map((list) =>
          list.id === listId
            ? {
              ...list,
              tasks: list.tasks.filter((task) => task.id !== taskId),
            }
            : list
        );
      },
      {
        optimisticData: (currentLists) =>
          (currentLists || []).map((list) =>
            list.id === listId
              ? {
                ...list,
                tasks: list.tasks.filter((task) => task.id !== taskId),
              }
              : list
          ),
        rollbackOnError: true,
        revalidate: false,
      }
    );
  };

  return {
    taskLists,
    loading: isLoading,
    error,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    createTask,
    updateTask,
    deleteTask,
    moveTask: async (sourceListId: string, destListId: string, taskId: string, newIndex: number) => {
      await mutateTaskLists(
        async (currentLists) => {
          await TaskListService.moveTask(sourceListId, destListId, taskId, newIndex);

          // Re-fetch or return calculated state
          // For simplicity in complex moves, we might just return the result of a fetch or manually calculate
          // Manual calculation:
          const newLists = JSON.parse(JSON.stringify(currentLists || [])) as TaskList[];

          const sourceList = newLists.find(l => l.id === sourceListId);
          const destList = newLists.find(l => l.id === destListId);

          if (!sourceList || !destList) return newLists;

          // Remove from source
          const taskIndex = sourceList.tasks.findIndex(t => t.id === taskId);
          if (taskIndex === -1) return newLists;
          const [movedTask] = sourceList.tasks.splice(taskIndex, 1);

          // Add to dest
          if (sourceListId === destListId) {
            sourceList.tasks.splice(newIndex, 0, movedTask);
          } else {
            destList.tasks.splice(newIndex, 0, movedTask);
          }

          return newLists;
        },
        {
          optimisticData: (currentLists) => {
            const newLists = JSON.parse(JSON.stringify(currentLists || [])) as TaskList[];

            const sourceList = newLists.find(l => l.id === sourceListId);
            const destList = newLists.find(l => l.id === destListId);

            if (!sourceList || !destList) return newLists;

            // Remove from source
            const taskIndex = sourceList.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return newLists;
            const [movedTask] = sourceList.tasks.splice(taskIndex, 1);

            // Add to dest
            if (sourceListId === destListId) {
              sourceList.tasks.splice(newIndex, 0, movedTask);
            } else {
              destList.tasks.splice(newIndex, 0, movedTask);
            }

            return newLists;
          },
          rollbackOnError: true,
          revalidate: false,
        }
      );
    },
  };
};

"use client";

import useSWR, { mutate } from "swr";
import { TaskListService } from "../services/task-list-service";
import { KanbanColumn, Task, KanbanBoardData } from "../types/task-list";
import { useMemo } from "react";

const COLUMNS_KEY = "columns";
const TASKS_KEY = "tasks";

export const useTaskList = () => {
  // Fetch Columns
  const {
    data: columns,
    error: columnsError,
    isLoading: columnsLoading,
    mutate: mutateColumns,
  } = useSWR(COLUMNS_KEY, TaskListService.getColumns);

  // Fetch Tasks
  const {
    data: tasks,
    error: tasksError,
    isLoading: tasksLoading,
    mutate: mutateTasks,
  } = useSWR(TASKS_KEY, TaskListService.getTasks);

  // Derived State: Combine Columns and Tasks for UI
  const boardData: KanbanBoardData = useMemo(() => {
    if (!columns || !tasks) return { columns: {}, columnOrder: [] };

    const columnsMap: { [key: string]: KanbanColumn & { tasks: Task[] } } = {};
    const columnOrder = columns.map((col) => col.id);

    // Initialize columns with empty tasks
    columns.forEach((col) => {
      columnsMap[col.id] = { ...col, tasks: [] };
    });

    // Distribute tasks to columns
    tasks.forEach((task) => {
      if (columnsMap[task.columnId]) {
        columnsMap[task.columnId].tasks.push(task);
      }
    });

    // Sort tasks within columns
    Object.values(columnsMap).forEach((col) => {
      col.tasks.sort((a, b) => a.order - b.order);
    });

    return { columns: columnsMap, columnOrder };
  }, [columns, tasks]);

  // --- Actions ---

  const createColumn = async (title: string) => {
    const newOrder = columns ? columns.length : 0;
    await TaskListService.createColumn(title, newOrder);
    mutateColumns();
  };

  const updateColumn = async (id: string, data: Partial<KanbanColumn>) => {
    await TaskListService.updateColumn(id, data);
    mutateColumns();
  };

  const deleteColumn = async (id: string) => {
    await TaskListService.deleteColumn(id);
    mutateColumns();
  };

  const createTask = async (columnId: string, text: string) => {
    const columnTasks = tasks?.filter(t => t.columnId === columnId) || [];
    const newOrder = columnTasks.length;
    await TaskListService.createTask(columnId, text, newOrder);
    mutateTasks();
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    // Optimistic Update could be implemented here
    await TaskListService.updateTask(taskId, data);
    mutateTasks();
  };

  const deleteTask = async (taskId: string) => {
    await TaskListService.deleteTask(taskId);
    mutateTasks();
  };

  const moveTask = async (
    taskId: string,
    sourceColumnId: string,
    targetColumnId: string,
    newIndex: number
  ) => {
    if (!tasks) return;

    // Optimistic Update Logic
    const updatedTasks = [...tasks];
    const taskIndex = updatedTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = { ...updatedTasks[taskIndex] };

    // Remove from old position logic (conceptually)
    // In a real optimistic update, we'd need to re-calculate orders for all affected tasks
    // For simplicity, we'll just call the service and re-fetch for now, 
    // or implement a simple "optimistic" swap in local state if needed.
    // Given the complexity of reordering, let's rely on the service batch update.

    // Calculate new order
    // This is complex because "newIndex" is relative to the target column's tasks
    // We need to know the order of the task *before* and *after* the new position in the target column

    const targetTasks = tasks
      .filter(t => t.columnId === targetColumnId && t.id !== taskId)
      .sort((a, b) => a.order - b.order);

    let newOrder = 0;
    if (targetTasks.length === 0) {
      newOrder = 0;
    } else if (newIndex === 0) {
      newOrder = targetTasks[0].order - 100; // Arbitrary gap
    } else if (newIndex >= targetTasks.length) {
      newOrder = targetTasks[targetTasks.length - 1].order + 100;
    } else {
      const prevTask = targetTasks[newIndex - 1];
      const nextTask = targetTasks[newIndex];
      newOrder = (prevTask.order + nextTask.order) / 2;
    }

    // Update the task locally for immediate feedback (partial optimistic)
    task.columnId = targetColumnId;
    task.order = newOrder;
    updatedTasks[taskIndex] = task;

    mutateTasks(updatedTasks, false); // Update local cache without revalidation yet

    await TaskListService.moveTask(taskId, targetColumnId, newOrder);
    mutateTasks(); // Revalidate to get consistent state from server
  };

  return {
    boardData,
    loading: columnsLoading || tasksLoading,
    error: columnsError || tasksError,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
};

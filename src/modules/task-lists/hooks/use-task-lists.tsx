import { useState, useEffect, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { TaskListService } from "../services/task-list-service";
import { Task, KanbanColumn, KanbanBoardData } from "../types/task-list";
import { Workspace, Board } from "../types/workspace";

export const useTaskList = (selectedBoardId?: string) => {
  // --- Workspaces & Boards Data ---
  const { data: workspaces, error: workspacesError, mutate: mutateWorkspaces } = useSWR<Workspace[]>(
    "workspaces",
    () => TaskListService.getWorkspaces("demo-user")
  );

  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string | null>(null);

  const { data: boards, error: boardsError, mutate: mutateBoards } = useSWR<Board[]>(
    selectedWorkspaceId ? `boards-${selectedWorkspaceId}` : null,
    () => selectedWorkspaceId ? TaskListService.getBoards(selectedWorkspaceId) : Promise.resolve([])
  );

  // --- Kanban Data (Columns & Tasks) ---
  const { data: columns, error: columnsError, mutate: mutateColumns } = useSWR<KanbanColumn[]>(
    selectedBoardId ? `columns-${selectedBoardId}` : null,
    () => selectedBoardId ? TaskListService.getColumns(selectedBoardId) : Promise.resolve([])
  );

  const { data: tasks, error: tasksError, mutate: mutateTasks } = useSWR<Task[]>(
    columns && columns.length > 0 ? `tasks-${columns.map(c => c.id).join('-')}` : null,
    () => columns && columns.length > 0 ? TaskListService.getTasks(columns.map(c => c.id)) : Promise.resolve([])
  );

  const boardData: KanbanBoardData = useMemo(() => {
    if (!columns) return { columns: {}, columnOrder: [] };

    const columnsMap: Record<string, { id: string; title: string; tasks: Task[]; order: number }> = {};

    columns.forEach((col) => {
      columnsMap[col.id] = {
        id: col.id,
        title: col.title,
        order: col.order,
        tasks: tasks?.filter((t) => t.columnId === col.id).sort((a, b) => a.order - b.order) || [],
      };
    });

    const columnOrder = columns.sort((a, b) => a.order - b.order).map((c) => c.id);

    return { columns: columnsMap, columnOrder };
  }, [columns, tasks]);

  // --- Actions ---

  const createWorkspace = async (name: string) => {
    await TaskListService.createWorkspace(name);
    mutateWorkspaces();
  };

  const deleteWorkspace = async (id: string) => {
    await TaskListService.deleteWorkspace(id);
    mutateWorkspaces();
    if (selectedWorkspaceId === id) setSelectedWorkspaceId(null);
  };

  const createBoard = async (workspaceId: string, name: string) => {
    await TaskListService.createBoard(workspaceId, name);
    mutateBoards();
  };

  const deleteBoard = async (id: string) => {
    await TaskListService.deleteBoard(id);
    mutateBoards();
  };

  const createColumn = async (boardId: string, title: string) => {
    await TaskListService.createColumn(boardId, title);
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
    await TaskListService.createTask(columnId, text);
    mutateTasks();
  };

  const updateTask = async (taskId: string, data: Partial<Task>) => {
    // Optimistic update could be added here
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
    destinationColumnId: string,
    newIndex: number
  ) => {
    // Optimistic Update Logic
    const currentTasks = tasks || [];
    const taskToMove = currentTasks.find(t => t.id === taskId);
    if (!taskToMove) return;

    // Insert at new pos (this is a simplified optimistic logic, real one needs precise ordering)
    // For now, we rely on re-fetch for perfect order, but we can optimistically update the UI state if needed.
    // Since we use SWR, simply calling mutate with the promise will handle it.

    await TaskListService.moveTask(taskId, sourceColumnId, destinationColumnId, newIndex);
    mutateTasks();
  };

  return {
    workspaces,
    boards,
    boardData,
    loading: !workspaces && !workspacesError, // Simplified loading state
    error: workspacesError || boardsError || columnsError || tasksError,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
    createWorkspace,
    deleteWorkspace,
    createBoard,
    deleteBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  };
};

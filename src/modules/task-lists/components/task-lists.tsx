"use client";

import { useTaskList } from "../hooks/use-task-lists";
import { FaPlus, FaTimes, FaList } from "react-icons/fa";
import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";
import { Sidebar } from "./sidebar";

import { TaskDetailsModal } from "./task-details-modal";
import { Task } from "../types/task-list";

export const TaskLists = () => {
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);

  const {
    workspaces,
    boards,
    boardData,
    loading,
    error,
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
  } = useTaskList(selectedBoardId || undefined);

  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateList = async () => {
    if (newListName.trim() && selectedBoardId) {
      await createColumn(selectedBoardId, newListName);
      setNewListName("");
      setIsCreatingList(false);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "task") {
      moveTask(
        draggableId,
        source.droppableId,
        destination.droppableId,
        destination.index
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen" aria-label="Loading task lists">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Failed to load task lists
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        workspaces={workspaces || []}
        boards={boards || []}
        selectedWorkspaceId={selectedWorkspaceId}
        selectedBoardId={selectedBoardId}
        onSelectWorkspace={setSelectedWorkspaceId}
        onSelectBoard={setSelectedBoardId}
        onCreateWorkspace={createWorkspace}
        onDeleteWorkspace={deleteWorkspace}
        onCreateBoard={createBoard}
        onDeleteBoard={deleteBoard}
      />

      {/* Main Content */}
      <div className="flex-grow flex flex-col h-full overflow-hidden bg-blue-500">
        {/* Header */}
        <div className="h-14 bg-blue-600 flex items-center px-4 shadow-md z-10">
          <h1 className="text-white font-bold text-lg">
            {selectedBoardId
              ? boards?.find(b => b.id === selectedBoardId)?.name
              : "Select a List"}
          </h1>
        </div>

        {/* Board Area */}
        {selectedBoardId ? (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-grow overflow-x-auto overflow-y-hidden">
              <div className="h-full flex items-start p-4 gap-4">

                {/* Columns */}
                <Droppable droppableId="all-columns" direction="horizontal" type="column">
                  {(provided) => (
                    <div
                      className="flex gap-4 h-full"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {boardData.columnOrder.map((columnId, index) => {
                        const column = boardData.columns[columnId];
                        const listProp = {
                          id: column.id,
                          name: column.title,
                          tasks: column.tasks,
                        };

                        return (
                          <KanbanColumn
                            key={column.id}
                            list={listProp}
                            index={index}
                            onUpdateList={(id, data) => updateColumn(id, { title: data.name })}
                            onDeleteList={deleteColumn}
                            onCreateTask={createTask}
                            onUpdateTask={(listId, taskId, data) => updateTask(taskId, data)}
                            onDeleteTask={(listId, taskId) => deleteTask(taskId)}
                            onTaskClick={setSelectedTask}
                          />
                        );
                      })}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add List (Column) Button */}
                <div className="w-80 flex-shrink-0">
                  {isCreatingList ? (
                    <div className="bg-gray-100 p-3 rounded-xl shadow-sm">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter column title..."
                        className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCreateList}
                          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          Add Column
                        </button>
                        <button
                          onClick={() => setIsCreatingList(false)}
                          className="text-gray-500 hover:text-gray-700 px-2"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsCreatingList(true)}
                      className="w-full bg-white/20 hover:bg-white/30 text-white p-3 rounded-xl flex items-center gap-2 transition-colors text-left font-medium"
                    >
                      <FaPlus /> Add another column
                    </button>
                  )}
                </div>
              </div>
            </div>
          </DragDropContext>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center text-white/80">
            <FaList size={48} className="mb-4 opacity-50" />
            <h2 className="text-xl font-semibold">Select a List from the sidebar</h2>
            <p className="mt-2">Or create a new Workspace and List to get started.</p>
          </div>
        )}

        {/* Task Details Modal */}
        {selectedTask && (
          <TaskDetailsModal
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
            task={selectedTask}
            onUpdate={(updatedData) => updateTask(selectedTask.id, updatedData)}
          />
        )}
      </div>
    </div>
  );
};

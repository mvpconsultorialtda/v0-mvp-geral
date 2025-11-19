"use client";

import { useTaskList } from "../hooks/use-task-lists";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";

export const TaskLists = () => {
  const {
    taskLists,
    loading,
    error,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTaskList();

  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);

  const handleCreateList = async () => {
    if (newListName.trim()) {
      await createTaskList(newListName);
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

    // Handle Column Dragging (if we implement it later, type === 'column')
    // For now, we only handle tasks
    if (type === "task") {
      moveTask(
        source.droppableId,
        destination.droppableId,
        draggableId,
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
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-screen flex flex-col bg-blue-500 overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-blue-600 flex items-center px-4 shadow-md z-10">
          <h1 className="text-white font-bold text-lg">My Kanban Board</h1>
        </div>

        {/* Board Area */}
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
                  {taskLists.map((list, index) => (
                    <KanbanColumn
                      key={list.id}
                      list={list}
                      index={index}
                      onUpdateList={updateTaskList}
                      onDeleteList={deleteTaskList}
                      onCreateTask={createTask}
                      onUpdateTask={updateTask}
                      onDeleteTask={deleteTask}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add List Button */}
            <div className="w-80 flex-shrink-0">
              {isCreatingList ? (
                <div className="bg-gray-100 p-3 rounded-xl shadow-sm">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list title..."
                    className="w-full p-2 mb-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleCreateList}
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Add List
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
                  <FaPlus /> Add another list
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};

"use client";

"use client";

import { useTaskList } from "../hooks/use-task-lists";
import { FaPlus, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { KanbanColumn } from "./kanban-column";

import { TaskDetailsModal } from "./task-details-modal";
import { Task } from "../types/task-list";

export const TaskLists = () => {
  const {
    boardData,
    loading,
    error,
    createColumn,
    updateColumn,
    deleteColumn,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
  } = useTaskList();

  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleCreateList = async () => {
    if (newListName.trim()) {
      await createColumn(newListName);
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
                  {boardData.columnOrder.map((columnId, index) => {
                    const column = boardData.columns[columnId];
                    // Map KanbanColumn (with tasks) to the props expected by KanbanColumn component
                    // Note: We need to adapt KanbanColumn component props slightly or map here
                    // The KanbanColumn component expects 'list' which is TaskList interface
                    // Our new structure is KanbanColumn interface + tasks array.
                    // Let's map it to match the expected prop structure for now.
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
    </DragDropContext>
  );
};

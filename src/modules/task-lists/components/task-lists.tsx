"use client";

import { useState } from "react";
import { useTaskList } from "../hooks/use-task-lists";
import { FaPlus } from "react-icons/fa";
import { TaskListCard } from "./task-list-card";

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
  } = useTaskList();

  const [newListName, setNewListName] = useState("");

  const handleCreateTaskList = () => {
    if (newListName.trim() !== "") {
      createTaskList(newListName);
      setNewListName("");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        Error loading task lists.
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 border-b pb-4">
          Task Lists
        </h1>

        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter new list name"
              className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition outline-none"
              onKeyDown={(e) => e.key === "Enter" && handleCreateTaskList()}
            />
            <button
              onClick={handleCreateTaskList}
              disabled={!newListName.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <FaPlus />
              Create List
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          {taskLists.map((list) => (
            <TaskListCard
              key={list.id}
              list={list}
              onUpdateList={updateTaskList}
              onDeleteList={deleteTaskList}
              onCreateTask={createTask}
              onUpdateTask={updateTask}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>

        {taskLists.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No task lists found. Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};

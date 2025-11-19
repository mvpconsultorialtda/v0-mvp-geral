"use client";

import { Task } from "../types/task-list";
import { FaTrash, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useState } from "react";

interface TaskListItemProps {
  task: Task;
  onUpdate: (task: Task, completed?: boolean) => void;
  onDelete: (taskId: string) => void;
}

export const TaskListItem = ({ task, onUpdate, onDelete }: TaskListItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);

  const handleSave = () => {
    if (editText.trim()) {
      onUpdate({ ...task, text: editText });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditText(task.text);
    setIsEditing(false);
  };

  return (
    <li className="flex items-center justify-between p-3 bg-gray-100 rounded-lg">
      <div className="flex items-center gap-4 flex-grow">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={(e) => onUpdate(task, e.target.checked)}
          className="form-checkbox h-5 w-5 text-blue-600"
        />
        {isEditing ? (
          <div className="flex items-center gap-2 flex-grow">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="p-1 border rounded-md flex-grow"
              autoFocus
            />
            <button
              onClick={handleSave}
              className="text-green-500 hover:text-green-700"
              aria-label={`Save task ${task.text}`}
            >
              <FaSave />
            </button>
            <button
              onClick={handleCancel}
              className="text-red-500 hover:text-red-700"
              aria-label={`Cancel editing task ${task.text}`}
            >
              <FaTimes />
            </button>
          </div>
        ) : (
          <span
            className={`flex-grow ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {task.text}
          </span>
        )}
      </div>
      {!isEditing && (
        <div className="flex gap-3 ml-4">
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-gray-500 hover:text-blue-500"
            aria-label={`Edit task ${task.text}`}
          >
            <FaEdit />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="text-sm text-gray-500 hover:text-red-500"
            aria-label={`Delete task ${task.text}`}
          >
            <FaTrash />
          </button>
        </div>
      )}
    </li>
  );
};

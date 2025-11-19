"use client";

import { TaskList, Task } from "../types/task-list";
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { TaskListItem } from "./task-list-item";

interface TaskListCardProps {
    list: TaskList;
    onUpdateList: (id: string, data: Partial<TaskList>) => void;
    onDeleteList: (id: string) => void;
    onCreateTask: (listId: string, text: string) => void;
    onUpdateTask: (listId: string, taskId: string, data: Partial<Task>) => void;
    onDeleteTask: (listId: string, taskId: string) => void;
}

export const TaskListCard = ({
    list,
    onUpdateList,
    onDeleteList,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
}: TaskListCardProps) => {
    const [isEditingList, setIsEditingList] = useState(false);
    const [editListName, setEditListName] = useState(list.name);
    const [newTaskText, setNewTaskText] = useState("");

    const handleSaveList = () => {
        if (editListName.trim()) {
            onUpdateList(list.id, { name: editListName });
            setIsEditingList(false);
        }
    };

    const handleCreateTask = () => {
        if (newTaskText.trim()) {
            onCreateTask(list.id, newTaskText);
            setNewTaskText("");
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-center mb-4">
                {isEditingList ? (
                    <div className="flex items-center gap-2 flex-grow mr-4">
                        <input
                            type="text"
                            value={editListName}
                            onChange={(e) => setEditListName(e.target.value)}
                            className="p-2 border rounded-lg flex-grow"
                            autoFocus
                        />
                        <button
                            onClick={handleSaveList}
                            className="text-green-500 hover:text-green-700"
                            aria-label={`Save list ${list.name}`}
                        >
                            <FaSave />
                        </button>
                        <button
                            onClick={() => {
                                setEditListName(list.name);
                                setIsEditingList(false);
                            }}
                            className="text-red-500 hover:text-red-700"
                            aria-label={`Cancel editing list ${list.name}`}
                        >
                            <FaTimes />
                        </button>
                    </div>
                ) : (
                    <h2 className="text-2xl font-semibold truncate mr-4" title={list.name}>
                        {list.name}
                    </h2>
                )}
                <div className="flex gap-4 flex-shrink-0">
                    {!isEditingList && (
                        <button
                            onClick={() => setIsEditingList(true)}
                            className="text-gray-500 hover:text-blue-500"
                            aria-label={`Edit list ${list.name}`}
                        >
                            <FaEdit />
                        </button>
                    )}
                    <button
                        onClick={() => onDeleteList(list.id)}
                        className="text-gray-500 hover:text-red-500"
                        aria-label={`Delete list ${list.name}`}
                    >
                        <FaTrash />
                    </button>
                </div>
            </div>

            <div className="mb-4">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="Add a new task"
                        className="flex-grow p-2 border rounded-lg"
                        onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                    />
                    <button
                        onClick={handleCreateTask}
                        className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                        aria-label={`Add task to ${list.name}`}
                    >
                        <FaPlus />
                    </button>
                </div>
            </div>

            <ul className="space-y-3">
                {list.tasks?.map((task) => (
                    <TaskListItem
                        key={task.id}
                        task={task}
                        onUpdate={(updatedTask, completed) =>
                            onUpdateTask(list.id, task.id, {
                                ...updatedTask,
                                completed: completed ?? updatedTask.completed,
                            })
                        }
                        onDelete={(taskId) => onDeleteTask(list.id, taskId)}
                    />
                ))}
                {(!list.tasks || list.tasks.length === 0) && (
                    <li className="text-gray-400 text-center py-4 italic">
                        No tasks yet
                    </li>
                )}
            </ul>
        </div>
    );
};

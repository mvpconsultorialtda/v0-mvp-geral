"use client";

import { useState, useEffect } from "react";
import { Task } from "../types/task-list";
import { FaTimes, FaSave } from "react-icons/fa";

interface TaskDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    task: Task;
    onUpdate: (updatedTask: Partial<Task>) => void;
}

export const TaskDetailsModal = ({
    isOpen,
    onClose,
    task,
    onUpdate,
}: TaskDetailsModalProps) => {
    const [text, setText] = useState(task.text);
    const [description, setDescription] = useState(task.description || "");
    const [priority, setPriority] = useState<"low" | "medium" | "high">(
        task.priority || "medium"
    );
    const [dueDate, setDueDate] = useState(task.dueDate || "");

    // Reset state when task changes
    useEffect(() => {
        setText(task.text);
        setDescription(task.description || "");
        setPriority(task.priority || "medium");
        setDueDate(task.dueDate || "");
    }, [task]);

    if (!isOpen) return null;

    const handleSave = () => {
        onUpdate({
            text,
            description,
            priority,
            dueDate,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4 animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close modal"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder="Task title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                            placeholder="Add a more detailed description..."
                        />
                    </div>

                    {/* Priority & Due Date Row */}
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Priority
                            </label>
                            <select
                                value={priority}
                                onChange={(e) =>
                                    setPriority(e.target.value as "low" | "medium" | "high")
                                }
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Due Date
                            </label>
                            <input
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <FaSave /> Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

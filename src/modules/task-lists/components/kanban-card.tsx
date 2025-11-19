"use client";

import { Task } from "../types/task-list";
import { FaTrash, FaEdit, FaClock, FaFlag } from "react-icons/fa";
import { Draggable } from "@hello-pangea/dnd";
import { useState } from "react";

interface KanbanCardProps {
    task: Task;
    index: number;
    onUpdate: (task: Task) => void;
    onDelete: (taskId: string) => void;
}

export const KanbanCard = ({ task, index, onUpdate, onDelete }: KanbanCardProps) => {
    const [isHovered, setIsHovered] = useState(false);

    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "high": return "text-red-500 bg-red-50";
            case "medium": return "text-yellow-500 bg-yellow-50";
            case "low": return "text-blue-500 bg-blue-50";
            default: return "text-gray-400";
        }
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition-shadow ${snapshot.isDragging ? "shadow-lg ring-2 ring-blue-500 rotate-2" : ""
                        }`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className="flex justify-between items-start mb-2">
                        {/* Tags (Placeholder for now) */}
                        <div className="flex gap-1 flex-wrap">
                            {task.priority && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${getPriorityColor(task.priority)}`}>
                                    {task.priority}
                                </span>
                            )}
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className={`text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity`}
                            aria-label={`Delete task ${task.text}`}
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>

                    <div className="text-sm text-gray-800 font-medium mb-2 break-words">
                        {task.text}
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-2">
                            {task.dueDate && (
                                <div className="flex items-center gap-1 text-orange-400">
                                    <FaClock size={10} />
                                    <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>

                        {/* Placeholder for checklist count or comments count */}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

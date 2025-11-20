"use client";

import { Task } from "../types/task-list";
import { FaTrash, FaClock } from "react-icons/fa";
import { Draggable } from "@hello-pangea/dnd";

interface KanbanCardProps {
    task: Task;
    index: number;
    onUpdate: (updatedTask: Partial<Task>) => void;
    onDelete: (taskId: string) => void;
    onClick: (task: Task) => void;
}

export const KanbanCard = ({
    task,
    index,
    onUpdate,
    onDelete,
    onClick,
}: KanbanCardProps) => {
    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    onClick={() => onClick(task)}
                    className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 group hover:shadow-md transition-all cursor-pointer ${snapshot.isDragging ? "rotate-2 shadow-lg ring-2 ring-blue-500 ring-opacity-50" : ""
                        }`}
                >
                    <div className="flex justify-between items-start gap-2">
                        <span className="text-gray-700 text-sm font-medium leading-snug break-words">
                            {task.text}
                        </span>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(task.id);
                            }}
                            className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Delete task ${task.text}`}
                        >
                            <FaTrash size={12} />
                        </button>
                    </div>

                    {/* Metadata Badges */}
                    {(task.priority || task.dueDate) && (
                        <div className="mt-2 flex gap-2 flex-wrap">
                            {task.priority && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider ${task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-green-100 text-green-700'
                                    }`}>
                                    {task.priority}
                                </span>
                            )}
                            {task.dueDate && (
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                                    <FaClock size={10} />
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

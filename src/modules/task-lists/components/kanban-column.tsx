"use client";

import { TaskList, Task } from "../types/task-list";
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from "react-icons/fa";
import { useState } from "react";
import { KanbanCard } from "./kanban-card";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface KanbanColumnProps {
    list: TaskList;
    index: number;
    onUpdateList: (id: string, data: Partial<TaskList>) => void;
    onDeleteList: (id: string) => void;
    onCreateTask: (listId: string, text: string) => void;
    onUpdateTask: (listId: string, taskId: string, data: Partial<Task>) => void;
    onDeleteTask: (listId: string, taskId: string) => void;
}

export const KanbanColumn = ({
    list,
    index,
    onUpdateList,
    onDeleteList,
    onCreateTask,
    onUpdateTask,
    onDeleteTask,
}: KanbanColumnProps) => {
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
        <Draggable draggableId={list.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className="bg-gray-100 rounded-xl shadow-sm w-80 flex-shrink-0 flex flex-col max-h-full"
                >
                    {/* Column Header */}
                    <div
                        {...provided.dragHandleProps}
                        className="p-4 flex justify-between items-center border-b border-gray-200"
                    >
                        {isEditingList ? (
                            <div className="flex items-center gap-2 flex-grow">
                                <input
                                    type="text"
                                    value={editListName}
                                    onChange={(e) => setEditListName(e.target.value)}
                                    className="p-1 border rounded text-sm flex-grow"
                                    autoFocus
                                />
                                <button onClick={handleSaveList} className="text-green-600">
                                    <FaSave />
                                </button>
                                <button
                                    onClick={() => {
                                        setEditListName(list.name);
                                        setIsEditingList(false);
                                    }}
                                    className="text-red-600"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ) : (
                            <h2 className="font-bold text-gray-700 truncate flex-grow">
                                {list.name}
                                <span className="ml-2 text-xs font-normal text-gray-500">
                                    {list.tasks.length}
                                </span>
                            </h2>
                        )}

                        <div className="flex gap-2 ml-2">
                            {!isEditingList && (
                                <button
                                    onClick={() => setIsEditingList(true)}
                                    className="text-gray-400 hover:text-blue-500"
                                >
                                    <FaEdit />
                                </button>
                            )}
                            <button
                                onClick={() => onDeleteList(list.id)}
                                className="text-gray-400 hover:text-red-500"
                                aria-label={`Delete list ${list.name}`}
                            >
                                <FaTrash />
                            </button>
                        </div>
                    </div>

                    {/* Tasks Area */}
                    <Droppable droppableId={list.id} type="task">
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`p-3 flex-grow overflow-y-auto min-h-[100px] transition-colors ${snapshot.isDraggingOver ? "bg-blue-50" : ""
                                    }`}
                            >
                                <div className="space-y-3">
                                    {list.tasks?.map((task, index) => (
                                        <KanbanCard
                                            key={task.id}
                                            task={task}
                                            index={index}
                                            onUpdate={(updatedTask) =>
                                                onUpdateTask(list.id, task.id, updatedTask)
                                            }
                                            onDelete={(taskId) => onDeleteTask(list.id, taskId)}
                                        />
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>

                    {/* Add Task Footer */}
                    <div className="p-3 border-t border-gray-200">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                placeholder="+ Add a task"
                                className="flex-grow p-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                onKeyDown={(e) => e.key === "Enter" && handleCreateTask()}
                            />
                            <button
                                onClick={handleCreateTask}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                                aria-label={`Add task to ${list.name}`}
                            >
                                <FaPlus />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

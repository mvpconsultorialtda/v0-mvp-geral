"use client";

import { useState } from "react";
import { Workspace, Board } from "../types/workspace";
import { FaPlus, FaTrash, FaChevronDown, FaChevronRight, FaLayerGroup, FaList } from "react-icons/fa";

interface SidebarProps {
    workspaces: Workspace[];
    boards: Board[];
    selectedWorkspaceId: string | null;
    selectedBoardId: string | null;
    onSelectWorkspace: (id: string) => void;
    onSelectBoard: (id: string) => void;
    onCreateWorkspace: (name: string) => void;
    onDeleteWorkspace: (id: string) => void;
    onCreateBoard: (workspaceId: string, name: string) => void;
    onDeleteBoard: (id: string) => void;
}

export const Sidebar = ({
    workspaces,
    boards,
    selectedWorkspaceId,
    selectedBoardId,
    onSelectWorkspace,
    onSelectBoard,
    onCreateWorkspace,
    onDeleteWorkspace,
    onCreateBoard,
    onDeleteBoard,
}: SidebarProps) => {
    const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [isCreatingBoard, setIsCreatingBoard] = useState<string | null>(null);
    const [newBoardName, setNewBoardName] = useState("");

    const handleCreateWorkspace = () => {
        if (newWorkspaceName.trim()) {
            onCreateWorkspace(newWorkspaceName);
            setNewWorkspaceName("");
            setIsCreatingWorkspace(false);
        }
    };

    const handleCreateBoard = (workspaceId: string) => {
        if (newBoardName.trim()) {
            onCreateBoard(workspaceId, newBoardName);
            setNewBoardName("");
            setIsCreatingBoard(null);
        }
    };

    return (
        <div className="w-64 bg-gray-900 text-white h-screen flex flex-col border-r border-gray-800" data-testid="sidebar">
            <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                <h2 className="font-bold text-lg flex items-center gap-2">
                    <FaLayerGroup className="text-blue-500" /> Workspaces
                </h2>
                <button
                    onClick={() => setIsCreatingWorkspace(true)}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label="Create Workspace"
                >
                    <FaPlus />
                </button>
            </div>

            {isCreatingWorkspace && (
                <div className="p-2 bg-gray-800">
                    <input
                        type="text"
                        value={newWorkspaceName}
                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                        placeholder="Workspace name..."
                        className="w-full p-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && handleCreateWorkspace()}
                    />
                    <div className="flex justify-end gap-2 mt-2">
                        <button
                            onClick={() => setIsCreatingWorkspace(false)}
                            className="text-xs text-gray-400 hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateWorkspace}
                            className="text-xs bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                        >
                            Create
                        </button>
                    </div>
                </div>
            )}

            <div className="flex-grow overflow-y-auto p-2 space-y-2">
                {workspaces?.map((workspace) => (
                    <div key={workspace.id} className="space-y-1">
                        <div
                            className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-800 group ${selectedWorkspaceId === workspace.id ? "bg-gray-800" : ""
                                }`}
                            onClick={() => onSelectWorkspace(workspace.id)}
                        >
                            <div className="flex items-center gap-2 font-medium">
                                {selectedWorkspaceId === workspace.id ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                {workspace.name}
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsCreatingBoard(workspace.id);
                                    }}
                                    className="text-gray-400 hover:text-blue-400"
                                    title="Add List"
                                >
                                    <FaPlus size={10} />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteWorkspace(workspace.id);
                                    }}
                                    className="text-gray-400 hover:text-red-400"
                                    title="Delete Workspace"
                                >
                                    <FaTrash size={10} />
                                </button>
                            </div>
                        </div>

                        {/* Boards List */}
                        {selectedWorkspaceId === workspace.id && (
                            <div className="ml-4 pl-2 border-l border-gray-700 space-y-1">
                                {boards?.filter(b => b.workspaceId === workspace.id).map((board) => (
                                    <div
                                        key={board.id}
                                        className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-gray-800 group ${selectedBoardId === board.id ? "bg-blue-900/50 text-blue-200" : "text-gray-400"
                                            }`}
                                        onClick={() => onSelectBoard(board.id)}
                                    >
                                        <div className="flex items-center gap-2 text-sm">
                                            <FaList size={10} />
                                            {board.name}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteBoard(board.id);
                                            }}
                                            className="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <FaTrash size={10} />
                                        </button>
                                    </div>
                                ))}

                                {isCreatingBoard === workspace.id && (
                                    <div className="p-1">
                                        <input
                                            type="text"
                                            value={newBoardName}
                                            onChange={(e) => setNewBoardName(e.target.value)}
                                            placeholder="List name..."
                                            className="w-full p-1 text-sm bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500"
                                            autoFocus
                                            onKeyDown={(e) => e.key === "Enter" && handleCreateBoard(workspace.id)}
                                        />
                                    </div>
                                )}

                                {boards?.filter(b => b.workspaceId === workspace.id).length === 0 && !isCreatingBoard && (
                                    <div className="text-xs text-gray-600 italic p-2">No lists yet</div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

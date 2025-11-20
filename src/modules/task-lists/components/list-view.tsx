import { Task, KanbanColumn } from "../types/task-list";
import { FaCheckCircle, FaRegCircle } from "react-icons/fa";

interface ListViewProps {
    columns: KanbanColumn[];
    tasks: Task[];
    onTaskClick: (task: Task) => void;
}

export const ListView = ({ columns, tasks, onTaskClick }: ListViewProps) => {
    const getPriorityColor = (priority?: string) => {
        switch (priority) {
            case "high":
                return "text-red-600 bg-red-100";
            case "medium":
                return "text-yellow-600 bg-yellow-100";
            case "low":
                return "text-blue-600 bg-blue-100";
            default:
                return "text-gray-500 bg-gray-100";
        }
    };

    return (
        <div className="flex-grow overflow-auto bg-white p-6">
            <div className="max-w-6xl mx-auto">
                {columns.map((column) => {
                    const columnTasks = tasks.filter((t) => t.columnId === column.id);
                    if (columnTasks.length === 0) return null;

                    return (
                        <div key={column.id} className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-200">
                                {column.title} <span className="text-gray-400 text-sm font-normal ml-2">({columnTasks.length})</span>
                            </h3>
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                                        <tr>
                                            <th className="p-3 w-8"></th>
                                            <th className="p-3">Task</th>
                                            <th className="p-3 w-32">Priority</th>
                                            <th className="p-3 w-32">Due Date</th>
                                            <th className="p-3 w-24">Subtasks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {columnTasks.map((task) => {
                                            const completedSubtasks = task.subtasks?.filter((s) => s.completed).length || 0;
                                            const totalSubtasks = task.subtasks?.length || 0;

                                            return (
                                                <tr
                                                    key={task.id}
                                                    onClick={() => onTaskClick(task)}
                                                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                                                >
                                                    <td className="p-3 text-center">
                                                        {task.completed ? (
                                                            <FaCheckCircle className="text-green-500" />
                                                        ) : (
                                                            <FaRegCircle className="text-gray-300 group-hover:text-blue-500" />
                                                        )}
                                                    </td>
                                                    <td className="p-3 font-medium text-gray-800">{task.text}</td>
                                                    <td className="p-3">
                                                        {task.priority && (
                                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-gray-500">
                                                        {task.dueDate && new Date(task.dueDate).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-3 text-gray-500">
                                                        {totalSubtasks > 0 && (
                                                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                                {completedSubtasks}/{totalSubtasks}
                                                            </span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

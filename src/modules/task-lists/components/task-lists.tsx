"use client";
import { useState } from "react";
import { useTaskList } from "../hooks/use-task-lists";
import { TaskList, Task } from "../types/task-list";
import { FaTrash, FaEdit, FaPlus, FaSave, FaTimes } from "react-icons/fa";

export const TaskLists = ({
  initialTaskLists,
}: {
  initialTaskLists?: TaskList[];
}) => {
  const {
    taskLists: contextTaskLists,
    loading,
    createTaskList,
    updateTaskList,
    deleteTaskList,
    createTask,
    updateTask,
    deleteTask,
  } = useTaskList();
  const [taskLists, setTaskLists] = useState<TaskList[]>(
    initialTaskLists || contextTaskLists
  );
  const [newListName, setNewListName] = useState("");
  const [newTaskTexts, setNewTaskTexts] = useState<{ [key: string]: string }>(
    {}
  );
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [editingListNamen, setEditingListName] = useState<string>("");
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskText, setEditingTaskText] = useState<string>("");

  const handleCreateTaskList = () => {
    if (newListName.trim() !== "") {
      createTaskList(newListName);
      setNewListName("");
    }
  };

  const handleUpdateTaskList = (list: TaskList) => {
    updateTaskList(list.id, { ...list, name: editingListNamen });
    setEditingListId(null);
  };

  const handleCreateTask = (listId: string) => {
    if (newTaskTexts[listId] && newTaskTexts[listId].trim() !== "") {
      createTask(listId, newTaskTexts[listId]);
      setNewTaskTexts((prev) => ({ ...prev, [listId]: "" }));
    }
  };

  const handleUpdateTask = (
    listId: string,
    task: Task,
    completed?: boolean
  ) => {
    if (editingTaskId === task.id) {
      updateTask(listId, task.id, {
        ...task,
        text: editingTaskText,
        completed: completed ?? task.completed,
      });
      setEditingTaskId(null);
    } else {
      updateTask(listId, task.id, {
        ...task,
        completed: completed ?? task.completed,
      });
    }
  };

  const startEditingList = (list: TaskList) => {
    setEditingListId(list.id);
    setEditingListName(list.name);
  };

  const startEditingTask = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTaskText(task.text);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 border-b pb-4">
          Task Lists
        </h1>
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="Enter new list name"
              className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 transition"
            />
            <button
              onClick={handleCreateTaskList}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FaPlus />
              Create List
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {taskLists.map((list) => (
            <div
              key={list.id}
              className="bg-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                {editingListId === list.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingListNamen}
                      onChange={(e) => setEditingListName(e.target.value)}
                      className="p-2 border rounded-lg"
                    />
                    <button
                      onClick={() => handleUpdateTaskList(list)}
                      className="text-green-500 hover:text-green-700"
                      aria-label={`Save list ${list.name}`}
                    >
                      <FaSave />
                    </button>
                    <button
                      onClick={() => setEditingListId(null)}
                      className="text-red-500 hover:text-red-700"
                      aria-label={`Cancel editing list ${list.name}`}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <h2 className="text-2xl font-semibold">{list.name}</h2>
                )}
                <div className="flex gap-4">
                  <button
                    onClick={() => startEditingList(list)}
                    className="text-gray-500 hover:text-blue-500"
                    aria-label={`Edit list ${list.name}`}
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => deleteTaskList(list.id)}
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
                    value={newTaskTexts[list.id] || ""}
                    onChange={(e) =>
                      setNewTaskTexts((prev) => ({
                        ...prev,
                        [list.id]: e.target.value,
                      }))
                    }
                    placeholder="Add a new task"
                    className="flex-grow p-2 border rounded-lg"
                  />
                  <button
                    onClick={() => handleCreateTask(list.id)}
                    className="bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
                    aria-label={`Add task to ${list.name}`}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>
              <ul className="space-y-3">
                {list.tasks &&
                  list.tasks.map((task) => (
                    <li
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) =>
                            handleUpdateTask(list.id, task, e.target.checked)
                          }
                          className="form-checkbox h-5 w-5 text-blue-600"
                        />
                        {editingTaskId === task.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editingTaskText}
                              onChange={(e) =>
                                setEditingTaskText(e.target.value)
                              }
                              className="p-1 border rounded-md"
                            />
                            <button
                              onClick={() => handleUpdateTask(list.id, task)}
                              className="text-green-500"
                              aria-label={`Save task ${task.text}`}
                            >
                              <FaSave />
                            </button>
                            <button
                              onClick={() => setEditingTaskId(null)}
                              className="text-red-500"
                              aria-label={`Cancel editing task ${task.text}`}
                            >
                              <FaTimes />
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`${
                              task.completed ? "line-through text-gray-500" : ""
                            }`}
                          >
                            {task.text}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEditingTask(task)}
                          className="text-sm text-gray-500 hover:text-blue-500"
                          aria-label={`Edit task ${task.text}`}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => deleteTask(list.id, task.id)}
                          className="text-sm text-gray-500 hover:text-red-500"
                          aria-label={`Delete task ${task.text}`}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

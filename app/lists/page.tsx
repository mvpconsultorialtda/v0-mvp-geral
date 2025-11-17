"use client";

import Layout from "../main-layout";
import { TaskLists } from "@/modules/task-lists/components/task-lists";
import { TaskList } from "@/modules/task-lists/types/task-list";

const mockTaskLists: TaskList[] = [
  {
    id: "1",
    name: "Groceries",
    tasks: [
      { id: "101", text: "Buy milk", completed: false },
      { id: "102", text: "Buy eggs", completed: true },
    ],
  },
  {
    id: "2",
    name: "Work",
    tasks: [
      { id: "201", text: "Finish report", completed: false },
      { id: "202", text: "Meeting at 2pm", completed: false },
    ],
  },
];

export default function ListsPage() {
  return (
    <Layout>
      <TaskLists initialTaskLists={mockTaskLists} />
    </Layout>
  );
}

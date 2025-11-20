import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  orderBy,
  writeBatch,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { Task, KanbanColumn } from "../types/task-list";
import { Workspace, Board } from "../types/workspace";

const WORKSPACES_COLLECTION = "workspaces";
const BOARDS_COLLECTION = "boards";
const COLUMNS_COLLECTION = "columns";
const TASKS_COLLECTION = "tasks";

export const TaskListService = {
  // --- Workspaces ---
  async getWorkspaces(userId: string): Promise<Workspace[]> {
    const q = query(collection(db, WORKSPACES_COLLECTION), orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Workspace));
  },

  async createWorkspace(name: string, ownerId: string = "demo-user"): Promise<Workspace> {
    const docRef = await addDoc(collection(db, WORKSPACES_COLLECTION), {
      name,
      ownerId,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, name, ownerId, createdAt: new Date().toISOString() };
  },

  async deleteWorkspace(workspaceId: string): Promise<void> {
    await deleteDoc(doc(db, WORKSPACES_COLLECTION, workspaceId));
  },

  // --- Boards (Lists) ---
  async getBoards(workspaceId: string): Promise<Board[]> {
    const q = query(
      collection(db, BOARDS_COLLECTION),
      where("workspaceId", "==", workspaceId),
      orderBy("createdAt", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Board));
  },

  async createBoard(workspaceId: string, name: string): Promise<Board> {
    const docRef = await addDoc(collection(db, BOARDS_COLLECTION), {
      workspaceId,
      name,
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, workspaceId, name, createdAt: new Date().toISOString() };
  },

  async deleteBoard(boardId: string): Promise<void> {
    await deleteDoc(doc(db, BOARDS_COLLECTION, boardId));
  },

  // --- Columns ---
  async getColumns(boardId: string): Promise<KanbanColumn[]> {
    const q = query(
      collection(db, COLUMNS_COLLECTION),
      where("boardId", "==", boardId),
      orderBy("order", "asc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as KanbanColumn));
  },

  async createColumn(boardId: string, title: string): Promise<KanbanColumn> {
    const q = query(collection(db, COLUMNS_COLLECTION), where("boardId", "==", boardId));
    const snapshot = await getDocs(q);
    const order = snapshot.size;

    const docRef = await addDoc(collection(db, COLUMNS_COLLECTION), {
      boardId,
      title,
      order,
    });
    return { id: docRef.id, boardId, title, order };
  },

  async updateColumn(columnId: string, data: Partial<KanbanColumn>): Promise<void> {
    await updateDoc(doc(db, COLUMNS_COLLECTION, columnId), data);
  },

  async deleteColumn(columnId: string): Promise<void> {
    await deleteDoc(doc(db, COLUMNS_COLLECTION, columnId));
  },

  // --- Tasks ---
  async getTasks(columnIds: string[]): Promise<Task[]> {
    if (columnIds.length === 0) return [];

    const tasks: Task[] = [];
    const chunks = [];
    for (let i = 0; i < columnIds.length; i += 10) {
      chunks.push(columnIds.slice(i, i + 10));
    }

    for (const chunk of chunks) {
      const q = query(collection(db, TASKS_COLLECTION), where("columnId", "in", chunk));
      const snapshot = await getDocs(q);
      snapshot.docs.forEach(doc => tasks.push({ id: doc.id, ...doc.data() } as Task));
    }

    return tasks.sort((a, b) => a.order - b.order);
  },

  async createTask(columnId: string, text: string): Promise<Task> {
    const q = query(collection(db, TASKS_COLLECTION), where("columnId", "==", columnId));
    const snapshot = await getDocs(q);
    const order = snapshot.size;

    const newTask: Omit<Task, "id"> = {
      columnId,
      text,
      completed: false,
      order,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, TASKS_COLLECTION), newTask);
    return { id: docRef.id, ...newTask };
  },

  async updateTask(taskId: string, data: Partial<Task>): Promise<void> {
    await updateDoc(doc(db, TASKS_COLLECTION, taskId), data);
  },

  async deleteTask(taskId: string): Promise<void> {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
  },

  async moveTask(
    taskId: string,
    sourceColumnId: string,
    destinationColumnId: string,
    newIndex: number
  ): Promise<void> {
    try {
      await runTransaction(db, async (transaction) => {
        const taskRef = doc(db, TASKS_COLLECTION, taskId);

        // Get all tasks in the destination column
        const destTasksQuery = query(
          collection(db, TASKS_COLLECTION),
          where("columnId", "==", destinationColumnId),
          orderBy("order", "asc")
        );
        const destSnapshot = await getDocs(destTasksQuery);
        let destTasks = destSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Task));

        // If moving within same column
        if (sourceColumnId === destinationColumnId) {
          const taskIndex = destTasks.findIndex(t => t.id === taskId);
          if (taskIndex > -1) {
            const [movedTask] = destTasks.splice(taskIndex, 1);
            destTasks.splice(newIndex, 0, movedTask);
          }
        } else {
          const taskDoc = await transaction.get(taskRef);
          if (!taskDoc.exists()) throw "Task does not exist";

          const movedTask = { id: taskId, ...taskDoc.data() } as Task;
          movedTask.columnId = destinationColumnId;
          destTasks.splice(newIndex, 0, movedTask);

          transaction.update(taskRef, { columnId: destinationColumnId });
        }

        // Update orders for all tasks in destination
        destTasks.forEach((t, index) => {
          const ref = doc(db, TASKS_COLLECTION, t.id);
          transaction.update(ref, { order: index });
        });
      });
    } catch (error) {
      console.error("Error moving task:", error);
      throw error;
    }
  },

  async updateTasksOrder(tasks: Task[]): Promise<void> {
    const batch = writeBatch(db);
    tasks.forEach((task) => {
      const ref = doc(db, TASKS_COLLECTION, task.id);
      batch.update(ref, { order: task.order, columnId: task.columnId });
    });
    await batch.commit();
  },
};

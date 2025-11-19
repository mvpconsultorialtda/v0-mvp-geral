import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { KanbanColumn, Task } from "../types/task-list";

const COLUMNS_COLLECTION = "columns";
const TASKS_COLLECTION = "tasks";

export const TaskListService = {
  // --- Columns ---

  getColumns: async (): Promise<KanbanColumn[]> => {
    try {
      const q = query(collection(db, COLUMNS_COLLECTION), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as KanbanColumn[];
    } catch (error) {
      console.error("Error getting columns:", error);
      throw error;
    }
  },

  createColumn: async (title: string, order: number): Promise<KanbanColumn> => {
    try {
      const newColumn = { title, order };
      const docRef = await addDoc(collection(db, COLUMNS_COLLECTION), newColumn);
      return { id: docRef.id, ...newColumn };
    } catch (error) {
      console.error("Error creating column:", error);
      throw error;
    }
  },

  updateColumn: async (id: string, data: Partial<KanbanColumn>): Promise<void> => {
    try {
      const docRef = doc(db, COLUMNS_COLLECTION, id);
      const { id: _, ...updateData } = data;
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating column:", error);
      throw error;
    }
  },

  deleteColumn: async (id: string): Promise<void> => {
    try {
      // Note: In a real app, we should also delete or move tasks associated with this column
      // For now, we'll just delete the column
      const docRef = doc(db, COLUMNS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting column:", error);
      throw error;
    }
  },

  // --- Tasks ---

  getTasks: async (): Promise<Task[]> => {
    try {
      const q = query(collection(db, TASKS_COLLECTION), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
    } catch (error) {
      console.error("Error getting tasks:", error);
      throw error;
    }
  },

  createTask: async (columnId: string, text: string, order: number): Promise<Task> => {
    try {
      const newTask: Omit<Task, "id"> = {
        columnId,
        text,
        completed: false,
        order,
        // Default values
        description: "",
        priority: "medium",
      };
      const docRef = await addDoc(collection(db, TASKS_COLLECTION), newTask);
      return { id: docRef.id, ...newTask };
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  updateTask: async (taskId: string, data: Partial<Task>): Promise<void> => {
    try {
      const docRef = doc(db, TASKS_COLLECTION, taskId);
      const { id: _, ...updateData } = data;
      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  deleteTask: async (taskId: string): Promise<void> => {
    try {
      const docRef = doc(db, TASKS_COLLECTION, taskId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },

  moveTask: async (
    taskId: string,
    targetColumnId: string,
    newOrder: number
  ): Promise<void> => {
    try {
      const docRef = doc(db, TASKS_COLLECTION, taskId);
      await updateDoc(docRef, {
        columnId: targetColumnId,
        order: newOrder,
      });
    } catch (error) {
      console.error("Error moving task:", error);
      throw error;
    }
  },

  // Batch update for reordering multiple tasks (e.g. when dropping in a new position)
  updateTasksOrder: async (updates: { id: string; order: number; columnId?: string }[]): Promise<void> => {
    try {
      const batch = writeBatch(db);
      updates.forEach(({ id, order, columnId }) => {
        const docRef = doc(db, TASKS_COLLECTION, id);
        const data: any = { order };
        if (columnId) data.columnId = columnId;
        batch.update(docRef, data);
      });
      await batch.commit();
    } catch (error) {
      console.error("Error batch updating tasks:", error);
      throw error;
    }
  }
};

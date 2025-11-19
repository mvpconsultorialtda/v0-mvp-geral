import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "@/lib/firebase-client";
import { TaskList, Task } from "../types/task-list";

const COLLECTION_NAME = "task-lists";

export const TaskListService = {
  getTaskLists: async (): Promise<TaskList[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as TaskList[];
    } catch (error) {
      console.error("Error getting task lists:", error);
      throw error;
    }
  },

  getTaskList: async (id: string): Promise<TaskList | null> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as TaskList;
      }
      return null;
    } catch (error) {
      console.error("Error getting task list:", error);
      throw error;
    }
  },

  createTaskList: async (newListName: string): Promise<TaskList> => {
    try {
      const newList = {
        name: newListName,
        tasks: [],
      };
      const docRef = await addDoc(collection(db, COLLECTION_NAME), newList);
      return { id: docRef.id, ...newList };
    } catch (error) {
      console.error("Error creating task list:", error);
      throw error;
    }
  },

  updateTaskList: async (
    listId: string,
    updatedData: Partial<TaskList>
  ): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, listId);
      // Remove id from updatedData if present to avoid overwriting document ID in data
      const { id, ...dataToUpdate } = updatedData;
      await updateDoc(docRef, dataToUpdate);
    } catch (error) {
      console.error("Error updating task list:", error);
      throw error;
    }
  },

  deleteTaskList: async (listId: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, listId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting task list:", error);
      throw error;
    }
  },

  createTask: async (listId: string, taskText: string): Promise<Task> => {
    try {
      const newTask: Task = {
        id: crypto.randomUUID(),
        text: taskText,
        completed: false,
      };
      const docRef = doc(db, COLLECTION_NAME, listId);
      await updateDoc(docRef, {
        tasks: arrayUnion(newTask),
      });
      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  },

  updateTask: async (
    listId: string,
    taskId: string,
    updatedData: Partial<Task>
  ): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, listId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const listData = docSnap.data() as TaskList;
        const updatedTasks = listData.tasks.map((task) =>
          task.id === taskId ? { ...task, ...updatedData } : task
        );

        await updateDoc(docRef, { tasks: updatedTasks });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  deleteTask: async (listId: string, taskId: string): Promise<void> => {
    try {
      const docRef = doc(db, COLLECTION_NAME, listId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const listData = docSnap.data() as TaskList;
        const updatedTasks = listData.tasks.filter((task) => task.id !== taskId);

        await updateDoc(docRef, { tasks: updatedTasks });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  },
};

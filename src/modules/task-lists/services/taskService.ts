
import { addDoc, collection, doc, deleteDoc, updateDoc, serverTimestamp, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Task } from '../types';

// Esta função não é mais reativa (escuta), ela apenas busca os dados uma vez.
// A reatividade agora é tratada pelo hook useCollection no componente.
export const listTasks = async (listId: string): Promise<Task[]> => {
    if (!listId) return [];
    const tasksCollection = collection(db, 'taskLists', listId, 'tasks');
    const tasksQuery = query(tasksCollection, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(tasksQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Task[];
};

export const createTask = async (listId: string, text: string): Promise<void> => {
    const tasksCollection = collection(db, 'taskLists', listId, 'tasks');
    await addDoc(tasksCollection, {
        text,
        completed: false,
        status: 'Pendente',
        createdAt: serverTimestamp(),
        // O campo 'order' foi removido por simplicidade, a ordenação é por data de criação.
    });
};

export const updateTask = async (listId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
    const taskDocRef = doc(db, 'taskLists', listId, 'tasks', taskId);
    // Converte o objeto Date do JS para um Timestamp do Firestore antes de atualizar
    if (updates.dueDate) {
        updates.dueDate = updates.dueDate;
    }
    await updateDoc(taskDocRef, updates);
};

export const deleteTask = async (listId: string, taskId: string): Promise<void> => {
    const taskDocRef = doc(db, 'taskLists', listId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
};

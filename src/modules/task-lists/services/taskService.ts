import { addDoc, collection, doc, deleteDoc, updateDoc, serverTimestamp, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase-client';
import { Task } from '../types';

// CORREÇÃO: Acessa a coleção raiz "tasks" e filtra por "listId"
export const listTasks = async (listId: string): Promise<Task[]> => {
    if (!listId) return [];
    const tasksCollection = collection(db, 'tasks');
    const tasksQuery = query(tasksCollection, where('listId', '==', listId), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(tasksQuery);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Task[];
};

// CORREÇÃO: Cria a tarefa na coleção raiz "tasks", garantindo que "listId" seja salvo
export const createTask = async (listId: string, text: string): Promise<void> => {
    const tasksCollection = collection(db, 'tasks');
    await addDoc(tasksCollection, {
        listId, // Adiciona a referência à lista
        text,
        completed: false,
        status: 'Pendente',
        createdAt: serverTimestamp(),
    });
};

// CORREÇÃO: Atualiza o documento diretamente na coleção "tasks"
export const updateTask = async (listId: string, taskId: string, updates: Partial<Task>): Promise<void> => {
    // O listId não é mais necessário para construir a referência do documento, mas pode ser útil para regras de segurança no futuro.
    const taskDocRef = doc(db, 'tasks', taskId);
    
    const dataToUpdate: { [key: string]: any } = { ...updates };

    // Converte o objeto Date do JS para um Timestamp do Firestore antes de atualizar
    if (updates.dueDate) {
        dataToUpdate.dueDate = updates.dueDate;
    }

    await updateDoc(taskDocRef, dataToUpdate);
};

// CORREÇÃO: Deleta o documento diretamente da coleção "tasks"
export const deleteTask = async (listId: string, taskId: string): Promise<void> => {
    // listId não é estritamente necessário aqui, mas mantido para consistência da API
    const taskDocRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskDocRef);
};
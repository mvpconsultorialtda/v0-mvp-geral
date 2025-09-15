
import { addDoc, collection, getDocs, query, where, serverTimestamp, doc, updateDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { auth, db as firestore } from '../../../lib/firebase-client'; // Corrigido: importando 'db' como 'firestore'
import { Task, TaskList } from '../types';

// Funções para Listas

export const createList = async (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>): Promise<TaskList> => {
  const user = auth.currentUser;
  if (!user) throw new Error('Usuário não autenticado.');

  const { name, description = '', sharedWith = [] } = listData;
  if (!name) throw new Error('O nome da lista é obrigatório.');

  const newListDoc = await addDoc(collection(firestore, 'lists'), {
    name,
    description,
    ownerId: user.uid,
    sharedWith,
    createdAt: serverTimestamp(),
  });

  return { id: newListDoc.id, name, description, ownerId: user.uid, sharedWith, createdAt: new Date() };
};

export const getLists = async (): Promise<TaskList[]> => {
  const user = auth.currentUser;
  if (!user) return [];

  const listsCollection = collection(firestore, 'lists');
  const ownerQuery = query(listsCollection, where('ownerId', '==', user.uid));
  const sharedQuery = query(listsCollection, where('sharedWith', 'array-contains', user.uid));

  const [ownerSnapshot, sharedSnapshot] = await Promise.all([getDocs(ownerQuery), getDocs(sharedQuery)]);

  const listsMap = new Map<string, TaskList>();
  ownerSnapshot.forEach(doc => listsMap.set(doc.id, { id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() } as TaskList));
  sharedSnapshot.forEach(doc => listsMap.set(doc.id, { id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() } as TaskList));

  return Array.from(listsMap.values());
};

// Funções para Tarefas (reimplementadas com Firestore)

export const getTasks = async (listId: string): Promise<Task[]> => {
  const tasksCollection = collection(firestore, 'lists', listId, 'tasks');
  const tasksQuery = query(tasksCollection, orderBy('order', 'asc'));
  const snapshot = await getDocs(tasksQuery);
  return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
};

export const createTask = async (listId: string, text: string, order: number): Promise<Task> => {
  const tasksCollection = collection(firestore, 'lists', listId, 'tasks');
  const newTaskDoc = await addDoc(tasksCollection, { 
    text, 
    order, 
    completed: false, 
    status: 'Pendente', // Status padrão
    createdAt: serverTimestamp(),
  });
  return { id: newTaskDoc.id, text, order, completed: false, status: 'Pendente', createdAt: new Date() };
};

export const updateTask = async (taskId: string, listId: string, updates: Partial<Task>): Promise<Task> => {
  // A referência do documento agora precisa do listId
  const taskDocRef = doc(firestore, 'lists', listId, 'tasks', taskId);
  await updateDoc(taskDocRef, updates);
  // O retorno pode ser otimizado para não precisar buscar o doc novamente, mas por simplicidade vamos manter assim
  return { id: taskId, ...updates } as Task; // Retorno simplificado
};

export const deleteTask = async (taskId: string, listId: string): Promise<void> => {
  const taskDocRef = doc(firestore, 'lists', listId, 'tasks', taskId);
  await deleteDoc(taskDocRef);
};

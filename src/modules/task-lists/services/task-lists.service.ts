
import { addDoc, collection, doc, deleteDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { auth, db as firestore, storage } from '../../../lib/firebase-client';
import { Attachment, Comment, Task, TaskList } from '../types';

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

// getLists refatorado para tempo real
export const getLists = (callback: (lists: TaskList[]) => void): (() => void) => {
  const user = auth.currentUser;
  if (!user) {
    callback([]);
    return () => {}; // Retorna uma função de limpeza vazia se não houver usuário
  }

  const listsCollection = collection(firestore, 'lists');
  const ownerQuery = query(listsCollection, where('ownerId', '==', user.uid));
  const sharedQuery = query(listsCollection, where('sharedWith', 'array-contains', user.uid));

  const listsMap = new Map<string, TaskList>();

  const processSnapshot = () => {
    const sortedLists = Array.from(listsMap.values()).sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        // @ts-ignore
        return b.createdAt - a.createdAt;
      }
      return 0;
    });
    callback(sortedLists);
  };

  const unsubscribeOwner = onSnapshot(ownerQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      listsMap.set(doc.id, { id: doc.id, ...data, createdAt: data.createdAt?.toDate() } as TaskList);
    });
    processSnapshot();
  });

  const unsubscribeShared = onSnapshot(sharedQuery, (snapshot) => {
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      listsMap.set(doc.id, { id: doc.id, ...data, createdAt: data.createdAt?.toDate() } as TaskList);
    });
    processSnapshot();
  });

  // Retorna uma função que desinscreve de ambos os listeners
  return () => {
    unsubscribeOwner();
    unsubscribeShared();
  };
};

// Funções para Tarefas

// getTasks refatorado para tempo real
export const getTasks = (listId: string, callback: (tasks: Task[]) => void): (() => void) => {
  if (!listId) {
    callback([]);
    return () => {};
  }
  const tasksCollection = collection(firestore, 'lists', listId, 'tasks');
  const tasksQuery = query(tasksCollection, orderBy('order', 'asc'));

  const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Task));
    callback(tasks);
  });

  return unsubscribe; // Retorna a função de desinscrição
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
    return { id: newTaskDoc.id, listId, text, order, completed: false, status: 'Pendente', createdAt: new Date() };
};

export const updateTask = async (listId: string, taskId: string, updates: Partial<Task>): Promise<Task> => {
    const taskDocRef = doc(firestore, 'lists', listId, 'tasks', taskId);
    await updateDoc(taskDocRef, updates);
    // O retorno pode ser otimizado para não precisar buscar o doc novamente, mas por simplicidade vamos manter assim
    return { id: taskId, listId, text: '', order: 0, completed: false, status: 'Pendente', ...updates, createdAt: new Date() }; // Retorno simplificado
};

export const deleteTask = async (listId: string, taskId: string): Promise<void> => {
    const taskDocRef = doc(firestore, 'lists', listId, 'tasks', taskId);
    await deleteDoc(taskDocRef);
};

// Funções para Comentários

export const getComments = (listId: string, taskId: string, callback: (comments: Comment[]) => void): (() => void) => {
    const commentsCollection = collection(firestore, 'lists', listId, 'tasks', taskId, 'comments');
    const commentsQuery = query(commentsCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
        } as Comment));
        callback(comments);
    });

    return unsubscribe;
};

export const addComment = async (listId: string, taskId: string, text: string): Promise<Comment> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    const commentsCollection = collection(firestore, 'lists', listId, 'tasks', taskId, 'comments');
    const newCommentDoc = await addDoc(commentsCollection, {
        taskId,
        userId: user.uid,
        text,
        createdAt: serverTimestamp(),
    });

    return {
        id: newCommentDoc.id,
        taskId,
        userId: user.uid,
        text,
        createdAt: new Date(),
    };
};

// Funções para Anexos

export const getAttachments = (listId: string, taskId: string, callback: (attachments: Attachment[]) => void): (() => void) => {
    const attachmentsCollection = collection(firestore, 'lists', listId, 'tasks', taskId, 'attachments');
    const attachmentsQuery = query(attachmentsCollection, orderBy('createdAt', 'asc'));

    const unsubscribe = onSnapshot(attachmentsQuery, (snapshot) => {
        const attachments = snapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id,
            createdAt: doc.data().createdAt.toDate(),
        } as Attachment));
        callback(attachments);
    });

    return unsubscribe;
};

export const uploadAttachment = async (listId: string, taskId: string, file: File): Promise<Attachment> => {
    const user = auth.currentUser;
    if (!user) throw new Error('Usuário não autenticado.');

    const storageRef = ref(storage, `tasks/${taskId}/${file.name}`);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const attachmentsCollection = collection(firestore, 'lists', listId, 'tasks', taskId, 'attachments');
    const newAttachmentDoc = await addDoc(attachmentsCollection, {
        taskId,
        userId: user.uid,
        fileName: file.name,
        url,
        createdAt: serverTimestamp(),
    });

    return {
        id: newAttachmentDoc.id,
        taskId,
        userId: user.uid,
        fileName: file.name,
        url,
        createdAt: new Date(),
    };
};

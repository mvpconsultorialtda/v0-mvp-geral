
import { addDoc, collection, getDocs, query, where, serverTimestamp, getFirestore } from 'firebase/firestore';
import { auth, firestore } from '../../../lib/firebase-client'; // Usando o SDK do cliente
import { TaskList } from '../types';

// 1. Função para criar a lista diretamente no Firestore
export const createList = async (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>): Promise<TaskList> => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Usuário não autenticado.');
  }

  const { name, description = '', sharedWith = [] } = listData;

  if (!name) {
    throw new Error('O nome da lista é obrigatório.');
  }

  const listsCollection = collection(firestore, 'lists');

  const newListDoc = await addDoc(listsCollection, {
    name,
    description,
    ownerId: user.uid,
    sharedWith,
    createdAt: serverTimestamp(),
  });

  return {
    id: newListDoc.id,
    name,
    description,
    ownerId: user.uid,
    sharedWith,
    createdAt: new Date(), // Retorna a data atual para a UI
  };
};

// 2. Função para buscar as listas do Firestore
export const getLists = async (): Promise<TaskList[]> => {
  const user = auth.currentUser;
  if (!user) {
    return []; // Retorna um array vazio se não houver usuário
  }

  const listsCollection = collection(firestore, 'lists');

  // Consulta para buscar listas onde o usuário é o dono OU está no array sharedWith
  const listsQuery = query(
    listsCollection,
    where('ownerId', '==', user.uid)
    // O Firestore não suporta consultas com `OR` em campos diferentes (ownerId, sharedWith) nativamente.
    // A abordagem correta é fazer duas queries e unir os resultados no cliente.
  );

  const sharedListsQuery = query(
    listsCollection,
    where('sharedWith', 'array-contains', user.uid)
  );

  const [ownerListsSnapshot, sharedListsSnapshot] = await Promise.all([
    getDocs(listsQuery),
    getDocs(sharedListsQuery),
  ]);

  const listsMap = new Map<string, TaskList>();

  ownerListsSnapshot.forEach((doc) => {
    const data = doc.data();
    listsMap.set(doc.id, {
      id: doc.id,
      ...data,
      // Converte o Timestamp do Firestore para um objeto Date
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
    } as TaskList);
  });

  sharedListsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (!listsMap.has(doc.id)) { // Evita duplicatas
      listsMap.set(doc.id, {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(),
      } as TaskList);
    }
  });

  return Array.from(listsMap.values());
};

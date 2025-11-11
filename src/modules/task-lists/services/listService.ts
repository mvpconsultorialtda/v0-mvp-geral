
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-client';
import { TaskList } from '../types';

export const createList = async (listData: Omit<Partial<TaskList>, 'id' | 'ownerId' | 'createdAt'>): Promise<string> => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated.');

  const { name, description = '', sharedWith = [] } = listData;
  if (!name) throw new Error('List name is mandatory.');

  const newListDoc = await addDoc(collection(db, 'taskLists'), {
    name,
    description,
    ownerId: user.uid,
    sharedWith,
    createdAt: serverTimestamp(),
  });

  return newListDoc.id;
};

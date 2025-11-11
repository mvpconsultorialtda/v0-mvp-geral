
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase-client';

export const addComment = async (listId: string, taskId: string, text: string): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated.');

    const commentsCollection = collection(db, 'taskLists', listId, 'tasks', taskId, 'comments');
    await addDoc(commentsCollection, {
        taskId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous', // Salva o nome do usuário para fácil exibição
        text,
        createdAt: serverTimestamp(),
    });
};

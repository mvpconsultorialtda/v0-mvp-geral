
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage, auth } from '@/lib/firebase-client';

export const uploadAttachment = async (listId: string, taskId: string, file: File): Promise<void> => {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated.');

    // Define um caminho único para o arquivo no Storage
    const storageRef = ref(storage, `attachments/${listId}/${taskId}/${Date.now()}_${file.name}`);
    
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);

    const attachmentsCollection = collection(db, 'taskLists', listId, 'tasks', taskId, 'attachments');
    await addDoc(attachmentsCollection, {
        taskId,
        userId: user.uid,
        userName: user.displayName || 'Anonymous',
        fileName: file.name,
        url,
        createdAt: serverTimestamp(),
    });
};

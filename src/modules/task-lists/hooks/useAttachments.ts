'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase-client';
import { uploadAttachment as uploadAttachmentService } from '../services/attachmentService';
import { Attachment } from '../types';

export const useAttachments = (listId: string, taskId: string) => {
    const attachmentsCollection = collection(db, 'taskLists', listId, 'tasks', taskId, 'attachments');
    const attachmentsQuery = query(attachmentsCollection, orderBy('createdAt', 'asc'));

    const [attachmentsSnapshot] = useCollection(attachmentsQuery);

    const attachments = attachmentsSnapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Attachment[] | undefined;

    const uploadAttachment = (file: File) => {
        return uploadAttachmentService(listId, taskId, file);
    };

    return { attachments, uploadAttachment };
};

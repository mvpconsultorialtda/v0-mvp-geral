
import { useEffect, useState } from 'react';
import { Attachment } from '../types';
import { getAttachments, uploadAttachment as uploadAttachmentService } from '../services/task-lists.service';

export const useAttachments = (listId: string, taskId: string) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);

    useEffect(() => {
        if (!listId || !taskId) {
            setAttachments([]);
            return;
        }

        const unsubscribe = getAttachments(listId, taskId, (fetchedAttachments) => {
            setAttachments(fetchedAttachments);
        });

        return () => unsubscribe();
    }, [listId, taskId]);

    const uploadAttachment = (file: File) => {
        return uploadAttachmentService(listId, taskId, file);
    };

    return {
        attachments,
        uploadAttachment,
    };
};

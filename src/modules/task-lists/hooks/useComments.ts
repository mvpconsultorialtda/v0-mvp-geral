
import { useEffect, useState } from 'react';
import { Comment } from '../types';
import { getComments, addComment as addCommentService } from '../services/task-lists.service';

export const useComments = (listId: string, taskId: string) => {
    const [comments, setComments] = useState<Comment[]>([]);

    useEffect(() => {
        if (!listId || !taskId) {
            setComments([]);
            return;
        }

        const unsubscribe = getComments(listId, taskId, (fetchedComments) => {
            setComments(fetchedComments);
        });

        return () => unsubscribe();
    }, [listId, taskId]);

    const addComment = (text: string) => {
        return addCommentService(listId, taskId, text);
    };

    return {
        comments,
        addComment,
    };
};

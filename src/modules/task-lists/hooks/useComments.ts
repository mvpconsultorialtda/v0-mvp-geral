'use client';

import { collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase-client';
import { addComment as addCommentService } from '../services/commentService';
import { Comment } from '../types';

export const useComments = (listId: string, taskId: string) => {
    const commentsCollection = collection(db, 'taskLists', listId, 'tasks', taskId, 'comments');
    const commentsQuery = query(commentsCollection, orderBy('createdAt', 'asc'));

    const [commentsSnapshot] = useCollection(commentsQuery);

    const comments = commentsSnapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Comment[] | undefined;

    const addComment = (text: string) => {
        return addCommentService(listId, taskId, text);
    };

    return { comments, addComment };
};

'use client';

import { useMemo } from 'react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db, auth } from '@/lib/firebase-client';
import { TaskList } from '../types';

export const useLists = () => {
    const user = auth.currentUser;

    // CORREÇÃO: A coleção correta é "lists"
    const collectionName = 'lists';

    // Query para listas onde o usuário é o dono
    const ownerQuery = user ? query(
        collection(db, collectionName),
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
    ) : null;

    // Query para listas compartilhadas com o usuário
    const sharedQuery = user ? query(
        collection(db, collectionName),
        where('sharedWith', 'array-contains', user.uid),
        orderBy('createdAt', 'desc')
    ) : null;

    const [ownerListsSnapshot, ownerLoading] = useCollection(ownerQuery);
    const [sharedListsSnapshot, sharedLoading] = useCollection(sharedQuery);

    const lists = useMemo(() => {
        if (!ownerListsSnapshot || !sharedListsSnapshot) return undefined;

        const combinedLists = new Map<string, TaskList>();

        ownerListsSnapshot.docs.forEach(doc => {
            const data = doc.data();
            combinedLists.set(doc.id, { 
                id: doc.id, 
                ...data,
                createdAt: data.createdAt?.toDate(),
            } as TaskList);
        });

        sharedListsSnapshot.docs.forEach(doc => {
            if (!combinedLists.has(doc.id)) {
                const data = doc.data();
                combinedLists.set(doc.id, { 
                    id: doc.id, 
                    ...data, 
                    createdAt: data.createdAt?.toDate(),
                } as TaskList);
            }
        });
        
        return Array.from(combinedLists.values());

    }, [ownerListsSnapshot, sharedListsSnapshot]);

    const loading = ownerLoading || sharedLoading;

    return { lists, loading };
};
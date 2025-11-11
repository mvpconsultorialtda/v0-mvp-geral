'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, collection, query, orderBy } from 'firebase/firestore';
import { useCollection } from 'react-firebase-hooks/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/modules/task-lists/types';
import { TasksList } from '@/modules/task-lists/components/TasksList';
import { TaskDetailModal } from '@/modules/task-lists/components/TaskDetailModal';
import { createTask, updateTask, deleteTask } from '@/modules/task-lists/services/taskService';

export default function ListDetailPage() {
    const { listId } = useParams();
    const { user } = useAuth();
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [listName, setListName] = useState('');

    const tasksCollection = collection(db, 'taskLists', listId as string, 'tasks');
    const tasksQuery = query(tasksCollection, orderBy('createdAt', 'asc'));

    const [tasksSnapshot, loading, error] = useCollection(tasksQuery);

    const tasks = tasksSnapshot?.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Assegura que as datas sejam objetos Date do JS
        dueDate: doc.data().dueDate?.toDate(),
        createdAt: doc.data().createdAt?.toDate(),
    })) as Task[] | undefined;

    useEffect(() => {
        if (listId) {
            const fetchListName = async () => {
                const listDoc = await getDoc(doc(db, 'taskLists', listId as string));
                if (listDoc.exists()) {
                    setListName(listDoc.data().name);
                }
            };
            fetchListName();
        }
    }, [listId]);

    const handleCreateTask = async (taskText: string) => {
        await createTask(listId as string, taskText);
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        await updateTask(listId as string, taskId, updates);
        // Não é mais necessário atualizar o estado local manualmente
        if (selectedTask && selectedTask.id === taskId) {
            // Atualiza o modal se a tarefa selecionada for a alterada
            setSelectedTask(prev => ({ ...prev!, ...updates }));
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        await deleteTask(listId as string, taskId);
    };

    if (!user) {
        return <p>Please log in to view this page.</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-6">{listName}</h1>
            {loading && <p>Loading tasks...</p>}
            {error && <p>Error loading tasks: {error.message}</p>}
            {tasks && (
                <TasksList
                    tasks={tasks}
                    onCreateTask={handleCreateTask}
                    onUpdateTask={handleUpdateTask}
                    onDeleteTask={handleDeleteTask}
                    onSelectTask={setSelectedTask}
                />
            )}
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    listId={listId as string}
                    isOpen={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={handleUpdateTask}
                />
            )}
        </div>
    );
}
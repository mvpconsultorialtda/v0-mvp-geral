'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Task } from '@/modules/task-lists/types';
import { TasksList } from '@/modules/task-lists/components/TasksList';
import { TaskDetailModal } from '@/modules/task-lists/components/TaskDetailModal';
import { listTasks, updateTask as updateDbTask, deleteTask as deleteDbTask, createTask as createDbTask } from '@/modules/task-lists/services/taskService';

export default function ListDetailPage() {
    const { listId } = useParams();
    const { user } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [listName, setListName] = useState('');

    useEffect(() => {
        if (user && listId) {
            const fetchTasks = async () => {
                const fetchedTasks = await listTasks(listId as string);
                setTasks(fetchedTasks);
            };

            const fetchListName = async () => {
                const listDoc = await getDoc(doc(db, 'taskLists', listId as string));
                if (listDoc.exists()) {
                    setListName(listDoc.data().name);
                }
            };

            fetchTasks();
            fetchListName();
        }
    }, [user, listId]);

    const handleCreateTask = async (taskText: string) => {
        const newTask = await createDbTask(listId as string, taskText);
        setTasks(prevTasks => [...prevTasks, newTask]);
    };

    const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
        await updateDbTask(listId as string, taskId, updates);
        // Atualiza o estado local para refletir a alteração imediatamente
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === taskId ? { ...task, ...updates } : task
            )
        );
    };

    const handleDeleteTask = async (taskId: string) => {
        await deleteDbTask(listId as string, taskId);
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    };

    const handleSelectTask = (task: Task) => {
        setSelectedTask(task);
    };

    const handleCloseModal = () => {
        setSelectedTask(null);
    };

    if (!user) {
        return <p>Please log in to view this page.</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-4xl font-bold mb-6">{listName}</h1>
            <TasksList
                tasks={tasks}
                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onSelectTask={handleSelectTask}
            />
            {selectedTask && (
                <TaskDetailModal
                    task={selectedTask}
                    listId={listId as string}
                    isOpen={!!selectedTask}
                    onClose={handleCloseModal}
                    onUpdateTask={handleUpdateTask}
                />
            )}
        </div>
    );
}
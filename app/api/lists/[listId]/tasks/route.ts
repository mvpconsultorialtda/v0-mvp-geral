import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin.server';
import { TaskStatus } from '@/modules/task-lists/types';
import { withAuth } from '@/lib/api/middleware';
import { verifyListOwnership } from '@/lib/api/auth';

// GET /api/lists/[listId]/tasks
// Obtém as tarefas de uma lista específica.
export const GET = withAuth(async (request, { params, user }) => {
  const { listId } = params;
  const { uid } = user;

  const isOwner = await verifyListOwnership(listId, uid);
  if (!isOwner) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  const db = getFirestore();
  try {
    const tasksSnapshot = await db.collection('tasks').where('listId', '==', listId).orderBy('order').orderBy('createdAt', 'desc').get();
    const tasks = tasksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(`Error fetching tasks for list ${listId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to fetch tasks.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});

// POST /api/lists/[listId]/tasks
// Cria uma nova tarefa em uma lista específica.
export const POST = withAuth(async (request, { params, user }) => {
  const { listId } = params;
  const { uid } = user;

  const isOwner = await verifyListOwnership(listId, uid);
  if (!isOwner) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  const db = getFirestore();
  try {
    const { text, order } = await request.json();

    if (!text || order === undefined) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Text and order are required.' }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    const newTask = {
      listId,
      text,
      completed: false,
      status: 'A Fazer' as TaskStatus, // Status inicial padrão
      order,
      createdAt: new Date(),
    };

    const docRef = await db.collection('tasks').add(newTask);

    return NextResponse.json({ id: docRef.id, ...newTask }, { status: 201 });
  } catch (error) {
    console.error(`Error creating task for list ${listId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to create task.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});

import { NextResponse } from 'next/server';
import { getFirestore } from '@/lib/firebase-admin.server';
import { TaskStatus } from '@/modules/task-lists/types';
import { withAuth } from '@/lib/api/middleware';
import { verifyTaskPermission } from '@/lib/api/auth';

// PATCH /api/tasks/[taskId]
// Atualiza uma tarefa, sincronizando `status` e `completed`.
export const PATCH = withAuth(async (request, { params, user }) => {
  const { taskId } = params;
  const { uid } = user;

  const hasPermission = await verifyTaskPermission(taskId, uid);
  if (!hasPermission) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  const db = getFirestore();
  try {
    const { text, completed, status, order } = await request.json();

    const taskRef = db.collection('tasks').doc(taskId);
    const updateData: { [key: string]: any } = {};

    if (text !== undefined) updateData.text = text;
    if (order !== undefined) updateData.order = order;

    // Lógica de sincronização entre status e completed
    if (status !== undefined) {
      updateData.status = status;
      updateData.completed = (status === 'Concluído');
    } else if (completed !== undefined) {
      updateData.completed = completed;
      updateData.status = completed ? 'Concluído' : 'A Fazer'; // Assume 'A Fazer' se não especificado
    }

    if (Object.keys(updateData).length > 0) {
      await taskRef.update(updateData);
    }

    const updatedTaskSnap = await taskRef.get();
    const updatedTask = { id: updatedTaskSnap.id, ...updatedTaskSnap.data() };

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to update task.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});

// DELETE /api/tasks/[taskId]
// Exclui uma tarefa.
export const DELETE = withAuth(async (request, { params, user }) => {
  const { taskId } = params;
  const { uid } = user;

  const hasPermission = await verifyTaskPermission(taskId, uid);
  if (!hasPermission) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Forbidden' }),
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  const db = getFirestore();
  try {
    await db.collection('tasks').doc(taskId).delete();

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to delete task.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
});

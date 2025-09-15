import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase/admin';
import { TaskStatus } from '../../../../src/modules/task-lists/types';

// PATCH /api/tasks/[taskId]
// Atualiza uma tarefa, sincronizando `status` e `completed`.
export async function PATCH(request: Request, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  // TODO: Validar o acesso do usuário à tarefa (taskId) antes de atualizar.

  try {
    const { text, completed, status, order } = await request.json();

    const taskRef = adminDb.collection('tasks').doc(taskId);
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
}

// DELETE /api/tasks/[taskId]
// Exclui uma tarefa.
export async function DELETE(request: Request, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  // TODO: Validar o acesso do usuário à tarefa (taskId) antes de excluir.

  try {
    await adminDb.collection('tasks').doc(taskId).delete();

    return new NextResponse(null, { status: 204 }); // No Content

  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Failed to delete task.' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

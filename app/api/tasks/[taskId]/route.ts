import { NextResponse } from 'next/server';
import { adminDb } from '../../../../lib/firebase/admin';

// PATCH /api/tasks/[taskId]
// Atualiza uma tarefa (ex: marcar como concluída, alterar texto).
export async function PATCH(request: Request, { params }: { params: { taskId: string } }) {
  const { taskId } = params;
  // TODO: Validar o acesso do usuário à tarefa (taskId) antes de atualizar.

  try {
    const { text, completed, order } = await request.json();

    const taskRef = adminDb.collection('tasks').doc(taskId);
    const updateData: { [key: string]: any } = {};
    if (text !== undefined) updateData.text = text;
    if (completed !== undefined) updateData.completed = completed;
    if (order !== undefined) updateData.order = order;

    await taskRef.update(updateData);

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

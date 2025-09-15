
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { defineAbilitiesFor } from '@/modules/access-control/ability';
import { getTodoListById, updateTask, deleteTask } from '@/modules/todo-list/core.server';
import { Task } from '@/modules/todo-list/types';

interface RouteParams {
  params: { 
    listId: string;
    taskId: string;
   };
}

/**
 * Helper para verificar permissões
 */
async function checkPermissions(listId: string) {
  const user = await verifySession();
  if (!user) {
    return { user: null, list: null, ability: null, error: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const list = await getTodoListById(listId);
  if (!list) {
    return { user, list: null, ability: null, error: NextResponse.json({ message: "List not found" }, { status: 404 }) };
  }

  const ability = defineAbilitiesFor(user);
  // Para modificar uma tarefa, o usuário precisa ter permissão de 'update' na lista pai.
  if (ability.cannot('update', list)) {
    return { user, list, ability, error: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { user, list, ability, error: null };
}

/**
 * PATCH /api/todo-lists/[listId]/tasks/[taskId]
 * Atualiza uma tarefa específica.
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const { listId, taskId } = params;
  const { error } = await checkPermissions(listId);
  if (error) return error;

  try {
    const body = await req.json() as Partial<Omit<Task, 'id'>>;

    // Garante que o listId não seja alterado pelo body
    if (body.listId && body.listId !== listId) {
      return NextResponse.json({ message: "Cannot change the listId of a task." }, { status: 400 });
    }

    const taskData: Partial<Omit<Task, 'id'>> = {
        ...body,
        updatedAt: new Date().toISOString(),
    };

    await updateTask(listId, taskId, taskData);

    return NextResponse.json({ message: "Task updated" });

  } catch (e) {
    console.error(`Error updating task ${taskId} in list ${listId}:`, e);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}

/**
 * DELETE /api/todo-lists/[listId]/tasks/[taskId]
 * Deleta uma tarefa específica.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const { listId, taskId } = params;
  const { error } = await checkPermissions(listId);
  if (error) return error;

  try {
    await deleteTask(listId, taskId);
    return new NextResponse(null, { status: 204 }); // No Content

  } catch (e) {
    console.error(`Error deleting task ${taskId} in list ${listId}:`, e);
    return NextResponse.json({ message: "Error deleting task" }, { status: 500 });
  }
}

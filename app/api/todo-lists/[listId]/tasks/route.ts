
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { defineAbilitiesFor } from '@/modules/access-control/ability';
import { getTodoListById, getTasks, createTask } from '@/modules/todo-list/core.server';
import { Task } from '@/modules/todo-list/types';

interface RouteParams {
  params: { listId: string };
}

/**
 * GET /api/todo-lists/[listId]/tasks
 * Busca todas as tarefas para uma lista de tarefas específica.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;
  try {
    const list = await getTodoListById(listId);
    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('read', list)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const tasks = await getTasks(listId);
    return NextResponse.json(Object.values(tasks));

  } catch (error) {
    console.error(`Error fetching tasks for list ${listId}:`, error);
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}

/**
 * POST /api/todo-lists/[listId]/tasks
 * Cria uma nova tarefa para uma lista de tarefas específica.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;
  try {
    const list = await getTodoListById(listId);
    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('update', list)) { // Precisa de permissão para 'atualizar' a lista para adicionar tarefas
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }

    const newTaskId = `task_${Date.now()}`;
    const newTask: Omit<Task, 'id'> = {
      listId,
      title,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...body,
    };

    await createTask(listId, newTaskId, newTask);

    return NextResponse.json({ ...newTask, id: newTaskId }, { status: 201 });

  } catch (error) {
    console.error(`Error creating task for list ${listId}:`, error);
    return NextResponse.json({ message: "Error creating task" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { updateTask, deleteTask, getTodoListById } from "@/modules/todo-list/core.server";
import { verifySession } from "@/lib/session";
import { defineAbilitiesFor } from "@/modules/access-control/ability";
import { Task } from "@/modules/todo-list/types";

interface RouteParams {
  params: { listId: string; taskId: string };
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId, taskId } = params;
  const body = await req.json() as Partial<Omit<Task, 'id'>>;

  try {
    const list = await getTodoListById(listId);
    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('update', list)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await updateTask(listId, taskId, body);
    return NextResponse.json({ message: "Task updated" }, { status: 200 });

  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error);
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId, taskId } = params;

  try {
    const list = await getTodoListById(listId);
    if (!list) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('update', list)) { // Deleting is a form of updating
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await deleteTask(listId, taskId);
    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error);
    return NextResponse.json({ message: "Error deleting task" }, { status: 500 });
  }
}

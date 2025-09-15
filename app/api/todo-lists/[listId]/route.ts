
import { NextRequest, NextResponse } from "next/server";
import { getTodoListById, deleteTodoList, updateTask as coreUpdateTask } from "@/modules/todo-list/core.server";
import { verifySession } from "@/lib/session";
import { defineAbilitiesFor } from "@/modules/access-control/ability";
import { Task } from "@/modules/todo-list/types";

interface RouteParams {
  params: { listId: string };
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;

  try {
    const todoList = await getTodoListById(listId);

    if (!todoList) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('read', todoList)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(todoList);

  } catch (error) {
    console.error(`Error fetching list ${listId}:`, error);
    return NextResponse.json({ message: "Error fetching list data" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;

  try {
    const todoList = await getTodoListById(listId);

    if (!todoList) {
      return NextResponse.json({ message: "List not found or already deleted" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('delete', todoList)) {
      return NextResponse.json({ message: "Forbidden: Only the owner can delete this list." }, { status: 403 });
    }

    await deleteTodoList(listId);

    return new NextResponse(null, { status: 204 });

  } catch (error) {
    console.error(`Error deleting list ${listId}:`, error);
    return NextResponse.json({ message: "Error deleting list" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    const user = await verifySession(req);
    if (!user) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { listId } = params;
    const body = await req.json() as Partial<Task>;

    try {
        const todoList = await getTodoListById(listId);
        if (!todoList) {
            return NextResponse.json({ message: "List not found" }, { status: 404 });
        }

        const ability = defineAbilitiesFor(user);
        if (ability.cannot('update', todoList)) {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

        await coreUpdateTask(listId, body.id as string, body);

        return NextResponse.json({ message: "Task updated successfully" }, { status: 200 });

    } catch (error) {
        console.error(`Error updating task in list ${listId}:`, error);
        return NextResponse.json({ message: "Error updating task" }, { status: 500 });
    }
}

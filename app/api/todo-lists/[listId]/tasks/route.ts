
import { NextRequest, NextResponse } from "next/server";
import { createTask as coreCreateTask, getTodoListById } from "@/modules/todo-list/core.server";
import { verifySession } from "@/lib/session";
import { defineAbilitiesFor } from "@/modules/access-control/ability";
import { Task } from "@/modules/todo-list/types";

interface RouteParams {
  params: { listId: string };
}

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
    if (ability.cannot('update', list)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const taskData = (await req.json()) as Omit<Task, 'id'>;
    const newTask = await coreCreateTask(listId, taskData);

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error(`Error creating task in list ${listId}:`, error);
    return NextResponse.json({ message: "Error creating task" }, { status: 500 });
  }
}

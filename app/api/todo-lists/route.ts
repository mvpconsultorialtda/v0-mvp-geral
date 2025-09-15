
import { NextRequest, NextResponse } from "next/server";
import { getTodoLists, createTodoList as coreCreateTodoList } from "@/modules/todo-list/core.server";
import { verifySession } from "@/lib/session";
import { TodoList } from "@/modules/todo-list/types";

export async function GET(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const lists = await getTodoLists();
    return NextResponse.json(lists);
  } catch (error) {
    console.error("Error fetching todo lists:", error);
    return NextResponse.json({ message: "Error fetching lists" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const listData = (await req.json()) as Omit<TodoList, 'id' | 'tasks'>;
    const listId = `list_${Date.now()}`;
    await coreCreateTodoList(listId, { ...listData, ownerId: user.uid });
    return NextResponse.json({ id: listId, ...listData }, { status: 201 });

  } catch (error) {
    console.error("Error creating todo list:", error);
    return NextResponse.json({ message: "Error creating list" }, { status: 500 });
  }
}

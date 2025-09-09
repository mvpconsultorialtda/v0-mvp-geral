
import { NextRequest, NextResponse } from "next/server";
import { getTodoListById, updateTodoList, deleteTodoList } from "@/modules/todo-list/core.server";
import { verifySession } from "@/lib/session";
import { defineAbilitiesFor } from "@/modules/access-control/ability";
import { TodoItem, TodoList } from "@/modules/todo-list/types";

// Parâmetros esperados na URL para esta rota dinâmica.
interface RouteParams {
  params: { listId: string };
}

// GET: Retorna os detalhes de uma lista de tarefas específica.
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

// PUT: Atualiza uma lista de tarefas (ex: adicionando/removendo tarefas).
export async function PUT(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;
  const updatedListData: Partial<TodoList> = await req.json();

  try {
    const existingList = await getTodoListById(listId);
    if (!existingList) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('update', existingList)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    // Combina os dados existentes com os novos dados
    const newListData = { ...existingList, ...updatedListData };

    await updateTodoList(listId, newListData);

    return NextResponse.json({ message: "List updated successfully" });

  } catch (error) {
    console.error(`Error updating list ${listId}:`, error);
    return NextResponse.json({ message: "Error updating list" }, { status: 500 });
  }
}

// POST: Adiciona uma nova tarefa a uma lista de tarefas específica.
export async function POST(req: NextRequest, { params }: RouteParams) {
    // Atualmente, a atualização da lista é feita via PUT. 
    // Esta função pode ser usada para outras operações no futuro.
    return NextResponse.json({ message: "Method Not Implemented" }, { status: 501 });
}

// DELETE: Apaga uma lista de tarefas específica.
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

    return NextResponse.json({ message: "List deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error(`Error deleting list ${listId}:`, error);
    return NextResponse.json({ message: "Error deleting list" }, { status: 500 });
  }
}

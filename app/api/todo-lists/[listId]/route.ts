
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
    // ... (código existente inalterado)
}

// POST: Adiciona uma nova tarefa a uma lista de tarefas específica.
export async function POST(req: NextRequest, { params }: RouteParams) {
    // ... (código existente inalterado)
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
      // Se já não existe, consideramos a operação um sucesso idempotente.
      return NextResponse.json({ message: "List not found or already deleted" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    // Apenas o dono pode apagar a lista.
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

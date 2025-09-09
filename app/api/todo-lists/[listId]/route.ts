
import { NextRequest, NextResponse } from "next/server";
import { getTodoListById, deleteTodoList } from "@/modules/todo-list/core.server";
import { verifySession } from "@/lib/session";
import { defineAbilitiesFor } from "@/modules/access-control/ability";

// Parâmetros esperados na URL para esta rota dinâmica.
interface RouteParams {
  params: { listId: string };
}

/**
 * GET /api/todo-lists/[listId]
 * Retorna os metadados de uma lista de tarefas específica (sem as tarefas).
 */
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
    // A verificação de permissão usa o objeto da lista que não contém mais as tarefas.
    if (ability.cannot('read', todoList)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    
    // Retorna apenas os dados da lista, as tarefas serão buscadas em um endpoint separado.
    return NextResponse.json(todoList);

  } catch (error) {
    console.error(`Error fetching list ${listId}:`, error);
    return NextResponse.json({ message: "Error fetching list data" }, { status: 500 });
  }
}

/**
 * DELETE /api/todo-lists/[listId]
 * Apaga uma lista de tarefas e todas as tarefas associadas a ela.
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;

  try {
    const todoList = await getTodoListById(listId);

    if (!todoList) {
      // Se já foi deletada, consideramos a operação um sucesso (idempotência).
      return NextResponse.json({ message: "List not found or already deleted" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('delete', todoList)) {
      return NextResponse.json({ message: "Forbidden: Only the owner can delete this list." }, { status: 403 });
    }

    // A função deleteTodoList agora cuida da exclusão em cascata das tarefas.
    await deleteTodoList(listId);

    return new NextResponse(null, { status: 204 }); // 204 No Content para sucesso na exclusão.

  } catch (error) {
    console.error(`Error deleting list ${listId}:`, error);
    return NextResponse.json({ message: "Error deleting list" }, { status: 500 });
  }
}

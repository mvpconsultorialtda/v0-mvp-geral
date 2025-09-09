
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { defineAbilitiesFor } from "@/modules/access-control/ability";
import { createTodoList, getTodoLists } from "@/modules/todo-list/core.server";
import { TodoList } from "@/modules/todo-list/types";

/**
 * GET /api/todo-lists
 * Busca todas as listas de tarefas acessíveis para o usuário.
 */
export async function GET(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(user);

  try {
    // getTodoLists já usa o readDb seguro.
    const allLists = await getTodoLists();
    const accessibleLists: Record<string, TodoList> = {};

    // Filtra as listas com base nas permissões do usuário.
    for (const listId in allLists) {
      if (Object.prototype.hasOwnProperty.call(allLists, listId)) {
        const list = allLists[listId];
        if (ability.can('read', list)) {
          accessibleLists[listId] = { ...list, id: listId };
        }
      }
    }

    // Retorna um objeto de listas acessíveis. O frontend iterará sobre Object.values().
    return NextResponse.json(accessibleLists);
  } catch (error: any) {
    console.error("Error fetching todo lists:", error);
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}

/**
 * POST /api/todo-lists
 * Cria uma nova lista de tarefas.
 */
export async function POST(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(user);
  
  // A verificação de permissão é feita antes de ler o corpo da requisição.
  if (ability.cannot('create', 'TodoList')) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "'name' is required" }, { status: 400 });
    }

    const newListId = `list_${Date.now()}`;
    // O objeto da nova lista não precisa mais do campo 'todos'.
    const newList: Omit<TodoList, 'id' | 'todos'> = {
      name,
      ownerId: user.uid,
      accessControl: {},
    };

    await createTodoList(newListId, newList);

    return NextResponse.json({ ...newList, id: newListId }, { status: 201 });

  } catch (error: any) {
    console.error("Error creating list:", error);
    return NextResponse.json({ message: "Error creating list" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
// CORRIGIDO: O caminho da importação foi ajustado para o local correto.
import { defineAbilitiesFor } from "@/modules/access-control/ability";
import { createTodoList, getTodoLists } from "@/modules/todo-list/core.server";
import { TodoList } from "@/modules/todo-list/types";

/**
 * API para obter as listas de tarefas do usuário.
 */
export async function GET(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(user);

  try {
    const allLists = await getTodoLists();
    const accessibleLists: Record<string, TodoList> = {};

    // Filtra as listas no servidor com base nas permissões do CASL.
    for (const listId in allLists) {
      if (Object.prototype.hasOwnProperty.call(allLists, listId)) {
        const list = allLists[listId];
        // CORRIGIDO: Passa-se a instância do objeto diretamente para a verificação de condições.
        if (ability.can('read', list)) {
          accessibleLists[listId] = list;
        }
      }
    }

    return NextResponse.json(accessibleLists);
  } catch (error: any) {
    console.error("Error reading data or checking permissions:", error);
    return NextResponse.json({ message: "Error reading data", error: error.message }, { status: 500 });
  }
}

// POST: Cria uma nova lista de tarefas.
export async function POST(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(user);
  
  if (ability.cannot('create', 'TodoList')) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { name } = await req.json();
    if (!name) {
      return NextResponse.json({ message: "'name' is required" }, { status: 400 });
    }

    const newListId = `list_${Date.now()}`;
    const newList: TodoList = {
      name,
      ownerId: user.uid,
      accessControl: {},
      todos: [],
    };

    await createTodoList(newListId, newList);

    return NextResponse.json({ message: "List created successfully", listId: newListId }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating list in Firestore:", error);
    return NextResponse.json({ message: "Error creating list", error: error.message }, { status: 500 });
  }
}

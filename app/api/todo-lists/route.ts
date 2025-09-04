
import { NextRequest, NextResponse } from "next/server";
import { getTodoLists, saveTodoList } from "@/src/modules/todo-list/core";
import { verifySession } from "@/src/lib/session";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";
import { TodoList } from "@/src/modules/todo-list/types";

/**
 * API para listar todas as TodoLists ou criar uma nova.
 */

// GET: Retorna as listas de tarefas que o usuário tem permissão para ver.
export async function GET(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(user);

  try {
    const allLists = getTodoLists();
    const accessibleLists: Record<string, TodoList> = {};

    // Filtra as listas no servidor com base nas permissões do CASL.
    for (const listId in allLists) {
      if (Object.prototype.hasOwnProperty.call(allLists, listId)) {
        const list = allLists[listId];
        // O CASL verifica se o usuário pode ler esta lista específica.
        if (ability.can('read', list)) {
          accessibleLists[listId] = list;
        }
      }
    }

    return NextResponse.json(accessibleLists);
  } catch (error) {
    return NextResponse.json({ message: "Error reading data" }, { status: 500 });
  }
}

// POST: Cria uma nova lista de tarefas.
export async function POST(req: NextRequest) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const ability = defineAbilitiesFor(user);
  // Verifica se o usuário tem permissão para criar uma nova lista.
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
      ownerId: user.uid, // O criador da lista é o dono.
      accessControl: {},
      todos: [],
    };

    saveTodoList(newListId, newList);

    return NextResponse.json({ message: "List created successfully", listId: newListId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating list" }, { status: 500 });
  }
}

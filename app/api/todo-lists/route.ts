
import { NextRequest, NextResponse } from "next/server";
import { getTodoLists, createTodoList } from "@/src/modules/todo-list/core.server";
import { verifySession } from "@/src/lib/session";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";
import { TodoList } from "@/src/modules/todo-list/types";

// GET: Retorna as listas de tarefas que o usuário tem permissão para ver.
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
        // CORREÇÃO: Passar o tipo 'TodoList' como string e o objeto para verificação de condições.
        if (ability.can('read', 'TodoList', list)) {
          accessibleLists[listId] = list;
        }
      }
    }

    return NextResponse.json(accessibleLists);
  } catch (error: any) {
    console.error("Error reading data or checking permissions:", error);
    // Adicionar mais detalhes do erro na resposta em desenvolvimento
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
  
  // A verificação de criação já estava correta, pois não depende de uma instância de objeto.
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

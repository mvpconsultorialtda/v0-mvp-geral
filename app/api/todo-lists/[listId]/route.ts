
import { NextRequest, NextResponse } from "next/server";
import { getTodoListById, updateTodoList } from "@/src/modules/todo-list/core";
import { verifySession } from "@/src/lib/session";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";
import { TodoItem } from "@/src/modules/todo-list/types";

// Parâmetros esperados na URL para esta rota dinâmica.
interface RouteParams {
  params: { listId: string };
}

/**
 * API para obter os detalhes de uma TodoList específica ou adicionar uma tarefa a ela.
 */

// GET: Retorna os detalhes de uma lista de tarefas específica.
export async function GET(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;
  const todoList = getTodoListById(listId);

  if (!todoList) {
    return NextResponse.json({ message: "List not found" }, { status: 404 });
  }

  const ability = defineAbilitiesFor(user);
  // Futuramente, a verificação de acesso será mais granular.
  // Por agora, o usuário precisa ter acesso geral.
  if (ability.cannot('read', todoList)) {
     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(todoList);
}

// POST: Adiciona uma nova tarefa a uma lista de tarefas específica.
export async function POST(req: NextRequest, { params }: RouteParams) {
  const user = await verifySession(req);
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { listId } = params;
  const todoList = getTodoListById(listId);

  if (!todoList) {
    return NextResponse.json({ message: "List not found" }, { status: 404 });
  }

  const ability = defineAbilitiesFor(user);
  // Verifica se o usuário tem permissão para editar a lista.
  if (ability.cannot('update', todoList)) {
     return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const { title } = await req.json();
    if (!title) {
      return NextResponse.json({ message: "'title' is required" }, { status: 400 });
    }

    const newTodo: TodoItem = {
      id: `task_${Date.now()}`,
      title,
      status: "pending",
    };

    todoList.todos.push(newTodo);
    updateTodoList(listId, todoList);

    return NextResponse.json({ message: "Todo added successfully", todo: newTodo }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error adding todo" }, { status: 500 });
  }
}

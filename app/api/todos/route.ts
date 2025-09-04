
import { NextRequest, NextResponse } from "next/server";
import {
  readTodoListData,
  writeTodoListData,
} from "@/src/modules/todo-list/core";
import { verifySession } from "@/src/lib/session"; // Importa a função de verificação de sessão
import { defineAbilitiesFor } from "@/src/modules/access-control/ability"; // Importa as definições de habilidade

// Função auxiliar para verificar permissões em qualquer requisição
async function checkPermissions(req: NextRequest) {
  const user = await verifySession(req);

  if (!user) {
    // Se não houver sessão válida, o usuário não está autenticado.
    return { authorized: false, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const ability = defineAbilitiesFor(user);

  // Verifica se o usuário tem a permissão para 'access' o módulo 'TodoList'.
  if (ability.cannot('access', 'TodoList')) {
    // Se não tiver permissão, o acesso é proibido.
    return { authorized: false, response: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  // Se passou em ambas as verificações, a requisição está autorizada.
  return { authorized: true, response: null };
}

/**
 * API route for retrieving the entire todo list data.
 * Agora protegida por verificação de sessão e permissão.
 */
export async function GET(req: NextRequest) {
  const { authorized, response } = await checkPermissions(req);
  if (!authorized) {
    return response;
  }

  try {
    const data = readTodoListData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Error reading data" }, { status: 500 });
  }
}

/**
 * API route for saving the entire todo list data.
 * Agora protegida por verificação de sessão e permissão.
 */
export async function POST(req: NextRequest) {
  const { authorized, response } = await checkPermissions(req);
  if (!authorized) {
    return response;
  }

  try {
    const data = await req.json();
    writeTodoListData(data);
    return NextResponse.json({ message: "Data saved successfully" });
  } catch (error) {
    return NextResponse.json({ message: "Error saving data" }, { status: 500 });
  }
}

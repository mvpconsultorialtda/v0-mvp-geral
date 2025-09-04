
import { NextRequest, NextResponse } from "next/server";
import { getTodoListById, saveTodoList } from "@/src/modules/todo-list/core";
import { verifySession } from "@/src/lib/session";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";
import * as fs from 'fs';
import * as path from 'path';

// Parâmetros esperados na URL para esta rota dinâmica.
interface RouteParams {
  params: { listId: string };
}

// Simula a busca de um usuário em um banco de dados.
// Em uma aplicação real, isso seria uma consulta a um banco de dados de usuários.
const findUserByEmail = (email: string): { uid: string } | null => {
  const usersPath = path.resolve(process.cwd(), 'data/users.json');
  if (fs.existsSync(usersPath)) {
    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    return usersData[email] || null;
  }
  return null;
};

/**
 * API para compartilhar uma lista de tarefas com outros usuários.
 */
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
  // Apenas o dono (ou admin) pode gerenciar o compartilhamento.
  // Usamos a permissão 'manage' que já definimos.
  if (ability.cannot('manage', todoList)) {
    return NextResponse.json({ message: "Forbidden: Only the owner can share this list." }, { status: 403 });
  }

  try {
    const { email, permission } = await req.json();

    if (!email || !permission) {
      return NextResponse.json({ message: "'email' and 'permission' are required" }, { status: 400 });
    }

    if (permission !== 'viewer' && permission !== 'editor') {
        return NextResponse.json({ message: "Permission must be 'viewer' or 'editor'" }, { status: 400 });
    }

    const userToShareWith = findUserByEmail(email);
    if (!userToShareWith) {
        return NextResponse.json({ message: `User with email ${email} not found` }, { status: 404 });
    }

    // Não permitir que o dono altere a própria permissão através desta rota.
    if(userToShareWith.uid === todoList.ownerId) {
        return NextResponse.json({ message: "Cannot change owner's permission via share route." }, { status: 400 });
    }

    // Adiciona ou atualiza a permissão do usuário no mapa de controle de acesso.
    todoList.accessControl[userToShareWith.uid] = permission;

    saveTodoList(listId, todoList);

    return NextResponse.json({ message: `List shared with ${email} as ${permission}.` }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Error sharing list" }, { status: 500 });
  }
}

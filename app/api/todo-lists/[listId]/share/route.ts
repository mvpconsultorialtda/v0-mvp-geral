
import { NextRequest, NextResponse } from "next/server";
import { getTodoListById, updateTodoList } from "@/src/modules/todo-list/core";
import { verifySession } from "@/src/lib/session";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";
import { getAdminAuth } from "@/lib/firebase-admin";

// Parâmetros esperados na URL para esta rota dinâmica.
interface RouteParams {
  params: { listId: string };
}

// Procura um usuário no Firebase Auth pelo e-mail.
const findUserByEmail = async (email: string): Promise<{ uid: string } | null> => {
  try {
    const auth = getAdminAuth();
    const userRecord = await auth.getUserByEmail(email);
    return { uid: userRecord.uid };
  } catch (error: any) {
    // O erro 'auth/user-not-found' é esperado se o e-mail não existir.
    if (error.code === 'auth/user-not-found') {
      return null;
    }
    // Outros erros devem ser lançados.
    throw error;
  }
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

  try {
    const todoList = await getTodoListById(listId);

    if (!todoList) {
      return NextResponse.json({ message: "List not found" }, { status: 404 });
    }

    const ability = defineAbilitiesFor(user);
    if (ability.cannot('manage', todoList)) {
      return NextResponse.json({ message: "Forbidden: Only the owner can share this list." }, { status: 403 });
    }

    const { email, permission } = await req.json();

    if (!email || !permission) {
      return NextResponse.json({ message: "'email' and 'permission' are required" }, { status: 400 });
    }

    if (permission !== 'viewer' && permission !== 'editor') {
        return NextResponse.json({ message: "Permission must be 'viewer' or 'editor'" }, { status: 400 });
    }

    const userToShareWith = await findUserByEmail(email);
    if (!userToShareWith) {
        return NextResponse.json({ message: `User with email ${email} not found` }, { status: 404 });
    }

    if(userToShareWith.uid === todoList.ownerId) {
        return NextResponse.json({ message: "Cannot change owner's permission via share route." }, { status: 400 });
    }

    todoList.accessControl[userToShareWith.uid] = permission;

    await updateTodoList(listId, todoList);

    return NextResponse.json({ message: `List shared with ${email} as ${permission}.` }, { status: 200 });

  } catch (error) {
    console.error(`Error sharing list ${listId}:`, error);
    return NextResponse.json({ message: "Error sharing list" }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { verifySession } from "@/lib/session"; // Importa a nova função de verificação de sessão
import { defineAbilitiesFor } from "@/src/modules/access-control/ability"; // Importa as definições de habilidade do CASL

// Função auxiliar para verificar permissões de administrador usando CASL
async function checkAdminPermissions(req: NextRequest) {
  const user = await verifySession(req);

  if (!user) {
    return { authorized: false, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const ability = defineAbilitiesFor(user);

  // Verifica se o usuário tem a permissão para 'manage' (gerenciar) o assunto 'User'.
  // A role 'admin' tem a permissão 'manage' em 'all', que passa nesta verificação.
  if (ability.cannot('manage', 'User')) {
    return { authorized: false, response: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
  }

  return { authorized: true, response: null };
}


export async function GET(req: NextRequest) {
  // 1. Verifica as permissões usando o novo sistema centralizado.
  const { authorized, response } = await checkAdminPermissions(req);
  if (!authorized) {
    return response;
  }

  try {
    // 2. Continua com a lógica de negócio se a permissão for concedida.
    const adminAuth = getAdminAuth();
    const listUsersResult = await adminAuth.listUsers(1000);
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || 'user', 
    }));

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao buscar usuários." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    // 1. Verifica as permissões usando o novo sistema centralizado.
    const { authorized, response } = await checkAdminPermissions(req);
    if (!authorized) {
      return response;
    }

    try {
        // 2. Continua com a lógica de negócio se a permissão for concedida.
        const { uid, role } = await req.json();

        if (!uid || !role) {
            return NextResponse.json({ message: "UID do usuário e a nova role são obrigatórios." }, { status: 400 });
        }

        const adminAuth = getAdminAuth();
        await adminAuth.setCustomUserClaims(uid, { role });

        return NextResponse.json({ message: `Role do usuário ${uid} atualizada para ${role} com sucesso.` }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar a role do usuário:", error);
        return NextResponse.json({ message: "Erro interno do servidor ao atualizar a role." }, { status: 500 });
    }
}

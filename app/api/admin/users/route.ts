import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { getAuth } from "firebase-admin/auth";
import { defineAbilitiesFor } from "@/src/modules/access-control/ability";

// Função auxiliar para verificar as permissões do solicitante
async function checkPermissions(req: NextRequest) {
  const authorization = req.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return { authorized: false, response: NextResponse.json({ message: "Unauthorized" }, { status: 401 }) };
  }

  const token = authorization.split("Bearer ")[1];
  try {
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // FOR DEVELOPMENT ONLY: A simulação de admin está centralizada em `defineAbilitiesFor`
    const permissionUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        isAdmin: !!decodedToken.admin // Usa a claim real se existir
    };

    const ability = defineAbilitiesFor(permissionUser);

    if (ability.cannot('manage', 'User')) {
      return { authorized: false, response: NextResponse.json({ message: "Forbidden" }, { status: 403 }) };
    }

    return { authorized: true, response: null };

  } catch (error) {
    console.error("Error verifying token:", error);
    return { authorized: false, response: NextResponse.json({ message: "Invalid token" }, { status: 401 }) };
  }
}

export async function GET(req: NextRequest) {
  const { authorized, response } = await checkPermissions(req);
  if (!authorized) {
    return response;
  }

  try {
    const adminAuth = getAdminAuth();
    const listUsersResult = await adminAuth.listUsers(1000);
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.admin ? 'admin' : 'user', 
    }));

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao buscar usuários." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const { authorized, response } = await checkPermissions(req);
    if (!authorized) {
      return response;
    }

    try {
        const { uid, role } = await req.json();

        if (!uid || !role) {
            return NextResponse.json({ message: "UID do usuário e a nova role são obrigatórios." }, { status: 400 });
        }

        const adminAuth = getAdminAuth();
        await adminAuth.setCustomUserClaims(uid, { admin: role === 'admin' });

        return NextResponse.json({ message: `Role do usuário ${uid} atualizada para ${role} com sucesso.` }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar a role do usuário:", error);
        return NextResponse.json({ message: "Erro interno do servidor ao atualizar a role." }, { status: 500 });
    }
}

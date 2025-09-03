
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";
import { verifyAdminRequest } from "@/src/modules/authentication/core";

/**
 * API route for admin-level user management.
 * - GET: Lists all users.
 * - POST: Updates a user's role.
 * All actions require administrator privileges.
 */

export async function GET(req: NextRequest) {
  const adminAuth = getAdminAuth();
  
  // 1. Verify if the request comes from an authenticated admin.
  const decodedToken = await verifyAdminRequest(adminAuth, req);
  if (!decodedToken) {
    return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
  }

  try {
    // 2. Fetch all users from Firebase Authentication.
    const listUsersResult = await adminAuth.listUsers(1000); // Fetches up to 1000 users
    
    const users = listUsersResult.users.map(user => ({
      uid: user.uid,
      email: user.email,
      role: user.customClaims?.role || 'user', // Default to 'user' if no role is set
    }));

    // 3. Return the list of users.
    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json({ message: "Erro interno do servidor ao buscar usuários." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
    const adminAuth = getAdminAuth();

    // 1. Verify if the request comes from an authenticated admin.
    const decodedToken = await verifyAdminRequest(adminAuth, req);
    if (!decodedToken) {
      return NextResponse.json({ message: "Acesso não autorizado." }, { status: 403 });
    }

    try {
        // 2. Get the user ID (uid) and the new role from the request body.
        const { uid, role } = await req.json();

        if (!uid || !role) {
            return NextResponse.json({ message: "UID do usuário e a nova role são obrigatórios." }, { status: 400 });
        }

        // 3. Set the new custom claim for the specified user.
        await adminAuth.setCustomUserClaims(uid, { role });

        // 4. Return a success response.
        return NextResponse.json({ message: `Role do usuário ${uid} atualizada para ${role} com sucesso.` }, { status: 200 });

    } catch (error) {
        console.error("Erro ao atualizar a role do usuário:", error);
        return NextResponse.json({ message: "Erro interno do servidor ao atualizar a role." }, { status: 500 });
    }
}

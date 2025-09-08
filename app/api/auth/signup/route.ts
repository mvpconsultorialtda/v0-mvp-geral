
import { NextRequest } from "next/server";
import { createUser } from "@/modules/authentication/core"; // The business logic
import { getAdminAuth } from "@/lib/firebase-admin.server"; // The specific project dependency

/**
 * API route handler for creating a new user (signup).
 * This route acts as the integration layer, using the core authentication logic
 * with the project-specific Firebase Admin instance.
 */
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Define o role padrão para novos usuários. Isso garante que os usuários 
  // não possam atribuir a si mesmos roles elevados no momento do cadastro.
  const defaultRole = 'user_default';

  // Obtém a instância de autenticação e delega a criação do usuário para o módulo principal,
  // forçando a atribuição do role padrão.
  const adminAuth = getAdminAuth();
  return await createUser(adminAuth, email, password, defaultRole);
}

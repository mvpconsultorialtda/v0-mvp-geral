
import { getAdminAuth } from './firebase-admin.server';
import { NextRequest } from 'next/server';

// Define a estrutura esperada do usuário extraído do token
type AuthenticatedUser = {
  uid: string; // <-- Corrigido de 'id' para 'uid' para corresponder ao CASL e Firebase
  role: string;
  email?: string;
};

/**
 * Verifica o cookie de sessão do Firebase a partir de uma NextRequest.
 * 
 * @param request A requisição Next.js que contém os cookies.
 * @returns Uma promessa que resolve para os dados do usuário autenticado 
 *          (incluindo uid e role) ou null se o token for inválido ou ausente.
 */
export async function verifySession(request: NextRequest): Promise<AuthenticatedUser | null> {
  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    // Usa o SDK Admin para verificar a validade do cookie de sessão.
    // O segundo argumento `true` verifica se o token foi revogado.
    const decodedToken = await getAdminAuth().verifySessionCookie(sessionToken, true);

    // O 'role' é esperado como uma custom claim no token.
    // Se não estiver presente, o acesso pode ser negado ou um role padrão pode ser assumido.
    const user: AuthenticatedUser = {
      uid: decodedToken.uid, // <-- Corrigido de 'id' para 'uid'
      role: decodedToken.role || 'user_default', // Garante que sempre haverá um role
      email: decodedToken.email,
    };

    return user;

  } catch (error) {
    // O token é inválido (expirado, malformado, etc.)
    console.error('Error verifying session cookie:', error);
    return null;
  }
}

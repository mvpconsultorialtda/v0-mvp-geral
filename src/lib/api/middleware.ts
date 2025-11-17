import { getAdminAuth } from '../firebase-admin.server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

type AuthenticatedUser = {
  uid: string;
  email?: string;
  name?: string;
};

type Handler<T = any> = (
  request: Request,
  context: T & { user: AuthenticatedUser }
) => Promise<NextResponse> | NextResponse;

/**
 * Middleware de autenticação para proteger as rotas da API.
 * Verifica o token do Firebase e injeta os dados do usuário no contexto.
 *
 * @param handler O handler da rota a ser protegido.
 * @returns Um novo handler que primeiro executa a verificação de autenticação.
 */
export function withAuth<T = any>(handler: Handler<T>) {
  return async (request: Request, context: T): Promise<NextResponse> => {
    const authorization = (await headers()).get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authorization header missing or invalid.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    const token = authorization.split('Bearer ')[1];
    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Bearer token missing.' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    try {
      const decodedToken = await getAdminAuth().verifyIdToken(token);
      const user: AuthenticatedUser = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
      };

      // Injeta o usuário no contexto e chama o handler original
      return handler(request, { ...context, user });
    } catch (error) {
      console.error('Error verifying auth token:', error);
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Invalid authentication token.' }),
        { status: 403, headers: { 'content-type': 'application/json' } }
      );
    }
  };
}

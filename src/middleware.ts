import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Defina as rotas que devem ser públicas
const publicRoutes = ['/login', '/signup', '/']; // A raiz agora é explicitamente pública

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  // 2. Verifique se o usuário está autenticado
  const isUserAuthenticated = !!sessionCookie;

  // 3. Verifique se a rota é pública
  const isPublicRoute = publicRoutes.includes(pathname);

  // Se o usuário está autenticado...
  if (isUserAuthenticated) {
    // E tenta acessar uma rota pública (login/signup), redirecione para /todo-list
    if (isPublicRoute) {
      return NextResponse.redirect(new URL('/todo-list', request.url));
    }
  } 
  // Se o usuário NÃO está autenticado...
  else {
    // E tenta acessar uma rota protegida, redirecione para /login
    if (!isPublicRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Se nenhuma das condições acima se aplicar, continue a requisição
  return NextResponse.next();
}

export const config = {
  /*
   * O matcher agora intercepta TODAS as rotas, exceto as que são para
   * recursos estáticos da Next.js (arquivos, imagens, etc.).
   * A lógica DENTRO do middleware agora decide quais rotas são públicas.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

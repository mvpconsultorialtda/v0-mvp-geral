
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Especifique as rotas que você quer proteger (agora incluindo a raiz)
const protectedRoutes = ['/', '/admin', '/modules', '/profile'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('session')?.value;

  // 2. Permite acesso irrestrito às páginas de autenticação para evitar loops
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    return NextResponse.next();
  }

  // 3. Verifica se a rota acessada é uma das rotas protegidas
  // Para a rota raiz '/', a verificação deve ser exata.
  const isProtectedRoute = protectedRoutes.some(route => 
    route === '/' ? pathname === route : pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // 4. Se a rota é protegida e não há token, redireciona para o login
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      // Guarda a URL que o usuário tentou acessar para redirecioná-lo após o login
      if (pathname !== '/') { // Não precisa redirecionar para a raiz, o comportamento padrão já faz isso
         loginUrl.searchParams.set('redirect', pathname);
      }
      return NextResponse.redirect(loginUrl);
    }
  }

  // 5. Continua a navegação para rotas públicas ou para usuários autenticados
  return NextResponse.next();
}

// Configuração do matcher para definir onde o middleware será executado
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto para os arquivos estáticos e rotas de API.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session'); // <-- CORREÇÃO: Verifica o cookie 'session'
  const { pathname } = request.nextUrl;

  // Lista de rotas públicas que não exigem autenticação
  const publicPaths = ['/login', '/signup'];

  // Verifica se a rota atual é pública
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Se não houver cookie de sessão e a rota não for pública (e não for uma API),
  // redireciona para a página de login.
  if (!sessionCookie && !isPublicPath && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se houver um cookie de sessão e o usuário tentar acessar as rotas de login/signup,
  // redireciona para a página principal da aplicação (todo-list).
  if (sessionCookie && isPublicPath) {
    return NextResponse.redirect(new URL('/todo-list', request.url)); // <-- CORREÇÃO: Redireciona para a página correta
  }

  // Permite que a requisição continue se nenhuma das condições acima for atendida
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica o middleware a todas as rotas, exceto:
     * - Arquivos estáticos (_next/static)
     * - Arquivos de otimização de imagem (_next/image)
     * - Favicon (favicon.ico)
     * - A rota raiz (/), que deve ser pública ou ter seu próprio tratamento.
     */
    '/((?!_next/static|_next/image|favicon.ico|^/$).*)',
  ],
};

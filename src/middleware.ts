
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebaseIdToken');
  const { pathname } = request.nextUrl;

  // Se não houver token e o usuário não estiver tentando acessar a página de login ou signup,
  // redirecione para a página de login.
  if (!token && pathname !== '/login' && pathname !== '/signup' && !pathname.startsWith('/api')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se houver um token e o usuário tentar acessar a página de login ou signup,
  // redirecione para a página de perfil.
  if (token && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/profile', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - / (the root path, which should be public)
     */
    '/((?!_next/static|_next/image|favicon.ico|^/$).*)',
  ],
};


import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 1. Especifique as rotas que você quer proteger
const protectedRoutes = ['/admin', '/modules', '/profile'];

export function middleware(request: NextRequest) {
  // 2. Obtenha o token da sessão dos cookies
  const sessionToken = request.cookies.get('session')?.value;

  const { pathname } = request.nextUrl;

  // 3. Verifique se a rota atual é uma das rotas protegidas
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    // 4. Se não houver token, redirecione para a página de login
    if (!sessionToken) {
      const loginUrl = new URL('/login', request.url);
      // Adiciona um parâmetro 'redirect' para que o usuário volte para a página que tentou acessar após o login
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // (Opcional) Aqui você poderia adicionar uma lógica para verificar a validade do token (ex: decodificá-lo)
    // Se o token for inválido, redirecione para o login também.
  }

  // 5. Se a rota não for protegida ou se o usuário tiver um token, continue a navegação
  return NextResponse.next();
}

// Configuração do matcher para definir onde o middleware será executado
export const config = {
  matcher: [
    /*
     * Corresponde a todos os caminhos de requisição, exceto para:
     * - /api (rotas de API)
     * - /_next/static (arquivos estáticos)
     * - /_next/image (arquivos de otimização de imagem)
     * - favicon.ico (ícone do site)
     * Isso evita que o middleware execute em requisições de recursos desnecessários.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

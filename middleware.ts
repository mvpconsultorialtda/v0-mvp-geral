import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin';

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('session')?.value;

  if (!sessionCookie) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication required.' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    // A verificação do cookie de sessão ainda precisa ser implementada.
    // O cliente obterá um token, enviará para um endpoint /api/auth/session,
    // que criará um cookie httpOnly. Por enquanto, este middleware é um placeholder.
    // const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    // request.headers.set('x-user-id', decodedToken.uid);
    return NextResponse.next();
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: 'Authentication failed.' }),
      { status: 401, headers: { 'content-type': 'application/json' } }
    );
  }
}

// Define as rotas que serão protegidas pelo middleware
export const config = {
  matcher: '/api/lists/:path*',
}


import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Esta função lida com a requisição POST para /api/auth/logout
export async function POST() {
  try {
    // 1. Obtenha a instância do armazenamento de cookies
    const cookieStore = cookies();

    // 2. "Delete" o cookie da sessão definindo seu valor como vazio e a data de expiração no passado
    cookieStore.set('session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: -1, // Expira imediatamente
      path: '/',
    });

    // 3. Responda com sucesso
    return NextResponse.json({ message: 'Logout successful' }, { status: 200 });

  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

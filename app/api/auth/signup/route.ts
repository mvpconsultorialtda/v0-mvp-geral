import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/lib/firebase-admin';

// Garante que o Firebase Admin seja inicializado
initializeFirebaseAdmin();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Validação básica no servidor
    if (!email || !password) {
      return NextResponse.json({ message: 'Email e senha são obrigatórios.' }, { status: 400 });
    }
    
    if (password.length < 6) {
      return NextResponse.json({ message: 'A senha deve ter pelo menos 6 caracteres.' }, { status: 400 });
    }

    // Cria o usuário usando o Firebase Admin SDK
    const userRecord = await getAuth().createUser({
      email,
      password,
    });

    // Você pode adicionar uma role customizada aqui se precisar
    // await getAuth().setCustomUserClaims(userRecord.uid, { role: 'user' });

    return NextResponse.json({ message: 'Usuário criado com sucesso', uid: userRecord.uid }, { status: 201 });

  } catch (error: any) {
    // Tratamento de erros específicos do Firebase
    if (error.code === 'auth/email-already-exists') {
      return NextResponse.json({ message: 'Este email já está em uso.' }, { status: 409 });
    }
    
    // Erro genérico
    console.error('Erro ao criar usuário:', error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}

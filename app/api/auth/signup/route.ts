
import { NextRequest, NextResponse } from "next/server";
import { createUserWithRole } from "@/modules/authentication/helpers"; 
import { getAdminAuth } from "@/lib/firebase-admin.server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // O role padrão para novos usuários é definido aqui, no lado do servidor, por segurança.
  const defaultRole = 'user_default';

  try {
    // A inicialização do Firebase Admin é tentada aqui. 
    // Se falhar, um erro será lançado e capturado pelo bloco catch.
    const adminAuth = getAdminAuth();

    // Delega a criação do usuário para a função helper, que agora é mais robusta.
    const newUser = await createUserWithRole(adminAuth, email, password, defaultRole);

    return NextResponse.json({ message: "Usuário criado com sucesso", user: newUser }, { status: 201 });

  } catch (error: any) {
    // Log do erro para depuração no servidor (ex: Vercel logs)
    console.error("[API Signup Error]", error);

    // Tratamento de erro específico para falha na inicialização do Firebase
    if (error.message.includes("Could not initialize Firebase Admin SDK")) {
      return NextResponse.json(
        { message: "Erro de configuração do servidor. As credenciais do Firebase não estão configuradas." },
        { status: 500 }
      );
    }

    // Tratamento de erros de validação ou do Firebase, usando o statusCode anexado
    const status = error.statusCode || 500;
    const message = error.message || "Erro interno do servidor.";

    return NextResponse.json({ message }, { status });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { createSessionCookie } from "@/modules/authentication/helpers";
import { getAdminAuth } from "@/lib/firebase-admin.server";

export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  try {
    const adminAuth = getAdminAuth();
    const { sessionCookie, expiresIn } = await createSessionCookie(
      adminAuth,
      idToken
    );

    const response = NextResponse.json({ status: "success" }, { status: 200 });

    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[API Login Error]", error);
    if (error.message.includes("Firebase Admin SDK")) {
      return NextResponse.json(
        { message: "Erro de configuração do servidor." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/modules/authentication/helpers";
import { getAdminAuth } from "@/lib/firebase-admin.server";

export async function GET(req: NextRequest) {
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await verifyAdmin(adminAuth, req);

    if (!decodedToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const users = await adminAuth.listUsers();
    return NextResponse.json({ users: users.users });

  } catch (error: any) {
    console.error("[API Users Error]", error);
    if (error.message.includes("Firebase Admin SDK")) {
      return NextResponse.json(
        { message: "Erro de configuração do servidor." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

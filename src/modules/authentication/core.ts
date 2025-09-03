
import type { auth as FirebaseAuth } from "firebase-admin";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// A type alias for the Firebase Admin Auth object. This avoids a hard dependency on
// firebase-admin in consumer files, making the module more portable.
type AdminAuth = typeof FirebaseAuth;

/**
 * Creates a new user in Firebase Authentication.
 * @param auth - The Firebase Admin Auth instance.
 * @param email - The user's email.
 * @param password - The user's password.
 * @param role - The user's role (e.g., 'admin' or 'user'). Defaults to 'user'.
 * @returns A NextResponse object indicating success or failure.
 */
export async function createUser(auth: AdminAuth, email: string, password: string, role: string = 'user') {
  // Basic server-side validation
  if (!email || !password) {
    return NextResponse.json({ message: "Email e senha são obrigatórios." }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ message: "A senha deve ter pelo menos 6 caracteres." }, { status: 400 });
  }

  try {
    const userRecord = await auth.createUser({
      email,
      password,
    });

    // Set the user's role as a custom claim.
    const newRole = role === 'admin' ? 'admin' : 'user';
    await auth.setCustomUserClaims(userRecord.uid, { role: newRole });

    return NextResponse.json({ message: "Usuário criado com sucesso", uid: userRecord.uid }, { status: 201 });

  } catch (error: any) {
    // Firebase-specific error handling
    if (error.code === "auth/email-already-exists") {
      return NextResponse.json({ message: "Este email já está em uso." }, { status: 409 });
    }

    // Generic server error
    console.error("Erro ao criar usuário:", error);
    return NextResponse.json({ message: "Erro interno do servidor." }, { status: 500 });
  }
}

/**
 * Creates a session cookie based on a Firebase ID token and sets it in the response.
 * @param auth - The Firebase Admin Auth instance.
 * @param idToken - The Firebase ID token received from the client.
 * @returns A NextResponse object indicating success.
 */
export async function createSession(auth: AdminAuth, idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

  cookies().set("session", sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ status: "success" }, { status: 200 });
}

/**
 * Clears the session cookie from the browser.
 * @returns A NextResponse object indicating success.
 */
export function clearSession() {
  cookies().set("session", "", {
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return NextResponse.json({ status: "success" }, { status: 200 });
}

/**
 * Verifies the ID token from an Authorization header to check for admin privileges.
 * This is a stateless verification method, ideal for secure API endpoints.
 * @param auth - The Firebase Admin Auth instance.
 * @param request - The incoming NextRequest.
 * @returns The decoded token if the user is an admin, otherwise null.
 */
export async function verifyAdminRequest(auth: AdminAuth, request: NextRequest) {
  const authorization = request.headers.get("Authorization");

  if (authorization?.startsWith("Bearer ")) {
    const idToken = authorization.split("Bearer ")[1];
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      if (decodedToken.role === "admin") {
        return decodedToken;
      }
    } catch (error) {
      console.error("Error verifying admin token:", error);
      return null;
    }
  }

  return null;
}


import type { auth as FirebaseAuth } from "firebase-admin";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

// A type alias for the Firebase Admin Auth object
type AdminAuth = typeof FirebaseAuth;

/**
 * Creates a new user in Firebase with a specific role.
 * @throws Throws an error if creation fails.
 */
export async function createUserWithRole(auth: AdminAuth, email: string, password: string, role: string) {
  if (!email || !password || !role) {
    const error = new Error("Email, senha e role são obrigatórios.");
    (error as any).statusCode = 400;
    throw error;
  }
  if (password.length < 6) {
    const error = new Error("A senha deve ter pelo menos 6 caracteres.");
    (error as any).statusCode = 400;
    throw error;
  }

  try {
    const userRecord = await auth.createUser({ email, password });
    await auth.setCustomUserClaims(userRecord.uid, { role });
    return { uid: userRecord.uid, email: userRecord.email, role };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      (error as any).statusCode = 409;
    } else {
      (error as any).statusCode = 500;
    }
    throw error;
  }
}

/**
 * Creates a session cookie for the user and sets it.
 */
export async function createSessionCookie(auth: AdminAuth, idToken: string) {
  const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
  const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

  cookies().set("session", sessionCookie, {
    maxAge: expiresIn,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

/**
 * Verifies the admin privileges from a request.
 * @returns The decoded token if the user is an admin, otherwise null.
 */
export async function verifyAdmin(auth: AdminAuth, request: NextRequest) {
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


import { NextRequest } from "next/server";
import { createSession } from "@/modules/authentication/core"; // The business logic
import { getAdminAuth } from "@/lib/firebase-admin.server"; // The specific project dependency

/**
 * API route handler for creating a user session (login).
 * This route acts as the integration layer, using the core authentication logic
 * with the project-specific Firebase Admin instance.
 */
export async function POST(req: NextRequest) {
  const { idToken } = await req.json();

  // Get the auth instance and delegate session creation to the core module.
  const adminAuth = getAdminAuth();
  return await createSession(adminAuth, idToken);
}

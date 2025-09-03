
import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin"; // The specific project dependency
import { createUser } from "@/src/modules/authentication/core"; // The business logic

/**
 * API route handler for creating a new user (signup).
 * This route acts as the integration layer, using the core authentication logic
 * with the project-specific Firebase Admin instance.
 */
export async function POST(req: NextRequest) {
  const { email, password, role } = await req.json();

  // Get the auth instance and delegate user creation to the core module.
  const adminAuth = getAdminAuth();
  return await createUser(adminAuth, email, password, role);
}

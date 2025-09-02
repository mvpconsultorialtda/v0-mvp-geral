
import { clearSession } from "@/src/modules/authentication/core"; // The business logic

/**
 * API route handler for clearing a user session (logout).
 * This route directly uses the session clearing logic from the core module.
 */
export async function POST() {
  // Delegate the session clearing to the core module.
  return clearSession();
}

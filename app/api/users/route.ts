
import { NextRequest, NextResponse } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin"; // The specific project dependency
import { verifyAdminRequest } from "@/src/modules/authentication/core"; // The business logic

/**
 * API route to list all users. Access is restricted to administrators.
 * It uses the core authentication module to verify admin privileges before proceeding.
 */
export async function GET(req: NextRequest) {
  // Get the auth instance for this request.
  const adminAuth = getAdminAuth();

  // Delegate the admin verification to the core module,
  // injecting the specific `adminAuth` dependency.
  const decodedToken = await verifyAdminRequest(adminAuth, req);

  if (!decodedToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // If verification is successful, proceed with the main logic
  try {
    const users = await adminAuth.listUsers();
    return NextResponse.json({ users: users.users });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

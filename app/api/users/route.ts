
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/firebase-admin"; // The specific project dependency
import { verifyAdminRequest } from "@/src/modules/authentication/core"; // The business logic

/**
 * API route to list all users. Access is restricted to administrators.
 * It uses the core authentication module to verify admin privileges before proceeding.
 */
export async function GET(req: NextRequest) {
  // Delegate the admin verification to the core module,
  // injecting the specific `auth` dependency.
  const decodedToken = await verifyAdminRequest(auth, req);

  if (!decodedToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // If verification is successful, proceed with the main logic
  try {
    const users = await auth.listUsers();
    return NextResponse.json({ users: users.users });
  } catch (error) {
    console.error("Error listing users:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

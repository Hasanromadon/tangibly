import { successResponse, errorResponse } from "@/lib/api-response";

// POST /api/auth/logout - Logout user (clear client-side token)
async function logoutHandler() {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // No server-side session cleanup needed since JWTs are stateless
    // Could add token blacklisting here if needed for enhanced security

    const response = successResponse(null, "Logout successful");

    // Clear auth cookie if it exists
    response.headers.set(
      "Set-Cookie",
      "auth-token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/"
    );

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error");
  }
}

// Route export
export async function POST() {
  return logoutHandler();
}

import { successResponse, errorResponse } from "@/lib/api-response";

export async function POST() {
  try {
    // For JWT-based auth, logout is handled client-side by removing the token
    // No server-side session cleanup needed since JWTs are stateless

    return successResponse(null, "Logout successful");
  } catch (error) {
    console.error("Logout error:", error);
    return errorResponse("Internal server error");
  }
}

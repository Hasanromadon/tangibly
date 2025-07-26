import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/database/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { authRateLimit } from "@/middleware/rate-limit";
import { SecurityMiddleware } from "@/middleware/security";
import { trackFailedLogin } from "@/middleware/auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await authRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Apply CSRF protection
    const csrfResult = SecurityMiddleware.csrfProtection(request);
    if (csrfResult) {
      return csrfResult;
    }

    const body = await request.json();

    // Sanitize and validate input
    const sanitizedBody = SecurityMiddleware.sanitizeInput(body);
    const validation = loginSchema.safeParse(sanitizedBody);

    if (!validation.success) {
      return validationErrorResponse(validation.error.issues);
    }

    const { email, password, remember } = validation.data;

    // Validate against SQL injection patterns
    if (!SecurityMiddleware.validateSQLInput(email)) {
      return errorResponse("Invalid input detected", 400);
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Track failed attempt even for non-existent users
      trackFailedLogin(email, request);
      return errorResponse("Invalid credentials", 401);
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      trackFailedLogin(user.id, request);
      return errorResponse("Invalid credentials", 401);
    }

    // Generate token with appropriate expiration
    const expiresIn = remember ? "30d" : "1d";
    const token = generateToken({ userId: user.id }, expiresIn);

    // Create session with security info
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const userAgent = request.headers.get("user-agent") || "unknown";

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(
          Date.now() + (remember ? 30 : 1) * 24 * 60 * 60 * 1000
        ),
        ipAddress: clientIP,
        userAgent: userAgent,
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLogin: new Date(),
      },
    });

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role: user.role,
      lastLogin: new Date(),
    };

    const response = successResponse(
      {
        user: userData,
        token,
      },
      "Login successful"
    );

    // Set secure headers
    const securityHeaders = SecurityMiddleware.getSecurityHeaders();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Set secure cookie if remember me is enabled
    if (remember) {
      response.headers.set(
        "Set-Cookie",
        `auth-token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${30 * 24 * 60 * 60}; Path=/`
      );
    }

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return errorResponse("Internal server error");
  }
}

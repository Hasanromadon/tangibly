import { NextRequest, NextResponse } from "next/server";
import { securityLogger } from "@/lib/security-logger";
import { rateLimit } from "@/middleware/rate-limit";
import { SecurityEventType } from "@/types/security";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting for error logging
    const rateLimitResult = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 30, // Allow more for error logging
    })(request);

    if (rateLimitResult) {
      return rateLimitResult;
    }

    const errorData = await request.json();

    // Validate required fields
    if (!errorData.message || !errorData.type || !errorData.timestamp) {
      return NextResponse.json(
        { error: "Missing required error fields" },
        { status: 400 }
      );
    }

    // Get client info
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const userAgent = request.headers.get("user-agent") || "unknown";

    // Enhanced error data with server-side context
    const enhancedError = {
      ...errorData,
      serverTimestamp: new Date().toISOString(),
      clientIP,
      serverUserAgent: userAgent,
      source: "frontend",
    };

    // Log to security logger with appropriate level
    const severity =
      errorData.severity === "critical"
        ? "critical"
        : errorData.severity === "high"
          ? "high"
          : errorData.severity === "medium"
            ? "medium"
            : "low";

    securityLogger.log({
      type: SecurityEventType.FRONTEND_ERROR,
      userId: errorData.userId,
      ip: clientIP,
      userAgent,
      severity: severity as "low" | "medium" | "high" | "critical",
      details: {
        errorId: enhancedError.id,
        errorType: errorData.type,
        message: errorData.message,
        stack: errorData.stack,
        component: errorData.component,
        url: errorData.url,
        context: errorData.context,
        sessionId: errorData.sessionId,
        source: "frontend",
        serverTimestamp: enhancedError.serverTimestamp,
      },
    });

    // Store in database (you can add database storage here)
    // await storeErrorInDatabase(enhancedError);

    // Send alerts for critical errors
    if (errorData.severity === "critical") {
      await handleCriticalError(enhancedError);
    }

    return NextResponse.json({
      success: true,
      errorId: enhancedError.id,
    });
  } catch (error) {
    securityLogger.log({
      type: SecurityEventType.FRONTEND_ERROR,
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      severity: "high",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        operation: "process_frontend_error",
      },
    });

    return NextResponse.json(
      { error: "Failed to process error log" },
      { status: 500 }
    );
  }
}

async function handleCriticalError(errorData: {
  id: string;
  message: string;
  component?: string;
  userId?: string;
  url: string;
  timestamp: string;
  severity: string;
  type: string;
}) {
  // Here you could:
  // - Send email notifications
  // - Trigger Slack/Discord webhooks
  // - Create incident tickets
  // - Send push notifications to admins

  console.error("🚨 CRITICAL FRONTEND ERROR:", {
    message: errorData.message,
    component: errorData.component,
    userId: errorData.userId,
    url: errorData.url,
    timestamp: errorData.timestamp,
  });
}

// GET endpoint to retrieve frontend errors (for admin dashboard)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters for filtering
    const filters = {
      limit: parseInt(searchParams.get("limit") || "50"),
      severity: searchParams.get("severity"),
      type: searchParams.get("type"),
      since: searchParams.get("since"),
    };

    // Apply rate limiting
    const rateLimitResult = rateLimit({
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 20,
    })(request);

    if (rateLimitResult) {
      return rateLimitResult;
    }

    // Here you would fetch from your database using filters
    // const errors = await fetchErrorsFromDatabase(filters);

    // For now, return mock data
    const mockErrors = [
      {
        id: "1",
        type: "javascript",
        message: "Cannot read property of undefined",
        severity: "high",
        timestamp: new Date().toISOString(),
        url: "/dashboard",
        component: "UserProfile",
      },
    ];

    return NextResponse.json({
      success: true,
      errors: mockErrors,
      total: mockErrors.length,
      filters,
    });
  } catch (error) {
    securityLogger.log({
      type: SecurityEventType.FRONTEND_ERROR,
      ip: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      severity: "medium",
      details: {
        error: error instanceof Error ? error.message : "Unknown error",
        operation: "retrieve_frontend_errors",
      },
    });

    return NextResponse.json(
      { error: "Failed to retrieve errors" },
      { status: 500 }
    );
  }
}

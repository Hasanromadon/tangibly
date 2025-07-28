import { NextRequest } from "next/server";
import { z } from "zod";
import {
  successResponse,
  errorResponse,
  validationErrorResponse,
} from "@/lib/api-response";
import { PerformanceMiddleware } from "@/middleware/performance";

// Validation schema for performance data
const performanceSchema = z.object({
  loadTime: z.number().min(0).optional(),
  domContentLoaded: z.number().min(0).optional(),
  firstPaint: z.number().min(0).optional(),
  bundleSize: z.number().min(0).optional(),
  memoryUsage: z.record(z.string(), z.unknown()).optional(),
  url: z.string().max(500),
  userAgent: z.string().max(500),
  timestamp: z.string().datetime(),
});

// Type for performance metrics
interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  bundleSize: number;
  memoryUsage?: Record<string, unknown>;
}

// Helper function to extract client IP
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0] ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Helper function to check for performance issues
function checkPerformanceIssues(metrics: PerformanceMetrics): void {
  if (metrics.loadTime > 3000) {
    console.warn("Slow page load detected:", metrics);
  }

  if (
    metrics.memoryUsage?.usedJSHeapSize &&
    typeof metrics.memoryUsage.usedJSHeapSize === "number" &&
    metrics.memoryUsage.usedJSHeapSize > 100 * 1024 * 1024
  ) {
    // 100MB
    console.warn("High memory usage detected:", metrics);
  }
}

// POST /api/monitoring/performance - Record frontend performance metrics
async function recordPerformanceHandler(request: NextRequest) {
  try {
    const timing = PerformanceMiddleware.timing();

    // Parse and validate input
    const body = await request.json();
    const validatedData = performanceSchema.parse(body);

    const {
      loadTime,
      domContentLoaded,
      firstPaint,
      bundleSize,
      memoryUsage,
      url,
      userAgent,
      timestamp,
    } = validatedData;

    // Build performance data object
    const performanceData = {
      metrics: {
        loadTime: loadTime || 0,
        domContentLoaded: domContentLoaded || 0,
        firstPaint: firstPaint || 0,
        bundleSize: bundleSize || 0,
        memoryUsage: memoryUsage || {},
      },
      context: {
        url,
        userAgent,
        ip: getClientIP(request),
        timestamp: new Date(timestamp),
        serverProcessingTime: timing.end(),
      },
    };

    // Check for performance issues
    checkPerformanceIssues(performanceData.metrics);

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // Example: send to DataDog, New Relic, etc.
      // await sendToMonitoringService(performanceData);
    }

    return successResponse(
      {
        received: true,
        processingTime: timing.end(),
      },
      "Performance data recorded"
    );
  } catch (error) {
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return validationErrorResponse(error);
    }

    // Handle generic errors
    console.error("Failed to record performance data:", error);
    return errorResponse("Failed to record performance data");
  }
}

// Route export (public endpoint for frontend performance monitoring)
export async function POST(request: NextRequest) {
  return recordPerformanceHandler(request);
}

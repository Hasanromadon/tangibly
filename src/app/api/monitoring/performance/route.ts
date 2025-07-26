import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api-response";
import { PerformanceMiddleware } from "@/middleware/performance";

export async function POST(request: NextRequest) {
  try {
    const timing = PerformanceMiddleware.timing();
    const body = await request.json();

    // Validate performance data
    const {
      loadTime,
      domContentLoaded,
      firstPaint,
      bundleSize,
      memoryUsage,
      url,
      userAgent,
      timestamp,
    } = body;

    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Store performance metrics (in production, send to analytics service)
    const performanceData = {
      metrics: {
        loadTime: Number(loadTime) || 0,
        domContentLoaded: Number(domContentLoaded) || 0,
        firstPaint: Number(firstPaint) || 0,
        bundleSize: Number(bundleSize) || 0,
        memoryUsage: memoryUsage || {},
      },
      context: {
        url: String(url).substring(0, 500),
        userAgent: String(userAgent).substring(0, 500),
        ip: clientIP,
        timestamp: new Date(timestamp),
        serverProcessingTime: timing.end(),
      },
    };

    // Log performance issues
    if (loadTime > 3000) {
      console.warn("Slow page load detected:", performanceData);
    }

    if (memoryUsage?.usedJSHeapSize > 100) {
      // 100MB
      console.warn("High memory usage detected:", performanceData);
    }

    // In production, send to monitoring service
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
    console.error("Failed to record performance data:", error);
    return errorResponse("Failed to record performance data");
  }
}

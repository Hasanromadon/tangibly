import { NextRequest } from "next/server";
import { securityLogger } from "@/lib/security-logger";
import { successResponse, errorResponse } from "@/lib/api-response";
import { middleware } from "@/lib/auth-middleware";

async function getSecurityStats(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const since = url.searchParams.get("since");
    const sinceDate = since
      ? new Date(since)
      : new Date(Date.now() - 24 * 60 * 60 * 1000);

    const stats = securityLogger.getStats(sinceDate);
    const recentEvents = securityLogger.getEvents({
      since: sinceDate,
      limit: 100,
    });

    // Additional security metrics
    const criticalEvents = recentEvents.filter(e => e.severity === "critical");
    const suspiciousIPs = new Set(
      recentEvents
        .filter(e => e.severity === "high" || e.severity === "critical")
        .map(e => e.ip)
    );

    const metrics = {
      overview: {
        totalEvents: stats.total,
        criticalEvents: criticalEvents.length,
        suspiciousIPs: suspiciousIPs.size,
        timeRange: {
          start: sinceDate.toISOString(),
          end: new Date().toISOString(),
        },
      },
      eventsByType: stats.byType,
      eventsBySeverity: stats.bySeverity,
      eventsByHour: stats.byHour,
      recentCriticalEvents: criticalEvents.slice(0, 10),
      topSuspiciousIPs: Array.from(suspiciousIPs).slice(0, 10),
    };

    return successResponse(metrics, "Security statistics retrieved");
  } catch (error) {
    console.error("Failed to get security stats:", error);
    return errorResponse("Failed to retrieve security statistics");
  }
}

export const GET = middleware.system.monitoring(getSecurityStats);

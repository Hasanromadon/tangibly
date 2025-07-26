import { successResponse, errorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/database/prisma";
import { PerformanceMiddleware } from "@/middleware/performance";
import os from "os";

export async function GET() {
  const timing = PerformanceMiddleware.timing();

  try {
    const checks = await Promise.all([
      // Database health check
      checkDatabase(),

      // Memory usage check
      checkMemoryUsage(),

      // System health check
      checkSystemHealth(),
    ]);

    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || "1.0.0",
      checks: {
        database: checks[0],
        memory: checks[1],
        system: checks[2],
      },
      performance: {
        responseTime: timing.end(),
      },
    };

    // Determine overall health status
    const allHealthy = checks.every(check => check.status === "healthy");
    if (!allHealthy) {
      health.status = "degraded";
    }

    const responseStatus = allHealthy ? 200 : 503;

    return successResponse(health, "Health check completed", responseStatus);
  } catch (error) {
    console.error("Health check failed:", error);

    const health = {
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
      performance: {
        responseTime: timing.end(),
      },
    };

    return errorResponse("Health check failed", 503, health);
  }
}

async function checkDatabase() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const responseTime = Date.now() - start;

    return {
      status: "healthy",
      responseTime,
      message: "Database connection successful",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error:
        error instanceof Error ? error.message : "Database connection failed",
    };
  }
}

function checkMemoryUsage() {
  const usage = process.memoryUsage();
  const usedMB = Math.round(usage.heapUsed / 1024 / 1024);
  const totalMB = Math.round(usage.heapTotal / 1024 / 1024);
  const percentage = Math.round((usage.heapUsed / usage.heapTotal) * 100);

  const status =
    percentage > 90 ? "unhealthy" : percentage > 70 ? "degraded" : "healthy";

  return {
    status,
    usedMB,
    totalMB,
    percentage,
    rss: Math.round(usage.rss / 1024 / 1024),
    external: Math.round(usage.external / 1024 / 1024),
  };
}

function checkSystemHealth() {
  const loadAverage = process.platform !== "win32" ? os.loadavg() : [0, 0, 0];
  const cpuCount = os.cpus().length;
  const freeMemory = os.freemem();
  const totalMemory = os.totalmem();

  const memoryUsagePercent = Math.round(
    ((totalMemory - freeMemory) / totalMemory) * 100
  );
  const avgLoad = loadAverage[0] / cpuCount;

  let status = "healthy";
  if (memoryUsagePercent > 90 || avgLoad > 0.8) {
    status = "unhealthy";
  } else if (memoryUsagePercent > 70 || avgLoad > 0.6) {
    status = "degraded";
  }

  return {
    status,
    loadAverage: loadAverage.map(
      (load: number) => Math.round(load * 100) / 100
    ),
    cpuCount,
    memoryUsage: {
      free: Math.round(freeMemory / 1024 / 1024),
      total: Math.round(totalMemory / 1024 / 1024),
      percentage: memoryUsagePercent,
    },
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
  };
}

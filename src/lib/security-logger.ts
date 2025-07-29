import { SecurityEvent, SecurityEventType } from "@/types/security";

class SecurityLogger {
  private static instance: SecurityLogger;
  private events: SecurityEvent[] = [];
  private maxEvents = 10000; // Keep last 10k events in memory

  static getInstance(): SecurityLogger {
    if (!SecurityLogger.instance) {
      SecurityLogger.instance = new SecurityLogger();
    }
    return SecurityLogger.instance;
  }

  log(event: Omit<SecurityEvent, "timestamp">): void {
    const fullEvent: SecurityEvent = {
      ...event,
      timestamp: new Date(),
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Console log for development
    if (process.env.NODE_ENV === "development") {
      console.warn(`[SECURITY] ${event.type}:`, event);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToMonitoring(fullEvent);
    }

    // Alert on critical events
    if (event.severity === "critical") {
      this.sendAlert(fullEvent);
    }
  }

  private async sendToMonitoring(event: SecurityEvent): Promise<void> {
    try {
      // In production, send to external monitoring service
      // Example: Sentry, DataDog, etc.
      const response = await fetch("/api/monitoring/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        console.error("Failed to send security event to monitoring");
      }
    } catch (error) {
      console.error("Error sending security event:", error);
    }
  }

  private async sendAlert(event: SecurityEvent): Promise<void> {
    try {
      // Send immediate alert for critical events
      // Could be Slack, email, SMS, etc.
      await fetch("/api/alerts/security", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          message: `CRITICAL SECURITY EVENT: ${event.type}`,
          urgency: "high",
        }),
      });
    } catch (error) {
      console.error("Failed to send security alert:", error);
    }
  }

  getEvents(
    options: {
      type?: SecurityEventType;
      userId?: string;
      severity?: string;
      since?: Date;
      limit?: number;
    } = {}
  ): SecurityEvent[] {
    let filtered = this.events;

    if (options.type) {
      filtered = filtered.filter(e => e.type === options.type);
    }

    if (options.userId) {
      filtered = filtered.filter(e => e.userId === options.userId);
    }

    if (options.severity) {
      filtered = filtered.filter(e => e.severity === options.severity);
    }

    if (options.since) {
      filtered = filtered.filter(e => e.timestamp >= options.since!);
    }

    if (options.limit) {
      filtered = filtered.slice(-options.limit);
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  getStats(since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
    byHour: Record<string, number>;
  } {
    const events = this.getEvents({ since });

    const stats = {
      total: events.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byHour: {} as Record<string, number>,
    };

    events.forEach(event => {
      // By type
      stats.byType[event.type] = (stats.byType[event.type] || 0) + 1;

      // By severity
      stats.bySeverity[event.severity] =
        (stats.bySeverity[event.severity] || 0) + 1;

      // By hour
      const hour = event.timestamp.getHours().toString().padStart(2, "0");
      stats.byHour[hour] = (stats.byHour[hour] || 0) + 1;
    });

    return stats;
  }

  // Helper methods for common security events
  logFailedLogin(
    userId: string,
    ip: string,
    userAgent: string,
    details: Record<string, unknown> = {}
  ): void {
    this.log({
      type: SecurityEventType.FAILED_LOGIN,
      userId,
      ip,
      userAgent,
      details,
      severity: "medium",
    });
  }

  logSuccessfulLogin(userId: string, ip: string, userAgent: string): void {
    this.log({
      type: SecurityEventType.SUCCESSFUL_LOGIN,
      userId,
      ip,
      userAgent,
      details: {},
      severity: "low",
    });
  }

  logRateLimitExceeded(ip: string, userAgent: string, endpoint: string): void {
    this.log({
      type: SecurityEventType.RATE_LIMIT_EXCEEDED,
      ip,
      userAgent,
      details: { endpoint },
      severity: "medium",
    });
  }

  logSuspiciousActivity(
    ip: string,
    userAgent: string,
    activity: string,
    details: Record<string, unknown> = {}
  ): void {
    this.log({
      type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      ip,
      userAgent,
      details: { activity, ...details },
      severity: "high",
    });
  }

  logUnauthorizedAccess(ip: string, userAgent: string, resource: string): void {
    this.log({
      type: SecurityEventType.UNAUTHORIZED_ACCESS,
      ip,
      userAgent,
      details: { resource },
      severity: "high",
    });
  }

  logCSRFAttempt(
    ip: string,
    userAgent: string,
    details: Record<string, unknown> = {}
  ): void {
    this.log({
      type: SecurityEventType.CSRF_ATTEMPT,
      ip,
      userAgent,
      details,
      severity: "critical",
    });
  }

  logSQLInjectionAttempt(ip: string, userAgent: string, input: string): void {
    this.log({
      type: SecurityEventType.SQL_INJECTION_ATTEMPT,
      ip,
      userAgent,
      details: { input: input.substring(0, 500) }, // Truncate for storage
      severity: "critical",
    });
  }

  logXSSAttempt(ip: string, userAgent: string, input: string): void {
    this.log({
      type: SecurityEventType.XSS_ATTEMPT,
      ip,
      userAgent,
      details: { input: input.substring(0, 500) },
      severity: "critical",
    });
  }
}

export const securityLogger = SecurityLogger.getInstance();

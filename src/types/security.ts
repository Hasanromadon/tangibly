// Security event types for logging
export enum SecurityEventType {
  FAILED_LOGIN = "FAILED_LOGIN",
  SUCCESSFUL_LOGIN = "SUCCESSFUL_LOGIN",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
  SUSPICIOUS_ACTIVITY = "SUSPICIOUS_ACTIVITY",
  UNAUTHORIZED_ACCESS = "UNAUTHORIZED_ACCESS",
  CSRF_ATTEMPT = "CSRF_ATTEMPT",
  SQL_INJECTION_ATTEMPT = "SQL_INJECTION_ATTEMPT",
  XSS_ATTEMPT = "XSS_ATTEMPT",
  FILE_UPLOAD_VIOLATION = "FILE_UPLOAD_VIOLATION",
  PASSWORD_POLICY_VIOLATION = "PASSWORD_POLICY_VIOLATION",
  FRONTEND_ERROR = "FRONTEND_ERROR",
}

// Security logger interface
export interface SecurityEvent {
  type: SecurityEventType;
  userId?: string;
  ip: string;
  userAgent: string;
  details: Record<string, unknown>;
  timestamp: Date;
  severity: "low" | "medium" | "high" | "critical";
}

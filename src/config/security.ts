export const SECURITY_CONFIG = {
  // Rate limiting configuration
  RATE_LIMITS: {
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
      blockDuration: 30 * 60 * 1000, // 30 minutes
    },
    API: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 60,
    },
    STRICT: {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 10,
    },
  },

  // Password requirements
  PASSWORD: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    preventUserInfo: true,
  },

  // Session configuration
  SESSION: {
    cookieName: "auth-token",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    rememberMeMaxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "strict" as const,
  },

  // CORS configuration
  CORS: {
    allowedOrigins: [
      "http://localhost:3000",
      "https://localhost:3000",
      process.env.NEXTAUTH_URL || "",
    ].filter(Boolean),
    allowedMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-CSRF-Token",
    ],
    maxAge: 86400, // 24 hours
  },

  // Content Security Policy
  CSP: {
    directives: {
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "https:"],
      "font-src": ["'self'", "data:"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'none'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
    },
  },

  // File upload restrictions
  FILE_UPLOAD: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
    ],
    allowedExtensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".webp",
      ".pdf",
      ".txt",
    ],
  },

  // Input validation
  VALIDATION: {
    maxStringLength: 10000,
    maxArrayLength: 100,
    maxEmailLength: 254,
    maxNameLength: 100,
    maxUrlLength: 2048,
  },

  // Security headers
  HEADERS: {
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "X-XSS-Protection": "1; mode=block",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-DNS-Prefetch-Control": "on",
  },

  // Monitoring and alerting
  MONITORING: {
    logSecurityEvents: true,
    alertOnFailedAttempts: 5,
    alertOnSuspiciousActivity: true,
    enableMetrics: true,
  },

  // API versioning
  API: {
    currentVersion: "v1",
    supportedVersions: ["v1"],
    deprecationNotice: false,
  },

  // Database security
  DATABASE: {
    connectionTimeout: 10000, // 10 seconds
    queryTimeout: 30000, // 30 seconds
    maxConnections: 100,
    ssl: process.env.NODE_ENV === "production",
  },
};

// Environment-specific overrides
export const getSecurityConfig = () => {
  const baseConfig = SECURITY_CONFIG;

  if (process.env.NODE_ENV === "production") {
    // Production-specific security enhancements
    return {
      ...baseConfig,
      PASSWORD: {
        ...baseConfig.PASSWORD,
        minLength: 12,
      },
      RATE_LIMITS: {
        ...baseConfig.RATE_LIMITS,
        AUTH: {
          ...baseConfig.RATE_LIMITS.AUTH,
          maxRequests: 3,
        },
      },
      SESSION: {
        ...baseConfig.SESSION,
        secure: true,
      },
      CSP: {
        directives: {
          ...baseConfig.CSP.directives,
          "script-src": ["'self'"],
          "style-src": ["'self'"],
        },
      },
    };
  }

  if (process.env.NODE_ENV === "development") {
    // Development-specific relaxations
    return {
      ...baseConfig,
      CORS: {
        ...baseConfig.CORS,
        allowedOrigins: [
          ...baseConfig.CORS.allowedOrigins,
          "http://localhost:3001",
        ],
      },
    };
  }

  return baseConfig;
};

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

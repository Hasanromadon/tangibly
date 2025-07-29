/**
 * API Configuration Constants
 * Centralized API-related configuration values
 */

// API Base Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || "/api",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Authentication Configuration
export const AUTH_CONFIG = {
  JWT_SECRET: process.env.JWT_SECRET || "your-secret-key",
  SALT_ROUNDS: 12,
  TOKEN_EXPIRY: "7d",
  REFRESH_TOKEN_EXPIRY: "30d",
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

// Rate Limiting Configuration
export const RATE_LIMIT_CONFIG = {
  DEFAULT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 60,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  API: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 100,
  },
  STRICT: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 10,
  },
} as const;

// Security Configuration
export const SECURITY_CONFIG = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  ALLOWED_ORIGINS: [
    process.env.NEXTAUTH_URL || "http://localhost:3000",
    "http://localhost:3000",
    "https://localhost:3000",
  ],
} as const;

// Database Configuration
export const DATABASE_CONFIG = {
  CONNECTION_TIMEOUT: 10000, // 10 seconds
  QUERY_TIMEOUT: 30000, // 30 seconds
  MAX_CONNECTIONS: 10,
  RETRY_ATTEMPTS: 3,
} as const;

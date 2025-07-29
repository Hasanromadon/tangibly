// Re-export all constants for easy importing
export * from "./config";
export * from "./business";

// Legacy exports (keeping for backward compatibility)
export const API_ENDPOINTS = {
  USERS: "/api/users",
  AUTH: {
    LOGIN: "/api/auth/login",
    LOGOUT: "/api/auth/logout",
    REGISTER: "/api/auth/register",
    REFRESH: "/api/auth/refresh",
  },
} as const;

export const APP_ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  LOGIN: "/login",
  REGISTER: "/register",
} as const;

export const QUERY_KEYS = {
  USERS: ["users"],
  USER: (id: string) => ["user", id],
  POSTS: ["posts"],
  POST: (id: string) => ["post", id],
} as const;

// Form validation length limits (moved to business.ts but kept here for compatibility)
export const VALIDATION_LIMITS = {
  COMPANY: {
    NAME_MIN: 3,
    NAME_MAX: 100,
    ADDRESS_MIN: 10,
    ADDRESS_MAX: 500,
    PHONE_MAX: 20,
    EMAIL_MAX: 255,
    NPWP_MAX: 20,
  },
  USER: {
    FIRST_NAME_MIN: 2,
    FIRST_NAME_MAX: 50,
    LAST_NAME_MIN: 2,
    LAST_NAME_MAX: 50,
    EMAIL_MAX: 255,
    PASSWORD_MIN: 8,
    PASSWORD_MAX: 128,
  },
} as const;

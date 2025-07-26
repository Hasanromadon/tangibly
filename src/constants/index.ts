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

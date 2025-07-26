// Re-export all common types and entities for easy importing
export * from "./common";
export * from "./entities";

// Legacy exports for backward compatibility (will be deprecated)
export type {
  User,
  Company,
  AuthResponse,
  LoginCredentials,
  RegisterData,
} from "./entities";
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  QueryOptions,
} from "./common";

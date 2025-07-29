/**
 * Business Logic Constants
 * Constants related to business operations and asset management
 */

// Asset Management
export const ASSET_CONFIG = {
  NUMBER_GENERATION: {
    CATEGORY_CODE_LENGTH: 3,
    YEAR_DIGITS: 4,
    RANDOM_DIGITS: 4,
    MIN_RANDOM: 1000,
    MAX_RANDOM: 9999,
  },
  DEPRECIATION: {
    METHODS: [
      "straight_line",
      "declining_balance",
      "units_of_production",
    ] as const,
    DEFAULT_METHOD: "straight_line" as const,
    DECLINING_BALANCE_RATE: 2,
  },
  STATUS: {
    ACTIVE: "ACTIVE",
    INACTIVE: "INACTIVE",
    MAINTENANCE: "MAINTENANCE",
    DISPOSED: "DISPOSED",
  } as const,
  CONDITION: {
    EXCELLENT: "EXCELLENT",
    GOOD: "GOOD",
    FAIR: "FAIR",
    POOR: "POOR",
  } as const,
} as const;

// Work Order Configuration
export const WORK_ORDER_CONFIG = {
  NUMBER_PREFIX: "WO",
  STATUS: {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  } as const,
  PRIORITY: {
    LOW: "LOW",
    MEDIUM: "MEDIUM",
    HIGH: "HIGH",
    URGENT: "URGENT",
  } as const,
} as const;

// File Upload Configuration
export const FILE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
    DOCUMENTS: ["application/pdf", "text/plain"],
    ALL: [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/pdf",
      "text/plain",
    ],
  } as const,
  UPLOAD_PATHS: {
    AVATARS: "/uploads/avatars",
    ASSETS: "/uploads/assets",
    DOCUMENTS: "/uploads/documents",
  } as const,
} as const;

// Pagination Configuration
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
  MAX_PAGE: 1000,
} as const;

// Date and Time Configuration
export const DATE_CONFIG = {
  DEFAULT_LOCALE: "id-ID",
  DEFAULT_TIMEZONE: "Asia/Jakarta",
  FORMAT_OPTIONS: {
    SHORT: { dateStyle: "short" } as const,
    MEDIUM: { dateStyle: "medium" } as const,
    LONG: { dateStyle: "long" } as const,
    FULL: { dateStyle: "full" } as const,
    WITH_TIME: { dateStyle: "medium", timeStyle: "short" } as const,
  },
} as const;

// Currency Configuration
export const CURRENCY_CONFIG = {
  DEFAULT_CURRENCY: "IDR",
  DEFAULT_LOCALE: "id-ID",
  MINIMUM_FRACTION_DIGITS: 0,
  MAXIMUM_FRACTION_DIGITS: 0,
  SUPPORTED_CURRENCIES: ["IDR", "USD", "EUR"] as const,
} as const;

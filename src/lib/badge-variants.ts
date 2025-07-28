/**
 * Global Badge Utilities
 * Centralized badge variant functions to eliminate redundancy across components
 */

import { type BadgeProps } from "@/components/ui/badge";

/**
 * Asset status badge variants with consistent color mapping
 */
export function getAssetStatusBadgeVariant(
  status: string | undefined | null
): BadgeProps["variant"] {
  if (!status) return "secondary";

  const normalizedStatus = status.toLowerCase().trim();

  switch (normalizedStatus) {
    case "active":
    case "in_use":
    case "operational":
      return "default"; // Blue/primary color
    case "maintenance":
    case "under_maintenance":
    case "servicing":
      return "destructive"; // Red color
    case "retired":
    case "disposed":
    case "sold":
      return "secondary"; // Gray color
    case "available":
    case "ready":
    case "idle":
      return "outline"; // Outlined style
    default:
      return "secondary";
  }
}

/**
 * Asset condition badge variants with health-based color mapping
 */
export function getAssetConditionBadgeVariant(
  condition: string | undefined | null
): BadgeProps["variant"] {
  if (!condition) return "secondary";

  const normalizedCondition = condition.toLowerCase().trim();

  switch (normalizedCondition) {
    case "excellent":
    case "very_good":
    case "new":
      return "default"; // Green/success color
    case "good":
    case "fair":
    case "satisfactory":
      return "outline"; // Blue/info color
    case "poor":
    case "needs_repair":
    case "damaged":
      return "destructive"; // Red/danger color
    case "unknown":
    case "not_assessed":
      return "secondary"; // Gray color
    default:
      return "secondary";
  }
}

/**
 * Generic status badge variants for various entity statuses
 */
export function getStatusBadgeVariant(
  status: string | undefined | null,
  type: "success" | "warning" | "error" | "info" | "neutral" = "neutral"
): BadgeProps["variant"] {
  if (!status) return "secondary";

  // Allow direct variant override via type
  switch (type) {
    case "success":
      return "default";
    case "warning":
      return "outline";
    case "error":
      return "destructive";
    case "info":
      return "outline";
    case "neutral":
    default:
      return "secondary";
  }
}

/**
 * Priority level badge variants
 */
export function getPriorityBadgeVariant(
  priority: string | number | undefined | null
): BadgeProps["variant"] {
  if (!priority) return "secondary";

  const normalizedPriority =
    typeof priority === "number"
      ? priority.toString()
      : priority.toLowerCase().trim();

  switch (normalizedPriority) {
    case "high":
    case "urgent":
    case "critical":
    case "1":
      return "destructive"; // Red for high priority
    case "medium":
    case "normal":
    case "2":
      return "outline"; // Blue for medium priority
    case "low":
    case "3":
      return "default"; // Green for low priority
    default:
      return "secondary";
  }
}

/**
 * User role badge variants
 */
export function getRoleBadgeVariant(
  role: string | undefined | null
): BadgeProps["variant"] {
  if (!role) return "secondary";

  const normalizedRole = role.toLowerCase().trim();

  switch (normalizedRole) {
    case "admin":
    case "administrator":
    case "super_admin":
      return "destructive"; // Red for admin roles
    case "manager":
    case "supervisor":
    case "lead":
      return "default"; // Blue for management roles
    case "user":
    case "employee":
    case "staff":
      return "outline"; // Outlined for regular users
    case "guest":
    case "viewer":
    case "readonly":
      return "secondary"; // Gray for limited access
    default:
      return "secondary";
  }
}

/**
 * Document or verification status badge variants
 */
export function getVerificationBadgeVariant(
  verified: boolean | string | undefined | null
): BadgeProps["variant"] {
  if (verified === null || verified === undefined) return "secondary";

  if (typeof verified === "boolean") {
    return verified ? "default" : "destructive";
  }

  const normalizedStatus = verified.toLowerCase().trim();

  switch (normalizedStatus) {
    case "verified":
    case "approved":
    case "confirmed":
    case "valid":
    case "true":
      return "default"; // Green for verified
    case "pending":
    case "under_review":
    case "processing":
      return "outline"; // Blue for pending
    case "rejected":
    case "invalid":
    case "expired":
    case "false":
      return "destructive"; // Red for rejected/invalid
    default:
      return "secondary";
  }
}

/**
 * Payment or transaction status badge variants
 */
export function getPaymentStatusBadgeVariant(
  status: string | undefined | null
): BadgeProps["variant"] {
  if (!status) return "secondary";

  const normalizedStatus = status.toLowerCase().trim();

  switch (normalizedStatus) {
    case "paid":
    case "completed":
    case "success":
    case "settled":
      return "default"; // Green for successful payments
    case "pending":
    case "processing":
    case "waiting":
      return "outline"; // Blue for pending payments
    case "failed":
    case "rejected":
    case "cancelled":
    case "refunded":
      return "destructive"; // Red for failed/cancelled
    case "partial":
    case "partial_payment":
      return "outline"; // Blue for partial payments
    default:
      return "secondary";
  }
}

/**
 * Inventory or stock level badge variants
 */
export function getStockLevelBadgeVariant(
  quantity: number | undefined | null,
  thresholds: {
    low?: number;
    medium?: number;
  } = {}
): BadgeProps["variant"] {
  if (quantity === null || quantity === undefined || quantity < 0) {
    return "secondary";
  }

  const { low = 10, medium = 50 } = thresholds;

  if (quantity === 0) {
    return "destructive"; // Red for out of stock
  } else if (quantity <= low) {
    return "destructive"; // Red for low stock
  } else if (quantity <= medium) {
    return "outline"; // Blue for medium stock
  } else {
    return "default"; // Green for good stock
  }
}

/**
 * Temperature or health indicator badge variants
 */
export function getHealthBadgeVariant(
  value: number | undefined | null,
  thresholds: {
    good?: { min: number; max: number };
    warning?: { min: number; max: number };
  } = {}
): BadgeProps["variant"] {
  if (value === null || value === undefined) return "secondary";

  const { good = { min: 0, max: 80 }, warning = { min: 81, max: 95 } } =
    thresholds;

  if (value >= good.min && value <= good.max) {
    return "default"; // Green for good health
  } else if (value >= warning.min && value <= warning.max) {
    return "outline"; // Blue for warning
  } else {
    return "destructive"; // Red for critical
  }
}

/**
 * Age-based badge variants (e.g., for equipment age)
 */
export function getAgeBadgeVariant(
  ageInMonths: number | undefined | null,
  thresholds: {
    new?: number; // months
    mature?: number; // months
  } = {}
): BadgeProps["variant"] {
  if (ageInMonths === null || ageInMonths === undefined || ageInMonths < 0) {
    return "secondary";
  }

  const { new: newThreshold = 12, mature: matureThreshold = 60 } = thresholds;

  if (ageInMonths <= newThreshold) {
    return "default"; // Green for new items
  } else if (ageInMonths <= matureThreshold) {
    return "outline"; // Blue for mature items
  } else {
    return "destructive"; // Red for old items
  }
}

/**
 * Generic mapping function for custom badge logic
 */
export function getMappedBadgeVariant<T>(
  value: T,
  mapping: Record<string, BadgeProps["variant"]>,
  defaultVariant: BadgeProps["variant"] = "secondary"
): BadgeProps["variant"] {
  if (!value) return defaultVariant;

  const key = String(value).toLowerCase().trim();
  return mapping[key] || defaultVariant;
}

/**
 * Badge variant utilities for different contexts
 */
export const badgeVariants = {
  // Asset-specific variants
  assetStatus: getAssetStatusBadgeVariant,
  assetCondition: getAssetConditionBadgeVariant,

  // Generic status variants
  status: getStatusBadgeVariant,
  priority: getPriorityBadgeVariant,
  role: getRoleBadgeVariant,
  verification: getVerificationBadgeVariant,
  payment: getPaymentStatusBadgeVariant,

  // Quantity/level variants
  stockLevel: getStockLevelBadgeVariant,
  health: getHealthBadgeVariant,
  age: getAgeBadgeVariant,

  // Custom mapping
  mapped: getMappedBadgeVariant,
};

/**
 * Pre-defined badge mappings for common use cases
 */
export const badgeMappings = {
  // Boolean status mapping
  boolean: {
    true: "default" as const,
    false: "destructive" as const,
    yes: "default" as const,
    no: "destructive" as const,
    active: "default" as const,
    inactive: "secondary" as const,
    enabled: "default" as const,
    disabled: "secondary" as const,
  },

  // Severity levels
  severity: {
    low: "default" as const,
    medium: "outline" as const,
    high: "destructive" as const,
    critical: "destructive" as const,
  },

  // Progress states
  progress: {
    not_started: "secondary" as const,
    in_progress: "outline" as const,
    completed: "default" as const,
    cancelled: "destructive" as const,
    on_hold: "secondary" as const,
  },

  // Approval workflow
  approval: {
    draft: "secondary" as const,
    submitted: "outline" as const,
    approved: "default" as const,
    rejected: "destructive" as const,
    revision_needed: "outline" as const,
  },
};

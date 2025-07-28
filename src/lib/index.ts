/**
 * Central Utility Exports
 * Re-exports all utility functions from their respective modules for easy importing
 */

// Formatting utilities
export {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatPhoneNumber,
  formatNPWP,
  dateFormatters,
  textFormatters,
  assetFormatters,
  validationHelpers,
  parsers,
} from "./formatters";

// Badge variant utilities
export {
  getAssetStatusBadgeVariant,
  getAssetConditionBadgeVariant,
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
  getRoleBadgeVariant,
  getVerificationBadgeVariant,
  getPaymentStatusBadgeVariant,
  getStockLevelBadgeVariant,
  getHealthBadgeVariant,
  getAgeBadgeVariant,
  getMappedBadgeVariant,
  badgeVariants,
  badgeMappings,
} from "./badge-variants";

// Re-export types for easier importing
export type { BadgeProps } from "@/components/ui/badge";

/**
 * Commonly used utility combinations
 */
import {
  formatCurrency as fc,
  formatDate as fd,
  dateFormatters as df,
  formatPhoneNumber as fpn,
  formatNPWP as fnpwp,
  validationHelpers as vh,
  parsers as p,
} from "./formatters";

import {
  getAssetStatusBadgeVariant as gasb,
  getAssetConditionBadgeVariant as gacb,
  getStatusBadgeVariant as gsb,
  getPriorityBadgeVariant as gpb,
  getRoleBadgeVariant as grb,
  getMappedBadgeVariant as gmb,
  badgeMappings as bm,
} from "./badge-variants";

export const commonFormatters = {
  // Currency with default Indonesian settings
  currency: (amount: number | undefined | null) => fc(amount),

  // Date with default Indonesian settings
  date: (date: Date | string | undefined | null) => fd(date),

  // Standard date display
  standardDate: df.standard,

  // Date with time
  dateTime: df.withTime,

  // Phone number with Indonesian format
  phone: (phone: string | undefined | null) => fpn(phone),

  // NPWP with standard format
  npwp: (npwp: string | undefined | null) => fnpwp(npwp),
};

export const commonBadges = {
  // Asset status with standard mapping
  assetStatus: gasb,

  // Asset condition with standard mapping
  assetCondition: gacb,

  // Generic status with type override
  status: gsb,

  // Priority level
  priority: gpb,

  // User role
  role: grb,

  // Boolean status
  boolean: (value: boolean | string | undefined | null) =>
    gmb(value, bm.boolean),
};

/**
 * Validation utilities
 */
export const validators = {
  currency: vh.isValidCurrency,
  date: vh.isValidDate,
  phone: vh.isValidPhone,
  npwp: vh.isValidNPWP,
};

/**
 * Parser utilities
 */
export const parseFormatted = {
  currency: p.currency,
  percentage: p.percentage,
  phone: p.phone,
  npwp: p.npwp,
};

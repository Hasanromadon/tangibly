/**
 * Global Formatting Utilities
 * Centralized formatting functions to eliminate redundancy across the application
 */

/**
 * Currency formatting with configurable locale and currency
 */
export function formatCurrency(
  amount: number | undefined | null,
  options: {
    currency?: string;
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    showCurrencySymbol?: boolean;
  } = {}
): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return "-";
  }

  const {
    currency = "IDR",
    locale = "id-ID",
    minimumFractionDigits = 0,
    maximumFractionDigits = 0,
    showCurrencySymbol = true,
  } = options;

  const formatter = new Intl.NumberFormat(locale, {
    style: showCurrencySymbol ? "currency" : "decimal",
    currency: showCurrencySymbol ? currency : undefined,
    minimumFractionDigits,
    maximumFractionDigits,
  });

  return formatter.format(amount);
}

/**
 * Date formatting with configurable locale and format options
 */
export function formatDate(
  date: Date | string | undefined | null,
  options: {
    locale?: string;
    dateStyle?: "short" | "medium" | "long" | "full";
    timeStyle?: "short" | "medium" | "long" | "full";
    includeTime?: boolean;
    customFormat?: Intl.DateTimeFormatOptions;
  } = {}
): string {
  if (!date) return "-";

  const {
    locale = "id-ID",
    dateStyle = "medium",
    timeStyle = "short",
    includeTime = false,
    customFormat,
  } = options;

  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "-";
  }

  // Use custom format if provided
  if (customFormat) {
    return new Intl.DateTimeFormat(locale, customFormat).format(dateObj);
  }

  // Use preset styles
  const formatOptions: Intl.DateTimeFormatOptions = {
    dateStyle: includeTime ? undefined : dateStyle,
  };

  if (includeTime) {
    formatOptions.dateStyle = dateStyle;
    formatOptions.timeStyle = timeStyle;
  }

  return new Intl.DateTimeFormat(locale, formatOptions).format(dateObj);
}

/**
 * Specific date formatters for common use cases
 */
export const dateFormatters = {
  // Standard date display (e.g., "15 Januari 2024")
  standard: (date: Date | string | undefined | null) =>
    formatDate(date, {
      customFormat: {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    }),

  // Short date display (e.g., "15/01/24")
  short: (date: Date | string | undefined | null) =>
    formatDate(date, {
      customFormat: {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      },
    }),

  // Date with time (e.g., "15 Januari 2024, 14:30")
  withTime: (date: Date | string | undefined | null) =>
    formatDate(date, {
      customFormat: {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      },
    }),

  // Relative time (e.g., "2 days ago", "in 3 hours")
  relative: (date: Date | string | undefined | null, locale = "id-ID") => {
    if (!date) return "-";

    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "-";

    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    const diff = dateObj.getTime() - Date.now();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));

    if (Math.abs(days) < 1) {
      const hours = Math.round(diff / (1000 * 60 * 60));
      if (Math.abs(hours) < 1) {
        const minutes = Math.round(diff / (1000 * 60));
        return rtf.format(minutes, "minute");
      }
      return rtf.format(hours, "hour");
    }

    return rtf.format(days, "day");
  },
};

/**
 * Number formatting utilities
 */
export function formatNumber(
  value: number | undefined | null,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    notation?: "standard" | "scientific" | "engineering" | "compact";
    signDisplay?: "auto" | "never" | "always" | "exceptZero";
  } = {}
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "-";
  }

  const {
    locale = "id-ID",
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = "standard",
    signDisplay = "auto",
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    notation,
    signDisplay,
  }).format(value);
}

/**
 * Percentage formatting
 */
export function formatPercentage(
  value: number | undefined | null,
  options: {
    locale?: string;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  if (value === undefined || value === null || isNaN(value)) {
    return "-";
  }

  const {
    locale = "id-ID",
    minimumFractionDigits = 0,
    maximumFractionDigits = 1,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
}

/**
 * File size formatting
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Phone number formatting for Indonesian numbers
 */
export function formatPhoneNumber(
  phone: string | undefined | null,
  options: {
    countryCode?: string;
    format?: "national" | "international";
  } = {}
): string {
  if (!phone) return "-";

  const { countryCode = "+62", format = "national" } = options;

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, "");

  // Handle Indonesian numbers
  if (digits.startsWith("62")) {
    const withoutCountryCode = digits.substring(2);
    if (format === "international") {
      return `${countryCode} ${withoutCountryCode.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}`;
    }
    return `0${withoutCountryCode.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}`;
  }

  // Handle local numbers starting with 0
  if (digits.startsWith("0")) {
    const withoutZero = digits.substring(1);
    if (format === "international") {
      return `${countryCode} ${withoutZero.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")}`;
    }
    return digits.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3");
  }

  return phone;
}

/**
 * NPWP formatting for Indonesian tax numbers
 */
export function formatNPWP(npwp: string | undefined | null): string {
  if (!npwp) return "-";

  const digits = npwp.replace(/\D/g, "");

  if (digits.length === 15) {
    return digits.replace(
      /(\d{2})(\d{3})(\d{3})(\d{1})(\d{3})(\d{3})/,
      "$1.$2.$3.$4-$5.$6"
    );
  }

  return npwp;
}

/**
 * Text formatting utilities
 */
export const textFormatters = {
  // Capitalize first letter of each word
  title: (text: string | undefined | null): string => {
    if (!text) return "-";
    return text.replace(
      /\w\S*/g,
      txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Capitalize first letter only
  sentence: (text: string | undefined | null): string => {
    if (!text) return "-";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },

  // Convert to kebab-case
  kebab: (text: string | undefined | null): string => {
    if (!text) return "";
    return text
      .replace(/([a-z])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  },

  // Convert to camelCase
  camel: (text: string | undefined | null): string => {
    if (!text) return "";
    return text
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, "");
  },

  // Truncate text with ellipsis
  truncate: (
    text: string | undefined | null,
    maxLength: number = 50
  ): string => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  },

  // Mask sensitive information (e.g., credit card, phone)
  mask: (
    text: string | undefined | null,
    showLast: number = 4,
    maskChar: string = "*"
  ): string => {
    if (!text) return "-";
    if (text.length <= showLast) return text;

    const masked = maskChar.repeat(text.length - showLast);
    const visible = text.slice(-showLast);
    return masked + visible;
  },
};

/**
 * Asset-specific formatting utilities
 */
export const assetFormatters = {
  // Format asset number with prefix
  assetNumber: (
    number: string | undefined | null,
    prefix: string = "AST"
  ): string => {
    if (!number) return "-";
    return number.startsWith(prefix) ? number : `${prefix}-${number}`;
  },

  // Format warranty status
  warrantyStatus: (
    expiryDate: string | Date | undefined | null
  ): {
    status: "active" | "expiring" | "expired";
    message: string;
    daysRemaining?: number;
  } => {
    if (!expiryDate) {
      return { status: "expired", message: "No warranty data" };
    }

    const expiry =
      typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return { status: "expired", message: "Warranty expired" };
    } else if (daysRemaining <= 30) {
      return {
        status: "expiring",
        message: `Expiring in ${daysRemaining} days`,
        daysRemaining,
      };
    } else {
      return {
        status: "active",
        message: `${daysRemaining} days remaining`,
        daysRemaining,
      };
    }
  },

  // Format depreciation display
  depreciation: (
    purchaseCost: number,
    currentValue: number
  ): {
    depreciationAmount: number;
    depreciationPercentage: number;
    formattedAmount: string;
    formattedPercentage: string;
  } => {
    const depreciationAmount = purchaseCost - currentValue;
    const depreciationPercentage = (depreciationAmount / purchaseCost) * 100;

    return {
      depreciationAmount,
      depreciationPercentage,
      formattedAmount: formatCurrency(depreciationAmount),
      formattedPercentage: formatPercentage(depreciationPercentage),
    };
  },
};

/**
 * Validation helpers for formatted values
 */
export const validationHelpers = {
  isValidCurrency: (value: string): boolean => {
    const numericValue = value.replace(/[^\d.-]/g, "");
    return !isNaN(parseFloat(numericValue));
  },

  isValidDate: (value: string): boolean => {
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  isValidPhone: (value: string): boolean => {
    const phoneRegex = /^(\+62|62|0)[0-9]{9,13}$/;
    return phoneRegex.test(value.replace(/\D/g, ""));
  },

  isValidNPWP: (value: string): boolean => {
    const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
    return npwpRegex.test(value);
  },
};

/**
 * Parse formatted values back to raw values
 */
export const parsers = {
  currency: (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/[^\d.-]/g, "");
    return parseFloat(numericValue) || 0;
  },

  percentage: (formattedValue: string): number => {
    const numericValue = formattedValue.replace(/[^\d.-]/g, "");
    return parseFloat(numericValue) || 0;
  },

  phone: (formattedValue: string): string => {
    return formattedValue.replace(/\D/g, "");
  },

  npwp: (formattedValue: string): string => {
    return formattedValue.replace(/\D/g, "");
  },
};

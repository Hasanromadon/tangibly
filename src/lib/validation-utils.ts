import { VALIDATION_LIMITS } from "@/constants";

/**
 * Frontend validation utilities to enforce length limits and prevent user input overflow
 * These utilities should be used in form components to provide real-time validation feedback
 */

// Type definitions for validation results
interface ValidationResult {
  isValid: boolean;
  error?: string;
  remainingChars?: number;
}

/**
 * Company field validation utilities
 */
export const validateCompanyName = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Company name is required" };
  }

  if (value.length < VALIDATION_LIMITS.COMPANY.NAME_MIN) {
    return {
      isValid: false,
      error: `Company name must be at least ${VALIDATION_LIMITS.COMPANY.NAME_MIN} characters`,
    };
  }

  if (value.length > VALIDATION_LIMITS.COMPANY.NAME_MAX) {
    return {
      isValid: false,
      error: `Company name must not exceed ${VALIDATION_LIMITS.COMPANY.NAME_MAX} characters`,
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.COMPANY.NAME_MAX - value.length,
  };
};

export const validateCompanyAddress = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Address is required" };
  }

  if (value.length < VALIDATION_LIMITS.COMPANY.ADDRESS_MIN) {
    return {
      isValid: false,
      error: `Address must be at least ${VALIDATION_LIMITS.COMPANY.ADDRESS_MIN} characters`,
    };
  }

  if (value.length > VALIDATION_LIMITS.COMPANY.ADDRESS_MAX) {
    return {
      isValid: false,
      error: `Address must not exceed ${VALIDATION_LIMITS.COMPANY.ADDRESS_MAX} characters`,
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.COMPANY.ADDRESS_MAX - value.length,
  };
};

export const validateCompanyPhone = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Phone number is required" };
  }

  if (value.length > VALIDATION_LIMITS.COMPANY.PHONE_MAX) {
    return {
      isValid: false,
      error: `Phone number must not exceed ${VALIDATION_LIMITS.COMPANY.PHONE_MAX} characters`,
    };
  }

  // Basic Indonesian phone validation
  const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
  if (!phoneRegex.test(value)) {
    return {
      isValid: false,
      error: "Please enter a valid Indonesian phone number",
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.COMPANY.PHONE_MAX - value.length,
  };
};

export const validateCompanyEmail = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Email is required" };
  }

  if (value.length > VALIDATION_LIMITS.COMPANY.EMAIL_MAX) {
    return {
      isValid: false,
      error: `Email must not exceed ${VALIDATION_LIMITS.COMPANY.EMAIL_MAX} characters`,
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.COMPANY.EMAIL_MAX - value.length,
  };
};

export const validateNPWP = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "NPWP is required" };
  }

  if (value.length > VALIDATION_LIMITS.COMPANY.NPWP_MAX) {
    return {
      isValid: false,
      error: `NPWP must not exceed ${VALIDATION_LIMITS.COMPANY.NPWP_MAX} characters`,
    };
  }

  // NPWP format validation
  const npwpRegex = /^\d{2}\.\d{3}\.\d{3}\.\d{1}-\d{3}\.\d{3}$/;
  if (!npwpRegex.test(value)) {
    return {
      isValid: false,
      error: "NPWP must be in format XX.XXX.XXX.X-XXX.XXX",
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.COMPANY.NPWP_MAX - value.length,
  };
};

/**
 * User field validation utilities
 */
export const validateFirstName = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "First name is required" };
  }

  if (value.length < VALIDATION_LIMITS.USER.FIRST_NAME_MIN) {
    return {
      isValid: false,
      error: `First name must be at least ${VALIDATION_LIMITS.USER.FIRST_NAME_MIN} characters`,
    };
  }

  if (value.length > VALIDATION_LIMITS.USER.FIRST_NAME_MAX) {
    return {
      isValid: false,
      error: `First name must not exceed ${VALIDATION_LIMITS.USER.FIRST_NAME_MAX} characters`,
    };
  }

  // Name format validation
  const nameRegex = /^[a-zA-Z.'-]+$/;
  if (!nameRegex.test(value)) {
    return {
      isValid: false,
      error:
        "First name can only contain letters, dots, apostrophes, and hyphens",
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.USER.FIRST_NAME_MAX - value.length,
  };
};

export const validateLastName = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Last name is required" };
  }

  if (value.length < VALIDATION_LIMITS.USER.LAST_NAME_MIN) {
    return {
      isValid: false,
      error: `Last name must be at least ${VALIDATION_LIMITS.USER.LAST_NAME_MIN} characters`,
    };
  }

  if (value.length > VALIDATION_LIMITS.USER.LAST_NAME_MAX) {
    return {
      isValid: false,
      error: `Last name must not exceed ${VALIDATION_LIMITS.USER.LAST_NAME_MAX} characters`,
    };
  }

  // Name format validation
  const nameRegex = /^[a-zA-Z.'-]+$/;
  if (!nameRegex.test(value)) {
    return {
      isValid: false,
      error:
        "Last name can only contain letters, dots, apostrophes, and hyphens",
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.USER.LAST_NAME_MAX - value.length,
  };
};

export const validateUserEmail = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Email is required" };
  }

  if (value.length > VALIDATION_LIMITS.USER.EMAIL_MAX) {
    return {
      isValid: false,
      error: `Email must not exceed ${VALIDATION_LIMITS.USER.EMAIL_MAX} characters`,
    };
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { isValid: false, error: "Invalid email format" };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.USER.EMAIL_MAX - value.length,
  };
};

export const validatePassword = (value: string): ValidationResult => {
  if (!value) {
    return { isValid: false, error: "Password is required" };
  }

  if (value.length < VALIDATION_LIMITS.USER.PASSWORD_MIN) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION_LIMITS.USER.PASSWORD_MIN} characters`,
    };
  }

  if (value.length > VALIDATION_LIMITS.USER.PASSWORD_MAX) {
    return {
      isValid: false,
      error: `Password must not exceed ${VALIDATION_LIMITS.USER.PASSWORD_MAX} characters`,
    };
  }

  // Strong password requirements
  const hasUppercase = /[A-Z]/.test(value);
  const hasLowercase = /[a-z]/.test(value);
  const hasNumber = /\d/.test(value);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

  if (!hasUppercase) {
    return {
      isValid: false,
      error: "Password must contain at least one uppercase letter",
    };
  }
  if (!hasLowercase) {
    return {
      isValid: false,
      error: "Password must contain at least one lowercase letter",
    };
  }
  if (!hasNumber) {
    return {
      isValid: false,
      error: "Password must contain at least one number",
    };
  }
  if (!hasSpecialChar) {
    return {
      isValid: false,
      error: "Password must contain at least one special character",
    };
  }

  return {
    isValid: true,
    remainingChars: VALIDATION_LIMITS.USER.PASSWORD_MAX - value.length,
  };
};

/**
 * Utility function to prevent input beyond max length
 * Use this in onChange handlers to restrict input length
 */
export const restrictInputLength = (
  value: string,
  maxLength: number
): string => {
  return value.slice(0, maxLength);
};

/**
 * Get character count display for input fields
 */
export const getCharacterCountDisplay = (
  current: number,
  max: number
): string => {
  const remaining = max - current;
  if (remaining < 10) {
    return `${remaining} characters remaining`;
  }
  return `${current}/${max}`;
};

/**
 * Export all validation limits for easy access
 */
export { VALIDATION_LIMITS };

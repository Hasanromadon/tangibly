import { validateEmail, validatePhone, validateNPWP } from "../auth";

describe("Auth Validation Utils", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user123@example123.com",
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it("should reject invalid email addresses", () => {
      const invalidEmails = [
        "invalid-email",
        "@example.com",
        "test@",
        "test..test@example.com",
        "",
        "test @example.com", // Space in email
        "test@example", // No TLD
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe("validatePhone", () => {
    it("should validate correct Indonesian phone numbers", () => {
      const validPhones = [
        "+62-812-3456-7890",
        "+628123456789",
        "08123456789",
        "+62-811-188-337", // Shorter format
        "0812-3456-7890",
      ];

      validPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(true);
      });
    });

    it("should reject invalid phone numbers", () => {
      const invalidPhones = [
        "+1-555-123-4567", // US number
        "123456789", // Too short
        "+62-123-456-789", // Wrong format
        "", // Empty
        "+62-712-3456-7890", // Wrong Indonesian prefix
      ];

      invalidPhones.forEach(phone => {
        expect(validatePhone(phone)).toBe(false);
      });
    });
  });

  describe("validateNPWP", () => {
    it("should validate correct NPWP format", () => {
      const validNPWPs = [
        "01.234.567.8-901.000",
        "99.999.999.9-999.999",
        "12.345.678.9-012.345",
      ];

      validNPWPs.forEach(npwp => {
        expect(validateNPWP(npwp)).toBe(true);
      });
    });

    it("should reject invalid NPWP format", () => {
      const invalidNPWPs = [
        "1.234.567.8-901.000", // Missing leading zero
        "01.234.567.8901.000", // Missing dash
        "01.234.567.8-901000", // Missing dot
        "01-234-567-8-901-000", // Wrong separators
        "", // Empty
        "01.234.567.8-901.0000", // Too many digits
      ];

      invalidNPWPs.forEach(npwp => {
        expect(validateNPWP(npwp)).toBe(false);
      });
    });
  });
});

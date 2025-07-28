import { dateUtils } from "../asset-types";

describe("Asset Date Utilities", () => {
  describe("isoToDateTimeLocal", () => {
    it("should convert ISO datetime to datetime-local format", () => {
      const isoDate = "2024-03-01T10:30:00.000Z";
      const result = dateUtils.isoToDateTimeLocal(isoDate);

      // The result depends on timezone, but should match the datetime-local format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
    });

    it("should return empty string for null/undefined input", () => {
      expect(dateUtils.isoToDateTimeLocal(null)).toBe("");
      expect(dateUtils.isoToDateTimeLocal(undefined)).toBe("");
      expect(dateUtils.isoToDateTimeLocal("")).toBe("");
    });

    it("should handle invalid date strings gracefully", () => {
      expect(dateUtils.isoToDateTimeLocal("invalid-date")).toBe("");
      expect(dateUtils.isoToDateTimeLocal("2024-13-45T25:70:00Z")).toBe("");
    });
  });

  describe("dateTimeLocalToISO", () => {
    it("should convert datetime-local format to ISO string", () => {
      const dateTimeLocal = "2024-03-01T10:30";
      const result = dateUtils.dateTimeLocalToISO(dateTimeLocal);

      expect(result).toBeDefined();
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it("should return undefined for empty input", () => {
      expect(dateUtils.dateTimeLocalToISO(null)).toBeUndefined();
      expect(dateUtils.dateTimeLocalToISO(undefined)).toBeUndefined();
      expect(dateUtils.dateTimeLocalToISO("")).toBeUndefined();
      expect(dateUtils.dateTimeLocalToISO("   ")).toBeUndefined();
    });

    it("should handle invalid datetime-local strings", () => {
      expect(dateUtils.dateTimeLocalToISO("invalid")).toBeUndefined();
      expect(dateUtils.dateTimeLocalToISO("2024-13-45T25:70")).toBeUndefined();
    });
  });

  describe("isValidDateTimeLocal", () => {
    it("should validate correct datetime-local format", () => {
      expect(dateUtils.isValidDateTimeLocal("2024-03-01T10:30")).toBe(true);
      expect(dateUtils.isValidDateTimeLocal("2023-12-31T23:59")).toBe(true);
      expect(dateUtils.isValidDateTimeLocal("2024-01-01T00:00")).toBe(true);
    });

    it("should reject invalid formats", () => {
      expect(dateUtils.isValidDateTimeLocal("")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("2024-03-01")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("10:30")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("2024-03-01T10:30:00")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("invalid-date")).toBe(false);
    });

    it("should reject invalid dates with correct format", () => {
      expect(dateUtils.isValidDateTimeLocal("2024-13-01T10:30")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("2024-03-32T10:30")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("2024-03-01T25:30")).toBe(false);
      expect(dateUtils.isValidDateTimeLocal("2024-03-01T10:60")).toBe(false);
    });
  });
});

import { transformFormToApiData } from "../asset-types";

describe("Asset Form Data Transformation", () => {
  describe("transformFormToApiData", () => {
    it("should transform form data with datetime-local dates to API format", () => {
      const formData = {
        name: "Toyota Avanza 2020",
        description: "Company vehicle for operational use",
        brand: "Toyota",
        model: "Avanza 1.3 G MT",
        serialNumber: "TOY24AVZ001",
        barcode: "2345678901234",
        status: "active",
        condition: "excellent",
        criticality: "medium",
        purchaseCost: "220000000",
        purchaseDate: "2024-03-01T00:00", // datetime-local format
        purchaseOrderNumber: "PO-2024-0003",
        invoiceNumber: "INV-TOY-0001",
        warrantyExpiresAt: "2027-03-01T00:00", // datetime-local format
        salvageValue: "33000000",
        usefulLifeYears: "8",
        depreciationMethod: "declining_balance",
        securityClassification: "public",
        energyRating: "Euro 4",
        carbonFootprint: "2.5",
        recyclable: true,
        notes: "Company operational vehicle",
      };

      const result = transformFormToApiData(formData);

      // Check that dates are converted to ISO format
      expect(result.purchaseDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
      expect(result.warrantyExpiresAt).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );

      // Check that other fields are correctly transformed
      expect(result.name).toBe("Toyota Avanza 2020");
      expect(result.purchaseCost).toBe(220000000);
      expect(result.salvageValue).toBe(33000000);
      expect(result.usefulLifeYears).toBe(8);
      expect(result.carbonFootprint).toBe(2.5);
      expect(result.recyclable).toBe(true);

      // Check that arrays are included
      expect(result.softwareLicenses).toEqual([]);
      expect(result.hazardousMaterials).toEqual([]);
    });

    it("should handle empty date fields", () => {
      const formData = {
        name: "Test Asset",
        purchaseDate: "",
        warrantyExpiresAt: "",
        status: "active",
        condition: "good",
        criticality: "medium",
        depreciationMethod: "straight_line",
        securityClassification: "public",
        recyclable: false,
      };

      const result = transformFormToApiData(formData);

      expect(result.purchaseDate).toBeUndefined();
      expect(result.warrantyExpiresAt).toBeUndefined();
      expect(result.name).toBe("Test Asset");
    });

    it("should handle invalid date fields gracefully", () => {
      const formData = {
        name: "Test Asset",
        purchaseDate: "invalid-date",
        warrantyExpiresAt: "2024-13-45T25:70",
        status: "active",
        condition: "good",
        criticality: "medium",
        depreciationMethod: "straight_line",
        securityClassification: "public",
        recyclable: false,
      };

      const result = transformFormToApiData(formData);

      expect(result.purchaseDate).toBeUndefined();
      expect(result.warrantyExpiresAt).toBeUndefined();
      expect(result.name).toBe("Test Asset");
    });
  });
});

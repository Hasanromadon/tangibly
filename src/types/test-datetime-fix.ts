// Quick test script to verify the datetime fix
import { transformFormToApiData } from "./asset-types";

// Test case that previously failed
const testFormData = {
  name: "Toyota Avanza 2020",
  purchaseDate: "2024-03-01T00:00", // datetime-local format that was failing
  warrantyExpiresAt: "2027-03-01T00:00", // datetime-local format that was failing
  status: "active",
  condition: "excellent",
  criticality: "medium",
  depreciationMethod: "declining_balance",
  securityClassification: "public",
  recyclable: true,
};

console.log("Testing datetime transformation...");
const result = transformFormToApiData(testFormData);

console.log("Input purchaseDate:", testFormData.purchaseDate);
console.log("Output purchaseDate:", result.purchaseDate);
console.log("Input warrantyExpiresAt:", testFormData.warrantyExpiresAt);
console.log("Output warrantyExpiresAt:", result.warrantyExpiresAt);

// Verify ISO format
const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
console.log(
  "PurchaseDate is valid ISO:",
  isoRegex.test(result.purchaseDate || "")
);
console.log(
  "WarrantyExpiresAt is valid ISO:",
  isoRegex.test(result.warrantyExpiresAt || "")
);

export { result };

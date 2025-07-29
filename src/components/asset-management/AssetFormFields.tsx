"use client";

import { UseFormReturn } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/forms/enhanced-date-picker";
import { EnhancedSelectField } from "@/components/forms/enhanced-select";
import {
  CheckboxField,
  NumberField,
  TextareaField,
  TextField,
} from "../forms/FormFields";

type AssetFormFieldsProps = {
  form: UseFormReturn<any>;
  t: (key: string) => string;
};

const SectionCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Card>
    <CardContent>
      <h3 className="mb-4 text-lg font-semibold">{title}</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </CardContent>
  </Card>
);

export function AssetFormFields({ form, t }: AssetFormFieldsProps) {
  return (
    <>
      {/* Basic Information */}
      <SectionCard title={t("basicInformation")}>
        <TextField
          control={form.control}
          name="name"
          label={t("fields.name")}
          placeholder={t("placeholders.enterAssetName")}
          required
        />

        <TextField
          control={form.control}
          name="brand"
          label={t("fields.brand")}
          placeholder={t("placeholders.enterBrandName")}
        />
        <TextField
          control={form.control}
          name="model"
          label={t("fields.model")}
          placeholder={t("placeholders.enterModel")}
        />
        <TextField
          control={form.control}
          name="serialNumber"
          label={t("fields.serialNumber")}
          placeholder={t("placeholders.enterSerialNumber")}
        />

        <TextField
          control={form.control}
          name="barcode"
          label={t("fields.barcode")}
          placeholder={t("placeholders.enterBarcode")}
        />

        <EnhancedSelectField
          control={form.control}
          name="status"
          label={t("fields.status")}
          placeholder={t("selectPlaceholders.selectStatus")}
          options={[
            { value: "active", label: t("status.active") },
            { value: "inactive", label: t("status.inactive") },
            { value: "maintenance", label: t("status.maintenance") },
            { value: "disposed", label: t("status.disposed") },
            { value: "stolen", label: t("status.stolen") },
            { value: "lost", label: t("status.lost") },
          ]}
          allowClear
        />

        <EnhancedSelectField
          control={form.control}
          name="condition"
          label={t("fields.condition")}
          placeholder={t("selectPlaceholders.selectCondition")}
          options={[
            { value: "excellent", label: t("conditions.excellent") },
            { value: "good", label: t("conditions.good") },
            { value: "fair", label: t("conditions.fair") },
            { value: "poor", label: t("conditions.poor") },
            { value: "damaged", label: t("conditions.damaged") },
          ]}
          allowClear
        />

        <EnhancedSelectField
          control={form.control}
          name="criticality"
          label={t("fields.criticality")}
          placeholder={t("selectPlaceholders.selectCriticality")}
          options={[
            { value: "critical", label: t("criticality.critical") },
            { value: "high", label: t("criticality.high") },
            { value: "medium", label: t("criticality.medium") },
            { value: "low", label: t("criticality.low") },
          ]}
          allowClear
        />
        <div className="col-span-2">
          <TextareaField
            control={form.control}
            name="description"
            label={t("fields.description")}
            placeholder={t("placeholders.enterDescription")}
          />
        </div>
      </SectionCard>
      {/* Financial Information */}
      <SectionCard title={t("financialInformation")}>
        <NumberField
          control={form.control}
          name="purchaseCost"
          label={t("fields.purchaseCost")}
          placeholder={t("placeholders.enterPurchaseCost")}
          type="number"
          step="0.01"
        />

        <DatePicker
          control={form.control}
          name="purchaseDate"
          label={t("fields.purchaseDate")}
          placeholder={t("selectPlaceholders.selectPurchaseDate")}
          allowClear
        />

        <TextField
          control={form.control}
          name="purchaseOrderNumber"
          label={t("fields.purchaseOrderNumber")}
          placeholder={t("placeholders.enterPurchaseOrderNumber")}
        />

        <TextField
          control={form.control}
          name="invoiceNumber"
          label={t("fields.invoiceNumber")}
          placeholder={t("placeholders.enterInvoiceNumber")}
        />

        <DatePicker
          control={form.control}
          name="warrantyExpiresAt"
          label={t("fields.warrantyExpires")}
          placeholder={t("selectPlaceholders.selectWarrantyExpires")}
          allowClear
        />

        <NumberField
          control={form.control}
          name="salvageValue"
          label={t("fields.salvageValue")}
          placeholder={t("placeholders.enterSalvageValue")}
          type="number"
          step="0.01"
        />
      </SectionCard>
      {/* Depreciation */}
      <SectionCard title={t("fields.depreciation")}>
        <EnhancedSelectField
          control={form.control}
          name="depreciationMethod"
          label={t("fields.depreciationMethod")}
          placeholder={t("selectPlaceholders.selectDepreciationMethod")}
          options={[
            {
              value: "straight_line",
              label: t("depreciationMethods.straight_line"),
            },
            {
              value: "declining_balance",
              label: t("depreciationMethods.declining_balance"),
            },
            {
              value: "units_of_production",
              label: t("depreciationMethods.units_of_production"),
            },
          ]}
          allowClear
        />

        <NumberField
          control={form.control}
          name="usefulLifeYears"
          label={t("fields.usefulLifeYears")}
          placeholder={t("placeholders.enterUsefulLifeYears")}
          type="number"
          step="1"
        />

        <NumberField
          control={form.control}
          name="salvageValue"
          label={t("fields.salvageValue")}
          placeholder={t("placeholders.enterSalvageValue")}
          type="number"
          step="0.01"
        />
        <NumberField
          control={form.control}
          name="bookValue"
          label={t("fields.bookValue")}
          placeholder="0.00"
          type="number"
        />
        <NumberField
          control={form.control}
          name="accumulatedDepreciation"
          label={t("fields.accumulatedDepreciation")}
          placeholder="0.00"
          type="number"
          step="0.01"
        />
      </SectionCard>
      {/* IT Asset Information */}
      <SectionCard title={t("itAssetInformation")}>
        <TextField
          control={form.control}
          name="ipAddress"
          label={t("fields.ipAddress")}
          placeholder="192.168.1.100"
        />

        <TextField
          control={form.control}
          name="macAddress"
          label={t("fields.macAddress")}
          placeholder="00:00:00:00:00:00"
        />

        <TextField
          control={form.control}
          name="operatingSystem"
          label={t("fields.operatingSystem")}
          placeholder="Windows 11, Ubuntu 22.04, etc."
        />

        <EnhancedSelectField
          control={form.control}
          name="securityClassification"
          label={t("fields.securityClassification")}
          placeholder={t("selectPlaceholders.selectSecurityClassification")}
          options={[
            { value: "public", label: t("fields.public") },
            { value: "internal", label: t("fields.internal") },
            { value: "confidential", label: t("fields.confidential") },
            { value: "restricted", label: t("fields.restricted") },
          ]}
          allowClear
        />
      </SectionCard>

      {/* Environmental Information */}
      <SectionCard title={t("environmentalInformation")}>
        <TextField
          control={form.control}
          name="energyRating"
          label={t("fields.energyRating")}
          placeholder="A+, B, C, etc."
        />

        <NumberField
          control={form.control}
          name="carbonFootprint"
          label={`${t("fields.carbonFootprint")} (kg CO2)`}
          placeholder="0"
          type="number"
          step="0.01"
        />

        <CheckboxField
          control={form.control}
          name="recyclable"
          label={t("fields.recyclable")}
        />
      </SectionCard>

      {/* Compliance & Audit */}
      <SectionCard title={t("fields.complianceAndAudit")}>
        <DatePicker
          control={form.control}
          name="lastAuditDate"
          label={t("fields.lastAuditDate")}
          placeholder={t("placeholders.enterLastAuditDate")}
          allowClear
        />

        <DatePicker
          control={form.control}
          name="nextAuditDate"
          label={t("fields.nextAuditDate")}
          placeholder={t("placeholders.enterNextAuditDate")}
          allowClear
        />

        <EnhancedSelectField
          control={form.control}
          name="complianceStatus"
          label="Compliance Status"
          placeholder="Select status"
          options={[
            { value: "compliant", label: "Compliant" },
            { value: "non-compliant", label: "Non-Compliant" },
            { value: "pending", label: "Pending" },
          ]}
          allowClear
        />
      </SectionCard>
      {/* Attachments */}
      <SectionCard title={t("fields.attachments")}>
        <TextareaField
          control={form.control}
          name="images"
          label={t("fields.imageUrls")}
          placeholder={t("placeholders.enterImageUrls")}
        />

        <TextareaField
          control={form.control}
          name="documents"
          label={t("fields.documentUrls")}
          placeholder={t("placeholders.enterDocumentUrls")}
        />
      </SectionCard>
      {/* Notes */}
      <SectionCard title={t("fields.notes")}>
        <div className="col-span-2">
          <TextareaField
            control={form.control}
            name="notes"
            label={t("fields.notes")}
            placeholder={t("placeholders.enterAnyAdditionalNotes")}
          />
        </div>
      </SectionCard>
    </>
  );
}

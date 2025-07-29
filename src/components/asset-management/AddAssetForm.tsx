"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useCreateAssetWithValidation } from "@/hooks/useAssets";
import { assetFormSchema } from "@/schemas/assets-schemas";
import { transformFormToApiData } from "@/types/asset-types";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { useAssetTranslations } from "@/hooks/useTranslations";
import { toast } from "sonner";
import { EnhancedSelectField } from "@/components/forms/enhanced-select";
import { DatePicker } from "@/components/forms/enhanced-date-picker";

interface AddAssetFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetForm({
  open,
  onClose,
  onSuccess,
}: AddAssetFormProps) {
  const createAssetMutation = useCreateAssetWithValidation();

  // Initialize translations
  const t = useAssetTranslations();

  const form = useForm({
    resolver: zodResolver(assetFormSchema),
    defaultValues: {
      name: "",
      description: "",
      brand: "",
      model: "",
      serialNumber: "",
      barcode: "",
      status: "active",
      condition: "good",
      criticality: "medium",
      purchaseCost: "",
      purchaseDate: undefined,
      purchaseOrderNumber: "",
      invoiceNumber: "",
      warrantyExpiresAt: undefined,
      salvageValue: "0",
      depreciationMethod: "straight_line",
      usefulLifeYears: "",
      ipAddress: "",
      macAddress: "",
      operatingSystem: "",
      securityClassification: "public",
      energyRating: "",
      carbonFootprint: "",
      recyclable: false,
      notes: "",
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      const submitData = transformFormToApiData(
        data as Record<string, unknown>
      );

      console.log("Submitting asset data:", submitData);
      await createAssetMutation.createAssetAsync(submitData);

      // Show success message
      toast.success(t("createSuccess"));

      // Reset form and close dialog
      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating asset:", error);
      toast.error(error instanceof Error ? error.message : t("createError"));
    }
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("addNewAsset")}</DialogTitle>
          <DialogDescription>{t("createAssetRecord")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("basicInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.name")} *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterAssetName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.brand")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterBrandName")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.model")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterModel")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.serialNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterSerialNumber")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.barcode")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterBarcode")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
              </div>

              <div className="mt-4">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t("placeholders.enterDescription")}
                          className="mt-2"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Financial Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("financialInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="purchaseCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.purchaseCost")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("placeholders.enterPurchaseCost")}
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DatePicker
                  control={form.control}
                  name="purchaseDate"
                  label={t("fields.purchaseDate")}
                  placeholder="Select purchase date"
                  allowClear
                />

                <FormField
                  control={form.control}
                  name="purchaseOrderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.purchaseOrderNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t(
                            "placeholders.enterPurchaseOrderNumber"
                          )}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.invoiceNumber")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t("placeholders.enterInvoiceNumber")}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DatePicker
                  control={form.control}
                  name="warrantyExpiresAt"
                  label={t("fields.warrantyExpires")}
                  placeholder="Select warranty expiry date"
                  allowClear
                />

                <FormField
                  control={form.control}
                  name="salvageValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.salvageValue")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder={t("placeholders.enterSalvageValue")}
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Depreciation */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">Depreciation</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <EnhancedSelectField
                  control={form.control}
                  name="depreciationMethod"
                  label={t("fields.depreciationMethod")}
                  placeholder="Select method"
                  options={[
                    { value: "straight_line", label: "Straight Line" },
                    { value: "declining_balance", label: "Declining Balance" },
                    {
                      value: "units_of_production",
                      label: "Units of Production",
                    },
                  ]}
                  allowClear
                />

                <FormField
                  control={form.control}
                  name="usefulLifeYears"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.usefulLifeYears")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          min="1"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* IT Asset Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("itAssetInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="ipAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.ipAddress")}</FormLabel>
                      <FormControl>
                        <Input placeholder="192.168.1.100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="macAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.macAddress")}</FormLabel>
                      <FormControl>
                        <Input placeholder="00:00:00:00:00:00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="operatingSystem"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.operatingSystem")}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Windows 11, Ubuntu 22.04, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <EnhancedSelectField
                  control={form.control}
                  name="securityClassification"
                  label={t("fields.securityClassification")}
                  placeholder="Select classification"
                  options={[
                    { value: "public", label: t("fields.public") },
                    { value: "internal", label: t("fields.internal") },
                    { value: "confidential", label: t("fields.confidential") },
                    { value: "restricted", label: t("fields.restricted") },
                  ]}
                  allowClear
                />
              </div>
            </Card>

            {/* Environmental Information */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("environmentalInformation")}
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="energyRating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("fields.energyRating")}</FormLabel>
                      <FormControl>
                        <Input placeholder="A+, B, C, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="carbonFootprint"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("fields.carbonFootprint")} (kg CO2)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          step="0.01"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recyclable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{t("fields.recyclable")}</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            {/* Notes */}
            <Card className="p-4">
              <h3 className="mb-4 text-lg font-semibold">
                {t("fields.additionalNotes")}
              </h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder={t("placeholders.enterAnyAdditionalNotes")}
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={createAssetMutation.isPending}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" disabled={createAssetMutation.isPending}>
                {createAssetMutation.isPending ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    {t("creating")}
                  </>
                ) : (
                  t("create")
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
